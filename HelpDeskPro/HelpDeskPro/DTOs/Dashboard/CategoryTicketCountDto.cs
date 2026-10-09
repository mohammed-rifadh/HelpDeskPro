namespace HelpDeskPro.DTOs.Dashboard;

public class CategoryTicketCountDto
{
    public int CategoryId { get; set; }

    public string Category { get; set; } = string.Empty;

    public int TicketCount { get; set; }

}
