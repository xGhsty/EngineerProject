using ParkRent.Logic.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Logic.Repository
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(Guid id);
        Task<User> GetByEmailAsync(string email);
        Task<User> GetByUsernameAsync(string username);
        Task<IEnumerable<User>> GetAllAsync();
        Task<IEnumerable<User>> GetByDistrictIdAsync(Guid districtId);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User userId);
    }
}
