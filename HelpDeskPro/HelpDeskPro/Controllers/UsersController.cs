namespace HelpDeskPro.Controllers;

using HelpDeskPro.DTOs.Users;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    // GET: api/Users
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsers();

        return Ok(users);
    }

    // GET: api/Users/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _userService.GetUserById(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }

    // POST: api/Users
    [HttpPost]
    public async Task<IActionResult> CreateUser(CreateUserDto dto)
    {
        try
        {
            var user = await _userService.CreateUser(dto);

            return CreatedAtAction(
                nameof(GetUserById),
                new { id = user.Id },
                user
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

    // PATCH: api/Users/1/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ToggleUserStatus(int id)
    {
        var result = await _userService.ToggleUserStatus(id);

        if (!result)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(new
        {
            message = "User status updated successfully."
        });
    }

}
