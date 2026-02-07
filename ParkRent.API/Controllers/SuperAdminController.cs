using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkRent.Common.Storage.Enums;
using ParkRent.Functionality.Dto;
using ParkRent.Logic.Entities;
using ParkRent.Logic.Repository;
using ParkRent.Storage.Entities;
using ParkRent.Storage.Interfaces;
using System.Security.Claims;

namespace ParkRent.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "SuperAdmin")]
    public class SuperAdminController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IDistrictRepository _districtRepository;
        private readonly IParkingSpotRepository _parkingSpotRepository;

        public SuperAdminController(IUserRepository userRepository, IDistrictRepository districtRepository, IParkingSpotRepository parkingSpotRepository)
        {
            _userRepository = userRepository;
            _districtRepository = districtRepository;
            _parkingSpotRepository = parkingSpotRepository;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userRepository.GetAllAsync();

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

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateDistrictAdmin([FromBody] CreateAdminRequest request)
        {
            try
            {
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Użytkownik z tym adresem email już istnieje" });
                }

                var existingUsername = await _userRepository.GetByUsernameAsync(request.Username);
                if (existingUsername != null)
                {
                    return BadRequest(new { message = "Nazwa użytkownika jest już zajęta" });
                }

                if (request.Password != request.ConfirmPassword)
                {
                    return BadRequest(new { message = "Hasła nie są zgodne" });
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
                    message = $"Admin dzielnicy {district.Name} utworzony",
                    admin = new
                    {
                        id = newAdmin.Id,
                        username = newAdmin.Username,
                        email = newAdmin.Email,
                        districtName = district.Name,
                        role = newAdmin.Role.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("change-role/{userId}")]
        public async Task<IActionResult> ChangeUserRole(Guid userId, [FromBody] ChangeRoleRequest request)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                user.Role = request.Role;
                await _userRepository.UpdateAsync(user);

                return Ok(new
                {
                    message = $"Rola użytkownika {user.Username} zmieniona na {user.Role}",
                    user = new
                    {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email,
                        role = user.Role.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("districts")]
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

        [HttpGet("parking-spots")]
        public async Task<IActionResult> GetAllParkingSpots()
        {
            try
            {
                var parkingSpots = await _parkingSpotRepository.GetAllAsync();

                return Ok(parkingSpots.Select(ps => new
                {
                    id = ps.Id,
                    name = ps.Name,
                    districtId = ps.DistrictId,
                    districtName = ps.District?.Name,
                    ownerId = ps.UserId,
                    ownerName = ps.User != null ? $"{ps.User.Name} {ps.User.Surname}" : null,
                    isAvailable = ps.IsAvailable
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("parking-spots")]
        public async Task<IActionResult> CreateParkingSpot([FromBody] CreateParkingSpotRequest request)
        {
            try
            {
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

                    if (owner.DistrictId != request.DistrictId)
                    {
                        return BadRequest(new { message = "Właściciel musi być z tej samej dzielnicy co parking" });
                    }
                }

                var parkingSpot = new ParkingSpot
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    DistrictId = request.DistrictId,
                    UserId = request.OwnerId,
                    IsAvailable = request.IsAvailable
                };

                await _parkingSpotRepository.AddAsync(parkingSpot);

                return Ok(new
                {
                    message = $"Parking {parkingSpot.Name} utworzony w dzielnicy {district.Name}",
                    parkingSpot = new
                    {
                        id = parkingSpot.Id,
                        name = parkingSpot.Name,
                        districtName = district.Name,
                        isAvailable = parkingSpot.IsAvailable
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("parking-spots/{parkingSpotId}")]
        public async Task<IActionResult> DeleteParkingSpot(Guid parkingSpotId)
        {
            try
            {
                var parkingSpot = await _parkingSpotRepository.GetByIdAsync(parkingSpotId);
                if (parkingSpot == null)
                {
                    return NotFound(new { message = "Miejsce parkingowe nie istnieje" });
                }

                var hasActiveReservations = parkingSpot.Reservations?.Any(r =>
                    r.ReservationStartTime <= DateTime.UtcNow &&
                    r.ReservationEndTime > DateTime.UtcNow) ?? false;

                if (hasActiveReservations)
                {
                    return BadRequest(new { message = "Nie można usunąć parkingu z aktywnymi rezerwacjami" });
                }

                await _parkingSpotRepository.DeleteAsync(parkingSpot);

                return Ok(new { message = $"Parking {parkingSpot.Name} usunięty" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("assign-district/{userId}")]
        public async Task<IActionResult> AssignUserToDistrict(Guid userId, [FromBody] AssignDistrictRequest request)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                var district = await _districtRepository.GetByIdAsync(request.DistrictId);
                if (district == null)
                {
                    return NotFound(new { message = "Dzielnica nie istnieje" });
                }

                user.DistrictId = request.DistrictId;
                await _userRepository.UpdateAsync(user);

                return Ok(new
                {
                    message = $"Użytkownik {user.Username} przypisany do dzielnicy {district.Name}",
                    user = new
                    {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email,
                        districtName = district.Name
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("assign-parking")]
        public async Task<IActionResult> AssignParkingToUser([FromBody] AssignParkingRequest request)
        {
            try
            {
                var parkingSpot = await _parkingSpotRepository.GetByIdAsync(request.ParkingSpotId);
                if (parkingSpot == null)
                {
                    return NotFound(new { message = "Miejsce parkingowe nie istnieje" });
                }

                var user = await _userRepository.GetByIdAsync(request.UserId);
                if (user == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                if (parkingSpot.DistrictId != user.DistrictId)
                {
                    return BadRequest(new { message = "Parking i użytkownik muszą być z tej samej dzielnicy" });
                }

                parkingSpot.UserId = request.UserId;
                parkingSpot.IsAvailable = false;
                await _parkingSpotRepository.UpdateAsync(parkingSpot);

                return Ok(new { message = $"Parking {parkingSpot.Name} przypisany do użytkownika {user.Username}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}