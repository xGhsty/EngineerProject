using ParkRent.Common.Storage.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Logic.Entities
{
    [Table("ParkingSpots", Schema = "ParkRent")]
    public class ParkingSpot : BaseEntity
    {
        public Guid? UserId { get; set; }

        public bool? IsAvailable { get; set; }

        public ICollection<Reservation>? Reservations { get; set; }
    }

}
