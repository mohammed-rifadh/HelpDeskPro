using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Employees;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class EmployeeProfileService
{
    private readonly AppDbContext _context;

    public EmployeeProfileService(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET EMPLOYEE PROFILE
    // =====================================================

    public async Task<EmployeeProfileDto?> GetEmployeeProfile(int employeeId)
    {
        var employee = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == employeeId);

        if (employee == null)
        {
            return null;
        }

        // Get employee tickets
        var tickets = await _context.Tickets
            .Where(t => t.CreatedById == employeeId)
            .ToListAsync();

        var totalTickets = tickets.Count;

        var openTickets = tickets.Count(t =>
            t.Status == "Open");

        var inProgressTickets = tickets.Count(t =>
            t.Status == "In Progress");

        var resolvedTickets = tickets.Count(t =>
            t.Status == "Resolved");

        var closedTickets = tickets.Count(t =>
            t.Status == "Closed");

        return new EmployeeProfileDto
        {
            Id = employee.Id,

            FullName = employee.FullName,

            Email = employee.Email,

            Role = employee.Role?.Name ?? "Employee",

            IsActive = employee.IsActive,

            CreatedAt = employee.CreatedAt,

            TotalTickets = totalTickets,

            OpenTickets = openTickets,

            InProgressTickets = inProgressTickets,

            ResolvedTickets = resolvedTickets,

            ClosedTickets = closedTickets
        };
    }


    // =====================================================
    // UPDATE EMPLOYEE PROFILE
    // =====================================================

    public async Task<(bool Success, string Message)>
        UpdateEmployeeProfile(
            int employeeId,
            UpdateEmployeeProfileDto dto)
    {
        var employee = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == employeeId);

        if (employee == null)
        {
            return (
                false,
                "Employee profile not found."
            );
        }

        var email = dto.Email.Trim();

        // Check duplicate email
        var emailExists = await _context.Users
            .AnyAsync(u =>
                u.Id != employeeId &&
                u.Email.ToLower() == email.ToLower());

        if (emailExists)
        {
            return (
                false,
                "This email address is already in use."
            );
        }

        employee.FullName = dto.FullName.Trim();

        employee.Email = email;

        await _context.SaveChangesAsync();

        return (
            true,
            "Profile updated successfully."
        );
    }


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    public async Task<(bool Success, string Message)>
        ChangePassword(
            int employeeId,
            ChangeEmployeePasswordDto dto)
    {
        var employee = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == employeeId);

        if (employee == null)
        {
            return (
                false,
                "Employee profile not found."
            );
        }

        // Verify current password
        bool currentPasswordValid =
            BCrypt.Net.BCrypt.Verify(
                dto.CurrentPassword,
                employee.PasswordHash
            );

        if (!currentPasswordValid)
        {
            return (
                false,
                "Current password is incorrect."
            );
        }

        // Prevent same password
        if (dto.CurrentPassword == dto.NewPassword)
        {
            return (
                false,
                "New password must be different from your current password."
            );
        }

        // Hash new password
        employee.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                dto.NewPassword
            );

        await _context.SaveChangesAsync();

        return (
            true,
            "Password changed successfully."
        );
    }
}