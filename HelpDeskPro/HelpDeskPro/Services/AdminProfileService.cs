using System.Security.Claims;
using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Admins;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class AdminProfileService
{
    private readonly AppDbContext _context;

    public AdminProfileService(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET CURRENT ADMIN PROFILE
    // =====================================================

    public async Task<AdminProfileDto> GetAdminProfile(ClaimsPrincipal user)
    {
        // -------------------------------------------------
        // Get Admin ID from JWT
        // -------------------------------------------------

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            throw new Exception("User ID not found in token.");
        }

        if (!int.TryParse(userIdClaim.Value, out int adminId))
        {
            throw new Exception("Invalid user ID in token.");
        }


        // -------------------------------------------------
        // Find Admin
        // -------------------------------------------------

        var admin = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == adminId);

        if (admin == null)
        {
            throw new Exception("Admin account not found.");
        }


        // -------------------------------------------------
        // Verify Admin Role
        // -------------------------------------------------

        if (admin.Role == null ||
            !admin.Role.Name.Equals(
                "Admin",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new Exception("Access denied. Admin account required.");
        }


        // -------------------------------------------------
        // Statistics
        // -------------------------------------------------

        var totalUsers = await _context.Users
            .CountAsync();

        var totalEmployees = await _context.Users
            .CountAsync(u =>
                u.Role != null &&
                u.Role.Name == "Employee");

        var totalAgents = await _context.Users
            .CountAsync(u =>
                u.Role != null &&
                u.Role.Name == "Agent");

        var totalTickets = await _context.Tickets
            .CountAsync();


        // -------------------------------------------------
        // Return Profile
        // -------------------------------------------------

        return new AdminProfileDto
        {
            Id = admin.Id,

            FullName = admin.FullName,

            Email = admin.Email,

            Role = admin.Role.Name,

            IsActive = admin.IsActive,

            CreatedAt = admin.CreatedAt,

            TotalUsers = totalUsers,

            TotalEmployees = totalEmployees,

            TotalAgents = totalAgents,

            TotalTickets = totalTickets
        };
    }


    // =====================================================
    // UPDATE ADMIN PROFILE
    // =====================================================

    public async Task<AdminProfileDto> UpdateAdminProfile(
        ClaimsPrincipal user,
        UpdateAdminProfileDto dto)
    {
        // -------------------------------------------------
        // Get Admin ID from JWT
        // -------------------------------------------------

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            throw new Exception("User ID not found in token.");
        }

        if (!int.TryParse(userIdClaim.Value, out int adminId))
        {
            throw new Exception("Invalid user ID in token.");
        }


        // -------------------------------------------------
        // Find Admin
        // -------------------------------------------------

        var admin = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == adminId);

        if (admin == null)
        {
            throw new Exception("Admin account not found.");
        }


        // -------------------------------------------------
        // Verify Admin Role
        // -------------------------------------------------

        if (admin.Role == null ||
            !admin.Role.Name.Equals(
                "Admin",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new Exception("Access denied. Admin account required.");
        }


        // -------------------------------------------------
        // Validate Full Name
        // -------------------------------------------------

        if (string.IsNullOrWhiteSpace(dto.FullName))
        {
            throw new Exception("Full name is required.");
        }


        // -------------------------------------------------
        // Validate Email
        // -------------------------------------------------

        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            throw new Exception("Email is required.");
        }


        // -------------------------------------------------
        // Check Duplicate Email
        // -------------------------------------------------

        var normalizedEmail = dto.Email.Trim();

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Email == normalizedEmail &&
                u.Id != adminId);

        if (existingUser != null)
        {
            throw new Exception(
                "This email address is already registered.");
        }


        // -------------------------------------------------
        // Update Profile
        // -------------------------------------------------

        admin.FullName = dto.FullName.Trim();

        admin.Email = normalizedEmail;


        await _context.SaveChangesAsync();


        // -------------------------------------------------
        // Return Updated Profile
        // -------------------------------------------------

        return await GetAdminProfile(user);
    }


    // =====================================================
    // CHANGE ADMIN PASSWORD
    // =====================================================

    public async Task ChangePassword(
        ClaimsPrincipal user,
        ChangeAdminPasswordDto dto)
    {
        // -------------------------------------------------
        // Get Admin ID from JWT
        // -------------------------------------------------

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            throw new Exception("User ID not found in token.");
        }

        if (!int.TryParse(userIdClaim.Value, out int adminId))
        {
            throw new Exception("Invalid user ID in token.");
        }


        // -------------------------------------------------
        // Find Admin
        // -------------------------------------------------

        var admin = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == adminId);

        if (admin == null)
        {
            throw new Exception("Admin account not found.");
        }


        // -------------------------------------------------
        // Verify Admin Role
        // -------------------------------------------------

        if (admin.Role == null ||
            !admin.Role.Name.Equals(
                "Admin",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new Exception("Access denied. Admin account required.");
        }


        // -------------------------------------------------
        // Validate Current Password
        // -------------------------------------------------

        if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
        {
            throw new Exception("Current password is required.");
        }


        // -------------------------------------------------
        // Validate New Password
        // -------------------------------------------------

        if (string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            throw new Exception("New password is required.");
        }


        // -------------------------------------------------
        // Confirm New Password
        // -------------------------------------------------

        if (dto.NewPassword != dto.ConfirmNewPassword)
        {
            throw new Exception(
                "New password and confirmation password do not match.");
        }


        // -------------------------------------------------
        // Password Length
        // -------------------------------------------------

        if (dto.NewPassword.Length < 8)
        {
            throw new Exception(
                "New password must contain at least 8 characters.");
        }


        // -------------------------------------------------
        // Verify Current Password using BCrypt
        // -------------------------------------------------

        bool currentPasswordValid =
            BCrypt.Net.BCrypt.Verify(
                dto.CurrentPassword,
                admin.PasswordHash);

        if (!currentPasswordValid)
        {
            throw new Exception(
                "Current password is incorrect.");
        }


        // -------------------------------------------------
        // Prevent Same Password
        // -------------------------------------------------

        bool samePassword =
            BCrypt.Net.BCrypt.Verify(
                dto.NewPassword,
                admin.PasswordHash);

        if (samePassword)
        {
            throw new Exception(
                "New password must be different from your current password.");
        }


        // -------------------------------------------------
        // Hash New Password
        // -------------------------------------------------

        admin.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                dto.NewPassword);


        // -------------------------------------------------
        // Save
        // -------------------------------------------------

        await _context.SaveChangesAsync();
    }
}