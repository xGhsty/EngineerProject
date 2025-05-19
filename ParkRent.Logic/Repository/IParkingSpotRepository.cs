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
        Task<ParkingSpot> GetParkingSpotByIdAsync(Guid parkingSpotId);
        Task<IEnumerable<ParkingSpot>> GetAllAsync();
        Task<IEnumerable<ParkingSpot>> GetAvailableAsync(DateTime time);
        Task AddParkingSpotAsync(ParkingSpot parkingSpot);
        Task UpdateParkingSpotAsync(ParkingSpot parkingSpot);
        Task DeleteParkingSpotByIdAsync(Guid parkingSpotId);
    }
}
