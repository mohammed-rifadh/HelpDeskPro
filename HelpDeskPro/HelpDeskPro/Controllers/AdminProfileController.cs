using HelpDeskPro.DTOs.Admins;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminProfileController : ControllerBase
{
    private readonly AdminProfileService _adminProfileService;

    public AdminProfileController(
        AdminProfileService adminProfileService)
    {
        _adminProfileService = adminProfileService;
    }


    // =====================================================
    // GET ADMIN PROFILE
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var profile =
            await _adminProfileService.GetAdminProfile(User);

        return Ok(profile);
    }


    // =====================================================
    // UPDATE ADMIN PROFILE
    // =====================================================

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateAdminProfileDto dto)
    {
        var profile =
            await _adminProfileService.UpdateAdminProfile(
                User,
                dto);

        return Ok(new
        {
            message = "Admin profile updated successfully.",
            profile
        });
    }


    // =====================================================
    // CHANGE ADMIN PASSWORD
    // =====================================================

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangeAdminPasswordDto dto)
    {
        await _adminProfileService.ChangePassword(
            User,
            dto);

        return Ok(new
        {
            message = "Password changed successfully."
        });
    }
}