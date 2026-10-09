using System.ComponentModel.DataAnnotations;

namespace HelpDeskPro.DTOs.Tickets;

public class CreateTicketDto
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(150, MinimumLength = 3,
        ErrorMessage = "Title must be between 3 and 150 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(2000, MinimumLength = 10,
        ErrorMessage = "Description must be between 10 and 2000 characters.")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Priority is required.")]
    [RegularExpression(
        "^(Low|Medium|High|Critical)$",
        ErrorMessage = "Priority must be Low, Medium, High, or Critical.")]
    public string Priority { get; set; } = "Medium";

    [Range(1, int.MaxValue,
        ErrorMessage = "A valid category must be selected.")]
    public int CategoryId { get; set; }

}
