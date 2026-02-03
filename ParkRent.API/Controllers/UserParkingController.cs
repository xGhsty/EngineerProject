using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkRent.Logic.Repository;
using System.Security.Claims;

namespace ParkRent.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserParkingController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly IParkingSpotRepository _parkingSpotRepository;

        public UserParkingController(IUserRepository userRepository, IReservationRepository reservationRepository, IParkingSpotRepository parkingSpotRepository)
        {
            _parkingSpotRepository = parkingSpotRepository;
            _userRepository = userRepository;
            _reservationRepository = reservationRepository;
        }

        [HttpGet("my-parking-spots")]
        public async Task<IActionResult> GetMyParkingSpots()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
                var mySpots = await _parkingSpotRepository.GetByOwnerIdAsync(userId);

                return Ok(mySpots.Select(mp => new
                {
                    id = mp.Id,
                    name = mp.Name,
                    isAvailable = mp.IsAvailable,
                    districtName = mp.District?.Name,
                    currentReservation = mp.Reservations?
                        .Where(r => r.ReservationStartTime <= DateTime.UtcNow && r.ReservationEndTime > DateTime.UtcNow)
                        .OrderBy(r => r.ReservationStartTime)
                        .Select(r => new
                        {
                            id = r.Id,
                            userName = r.User != null ? $"{r.User.Name} {r.User.Surname}" : "Nieznany",
                            startTime = r.ReservationStartTime,
                            endTime = r.ReservationEndTime,
                        })
                        .FirstOrDefault(),
                    incomingReservation = mp.Reservations?
                        .Where(r => r.ReservationStartTime > DateTime.UtcNow)
                        .OrderBy(r => r.ReservationEndTime)
                        .Select(r => new
                        {
                            id = r.Id,
                            username = r.User != null ? $"{r.User.Name} {r.User.Surname}" : "Nieznany",
                            startTime = r.ReservationStartTime,
                            endTime = r.ReservationEndTime,
                        })
                        .ToList()
                }));

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
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                var reservations = await _reservationRepository.GetByUserIdAsync(userId);

                return Ok(reservations
                    .OrderByDescending(r => r.ReservationStartTime)
                    .Select(r => new
                    {
                        id = r.Id,
                        parkingSpotName = r.ParkingSpot?.Name,
                        districtName = r.ParkingSpot.District,
                        startTime = r.ReservationStartTime,
                        endTime = r.ReservationEndTime,
                        status = r.ReservationEndTime < DateTime.UtcNow ? "Zakończona"
                            : r.ReservationStartTime > DateTime.UtcNow ? "Nadchodząca"
                            : "Aktywna",
                        ableToCancel = r.ReservationEndTime > DateTime.UtcNow
                    }));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message =  ex.Message});
            }
        }

        [HttpPut("toggle-available-parkingspot/{parkingSpotId}")]
        public async Task<IActionResult> ToggleParkingSpot(Guid parkingSpotId)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                var parkingSpot = await _parkingSpotRepository.GetByIdAsync(parkingSpotId);

                if (parkingSpot == null)
                {
                    return NotFound(new { message = "Miejsce parkingowe nie istnieje" });
                }

                if(parkingSpot.UserId == userId)
                {
                    return Forbid();
                }

                var isActiveReservation = parkingSpot.Reservations?.Any(r =>
                    r.ReservationStartTime <= DateTime.UtcNow && r.ReservationEndTime > DateTime.UtcNow) ?? false;

                if (isActiveReservation && parkingSpot.IsAvailable)
                {
                    return BadRequest(new { message = "Nie można wycofać miejsca z aktywną rezerwacją" });
                }

                parkingSpot.IsAvailable = !parkingSpot.IsAvailable;

                await _parkingSpotRepository.UpdateAsync(parkingSpot);

                return Ok(new
                {
                    message = parkingSpot.IsAvailable
                        ? "Miejsce udostępnione"
                        : "Miejsce wycofane z rezerwacji",
                    isAvailable = parkingSpot.IsAvailable,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        [HttpDelete("{reservationId}")]
        public async Task<IActionResult> CancelReservation(Guid reservationId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var reservation = await _reservationRepository.GetByIdAsync(reservationId);

            if(reservation == null)
            {
                return NotFound(new { message = "Nie znaleziono rezerwacji" });
            }

            if(reservation.UserId != userId)
            {
                return Forbid();
            }

            if(reservation.ReservationEndTime < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Nie można anulować zakończonej rezerwacji" });
            }
            
            await _reservationRepository.DeleteAsync(reservation);

            return Ok(new { message = "Rezerwacja anulowana" });
        }
    }
}
