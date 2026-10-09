using System.ComponentModel.DataAnnotations;

namespace HelpDeskPro.DTOs.Tickets;

public class UpdateTicketDto
{
    [Required(ErrorMessage = "Priority is required.")]
    [RegularExpression(
        "^(Low|Medium|High|Critical)$",
        ErrorMessage = "Priority must be Low, Medium, High, or Critical.")]
    public string Priority { get; set; } = string.Empty;

    [Required(ErrorMessage = "Status is required.")]
    [RegularExpression(
        "^(Open|Assigned|In Progress|Resolved|Closed)$",
        ErrorMessage = "Status must be Open, Assigned, In Progress, Resolved, or Closed.")]
    public string Status { get; set; } = string.Empty;

}
