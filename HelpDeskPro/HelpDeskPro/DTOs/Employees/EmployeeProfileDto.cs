namespace HelpDeskPro.DTOs.Employees;

public class EmployeeProfileDto
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = "Employee";

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    // Ticket Statistics
    public int TotalTickets { get; set; }

    public int OpenTickets { get; set; }

    public int InProgressTickets { get; set; }

    public int ResolvedTickets { get; set; }

    public int ClosedTickets { get; set; }
}