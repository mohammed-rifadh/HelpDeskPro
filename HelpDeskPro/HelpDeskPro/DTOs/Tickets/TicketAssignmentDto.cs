namespace HelpDeskPro.DTOs.Tickets;

public class TicketAssignmentDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }

    public int AssignedToId { get; set; }
    public string AssignedTo { get; set; } = string.Empty;

    public int AssignedById { get; set; }
    public string AssignedBy { get; set; } = string.Empty;

    public DateTime AssignedAt { get; set; }

}
