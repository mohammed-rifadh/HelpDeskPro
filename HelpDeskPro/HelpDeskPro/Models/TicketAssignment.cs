namespace HelpDeskPro.Models;

public class TicketAssignment
{
    public int Id { get; set; }

    public int TicketId { get; set; }

    public int AssignedToId { get; set; }

    public int AssignedById { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    public Ticket? Ticket { get; set; }

    public User? AssignedTo { get; set; }

    public User? AssignedBy { get; set; }

}
