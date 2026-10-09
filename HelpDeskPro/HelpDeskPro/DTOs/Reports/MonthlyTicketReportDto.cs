namespace HelpDeskPro.DTOs.Reports;

public class MonthlyTicketReportDto
{
    public int Year { get; set; }

    public int Month { get; set; }

    public string MonthName { get; set; } = string.Empty;

    public int TicketCount { get; set; }

}
