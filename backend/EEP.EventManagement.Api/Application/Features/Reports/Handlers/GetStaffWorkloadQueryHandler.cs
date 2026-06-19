using EEP.EventManagement.Api.Application.Features.Reports.DTOs;
using EEP.EventManagement.Api.Application.Features.Reports.Queries;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Reports.Handlers
{
    public class GetStaffWorkloadQueryHandler : IRequestHandler<GetStaffWorkloadQuery, List<StaffWorkloadDto>>
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public GetStaffWorkloadQueryHandler(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<List<StaffWorkloadDto>> Handle(GetStaffWorkloadQuery request, CancellationToken cancellationToken)
        {
            // 1. Get staff users
            var staffUsers = new List<ApplicationUser>();

            if (request.StaffId.HasValue)
            {
                var user = await _userManager.FindByIdAsync(request.StaffId.Value.ToString());
                if (user != null) staffUsers.Add(user);
            }
            else
            {
                var rolesToFetch = new List<string>();
                if (string.IsNullOrEmpty(request.Role))
                {
                    rolesToFetch.Add("Expert");
                    rolesToFetch.Add("Cameraman");
                }
                else
                {
                    rolesToFetch.Add(request.Role);
                }

                foreach (var role in rolesToFetch)
                {
                    var users = await _userManager.GetUsersInRoleAsync(role);
                    staffUsers.AddRange(users);
                }

                // Remove duplicates
                staffUsers = staffUsers.GroupBy(u => u.Id).Select(g => g.First()).ToList();
            }

            var result = new List<StaffWorkloadDto>();

            // 2. Aggregate workload for each staff member
            foreach (var user in staffUsers)
            {
                var userRoles = await _userManager.GetRolesAsync(user);
                var primaryRole = userRoles.FirstOrDefault(r => r == "Expert" || r == "Cameraman") ?? "Staff";

                var query = _context.Assignments
                    .Include(a => a.Event)
                    .ThenInclude(e => e.Department)
                    .Where(a => a.EmployeeId == user.Id);

                // Apply Date Filters
                if (request.StartDate.HasValue)
                {
                    query = query.Where(a => a.Event.StartDate >= request.StartDate.Value);
                }
                if (request.EndDate.HasValue)
                {
                    query = query.Where(a => a.Event.EndDate <= request.EndDate.Value);
                }

                var assignments = await query.ToListAsync(cancellationToken);

                var workload = new StaffWorkloadDto
                {
                    StaffId = user.Id,
                    FullName = $"{user.FirstName} {user.LastName}",
                    Role = primaryRole,
                    DepartmentName = "Communication", // Assuming they belong to Communication dept
                    TotalAssignments = assignments.Count,
                    ScheduledAssignments = assignments.Count(a => a.Event.Status == EventStatus.Scheduled || a.Event.Status == EventStatus.Ongoing),
                    PastAssignments = assignments.Count(a => a.Event.Status == EventStatus.Completed || a.Event.Status == EventStatus.Covered || a.Event.Status == EventStatus.Uncovered),
                    Events = assignments.Select(a => new StaffEventSummaryDto
                    {
                        AssignmentId = a.Id,
                        EventId = a.EventId,
                        Title = a.Event.Title,
                        EventPlace = a.Event.EventPlace,
                        EventDepartmentName = a.Event.Department != null ? a.Event.Department.Name : null,
                        StartDate = a.Event.StartDate,
                        EndDate = a.Event.EndDate,
                        Status = a.Event.Status.ToString(),
                        RoleInEvent = a.Role.ToString()
                    }).OrderByDescending(e => e.StartDate).ToList()
                };

                result.Add(workload);
            }

            return result.OrderByDescending(r => r.TotalAssignments).ToList();
        }
    }
}
