using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality.Dto
{
    public class DeleteAccountRequest
    {
        [Required]
        public string Password { get; set; }
    }
}
