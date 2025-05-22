using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ParkRent.Common.Storage;
using ParkRent.Functionality;
using ParkRent.Functionality.Dto;

namespace ParkRent.Storage.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest registerRequest);

        Task<AuthResponse> LoginAsyns(LoginRequest loginRequest);
    }
}
