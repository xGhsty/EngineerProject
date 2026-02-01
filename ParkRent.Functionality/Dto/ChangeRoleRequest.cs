using ParkRent.Common.Storage.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality.Dto
{
    public class ChangeRoleRequest
    {
        public UserRole Role { get; set; }
    }
}
