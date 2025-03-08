// src/utils/email-dev.utils.ts
import fs from 'fs';
import path from 'path';
import { environment } from '../config/environment.config';

/**
 * Utility for development to save emails to disk instead of sending them
 * Only used in development mode
 */
export const saveEmailToDisk = (to: string, subject: string, html: string): void => {
  // Only save emails to disk in development mode
  if (environment.nodeEnv !== 'development') {
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `email_${timestamp}_${to.replace('@', '_at_')}.html`;
  
  // Create emails directory if it doesn't exist
  const emailsDir = path.join(__dirname, '../../emails');
  if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
  }
  
  // Create email content with metadata
  const content = `
<!--
To: ${to}
Subject: ${subject}
Date: ${new Date().toString()}
-->
${html}
  `;
  
  // Write to file
  fs.writeFileSync(path.join(emailsDir, filename), content);
  
  console.log(`Email saved to disk: ${filename}`);
};