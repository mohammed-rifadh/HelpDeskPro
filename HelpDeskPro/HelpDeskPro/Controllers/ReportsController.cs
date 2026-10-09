using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reportService;

    public ReportsController(ReportService reportService)
    {
        _reportService = reportService;
    }


    // =========================================================
    // TICKET SUMMARY REPORT
    // =========================================================
    [HttpGet("summary")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTicketSummary()
    {
        try
        {
            var report = await _reportService.GetTicketSummary();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // =========================================================
    // PRIORITY REPORT
    // =========================================================
    [HttpGet("priorities")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPriorityReport()
    {
        try
        {
            var report = await _reportService.GetPriorityReport();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // =========================================================
    // CATEGORY REPORT
    // =========================================================
    [HttpGet("categories")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetCategoryReport()
    {
        try
        {
            var report = await _reportService.GetCategoryReport();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // =========================================================
    // AGENT PERFORMANCE REPORT
    // =========================================================
    [HttpGet("agents")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAgentPerformanceReport()
    {
        try
        {
            var report =
                await _reportService.GetAgentPerformanceReport();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // MONTHLY TICKET REPORT
    // =========================================================
    [HttpGet("monthly")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetMonthlyTicketReport()
    {
        try
        {
            var report =
                await _reportService.GetMonthlyTicketReport();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // EXPORT TICKET SUMMARY - EXCEL
    // =========================================================
    [HttpGet("summary/excel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportTicketSummaryExcel()
    {
        try
        {
            var file =
                await _reportService
                    .ExportTicketSummaryToExcel();

            return File(
                file,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"HelpDeskPro_Ticket_Summary_{DateTime.Now:yyyy-MM-dd}.xlsx"
            );
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // =========================================================
    // EXPORT PRIORITY REPORT - EXCEL
    // =========================================================
    [HttpGet("priorities/excel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportPriorityExcel()
    {
        try
        {
            var file =
                await _reportService
                    .ExportPriorityReportToExcel();

            return File(
                file,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"HelpDeskPro_Priority_Report_{DateTime.Now:yyyy-MM-dd}.xlsx"
            );
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // =========================================================
    // EXPORT CATEGORY REPORT - EXCEL
    // =========================================================
    [HttpGet("categories/excel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportCategoryExcel()
    {
        try
        {
            var file =
                await _reportService
                    .ExportCategoryReportToExcel();

            return File(
                file,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"HelpDeskPro_Category_Report_{DateTime.Now:yyyy-MM-dd}.xlsx"
            );
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // =========================================================
    // EXPORT AGENT PERFORMANCE - EXCEL
    // =========================================================
    [HttpGet("agents/excel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportAgentPerformanceExcel()
    {
        try
        {
            var file =
                await _reportService
                    .ExportAgentPerformanceToExcel();

            return File(
                file,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"HelpDeskPro_Agent_Performance_{DateTime.Now:yyyy-MM-dd}.xlsx"
            );
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // =========================================================
    // EXPORT MONTHLY REPORT - EXCEL
    // =========================================================
    [HttpGet("monthly/excel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportMonthlyExcel()
    {
        try
        {
            var file =
                await _reportService
                    .ExportMonthlyReportToExcel();

            return File(
                file,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"HelpDeskPro_Monthly_Report_{DateTime.Now:yyyy-MM-dd}.xlsx"
            );
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

}
