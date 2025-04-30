// A simple test script for SendGrid configuration
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set API key
if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY environment variable is not set');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Sender details - must match verified sender in SendGrid
const FROM_EMAIL = 'fakeitteamihgdemo@gmail.com';
const FROM_NAME = 'IHG Security Team';

// Get test recipient email from command line arguments or use default
const testEmail = process.argv[2] || 'your-test-email@example.com';

// Test message
const msg = {
  to: testEmail,
  from: {
    email: FROM_EMAIL,
    name: FROM_NAME
  },
  subject: 'SendGrid Test Email',
  text: 'This is a test email sent from the IHG Pattern Security system using SendGrid.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>SendGrid Test Email</h2>
      <p>This is a test email sent from the IHG Pattern Security system using SendGrid.</p>
      <p>If you're receiving this email, it means your SendGrid configuration is working correctly.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Sender: ${FROM_NAME} (${FROM_EMAIL})</li>
        <li>Recipient: ${testEmail}</li>
        <li>Timestamp: ${new Date().toISOString()}</li>
      </ul>
    </div>
  `
};

console.log(`Attempting to send test email to ${testEmail}...`);

// Send the email
sgMail.send(msg)
  .then(() => {
    console.log('✅ Test email sent successfully!');
    console.log(`Check the inbox for ${testEmail}`);
  })
  .catch((error) => {
    console.error('❌ Error sending test email:');
    console.error(error);
    
    if (error.response) {
      console.error('\nError response body:');
      console.error(JSON.stringify(error.response.body, null, 2));
    }
    
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify that your SendGrid API key is correct and has "Mail Send" permissions');
    console.log(`2. Verify that "${FROM_EMAIL}" is a verified sender in your SendGrid account`);
    console.log('3. Check for any SendGrid sending limits or restrictions on your account');
  });