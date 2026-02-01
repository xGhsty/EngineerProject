using Microsoft.EntityFrameworkCore;
using ParkRent.Logic;
using ParkRent.Storage.Entities;
using ParkRent.Storage.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Storage.Repository
{
    public class DistrictRepository : IDistrictRepository
    {
        private readonly ParkRentDbContext _context;

        public DistrictRepository(ParkRentDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(District district)
        {
            await _context.Districts.AddAsync(district);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<District>> GetAllAsync()
        {
            return await _context.Districts.ToListAsync();
        }

        public async Task<District?> GetByIdAsync(Guid id)
        {
            return await _context.Districts.FindAsync(id);
        }

        public async Task UpdateAsync(District district)
        {
            _context.Districts.Update(district);
            await _context.SaveChangesAsync();
        }
    }
}
