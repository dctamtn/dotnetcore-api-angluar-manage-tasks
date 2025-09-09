using System.ComponentModel.DataAnnotations;

namespace Api.Models
{
    public class CreateTaskDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Due date is required")]
        [FutureDate(ErrorMessage = "Due date must be in the future")]
        public DateTime DueDate { get; set; }

        public TaskStatus Status { get; set; } = TaskStatus.Pending;
    }

    public class UpdateTaskDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Due date is required")]
        [FutureDate(ErrorMessage = "Due date must be in the future")]
        public DateTime DueDate { get; set; }

        public TaskStatus Status { get; set; }
    }

    public class TaskResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public TaskStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
