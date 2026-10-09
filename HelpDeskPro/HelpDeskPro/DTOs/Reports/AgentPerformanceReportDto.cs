namespace HelpDeskPro.DTOs.Reports;

public class AgentPerformanceReportDto
{
    public int AgentId { get; set; }

    public string AgentName { get; set; } = string.Empty;

    public int AssignedTickets { get; set; }

    public int ResolvedTickets { get; set; }

    public int ClosedTickets { get; set; }

}
