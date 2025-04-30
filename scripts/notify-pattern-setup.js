// This script sends notification emails to users who have accounts but haven't set up their security pattern
import { prisma } from '../src/lib/prisma.js';
import sgMail from '@sendgrid/mail';

// Set SendGrid API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not set. Emails will be logged but not sent.');
}

// Sender email - must be verified in SendGrid account
const FROM_EMAIL = 'fakeitteamihgdemo@gmail.com';
const FROM_NAME = 'IHG Security Team';

// Function to send email notification to a user using SendGrid
async function sendNotificationEmail(user) {
  try {
    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/pattern-setup?userId=${user.id}`;
    
    const msg = {
      to: user.email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject: 'Security Pattern Setup Reminder',
      text: `Hello ${user.username},\n\nWe noticed you haven't set up your security pattern yet. This additional security feature helps protect your account. Please log in and set up your pattern at your earliest convenience.\n\nSetup link: ${setupUrl}\n\nThank you,\nSecurity Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Security Pattern Setup Reminder</h2>
          <p>Hello ${user.username},</p>
          <p>We noticed you haven't set up your security pattern yet. This additional security feature helps protect your account.</p>
          <p>Please log in and set up your pattern at your earliest convenience.</p>
          <p><a href="${setupUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Set Up Security Pattern</a></p>
          <p>Or copy and paste this link: ${setupUrl}</p>
          <p>Thank you,<br>Security Team</p>
        </div>
      `
    };

    // If SendGrid API key is not set, just log the email
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Would send email (SENDGRID_API_KEY not set):');
      console.log(JSON.stringify(msg, null, 2));
      return true;
    }
    
    // Send email through SendGrid
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${user.email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${user.email}:`, error);
    
    // Detailed SendGrid error logging
    if (error.response) {
      console.error('SendGrid Error Details:');
      console.error('Status code:', error.code);
      console.error('Body:', JSON.stringify(error.response.body, null, 2));
    }
    
    return false;
  }
}

// Main function to find users without security patterns and send notifications
async function notifyUsersWithoutPattern() {
  try {
    console.log('Starting notification process for users without security patterns...');
    
    // Find all users who don't have a security pattern set up
    const users = await prisma.user.findMany({
      where: {
        securityPattern: null
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    });
    
    console.log(`Found ${users.length} users without security patterns.`);
    
    // Track success and failure counts
    let successCount = 0;
    let failureCount = 0;
    
    // Send email to each user
    for (const user of users) {
      const sent = await sendNotificationEmail(user);
      if (sent) {
        successCount++;
      } else {
        failureCount++;
      }
    }
    
    console.log('Notification process completed:');
    console.log(`- ${successCount} emails sent successfully`);
    console.log(`- ${failureCount} emails failed to send`);
    
    return {
      totalUsers: users.length,
      successCount,
      failureCount
    };
  } catch (error) {
    console.error('Error in notification process:', error);
    throw error;
  } finally {
    // Close Prisma client connection
    await prisma.$disconnect();
  }
}

// Execute the script if run directly
if (process.argv[1].endsWith('notify-pattern-setup.js')) {
  notifyUsersWithoutPattern()
    .then(result => {
      console.log('Script execution complete:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Script execution failed:', error);
      process.exit(1);
    });
}

export { notifyUsersWithoutPattern };