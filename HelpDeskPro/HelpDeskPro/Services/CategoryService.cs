using HelpDeskPro.Data;
using HelpDeskPro.DTOs.Categories;
using HelpDeskPro.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskPro.Services;

public class CategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    // Get all categories
    public async Task<List<CategoryDto>> GetAllCategories()
    {
        return await _context.Categories
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive
            })
            .ToListAsync();
    }

    // Get category by ID
    public async Task<CategoryDto?> GetCategoryById(int id)
    {
        return await _context.Categories
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive
            })
            .FirstOrDefaultAsync();
    }

    // Create category
    public async Task<CategoryDto> CreateCategory(
        CreateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new Exception("Category name is required.");
        }

        var existingCategory = await _context.Categories
            .FirstOrDefaultAsync(c =>
                c.Name.ToLower() == dto.Name.Trim().ToLower());

        if (existingCategory != null)
        {
            throw new Exception(
                "Category with this name already exists.");
        }

        var category = new Category
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            IsActive = true
        };

        _context.Categories.Add(category);

        await _context.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive
        };
    }

    // Toggle category status
    public async Task<bool> ToggleCategoryStatus(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return false;
        }

        category.IsActive = !category.IsActive;

        await _context.SaveChangesAsync();

        return true;
    }

}
