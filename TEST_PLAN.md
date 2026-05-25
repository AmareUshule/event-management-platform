# Comprehensive Test Plan - Event Management Platform

## Overview
This test plan covers the system's functionality across all user roles, with a focus on:
1. **Role-Based Access Control (RBAC)**
2. **Dashboard functionality and role-specific UI elements**
3. **Event Details page functionality and role-specific actions**

---

## System Roles

The system implements the following roles:
1. **Admin** - Full system access
2. **Manager** - Department-level management (must be in a valid department)
3. **Communication Manager** - Manager role + Communication Department
4. **Expert** - Staff member (assignment-based access)
5. **Cameraman** - Staff member (assignment-based access)

---

## Test Structure

Each role testing section includes:
- **Dashboard Tests** (UI elements, buttons, stats visibility)
- **Event Details Tests** (page load, buttons, actions)

---

# TEST SCENARIOS BY ROLE

---

## ROLE 1: ADMIN

### Dashboard Tests

#### Test 1.1.1: Dashboard Loads with Admin Permissions
- **Precondition**: User logged in as Admin
- **Steps**:
  1. Navigate to dashboard
  2. Verify page loads without errors
  3. Check that hero section displays with greeting
  4. Verify "CREATE EVENT" button is visible
- **Expected Result**: Dashboard loads with Admin hero text ("Administrator"), create event button visible
- **Acceptance Criteria**: 
  - Page loads without 404 or permission errors
  - "CREATE EVENT" button is displayed and clickable
  - Hero greeting shows "Administrator" role

#### Test 1.1.2: Admin Dashboard Stats Cards
- **Precondition**: Admin user with multiple events in system
- **Steps**:
  1. Check the stats cards displayed
  2. Verify following cards are visible:
     - Total Events (or "My Total Assignments" if staff)
     - Pending Approval
     - Scheduled Events
     - Ongoing Events
     - Past Events
  3. Click each stat card to filter events
- **Expected Result**: 
  - All 5 stat cards visible
  - "Pending Approval" card shows draft events count
  - Clicking cards filters the event list correctly
- **Acceptance Criteria**:
  - Pending Approval count matches draft status events
  - Stats numbers are accurate
  - Tab filters work correctly

#### Test 1.1.3: Admin Dashboard Event Tabs
- **Precondition**: Admin user with events in multiple statuses
- **Steps**:
  1. Verify ALL tab shows all events
  2. Verify "Pending Approval" tab shows only DRAFT events
  3. Verify "Scheduled" tab shows only SCHEDULED events
  4. Verify "Ongoing" tab shows only ongoing events
  5. Verify "Past Events" tab shows completed/archived events
  6. Verify "My Assignments" tab is NOT visible for Admin
- **Expected Result**: 
  - Admin sees: ALL, Pending Approval, Scheduled, Ongoing, Past Events tabs
  - Admin does NOT see: "My Assignments" tab
  - Each tab correctly filters events by status
- **Acceptance Criteria**:
  - Correct tabs visible for Admin role
  - Tab filtering logic works
  - "My Assignments" not visible to Admin

#### Test 1.1.4: Admin Can Create Event
- **Precondition**: Admin on dashboard
- **Steps**:
  1. Click "CREATE EVENT" button
  2. Navigate to create event page
  3. Verify form is accessible
- **Expected Result**: Navigates to event creation form
- **Acceptance Criteria**: Create event action works without restrictions

#### Test 1.1.5: Admin Dashboard Table - View Event
- **Precondition**: Admin on dashboard viewing events table
- **Steps**:
  1. Verify each event row has a "View" button/action (click on row or view button)
  2. Click "View" on events with different statuses:
     - DRAFT event
     - SCHEDULED event
     - COMPLETED event
     - ARCHIVED event
  3. Verify event details page loads for all statuses
- **Expected Result**: Can view event details for any status
- **Acceptance Criteria**:
  - View action always available
  - Can view DRAFT, SCHEDULED, COMPLETED, ARCHIVED events
  - Event details page loads correctly
  - No permission errors

#### Test 1.1.6: Admin Dashboard Table - Edit Event
- **Precondition**: Admin on dashboard viewing events table
- **Steps**:
  1. **Test with DRAFT event**:
     - Verify "Edit" button/action is visible in table row
     - Click "Edit"
     - Verify edit page loads with event data
     - Make changes and save
     - Verify changes applied and dashboard updates
  2. **Test with SCHEDULED event**:
     - Verify "Edit" button is visible
     - Click to edit and verify form loads
  3. **Test with COMPLETED event**:
     - Verify "Edit" button is NOT visible
     - Verify no edit action available
  4. **Test with ARCHIVED event**:
     - Verify "Edit" button is NOT visible
     - Verify no edit action available
- **Expected Result**: Edit available only for non-completed/archived events
- **Acceptance Criteria**:
  - Edit button visible for DRAFT, APPROVED, SCHEDULED
  - Edit button hidden for COMPLETED, ARCHIVED
  - Edit form loads for editable events
  - Changes save successfully
  - Button properly hidden for non-editable events

#### Test 1.1.7: Admin Dashboard Table - Delete Event
- **Precondition**: Admin on dashboard viewing events table
- **Steps**:
  1. **Test with DRAFT event**:
     - Verify "Delete" button/action is visible in table row
     - Click "Delete"
     - Confirm deletion in dialog
     - Verify event removed from table
  2. **Test with SCHEDULED event**:
     - Verify "Delete" button is visible
     - Click to delete and confirm
     - Verify deletion succeeds
  3. **Test with COMPLETED event**:
     - Verify "Delete" button is STILL visible
     - Click to delete
     - Verify deletion succeeds (even for completed event)
  4. **Test with ARCHIVED event**:
     - Verify "Delete" button is visible
     - Click to delete and confirm
     - Verify deletion succeeds
  5. **Test with CANCELLED event**:
     - Verify "Delete" button is visible
     - Verify deletion works
- **Expected Result**: Delete available for all event statuses
- **Acceptance Criteria**:
  - Delete button always visible in table
  - Can delete DRAFT, SCHEDULED, COMPLETED, ARCHIVED, CANCELLED events
  - Confirmation dialog appears before deletion
  - Event removed from dashboard after deletion
  - Success message displayed

---

### Event Details Page Tests (Admin)

#### Test 1.2.1: Admin Event Details Page Loads
- **Precondition**: Admin user, event exists
- **Steps**:
  1. Click on an event from dashboard
  2. Wait for page to load
  3. Verify event hero section displays
  4. Verify status badge shows correct status
- **Expected Result**: Event details page loads with all event information
- **Acceptance Criteria**:
  - Hero image/fallback displays
  - Event title and location visible
  - Status badge correct
  - Date and timeline information visible

#### Test 1.2.2: Admin Can Approve Draft Events
- **Precondition**: Admin on event details, event status = DRAFT
- **Steps**:
  1. Scroll to action buttons section
  2. Verify "APPROVE EVENT" button is visible
  3. Click "APPROVE EVENT" button
  4. Confirm action in dialog
  5. Wait for response
  6. Verify event status changed to APPROVED/SCHEDULED
- **Expected Result**: Event approved successfully, status updates to APPROVED
- **Acceptance Criteria**:
  - "APPROVE EVENT" button visible for DRAFT events
  - Button hidden for non-DRAFT events
  - Approval action succeeds
  - Status updates in real-time
  - Success message displayed

#### Test 1.2.3: Admin Can Cancel Events
- **Precondition**: Admin on event details, event status = DRAFT or earlier
- **Steps**:
  1. Scroll to action buttons section
  2. Verify "CANCEL EVENT" button is visible
  3. Click "CANCEL EVENT" button
  4. Enter cancellation reason/comment
  5. Confirm action
  6. Verify status changes to CANCELLED
- **Expected Result**: Event cancelled, status = CANCELLED
- **Acceptance Criteria**:
  - "CANCEL EVENT" button visible when event not completed
  - Cancellation reason captured
  - Status updates to CANCELLED
  - Closure comment displayed on page
  - Button disappears after cancellation

#### Test 1.2.4: Admin Can Assign Staff/Employees
- **Precondition**: Admin on event details, event status NOT completed/cancelled/archived
- **Steps**:
  1. Scroll to Assignments section or action buttons
  2. Verify "ASSIGN EMPLOYEE" button is visible
  3. Click button
  4. Verify assignment dialog opens
  5. Select employee and role (Cameraman/Expert)
  6. Confirm assignment
  7. Verify assignment appears in list with status "Pending"
- **Expected Result**: Employee assigned to event
- **Acceptance Criteria**:
  - "ASSIGN EMPLOYEE" button visible
  - Dialog appears with employee list
  - Can select employee and role
  - Assignment created with "Pending" status
  - Assigned employee appears in Assignments tab
  - Button hidden when event is completed/cancelled/archived

#### Test 1.2.5: Admin Can Upload Media
- **Precondition**: Admin on event details, event status = COMPLETED
- **Steps**:
  1. Go to Media/Files section
  2. Click upload button
  3. Upload image/video/document
  4. Verify media appears in gallery
  5. Verify can filter by media type
- **Expected Result**: Media uploaded successfully
- **Acceptance Criteria**:
  - Upload section accessible for completed events
  - Can upload images, videos, documents
  - Media appears in gallery
  - Filter works (All, Images, Videos, Docs)
  - File size and type validation works

#### Test 1.2.6: Admin Can Edit Events (Non-Completed Only)
- **Precondition**: Admin on event details page
- **Steps**:
  1. **Test with DRAFT event**:
     - Verify "EDIT EVENT" button is visible
     - Click to edit event
     - Verify edit form loads with event data
     - Modify a field and save
     - Verify changes applied
  2. **Test with SCHEDULED event**:
     - Verify "EDIT EVENT" button is visible
     - Verify can edit event
  3. **Test with COMPLETED event**:
     - Verify "EDIT EVENT" button is NOT visible
     - Try direct navigation to edit URL
     - Verify access denied or read-only view
  4. **Test with ARCHIVED event**:
     - Verify "EDIT EVENT" button is NOT visible
     - Verify cannot edit
- **Expected Result**: Edit only available for non-completed/archived events
- **Acceptance Criteria**:
  - Edit button visible for DRAFT, APPROVED, SCHEDULED statuses
  - Edit button hidden for COMPLETED, ARCHIVED statuses
  - Edit form prevents modification of completed events
  - Changes save successfully for editable events
  - Proper error message for non-editable events

#### Test 1.2.7: Admin Can Delete Events (All Statuses)
- **Precondition**: Admin on event details page
- **Steps**:
  1. **Test with DRAFT event**:
     - Verify "DELETE EVENT" button is visible
     - Click to delete
     - Confirm deletion
     - Verify event removed from dashboard
  2. **Test with COMPLETED event**:
     - Verify "DELETE EVENT" button is visible
     - Click to delete
     - Confirm deletion
     - Verify event removed (even if completed)
  3. **Test with ARCHIVED event**:
     - Verify "DELETE EVENT" button is visible
     - Click to delete
     - Verify deletion succeeds
- **Expected Result**: Delete available for all event statuses
- **Acceptance Criteria**:
  - Delete button always visible for Admin
  - Can delete DRAFT events
  - Can delete COMPLETED events
  - Can delete ARCHIVED events
  - Can delete CANCELLED events
  - Confirmation dialog appears before deletion
  - Event removed from dashboard after deletion
  - Event permanently deleted from system

#### Test 1.2.8: Admin Sees All Event Tabs
- **Precondition**: Admin on event details page
- **Steps**:
  1. Verify the following tabs are visible:
     - Overview (event lifecycle)
     - Assignments
     - Announcements
     - Media/Files
     - Audit Log (if applicable)
  2. Click each tab to verify content loads
- **Expected Result**: All tabs visible and functional
- **Acceptance Criteria**:
  - All expected tabs present
  - Tab switching works
  - Content loads correctly for each tab

---

## ROLE 2: COMMUNICATION MANAGER (Manager in Communication Dept)

### Dashboard Tests

#### Test 2.1.1: Communication Manager Dashboard Loads
- **Precondition**: User logged in as Manager in Communication department
- **Steps**:
  1. Navigate to dashboard
  2. Verify page loads
  3. Check hero greeting
  4. Verify "CREATE EVENT" button visible
- **Expected Result**: Dashboard loads with Communication Manager role
- **Acceptance Criteria**:
  - Hero shows "Communication Manager"
  - Create event button visible
  - Dashboard loads without errors

#### Test 2.1.2: Communication Manager Sees Management Tabs
- **Precondition**: Communication Manager on dashboard
- **Steps**:
  1. Verify "ALL" tab visible
  2. Verify "Pending Approval" tab visible
  3. Verify "Scheduled" tab visible
  4. Verify "Ongoing" tab visible
  5. Verify "Past Events" tab visible
  6. Verify "My Assignments" tab is NOT visible
- **Expected Result**: Correct tabs shown
- **Acceptance Criteria**:
  - Manager tabs same as Admin
  - Staff tabs not visible

#### Test 2.1.3: Communication Manager Stats Cards
- **Precondition**: Communication Manager on dashboard
- **Steps**:
  1. Verify "Pending Approval" stat card visible
  2. Verify count is accurate for draft events
  3. Click stat card to filter
- **Expected Result**: Stats and filtering work
- **Acceptance Criteria**:
  - Pending Approval visible
  - Count accurate
  - Filter works

---

### Event Details Page Tests (Communication Manager)

#### Test 2.2.1: Communication Manager Can Approve Events
- **Precondition**: Communication Manager on DRAFT event details
- **Steps**:
  1. Verify "APPROVE EVENT" button is visible
  2. Click to approve
  3. Confirm
  4. Verify status changes
- **Expected Result**: Event approved successfully
- **Acceptance Criteria**:
  - Button visible for DRAFT events
  - Approval succeeds
  - Status updates

#### Test 2.2.2: Communication Manager Can Assign Staff
- **Precondition**: Communication Manager on event details, event NOT finalized
- **Steps**:
  1. Click "ASSIGN EMPLOYEE" button
  2. Select employee and role
  3. Assign
  4. Verify assignment appears
- **Expected Result**: Staff assigned successfully
- **Acceptance Criteria**:
  - Button visible and functional
  - Can select from available employees
  - Assignment created

#### Test 2.2.3: Communication Manager Can Cancel Events
- **Precondition**: Communication Manager on event details
- **Steps**:
  1. Click "CANCEL EVENT" button
  2. Add comment
  3. Confirm
  4. Verify status = CANCELLED
- **Expected Result**: Event cancelled
- **Acceptance Criteria**:
  - Button visible
  - Cancellation succeeds
  - Status updates to CANCELLED

#### Test 2.2.4: Communication Manager Can Edit Events (Non-Completed Only)
- **Precondition**: Communication Manager on event details
- **Steps**:
  1. **Test with DRAFT event**:
     - Verify "EDIT EVENT" button is visible
     - Click to edit
     - Verify form loads
     - Modify and save
     - Verify changes applied
  2. **Test with COMPLETED event**:
     - Verify "EDIT EVENT" button is NOT visible
     - Cannot edit completed events
- **Expected Result**: Edit only for non-completed events
- **Acceptance Criteria**:
  - Edit button visible for DRAFT, APPROVED, SCHEDULED
  - Edit button hidden for COMPLETED, ARCHIVED
  - Changes save for editable events

#### Test 2.2.5: Communication Manager Can Delete Events (All Statuses)
- **Precondition**: Communication Manager on event details
- **Steps**:
  1. Verify "DELETE EVENT" button is visible
  2. Click to delete
  3. Confirm deletion
  4. Verify event removed
  5. Test with different event statuses (DRAFT, COMPLETED, ARCHIVED)
- **Expected Result**: Delete available for all statuses
- **Acceptance Criteria**:
  - Delete button always visible
  - Can delete events regardless of status
  - Confirmation required before deletion
  - Event removed from system

---

## ROLE 3: DEPARTMENT MANAGER (Manager NOT in Communication)

### Dashboard Tests

#### Test 3.1.1: Department Manager Dashboard Loads
- **Precondition**: User logged in as Manager in non-Communication dept (e.g., IT, HR)
- **Steps**:
  1. Navigate to dashboard
  2. Verify page loads
  3. Check hero greeting
  4. Verify "CREATE EVENT" button visible
- **Expected Result**: Dashboard loads with Department Manager role
- **Acceptance Criteria**:
  - Hero shows "Department Manager"
  - Dashboard loads
  - Can see CREATE EVENT button

#### Test 3.1.2: Department Manager Event Tabs
- **Precondition**: Department Manager on dashboard
- **Steps**:
  1. Verify tabs shown:
     - ALL
     - Scheduled
     - Ongoing
     - Past Events
  2. Verify "Pending Approval" tab NOT visible
  3. Verify "My Assignments" tab NOT visible
- **Expected Result**: Manager sees operational tabs only
- **Acceptance Criteria**:
  - Pending Approval tab hidden (not a communication manager)
  - My Assignments hidden (not staff)
  - Standard operational tabs visible

#### Test 3.1.3: Department Manager Cannot Create Events (Limitation)
- **Precondition**: Department Manager on dashboard
- **Steps**:
  1. Verify "CREATE EVENT" button visibility
  2. Try to click it (if visible based on implementation)
  3. Check authorization policy
- **Expected Result**: Department Manager sees button but may face authorization
- **Acceptance Criteria**:
  - Button visible (Manager role allows creation)
  - Or shows permission denied if restricted to Communication only

---

### Event Details Page Tests (Department Manager)

#### Test 3.2.1: Department Manager Cannot Approve Events
- **Precondition**: Department Manager on DRAFT event details
- **Steps**:
  1. Check for "APPROVE EVENT" button
  2. Verify button is NOT visible
  3. Scroll through all sections
- **Expected Result**: Approve button not visible
- **Acceptance Criteria**:
  - "APPROVE EVENT" button hidden
  - "CANCEL EVENT" button hidden
  - No approval functionality available

#### Test 3.2.2: Department Manager Cannot Assign Staff
- **Precondition**: Department Manager on event details
- **Steps**:
  1. Search for "ASSIGN EMPLOYEE" button
  2. Scroll through action buttons
  3. Verify button not visible
- **Expected Result**: Assign button not visible
- **Acceptance Criteria**:
  - "ASSIGN EMPLOYEE" button hidden
  - No assignment functionality available

#### Test 3.2.3: Department Manager Can View Event Details
- **Precondition**: Department Manager on event details
- **Steps**:
  1. Verify can view Overview tab
  2. Verify can view Assignments tab
  3. Verify can view other read-only tabs
  4. Verify no edit buttons available
- **Expected Result**: Can view but not edit
- **Acceptance Criteria**:
  - Read-only access granted
  - Can view all information
  - No action buttons visible

---

## ROLE 4: EXPERT (Staff Member)

### Dashboard Tests

#### Test 4.1.1: Expert Dashboard Loads
- **Precondition**: User logged in as Expert
- **Steps**:
  1. Navigate to dashboard
  2. Verify page loads
  3. Check hero greeting
  4. Verify "CREATE EVENT" button NOT visible
- **Expected Result**: Dashboard loads with Expert role
- **Acceptance Criteria**:
  - Hero shows "Assigned Staff"
  - No CREATE EVENT button
  - Dashboard loads

#### Test 4.1.2: Expert Dashboard Stats - My Assignments
- **Precondition**: Expert on dashboard
- **Steps**:
  1. Verify first stat card shows "My Total Assignments" instead of "Total Events"
  2. Count matches assignments for this user
  3. Click to filter
- **Expected Result**: Expert sees only their assignments
- **Acceptance Criteria**:
  - Label shows "My Total Assignments"
  - Count is accurate
  - Filter works

#### Test 4.1.3: Expert Dashboard Shows Pending Invitations
- **Precondition**: Expert with pending assignments
- **Steps**:
  1. Verify "Pending Invitations" stat card visible
  2. Count matches pending assignments
  3. Click to show pending assignments
- **Expected Result**: Pending invitations displayed
- **Acceptance Criteria**:
  - Card visible
  - Count accurate
  - Filter shows pending assignments

#### Test 4.1.4: Expert Dashboard Event Tabs
- **Precondition**: Expert on dashboard
- **Steps**:
  1. Verify "ALL" tab visible (shows assigned events)
  2. Verify "My Assignments" tab visible
  3. Verify "Scheduled" tab visible
  4. Verify "Ongoing" tab visible
  5. Verify "Past Events" tab visible
  6. Verify "Pending Approval" tab NOT visible
- **Expected Result**: Expert sees correct tabs
- **Acceptance Criteria**:
  - My Assignments tab visible
  - Management tabs (Pending Approval) hidden
  - Staff-specific tabs shown

#### Test 4.1.5: Expert Cannot Create Events
- **Precondition**: Expert on dashboard
- **Steps**:
  1. Verify "CREATE EVENT" button NOT visible
  2. Try direct navigation to create event URL
  3. Verify access denied/redirect
- **Expected Result**: Cannot create events
- **Acceptance Criteria**:
  - Button not visible
  - Direct navigation denied
  - Appropriate error message

---

### Event Details Page Tests (Expert)

#### Test 4.2.1: Expert Can View Assigned Event Details
- **Precondition**: Expert, event exists and they are assigned
- **Steps**:
  1. Navigate to event details from dashboard
  2. Verify page loads completely
  3. Verify all information visible
  4. Verify back button works
- **Expected Result**: Event details load successfully
- **Acceptance Criteria**:
  - Page loads without permission errors
  - All event information visible
  - Can navigate back

#### Test 4.2.2: Expert Cannot View Unassigned Event Details (Authorization)
- **Precondition**: Expert, event exists but they are NOT assigned
- **Steps**:
  1. Try direct navigation to event details URL
  2. Enter event ID in URL
  3. Verify access denied or event not shown
- **Expected Result**: Access denied or event not visible
- **Acceptance Criteria**:
  - Cannot access unassigned events
  - Proper authorization check
  - Error message displayed

#### Test 4.2.3: Expert Cannot Approve Events
- **Precondition**: Expert on assigned event details
- **Steps**:
  1. Verify "APPROVE EVENT" button NOT visible
  2. Scroll through all sections
- **Expected Result**: No approval button
- **Acceptance Criteria**:
  - Button hidden
  - No approval functionality

#### Test 4.2.4: Expert Cannot Assign Other Staff
- **Precondition**: Expert on event details
- **Steps**:
  1. Verify "ASSIGN EMPLOYEE" button NOT visible
  2. Check action buttons section
- **Expected Result**: No assign button
- **Acceptance Criteria**:
  - Button hidden
  - Cannot assign others

#### Test 4.2.5: Expert Can Upload Media (if Accepted Assignment)
- **Precondition**: Expert assigned with "Accepted" status, event COMPLETED
- **Steps**:
  1. Navigate to event details
  2. Verify event status = COMPLETED
  3. Go to Media section
  4. Click upload button
  5. Upload a file
  6. Verify media appears
- **Expected Result**: Media uploaded successfully
- **Acceptance Criteria**:
  - Can upload to assigned events
  - Only when event is COMPLETED
  - File appears in gallery
  - Expert can filter media

#### Test 4.2.6: Expert Cannot Upload Media (if Pending/Rejected)
- **Precondition**: Expert with pending or rejected assignment
- **Steps**:
  1. Navigate to event details
  2. Check Media upload section
  3. Verify upload button hidden or disabled
- **Expected Result**: Cannot upload
- **Acceptance Criteria**:
  - Button hidden/disabled for non-accepted assignments
  - Appropriate message shown

#### Test 4.2.7: Expert Can Accept/Reject Assignment
- **Precondition**: Expert on their assigned event, assignment status = "Pending"
- **Steps**:
  1. Go to Assignments tab
  2. Find their assignment card
  3. Verify Accept/Reject buttons visible
  4. Click Accept (or Reject)
  5. Confirm action
  6. Verify status updates
- **Expected Result**: Assignment status updated
- **Acceptance Criteria**:
  - Accept/Reject buttons visible
  - Status changes to Accepted or Rejected
  - UI updates to reflect change
  - Refresh shows updated status

#### Test 4.2.8: Expert Can View Assignments Tab
- **Precondition**: Expert on event details
- **Steps**:
  1. Click Assignments tab
  2. Verify can see all assigned staff
  3. See assignment roles
  4. See assignment status
  5. See contact info if available
- **Expected Result**: All assignment info visible
- **Acceptance Criteria**:
  - Tab loads correctly
  - All assignments listed
  - Staff information displayed
  - Roles visible

---

## ROLE 5: CAMERAMAN (Staff Member)

### Dashboard Tests

#### Test 5.1.1: Cameraman Dashboard Loads
- **Precondition**: User logged in as Cameraman
- **Steps**:
  1. Navigate to dashboard
  2. Verify page loads
  3. Check hero greeting shows "Assigned Staff"
  4. Verify "CREATE EVENT" button NOT visible
- **Expected Result**: Dashboard loads with Cameraman role
- **Acceptance Criteria**:
  - Hero shows "Assigned Staff"
  - No CREATE EVENT button
  - Dashboard functional

#### Test 5.1.2: Cameraman Dashboard Stats Same as Expert
- **Precondition**: Cameraman on dashboard
- **Steps**:
  1. Verify "My Total Assignments" stat visible
  2. Verify "Pending Invitations" stat visible
  3. Verify accurate counts
  4. Verify filtering works
- **Expected Result**: Same as Expert role
- **Acceptance Criteria**:
  - Stats match Cameraman's assignments
  - Filtering works
  - Counts accurate

#### Test 5.1.3: Cameraman Dashboard Tabs
- **Precondition**: Cameraman on dashboard
- **Steps**:
  1. Verify "ALL" tab visible
  2. Verify "My Assignments" tab visible
  3. Verify "Scheduled", "Ongoing", "Past Events" visible
  4. Verify "Pending Approval" tab NOT visible
- **Expected Result**: Correct tabs shown
- **Acceptance Criteria**:
  - Same tabs as Expert
  - Management tabs hidden
  - Operational tabs visible

---

### Event Details Page Tests (Cameraman)

#### Test 5.2.1: Cameraman Can View Assigned Event Details
- **Precondition**: Cameraman assigned to event
- **Steps**:
  1. Click assigned event
  2. Verify page loads
  3. Verify all info visible
  4. Verify no edit buttons
- **Expected Result**: Read-only access to assigned events
- **Acceptance Criteria**:
  - Page loads
  - Information visible
  - No admin functions available

#### Test 5.2.2: Cameraman Cannot Approve Events
- **Precondition**: Cameraman on event details
- **Steps**:
  1. Verify "APPROVE EVENT" button NOT visible
  2. Verify "CANCEL EVENT" button NOT visible
- **Expected Result**: No approval/cancellation buttons
- **Acceptance Criteria**:
  - Buttons hidden
  - No approval functionality

#### Test 5.2.3: Cameraman Cannot Assign Other Staff
- **Precondition**: Cameraman on event details
- **Steps**:
  1. Verify "ASSIGN EMPLOYEE" button NOT visible
- **Expected Result**: No assignment button
- **Acceptance Criteria**:
  - Button hidden
  - Cannot assign others

#### Test 5.2.4: Cameraman Can Upload Media (Accepted Assignment)
- **Precondition**: Cameraman with accepted assignment, event COMPLETED
- **Steps**:
  1. Go to Media section
  2. Upload image/video
  3. Verify appears in gallery
  4. Verify can filter media
- **Expected Result**: Media uploaded successfully
- **Acceptance Criteria**:
  - Can upload content
  - File appears immediately
  - Filter works

#### Test 5.2.5: Cameraman Cannot Upload (Pending/Rejected)
- **Precondition**: Cameraman with pending assignment
- **Steps**:
  1. Check Media upload section
  2. Verify button hidden/disabled
- **Expected Result**: Cannot upload
- **Acceptance Criteria**:
  - Button hidden
  - Appropriate message displayed

#### Test 5.2.6: Cameraman Can Accept/Reject Assignment
- **Precondition**: Cameraman on event with pending assignment
- **Steps**:
  1. Go to Assignments tab
  2. Find their assignment
  3. Click Accept or Reject
  4. Confirm
  5. Verify status updates
- **Expected Result**: Assignment status updated
- **Acceptance Criteria**:
  - Accept/Reject buttons work
  - Status changes
  - Page reflects change

---

## CROSS-ROLE INTEGRATION TESTS

### Test 6.1: Event Status Progression
- **Precondition**: Complete event workflow with multiple roles
- **Steps**:
  1. Manager creates event (status = DRAFT)
  2. Verify Expert/Cameraman cannot see draft event
  3. Communication Manager approves (status = SCHEDULED/APPROVED)
  4. Verify Expert/Cameraman now see event
  5. Verify Expert/Cameraman see their assignments
  6. Assignments move to COMPLETED status
  7. Communication Manager marks event COMPLETED
  8. Verify Expert/Cameraman can now upload media
- **Expected Result**: Full workflow functions correctly
- **Acceptance Criteria**:
  - Status transitions correct
  - Visibility changes appropriately
  - Access permissions update with status

### Test 6.2: Assignment Workflow
- **Precondition**: Manager/Admin with ability to assign staff
- **Steps**:
  1. Create event and schedule
  2. Assign Expert with Cameraman role
  3. Expert sees assignment as Pending
  4. Expert accepts assignment
  5. Verify status = Accepted
  6. Expert can now see full event details
  7. Expert can upload media when event COMPLETED
- **Expected Result**: Complete assignment lifecycle works
- **Acceptance Criteria**:
  - Assignment created
  - Expert notified
  - Acceptance/rejection works
  - Permissions update per status

### Test 6.3: Multi-Role Event Viewing
- **Precondition**: Event with multiple assigned staff
- **Steps**:
  1. Event assigned to Expert1 and Cameraman1
  2. Expert1 logs in - sees event and only their assignment
  3. Cameraman1 logs in - sees event and only their assignment
  4. Admin logs in - sees all assignments for event
  5. Communication Manager logs in - sees all assignments
- **Expected Result**: Each role sees appropriate assignment info
- **Acceptance Criteria**:
  - Staff only see their own assignments
  - Managers see all assignments
  - No cross-staff visibility

---

## AUTHENTICATION & AUTHORIZATION TESTS

### Test 7.1: Unauthenticated User Access
- **Precondition**: Not logged in
- **Steps**:
  1. Try to access /dashboard
  2. Try to access /events/{id}
  3. Try to access /create-event
- **Expected Result**: Redirected to login
- **Acceptance Criteria**:
  - All authenticated routes protected
  - Redirect to login works
  - No unauthorized access possible

### Test 7.2: Role-Based Route Protection
- **Precondition**: Expert user logged in
- **Steps**:
  1. Try direct navigation to /admin/users
  2. Try direct navigation to /approval/pending
  3. Try direct navigation to /reports
- **Expected Result**: Access denied or 403 error
- **Acceptance Criteria**:
  - Routes properly protected by role
  - Appropriate error response
  - Redirect to allowed page

### Test 7.3: Session Expiration
- **Precondition**: Logged in user with session
- **Steps**:
  1. Let session expire (if timeout configured)
  2. Try to perform action
  3. Verify redirect to login
- **Expected Result**: Forced login on expiration
- **Acceptance Criteria**:
  - Session properly validated
  - Redirect to login on expiration
  - No stale data served

---

## PERFORMANCE & EDGE CASES

### Test 8.1: Dashboard with Large Event List
- **Precondition**: System with 100+ events
- **Steps**:
  1. Load dashboard
  2. Verify page loads in reasonable time
  3. Verify pagination/virtual scrolling works
  4. Switch between tabs
- **Expected Result**: Page remains responsive
- **Acceptance Criteria**:
  - Load time < 3 seconds
  - No UI freezing
  - Pagination works

### Test 8.2: Event Details with Large Media Gallery
- **Precondition**: Event with 50+ media files
- **Steps**:
  1. Load event details
  2. Go to Media tab
  3. Verify media loads (lazy loading)
  4. Filter media types
  5. Scroll through gallery
- **Expected Result**: Gallery remains responsive
- **Acceptance Criteria**:
  - Media loads progressively
  - No freezing when scrolling
  - Filter works smoothly

### Test 8.3: Concurrent Assignment Updates
- **Precondition**: Multiple staff viewing same event
- **Steps**:
  1. Expert1 opens event
  2. Expert2 opens same event
  3. Expert1 accepts assignment
  4. Refresh Expert2's page
  5. Verify Expert2 sees updated status
- **Expected Result**: Data consistent across users
- **Acceptance Criteria**:
  - No stale data shown
  - Refresh shows latest status
  - No conflicts in assignment state

### Test 8.4: Network Error Handling
- **Precondition**: User performing action with weak/intermittent network
- **Steps**:
  1. Start uploading media with poor connection
  2. Connection drops
  3. Verify error message
  4. Verify can retry
- **Expected Result**: Graceful error handling
- **Acceptance Criteria**:
  - Clear error message
  - Retry option available
  - No corrupted state

---

## BROWSER COMPATIBILITY TESTS

### Test 9.1: Chrome/Edge
- Load dashboard and event details
- Verify all buttons work
- Verify responsive layout

### Test 9.2: Firefox
- Load dashboard and event details
- Verify all buttons work
- Verify responsive layout

### Test 9.3: Safari
- Load dashboard and event details
- Verify all buttons work
- Verify responsive layout

### Test 9.4: Mobile Browsers
- Load dashboard on mobile
- Verify touch interactions work
- Verify responsive layout
- Verify buttons are tap-friendly

---

## ACCESSIBILITY TESTS

### Test 10.1: Keyboard Navigation
- **Precondition**: Any page loaded
- **Steps**:
  1. Tab through all interactive elements
  2. Verify focus indicators visible
  3. Verify logical tab order
  4. Verify Enter/Space activate buttons
- **Expected Result**: Full keyboard navigation possible
- **Acceptance Criteria**:
  - All buttons/links reachable via keyboard
  - Focus indicators clear
  - Tab order logical

### Test 10.2: Screen Reader Compatibility
- **Precondition**: NVDA or JAWS running
- **Steps**:
  1. Read page headings
  2. Read button labels
  3. Read stat cards
  4. Read form labels
- **Expected Result**: Screen reader announces all content
- **Acceptance Criteria**:
  - Buttons have aria-labels if needed
  - Headings marked with h1-h6
  - Form fields labeled
  - Tables have headers

---

## TEST EXECUTION CHECKLIST

### Before Testing
- [ ] Test environment set up
- [ ] Test data created (users with each role)
- [ ] Database seeded with sample events
- [ ] Backend API running
- [ ] Frontend running
- [ ] Network connection stable

### During Testing
- [ ] Run each test case
- [ ] Document any failures with screenshots
- [ ] Note unexpected behaviors
- [ ] Check browser console for errors
- [ ] Verify network requests in DevTools

### After Testing
- [ ] Compile test results
- [ ] Document all bugs found
- [ ] Categorize by severity
- [ ] Note any performance issues
- [ ] Verify fixes for failed tests

---

## TEST RESULT TEMPLATE

For each test case, record:
```
Test ID: [Number]
Test Name: [Name]
Role: [Admin/Manager/Expert/Cameraman]
Status: [PASS/FAIL/BLOCKED]
Date Tested: [Date]
Tester: [Name]
Environment: [Browser/OS]
Notes: [Any observations]
Screenshots: [If failed]
```

---

## CRITICAL SUCCESS CRITERIA

The system is working perfectly when:

1. ✅ **Admin** can:
   - Create, approve, cancel events and assign staff
   - **Edit events** only if NOT completed/archived
   - **Delete events** regardless of status (even completed/archived)
2. ✅ **Communication Manager** can:
   - Manage events and staff assignments (same as Admin)
   - **Edit events** only if NOT completed/archived
   - **Delete events** regardless of status
3. ✅ **Department Manager** can view but not manage (no edit/delete/assign buttons)
4. ✅ **Expert/Cameraman** can only see assigned events and upload media when appropriate
5. ✅ All role-based buttons appear/hide correctly
6. ✅ Event status transitions follow the workflow
7. ✅ Assignment lifecycle works (Pending → Accepted/Rejected)
8. ✅ Media upload restricted to completed events
9. ✅ No unauthorized access to other users' assignments
10. ✅ Dashboard stats and tabs correct for each role

---

## Event Edit/Delete Permission Matrix

| Action | Status | Admin | Comm Mgr | Dept Mgr | Expert | Cameraman |
|--------|--------|-------|----------|----------|--------|-----------|
| **Edit** | DRAFT | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit** | APPROVED | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit** | SCHEDULED | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit** | COMPLETED | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Edit** | ARCHIVED | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Delete** | DRAFT | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete** | APPROVED | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete** | SCHEDULED | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete** | COMPLETED | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete** | ARCHIVED | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete** | CANCELLED | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Notes

- Test with real user accounts created in the system
- Create test events in different statuses (DRAFT, APPROVED, SCHEDULED, COMPLETED, CANCELLED, ARCHIVED)
- Create assignments with different statuses (Pending, Accepted, Rejected)
- **Key Edit Rule**: Events can only be edited if they are NOT in COMPLETED or ARCHIVED status
- **Key Delete Rule**: Events can be deleted at ANY status (including COMPLETED and ARCHIVED)
- Test both happy paths and edge cases
- Check backend logs for any 401/403 errors
- Verify audit logging captures all actions
- Performance test with realistic data volume

