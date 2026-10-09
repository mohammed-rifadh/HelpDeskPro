using System.Security.Claims;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/tickets/{ticketId}/status-history")]
[Authorize(Roles = "Admin,Agent,Employee")]
public class TicketStatusHistoryController : ControllerBase
{
    private readonly TicketStatusHistoryService _historyService;

    public TicketStatusHistoryController(
        TicketStatusHistoryService historyService)
    {
        _historyService = historyService;
    }


    // =========================================================
    // GET STATUS HISTORY
    // =========================================================
    [HttpGet]
    public async Task<IActionResult> GetStatusHistory(
        int ticketId)
    {
        try
        {
            // -------------------------------------------------
            // Get User ID from JWT
            // -------------------------------------------------
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            // -------------------------------------------------
            // Get User Role from JWT
            // -------------------------------------------------
            var roleClaim =
                User.FindFirst(ClaimTypes.Role);

            // -------------------------------------------------
            // Validate Claims
            // -------------------------------------------------
            if (userIdClaim == null ||
                roleClaim == null)
            {
                return Unauthorized(new
                {
                    message =
                        "User identity or role not found."
                });
            }

            // -------------------------------------------------
            // Convert User ID
            // -------------------------------------------------
            if (!int.TryParse(
                userIdClaim.Value,
                out int userId))
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid user ID."
                });
            }

            // -------------------------------------------------
            // Get Role
            // -------------------------------------------------
            string role = roleClaim.Value;

            // -------------------------------------------------
            // Get Status History
            // -------------------------------------------------
            var history =
                await _historyService.GetStatusHistory(
                    ticketId,
                    userId,
                    role);

            return Ok(history);
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
