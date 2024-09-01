# App SETUP

This application is a NestJS project that uses a PostgreSQL database. Follow the steps below to set up and run the application.

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

### 4. Create a .env file in the project root directory with the following content:

Replace the password with the password that you have given to the postgres-start.sh script. Do not change the other pairs.

```bash
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD='your-password-from-script'
POSTGRES_DATABASE=movies_mgmt_db
POSTGRES_DATABASE_TEST=movies_mgmt_test_db
```

pgAdmin is available at **http://localhost:80** with the following default credentials:

**Email: admin@admin.com, Password: admin**

# Approach

lorem ipsum.

## 1.

## 2.

# Key Decisions

lorem ipsum.

# Challenges Faced

lorem ipsum.
