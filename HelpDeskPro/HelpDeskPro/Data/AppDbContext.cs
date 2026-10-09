namespace HelpDeskPro.Data;

using HelpDeskPro.Models;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // =====================================================
    // DATABASE TABLES
    // =====================================================

    public DbSet<User> Users => Set<User>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<TicketComment> TicketComments
        => Set<TicketComment>();

    public DbSet<TicketAssignment> TicketAssignments
        => Set<TicketAssignment>();

    public DbSet<TicketStatusHistory> TicketStatusHistories
        => Set<TicketStatusHistory>();

    // Notification System
    public DbSet<Notification> Notifications
        => Set<Notification>();


    // =====================================================
    // MODEL CONFIGURATION
    // =====================================================

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // =================================================
        // USER → ROLE
        // =================================================

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);


        // =================================================
        // TICKET → CATEGORY
        // =================================================

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Tickets)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);


        // =================================================
        // TICKET → CREATED BY USER
        // =================================================

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.CreatedBy)
            .WithMany(u => u.CreatedTickets)
            .HasForeignKey(t => t.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);


        // =================================================
        // TICKET → ASSIGNED TO USER
        // =================================================

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.AssignedTo)
            .WithMany(u => u.AssignedTickets)
            .HasForeignKey(t => t.AssignedToId)
            .OnDelete(DeleteBehavior.Restrict);


        // =================================================
        // TICKET COMMENT → TICKET
        // =================================================

        modelBuilder.Entity<TicketComment>()
            .HasOne(c => c.Ticket)
            .WithMany(t => t.Comments)
            .HasForeignKey(c => c.TicketId)
            .OnDelete(DeleteBehavior.Cascade);


        // =================================================
        // TICKET COMMENT → USER
        // =================================================

        modelBuilder.Entity<TicketComment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);


        // =================================================
        // TICKET ASSIGNMENT → TICKET
        // =================================================

        modelBuilder.Entity<TicketAssignment>()
            .HasOne(a => a.Ticket)
            .WithMany()
            .HasForeignKey(a => a.TicketId)
            .OnDelete(DeleteBehavior.Cascade);


        // =================================================
        // TICKET ASSIGNMENT → ASSIGNED TO
        // =================================================

        modelBuilder.Entity<TicketAssignment>()
            .HasOne(a => a.AssignedTo)
            .WithMany()
            .HasForeignKey(a => a.AssignedToId)
            .OnDelete(DeleteBehavior.Restrict);


        // =================================================
        // TICKET ASSIGNMENT → ASSIGNED BY
        // =================================================

        modelBuilder.Entity<TicketAssignment>()
            .HasOne(a => a.AssignedBy)
            .WithMany()
            .HasForeignKey(a => a.AssignedById)
            .OnDelete(DeleteBehavior.Restrict);


        // =================================================
        // TICKET STATUS HISTORY → TICKET
        // =================================================

        modelBuilder.Entity<TicketStatusHistory>()
            .HasOne(h => h.Ticket)
            .WithMany()
            .HasForeignKey(h => h.TicketId)
            .OnDelete(DeleteBehavior.Cascade);


        // =================================================
        // TICKET STATUS HISTORY → USER
        // =================================================

        modelBuilder.Entity<TicketStatusHistory>()
            .HasOne(h => h.ChangedBy)
            .WithMany()
            .HasForeignKey(h => h.ChangedById)
            .OnDelete(DeleteBehavior.Restrict);


        // =================================================
        // NOTIFICATION → USER
        // =================================================

        modelBuilder.Entity<Notification>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // =================================================
        // UNIQUE USER EMAIL
        // =================================================

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();


        // =================================================
        // UNIQUE TICKET NUMBER
        // =================================================

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.TicketNumber)
            .IsUnique();
    }
}