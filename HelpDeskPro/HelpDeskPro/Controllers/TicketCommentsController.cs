using System.Security.Claims;
using HelpDeskPro.DTOs.Tickets;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/tickets/{ticketId}/comments")]
[Authorize(Roles = "Admin,Agent,Employee")]
public class TicketCommentsController : ControllerBase
{
    private readonly TicketCommentService _commentService;

    public TicketCommentsController(
        TicketCommentService commentService)
    {
        _commentService = commentService;
    }


    // =========================================================
    // ADD COMMENT
    // =========================================================
    [HttpPost]
    public async Task<IActionResult> AddComment(
        int ticketId,
        CreateCommentDto dto)
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
            // Add Comment
            // -------------------------------------------------
            var comment =
                await _commentService.AddComment(
                    ticketId,
                    userId,
                    role,
                    dto);

            return Ok(comment);
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
    // GET COMMENTS
    // =========================================================
    [HttpGet]
    public async Task<IActionResult> GetComments(
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
            // Get Comments
            // -------------------------------------------------
            var comments =
                await _commentService.GetComments(
                    ticketId,
                    userId,
                    role);

            return Ok(comments);
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
