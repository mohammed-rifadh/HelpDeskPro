namespace HelpDeskPro.Models;

public class Ticket
{
    public int Id { get; set; }

    public string TicketNumber { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Priority { get; set; } = "Medium";

    public string Status { get; set; } = "Open";

    public int CategoryId { get; set; }

    public int CreatedById { get; set; }

    public int? AssignedToId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public Category? Category { get; set; }

    public User? CreatedBy { get; set; }

    public User? AssignedTo { get; set; }

    public ICollection<TicketComment> Comments { get; set; }
        = new List<TicketComment>();

}
