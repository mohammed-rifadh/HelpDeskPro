namespace HelpDeskPro.DTOs.Reports;

public class TicketSummaryReportDto
{
    public int TotalTickets { get; set; }

    public int OpenTickets { get; set; }

    public int AssignedTickets { get; set; }

    public int InProgressTickets { get; set; }

    public int ResolvedTickets { get; set; }

    public int ClosedTickets { get; set; }

}
