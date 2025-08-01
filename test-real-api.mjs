import fetch from 'node-fetch';

async function testInterviewAPIWithRealKeys() {
  // You'll need to replace these with your actual API keys
  const realApiKeys = {
    openai: process.env.OPENAI_API_KEY || 'sk-your-actual-openai-key',
    speechify: process.env.SPEECHIFY_API_KEY || 'your-actual-speechify-key',
    deepgram: process.env.DEEPGRAM_API_KEY || 'your-actual-deepgram-key'
  };

  const testPayload = {
    transcript: "Hello, I'm excited to be here for this interview.",
    conversationHistory: [
      { role: 'system', content: 'You are conducting a job interview.' },
      { role: 'user', content: 'Hello, I\'m excited to be here for this interview.' }
    ],
    apiKeys: realApiKeys,
    interviewData: {
      jobDescription: "Software Engineer position at a tech company",
      resume: "Experienced developer with React and TypeScript skills",
      coverLetter: "Passionate about technology and innovation"
    }
  };

  try {
    console.log('Testing interview API with real keys...');
    console.log('API Keys present:', {
      openai: !!realApiKeys.openai && realApiKeys.openai !== 'sk-your-actual-openai-key',
      speechify: !!realApiKeys.speechify && realApiKeys.speechify !== 'your-actual-speechify-key',
      deepgram: !!realApiKeys.deepgram && realApiKeys.deepgram !== 'your-actual-deepgram-key'
    });
    
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
      console.log('✅ SUCCESS! Response size:', buffer.length, 'bytes');
      console.log('Response type: audio/mpeg');
      
      // Save the audio file for testing
      const fs = await import('fs');
      fs.writeFileSync('test-audio.mp3', buffer);
      console.log('Audio saved as test-audio.mp3');
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testInterviewAPIWithRealKeys(); 