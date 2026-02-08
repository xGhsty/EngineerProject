using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkRent.Functionality.Dto;
using ParkRent.Logic.Entities;
using ParkRent.Logic.Repository;
using System.Security.Claims;

namespace ParkRent.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IParkingSpotRepository _parkingSpotRepository;

        public ReservationController(IReservationRepository reservationRepository, IParkingSpotRepository parkingSpotRepository)
        {
            _parkingSpotRepository = parkingSpotRepository;
            _reservationRepository = reservationRepository;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var parkingSpot = await _parkingSpotRepository.GetByIdAsync(request.ParkingSpotId);
                if (parkingSpot == null)
                {
                    return NotFound(new { message = "Miejsce parkingowe nie istnieje" });
                }

                if (!parkingSpot.IsAvailable)
                {
                    return BadRequest(new { message = "Miejsce parkingowe jest zajęte" });
                }

                if (request.StartTime >= request.EndTime)
                {
                    return BadRequest(new { message = "Data końcowa nie może być wcześniej niż data początkowa" });
                }

                // Sprawdzenie czy rezerwacja mieści się w godzinach dostępności
                if (parkingSpot.AvailableFrom.HasValue && parkingSpot.AvailableTo.HasValue)
                {
                    var startTimeOfDay = request.StartTime.TimeOfDay;
                    var endTimeOfDay = request.EndTime.TimeOfDay;

                    if (startTimeOfDay < parkingSpot.AvailableFrom.Value || startTimeOfDay >= parkingSpot.AvailableTo.Value)
                    {
                        return BadRequest(new {
                            message = $"Miejsce jest dostępne tylko w godzinach {parkingSpot.AvailableFrom:hh\\:mm} - {parkingSpot.AvailableTo:hh\\:mm}"
                        });
                    }

                    if (endTimeOfDay > parkingSpot.AvailableTo.Value || endTimeOfDay <= parkingSpot.AvailableFrom.Value)
                    {
                        return BadRequest(new {
                            message = $"Miejsce jest dostępne tylko w godzinach {parkingSpot.AvailableFrom:hh\\:mm} - {parkingSpot.AvailableTo:hh\\:mm}"
                        });
                    }
                }

                // Dodanie bufora 5 minut, żeby uwzględnić różnice w strefach czasowych
                var minimumStartTime = DateTime.UtcNow.AddMinutes(-5);
                if (request.StartTime < minimumStartTime)
                {
                    return BadRequest(new { message = "Data rezerwacji nie może być wsteczna" });
                }

                var existingReservation = await _reservationRepository.GetByParkingSpotIdAsync(request.ParkingSpotId);
                var hasConflict = existingReservation.Any(r =>
                    request.StartTime < r.ReservationStartTime &&
                    request.EndTime > r.ReservationStartTime
                    );

                if (hasConflict)
                {
                    return BadRequest(new { message = "Miejsce jest już zarezerwowane w wybranym czasie" });
                }

                var reservation = new Reservation
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.Parse(userId),
                    ParkingSpotId = request.ParkingSpotId,
                    ReservationStartTime = request.StartTime,
                    ReservationEndTime = request.EndTime,
                };

                await _reservationRepository.AddAsync(reservation);

                parkingSpot.IsAvailable = false;
                await _parkingSpotRepository.UpdateAsync(parkingSpot);

                return Ok(new
                {
                    message = "Rezerwacja utworzona pomyślnie",
                    reservationId = reservation.Id,
                    parkingSpotName = parkingSpot.Name,
                    StartTime = reservation.ReservationStartTime,
                    EndTime = reservation.ReservationEndTime,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Wystąpił błąd podczas tworzenia rezerwacji: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelReservation(Guid id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var reservation = await _reservationRepository.GetByIdAsync(id);
                if (reservation == null)
                {
                    return NotFound(new { message = "Rezerwacja nie istnieje" });
                }

                if (reservation.UserId != Guid.Parse(userId))
                {
                    return Forbid();
                }

                if (reservation.ReservationStartTime <= DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Nie można anulować rezerwacji która już się rozpoczeła" });
                }

                var parkingSpot = await _parkingSpotRepository.GetByIdAsync(reservation.ParkingSpotId);
                if (parkingSpot != null)
                {
                    parkingSpot.IsAvailable = true;
                    await _parkingSpotRepository.UpdateAsync(parkingSpot);
                }

                await _reservationRepository.DeleteAsync(reservation);

                return Ok(new { message = "Rezerwacja anulowana" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Wystąpił błąd podczas anulowania rezerwacji {ex.Message}" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReservation(Guid id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var reservation = await _reservationRepository.GetByIdAsync(id);
                if (reservation == null)
                {
                    return NotFound(new { message = "Brak rezerwacji" });
                }

                if (reservation.UserId != Guid.Parse(userId))
                {
                    return Forbid();
                }

                return Ok(new
                {
                    id = reservation.Id,
                    parkingSpotName = reservation.ParkingSpot?.Name,
                    startTime = reservation.ReservationStartTime,
                    endTime = reservation.ReservationEndTime,
                    isActive = reservation.ReservationEndTime >= DateTime.UtcNow,
                });

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
