using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Models;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskDbContext _context;
        private readonly ILogger<TasksController> _logger;

        public TasksController(TaskDbContext context, ILogger<TasksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all tasks with optional filtering by status
        /// </summary>
        /// <param name="status">Filter by task status (Pending, InProgress, Completed, Cancelled)</param>
        /// <returns>List of tasks</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetTasks([FromQuery] Models.TaskStatus? status = null)
        {
            try
            {
                var query = _context.Tasks.AsQueryable();

                if (status.HasValue)
                {
                    query = query.Where(t => t.Status == status.Value);
                }

                var tasks = await query
                    .OrderBy(t => t.DueDate)
                    .Select(t => new TaskResponseDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Description = t.Description,
                        DueDate = t.DueDate,
                        Status = t.Status,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving tasks");
                return StatusCode(500, "An error occurred while retrieving tasks");
            }
        }

        /// <summary>
        /// Get a specific task by ID
        /// </summary>
        /// <param name="id">Task ID</param>
        /// <returns>Task details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskResponseDto>> GetTask(int id)
        {
            try
            {
                var task = await _context.Tasks
                    .Where(t => t.Id == id)
                    .Select(t => new TaskResponseDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Description = t.Description,
                        DueDate = t.DueDate,
                        Status = t.Status,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                if (task == null)
                {
                    return NotFound($"Task with ID {id} not found");
                }

                return Ok(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving task with ID {TaskId}", id);
                return StatusCode(500, "An error occurred while retrieving the task");
            }
        }

        /// <summary>
        /// Create a new task
        /// </summary>
        /// <param name="createTaskDto">Task creation data</param>
        /// <returns>Created task</returns>
        [HttpPost]
        public async Task<ActionResult<TaskResponseDto>> CreateTask([FromBody] CreateTaskDto createTaskDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var task = new Models.Task
                {
                    Title = createTaskDto.Title,
                    Description = createTaskDto.Description,
                    DueDate = createTaskDto.DueDate,
                    Status = createTaskDto.Status,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                var responseDto = new TaskResponseDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    DueDate = task.DueDate,
                    Status = task.Status,
                    CreatedAt = task.CreatedAt,
                    UpdatedAt = task.UpdatedAt
                };

                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating task");
                return StatusCode(500, "An error occurred while creating the task");
            }
        }

        /// <summary>
        /// Update an existing task
        /// </summary>
        /// <param name="id">Task ID</param>
        /// <param name="updateTaskDto">Task update data</param>
        /// <returns>Updated task</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<TaskResponseDto>> UpdateTask(int id, [FromBody] UpdateTaskDto updateTaskDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound($"Task with ID {id} not found");
                }

                task.Title = updateTaskDto.Title;
                task.Description = updateTaskDto.Description;
                task.DueDate = updateTaskDto.DueDate;
                task.Status = updateTaskDto.Status;
                task.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var responseDto = new TaskResponseDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    DueDate = task.DueDate,
                    Status = task.Status,
                    CreatedAt = task.CreatedAt,
                    UpdatedAt = task.UpdatedAt
                };

                return Ok(responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating task with ID {TaskId}", id);
                return StatusCode(500, "An error occurred while updating the task");
            }
        }

        /// <summary>
        /// Delete a task
        /// </summary>
        /// <param name="id">Task ID</param>
        /// <returns>No content</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound($"Task with ID {id} not found");
                }

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting task with ID {TaskId}", id);
                return StatusCode(500, "An error occurred while deleting the task");
            }
        }

        /// <summary>
        /// Get task statistics
        /// </summary>
        /// <returns>Task statistics</returns>
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetTaskStatistics()
        {
            try
            {
                var totalTasks = await _context.Tasks.CountAsync();
                var pendingTasks = await _context.Tasks.CountAsync(t => t.Status == Models.TaskStatus.Pending);
                var inProgressTasks = await _context.Tasks.CountAsync(t => t.Status == Models.TaskStatus.InProgress);
                var completedTasks = await _context.Tasks.CountAsync(t => t.Status == Models.TaskStatus.Completed);
                var cancelledTasks = await _context.Tasks.CountAsync(t => t.Status == Models.TaskStatus.Cancelled);

                var overdueTasks = await _context.Tasks.CountAsync(t => t.DueDate < DateTime.UtcNow && t.Status != Models.TaskStatus.Completed);

                return Ok(new
                {
                    Total = totalTasks,
                    Pending = pendingTasks,
                    InProgress = inProgressTasks,
                    Completed = completedTasks,
                    Cancelled = cancelledTasks,
                    Overdue = overdueTasks
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving task statistics");
                return StatusCode(500, "An error occurred while retrieving task statistics");
            }
        }
    }
}
