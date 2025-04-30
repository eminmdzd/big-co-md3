#!/usr/bin/env node

// Script to run the notification process
import { notifyUsersWithoutPattern } from './notify-pattern-setup.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Running pattern setup notification script...');

notifyUsersWithoutPattern()
  .then(result => {
    console.log('Notification run completed successfully:');
    console.log(`- ${result.totalUsers} users without patterns found`);
    console.log(`- ${result.successCount} emails sent successfully`);
    console.log(`- ${result.failureCount} emails failed to send`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Notification run failed:', error);
    process.exit(1);
  });