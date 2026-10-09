using System.ComponentModel.DataAnnotations;

namespace HelpDeskPro.DTOs.Employees;

public class UpdateEmployeeProfileDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;
}