using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;

    public DashboardController(
        DashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _dashboardService.GetSummary();

        return Ok(summary);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetTicketsByCategory()
    {
        var data = await _dashboardService.GetTicketsByCategory();

        return Ok(data);
    }

    [HttpGet("priorities")]
    public async Task<IActionResult> GetTicketsByPriority()
    {
        var data = await _dashboardService.GetTicketsByPriority();

        return Ok(data);
    }

    [HttpGet("agents")]
    public async Task<IActionResult> GetTicketsByAgent()
    {
        var data = await _dashboardService.GetTicketsByAgent();

        return Ok(data);
    }


    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlyTicketStatistics()
    {
        var data =
            await _dashboardService.GetMonthlyTicketStatistics();

        return Ok(data);
    }
}
