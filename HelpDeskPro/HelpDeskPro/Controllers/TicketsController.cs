using System.Security.Claims;
using HelpDeskPro.DTOs.Tickets;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly TicketService _ticketService;

    public TicketsController(TicketService ticketService)
    {
        _ticketService = ticketService;
    }


    // =========================================================
    // CREATE TICKET
    // =========================================================
    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CreateTicket(
        CreateTicketDto dto)
    {
        try
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }

            if (!int.TryParse(
                userIdClaim.Value,
                out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            var ticket =
                await _ticketService.CreateTicket(
                    dto,
                    userId);

            return CreatedAtAction(
                nameof(GetTicketById),
                new { id = ticket.Id },
                ticket);
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
    // SEARCH AND FILTER TICKETS
    // =========================================================
    [HttpGet("search")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> SearchTickets(
        [FromQuery] TicketFilterDto filter)
    {
        try
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            var roleClaim =
                User.FindFirst(
                    ClaimTypes.Role);

            if (userIdClaim == null ||
                roleClaim == null)
            {
                return Unauthorized(new
                {
                    message =
                        "User identity or role not found."
                });
            }

            if (!int.TryParse(
                userIdClaim.Value,
                out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            string role = roleClaim.Value;

            var tickets =
                await _ticketService.SearchTickets(
                    filter,
                    userId,
                    role);

            return Ok(tickets);
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
    // GET TICKET BY ID
    // =========================================================
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Agent,Employee")]
    public async Task<IActionResult> GetTicketById(int id)
    {
        try
        {
            // -----------------------------------------------------
            // Get User ID from JWT
            // -----------------------------------------------------
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            // -----------------------------------------------------
            // Get User Role from JWT
            // -----------------------------------------------------
            var roleClaim =
                User.FindFirst(
                    ClaimTypes.Role);

            // -----------------------------------------------------
            // Validate Claims
            // -----------------------------------------------------
            if (userIdClaim == null ||
                roleClaim == null)
            {
                return Unauthorized(new
                {
                    message =
                        "User identity or role not found."
                });
            }

            // -----------------------------------------------------
            // Convert User ID
            // -----------------------------------------------------
            if (!int.TryParse(
                userIdClaim.Value,
                out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            // -----------------------------------------------------
            // Get Role
            // -----------------------------------------------------
            string role = roleClaim.Value;

            // -----------------------------------------------------
            // Get Secure Ticket
            // -----------------------------------------------------
            var ticket =
                await _ticketService.GetTicketById(
                    id,
                    userId,
                    role);

            // -----------------------------------------------------
            // Ticket Not Found / No Permission
            // -----------------------------------------------------
            if (ticket == null)
            {
                return NotFound(new
                {
                    message =
                        "Ticket not found or you do not have permission to view it."
                });
            }

            // -----------------------------------------------------
            // Return Ticket
            // -----------------------------------------------------
            return Ok(ticket);
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
    // GET ALL TICKETS
    // =========================================================
    [HttpGet]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> GetAllTickets()
    {
        try
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            var roleClaim =
                User.FindFirst(
                    ClaimTypes.Role);

            if (userIdClaim == null ||
                roleClaim == null)
            {
                return Unauthorized(new
                {
                    message =
                        "User identity or role not found."
                });
            }

            if (!int.TryParse(
                userIdClaim.Value,
                out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            string role = roleClaim.Value;

            var tickets =
                await _ticketService.GetAllTickets(
                    userId,
                    role);

            return Ok(tickets);
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
    // GET MY TICKETS
    // =========================================================
    [HttpGet("my")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyTickets()
    {
        try
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }

            if (!int.TryParse(
                userIdClaim.Value,
                out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            var tickets =
                await _ticketService.GetMyTickets(
                    userId);

            return Ok(tickets);
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
    // ASSIGN TICKET
    // =========================================================
    // ONLY ADMIN CAN ASSIGN TICKETS
    // =========================================================
    [HttpPatch("{id}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignTicket(
        int id,
        AssignTicketDto dto)
    {
        try
        {
            // -----------------------------------------------------
            // Get User ID from JWT
            // -----------------------------------------------------
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            // -----------------------------------------------------
            // Get User Role from JWT
            // -----------------------------------------------------
            var roleClaim =
                User.FindFirst(
                    ClaimTypes.Role);

            // -----------------------------------------------------
            // Validate Claims
            // -----------------------------------------------------
            if (userIdClaim == null ||
                roleClaim == null)
            {
                return Unauthorized(new
                {
                    message =
                        "User identity or role not found."
                });
            }

            // -----------------------------------------------------
            // Convert User ID
            // -----------------------------------------------------
            if (!int.TryParse(
                userIdClaim.Value,
                out int assignedById))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            // -----------------------------------------------------
            // Get Role
            // -----------------------------------------------------
            string role = roleClaim.Value;

            // -----------------------------------------------------
            // Additional Role Check
            // -----------------------------------------------------
            if (role != "Admin")
            {
                return Forbid();
            }

            // -----------------------------------------------------
            // Assign Ticket
            // -----------------------------------------------------
            var ticket =
                await _ticketService.AssignTicket(
                    id,
                    dto.AssignedToId,
                    assignedById);

            return Ok(ticket);
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
    // UPDATE TICKET
    // =========================================================
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> UpdateTicket(
        int id,
        UpdateTicketDto dto)
    {
        try
        {
            // -----------------------------------------------------
            // Get User ID from JWT
            // -----------------------------------------------------
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            // -----------------------------------------------------
            // Get User Role from JWT
            // -----------------------------------------------------
            var roleClaim =
                User.FindFirst(
                    ClaimTypes.Role);

            // -----------------------------------------------------
            // Validate Claims
            // -----------------------------------------------------
            if (userIdClaim == null ||
                roleClaim == null)
            {
                return Unauthorized(new
                {
                    message =
                        "User identity or role not found."
                });
            }

            // -----------------------------------------------------
            // Convert User ID
            // -----------------------------------------------------
            if (!int.TryParse(
                userIdClaim.Value,
                out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            // -----------------------------------------------------
            // Get Role
            // -----------------------------------------------------
            string role = roleClaim.Value;

            // -----------------------------------------------------
            // Update Ticket
            // -----------------------------------------------------
            var updatedTicket =
                await _ticketService.UpdateTicket(
                    id,
                    dto,
                    userId,
                    role);

            return Ok(updatedTicket);
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
    // CLOSE TICKET
    // =========================================================
    [HttpPatch("{id}/close")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CloseTicket(int id)
    {
        try
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }

            if (!int.TryParse(
                userIdClaim.Value,
                out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            var ticket =
                await _ticketService.CloseTicket(
                    id,
                    userId);

            return Ok(ticket);
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
    // GET ASSIGNMENT HISTORY
    // =========================================================
    [HttpGet("{id}/assignments")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> GetAssignmentHistory(
    int id)
    {
        try
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            var roleClaim =
                User.FindFirst(
                    ClaimTypes.Role);

            if (userIdClaim == null ||
                roleClaim == null)
            {
                return Unauthorized(new
                {
                    message =
                        "User identity or role not found."
                });
            }

            if (!int.TryParse(
                userIdClaim.Value,
                out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            string role = roleClaim.Value;

            var history =
                await _ticketService.GetAssignmentHistory(
                    id,
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
