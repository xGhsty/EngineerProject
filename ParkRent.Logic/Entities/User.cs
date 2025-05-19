namespace ParkRent.Logic.Entities
{
    public class User
    {
        public Guid UserId { get; set; } = Guid.NewGuid();
        public required string UserName { get; set; }
        public string? UserEmail { get; set; }
        public required string UserHashedPassword { get; set; }

        public ICollection<Reservation>? Reservations { get; set; }
    }
}
