import fs from 'fs';

const filePath = 'C:\\Program Files\\PostgreSQL\\18\\data\\pg_hba.conf';
const backupPath = 'C:\\Program Files\\PostgreSQL\\18\\data\\pg_hba.conf.bak';

try {
  // Read the pg_hba.conf file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Backup the file first if backup doesn't exist
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log('Created backup at:', backupPath);
  }
  
  // Replace scram-sha-256 with trust
  const updatedContent = content.replace(/scram-sha-256/g, 'trust');
  
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log('Successfully updated pg_hba.conf to trust authentication.');
} catch (e) {
  console.error('Error modifying pg_hba.conf:', e);
}
