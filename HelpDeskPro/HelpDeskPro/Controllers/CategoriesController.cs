using HelpDeskPro.DTOs.Categories;
using HelpDeskPro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskPro.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _categoryService;

    public CategoriesController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    // =====================================================
    // GET: api/Categories
    // Admin, Agent and Employee can view categories
    // =====================================================

    [HttpGet]
    [Authorize(Roles = "Admin,Agent,Employee")]
    public async Task<IActionResult> GetAllCategories()
    {
        var categories =
            await _categoryService.GetAllCategories();

        return Ok(categories);
    }

    // =====================================================
    // GET: api/Categories/{id}
    // Admin, Agent and Employee can view a category
    // =====================================================

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Agent,Employee")]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        var category =
            await _categoryService.GetCategoryById(id);

        if (category == null)
        {
            return NotFound(new
            {
                message = "Category not found."
            });
        }

        return Ok(category);
    }

    // =====================================================
    // POST: api/Categories
    // Admin only
    // =====================================================

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCategory(
        CreateCategoryDto dto)
    {
        try
        {
            var category =
                await _categoryService.CreateCategory(dto);

            return CreatedAtAction(
                nameof(GetCategoryById),
                new { id = category.Id },
                category
            );
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =====================================================
    // PATCH: api/Categories/{id}/status
    // Admin only
    // =====================================================

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleCategoryStatus(
        int id)
    {
        var result =
            await _categoryService.ToggleCategoryStatus(id);

        if (!result)
        {
            return NotFound(new
            {
                message = "Category not found."
            });
        }

        return Ok(new
        {
            message =
                "Category status updated successfully."
        });
    }
}