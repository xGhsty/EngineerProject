using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Logic.Entities
{
    public class ParkingSpot
    {
        public Guid ParkingId { get; set; } = Guid.NewGuid();
        public User? User { get; set; }
        public bool? IsAvailable { get; set; }
        public ICollection<Reservation>? Reservations { get; set; }
    }
}
