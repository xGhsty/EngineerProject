using ParkRent.Common.Storage.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParkRent.Logic.Entities
{
    [Table("Users", Schema = "ParkRent")]
    public class User : BaseEntity
    {
        public required string UserName { get; set; }
        public string? UserEmail { get; set; }
        public required string UserHashedPassword { get; set; }

        public ICollection<Reservation>? Reservations { get; set; }
    }
}
