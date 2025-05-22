using ParkRent.Functionality.Dto;
using ParkRent.Logic.Entities;
using ParkRent.Logic.Repository;
using ParkRent.Storage.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;

        public AuthService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<AuthResponse> LoginAsyns(LoginRequest loginRequest)
        {
            var user = await _userRepository.GetByEmailAsync(loginRequest.Email);
            if (user == null || user.UserHashedPassword != HashPassword(user.UserHashedPassword))
            {

               throw new UnauthorizedAccessException("Niepoprawny email lub hasło.");
            }

            return new AuthResponse
            {
                UserId = user.Id,
                Email = user.UserEmail,
                // Role = user.Role,
                Token = "temp-token"
            };
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest registerRequest)
        {
            var exist = await _userRepository.GetByEmailAsync(registerRequest.Email);

            if (exist != null)
            {
               throw new InvalidOperationException("Użytkownik o podanym adresie email już istnieje.");
            }

            var newUser = new User
            {   
                Id = Guid.NewGuid(),
                UserName = registerRequest.Username,
                UserEmail = registerRequest.Email,
                UserHashedPassword = HashPassword(registerRequest.Password)
            };

            await _userRepository.AddUser(newUser);

            return new AuthResponse
            {
                UserId = newUser.Id,
                Email = newUser.UserEmail,
                // Role = newUser.Role,
                Token = "temp-token"
            };
        }
        

        private string HashPassword(string password)
        {
            var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
