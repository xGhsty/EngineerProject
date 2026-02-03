using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ParkRent.Common.Storage.Enums;
using ParkRent.Functionality.Dto;
using ParkRent.Functionality.Security;
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
        private readonly JwtTokenGenerator _jwtGenerator;
        private readonly PasswordHasher _passwordHasher;

        public AuthService(IUserRepository userRepository, IConfiguration configuration, PasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _jwtGenerator = new JwtTokenGenerator(configuration);
            _passwordHasher = passwordHasher;
        }

        public async Task<AuthResponse> LoginAsyns(LoginRequest loginRequest)
        {
            var user = await _userRepository.GetByEmailAsync(loginRequest.Email);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Nieprawidłowy email lub hasło");
            }

            bool isPasswordValid = _passwordHasher.Verify(loginRequest.Password, user.Password);
            if (!isPasswordValid)
            {
                throw new UnauthorizedAccessException("Nieprawidłowy email lub hasło");
            }

            var token = _jwtGenerator.GenerateToken(user);

            return new AuthResponse
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,  
                Token = token,
                Role = user.Role.ToString(),
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
                throw new InvalidOperationException("Hasła nie są takie same.");
            }

            var username = string.IsNullOrWhiteSpace(registerRequest.Username)
                ? registerRequest.Email.Split('@')[0] : registerRequest.Username;

            var existingUsername = await _userRepository.GetByUsernameAsync(username);
            if (existingUsername != null)
            {
                var counter = 1;
                var baseUsername = username;
                while (existingUsername != null)
                {
                    username = $"{baseUsername}{counter}";
                    existingUsername = await _userRepository.GetByUsernameAsync(username);
                    counter++;
                }
                  
            }

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Name = registerRequest.Name,
                Surname = registerRequest.Surname,
                Username = username,
                Email = registerRequest.Email,
                Password = _passwordHasher.Hash(registerRequest.Password),
                DistrictId = null,
                Role = UserRole.User
            };

            await _userRepository.AddAsync(newUser);

            return new AuthResponse
            {
                UserId = newUser.Id,
                Username = newUser.Username,
                Email = newUser.Email,
                Role = newUser.Role.ToString(),
                Token = _jwtGenerator.GenerateToken(newUser)
            };
        }
    }
}
