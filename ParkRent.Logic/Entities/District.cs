using ParkRent.Common.Storage.Entities;
using ParkRent.Logic.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Storage.Entities
{
    [Table("Districts", Schema = "ParkRent")]
    public class District : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public ICollection<User> Users { get; set; }
        public ICollection<ParkingSpot> ParkingSpots { get; set; }
    }
}
