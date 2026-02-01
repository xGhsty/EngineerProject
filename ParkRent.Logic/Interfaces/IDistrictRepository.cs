using ParkRent.Storage.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Storage.Interfaces
{
    public interface IDistrictRepository
    {
        Task<District?> GetByIdAsync(Guid id);
        Task<IEnumerable<District>> GetAllAsync();
        Task AddAsync(District district);
        Task UpdateAsync(District district);
    }
}
