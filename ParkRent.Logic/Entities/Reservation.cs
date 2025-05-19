using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Logic.Entities
{
    public class Reservation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId {  get; set; }
        public Guid ParkingSlotId { get; set; }
        public ParkingSpot? ParkingSlot { get; set; }
        public User? User { get; set; }
        public DateTime ReservationStartTime { get; set; }
        public DateTime ReservationEndTime { get; set; }

    }
}
