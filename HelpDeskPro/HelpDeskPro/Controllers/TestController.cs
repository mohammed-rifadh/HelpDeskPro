namespace HelpDeskPro.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("public")]
    public IActionResult Public()
    {
        return Ok("This is a public endpoint.");
    }

    [Authorize]
    [HttpGet("protected")]
    public IActionResult Protected()
    {
        return Ok("You are authenticated.");
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public IActionResult Admin()
    {
        return Ok("Welcome Admin. You have access.");
    }

    [Authorize(Roles = "Agent")]
    [HttpGet("agent")]
    public IActionResult Agent()
    {
        return Ok("Welcome Agent. You have access.");
    }

    [Authorize(Roles = "Employee")]
    [HttpGet("employee")]
    public IActionResult Employee()
    {
        return Ok("Welcome Employee. You have access.");
    }

}
