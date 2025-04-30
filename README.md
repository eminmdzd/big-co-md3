# Security Pattern Authentication System

A web application that implements a security pattern-based authentication system, with email notifications for users who haven't set up their security patterns.

## Features

- User registration and login
- Security pattern setup using universally recognizable symbols
- Pattern-based two-factor authentication
- Automated email notifications for users without security patterns
- Account lockout after multiple failed attempts
- One-time use secure setup links via email

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

This script finds all users without security patterns and sends them reminder emails with secure links to set up their pattern. These links:

- Allow direct pattern setup without requiring login
- Are valid for 7 days
- Can only be used once (become invalid immediately after successful use)
- Include user identification and purpose verification

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

The system uses universally recognizable symbols for pattern creation:

- **Numbers**: Numeric emojis (1️⃣, 2️⃣, 3️⃣, etc.) that are language-independent
- **Shapes**: Shape emojis (⭐, 🔶, 🔷, etc.) that are visually distinctive
- **Objects**: Object emojis (🏠, 🚗, ⚽, etc.) that are easily recognizable worldwide

Users must select one element from each category to create their unique 3-element pattern. 
Elements are randomly shuffled for each user to ensure pattern uniqueness and security.

## Authentication Flow

1. **User Registration**: User creates an account with username, email, and password
2. **Pattern Setup**: User selects a pattern of one number, one shape, and one object
3. **Login Process**: 
   - User enters username and password
   - If valid, user is prompted to verify their security pattern
4. **Pattern Verification**: User must correctly enter their security pattern to gain access
5. **Account Security**: After 5 failed pattern attempts, the account is temporarily locked

## Alternative Setup Flow

Users can also set up their security pattern through a secure link sent via email:

1. **Email Notification**: System sends email with a secure one-time-use setup link
2. **Direct Setup**: User clicks link and is taken directly to pattern setup (no login required)
3. **Pattern Creation**: User selects their pattern elements
4. **Link Invalidation**: After successful setup, the link is immediately invalidated
5. **Automatic Login**: User is logged in and can access the system

This alternative flow makes it easier for users to complete their security setup.

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