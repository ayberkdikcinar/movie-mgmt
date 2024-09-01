# MOVIE MANAGEMENT SYSTEM

This application is a NestJS project that serves as a RESTful API for managing movies. It is designed to handle user registration, movie management, ticket purchases, and viewing history. The project is structured according to Domain-Driven Design principles and uses a PostgreSQL database hosted on AWS RDS for production, with Heroku as the deployment platform.

## HEROKU ENDPOINT

Application has published via heroku and it publicly available at:

```bash
https://movie-mgmt-9aaa3af3ab1b.herokuapp.com/api
```

## API Documentation

API documentation is provided via Swagger. Once the application is running, you can access the API documentation at:

```bash
http://localhost:3000/api
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system.
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your system.

### Setup the PostgreSQL Database

The database setup script is included in the repository under src/config/scripts/postgres-start.sh. This script will set up a new PostgreSQL instance, create the database and test_database.

Ensure the script has execution permissions:

```bash
chmod +x src/config/postgres-start.sh
```

Run the script at **src/config/postgres-start.sh**

**Script will accept a password for the database_user as an input.**

### 4. Create a dev.env file in the project root directory with the following content:

Replace the password with the password that you have given to the postgres-start.sh script. Do not change the other pairs.

```bash
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD='your-password-from-script'
POSTGRES_DATABASE=movies_mgmt_db
POSTGRES_DATABASE_TEST=movies_mgmt_test_db
PORT=3000
```

pgAdmin is available at **http://localhost:80** with the following default credentials:

**Email: admin@admin.com, Password: admin**

# Approach

This project is designed following Domain-Driven Design principles and RESTful architecture. The backend is built with NestJS, and PostgreSQL is used as the database management system.

### API Structure and Design

The API for the Movie Management System is structured following RESTful principles, ensuring that each endpoint is intuitive, predictable, and adheres to the standards of modern web API design. The endpoints are organized around the core resources of the system: auth, users, movies, tickets, and sessions. Each resource has specific endpoints to handle CRUD operations and other necessary actions, with clear distinctions between public and protected routes.

- GET /api/health: A simple health check endpoint to verify that the API is up and running.
- POST /api/auth/signup: Allows new users to register. For testing purposes, a user can sign up as either a manager or a customer.
- POST /api/auth/signin: Enables existing users to sign in and receive an authentication token.
- GET /api/auth/me: Returns the currently authenticated user's details.
- GET /api/users/watch-history: Allows customers to view their watch history. This is a protected route accessible only to customers.
- GET /api/users/tickets: Returns the list of tickets purchased by the authenticated customer.
- GET /api/movies: Lists all available movies, with support for pagination and search via query options.
- POST /api/movies: Allows managers to add new movies. This is a protected route accessible only to managers.
- PATCH /api/movies: Enables managers to update existing movies. This route is also protected for managers only.
- GET /api/movies/{movieId}: Retrieves details for a specific movie by its ID.
- DELETE /api/movies/{id}: Allows managers to delete a movie. This is a protected route accessible only to managers.
- GET /api/movies/{movieId}/watch: Allows customers to watch a movie for which they have a valid ticket. This is a protected route for customers only.
- POST /api/tickets/purchase: Allows customers to purchase tickets for a movie session. This is a protected route for customers only.
- GET /api/tickets/validate/{ticketId}: Validates a ticket's authenticity and status.
- POST /api/sessions: Allows managers to create new movie sessions. This is a protected route for managers only.
- GET /api/sessions/{movieId}: Retrieves the sessions available for a specific movie.

### User Management:

Users can register with role and log in with a username, password. Roles (manager or customer) are assigned manually in the body during signup for easy testing, although this is not recommended for production.

### Movie Management:

Managers can add, modify, and delete movies. Each movie has a name, age restriction, and multiple sessions, including date, time slot, and room number.

### Ticket Management:

Customers can buy tickets for specific movie sessions and watch movies for which they have a valid ticket.
Watch History: Customers can view a list of movies they've watched.

### Session Management:

Managers can create movie sessions, and the users can list the sessions for a movie.

### Movie Listing with Query Options

To enhance the flexibility and efficiency of movie listing in the system, I implemented a QueryOptionsDto class that allows users to customize their query parameters. This feature provides pagination and search capabilities, enabling users to filter and paginate the list of available movies.

### Continuous Integration

GitHub Actions is used to run tests and ensure the application's stability. When changes are made, a pull request is created from the dev branch to the main branch. Once merged, the tests run automatically.

### Deployment

The project is deployed on Heroku, which automatically deploys the latest changes from the main branch. AWS RDS PostgreSQL is used as the production database to ensure scalability and reliability.

# Key Decisions

### PostgreSQL Setup on Local

For local development, a Docker-based PostgreSQL setup was chosen to create a consistent and isolated environment. This setup is achieved through a custom script (postgres-start.sh), which automates the process of spinning up a PostgreSQL container, creating the necessary databases, and configuring the environment. This decision helps reduce discrepancies between local and production environments, ensuring that local testing closely mirrors production conditions.

### Watch Movie Endpoint

Originally, a validation check was implemented to ensure that the current time matched the time slot for watching a movie. However, this check was removed to simplify the testing process. While this feature adds realism, it complicates testing and development, so it was temporarily disabled.

### User Roles in Signup

During the signup process, roles such as manager or customer can be assigned for easy testing. While assigning a manager role during signup is convenient for testing, it is not a best practice in a real production environment.

### Authentication

For managing authentication, I chose to use JWT (JSON Web Token) due to its stateless nature and wide adoption in modern web applications. This allows secure authentication across the API, ensuring that only authenticated users can access protected routes.

# Challenges Faced

### Timezone Issues

Timezone discrepancies can lead to issues, particularly when dealing with movie sessions that span across different regions. Proper handling and conversion of timezones is crucial but can introduce complexity. I have used UTC timezone, so be aware while testing the app.

### Circular Dependency Issue

While developing the project, a circular dependency issue was encountered due to the intertwined nature of some modules. This issue arose primarily because of the complex relationships defined using TypeORM's features, such as @ManyToOne and @OneToMany decorators, which are used to establish associations between entities like users, movies, and tickets.

In a typical setup, these relationships create dependencies between various entities and their respective repositories, which can lead to circular dependencies when these entities need to reference each other.

### Validation on WatchMovie Endpoint

Implementing a validation check on the WatchMovie endpoint to ensure the movie is watched within the correct time slot presented challenges, particularly for testing. This validation was temporarily removed to facilitate easier testing of the application.

### End-to-End (E2E) Testing

The end-to-end tests were particularly challenging due to the complexity of the interactions between different parts of the system. Properly simulating these interactions to ensure that the tests were both thorough and reliable required significant effort.

### Mocking in Unit Tests

Mocking dependencies in unit tests was more time-consuming than initially expected. Setting up the mocks to accurately reflect the system's behavior and ensuring they remained maintainable was a meticulous and tiring process, but it was necessary to achieve high test coverage.
