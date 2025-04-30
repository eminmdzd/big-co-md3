#!/usr/bin/env node

// Test script for SendGrid email configuration
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get test email address from command line
const testEmail = process.argv[2];

if (!testEmail) {
  console.error('Please provide a test email address:');
  console.error('npm run test:email your-test-email@example.com');
  process.exit(1);
}

// Validate email format (simple check)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(testEmail)) {
  console.error('Invalid email format. Please provide a valid email address.');
  process.exit(1);
}

// Set SendGrid API key
if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY not set in environment variables.');
  console.error('Please add your SendGrid API key to your .env file.');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Sender email - must be verified in SendGrid
const FROM_EMAIL = 'fakeitteamihgdemo@gmail.com';
const FROM_NAME = 'IHG Security Team';

// Create test email message
const msg = {
  to: testEmail,
  from: {
    email: FROM_EMAIL,
    name: FROM_NAME
  },
  subject: 'SendGrid Test Email',
  text: 'This is a test email to verify your SendGrid configuration works correctly.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>SendGrid Test Email</h2>
      <p>This is a test email to verify your SendGrid configuration works correctly.</p>
      <p>If you're seeing this message, your email configuration is working properly!</p>
      <p><strong>Next steps:</strong> You can now run the notification script to send emails to users without security patterns.</p>
      <p>
        <code>npm run notify-users</code>
      </p>
    </div>
  `
};

console.log(`Sending test email to ${testEmail}...`);

// Send the test email
sgMail.send(msg)
  .then(() => {
    console.log('✅ Test email sent successfully!');
    console.log(`Check ${testEmail} to verify delivery.`);
    
    console.log('\nTroubleshooting Tips:');
    console.log('- If you do not receive the email, check your spam folder');
    console.log('- Verify that your SendGrid API key is correct');
    console.log('- Ensure that your sender email (fakeitteamihgdemo@gmail.com) is verified in SendGrid');
    console.log('- If still having issues, check the SendGrid Activity Feed for more details');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to send test email:');
    
    if (error.response) {
      console.error('SendGrid Error Details:');
      console.error('Status code:', error.code);
      console.error('Body:', JSON.stringify(error.response.body, null, 2));
      
      // Common errors and solutions
      if (error.code === 403) {
        console.error('\nPossible Solutions:');
        console.error('- Your sender email (fakeitteamihgdemo@gmail.com) may not be verified in SendGrid');
        console.error('- Verify your sender identity: https://docs.sendgrid.com/ui/account-and-settings/sender-verification');
        console.error('- If using a free account, upgrade your plan or contact SendGrid support');
      } else if (error.code === 401) {
        console.error('\nPossible Solutions:');
        console.error('- Your API key may be incorrect or revoked');
        console.error('- Check your .env file and update the SENDGRID_API_KEY value');
        console.error('- Create a new API key in SendGrid if needed');
      }
    } else {
      console.error(error);
    }
    
    process.exit(1);
  });