namespace HelpDeskPro.Services;

using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Users;
using HelpDeskPro.Models;
using Microsoft.EntityFrameworkCore;


public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    // Get all users
    public async Task<List<UserDto>> GetAllUsers()
    {
        return await _context.Users
            .Include(u => u.Role)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                RoleId = u.RoleId,
                Role = u.Role!.Name,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();
    }

    // Get user by ID
    public async Task<UserDto?> GetUserById(int id)
    {
        return await _context.Users
            .Include(u => u.Role)
            .Where(u => u.Id == id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                RoleId = u.RoleId,
                Role = u.Role!.Name,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    // Create user
    public async Task<UserDto> CreateUser(CreateUserDto dto)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (existingUser != null)
        {
            throw new Exception("Email already registered.");
        }

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == dto.RoleId);

        if (role == null)
        {
            throw new Exception("Invalid role.");
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = dto.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            RoleId = user.RoleId,
            Role = role.Name,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    // Activate / deactivate user
    public async Task<bool> ToggleUserStatus(int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return false;
        }

        user.IsActive = !user.IsActive;

        await _context.SaveChangesAsync();

        return true;
    }

}
