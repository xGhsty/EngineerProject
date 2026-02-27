using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkRent.Common.Storage.Enums;
using ParkRent.Functionality.Dto;
using ParkRent.Logic.Entities;
using ParkRent.Logic.Repository;
using ParkRent.Storage.Interfaces;
using System.Security.Claims;

namespace ParkRent.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DistrictAdminController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IDistrictRepository _districtRepository;
        private readonly IParkingSpotRepository _parkingSpotRepository;
        private readonly IReservationRepository _reservationRepository;

        public DistrictAdminController(IUserRepository userRepository, IDistrictRepository districtRepository, IParkingSpotRepository parkingSpotRepository, IReservationRepository reservationRepository)
        {
            _userRepository = userRepository;
            _districtRepository = districtRepository;
            _parkingSpotRepository = parkingSpotRepository;
            _reservationRepository = reservationRepository;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null || currentUser.DistrictId == null)
                {
                    return NotFound(new { message = "Administrator nie jest przypisany do dzielnicy" });
                }

                var users = await _userRepository.GetAllAsync();

                // Tylko zwykli użytkownicy bez przypisania LUB z przypisaniem do własnej dzielnicy admina
                return Ok(users
                    .Where(u => u.Role == UserRole.User &&
                                (u.DistrictId == null || u.DistrictId == currentUser.DistrictId))
                    .Select(u => new
                    {
                        id = u.Id,
                        name = u.Name,
                        surname = u.Surname,
                        username = u.Username,
                        email = u.Email,
                        districtId = u.DistrictId,
                        districtName = u.District?.Name,
                        role = u.Role.ToString(),
                        createdAt = DateTime.SpecifyKind(u.CreatedAt, DateTimeKind.Utc)
                    }));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("assign-district/{userId}")]
        public async Task<IActionResult> AssignUserToMyDistrict(Guid userId, [FromBody] AssignDistrictRequest request)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null || currentUser.DistrictId == null)
                {
                    return NotFound(new { message = "Administrator nie jest przypisany do dzielnicy" });
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                // Usunięcie użytkownika z dzielnicy (Guid.Empty) — dozwolone jeśli użytkownik jest w dzielnicy admina
                if (request.DistrictId == Guid.Empty)
                {
                    if (user.DistrictId != currentUser.DistrictId)
                    {
                        return Forbid();
                    }

                    var userSpots = await _parkingSpotRepository.GetByOwnerIdAsync(user.Id);
                    foreach (var spot in userSpots)
                    {
                        spot.UserId = null;
                        spot.IsAvailable = true;
                        spot.AvailableFrom = null;
                        spot.AvailableTo = null;
                        await _parkingSpotRepository.UpdateAsync(spot);
                    }

                    user.DistrictId = null;
                    await _userRepository.UpdateAsync(user);

                    return Ok(new
                    {
                        message = $"Usunięto przypisanie dzielnicy dla użytkownika {user.Username}",
                        user = new { id = user.Id, username = user.Username, districtName = (string?)null }
                    });
                }

                // Przypisanie do własnej dzielnicy
                if (request.DistrictId != currentUser.DistrictId)
                {
                    return Forbid();
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

        [HttpGet("parking-spots")]
        public async Task<IActionResult> GetParkingSpotsFromMyDistrict()
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null || currentUser.DistrictId == null)
                {
                    return NotFound(new { message = "Administrator nie jest przypisany do dzielnicy" });
                }

                var parkingSpots = await _parkingSpotRepository.GetByDistrictIdAsync(currentUser.DistrictId.Value);

                return Ok(parkingSpots.Select(ps => new
                {
                    id = ps.Id,
                    name = ps.Name,
                    districtId = ps.DistrictId,
                    districtName = ps.District?.Name,
                    ownerId = ps.UserId,
                    ownerName = ps.User != null ? $"{ps.User.Name} {ps.User.Surname}" : null,
                    isAvailable = ps.IsAvailable,
                    availableFrom = ps.AvailableFrom?.ToString(@"hh\:mm"),
                    availableTo = ps.AvailableTo?.ToString(@"hh\:mm")
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
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null || currentUser.DistrictId == null)
                {
                    return NotFound(new { message = "Administrator nie jest przypisany do dzielnicy" });
                }

                if (request.DistrictId != currentUser.DistrictId)
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
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null || currentUser.DistrictId == null)
                {
                    return NotFound(new { message = "Administrator nie jest przypisany do dzielnicy" });
                }

                var parkingSpot = await _parkingSpotRepository.GetByIdAsync(parkingSpotId);
                if (parkingSpot == null)
                {
                    return NotFound(new { message = "Miejsce parkingowe nie istnieje" });
                }

                if (parkingSpot.DistrictId != currentUser.DistrictId)
                {
                    return Forbid();
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

        [HttpGet("reservation-history")]
        public async Task<IActionResult> GetReservationHistory()
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null || currentUser.DistrictId == null)
                {
                    return NotFound(new { message = "Administrator nie jest przypisany do dzielnicy" });
                }

                var reservations = await _reservationRepository.GetByDistrictAsync(currentUser.DistrictId.Value);
                var now = DateTime.UtcNow;

                return Ok(reservations.Select(r => new
                {
                    id = r.Id,
                    userName = $"{r.User?.Name} {r.User?.Surname} (@{r.User?.Username})",
                    parkingSpotName = r.ParkingSpot?.Name,
                    districtName = r.ParkingSpot?.District?.Name,
                    startTime = DateTime.SpecifyKind(r.ReservationStartTime, DateTimeKind.Utc),
                    endTime = DateTime.SpecifyKind(r.ReservationEndTime, DateTimeKind.Utc),
                    status = r.IsCancelled ? "Anulowana"
                        : r.ReservationEndTime < now ? "Zakończona"
                        : r.ReservationStartTime <= now ? "Aktywna"
                        : "Nadchodząca"
                }));
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
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null || currentUser.DistrictId == null)
                {
                    return NotFound(new { message = "Administrator nie jest przypisany do dzielnicy" });
                }

                var parkingSpot = await _parkingSpotRepository.GetByIdAsync(request.ParkingSpotId);
                if (parkingSpot == null)
                {
                    return NotFound(new { message = "Miejsce parkingowe nie istnieje" });
                }

                // DistrictAdmin może przypisać tylko parkingi ze swojej dzielnicy
                if (parkingSpot.DistrictId != currentUser.DistrictId)
                {
                    return Forbid();
                }

                // Jeśli UserId jest puste (Guid.Empty), usuń przypisanie
                if (request.UserId == Guid.Empty)
                {
                    parkingSpot.UserId = null;
                    parkingSpot.IsAvailable = true;
                    parkingSpot.AvailableFrom = null;
                    parkingSpot.AvailableTo = null;
                    await _parkingSpotRepository.UpdateAsync(parkingSpot);

                    return Ok(new { message = $"Usunięto przypisanie miejsca parkingowego {parkingSpot.Name}" });
                }

                var user = await _userRepository.GetByIdAsync(request.UserId);
                if (user == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                if (user.DistrictId == null)
                {
                    return BadRequest(new { message = $"Użytkownik {user.Username} nie jest przypisany do żadnej dzielnicy" });
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