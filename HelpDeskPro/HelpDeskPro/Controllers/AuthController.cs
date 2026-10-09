using HelpDeskPro.DTOs.Auth;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Mvc;
namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            var result = await _authService.Register(dto);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        try
        {
            var result = await _authService.Login(dto);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

}
