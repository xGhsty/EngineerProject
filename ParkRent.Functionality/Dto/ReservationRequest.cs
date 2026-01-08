using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality.Dto
{
    public class ReservationRequest
    {
        [Required]
        public Guid ParkingSpotId { get; set; }
        [Required]
        public DateTime StartTime {  get; set; }
        [Required]
        public DateTime EndTime { get; set; }
    }
}
