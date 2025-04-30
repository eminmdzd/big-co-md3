# Security Pattern Notification Scripts

These scripts help identify users who haven't set up their security patterns and send them reminder emails.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the project root (use `.env.example` as a template):
   ```
   SENDGRID_API_KEY=your-sendgrid-api-key
   NEXT_PUBLIC_APP_URL=https://your-app-url.com
   CRON_API_KEY=your-cron-job-api-key
   ```

3. **Important**: Verify your sender email in SendGrid:
   - Log in to your SendGrid account
   - Go to Settings > Sender Authentication
   - Verify the sender email (emailfakeitteamihgdemo@gmail.com)
   - Complete the verification process by clicking the link in the email sent to that address

## Usage

### Manual Execution

Run the notification script manually:

```
npm run notify-users
```

### Scheduled Execution

#### Using cron on a server

Add this to your crontab (runs daily at 9am):

```
0 9 * * * cd /path/to/project && npm run notify-users
```

#### Using external scheduling service

Call the API endpoint with your secret key:

```
curl -X GET "https://your-app-url.com/api/cron/pattern-reminders?apiKey=your-cron-job-api-key"
```

## How It Works

1. The script identifies users with `isPatternSet: false` in the database
2. It sends personalized emails using SendGrid with a direct link to set up their pattern
3. If SENDGRID_API_KEY is not set, emails are logged but not sent (useful for testing)

## Files

- `notify-pattern-setup.js`: Core logic for identifying users and sending emails
- `run-notifications.js`: Wrapper script for manual execution
- `/api/cron/pattern-reminders/route.js`: API endpoint for scheduled execution