using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkRent.Common.Storage.Enums;
using ParkRent.Functionality.Dto;
using ParkRent.Logic.Repository;
using ParkRent.Storage.Interfaces;
using System.Security.Claims;

namespace ParkRent.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "DistrictAdmin, SuperAdmin")]
    public class DistrictAdminController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IDistrictRepository _districtRepository;

        public DistrictAdminController(IUserRepository userRepository, IDistrictRepository districtRepository)
        {
            _districtRepository = districtRepository;
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var users = currentUser.Role == Common.Storage.Enums.UserRole.SuperAdmin
                    ? await _userRepository.GetAllAsync()
                    : await _userRepository.GetByDistrictIdAsync(currentUser.DistrictId);

                return Ok(users.Select(u => new
                {
                    id = u.Id,
                    name = u.Name,
                    surname = u.Surname,
                    username = u.Username,
                    email = u.Email,
                    districtId = u.DistrictId,
                    districtName = u.District?.Name,
                    role = u.Role.ToString()
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }

        }

        [HttpPut("assign-district/{userId}")]
        public async Task<IActionResult> AssignUserToDistrict(Guid userId, [FromBody] AssignDisctrictRequest request)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var currentUser = await _userRepository.GetByIdAsync(currentUserId);

                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var targetUser = await _userRepository.GetByIdAsync(userId);
                if ( targetUser == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                if (currentUser.Role == UserRole.Admin && request.DistrictId != currentUser.DistrictId)
                {
                    return Forbid();
                }

                var district = await _districtRepository.GetByIdAsync(request.DistrictId);
                if ( district == null)
                {
                    return NotFound(new { message = "Dzielnica nie istnieje" });
                }

                targetUser.DistrictId = request.DistrictId;
                await _userRepository.UpdateAsync(targetUser);

                return Ok(new { message = $"Użytkownik przypisany do dzielnicy {district.Name}" });
                
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("change-role/{userId}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> ChangeUserRole(Guid userId, [FromBody] ChangeRoleRequest request)
        {
            try
            {
                var targetUser = await _userRepository.GetByIdAsync(userId);
                if ( targetUser == null)
                {
                    return NotFound(new { message = "Użytkownik nie istnieje" });
                }

                targetUser.Role = request.Role;
                await _userRepository.UpdateAsync(targetUser);

                return Ok(new { message = $"Rola zmieniona na {request.Role}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        [HttpGet("districts")]
        public async Task<IActionResult> GetDistricts()
        {
            try
            {
                var districts = await _districtRepository.GetAllAsync();

                return Ok(districts.Select(d => new
                {
                    id = d.Id,
                    name = d.Name,
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }
    }
}
