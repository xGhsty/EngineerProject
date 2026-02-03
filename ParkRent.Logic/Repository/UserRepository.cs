using Microsoft.EntityFrameworkCore;
using ParkRent.Logic;
using ParkRent.Logic.Entities;
using ParkRent.Logic.Repository;

namespace ParkRent.Storage.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly ParkRentDbContext _context;

        public UserRepository(ParkRentDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users
                .Include(u => u.District) // <- DODANE!
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(u => u.District) // <- DODANE!
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.District) // <- DODANE!
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.District)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetByDistrictIdAsync(Guid districtId)
        {
            return await _context.Users
                .Include(u => u.District)
                .Where(u => u.DistrictId == districtId)
                .ToListAsync();
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(User user)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}