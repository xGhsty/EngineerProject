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
    public class ParkingSpotRepository : IParkingSpotRepository
    {
        private readonly ParkRentDbContext _context;

        public ParkingSpotRepository(ParkRentDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ParkingSpot>> GetAllAsync()
        {
            return await _context.ParkingSpots
                .Include(p => p.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<ParkingSpot>> GetAvailableAsync()
        {
            return await _context.ParkingSpots
                .Where(p => p.IsAvailable)
                .ToListAsync();
        }

        public async Task<IEnumerable<ParkingSpot>> GetByDistrictIdAsync(Guid districtId)
        {
            return await _context.ParkingSpots
                .Include (p => p.DistrictId ==  districtId)
                .ToListAsync();
        }

        public async Task<ParkingSpot?> GetByIdAsync(Guid id)
        {
            return await _context.ParkingSpots
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task UpdateAsync(ParkingSpot parkingSpot)
        {
            _context.ParkingSpots.Update(parkingSpot);
            await _context.SaveChangesAsync();
        }

        //public Task UpdateAsync(ParkingSpot parkingSpot)
        //{
        //    throw new NotImplementedException();
        //}

        //public Task AddAsync(ParkingSpot parkingSpot)
        //{
        //    throw new NotImplementedException();
        //}

        //public Task DeleteAsync(ParkingSpot parkingSpot)
        //{
        //    throw new NotImplementedException();
        //}

    }
}
