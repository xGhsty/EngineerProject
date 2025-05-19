using ParkRent.Logic.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Logic.Repository
{
    public interface IReservationRepository
    {
        Task<Reservation> GetByIdAsync(Guid id);
        Task<IEnumerable<Reservation>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Reservation>> GetByParkingSpotIdAsync(Guid parkingSpotId);
        Task AddReservation(Reservation reservation);
        Task UpdateReservation(Reservation reservation);
        Task DeleteReservation(Guid reservationId);
    }
}
