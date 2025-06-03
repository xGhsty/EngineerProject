using ParkRent.Common.Storage.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace ParkRent.Logic.Entities
{
    [Table("Users", Schema = "ParkRent")]
    public class User : BaseEntity
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string? Email { get; set; }
        public string Password { get; set; }

        // public ICollection<Reservation>? Reservations { get; set; }
    }
}
