using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality.Dto
{
    public class RegisterRequest
    {
        public required string Username { get; set; }
        public required string Surname { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public int PhoneNumber { get; set; }

    }
}
