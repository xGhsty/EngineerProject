using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using ParkRent.Functionality.Dto;
using ParkRent.Functionality.Security;
using ParkRent.Logic.Repository;
using System.Security.Claims;

namespace ParkRent.API.Controllers
{
    [ApiController]
    [Route("api/[ccontroller]")]
    [Authorize]
    public class UserSettingsController : Controller
    {
        private readonly IUserRepository _userRepository;

        public UserSettingsController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji"});
                }

                var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return NotFound(new { message = "Nie znaleziono użytkownika" });
                }

                return Ok(new
                {
                    userId = user.Id,
                    username = user.Username,
                    name = user.Name,
                    surname = user.Surname,
                    email = user.Email,
                    fullname = $"{user.Name} {user.Surname}",
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message =  ex.Message });
            }
        }

        [HttpPut("update-username")]
        public async Task<IActionResult> UpdateUsername([FromBody] UpdateUsernameRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return NotFound(new { message = "Nie znaleziono użytkownika" });
                }

                if (string.IsNullOrWhiteSpace(request.Username))
                {
                    return BadRequest(new { message = "Nazwa użytkownika nie może być pusta" });
                }

                if (request.Username.Length < 3 || request.Username.Length > 50)
                {
                    return BadRequest(new { message = "Nazwa użytkownika może mieć minimum 3 znaki oraz maksymalnie 50 znaków" });
                }

                var existingUsername = await _userRepository.GetByUsernameAsync(request.Username);
                if (existingUsername != null && existingUsername.Id != user.Id)
                {
                    return BadRequest(new { message = "Ta nazwa użytkownika jest juz zajęta" });
                }

                user.Username = request.Username;
                await _userRepository.UpdateUser(user);

                return Ok(new
                {
                    message = "Nazwa użytkownika zaktualizowana",
                    username = user.Username,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Wystąpił błąd podczas aktualizacji nazwy: {ex.Message}" });
            }
        }
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return NotFound(new { message = "Nie znaleziono użytkownika" });
                }

                if (!PasswordHasher.VerifyPassword(request.CurrentPassword, user.Password))
                {
                    return BadRequest(new { message = "Aktualne hasło jest niepoprawne" });
                }

                if (request.NewPassword != request.ConfirmNewPassword)
                {
                    return BadRequest(new { message = "Hasła nie są identyczne" });
                }

                if (request.NewPassword.Length < 6)
                {
                    return BadRequest(new { message = "Nowe hasło musi mieć minimum 6 znaków" });
                }

                user.Password = PasswordHasher.HashPassword(request.NewPassword);
                await _userRepository.UpdateUser(user);

                return Ok(new { message = "Hasło zostało zmienione" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Wystąpił błąd poczas zmiany hasła: {ex.Message}" });
            }
        }
        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Brak autoryzacji" });
                }

                var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return NotFound(new { message = "Nie znaleziono użytkownika" });
                }

                if (!PasswordHasher.VerifyPassword(request.Password, user.Password))
                {
                    return BadRequest(new { message = "Niepoprawne hasło" });
                }

                await _userRepository.DeleteUser(user);
                return Ok(new { message = "Konto zostało usunięte pomyślnie" });


            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Wystąpił błąd podczas próby usunięcia konta: {ex.Message}" });
            }
        }
    }
}
