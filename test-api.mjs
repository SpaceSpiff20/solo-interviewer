import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local if it exists
try {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});
  
  // Set environment variables
  Object.assign(process.env, envVars);
} catch (error) {
  console.log('No .env.local file found, using existing environment variables');
}

async function testInterviewAPI() {
  const testPayload = {
    transcript: "Hello, I'm excited to be here for this interview.",
    conversationHistory: [
      { role: 'system', content: 'You are conducting a job interview.' },
      { role: 'user', content: 'Hello, I\'m excited to be here for this interview.' }
    ],
    apiKeys: {
      openai: process.env.OPENAI_API_KEY || 'test-openai-key',
      speechify: process.env.SPEECHIFY_API_KEY || 'test-speechify-key'
    },
    interviewData: {
      jobDescription: "Software Engineer position",
      resume: "Experienced developer with React skills",
      coverLetter: "Passionate about technology"
    }
  };

  try {
    console.log('Testing interview API...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch('http://localhost:3000/api/interview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const buffer = await response.buffer();
      console.log('Response size:', buffer.length, 'bytes');
      console.log('Response type: audio/mpeg');
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testInterviewAPI(); 