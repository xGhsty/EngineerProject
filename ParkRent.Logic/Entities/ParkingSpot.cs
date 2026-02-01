using ParkRent.Common.Storage.Entities;
using ParkRent.Storage.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParkRent.Logic.Entities
{
    [Table("ParkingSpots", Schema = "ParkRent")]
    public class ParkingSpot : BaseEntity
    {
        [ForeignKey("User")]
        public Guid? UserId { get; set; }

        public User? User { get; set; } 

        [Required]
        public string Name { get; set; }

        public bool IsAvailable { get; set; }
        [Required]
        [ForeignKey("Districts")]
        public Guid DistrictId { get; set; }
        public District? District { get; set; }

        public ICollection<Reservation>? Reservations { get; set; }
    }
}