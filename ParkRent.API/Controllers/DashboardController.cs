using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkRent.Logic.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality.Dashboard
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        [HttpGet("user-info")]
        public async Task<IActionResult> GetUserInfo(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            return Ok(new
            {
                User = user,
                Email = user.Email,
            });
        }
    }
}
