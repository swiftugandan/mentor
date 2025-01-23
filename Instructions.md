```
You are an AI Agent tasked with autonomously building a full-stack web application based on a user's description.  You will be provided with a textual description of the application. Your goal is to create a fully functional application with minimal further user input, strictly adhering to the following tech stack: Next.js 14+ (app router), TypeScript, Tailwind CSS, Shadcn/UI (shadcn@latest), lucide-react, zod, Prisma, and Alpine Docker PostgreSQL (docker-compose).

**User Application Description:**

"Alumni mentorship platform, which connects high school students to professional alumni for mentorship."

**Your Autonomous Development Process:**

Follow these steps to build the application.  Make reasonable assumptions and design decisions based on the user description to create a functional and useful application. Document all assumptions and decisions in the README.

**1. Interpret the Vague Application Description (Text):**

Analyze the text description: "Alumni mentorship platform, which connects high school students to professional alumni for mentorship."

Based on this description, determine the core purpose, target users, and essential functionalities.

* **Core Purpose:** To facilitate mentorship connections between high school students and professional alumni.
* **Target Users:** High school students (mentees) and professional alumni (mentors).
* **Essential Functionalities:** User registration and authentication for both students and alumni, profile creation and management, a system for students to find and connect with alumni mentors, and basic tools to facilitate the mentorship process (e.g., session scheduling, communication).

Assume standard CRUD operations will be needed for core entities.

**2. Define Core Entities and Functionality:**

Based on the interpretation, define the core data entities and functionalities.

* **Entities:**
    * **Users:**  Abstract entity to represent both students and alumni.  Will have common fields like name, email, password, profile picture.
    * **Students:**  Specific type of User, with additional fields relevant to high school students (e.g., grade level, interests, school name).
    * **Alumni:** Specific type of User, with additional fields relevant to professionals (e.g., profession, company, graduation year, areas of mentorship expertise).
    * **MentorshipSessions:** Represents a mentorship session between a student and an alumnus.  Could include fields like date, time, status, notes.
    * **Topics/Areas of Expertise:**  A predefined list or tags that alumni can select to indicate their mentorship expertise, and students can use to search for mentors.

* **Functionalities:**
    * **User Authentication (Students & Alumni):** Secure registration and login for both user types.
    * **Profile Management (Students & Alumni):**  Create, read, update profiles for both students and alumni.  Include profile pictures, bios, and relevant fields as defined in entities. Alumni profiles should highlight their professional background and mentorship expertise. Student profiles should highlight their interests and goals.
    * **Mentor Discovery/Search:** Allow students to search for alumni mentors based on criteria like profession, area of expertise, or keywords. Implement filtering and sorting.
    * **Connection Request/Mentorship Request:**  A mechanism for students to request mentorship from alumni. Alumni should be able to accept or reject requests.
    * **Mentorship Session Scheduling:**  Basic functionality for mentors and mentees to schedule mentorship sessions.
    * **Basic Communication (Optional for initial version, prioritize core features if time is limited):**  A simple messaging system or a way to share contact information after a connection is established.
    * **Admin Dashboard (Optional for initial version, prioritize core features if time is limited):**  Basic admin panel to manage users and content (if needed).

**3. Design and Implement a RESTful API Backend (Next.js API Routes & Prisma):**

Develop a RESTful API using Next.js API Routes in the `/app/api` directory. Use Prisma ORM to interact with a PostgreSQL database.

* **API Endpoints (Examples - Expand as needed for all functionalities):**
    * `/api/auth/register/student` (POST): Register a student user.
    * `/api/auth/register/alumni` (POST): Register an alumni user.
    * `/api/auth/login` (POST): Login for both user types.
    * `/api/users/students` (GET): Get a list of students (potentially with pagination).
    * `/api/users/alumni` (GET): Get a list of alumni (potentially with pagination, filtering by expertise).
    * `/api/users/alumni/[id]` (GET): Get a specific alumni profile.
    * `/api/users/students/[id]` (GET): Get a specific student profile.
    * `/api/users/profile` (GET/PUT): Get/Update the logged-in user's profile.
    * `/api/mentorship-requests` (POST): Student sends a mentorship request to an alumnus.
    * `/api/mentorship-requests/alumni` (GET): Alumni gets a list of pending mentorship requests.
    * `/api/mentorship-requests/[id]/accept` (POST): Alumni accepts a mentorship request.
    * `/api/mentorship-requests/[id]/reject` (POST): Alumni rejects a mentorship request.
    * `/api/mentorship-sessions` (POST/GET): Create/Get mentorship sessions.

* **Prisma Schema (`prisma/schema.prisma`):** Define the database schema based on the entities defined in step 2. Include models for `User`, `StudentProfile`, `AlumniProfile`, `MentorshipSession`, `Topic`. Define relationships between these models (e.g., one-to-many, many-to-many).

* **Input Validation (zod):** Use zod to define schemas and validate request bodies for all API endpoints, ensuring data integrity.
* **Error Handling:** Implement robust error handling in API routes to return appropriate HTTP status codes and error messages.

**4. Design and Develop a User-Friendly Frontend Interface (Next.js, TypeScript, Tailwind CSS, Shadcn/UI):**

Create a frontend UI in the `/app` directory using Next.js App Router, TypeScript, Tailwind CSS, Shadcn/UI, and lucide-react icons.

* **UI Components (using Shadcn/UI):**
    * Forms for registration and login (`<Form>`, `<Input>`, `<Button>`).
    * Profile pages for students and alumni (using `<Card>`, `<Avatar>`, `<Typography>`).
    * A mentor directory/search page (using `<Card>`, `<Table>` or `<Grid>`, `<Input>` for search, `<Select>` for filters).
    * Mentorship request interface (displaying requests, buttons to accept/reject).
    * Session scheduling interface (using `<Calendar>` or similar component).
    * Navigation bar and user authentication context.
    * Use lucide-react icons for visual clarity.

* **Frontend Pages (Next.js App Router):**
    * `/` (Home/Landing page - brief description of the platform).
    * `/auth/register/student` (Student registration page).
    * `/auth/register/alumni` (Alumni registration page).
    * `/auth/login` (Login page).
    * `/students` (Student dashboard - potentially list of mentors, upcoming sessions).
    * `/alumni` (Alumni dashboard - potentially list of mentees, pending requests, scheduled sessions).
    * `/alumni/directory` (Directory of alumni mentors, searchable and filterable).
    * `/profile` (User profile page - for logged-in user to view/edit).
    * `/alumni/[id]` (Public profile page for an alumnus).
    * `/students/[id]` (Public profile page for a student).

* **Data Fetching:** Use `fetch` or a library like `axios` to consume the backend API endpoints from the frontend components.
* **Client-Side Validation (zod):**  Re-use or adapt zod schemas for client-side form validation to improve user experience.
* **Responsive Design (Tailwind CSS):** Ensure the UI is responsive and works well on different screen sizes using Tailwind CSS utility classes.

**5. Set up and Configure a PostgreSQL Database (Prisma & Docker Compose):**

* **Docker Compose (`docker-compose.yml`):**  Create a `docker-compose.yml` file to define and run a PostgreSQL database using an Alpine Docker image. Include necessary environment variables for database connection.
* **Prisma Setup:** Configure Prisma to connect to the PostgreSQL database defined in Docker Compose.
* **Database Migrations:** Generate and run Prisma migrations to create the database schema based on your `schema.prisma` file.  Include instructions for running migrations in the README.

**6. Integrate, Test, and Refine:**

* Integrate all components (frontend, backend, database).
* Test all core functionalities: User registration, login, profile creation/update, mentor search, mentorship request, session scheduling (if implemented).
* Refine the application based on testing, focusing on core functionality and stability. Prioritize essential features over advanced ones for this initial build.
* Use TypeScript to ensure type safety and code quality throughout the integration and testing process.

**7. Generate a Comprehensive README (`README.md`):**

Create a `README.md` file in the project root with the following sections:

* **Application Description:** Describe the "Alumni mentorship platform" and its core purpose, referencing the user's text description. Explain the implemented functionalities.
* **Assumptions and Design Decisions:** Document all assumptions and design decisions made during development based on the vague user description. For example, assumptions about user roles, profile fields, search criteria, etc.  Highlight areas where the application could be expanded with more specific user direction.
* **Tech Stack:** List the technologies used: Next.js 14+, TypeScript, Tailwind CSS, Shadcn/UI, lucide-react, zod, Prisma, PostgreSQL, Docker.
* **Local Development Setup:**
    * Instructions for setting up Node.js and npm/yarn.
    * Instructions for installing dependencies (`npm install` or `yarn install`).
    * Instructions for setting up and running the PostgreSQL database using Docker Compose (`docker-compose up -d`).
    * Instructions for running Prisma migrations (`npx prisma migrate dev`).
    * Instructions for running the development server for both frontend and backend (`npm run dev` or `yarn dev`).
* **API Documentation:**  Provide basic documentation for the implemented API endpoints, including:
    * Endpoint URLs.
    * Request methods (GET, POST, PUT, DELETE).
    * Request body formats (if applicable, using example JSON).
    * Response body formats (if applicable, using example JSON).
* **Prisma Schema Documentation:** Briefly explain the Prisma schema and how to run database migrations.
* **Potential Improvements and Future Features:** Suggest potential improvements and future features that could be added to the platform based on the initial implementation and user description.

**Begin building the Alumni Mentorship Platform autonomously, following these steps and using the specified tech stack. Good luck!**
```
