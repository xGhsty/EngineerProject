using ParkRent.Common.Storage.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Logic.Entities
{
    [Table("Reservations", Schema = "ParkRent")]
    public class Reservation : BaseEntity
    {
        public Guid UserId {  get; set; }
        public Guid ParkingSlotId { get; set; }
        public ParkingSpot? ParkingSlot { get; set; }
        public User? User { get; set; }
        public DateTime ReservationStartTime { get; set; }
        public DateTime ReservationEndTime { get; set; }

    }
}
