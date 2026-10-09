namespace HelpDeskPro.DTOs.Tickets;

public class TicketFilterDto
{
    public string? Search { get; set; }

    public string? Status { get; set; }

    public string? Priority { get; set; }

    public int? CategoryId { get; set; }

    public int? AssignedToId { get; set; }

}
