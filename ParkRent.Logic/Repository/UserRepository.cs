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
    public class UserRepository : IUserRepository
    {   

        private readonly ParkRentDbContext _context;

        public UserRepository(ParkRentDbContext context)
        {
            _context = context;
        }
        public async Task AddUser(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUser(User userId)
        {
            _context.Users.Remove(userId);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> GetByIdAsync(Guid id)
        {
            return await _context.FindAsync<User>(id);
        }

        public Task UpdateUser(User user)
        {
            _context.Users.Update(user);
            return _context.SaveChangesAsync();
        }
    }
}
