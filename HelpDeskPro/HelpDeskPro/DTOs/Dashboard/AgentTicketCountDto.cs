namespace HelpDeskPro.DTOs.Dashboard;

public class AgentTicketCountDto
{
    public int AgentId { get; set; }

    public string AgentName { get; set; } = string.Empty;

    public int TicketCount { get; set; }

}
