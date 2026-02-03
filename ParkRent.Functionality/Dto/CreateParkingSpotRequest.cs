using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality.Dto
{
    public class CreateParkingSpotRequest
    {
        public string Name { get; set; }
        public Guid DistrictId { get; set; }
        public Guid? OwnerId { get; set; }
        public bool IsAvailable { get; set; } = false;
    }
}
