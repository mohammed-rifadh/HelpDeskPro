using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Auth;
using HelpDeskPro.Helpers;
using HelpDeskPro.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly JwtHelper _jwtHelper;

    public AuthService(
        AppDbContext context,
        JwtHelper jwtHelper)
    {
        _context = context;
        _jwtHelper = jwtHelper;
    }

    // =========================================================
    // REGISTER
    // =========================================================
    public async Task<AuthResponseDto> Register(RegisterDto dto)
    {
        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (existingUser != null)
        {
            throw new Exception("Email already registered.");
        }

        // Get Employee role
        var employeeRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == 3);

        if (employeeRole == null)
        {
            throw new Exception("Employee role not found.");
        }

        // Create user
        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),

            // Public registration always creates Employee
            RoleId = 3,

            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        // Attach Employee role to user
        user.Role = employeeRole;

        // Generate JWT
        var token = _jwtHelper.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = employeeRole.Name
        };
    }


    // =========================================================
    // LOGIN
    // =========================================================
    public async Task<AuthResponseDto> Login(LoginDto dto)
    {
        // Find user with role
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
        {
            throw new Exception("Invalid email or password.");
        }

        // Check account status
        if (!user.IsActive)
        {
            throw new Exception("Your account is inactive.");
        }

        // Verify password
        bool passwordValid = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash
        );

        if (!passwordValid)
        {
            throw new Exception("Invalid email or password.");
        }

        // Generate JWT
        var token = _jwtHelper.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role!.Name
        };
    }
}
