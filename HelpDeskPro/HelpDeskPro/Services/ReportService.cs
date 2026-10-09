using ClosedXML.Excel;
using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Reports;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class ReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // TICKET SUMMARY REPORT
    // =========================================================
    public async Task<TicketSummaryReportDto> GetTicketSummary()
    {
        return new TicketSummaryReportDto
        {
            TotalTickets = await _context.Tickets.CountAsync(),

            OpenTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Open"),

            AssignedTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Assigned"),

            InProgressTickets = await _context.Tickets
                .CountAsync(t => t.Status == "In Progress"),

            ResolvedTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Resolved"),

            ClosedTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Closed")
        };
    }


    // =========================================================
    // PRIORITY REPORT
    // =========================================================
    public async Task<List<PriorityReportDto>> GetPriorityReport()
    {
        return await _context.Tickets
            .GroupBy(t => t.Priority)
            .Select(g => new PriorityReportDto
            {
                Priority = g.Key,
                TicketCount = g.Count()
            })
            .OrderByDescending(x => x.TicketCount)
            .ToListAsync();
    }


    // =========================================================
    // CATEGORY REPORT
    // =========================================================
    public async Task<List<CategoryReportDto>> GetCategoryReport()
    {
        return await _context.Tickets
            .Include(t => t.Category)
            .GroupBy(t => t.Category!.Name)
            .Select(g => new CategoryReportDto
            {
                Category = g.Key,
                TicketCount = g.Count()
            })
            .OrderByDescending(x => x.TicketCount)
            .ToListAsync();
    }


    // =========================================================
    // AGENT PERFORMANCE REPORT
    // =========================================================
    public async Task<List<AgentPerformanceReportDto>>
        GetAgentPerformanceReport()
    {
        return await _context.Users
            .Where(u =>
                u.Role != null &&
                u.Role.Name == "Agent")
            .Select(u => new AgentPerformanceReportDto
            {
                AgentId = u.Id,

                AgentName = u.FullName,

                // ---------------------------------------------
                // Total tickets assigned to this agent
                // ---------------------------------------------
                AssignedTickets = _context.Tickets
                    .Count(t => t.AssignedToId == u.Id),

                // ---------------------------------------------
                // Tickets currently in Resolved status
                // ---------------------------------------------
                ResolvedTickets = _context.Tickets
                    .Count(t =>
                        t.AssignedToId == u.Id &&
                        t.Status == "Resolved"),

                // ---------------------------------------------
                // Tickets currently in Closed status
                // ---------------------------------------------
                ClosedTickets = _context.Tickets
                    .Count(t =>
                        t.AssignedToId == u.Id &&
                        t.Status == "Closed")
            })
            .OrderByDescending(x => x.AssignedTickets)
            .ThenBy(x => x.AgentName)
            .ToListAsync();
    }


    // =========================================================
    // MONTHLY TICKET REPORT
    // =========================================================
    public async Task<List<MonthlyTicketReportDto>>
        GetMonthlyTicketReport()
    {
        return await _context.Tickets
            .GroupBy(t => new
            {
                t.CreatedAt.Year,
                t.CreatedAt.Month
            })
            .Select(g => new MonthlyTicketReportDto
            {
                Year = g.Key.Year,

                Month = g.Key.Month,

                MonthName = new DateTime(
                    g.Key.Year,
                    g.Key.Month,
                    1
                ).ToString("MMMM"),

                TicketCount = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();
    }

    // =========================================================
    // EXPORT TICKET SUMMARY TO EXCEL
    // =========================================================
    public async Task<byte[]> ExportTicketSummaryToExcel()
    {
        var report = await GetTicketSummary();

        using var workbook = new XLWorkbook();

        var worksheet =
            workbook.Worksheets.Add("Ticket Summary");

        // -----------------------------------------------------
        // TITLE
        // -----------------------------------------------------

        worksheet.Cell("A1").Value =
            "HelpDeskPro - Ticket Summary Report";

        worksheet.Range("A1:B1").Merge();

        worksheet.Cell("A1").Style.Font.Bold = true;

        worksheet.Cell("A1").Style.Font.FontSize = 18;

        worksheet.Cell("A1").Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        // -----------------------------------------------------
        // HEADERS
        // -----------------------------------------------------

        worksheet.Cell("A3").Value = "Metric";
        worksheet.Cell("B3").Value = "Count";

        worksheet.Range("A3:B3").Style.Font.Bold = true;

        // -----------------------------------------------------
        // DATA
        // -----------------------------------------------------

        worksheet.Cell("A4").Value = "Total Tickets";
        worksheet.Cell("B4").Value = report.TotalTickets;

        worksheet.Cell("A5").Value = "Open Tickets";
        worksheet.Cell("B5").Value = report.OpenTickets;

        worksheet.Cell("A6").Value = "Assigned Tickets";
        worksheet.Cell("B6").Value = report.AssignedTickets;

        worksheet.Cell("A7").Value = "In Progress Tickets";
        worksheet.Cell("B7").Value =
            report.InProgressTickets;

        worksheet.Cell("A8").Value = "Resolved Tickets";
        worksheet.Cell("B8").Value =
            report.ResolvedTickets;

        worksheet.Cell("A9").Value = "Closed Tickets";
        worksheet.Cell("B9").Value =
            report.ClosedTickets;

        // -----------------------------------------------------
        // FORMAT
        // -----------------------------------------------------

        worksheet.Columns().AdjustToContents();

        worksheet.Column("A").Width = 30;

        worksheet.Column("B").Width = 15;

        // -----------------------------------------------------
        // RETURN FILE
        // -----------------------------------------------------

        using var stream = new MemoryStream();

        workbook.SaveAs(stream);

        return stream.ToArray();
    }

    // =========================================================
    // EXPORT PRIORITY REPORT TO EXCEL
    // =========================================================
    public async Task<byte[]> ExportPriorityReportToExcel()
    {
        var report =
            await GetPriorityReport();

        using var workbook = new XLWorkbook();

        var worksheet =
            workbook.Worksheets.Add("Priority Report");

        // -----------------------------------------------------
        // TITLE
        // -----------------------------------------------------

        worksheet.Cell("A1").Value =
            "HelpDeskPro - Priority Report";

        worksheet.Range("A1:B1").Merge();

        worksheet.Cell("A1").Style.Font.Bold = true;

        worksheet.Cell("A1").Style.Font.FontSize = 18;

        worksheet.Cell("A1").Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        // -----------------------------------------------------
        // HEADERS
        // -----------------------------------------------------

        worksheet.Cell("A3").Value = "Priority";

        worksheet.Cell("B3").Value = "Ticket Count";

        worksheet.Range("A3:B3").Style.Font.Bold = true;

        // -----------------------------------------------------
        // DATA
        // -----------------------------------------------------

        var row = 4;

        foreach (var item in report)
        {
            worksheet.Cell(row, 1).Value =
                item.Priority;

            worksheet.Cell(row, 2).Value =
                item.TicketCount;

            row++;
        }

        // -----------------------------------------------------
        // FORMAT
        // -----------------------------------------------------

        worksheet.Columns().AdjustToContents();

        worksheet.Column("A").Width = 20;

        worksheet.Column("B").Width = 20;

        // -----------------------------------------------------
        // RETURN FILE
        // -----------------------------------------------------

        using var stream = new MemoryStream();

        workbook.SaveAs(stream);

        return stream.ToArray();
    }


    // =========================================================
    // EXPORT CATEGORY REPORT TO EXCEL
    // =========================================================
    public async Task<byte[]> ExportCategoryReportToExcel()
    {
        var report =
            await GetCategoryReport();

        using var workbook = new XLWorkbook();

        var worksheet =
            workbook.Worksheets.Add("Category Report");

        // -----------------------------------------------------
        // TITLE
        // -----------------------------------------------------

        worksheet.Cell("A1").Value =
            "HelpDeskPro - Category Report";

        worksheet.Range("A1:B1").Merge();

        worksheet.Cell("A1").Style.Font.Bold = true;

        worksheet.Cell("A1").Style.Font.FontSize = 18;

        worksheet.Cell("A1").Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        // -----------------------------------------------------
        // HEADERS
        // -----------------------------------------------------

        worksheet.Cell("A3").Value = "Category";

        worksheet.Cell("B3").Value = "Ticket Count";

        worksheet.Range("A3:B3").Style.Font.Bold = true;

        // -----------------------------------------------------
        // DATA
        // -----------------------------------------------------

        var row = 4;

        foreach (var item in report)
        {
            worksheet.Cell(row, 1).Value =
                item.Category;

            worksheet.Cell(row, 2).Value =
                item.TicketCount;

            row++;
        }

        // -----------------------------------------------------
        // FORMAT
        // -----------------------------------------------------

        worksheet.Columns().AdjustToContents();

        worksheet.Column("A").Width = 25;

        worksheet.Column("B").Width = 20;

        // -----------------------------------------------------
        // RETURN FILE
        // -----------------------------------------------------

        using var stream = new MemoryStream();

        workbook.SaveAs(stream);

        return stream.ToArray();
    }


    // =========================================================
    // EXPORT AGENT PERFORMANCE TO EXCEL
    // =========================================================
    public async Task<byte[]> ExportAgentPerformanceToExcel()
    {
        var report =
            await GetAgentPerformanceReport();

        using var workbook = new XLWorkbook();

        var worksheet =
            workbook.Worksheets.Add(
                "Agent Performance"
            );

        // -----------------------------------------------------
        // TITLE
        // -----------------------------------------------------

        worksheet.Cell("A1").Value =
            "HelpDeskPro - Agent Performance Report";

        worksheet.Range("A1:D1").Merge();

        worksheet.Cell("A1").Style.Font.Bold = true;

        worksheet.Cell("A1").Style.Font.FontSize = 18;

        worksheet.Cell("A1").Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        // -----------------------------------------------------
        // HEADERS
        // -----------------------------------------------------

        worksheet.Cell("A3").Value = "Agent ID";

        worksheet.Cell("B3").Value = "Agent Name";

        worksheet.Cell("C3").Value = "Assigned Tickets";

        worksheet.Cell("D3").Value = "Resolved Tickets";

        worksheet.Cell("E3").Value = "Closed Tickets";

        worksheet.Range("A3:E3").Style.Font.Bold = true;

        // -----------------------------------------------------
        // DATA
        // -----------------------------------------------------

        var row = 4;

        foreach (var agent in report)
        {
            worksheet.Cell(row, 1).Value =
                agent.AgentId;

            worksheet.Cell(row, 2).Value =
                agent.AgentName;

            worksheet.Cell(row, 3).Value =
                agent.AssignedTickets;

            worksheet.Cell(row, 4).Value =
                agent.ResolvedTickets;

            worksheet.Cell(row, 5).Value =
                agent.ClosedTickets;

            row++;
        }

        // -----------------------------------------------------
        // FORMAT
        // -----------------------------------------------------

        worksheet.Columns().AdjustToContents();

        worksheet.Column("A").Width = 12;

        worksheet.Column("B").Width = 25;

        worksheet.Column("C").Width = 20;

        worksheet.Column("D").Width = 20;

        worksheet.Column("E").Width = 20;

        // -----------------------------------------------------
        // RETURN FILE
        // -----------------------------------------------------

        using var stream = new MemoryStream();

        workbook.SaveAs(stream);

        return stream.ToArray();
    }


    // =========================================================
    // EXPORT MONTHLY REPORT TO EXCEL
    // =========================================================
    public async Task<byte[]> ExportMonthlyReportToExcel()
    {
        var report =
            await GetMonthlyTicketReport();

        using var workbook = new XLWorkbook();

        var worksheet =
            workbook.Worksheets.Add(
                "Monthly Report"
            );

        // -----------------------------------------------------
        // TITLE
        // -----------------------------------------------------

        worksheet.Cell("A1").Value =
            "HelpDeskPro - Monthly Ticket Report";

        worksheet.Range("A1:D1").Merge();

        worksheet.Cell("A1").Style.Font.Bold = true;

        worksheet.Cell("A1").Style.Font.FontSize = 18;

        worksheet.Cell("A1").Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        // -----------------------------------------------------
        // HEADERS
        // -----------------------------------------------------

        worksheet.Cell("A3").Value = "Year";

        worksheet.Cell("B3").Value = "Month";

        worksheet.Cell("C3").Value = "Month Name";

        worksheet.Cell("D3").Value = "Ticket Count";

        worksheet.Range("A3:D3").Style.Font.Bold = true;

        // -----------------------------------------------------
        // DATA
        // -----------------------------------------------------

        var row = 4;

        foreach (var item in report)
        {
            worksheet.Cell(row, 1).Value =
                item.Year;

            worksheet.Cell(row, 2).Value =
                item.Month;

            worksheet.Cell(row, 3).Value =
                item.MonthName;

            worksheet.Cell(row, 4).Value =
                item.TicketCount;

            row++;
        }

        // -----------------------------------------------------
        // FORMAT
        // -----------------------------------------------------

        worksheet.Columns().AdjustToContents();

        worksheet.Column("A").Width = 12;

        worksheet.Column("B").Width = 12;

        worksheet.Column("C").Width = 20;

        worksheet.Column("D").Width = 20;

        // -----------------------------------------------------
        // RETURN FILE
        // -----------------------------------------------------

        using var stream = new MemoryStream();

        workbook.SaveAs(stream);

        return stream.ToArray();
    }


}