using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Notifications;
using HelpDeskPro.Hubs;
using HelpDeskPro.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class NotificationService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(
        AppDbContext context,
        IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }


    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================
    public async Task<NotificationDto> CreateNotification(
        int userId,
        string title,
        string message,
        string type,
        int? ticketId = null)
    {
        // -----------------------------------------------------
        // Create Notification
        // -----------------------------------------------------

        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            TicketId = ticketId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            ReadAt = null
        };


        // -----------------------------------------------------
        // Save to Database
        // -----------------------------------------------------

        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();


        // -----------------------------------------------------
        // Create DTO
        // -----------------------------------------------------

        var notificationDto = new NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            TicketId = notification.TicketId,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ReadAt = notification.ReadAt
        };


        // =====================================================
        // SIGNALR REAL-TIME NOTIFICATION
        // =====================================================

        var groupName = $"User_{userId}";

        await _hubContext.Clients
            .Group(groupName)
            .SendAsync(
                "ReceiveNotification",
                notificationDto
            );


        return notificationDto;
    }


    // =========================================================
    // GET USER NOTIFICATIONS
    // =========================================================
    public async Task<List<NotificationDto>> GetUserNotifications(
        int userId)
    {
        return await _context.Notifications
            .Where(n =>
                n.UserId == userId)
            .OrderByDescending(n =>
                n.CreatedAt)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                TicketId = n.TicketId,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                ReadAt = n.ReadAt
            })
            .ToListAsync();
    }


    // =========================================================
    // GET UNREAD COUNT
    // =========================================================
    public async Task<int> GetUnreadCount(
        int userId)
    {
        return await _context.Notifications
            .CountAsync(n =>
                n.UserId == userId &&
                !n.IsRead);
    }


    // =========================================================
    // MARK AS READ
    // =========================================================
    public async Task MarkAsRead(
        int notificationId,
        int userId)
    {
        var notification =
            await _context.Notifications
                .FirstOrDefaultAsync(n =>
                    n.Id == notificationId &&
                    n.UserId == userId);

        if (notification == null)
        {
            throw new Exception(
                "Notification not found.");
        }


        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }


    // =========================================================
    // MARK ALL AS READ
    // =========================================================
    public async Task MarkAllAsRead(
        int userId)
    {
        var notifications =
            await _context.Notifications
                .Where(n =>
                    n.UserId == userId &&
                    !n.IsRead)
                .ToListAsync();


        if (!notifications.Any())
        {
            return;
        }


        var readAt = DateTime.UtcNow;


        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = readAt;
        }


        await _context.SaveChangesAsync();
    }
}