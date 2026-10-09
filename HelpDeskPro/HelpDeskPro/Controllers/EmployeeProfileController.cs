using System.Security.Claims;
using HelpDeskPro.DTOs.Employees;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Employee")]
public class EmployeeProfileController : ControllerBase
{
    private readonly EmployeeProfileService _employeeProfileService;

    public EmployeeProfileController(
        EmployeeProfileService employeeProfileService)
    {
        _employeeProfileService = employeeProfileService;
    }


    // =====================================================
    // GET: api/EmployeeProfile
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var employeeId = GetCurrentEmployeeId();

        if (employeeId == null)
        {
            return Unauthorized(new
            {
                message = "User ID not found in token."
            });
        }

        var profile =
            await _employeeProfileService
                .GetEmployeeProfile(employeeId.Value);

        if (profile == null)
        {
            return NotFound(new
            {
                message = "Employee profile not found."
            });
        }

        return Ok(profile);
    }


    // =====================================================
    // PUT: api/EmployeeProfile
    // =====================================================

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateEmployeeProfileDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var employeeId = GetCurrentEmployeeId();

        if (employeeId == null)
        {
            return Unauthorized(new
            {
                message = "User ID not found in token."
            });
        }

        var result =
            await _employeeProfileService
                .UpdateEmployeeProfile(
                    employeeId.Value,
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
            await _employeeProfileService
                .GetEmployeeProfile(employeeId.Value);

        return Ok(new
        {
            message = result.Message,
            profile = updatedProfile
        });
    }


    // =====================================================
    // PUT: api/EmployeeProfile/password
    // =====================================================

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangeEmployeePasswordDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var employeeId = GetCurrentEmployeeId();

        if (employeeId == null)
        {
            return Unauthorized(new
            {
                message = "User ID not found in token."
            });
        }

        var result =
            await _employeeProfileService
                .ChangePassword(
                    employeeId.Value,
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


    // =====================================================
    // GET CURRENT EMPLOYEE ID FROM JWT
    // =====================================================

    private int? GetCurrentEmployeeId()
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
                out int employeeId))
        {
            return null;
        }

        return employeeId;
    }
}