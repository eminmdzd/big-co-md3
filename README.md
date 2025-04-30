# Security Pattern Authentication System

A web application that implements a security pattern-based authentication system, with email notifications for users who haven't set up their security patterns.

## Features

- User registration and login
- Security pattern setup
- Pattern-based authentication
- Automated email notifications for users who haven't set up patterns

## Getting Started

### Prerequisites

- Node.js (18.x or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"

# Authentication
JWT_SECRET=your-jwt-secret-key

# SendGrid Email
SENDGRID_API_KEY=your-sendgrid-api-key

# Cron Jobs (for API-triggered notifications)
CRON_API_KEY=your-cron-job-api-key
```

4. Set up the database:
```
npx prisma migrate dev
```

5. Run the development server:
```
npm run dev
```

The application will be available at http://localhost:3000.

## User Notification System

### Manual Execution

To send notifications to users who haven't set up their security patterns:

```
npm run notify-users
```

### Scheduled Execution

Set up a cron job or scheduled task to run notifications regularly:

```
0 9 * * * cd /path/to/project && npm run notify-users
```

Or use an HTTP request to trigger notifications:

```
curl -X GET "http://localhost:3000/api/cron/pattern-reminders?apiKey=your-cron-job-api-key"
```

## Testing Email Configuration

To test the SendGrid email configuration:

```
npm run test:email your-test-email@example.com
```

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

## License

This project is licensed under the MIT License.