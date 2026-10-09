namespace HelpDeskPro.DTOs.Admins;

public class AdminProfileDto
{
    // =====================================================
    // ADMIN INFORMATION
    // =====================================================

    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }


    // =====================================================
    // SYSTEM STATISTICS
    // =====================================================

    public int TotalUsers { get; set; }

    public int TotalEmployees { get; set; }

    public int TotalAgents { get; set; }

    public int TotalTickets { get; set; }
}