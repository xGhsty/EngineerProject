﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality
{
    public class AuthResponse
    {
        public Guid UserId { get; set; }
        public string Email { get; set; }
        // public string Role { get; set; }
        public string Token { get; set; }
    }
}
