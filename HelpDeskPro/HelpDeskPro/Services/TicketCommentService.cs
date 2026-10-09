using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Tickets;
using HelpDeskPro.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class TicketCommentService
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService;

    public TicketCommentService(
        AppDbContext context,
        NotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }


    // =========================================================
    // CHECK TICKET ACCESS
    // =========================================================
    private async Task<Ticket?> GetAccessibleTicket(
        int ticketId,
        int userId,
        string role)
    {
        var query = _context.Tickets
            .AsQueryable();

        // -----------------------------------------------------
        // ADMIN
        // Admin can access any ticket
        // -----------------------------------------------------
        if (role == "Admin")
        {
            // No additional restriction
        }

        // -----------------------------------------------------
        // AGENT
        // Agent can access only assigned tickets
        // -----------------------------------------------------
        else if (role == "Agent")
        {
            query = query.Where(t =>
                t.AssignedToId == userId);
        }

        // -----------------------------------------------------
        // EMPLOYEE
        // Employee can access only tickets they created
        // -----------------------------------------------------
        else if (role == "Employee")
        {
            query = query.Where(t =>
                t.CreatedById == userId);
        }

        // -----------------------------------------------------
        // UNKNOWN ROLE
        // -----------------------------------------------------
        else
        {
            return null;
        }

        return await query
            .FirstOrDefaultAsync(t =>
                t.Id == ticketId);
    }


    // =========================================================
    // ADD COMMENT
    // =========================================================
    public async Task<TicketCommentDto> AddComment(
        int ticketId,
        int userId,
        string role,
        CreateCommentDto dto)
    {
        // -----------------------------------------------------
        // Check Ticket Access
        // -----------------------------------------------------
        var ticket = await GetAccessibleTicket(
            ticketId,
            userId,
            role);

        if (ticket == null)
        {
            throw new Exception(
                "Ticket not found or you do not have permission to comment on this ticket.");
        }


        // -----------------------------------------------------
        // Validate Comment
        // -----------------------------------------------------
        if (string.IsNullOrWhiteSpace(dto.Comment))
        {
            throw new Exception(
                "Comment cannot be empty.");
        }


        // -----------------------------------------------------
        // Check Comment User
        // -----------------------------------------------------
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive);

        if (user == null)
        {
            throw new Exception(
                "User not found or inactive.");
        }


        // -----------------------------------------------------
        // Create Comment
        // -----------------------------------------------------
        var comment = new TicketComment
        {
            TicketId = ticketId,
            UserId = userId,
            Comment = dto.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketComments.Add(comment);

        await _context.SaveChangesAsync();


        // =====================================================
        // COMMENT NOTIFICATIONS
        // =====================================================

        // -----------------------------------------------------
        // Get Ticket Participants
        // -----------------------------------------------------

        var ticketInfo = await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t =>
                t.Id == ticketId);

        if (ticketInfo != null)
        {
            // =================================================
            // EMPLOYEE COMMENT
            // =================================================
            if (role == "Employee")
            {
                // ---------------------------------------------
                // Notify all active Admins
                // ---------------------------------------------

                var admins = await _context.Users
                    .Include(u => u.Role)
                    .Where(u =>
                        u.IsActive &&
                        u.Role != null &&
                        u.Role.Name == "Admin" &&
                        u.Id != userId)
                    .ToListAsync();

                foreach (var admin in admins)
                {
                    await _notificationService.CreateNotification(
                        admin.Id,
                        "New Ticket Comment",
                        $"{user.FullName} commented on ticket {ticketInfo.TicketNumber}.",
                        "TicketCommented",
                        ticketId
                    );
                }


                // ---------------------------------------------
                // Notify Assigned Agent
                // ---------------------------------------------

                if (ticketInfo.AssignedToId.HasValue &&
                    ticketInfo.AssignedToId.Value != userId)
                {
                    await _notificationService.CreateNotification(
                        ticketInfo.AssignedToId.Value,
                        "New Ticket Comment",
                        $"{user.FullName} commented on your assigned ticket {ticketInfo.TicketNumber}.",
                        "TicketCommented",
                        ticketId
                    );
                }
            }


            // =================================================
            // AGENT COMMENT
            // =================================================
            else if (role == "Agent")
            {
                // ---------------------------------------------
                // Notify Employee
                // ---------------------------------------------

                if (ticketInfo.CreatedById != userId)
                {
                    await _notificationService.CreateNotification(
                        ticketInfo.CreatedById,
                        "New Ticket Comment",
                        $"{user.FullName} commented on your ticket {ticketInfo.TicketNumber}.",
                        "TicketCommented",
                        ticketId
                    );
                }


                // ---------------------------------------------
                // Notify all active Admins
                // ---------------------------------------------

                var admins = await _context.Users
                    .Include(u => u.Role)
                    .Where(u =>
                        u.IsActive &&
                        u.Role != null &&
                        u.Role.Name == "Admin" &&
                        u.Id != userId)
                    .ToListAsync();

                foreach (var admin in admins)
                {
                    await _notificationService.CreateNotification(
                        admin.Id,
                        "New Ticket Comment",
                        $"{user.FullName} commented on ticket {ticketInfo.TicketNumber}.",
                        "TicketCommented",
                        ticketId
                    );
                }
            }


            // =================================================
            // ADMIN COMMENT
            // =================================================
            else if (role == "Admin")
            {
                // ---------------------------------------------
                // Notify Employee
                // ---------------------------------------------

                if (ticketInfo.CreatedById != userId)
                {
                    await _notificationService.CreateNotification(
                        ticketInfo.CreatedById,
                        "New Ticket Comment",
                        $"Admin {user.FullName} commented on your ticket {ticketInfo.TicketNumber}.",
                        "TicketCommented",
                        ticketId
                    );
                }


                // ---------------------------------------------
                // Notify Assigned Agent
                // ---------------------------------------------

                if (ticketInfo.AssignedToId.HasValue &&
                    ticketInfo.AssignedToId.Value != userId)
                {
                    await _notificationService.CreateNotification(
                        ticketInfo.AssignedToId.Value,
                        "New Ticket Comment",
                        $"Admin {user.FullName} commented on ticket {ticketInfo.TicketNumber}.",
                        "TicketCommented",
                        ticketId
                    );
                }
            }
        }


        // -----------------------------------------------------
        // Return Created Comment
        // -----------------------------------------------------

        return new TicketCommentDto
        {
            Id = comment.Id,
            TicketId = comment.TicketId,
            UserId = comment.UserId,
            UserName = user.FullName,
            Comment = comment.Comment,
            CreatedAt = comment.CreatedAt
        };
    }


    // =========================================================
    // GET COMMENTS
    // =========================================================
    public async Task<List<TicketCommentDto>> GetComments(
        int ticketId,
        int userId,
        string role)
    {
        // -----------------------------------------------------
        // Check Ticket Access
        // -----------------------------------------------------
        var ticket = await GetAccessibleTicket(
            ticketId,
            userId,
            role);

        if (ticket == null)
        {
            throw new Exception(
                "Ticket not found or you do not have permission to view its comments.");
        }


        // -----------------------------------------------------
        // Get Comments
        // -----------------------------------------------------
        return await _context.TicketComments
            .Include(c => c.User)
            .Where(c =>
                c.TicketId == ticketId)
            .OrderBy(c =>
                c.CreatedAt)
            .Select(c => new TicketCommentDto
            {
                Id = c.Id,
                TicketId = c.TicketId,
                UserId = c.UserId,
                UserName = c.User!.FullName,
                Comment = c.Comment,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
    }
}