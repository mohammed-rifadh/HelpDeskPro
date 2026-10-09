using System.Security.Claims;
using HelpDeskPro.DTOs.Agents;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Agent")]
public class AgentProfileController : ControllerBase
{
    private readonly AgentProfileService _agentProfileService;

    public AgentProfileController(
        AgentProfileService agentProfileService)
    {
        _agentProfileService = agentProfileService;
    }

    // =========================================================
    // GET AGENT PROFILE
    // =========================================================

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var agentId = GetCurrentAgentId();

        if (agentId == null)
        {
            return Unauthorized(new
            {
                message = "User ID not found in token."
            });
        }

        var profile =
            await _agentProfileService
                .GetAgentProfile(agentId.Value);

        if (profile == null)
        {
            return NotFound(new
            {
                message = "Agent profile not found."
            });
        }

        return Ok(profile);
    }


    // =========================================================
    // UPDATE AGENT PROFILE
    // =========================================================

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateAgentProfileDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var agentId = GetCurrentAgentId();

        if (agentId == null)
        {
            return Unauthorized(new
            {
                message = "User ID not found in token."
            });
        }

        var result =
            await _agentProfileService
                .UpdateAgentProfile(
                    agentId.Value,
                    dto
                );

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = result.Message
            });
        }

        // Return updated profile
        var updatedProfile =
            await _agentProfileService
                .GetAgentProfile(agentId.Value);

        return Ok(new
        {
            message = result.Message,
            profile = updatedProfile
        });
    }


    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangeAgentPasswordDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var agentId = GetCurrentAgentId();

        if (agentId == null)
        {
            return Unauthorized(new
            {
                message = "User ID not found in token."
            });
        }

        var result =
            await _agentProfileService
                .ChangePassword(
                    agentId.Value,
                    dto
                );

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = result.Message
            });
        }

        return Ok(new
        {
            message = result.Message
        });
    }


    // =========================================================
    // GET CURRENT AGENT ID FROM JWT
    // =========================================================

    private int? GetCurrentAgentId()
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            return null;
        }

        if (!int.TryParse(
                userIdClaim,
                out int agentId))
        {
            return null;
        }

        return agentId;
    }
}