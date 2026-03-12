using Moq;
using Microsoft.Extensions.Configuration;
using ParkRent.Functionality.Services;
using ParkRent.Functionality.Security;
using ParkRent.Functionality.Dto;
using ParkRent.Logic.Repository;
using ParkRent.Logic.Entities;
using ParkRent.Common.Storage.Enums;

namespace ParkRent.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly PasswordHasher _passwordHasher;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _configMock = new Mock<IConfiguration>();
        _passwordHasher = new PasswordHasher();
        _authService = new AuthService(_userRepoMock.Object, _configMock.Object, _passwordHasher);
    }

    [Fact]
    public async Task LoginAsync_UserNotFound_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        _userRepoMock
            .Setup(r => r.GetByEmailAsync("nieistniejacy@test.com"))
            .ReturnsAsync((User?)null);

        var request = new LoginRequest { Email = "nieistniejacy@test.com", Password = "haslo123" };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _authService.LoginAsync(request));

        Assert.Equal("Konto na podany adres email nie istnieje.", ex.Message);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Jan",
            Surname = "Kowalski",
            Username = "jkowalski",
            Email = "jan@test.com",
            Password = _passwordHasher.Hash("poprawneHaslo"),
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow
        };

        _userRepoMock
            .Setup(r => r.GetByEmailAsync("jan@test.com"))
            .ReturnsAsync(user);

        var request = new LoginRequest { Email = "jan@test.com", Password = "zleHaslo" };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _authService.LoginAsync(request));

        Assert.Equal("Podane hasło jest nieprawidłowe.", ex.Message);
    }

    [Fact]
    public async Task RegisterAsync_EmailAlreadyExists_ThrowsInvalidOperationException()
    {
        // Arrange — symulacja istniejącego konta superadmin@parkrent.pl
        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Name = "Super",
            Surname = "Admin",
            Username = "superAdmin",
            Email = "superadmin@parkrent.pl",
            Password = _passwordHasher.Hash("superadmin123!"),
            Role = UserRole.SuperAdmin,
            CreatedAt = DateTime.UtcNow
        };

        _userRepoMock
            .Setup(r => r.GetByEmailAsync("superadmin@parkrent.pl"))
            .ReturnsAsync(existingUser);

        var request = new RegisterRequest
        {
            Name = "Super",
            Surname = "Admin",
            Email = "superadmin@parkrent.pl",
            Password = "superadmin123!",
            ConfirmPassword = "superadmin123!"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _authService.RegisterAsync(request));

        Assert.Equal("Użytkownik o podanym adresie email już istnieje.", ex.Message);
    }
}
