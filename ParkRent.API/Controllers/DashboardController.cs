using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkRent.Logic.Entities;
using ParkRent.Logic.Repository;
using ParkRent.Storage.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IParkingSpotRepository _parkingSpotRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly IDistrictRepository _districtRepository;

        public DashboardController(IUserRepository userRepository, IParkingSpotRepository parkingSpotRepository, IReservationRepository reservationRepository, IDistrictRepository districtRepository)
        {
            _userRepository = userRepository;
            _parkingSpotRepository = parkingSpotRepository;
            _reservationRepository = reservationRepository;
            _districtRepository = districtRepository;
        }

        [HttpGet("user-info")]
        public async Task<IActionResult> GetUserInfo()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return NotFound(new { message = "Nie ma użytkownika o takiej nazwie" });
                }

                return Ok(new
                {
                    userId = user.Id,
                    username = user.Username,
                    name = user.Name,
                    surname = user.Surname,
                    email = user.Email,
                    fullName = $"{user.Name} {user.Surname}",
                    districtId = user.DistrictId?.ToString(),
                    districtName = user.District?.Name,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        [HttpGet("parking-spots")]
        public async Task<IActionResult> GetParkingSpots()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }


                if (user.DistrictId == null)
                {
                    return Ok(new
                    {
                        message = "Twoje konto nie jest przypisane do żadnej dzielnicy. Skontaktuj się z administratorem osiedla.",
                        parkingSpots = new List<object>()
                    });
                }

                var parkingSpots = (await _parkingSpotRepository.GetByDistrictIdAsync(user.DistrictId.Value)).ToList();

                var now = DateTime.UtcNow;
                return Ok(parkingSpots.Select(p => BuildParkingSpotDto(p, now)));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("available-spots")]
        public async Task<IActionResult> GetAvailableSpots()
        {
            try
            {
                var spots = await _parkingSpotRepository.GetAvailableAsync();

                var spotsDto = spots.Select(s => new
                {
                    id = s.Id,
                    name = s.Name,
                    isAvailable = s.IsAvailable,
                });

                return Ok(spotsDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        [HttpGet("my-reservations")]
        public async Task<IActionResult> GetMyReservations()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var reservations = await _reservationRepository.GetByUserIdAsync(Guid.Parse(userId));

                var reservationsDto = reservations
                    .OrderByDescending(r => r.ReservationStartTime)
                    .Select(r => new
                    {
                        id = r.Id,
                        parkingSpotName = r.ParkingSpot?.Name,
                        startTime = DateTime.SpecifyKind(r.ReservationStartTime, DateTimeKind.Utc),
                        endTime = DateTime.SpecifyKind(r.ReservationEndTime, DateTimeKind.Utc),
                        isActive = !r.IsCancelled && r.ReservationEndTime >= DateTime.UtcNow,
                        isCancelled = r.IsCancelled
                    });

                return Ok(reservationsDto);
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
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var reservations = await _reservationRepository.GetByUserIdAsync(Guid.Parse(userId));

                var reservationsDto = reservations.Select(r => new
                {
                    id = r.Id,
                    parkingSpotName = r.ParkingSpot?.Name,
                    startTime = r.ReservationStartTime,
                    endTime = r.ReservationEndTime,
                    duration = (r.ReservationEndTime - r.ReservationStartTime).TotalHours,
                }).OrderByDescending(r => r.startTime);

                return Ok(reservationsDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new {message  = ex.Message});
            }
        }

        [HttpGet("parking-spots-by-district/{districtId}")]
        public async Task<IActionResult> GetParkingSpotsByDistrict(Guid districtId)
        {
            try
            {
                var parkingSpots = (await _parkingSpotRepository.GetByDistrictIdAsync(districtId)).ToList();

                var now = DateTime.UtcNow;
                return Ok(parkingSpots.Select(p => BuildParkingSpotDto(p, now)));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private static object BuildParkingSpotDto(ParkingSpot p, DateTime now)
        {
            var currentReservation = p.Reservations?
                .Where(r => !r.IsCancelled && r.ReservationStartTime <= now && r.ReservationEndTime > now)
                .FirstOrDefault();

            var nextReservation = p.Reservations?
                .Where(r => !r.IsCancelled && r.ReservationStartTime > now)
                .OrderBy(r => r.ReservationStartTime)
                .FirstOrDefault();

            // Sprawdź czy aktualna godzina lokalna jest poza oknem dostępności
            // AvailableFrom/AvailableTo są ustawiane przez użytkownika w czasie lokalnym,
            // więc porównujemy z DateTime.Now (czas serwera/lokalny), nie UTC
            var nowLocalTime = DateTime.Now.TimeOfDay;
            var isOutsideHours = p.AvailableFrom.HasValue && p.AvailableTo.HasValue
                && (nowLocalTime < p.AvailableFrom.Value || nowLocalTime >= p.AvailableTo.Value);

            return new
            {
                id = p.Id,
                name = p.Name,
                isAvailable = p.IsAvailable && currentReservation == null && !isOutsideHours,
                isOutsideHours,
                reservedUntil = currentReservation != null
                    ? (DateTime?)DateTime.SpecifyKind(currentReservation.ReservationEndTime, DateTimeKind.Utc)
                    : null,
                nextReservationAt = nextReservation != null
                    ? (DateTime?)DateTime.SpecifyKind(nextReservation.ReservationStartTime, DateTimeKind.Utc)
                    : null,
                availableFrom = p.AvailableFrom?.ToString(@"hh\:mm"),
                availableTo = p.AvailableTo?.ToString(@"hh\:mm"),
            };
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
    }
}
