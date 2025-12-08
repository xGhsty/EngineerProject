using ParkRent.Common.Storage.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Logic.Entities
{
    [Table("Reservations", Schema = "ParkRent")]
    public class Reservation : BaseEntity
    {
        [Required]
        public Guid UserId {  get; set; }
        [Required]
        public Guid ParkingSlotId { get; set; }
        [Required]
        public ParkingSpot? ParkingSlot { get; set; }
        public DateTime ReservationStartTime { get; set; }
        public DateTime ReservationEndTime { get; set; }

    }
}
