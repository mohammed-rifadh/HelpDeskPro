//using BCrypt.Net;
using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Agents;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class AgentProfileService
{
    private readonly AppDbContext _context;

    public AgentProfileService(AppDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // GET AGENT PROFILE
    // =========================================================

    public async Task<AgentProfileDto?> GetAgentProfile(
        int agentId)
    {
        var agent = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == agentId);

        if (agent == null)
        {
            return null;
        }

        var assignedTickets = await _context.Tickets
            .Where(t => t.AssignedToId == agentId)
            .ToListAsync();

        var assignedCount = assignedTickets.Count;

        var inProgressCount = assignedTickets.Count(t =>
            t.Status == "In Progress");

        var resolvedCount = assignedTickets.Count(t =>
            t.Status == "Resolved");

        var closedCount = assignedTickets.Count(t =>
            t.Status == "Closed");

        var completedCount = assignedTickets.Count(t =>
            t.Status == "Resolved" ||
            t.Status == "Closed");

        double resolutionRate = assignedCount > 0
            ? Math.Round(
                (double)completedCount /
                assignedCount *
                100,
                1)
            : 0;

        return new AgentProfileDto
        {
            Id = agent.Id,

            FullName = agent.FullName,

            Email = agent.Email,

            Role = agent.Role?.Name ?? "Agent",

            IsActive = agent.IsActive,

            CreatedAt = agent.CreatedAt,

            AssignedTickets = assignedCount,

            InProgressTickets = inProgressCount,

            ResolvedTickets = resolvedCount,

            ClosedTickets = closedCount,

            ResolutionRate = resolutionRate
        };
    }

    // =========================================================
    // UPDATE AGENT PROFILE
    // =========================================================

    public async Task<(bool Success, string Message)>
        UpdateAgentProfile(
            int agentId,
            UpdateAgentProfileDto dto)
    {
        var agent = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == agentId);

        if (agent == null)
        {
            return (
                false,
                "Agent profile not found."
            );
        }

        var email = dto.Email.Trim();

        // -----------------------------------------------------
        // CHECK EMAIL
        // -----------------------------------------------------

        var emailExists = await _context.Users
            .AnyAsync(u =>
                u.Id != agentId &&
                u.Email.ToLower() == email.ToLower());

        if (emailExists)
        {
            return (
                false,
                "This email address is already in use."
            );
        }

        // -----------------------------------------------------
        // UPDATE
        // -----------------------------------------------------

        agent.FullName = dto.FullName.Trim();

        agent.Email = email;

        await _context.SaveChangesAsync();

        return (
            true,
            "Profile updated successfully."
        );
    }

    public async Task<(bool Success, string Message)>
    ChangePassword(
        int agentId,
        ChangeAgentPasswordDto dto)
    {
        var agent = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == agentId);

        if (agent == null)
        {
            return (
                false,
                "Agent profile not found."
            );
        }

        // Verify current password
        bool currentPasswordValid =
            BCrypt.Net.BCrypt.Verify(
                dto.CurrentPassword,
                agent.PasswordHash
            );

        if (!currentPasswordValid)
        {
            return (
                false,
                "Current password is incorrect."
            );
        }

        // Prevent using the same password
        if (dto.CurrentPassword == dto.NewPassword)
        {
            return (
                false,
                "New password must be different from your current password."
            );
        }

        // Hash the new password
        agent.PasswordHash =
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