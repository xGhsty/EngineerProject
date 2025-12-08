using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ParkRent.Functionality.Dto;
using ParkRent.Logic.Entities;
using ParkRent.Logic.Repository;
using ParkRent.Storage.Interfaces;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponse> LoginAsyns(LoginRequest loginRequest)
        {
            var user = await _userRepository.GetByEmailAsync(loginRequest.Email);
            if (user == null || user.Password != HashPassword(loginRequest.Password))
            {
                throw new UnauthorizedAccessException("Niepoprawny email lub hasło.");
            }

            return new AuthResponse
            {
                UserId = user.Id,
                Email = user.Email,
                // Role = user.Role,
                Token = GenerateJwtToken(user)
            };
        }
        
        public async Task<AuthResponse> RegisterAsync(RegisterRequest registerRequest)
        {
            var exist = await _userRepository.GetByEmailAsync(registerRequest.Email);

            if (exist != null)
            {
                throw new InvalidOperationException("Użytkownik o podanym adresie email już istnieje.");
            }

            if (registerRequest.Password != registerRequest.ConfirmPassword)
            {
                throw new InvalidOperationException("Hasła są niepoprawne.");
            }

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Name = registerRequest.Name,
                Surname = registerRequest.Surname,
                Email = registerRequest.Email,
                Password = HashPassword(registerRequest.Password)
            };

            await _userRepository.AddUser(newUser);

            return new AuthResponse
            {
                UserId = newUser.Id,
                Email = newUser.Email,
                // Role = newUser.Role,
                Token = GenerateJwtToken(newUser)
            };
        }


        private string HashPassword(string password)
        {
            var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expires = _configuration["Jwt:ExpiresInMinutes"];
            if (!double.TryParse(expires, out var expiresInMinutes))
            {
                expiresInMinutes = 60;
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email!),
                    new Claim(ClaimTypes.Name, user.Name + " " +user.Surname)
                },
                expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
