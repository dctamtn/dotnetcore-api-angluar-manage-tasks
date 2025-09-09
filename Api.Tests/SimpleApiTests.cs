using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Api.Data;
using Api.Models;
using Xunit;
using TaskNameSpace = System.Threading.Tasks.Task;

namespace Api.Tests
{
    public class SimpleApiTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public SimpleApiTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove the existing DbContext registration
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<TaskDbContext>));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Add InMemory database for testing
                    services.AddDbContext<TaskDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("SimpleTestDb");
                    });
                });
            });

            _client = _factory.CreateClient();
        }

        [Fact]
        public async TaskNameSpace GetTasks_ShouldReturnAllTasks()
        {
            // Act
            var response = await _client.GetAsync("/api/tasks");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async TaskNameSpace GetTasks_WithStatusFilter_ShouldReturnFilteredTasks()
        {
            // Act
            var response = await _client.GetAsync("/api/tasks?status=Pending");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async TaskNameSpace GetTask_WithValidId_ShouldReturnTask()
        {
            // Arrange - First create a task
            var createTaskDto = new CreateTaskDto
            {
                Title = "Test Task for Get",
                Description = "Test Description",
                DueDate = DateTime.UtcNow.AddDays(7),
                Status = Api.Models.TaskStatus.Pending
            };

            var createResponse = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            
            var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskResponseDto>();
            var taskId = createdTask!.Id;

            // Act
            var response = await _client.GetAsync($"/api/tasks/{taskId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async TaskNameSpace GetTask_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var taskId = 999;

            // Act
            var response = await _client.GetAsync($"/api/tasks/{taskId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async TaskNameSpace CreateTask_WithValidData_ShouldCreateTask()
        {
            // Arrange
            var createTaskDto = new CreateTaskDto
            {
                Title = "Test Task",
                Description = "Test Description",
                DueDate = DateTime.UtcNow.AddDays(7),
                Status = Api.Models.TaskStatus.Pending
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async TaskNameSpace CreateTask_WithInvalidData_ShouldReturnBadRequest()
        {
            // Arrange
            var createTaskDto = new CreateTaskDto
            {
                Title = "", // Invalid: empty title
                Description = "Test Description",
                DueDate = DateTime.UtcNow.AddDays(-1), // Invalid: past date
                Status = Api.Models.TaskStatus.Pending
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async TaskNameSpace UpdateTask_WithValidData_ShouldUpdateTask()
        {
            // Arrange - First create a task
            var createTaskDto = new CreateTaskDto
            {
                Title = "Test Task for Update",
                Description = "Test Description",
                DueDate = DateTime.UtcNow.AddDays(7),
                Status = Api.Models.TaskStatus.Pending
            };

            var createResponse = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            
            var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskResponseDto>();
            var taskId = createdTask!.Id;

            var updateTaskDto = new UpdateTaskDto
            {
                Title = "Updated Task Title",
                Description = "Updated Description",
                DueDate = DateTime.UtcNow.AddDays(10),
                Status = Api.Models.TaskStatus.InProgress
            };

            // Act
            var response = await _client.PutAsJsonAsync($"/api/tasks/{taskId}", updateTaskDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async TaskNameSpace DeleteTask_WithValidId_ShouldDeleteTask()
        {
            // Arrange
            var taskId = 1;

            // Act
            var response = await _client.DeleteAsync($"/api/tasks/{taskId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }

        [Fact]
        public async TaskNameSpace GetTaskStatistics_ShouldReturnStatistics()
        {
            // Act
            var response = await _client.GetAsync("/api/tasks/statistics");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }

        [Theory]
        [InlineData("Pending")]
        [InlineData("InProgress")]
        [InlineData("Completed")]
        [InlineData("Cancelled")]
        public async TaskNameSpace GetTasks_WithDifferentStatusFilters_ShouldReturnCorrectTasks(string status)
        {
            // Act
            var response = await _client.GetAsync($"/api/tasks?status={status}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }
    }
}
