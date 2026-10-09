using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Dashboard;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class DashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummary()
    {
        var totalTickets = await _context.Tickets.CountAsync();

        var openTickets = await _context.Tickets
            .CountAsync(t => t.Status == "Open");

        var assignedTickets = await _context.Tickets
            .CountAsync(t => t.Status == "Assigned");

        var inProgressTickets = await _context.Tickets
            .CountAsync(t => t.Status == "In Progress");

        var resolvedTickets = await _context.Tickets
            .CountAsync(t => t.Status == "Resolved");

        var closedTickets = await _context.Tickets
            .CountAsync(t => t.Status == "Closed");

        var criticalTickets = await _context.Tickets
            .CountAsync(t => t.Priority == "Critical");

        var highPriorityTickets = await _context.Tickets
            .CountAsync(t => t.Priority == "High");

        var totalEmployees = await _context.Users
            .CountAsync(u =>
                u.Role != null &&
                u.Role.Name == "Employee" &&
                u.IsActive);

        var totalAgents = await _context.Users
            .CountAsync(u =>
                u.Role != null &&
                u.Role.Name == "Agent" &&
                u.IsActive);

        return new DashboardSummaryDto
        {
            TotalTickets = totalTickets,
            OpenTickets = openTickets,
            AssignedTickets = assignedTickets,
            InProgressTickets = inProgressTickets,
            ResolvedTickets = resolvedTickets,
            ClosedTickets = closedTickets,
            CriticalTickets = criticalTickets,
            HighPriorityTickets = highPriorityTickets,
            TotalEmployees = totalEmployees,
            TotalAgents = totalAgents
        };
    }


    public async Task<List<CategoryTicketCountDto>> GetTicketsByCategory()
    {
        return await _context.Tickets
            .GroupBy(t => new
            {
                t.CategoryId,
                CategoryName = t.Category!.Name
            })
            .Select(g => new CategoryTicketCountDto
            {
                CategoryId = g.Key.CategoryId,
                Category = g.Key.CategoryName,
                TicketCount = g.Count()
            })
            .OrderByDescending(x => x.TicketCount)
            .ToListAsync();
    }

    public async Task<List<PriorityTicketCountDto>> GetTicketsByPriority()
    {
        return await _context.Tickets
            .GroupBy(t => t.Priority)
            .Select(g => new PriorityTicketCountDto
            {
                Priority = g.Key,
                TicketCount = g.Count()
            })
            .OrderByDescending(x => x.TicketCount)
            .ToListAsync();
    }

    public async Task<List<AgentTicketCountDto>> GetTicketsByAgent()
    {
        return await _context.Tickets
            .Where(t => t.AssignedToId != null)
            .GroupBy(t => new
            {
                AgentId = t.AssignedToId!.Value,
                AgentName = t.AssignedTo!.FullName
            })
            .Select(g => new AgentTicketCountDto
            {
                AgentId = g.Key.AgentId,
                AgentName = g.Key.AgentName,
                TicketCount = g.Count()
            })
            .OrderByDescending(x => x.TicketCount)
            .ToListAsync();
    }

    public async Task<List<MonthlyTicketStatDto>> GetMonthlyTicketStatistics()
    {
        return await _context.Tickets
            .GroupBy(t => new
            {
                Year = t.CreatedAt.Year,
                Month = t.CreatedAt.Month
            })
            .Select(g => new MonthlyTicketStatDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                TicketCount = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();
    }
}
