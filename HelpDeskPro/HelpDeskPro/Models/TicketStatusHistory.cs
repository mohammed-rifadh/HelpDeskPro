namespace HelpDeskPro.Models;

public class TicketStatusHistory
{
    public int Id { get; set; }

    public int TicketId { get; set; }

    public string OldStatus { get; set; } = string.Empty;

    public string NewStatus { get; set; } = string.Empty;

    public int ChangedById { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public Ticket? Ticket { get; set; }

    public User? ChangedBy { get; set; }

}
