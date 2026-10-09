namespace HelpDeskPro.DTOs.Tickets;

public class TicketStatusHistoryDto
{
    public int Id { get; set; }

    public int TicketId { get; set; }

    public string OldStatus { get; set; } = string.Empty;

    public string NewStatus { get; set; } = string.Empty;

    public int ChangedById { get; set; }

    public string ChangedBy { get; set; } = string.Empty;

    public DateTime ChangedAt { get; set; }

}
