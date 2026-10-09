using System.Security.Claims;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationsController(
        NotificationService notificationService)
    {
        _notificationService = notificationService;
    }


    // =====================================================
    // GET ALL NOTIFICATIONS
    // GET: /api/Notifications
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = GetUserId();

        var notifications =
            await _notificationService
                .GetUserNotifications(userId);

        return Ok(notifications);
    }


    // =====================================================
    // GET UNREAD COUNT
    // GET: /api/Notifications/unread-count
    // =====================================================

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetUserId();

        var count =
            await _notificationService
                .GetUnreadCount(userId);

        return Ok(new
        {
            unreadCount = count
        });
    }


    // =====================================================
    // MARK ONE NOTIFICATION AS READ
    // PATCH: /api/Notifications/{id}/read
    // =====================================================

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(
        int id)
    {
        var userId = GetUserId();

        await _notificationService
            .MarkAsRead(id, userId);

        return Ok(new
        {
            message = "Notification marked as read."
        });
    }


    // =====================================================
    // MARK ALL NOTIFICATIONS AS READ
    // PATCH: /api/Notifications/read-all
    // =====================================================

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();

        await _notificationService
            .MarkAllAsRead(userId);

        return Ok(new
        {
            message = "All notifications marked as read."
        });
    }


    // =====================================================
    // GET CURRENT USER ID
    // =====================================================

    private int GetUserId()
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException(
                "User ID not found in token."
            );
        }

        return int.Parse(userIdClaim);
    }
}