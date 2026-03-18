# **EEP Event Management System – ERD Table List (PostgreSQL)**

---

### 1. **Departments**

| Field         | Data Type    | Constraints      |
| ------------- | ------------ | ---------------- |
| department_id | SERIAL       | PK               |
| name          | VARCHAR(100) | NOT NULL, UNIQUE |
| description   | TEXT         | NULL             |
| created_at    | TIMESTAMP    | DEFAULT now()    |
| updated_at    | TIMESTAMP    | DEFAULT now()    |

---

### 2. **Users**

| Field         | Data Type    | Constraints                                          |
| ------------- | ------------ | ---------------------------------------------------- |
| id            | SERIAL       | PK                                                   |
| first_name    | VARCHAR(50)  | NOT NULL                                             |
| last_name     | VARCHAR(50)  | NOT NULL                                             |
| email         | VARCHAR(100) | NOT NULL, UNIQUE                                     |
| role          | VARCHAR(20)  | NOT NULL (`Admin`, `Manager`, `expert`, `cameraman`) |
| department_id | INT          | FK → Departments(department_id), NOT NULL            |
| password      | VARCHAR(50)  | DEFAULT now()                                        |
| created_at    | TIMESTAMP    | DEFAULT now()                                        |
| updated_at    | TIMESTAMP    | DEFAULT now()                                        |

---

### 3. **Events**

| Field         | Data Type    | Constraints                                                                                  |
| ------------- | ------------ | -------------------------------------------------------------------------------------------- |
| id      | SERIAL       | PK                                                                                           |
| title         | VARCHAR(150) | NOT NULL                                                                                     |
| description   | TEXT         | NULL                                                                                         |
| department_id | INT          | FK → Departments(department_id), NOT NULL                                                    |
| event_place    | varchar    | NULL                                                                                |
| start_date    | TIMESTAMP    | NOT NULL                                                                                     |
| end_date      | TIMESTAMP    | NOT NULL                                                                                     |
| status        | VARCHAR(20)  | NOT NULL (`Draft`, `Scheduled`, `Ongoing`, `Completed`, `Archived`, `Cancelled`) |
| created_by    | INT          | FK → Users(user_id), NOT NULL                                                                |
| approved_by   | INT          | FK → Users(user_id), NULL                                                                    |
| created_at    | TIMESTAMP    | DEFAULT now()                                                                                |
| updated_at    | TIMESTAMP    | DEFAULT now()                                                                                |

---

### 4. **Assignments**

| Field          | Data Type   | Constraints                                   |
| -------------- | ----------- | --------------------------------------------- |
| id             | SERIAL      | PK                                            |
| event_id       | INT         | FK → Events(event_id), NOT NULL               |
| employee_id    | INT         | FK → Users(user_id), NOT NULL                 |
| assigned_by    | INT         | FK → Users(user_id), NOT NULL                 |
| status         | VARCHAR(20) | NOT NULL (`Assigned`, `Accepted`, `Declined`) |
| decline_reason | TEXT        | NULL                                          |
| assigned_at    | TIMESTAMP   | DEFAULT now()                                 |
| updated_at     | TIMESTAMP   | DEFAULT now()                                 |

---

### 5. **Media**

| Field        | Data Type    | Constraints                            |
| ------------ | ------------ | -------------------------------------- |
| media_id     | SERIAL       | PK                                     |
| event_id     | INT          | FK → Events(event_id), NOT NULL        |
| uploaded_by  | INT          | FK → Users(user_id), NOT NULL          |
| type         | VARCHAR(20)  | NOT NULL (`Photo`, `Document`, `Link`) |
| file_path    | TEXT         | NULL                                   |
| external_url | TEXT         | NULL                                   |
| size_mb      | NUMERIC(5,2) | NULL                                   |
| created_at   | TIMESTAMP    | DEFAULT now()                          |
| updated_at   | TIMESTAMP    | DEFAULT now()                          |

---

### 6. **AuditLogs**

| Field        | Data Type   | Constraints                                                       |
| ------------ | ----------- | ----------------------------------------------------------------- |
| audit_id     | SERIAL      | PK                                                                |
| entity_type  | VARCHAR(50) | NOT NULL (`Event`, `Assignment`, `Media`, `User`, `Notification`) |
| entity_id    | INT         | NOT NULL                                                          |
| action       | VARCHAR(50) | NOT NULL (`Created`, `Updated`, `Deleted`, `Approved`, etc.)      |
| performed_by | INT         | FK → Users(user_id), NOT NULL                                     |
| timestamp    | TIMESTAMP   | DEFAULT now()                                                     |
| details      | JSONB       | NULL                                                              |

---

### 7. **Notifications**

| Field           | Data Type   | Constraints                                   |
| --------------- | ----------- | --------------------------------------------- |
| notification_id | SERIAL      | PK                                            |
| employee_id     | INT         | FK → Users(user_id), NOT NULL                 |
| event_id        | INT         | FK → Events(event_id), NULL                   |
| type            | VARCHAR(50) | NOT NULL (`Assignment`, `Approval`, `Update`) |
| channel         | VARCHAR(20) | NOT NULL (`Email`, `In-app`)                  |
| status          | VARCHAR(20) | NOT NULL (`Sent`, `Failed`, `Read`)           |
| message         | TEXT        | NULL                                          |
| created_at      | TIMESTAMP   | DEFAULT now()                                 |
| read_at         | TIMESTAMP   | NULL                                          |

---

---

### 8. **Announcements**

| Field | Data Type | Constraints |
| :--- | :--- | :--- |
| id | UUID | PK |
| title | VARCHAR(200) | NOT NULL |
| content | TEXT | NOT NULL |
| type | VARCHAR(50) | NOT NULL (`General`, `JobOpening`, `DocumentPost`) |
| status | VARCHAR(50) | NOT NULL (`Draft`, `PendingApproval`, `Rejected`, `Published`) |
| department_id | UUID | FK → Departments(id), NULL |
| deadline | TIMESTAMP | NULL |
| cover_image_url| TEXT | NULL |
| created_by | UUID | FK → Users(id), NOT NULL |
| approved_by | UUID | FK → Users(id), NULL |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

---

### 9. **AnnouncementMedia**

| Field | Data Type | Constraints |
| :--- | :--- | :--- |
| id | UUID | PK |
| announcement_id| UUID | FK → Announcements(id), NOT NULL (Cascade Delete) |
| file_url | TEXT | NOT NULL |
| file_name | VARCHAR(250) | NOT NULL |
| file_type | VARCHAR(50) | NOT NULL (`Image`, `Pdf`) |
| content_type | VARCHAR(100) | NOT NULL |
| uploaded_by | UUID | FK → Users(id), NOT NULL |
| uploaded_at | TIMESTAMP | DEFAULT now() |

---

### 10. **JobVacancies**

| Field | Data Type | Constraints |
| :--- | :--- | :--- |
| id | UUID | PK |
| announcement_id| UUID | FK → Announcements(id), NOT NULL (Cascade Delete) |
| job_title | VARCHAR(250) | NOT NULL |
| job_code | VARCHAR(50) | NOT NULL |
| grade | VARCHAR(50) | NOT NULL |
| required_number| INT | NOT NULL |
| work_place | VARCHAR(250) | NOT NULL |
| requirements | TEXT | NOT NULL |
| experience | TEXT | NOT NULL |
| training | TEXT | NOT NULL |
| certificate | TEXT | NOT NULL |
| other_optional_requirements | TEXT | NOT NULL |
| work_unit | VARCHAR(250) | NOT NULL |

---

### **Relationships Summary**

- **Users ↔ Departments:** Many-to-One
- **Events ↔ Departments:** Many-to-One
- **Events ↔ Users:** Many-to-One (`created_by`, `approved_by`)
- **Assignments ↔ Events:** Many-to-One
- **Assignments ↔ Users:** Many-to-One
- **Media ↔ Events:** Many-to-One
- **Media ↔ Users:** Many-to-One
- **AuditLogs ↔ Users:** Many-to-One (`performed_by`)
- **Notifications ↔ Users:** Many-to-One (`user_id`)
- **Notifications ↔ Events:** Many-to-One (`event_id`, nullable)
- **Announcements ↔ Departments:** Many-to-One
- **Announcements ↔ Users:** Many-to-One (`created_by`, `approved_by`)
- **AnnouncementMedia ↔ Announcements:** Many-to-One
- **JobVacancies ↔ Announcements:** Many-to-One
