namespace HelpDeskPro.DTOs.Tickets;

public class TicketDto
{
    public int Id { get; set; }

    public string TicketNumber { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public string Category { get; set; } = string.Empty;

    public int CreatedById { get; set; }

    public string CreatedBy { get; set; } = string.Empty;

    public int? AssignedToId { get; set; }

    public string? AssignedTo { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }

}
