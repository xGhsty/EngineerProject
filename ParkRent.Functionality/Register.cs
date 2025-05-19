﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality
{
    public class Register
    {   
        public required string? FirstName { get; set; }
        public required string? LastName { get; set; }
        public required string? Email { get; set; }
        public required string? Password { get; set; }
        public int PhoneNumber { get; set; }

    }
}
