namespace HelpDeskPro.DTOs.Agents;

public class AgentProfileDto
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    // Performance
    public int AssignedTickets { get; set; }

    public int InProgressTickets { get; set; }

    public int ResolvedTickets { get; set; }

    public int ClosedTickets { get; set; }

    public double ResolutionRate { get; set; }
}