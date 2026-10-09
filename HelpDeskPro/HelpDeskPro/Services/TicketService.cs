namespace HelpDeskPro.Services;

using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Tickets;
using HelpDeskPro.Models;
using Microsoft.EntityFrameworkCore;

public class TicketService
{
    private readonly AppDbContext _context;
    private readonly TicketStatusHistoryService _statusHistoryService;
    private readonly NotificationService _notificationService;

    public TicketService(
        AppDbContext context,
        TicketStatusHistoryService statusHistoryService,
        NotificationService notificationService)
    {
        _context = context;
        _statusHistoryService = statusHistoryService;
        _notificationService = notificationService;
    }


    // =========================================================
    // CREATE TICKET
    // =========================================================
    public async Task<TicketDto> CreateTicket(
        CreateTicketDto dto,
        int userId)
    {
        // -----------------------------------------------------
        // Validate Category
        // -----------------------------------------------------

        var category = await _context.Categories
            .FirstOrDefaultAsync(c =>
                c.Id == dto.CategoryId &&
                c.IsActive);

        if (category == null)
        {
            throw new Exception(
                "Invalid or inactive category.");
        }


        // -----------------------------------------------------
        // Validate Priority
        // -----------------------------------------------------

        var validPriorities = new[]
        {
            "Low",
            "Medium",
            "High",
            "Critical"
        };

        if (!validPriorities.Contains(dto.Priority))
        {
            throw new Exception(
                "Invalid priority.");
        }


        // -----------------------------------------------------
        // Generate Ticket Number
        // -----------------------------------------------------

        var ticketNumber =
            $"HD-{DateTime.UtcNow:yyyyMMddHHmmssfff}";


        // -----------------------------------------------------
        // Create Ticket
        // -----------------------------------------------------

        var ticket = new Ticket
        {
            TicketNumber = ticketNumber,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = "Open",
            CategoryId = dto.CategoryId,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tickets.Add(ticket);

        await _context.SaveChangesAsync();


        // -----------------------------------------------------
        // Return Created Ticket
        // -----------------------------------------------------

        return await GetTicketByIdInternal(ticket.Id)
            ?? throw new Exception(
                "Ticket creation failed.");
    }


    // =========================================================
    // GET TICKET BY ID - SECURE
    // =========================================================
    public async Task<TicketDto?> GetTicketById(
        int id,
        int userId,
        string role)
    {
        var query = _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .AsQueryable();


        // -----------------------------------------------------
        // ADMIN
        // -----------------------------------------------------

        if (role == "Admin")
        {
            // Admin can view any ticket
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


        // -----------------------------------------------------
        // Get Ticket
        // -----------------------------------------------------

        return await query
            .Where(t => t.Id == id)
            .Select(t => new TicketDto
            {
                Id = t.Id,

                TicketNumber = t.TicketNumber,

                Title = t.Title,

                Description = t.Description,

                Priority = t.Priority,

                Status = t.Status,

                CategoryId = t.CategoryId,

                Category = t.Category!.Name,

                CreatedById = t.CreatedById,

                CreatedBy = t.CreatedBy!.FullName,

                AssignedToId = t.AssignedToId,

                AssignedTo = t.AssignedTo != null
                    ? t.AssignedTo.FullName
                    : null,

                CreatedAt = t.CreatedAt,

                UpdatedAt = t.UpdatedAt,

                ResolvedAt = t.ResolvedAt
            })
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // INTERNAL GET TICKET BY ID
    // =========================================================
    private async Task<TicketDto?> GetTicketByIdInternal(
        int id)
    {
        return await _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Where(t => t.Id == id)
            .Select(t => new TicketDto
            {
                Id = t.Id,

                TicketNumber = t.TicketNumber,

                Title = t.Title,

                Description = t.Description,

                Priority = t.Priority,

                Status = t.Status,

                CategoryId = t.CategoryId,

                Category = t.Category!.Name,

                CreatedById = t.CreatedById,

                CreatedBy = t.CreatedBy!.FullName,

                AssignedToId = t.AssignedToId,

                AssignedTo = t.AssignedTo != null
                    ? t.AssignedTo.FullName
                    : null,

                CreatedAt = t.CreatedAt,

                UpdatedAt = t.UpdatedAt,

                ResolvedAt = t.ResolvedAt
            })
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // GET ALL TICKETS
    // =========================================================
    public async Task<List<TicketDto>> GetAllTickets(
        int userId,
        string role)
    {
        var query = _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .AsQueryable();


        if (role == "Admin")
        {
            // Admin can see all tickets
        }

        else if (role == "Agent")
        {
            query = query.Where(t =>
                t.AssignedToId == userId);
        }

        else
        {
            throw new Exception(
                "You do not have permission to view all tickets.");
        }


        return await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TicketDto
            {
                Id = t.Id,

                TicketNumber = t.TicketNumber,

                Title = t.Title,

                Description = t.Description,

                Priority = t.Priority,

                Status = t.Status,

                CategoryId = t.CategoryId,

                Category = t.Category!.Name,

                CreatedById = t.CreatedById,

                CreatedBy = t.CreatedBy!.FullName,

                AssignedToId = t.AssignedToId,

                AssignedTo = t.AssignedTo != null
                    ? t.AssignedTo.FullName
                    : null,

                CreatedAt = t.CreatedAt,

                UpdatedAt = t.UpdatedAt,

                ResolvedAt = t.ResolvedAt
            })
            .ToListAsync();
    }


    // =========================================================
    // GET MY TICKETS
    // =========================================================
    public async Task<List<TicketDto>> GetMyTickets(
        int userId)
    {
        return await _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Where(t => t.CreatedById == userId)
            .Select(t => new TicketDto
            {
                Id = t.Id,

                TicketNumber = t.TicketNumber,

                Title = t.Title,

                Description = t.Description,

                Priority = t.Priority,

                Status = t.Status,

                CategoryId = t.CategoryId,

                Category = t.Category!.Name,

                CreatedById = t.CreatedById,

                CreatedBy = t.CreatedBy!.FullName,

                AssignedToId = t.AssignedToId,

                AssignedTo = t.AssignedTo != null
                    ? t.AssignedTo.FullName
                    : null,

                CreatedAt = t.CreatedAt,

                UpdatedAt = t.UpdatedAt,

                ResolvedAt = t.ResolvedAt
            })
            .ToListAsync();
    }


    // =========================================================
    // ASSIGN TICKET
    // =========================================================
    public async Task<TicketDto> AssignTicket(
        int ticketId,
        int assignedToId,
        int assignedById)
    {
        // -----------------------------------------------------
        // Find Ticket
        // -----------------------------------------------------

        var ticket = await _context.Tickets
            .FirstOrDefaultAsync(t =>
                t.Id == ticketId);

        if (ticket == null)
        {
            throw new Exception(
                "Ticket not found.");
        }


        // -----------------------------------------------------
        // Check Target Agent
        // -----------------------------------------------------

        var agent = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == assignedToId &&
                u.IsActive);

        if (agent == null)
        {
            throw new Exception(
                "Agent not found or inactive.");
        }


        // -----------------------------------------------------
        // Check Target User Role
        // -----------------------------------------------------

        if (agent.Role == null ||
            agent.Role.Name != "Agent")
        {
            throw new Exception(
                "Selected user is not an Agent.");
        }


        // -----------------------------------------------------
        // Check Assigning User
        // -----------------------------------------------------

        var assigningUser = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == assignedById);

        if (assigningUser == null)
        {
            throw new Exception(
                "Assigning user not found.");
        }


        // -----------------------------------------------------
        // Prevent Assignment of Resolved or Closed Tickets
        // -----------------------------------------------------

        if (ticket.Status == "Resolved" ||
            ticket.Status == "Closed")
        {
            throw new Exception(
                "Resolved or closed tickets cannot be assigned.");
        }


        // -----------------------------------------------------
        // Save Old Status
        // -----------------------------------------------------

        var oldStatus = ticket.Status;


        // -----------------------------------------------------
        // Assign Ticket
        // -----------------------------------------------------

        ticket.AssignedToId = assignedToId;

        ticket.Status = "Assigned";

        ticket.UpdatedAt = DateTime.UtcNow;


        // -----------------------------------------------------
        // Create Assignment History
        // -----------------------------------------------------

        var assignment = new TicketAssignment
        {
            TicketId = ticketId,

            AssignedToId = assignedToId,

            AssignedById = assignedById,

            AssignedAt = DateTime.UtcNow
        };

        _context.TicketAssignments.Add(assignment);

        await _context.SaveChangesAsync();


        // -----------------------------------------------------
        // Create Status History
        // -----------------------------------------------------

        if (oldStatus != ticket.Status)
        {
            await _statusHistoryService.AddStatusHistory(
                ticket.Id,
                oldStatus,
                ticket.Status,
                assignedById);
        }


        // =====================================================
        // REAL-TIME NOTIFICATIONS
        // =====================================================

        // -----------------------------------------------------
        // Employee Notification
        // -----------------------------------------------------

        await _notificationService.CreateNotification(
            ticket.CreatedById,

            "Ticket Assigned",

            $"Your ticket {ticket.TicketNumber} has been assigned to {agent.FullName}.",

            "TicketAssigned",

            ticket.Id
        );


        // -----------------------------------------------------
        // Agent Notification
        // -----------------------------------------------------

        await _notificationService.CreateNotification(
            assignedToId,

            "New Ticket Assigned",

            $"Ticket {ticket.TicketNumber} has been assigned to you.",

            "TicketAssigned",

            ticket.Id
        );


        // -----------------------------------------------------
        // Return Ticket
        // -----------------------------------------------------

        return await GetTicketByIdInternal(ticketId)
            ?? throw new Exception(
                "Ticket not found.");
    }


    // =========================================================
    // UPDATE TICKET
    // =========================================================
    public async Task<TicketDto> UpdateTicket(
        int ticketId,
        UpdateTicketDto dto,
        int changedById,
        string role)
    {
        // =====================================================
        // GET TICKET
        // =====================================================

        var ticket = await _context.Tickets
            .FirstOrDefaultAsync(t =>
                t.Id == ticketId);

        if (ticket == null)
        {
            throw new Exception(
                "Ticket not found.");
        }


        // =====================================================
        // UPDATE PERMISSION
        // =====================================================

        // ADMIN
        if (role == "Admin")
        {
        }

        // AGENT
        else if (role == "Agent")
        {
            if (ticket.AssignedToId != changedById)
            {
                throw new Exception(
                    "You can only update tickets assigned to you.");
            }
        }

        // OTHER ROLES
        else
        {
            throw new Exception(
                "You do not have permission to update this ticket.");
        }


        // =====================================================
        // SAVE OLD STATUS
        // =====================================================

        var oldStatus = ticket.Status;


        // =====================================================
        // VALIDATE PRIORITY
        // =====================================================

        var validPriorities =
            new[]
            {
                "Low",
                "Medium",
                "High",
                "Critical"
            };

        if (!validPriorities.Contains(dto.Priority))
        {
            throw new Exception(
                "Invalid priority.");
        }


        // =====================================================
        // VALIDATE STATUS
        // =====================================================

        var validStatuses =
            new[]
            {
                "Assigned",
                "In Progress",
                "Resolved"
            };

        if (!validStatuses.Contains(dto.Status))
        {
            throw new Exception(
                "Status can only be Assigned, In Progress, or Resolved when updating a ticket.");
        }


        // =====================================================
        // STATUS WORKFLOW
        // =====================================================

        // OPEN → ASSIGNED

        if (ticket.Status == "Open" &&
            dto.Status != "Assigned")
        {
            throw new Exception(
                "Open tickets must be assigned first.");
        }


        // ASSIGNED → IN PROGRESS

        if (ticket.Status == "Assigned" &&
            dto.Status != "In Progress")
        {
            throw new Exception(
                "Assigned tickets must move to In Progress.");
        }


        // IN PROGRESS → RESOLVED

        if (ticket.Status == "In Progress" &&
            dto.Status != "Resolved")
        {
            throw new Exception(
                "In Progress tickets must move to Resolved.");
        }


        // RESOLVED CANNOT BE UPDATED

        if (ticket.Status == "Resolved")
        {
            throw new Exception(
                "Resolved tickets cannot be updated.");
        }


        // CLOSED CANNOT BE UPDATED

        if (ticket.Status == "Closed")
        {
            throw new Exception(
                "Closed tickets cannot be updated.");
        }


        // =====================================================
        // UPDATE TICKET
        // =====================================================

        ticket.Priority = dto.Priority;

        ticket.Status = dto.Status;

        ticket.UpdatedAt = DateTime.UtcNow;


        // =====================================================
        // RESOLVED DATE
        // =====================================================

        if (dto.Status == "Resolved")
        {
            ticket.ResolvedAt = DateTime.UtcNow;
        }
        else
        {
            ticket.ResolvedAt = null;
        }


        // =====================================================
        // SAVE TICKET
        // =====================================================

        await _context.SaveChangesAsync();


        // =====================================================
        // ADD STATUS HISTORY
        // =====================================================

        if (oldStatus != ticket.Status)
        {
            await _statusHistoryService.AddStatusHistory(
                ticket.Id,
                oldStatus,
                ticket.Status,
                changedById);
        }


        // =====================================================
        // RESOLVED NOTIFICATION
        // =====================================================

        if (ticket.Status == "Resolved" &&
            oldStatus != "Resolved")
        {
            await _notificationService.CreateNotification(
                ticket.CreatedById,

                "Ticket Resolved",

                $"Your ticket {ticket.TicketNumber} has been resolved.",

                "TicketResolved",

                ticket.Id
            );
        }


        // =====================================================
        // RETURN UPDATED TICKET
        // =====================================================

        return await GetTicketByIdInternal(ticketId)
            ?? throw new Exception(
                "Ticket not found.");
    }


    // =========================================================
    // CLOSE TICKET
    // =========================================================
    public async Task<TicketDto> CloseTicket(
        int ticketId,
        int userId)
    {
        // -----------------------------------------------------
        // Find Ticket
        // -----------------------------------------------------

        var ticket = await _context.Tickets
            .FirstOrDefaultAsync(t =>
                t.Id == ticketId);

        if (ticket == null)
        {
            throw new Exception(
                "Ticket not found.");
        }


        // -----------------------------------------------------
        // Check Ticket Owner
        // -----------------------------------------------------

        if (ticket.CreatedById != userId)
        {
            throw new Exception(
                "You can only close tickets that you created.");
        }


        // -----------------------------------------------------
        // Only Resolved Tickets Can Be Closed
        // -----------------------------------------------------

        if (ticket.Status != "Resolved")
        {
            throw new Exception(
                "Only resolved tickets can be closed.");
        }


        // -----------------------------------------------------
        // Save Old Status
        // -----------------------------------------------------

        var oldStatus = ticket.Status;


        // -----------------------------------------------------
        // Close Ticket
        // -----------------------------------------------------

        ticket.Status = "Closed";

        ticket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();


        // -----------------------------------------------------
        // Create Status History
        // -----------------------------------------------------

        await _statusHistoryService.AddStatusHistory(
            ticket.Id,
            oldStatus,
            ticket.Status,
            userId);


        // =====================================================
        // CLOSED NOTIFICATION
        // =====================================================

        await _notificationService.CreateNotification(
            ticket.CreatedById,

            "Ticket Closed",

            $"Your ticket {ticket.TicketNumber} has been closed.",

            "TicketClosed",

            ticket.Id
        );


        // -----------------------------------------------------
        // Return Updated Ticket
        // -----------------------------------------------------

        return await GetTicketByIdInternal(ticketId)
            ?? throw new Exception(
                "Ticket not found.");
    }


    // =========================================================
    // GET ASSIGNMENT HISTORY
    // =========================================================
    public async Task<List<TicketAssignmentDto>> GetAssignmentHistory(
        int ticketId,
        int userId,
        string role)
    {
        // -----------------------------------------------------
        // Check whether the ticket exists
        // -----------------------------------------------------

        var ticket = await _context.Tickets
            .FirstOrDefaultAsync(t =>
                t.Id == ticketId);

        if (ticket == null)
        {
            throw new Exception(
                "Ticket not found.");
        }


        // -----------------------------------------------------
        // Role-based access
        // -----------------------------------------------------

        if (role == "Admin")
        {
            // Admin can view any ticket's assignment history
        }

        else if (role == "Agent")
        {
            if (ticket.AssignedToId != userId)
            {
                throw new Exception(
                    "You can only view assignment history for tickets assigned to you.");
            }
        }

        else
        {
            throw new Exception(
                "You do not have permission to view assignment history.");
        }


        // -----------------------------------------------------
        // Get Assignment History
        // -----------------------------------------------------

        return await _context.TicketAssignments
            .Include(a => a.AssignedTo)
            .Include(a => a.AssignedBy)
            .Where(a => a.TicketId == ticketId)
            .OrderBy(a => a.AssignedAt)
            .Select(a => new TicketAssignmentDto
            {
                Id = a.Id,

                TicketId = a.TicketId,

                AssignedToId = a.AssignedToId,

                AssignedTo = a.AssignedTo!.FullName,

                AssignedById = a.AssignedById,

                AssignedBy = a.AssignedBy!.FullName,

                AssignedAt = a.AssignedAt
            })
            .ToListAsync();
    }


    // =========================================================
    // SEARCH AND FILTER TICKETS
    // =========================================================
    public async Task<List<TicketDto>> SearchTickets(
        TicketFilterDto filter,
        int userId,
        string role)
    {
        var query = _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .AsQueryable();


        // -----------------------------------------------------
        // Role-based access
        // -----------------------------------------------------

        if (role == "Admin")
        {
            // Admin can search all tickets
        }

        else if (role == "Agent")
        {
            query = query.Where(t =>
                t.AssignedToId == userId);
        }

        else
        {
            throw new Exception(
                "You do not have permission to search tickets.");
        }


        // -----------------------------------------------------
        // Search
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();

            query = query.Where(t =>
                t.TicketNumber.Contains(search) ||
                t.Title.Contains(search) ||
                t.Description.Contains(search));
        }


        // -----------------------------------------------------
        // Filter by status
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            query = query.Where(t =>
                t.Status == filter.Status);
        }


        // -----------------------------------------------------
        // Filter by priority
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Priority))
        {
            query = query.Where(t =>
                t.Priority == filter.Priority);
        }


        // -----------------------------------------------------
        // Filter by category
        // -----------------------------------------------------

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(t =>
                t.CategoryId == filter.CategoryId.Value);
        }


        // -----------------------------------------------------
        // Filter by assigned agent
        // -----------------------------------------------------

        if (filter.AssignedToId.HasValue)
        {
            query = query.Where(t =>
                t.AssignedToId == filter.AssignedToId.Value);
        }


        // -----------------------------------------------------
        // Return Search Results
        // -----------------------------------------------------

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TicketDto
            {
                Id = t.Id,

                TicketNumber = t.TicketNumber,

                Title = t.Title,

                Description = t.Description,

                Priority = t.Priority,

                Status = t.Status,

                CategoryId = t.CategoryId,

                Category = t.Category!.Name,

                CreatedById = t.CreatedById,

                CreatedBy = t.CreatedBy!.FullName,

                AssignedToId = t.AssignedToId,

                AssignedTo = t.AssignedTo != null
                    ? t.AssignedTo.FullName
                    : null,

                CreatedAt = t.CreatedAt,

                UpdatedAt = t.UpdatedAt,

                ResolvedAt = t.ResolvedAt
            })
            .ToListAsync();
    }
}