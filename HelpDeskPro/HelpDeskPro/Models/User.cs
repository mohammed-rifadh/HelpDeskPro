using System.Data;
using System.Net.Sockets;

namespace HelpDeskPro.Models;

public class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public int RoleId { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Role? Role { get; set; }

    public ICollection<Ticket> CreatedTickets { get; set; }
        = new List<Ticket>();

    public ICollection<Ticket> AssignedTickets { get; set; }
        = new List<Ticket>();

    public ICollection<TicketComment> Comments { get; set; }
        = new List<TicketComment>();

}
