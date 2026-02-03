using BCrypt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using ParkRent.Common.Storage.Enums;
using ParkRent.Functionality.Dto;
using ParkRent.Logic.Entities;
using ParkRent.Logic.Repository;
using ParkRent.Storage.Entities;
using ParkRent.Storage.Interfaces;
using ParkRent.Storage.Repository;
using System.Security.Claims;

namespace ParkRent.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin, SuperAdmin")]
    public class DistrictAdminController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IDistrictRepository _districtRepository;
        private readonly IParkingSpotRepository _parkingSpotRepostory;

        public DistrictAdminController(IUserRepository userRepository, IDistrictRepository districtRepository, IParkingSpotRepository parkingSpotRepository)
        {
            _districtRepository = districtRepository;
            _userRepository = userRepository;
            _parkingSpotRepostory = parkingSpotRepository;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var users = currentUser.Role == Common.Storage.Enums.UserRole.SuperAdmin
                    ? await _userRepository.GetAllAsync()
                    : await _userRepository.GetByDistrictIdAsync(currentUser.DistrictId.Value);

                return Ok(users.Select(u => new
                {
                    id = u.Id,
                    name = u.Name,
                    surname = u.Surname,
                    username = u.Username,
                    email = u.Email,
                    districtId = u.DistrictId,
                    districtName = u.District?.Name,
                    role = u.Role.ToString()
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }

        }

        [HttpPut("assign-district/{userId}")]
        public async Task<IActionResult> AssignUserToDistrict(Guid userId, [FromBody] AssignDisctrictRequest request)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var targetUser = await _userRepository.GetByIdAsync(userId);
                if ( targetUser == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                if (currentUser.Role == UserRole.Admin && request.DistrictId != currentUser.DistrictId)
                {
                    return Forbid();
                }

                var district = await _districtRepository.GetByIdAsync(request.DistrictId);
                if ( district == null)
                {
                    return NotFound(new { message = "Dzielnica nie istnieje" });
                }

                targetUser.DistrictId = request.DistrictId;
                await _userRepository.UpdateAsync(targetUser);

                return Ok(new { message = $"Użytkownik przypisany do dzielnicy {district.Name}" });
                
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("change-role/{userId}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> ChangeUserRole(Guid userId, [FromBody] ChangeRoleRequest request)
        {
            try
            {
                var targetUser = await _userRepository.GetByIdAsync(userId);
                if ( targetUser == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                targetUser.Role = request.Role;
                await _userRepository.UpdateAsync(targetUser);

                return Ok(new { message = $"Rola zmieniona na {request.Role}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        [HttpPut("create-admin")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            try
            {
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Użytkownik istnieje pod podanym adresie email" });
                }

                var existingUsername = await _userRepository.GetByUsernameAsync(request.Username);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Użytkownik o tej nazwie użytkownika już istnieje" });
                }

                if (request.Password != request.ConfirmPassword)
                {
                    return BadRequest(new { message = "Hasła różnią się od siebie" });
                }

                var district = await _districtRepository.GetByIdAsync(request.DistrictId);
                if (district == null)
                {
                    return NotFound(new { message = "Dzielnica nie istnieje" });
                }

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var newAdmin = new User
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Surname = request.Surname,
                    Username = request.Username,
                    Email = request.Email,
                    Password = hashedPassword,
                    DistrictId = request.DistrictId,
                    Role = UserRole.Admin
                };

                await _userRepository.AddAsync(newAdmin);

                return Ok(new
                {
                    admin = new
                    {
                        id = newAdmin.Id,
                        username = newAdmin.Username,
                        email = newAdmin.Email,
                        districtName = newAdmin.District,
                        role = newAdmin.Role.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        [HttpGet("parking-spots")]
        public async Task<IActionResult> GetAllParkingSpots()
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if(currentUser == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                var parkingSpots = currentUser.Role == UserRole.SuperAdmin ?
                    await _parkingSpotRepostory.GetAllAsync() : await _parkingSpotRepostory.GetByDistrictIdAsync(currentUser.DistrictId.Value);

                return Ok(parkingSpots.Select(ps => new
                {
                    id = ps.Id,
                    name = ps.Name,
                    districtId = ps.DistrictId,
                    districtName = ps.District?.Name,
                    ownerId = ps.UserId,
                    ownerName = ps.User != null ? $"{ps.User.Name} {ps.User.Surname}" : "Brak właściciela",
                    isAvailable = ps.IsAvailable,
                }));

            }
            catch (Exception ex)
            {
                return BadRequest(new { message =  ex.Message});
            }
        }

        [HttpPost("parking-spots")]
        public async Task<IActionResult> CreateParkingSpot([FromBody] CreateParkingSpotRequest request)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                if (currentUser.Role == UserRole.Admin && request.DistrictId != currentUser.DistrictId)
                {
                    return Forbid();
                }

                var district = await _districtRepository.GetByIdAsync(request.DistrictId);
                if (district == null)
                {
                    return NotFound(new { message = "Dzielnica nie istnieje" });
                }

                if (request.OwnerId.HasValue)
                {
                    var owner = await _userRepository.GetByIdAsync(request.OwnerId.Value);
                    if (owner == null)
                    {
                        return NotFound(new { message = "Właściciel nie istnieje" });
                    }

                    if(owner.DistrictId != request.DistrictId)
                    {
                        return BadRequest(new { message = "Właściciel musi być w tej samej dzielnicy co miejsce parkingowe" });
                    }
                }

                var parkingSpot = new ParkingSpot
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    DistrictId = request.DistrictId,
                    UserId = request.OwnerId,
                    IsAvailable = request.IsAvailable,
                };

                await _parkingSpotRepostory.AddAsync(parkingSpot);

                return Ok(new
                {
                    parkingSpot = new
                    {
                        id = parkingSpot.Id,
                        name = parkingSpot.Name,
                        districtName = parkingSpot.District.Name,
                        isAvailable = parkingSpot.IsAvailable,
                        ownerId = parkingSpot.UserId
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        [HttpPut("assign-parking")]
        public async Task<IActionResult> AssignParkingToUser([FromBody]AssignParkingRequest request)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null)
                {
                    return NotFound(new { mesasge = "Użytkownik nie istnieje" });
                }

                var user = await _userRepository.GetByIdAsync(request.UserId);
                if (user == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                var parkingSpot = await _parkingSpotRepostory.GetByIdAsync(request.ParkingSpotId);
                if (parkingSpot == null)
                {
                    return NotFound(new { message = "Miejsce parkingowe nie istnieje" });
                }

                if (currentUser.Role == UserRole.Admin && parkingSpot.DistrictId != currentUser.DistrictId)
                {
                    return Forbid();
                }

                if (parkingSpot.DistrictId != user.DistrictId)
                {
                    return BadRequest(new { message = "Parking i użytkownik muszą należeć do tej samej dzielnicy" });
                }

                parkingSpot.UserId = request.UserId;
                parkingSpot.IsAvailable = false;
                await _parkingSpotRepostory.UpdateAsync(parkingSpot);

                return Ok(new { message = $"Parking {parkingSpot.Name} został przypisany do {user.Username}"});

            }
            catch (Exception ex)
            {
                return BadRequest(new { message =ex.Message});
            }
        }

        [HttpDelete("parking-spots/{parkingSpotId}")]
        public async Task<IActionResult> DeleteParkingSpot(Guid parkingSpotId)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null)
                    return NotFound(new { message = "Użytkownik nie istnieje" });

                var parkingSpot = await _parkingSpotRepostory.GetByIdAsync(parkingSpotId);
                if (parkingSpot == null)
                    return NotFound(new { message = "Miejsce parkingowe nie istnieje" });

                if (currentUser.Role == UserRole.Admin && parkingSpot.DistrictId != currentUser.DistrictId)
                {
                    return Forbid();
                }

                var hasActiveReservations = parkingSpot.Reservations?.Any(r => r.ReservationEndTime > DateTime.UtcNow) ?? false;
                if (hasActiveReservations)
                {
                    return BadRequest(new { message = "Nie można usunąć miejsca z aktywnymi rezerwacjami" });
                }

                await _parkingSpotRepostory.DeleteAsync(parkingSpot);

                return Ok(new { message = $"Miejsce {parkingSpot.Name} zostało usunięte" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("districts")]
        public async Task<IActionResult> GetDistricts()
        {
            try
            {
                var districts = await _districtRepository.GetAllAsync();

                return Ok(districts.Select(d => new
                {
                    id = d.Id,
                    name = d.Name
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("districts")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> CreateDistrict([FromBody] CreateDistrictRequest request)
        {
            try
            {
                var district = new District
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name
                };

                await _districtRepository.AddAsync(district);

                return Ok(new
                {
                    message = $"Dzielnica {district.Name} utworzona",
                    district = new
                    {
                        id = district.Id,
                        name = district.Name
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
