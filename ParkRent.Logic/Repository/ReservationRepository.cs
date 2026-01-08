using Microsoft.EntityFrameworkCore;
using ParkRent.Logic;
using ParkRent.Logic.Entities;
using ParkRent.Logic.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Storage.Repository
{
    public class ReservationRepository : IReservationRepository
    {
        private readonly ParkRentDbContext _context;

        public ReservationRepository(ParkRentDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Reservation reservation)
        {
            await _context.Reservations.AddAsync(reservation);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Reservation reservationId)
        {
            _context.Reservations.Remove(reservationId);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Reservation>> GetActiveByUserIdAync(Guid userId)
        {
            var now = DateTime.UtcNow;
            return await _context.Reservations
                .Include(r => r.ParkingSpot)
                .Where(r => r.UserId == userId &&
                            r.ReservationStartTime <= now &&
                            r.ReservationEndTime >= now)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetAllAsync()
        {
            return await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.ParkingSpot)
                .ToListAsync();
        }

        public async Task<Reservation?> GetByIdAsync(Guid id)
        {
            return await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.ParkingSpot)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Reservation>> GetByParkingSpotIdAsync(Guid parkingSpotId)
        {
            return await _context.Reservations
                .Include(r => r.User)
                .Where(r => r.ParkingSpotId == parkingSpotId)
                .OrderByDescending(r => r.ReservationStartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Reservations
                .Include(r => r.ParkingSpot)
                .Where(r => r.UserId == userId &&
                            r.ReservationStartTime <= DateTime.Now &&
                            r.ReservationEndTime <= DateTime.Now)
                .ToListAsync();
        }

        public async Task UpdateAsync(Reservation reservation)
        {
            _context.Reservations.Update(reservation);
            await _context.SaveChangesAsync();
        }
    }
}
