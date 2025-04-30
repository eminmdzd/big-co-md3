# Security Pattern Authentication System

A web application that implements a security pattern-based authentication system, with email notifications for users who haven't set up their security patterns.

## Features

- User registration and login
- Security pattern setup and verification
- Pattern-based two-factor authentication
- Automated email notifications for users without security patterns
- Account lockout after multiple failed attempts

## Getting Started

### Prerequisites

- Node.js (18.x or higher)
- npm or yarn
- SQLite (included)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy the example environment file: `cp .env.example .env`
   - Or create a `.env` file with the following content:
   ```
   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Authentication
   JWT_SECRET=your_jwt_secret_here

   # SendGrid Email Configuration
   SENDGRID_API_KEY=your_sendgrid_api_key_here

   # Node Environment
   NODE_ENV=development
   ```

4. Set up the database:
```bash
npx prisma db push
```

5. Create test users (some with and some without patterns):
```bash
npm run create-test-users
```

6. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Project Scripts

The project includes several npm scripts to help with development and testing:

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server on port 3000 |
| `npm run dev:static` | Starts the development server in Turbo mode |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs linting checks on the codebase |
| `npm run create-test-users` | Creates test users with and without security patterns |
| `npm run notify-users` | Runs the notification script to email users without patterns |
| `npm run test:email` | Tests SendGrid email configuration with a specified email address |

## Local Development Workflow

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser

3. Log in with one of the test users:
   - `user_with_pattern / password123` - Has a security pattern already set
   - `user_no_pattern / password123` - Doesn't have a security pattern
   - `admin / admin123` - Another user without a security pattern

### Testing Notification System

To send notification emails to users who haven't set up their security patterns:

```bash
npm run notify-users
```

This script finds all users without security patterns and sends them reminder emails with instructions on how to set up their pattern.

If you want to schedule this to run automatically, you could set up a cron job in a production environment:

```
0 9 * * * cd /path/to/project && npm run notify-users
```

This would run the notification script every day at 9am.

### Testing Email Configuration

Before sending real notifications, test your SendGrid email configuration:

```bash
npm run test:email your-test-email@example.com
```

This will send a test email to the specified address using your SendGrid API key.

## Security Patterns

The system uses a combination of phrases, images, and icons for security patterns:

- **Phrases**: Common statements that users can remember easily
- **Images**: Visual elements that add a graphical component to the pattern
- **Icons**: Emoji icons that provide a quick visual reference

Users must select a combination of these elements to create their unique security pattern.

## Authentication Flow

1. **User Registration**: User creates an account with username, email, and password
2. **Pattern Setup**: User selects a combination of phrases, images, and icons
3. **Login Process**: 
   - User enters username and password
   - If valid, user is prompted to verify their security pattern
4. **Pattern Verification**: User must correctly enter their security pattern to gain access
5. **Account Security**: After 5 failed pattern attempts, the account is temporarily locked

## Project Structure

The project follows a standard Next.js application structure:

- `/src/app` - Next.js app router routes and API endpoints
- `/src/components` - React components for UI
- `/src/lib` - Core functionality and utilities
- `/scripts` - Utility scripts for notifications and test users
- `/prisma` - Database schema and configuration
- `/public` - Static assets including pattern images

## License

This project is licensed under the MIT License.