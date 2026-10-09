namespace HelpDeskPro.Models;

public class Notification
{
    public int Id { get; set; }

    // User who should receive this notification
    public int UserId { get; set; }

    // Notification content
    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    // Example:
    // TicketAssigned
    // TicketResolved
    // TicketClosed
    public string Type { get; set; } = string.Empty;

    // Optional ticket related to the notification
    public int? TicketId { get; set; }

    // Read / unread
    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }
}
