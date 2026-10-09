using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Tickets;
using HelpDeskPro.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class TicketStatusHistoryService
{
    private readonly AppDbContext _context;

    public TicketStatusHistoryService(AppDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // CHECK TICKET ACCESS
    // =========================================================
    private async Task<Ticket?> GetAccessibleTicket(
        int ticketId,
        int userId,
        string role)
    {
        var query = _context.Tickets
            .AsQueryable();

        // -----------------------------------------------------
        // ADMIN
        // -----------------------------------------------------
        if (role == "Admin")
        {
            // Admin can access any ticket
        }

        // -----------------------------------------------------
        // AGENT
        // -----------------------------------------------------
        else if (role == "Agent")
        {
            query = query.Where(t =>
                t.AssignedToId == userId);
        }

        // -----------------------------------------------------
        // EMPLOYEE
        // -----------------------------------------------------
        else if (role == "Employee")
        {
            query = query.Where(t =>
                t.CreatedById == userId);
        }

        // -----------------------------------------------------
        // UNKNOWN ROLE
        // -----------------------------------------------------
        else
        {
            return null;
        }

        return await query
            .FirstOrDefaultAsync(t =>
                t.Id == ticketId);
    }


    // =========================================================
    // ADD STATUS HISTORY
    // =========================================================
    // This method is used internally by TicketService.
    // It does NOT perform access checking because the caller
    // has already been authorized before changing the status.
    // =========================================================
    public async Task AddStatusHistory(
        int ticketId,
        string oldStatus,
        string newStatus,
        int changedById)
    {
        var history = new TicketStatusHistory
        {
            TicketId = ticketId,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedById = changedById,
            ChangedAt = DateTime.UtcNow
        };

        _context.TicketStatusHistories.Add(history);

        await _context.SaveChangesAsync();
    }


    // =========================================================
    // GET STATUS HISTORY
    // =========================================================
    public async Task<List<TicketStatusHistoryDto>>
        GetStatusHistory(
            int ticketId,
            int userId,
            string role)
    {
        // -----------------------------------------------------
        // Check Ticket Access
        // -----------------------------------------------------
        var ticket = await GetAccessibleTicket(
            ticketId,
            userId,
            role);

        if (ticket == null)
        {
            throw new Exception(
                "Ticket not found or you do not have permission to view its status history.");
        }

        // -----------------------------------------------------
        // Get Status History
        // -----------------------------------------------------
        return await _context.TicketStatusHistories
            .Include(h => h.ChangedBy)
            .Where(h => h.TicketId == ticketId)
            .OrderBy(h => h.ChangedAt)
            .Select(h => new TicketStatusHistoryDto
            {
                Id = h.Id,

                TicketId = h.TicketId,

                OldStatus = h.OldStatus,

                NewStatus = h.NewStatus,

                ChangedById = h.ChangedById,

                ChangedBy = h.ChangedBy!.FullName,

                ChangedAt = h.ChangedAt
            })
            .ToListAsync();
    }

}
