# AlumniMentor

A platform connecting high school students with alumni mentors for guidance and professional development.

## Features

### For Students

- Find mentors based on their expertise and professional background
- Send mentorship requests to alumni
- Schedule one-on-one mentoring sessions
- Track session history and upcoming meetings
- Manage mentorship requests and connections

### For Alumni

- Create a professional profile highlighting expertise and experience
- Set weekly availability for mentoring sessions
- Accept/reject mentorship requests
- Manage scheduled sessions
- Track mentoring history

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Database Setup with Docker Compose

1. Create a `docker-compose.yml` file in the root directory (already included in the repository).

2. Start the PostgreSQL container:

```bash
docker-compose up -d
```

3. Verify the container is running:

```bash
docker-compose ps
```

4. To stop the database:

```bash
docker-compose down
```

To persist the database data between restarts, the configuration uses a named volume `postgres_data`.

The database will be available at `postgresql://postgres:postgres@localhost:5433/mentor_db`

### Installation

1. Clone the repository:

```bash
git clone git@github.com:swiftugandan/mentor.git
cd mentor
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
# If using Docker:
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mentor_db"
# If using local PostgreSQL:
# DATABASE_URL="postgresql://[user]:[password]@localhost:5432/mentor_db"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── forms/            # Form components
│   └── ui/               # UI components
├── lib/                  # Utility functions and configurations
└── types/               # TypeScript type definitions
```

## Features in Detail

### Authentication

- Email/password authentication
- Role-based access control (Student/Alumni)
- Protected routes and API endpoints

### Profile Management

- Separate profile types for students and alumni
- Editable professional information
- Skills and interests tracking

### Mentorship System

- Request-based mentorship connections
- Availability management for mentors
- Session scheduling with availability checks
- Session status tracking (Scheduled/Completed/Cancelled)

### Dashboard

- Role-specific dashboards
- Upcoming sessions overview
- Recent activity tracking
- Quick access to key features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Running with Docker

You can run the entire application stack (Next.js app and PostgreSQL) using Docker Compose:

1. Build and start the containers:

```bash
docker-compose up --build
```

This will:

- Start PostgreSQL database
- Wait for database to be ready
- Run all pending migrations automatically
- Build and start the Next.js application

2. The application will be available at `http://localhost:3000`

3. To stop the application:

```bash
docker-compose down
```

4. To view logs:

```bash
docker-compose logs -f
```

The Docker setup includes:

- Next.js application running in production mode
- PostgreSQL database with persistent storage
- Automatic database migrations on startup
- Automatic Prisma client generation
- Health checks to ensure proper service startup

### Development Setup

If you prefer to run the application locally for development:
