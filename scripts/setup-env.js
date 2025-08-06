#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const envPath = join(projectRoot, '.env');

console.log('🔧 Setting up environment variables for ADHD Task Manager\n');

// Check if .env already exists
if (existsSync(envPath)) {
  console.log('⚠️  .env file already exists. This will overwrite it.');
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise(resolve => {
    readline.question('Do you want to continue? (y/N): ', resolve);
  });
  readline.close();
  
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('Setup cancelled.');
    process.exit(0);
  }
}

console.log('Please provide the following information:\n');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => readline.question(prompt, resolve));

try {
  const supabaseUrl = await question('Supabase URL (e.g., https://your-project.supabase.co): ');
  const supabaseKey = await question('Supabase Anon Key: ');
  const openaiKey = await question('OpenAI API Key (optional, press Enter to skip): ');
  
  readline.close();
  
  // Create .env content
  const envContent = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseKey}

# OpenAI Configuration (for AI features)
${openaiKey ? `OPENAI_API_KEY=${openaiKey}` : '# OPENAI_API_KEY=your-openai-api-key-here'}

# Application Configuration
NODE_ENV=development
`;

  // Write .env file
  writeFileSync(envPath, envContent);
  
  console.log('\n✅ Environment variables configured successfully!');
  console.log('📁 .env file created at:', envPath);
  console.log('\n🚀 You can now run the application with: npm run dev');
  
} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
} 