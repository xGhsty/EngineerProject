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
        [ForeignKey("User")]
        public Guid UserId {  get; set; }
        public User? User { get; set; }

        [Required]
        [ForeignKey("ParkingSpot")]
        public Guid ParkingSpotId { get; set; }
        public ParkingSpot? ParkingSpot { get; set; }

        [Required]
        public DateTime ReservationStartTime { get; set; }
        [Required]
        public DateTime ReservationEndTime { get; set; }

    }
}
