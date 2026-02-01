using ParkRent.Logic.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Logic.Repository
{
    public interface IParkingSpotRepository
    {
        Task<IEnumerable<ParkingSpot>> GetAllAsync();
        Task<ParkingSpot> GetByIdAsync(Guid id);
        Task<IEnumerable<ParkingSpot>> GetAvailableAsync();
        Task UpdateAsync(ParkingSpot parkingSpot);
        Task <IEnumerable<ParkingSpot>> GetByDistrictIdAsync(Guid districtId);
    }
}
