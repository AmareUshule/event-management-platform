# EEP.EventManagement.Api

This project is the backend API for the Event Management Platform.

## Steps to Run the Project on a New Machine

1.  **Install Prerequisites:**
    *   **.NET SDK:** Install the .NET 8.0 SDK. You can download it from the official .NET website: [https://dotnet.microsoft.com/download/dotnet/8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
    *   **PostgreSQL:** Install PostgreSQL database server. You can download it from: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
    *   **Git:** Install Git for cloning the repository.

2.  **Clone the Repository:**
    *   Open your terminal or command prompt.
    *   Navigate to the directory where you want to clone the project.
    *   Run the following command:
        ```bash
        git clone <repository_url>
        ```
    *   Navigate into the cloned project directory:
        ```bash
        cd event-management-platform/backend/EEP.EventManagement.Api
        ```

3.  **Configure the Database:**
    *   **Create a PostgreSQL Database:** Create a new PostgreSQL database (e.g., `event_management_db`).
    *   **Update Connection String:** Open the `appsettings.json` file in the project root (`EEP.EventManagement.Api/appsettings.json`).
    *   Locate the `ConnectionStrings` section and update the `DefaultConnection` to point to your PostgreSQL database.
        ```json
        "ConnectionStrings": {
            "DefaultConnection": "Host=localhost;Port=5432;Database=event_management_db;Username=your_username;Password=your_password"
        },
        ```
        Replace `localhost`, `5432`, `event_management_db`, `your_username`, and `your_password` with your PostgreSQL server details.

4.  **Restore Dependencies:**
    *   In the project root directory (`EEP.EventManagement.Api`), run:
        ```bash
        dotnet restore
        ```

5.  **Apply Database Migrations:**
    *   Apply the migrations to create the database schema:
        ```bash
        dotnet ef database update --context ApplicationDbContext
        ```
        ```bash
        dotnet ef database update --context IdentityDbContext
        ```
        *Note: If you encounter permission errors during migration (e.g., "must be owner of table"), you might need to grant ownership of the tables to your database user. For example:*
        ```sql
        ALTER TABLE "Events" OWNER TO your_database_user;
        ALTER TABLE "AspNetUsers" OWNER TO your_database_user;
        -- Repeat for other tables if necessary
        ```
        *Also, if you encounter an error like `column "EmployeeId" of relation "AspNetUsers" already exists`, it means a migration was partially applied. You might need to manually insert the migration into `__EFMigrationsHistory` table if it's not there, or ensure the migration file doesn't try to re-add existing columns.*

6.  **Run the Application:**
    *   From the project root directory (`EEP.EventManagement.Api`), run:
        ```bash
        dotnet run
        ```
    *   The API should start, typically on `http://localhost:5230` (or another port specified in `Properties/launchSettings.json`).
    *   You can access the Swagger UI for API documentation and testing at `http://localhost:5230/swagger`.
