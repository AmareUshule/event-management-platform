using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Controllers
{
    // Request DTOs
    public record CreateCategoryRequest([Required] string Name);
    public record UpdateCategoryRequest([Required] string Name);
    public record CreateSubCategoryRequest([Required] string Name);
    public record UpdateSubCategoryRequest([Required] string Name);

    [ApiController]
    [Route("api/media-categories")]
    [Authorize]
    public class MediaCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MediaCategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET all top-level categories with thumbnails
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<object>>> GetCategories()
        {
            var cats = await _context.MediaCategories
                .OrderBy(c => c.Name)
                .Select(c => new {
                    id = c.Id,
                    name = c.Name,
                    thumbnailUrl = _context.MediaFiles
                        .Where(mf => mf.MediaSubCategory.MediaCategoryId == c.Id && mf.FileType == MediaType.Image)
                        .OrderByDescending(mf => mf.CreatedAt)
                        .Select(mf => mf.FilePath)
                        .FirstOrDefault()
                })
                .ToListAsync();
            return Ok(cats);
        }

        // GET all sub-categories for a given category with thumbnails
        [HttpGet("{id}/subcategories")]
        [AllowAnonymous]
        public async Task<ActionResult<List<object>>> GetSubCategories(Guid id)
        {
            var subs = await _context.MediaSubCategories
                .Where(s => s.MediaCategoryId == id)
                .OrderBy(s => s.Name)
                .Select(s => new {
                    id = s.Id,
                    name = s.Name,
                    mediaCategoryId = s.MediaCategoryId,
                    thumbnailUrl = _context.MediaFiles
                        .Where(mf => mf.MediaSubCategoryId == s.Id && mf.FileType == MediaType.Image)
                        .OrderByDescending(mf => mf.CreatedAt)
                        .Select(mf => mf.FilePath)
                        .FirstOrDefault()
                })
                .ToListAsync();
            return Ok(subs);
        }
        
        // POST a new top-level category (Admin only)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            if (await _context.MediaCategories.AnyAsync(c => c.Name == request.Name))
            {
                return Conflict(new { message = $"A category with the name '{request.Name}' already exists." });
            }

            var category = new MediaCategory { Name = request.Name };
            _context.MediaCategories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // POST a new sub-category (Admin only)
        [HttpPost("{id}/subcategories")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSubCategory(Guid id, [FromBody] CreateSubCategoryRequest request)
        {
            var parentCategory = await _context.MediaCategories.FindAsync(id);
            if (parentCategory == null)
            {
                return NotFound(new { message = "Parent category not found." });
            }
            
            if (await _context.MediaSubCategories.AnyAsync(sc => sc.Name == request.Name && sc.MediaCategoryId == id))
            {
                return Conflict(new { message = $"A sub-category with the name '{request.Name}' already exists in this category." });
            }

            var subCategory = new MediaSubCategory { Name = request.Name, MediaCategoryId = id };
            _context.MediaSubCategories.Add(subCategory);
            await _context.SaveChangesAsync();

            return Ok(new { id = subCategory.Id, name = subCategory.Name, mediaCategoryId = subCategory.MediaCategoryId });
        }

        // PUT to update a category's name (Admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryRequest request)
        {
            var category = await _context.MediaCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            category.Name = request.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT to update a sub-category's name (Admin only)
        [HttpPut("subcategories/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSubCategory(Guid id, [FromBody] UpdateSubCategoryRequest request)
        {
            var subCategory = await _context.MediaSubCategories.FindAsync(id);
            if (subCategory == null)
            {
                return NotFound();
            }

            subCategory.Name = request.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE a category and all its sub-categories (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var category = await _context.MediaCategories.Include(c => c.SubCategories).FirstOrDefaultAsync(c => c.Id == id);
            if (category == null)
            {
                return NotFound();
            }

            // Optional: Check if any media is using the sub-categories before deleting
            var subCategoryIds = category.SubCategories.Select(sc => sc.Id);
            var isUsed = await _context.MediaFiles.AnyAsync(mf => mf.MediaSubCategoryId.HasValue && subCategoryIds.Contains(mf.MediaSubCategoryId.Value));
            if (isUsed)
            {
                return Conflict(new { message = "Cannot delete category. One or more of its sub-categories are currently in use by media files." });
            }

            _context.MediaSubCategories.RemoveRange(category.SubCategories);
            _context.MediaCategories.Remove(category);
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE a sub-category (Admin only)
        [HttpDelete("subcategories/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSubCategory(Guid id)
        {
            var subCategory = await _context.MediaSubCategories.FindAsync(id);
            if (subCategory == null)
            {
                return NotFound();
            }

            // Optional: Check if sub-category is in use
            var isUsed = await _context.MediaFiles.AnyAsync(mf => mf.MediaSubCategoryId == id);
            if (isUsed)
            {
                return Conflict(new { message = "Cannot delete sub-category because it is currently in use by one or more media files." });
            }

            _context.MediaSubCategories.Remove(subCategory);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
