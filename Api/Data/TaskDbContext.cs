using Microsoft.EntityFrameworkCore;
using Api.Models;

namespace Api.Data
{
    public class TaskDbContext : DbContext
    {
        public TaskDbContext(DbContextOptions<TaskDbContext> options) : base(options)
        {
        }

        public DbSet<Models.Task> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Task entity
            modelBuilder.Entity<Models.Task>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.DueDate).IsRequired();
                entity.Property(e => e.Status).HasConversion<int>();
                entity.Property(e => e.CreatedAt).IsRequired();
            });

            // Seed initial data
            SeedData(modelBuilder);
        }

        private static void SeedData(ModelBuilder modelBuilder)
        {
            var tasks = new List<Models.Task>
            {
                new Models.Task
                {
                    Id = 1,
                    Title = "Complete project documentation",
                    Description = "Write comprehensive documentation for the task management API",
                    DueDate = DateTime.UtcNow.AddDays(7),
                    Status = Models.TaskStatus.Pending,
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Models.Task
                {
                    Id = 2,
                    Title = "Implement user authentication",
                    Description = "Add JWT-based authentication to the API",
                    DueDate = DateTime.UtcNow.AddDays(14),
                    Status = Models.TaskStatus.InProgress,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Models.Task
                {
                    Id = 3,
                    Title = "Write unit tests",
                    Description = "Create comprehensive unit tests for all endpoints",
                    DueDate = DateTime.UtcNow.AddDays(10),
                    Status = Models.TaskStatus.Pending,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Models.Task
                {
                    Id = 4,
                    Title = "Code review",
                    Description = "Review and refactor existing code for better maintainability",
                    DueDate = DateTime.UtcNow.AddDays(3),
                    Status = Models.TaskStatus.Completed,
                    CreatedAt = DateTime.UtcNow.AddDays(-7),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                }
            };

            modelBuilder.Entity<Models.Task>().HasData(tasks);
        }
    }
}
