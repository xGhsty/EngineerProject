using ParkRent.Common.Storage.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality
{
    public class Login : BaseEntity
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
}
