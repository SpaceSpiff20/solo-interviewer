/// <reference types="node" />
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'node:stream';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, conversationHistory, apiKeys, interviewData } = req.body;

    console.log('Received request with:', {
      hasTranscript: !!transcript,
      conversationHistoryLength: conversationHistory?.length || 0,
      hasOpenAIKey: !!apiKeys?.openai,
      hasSpeechifyKey: !!apiKeys?.speechify,
      hasInterviewData: !!interviewData
    });

    if (!apiKeys?.openai || !apiKeys?.speechify) {
      console.error('Missing API keys:', { openai: !!apiKeys?.openai, speechify: !!apiKeys?.speechify });
      return res.status(400).json({ error: 'Missing required API keys' });
    }

    // Prepare the conversation context for OpenAI
    const systemPrompt = `You are conducting a job interview. You have access to the candidate's resume and the job description. Ask relevant, professional questions based on this information. Keep responses concise and natural. End the interview when you feel you have gathered sufficient information.

Job Description: ${interviewData?.jobDescription || 'Not provided'}
Resume: ${interviewData?.resume || 'Not provided'}
Cover Letter: ${interviewData?.coverLetter || 'Not provided'}

Guidelines:
- Ask 1 question at a time
- Keep questions relevant to the job and candidate's background  
- Vary question types (experience, situational, technical as appropriate)
- Be professional but conversational
- If the candidate gives a good comprehensive answer, acknowledge it briefly before the next question
- End the interview naturally when you've covered key areas`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: transcript }
    ];

    // Call OpenAI API
    console.log('Calling OpenAI API with messages:', messages.length);
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.openai}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const interviewerResponse = openaiData.choices[0]?.message?.content;

    if (!interviewerResponse) {
      throw new Error('No response from OpenAI');
    }

    // Call Speechify TTS API
    console.log('Calling Speechify API with response:', interviewerResponse.substring(0, 100) + '...');
    const speechifyResponse = await fetch('https://api.speechify.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.speechify}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: interviewerResponse,
        voice_id: 'oliver',
        audio_format: 'mp3',
        sample_rate: 24000,
      }),
    });

    if (!speechifyResponse.ok) {
      const errorText = await speechifyResponse.text();
      console.error('Speechify API error:', speechifyResponse.status, errorText);
      throw new Error(`Speechify API error: ${speechifyResponse.status} - ${errorText}`);
    }

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the audio response
    const speechifyStream = speechifyResponse.body;
    console.log('Speechify stream available:', !!speechifyStream);
    if (speechifyStream) {
      // Convert ReadableStream to Node.js stream
      const reader = speechifyStream.getReader();
      let chunkCount = 0;
      const readable = new Readable({
        read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              console.log('Stream completed, total chunks:', chunkCount);
              this.push(null);
            } else {
              chunkCount++;
              if (chunkCount % 10 === 0) {
                console.log('Stream chunk:', chunkCount, 'size:', value?.length);
              }
              this.push(value);
            }
          }).catch(err => {
            console.error('Stream reading error:', err);
            this.destroy(err);
          });
        }
      });
      
      // Handle stream errors
      readable.on('error', (err) => {
        console.error('Readable stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error', details: err.message });
        }
      });
      
      res.on('error', (err) => {
        console.error('Response stream error:', err);
      });
      
      readable.pipe(res);
    } else {
      throw new Error('No audio stream received from Speechify');
    }

  } catch (error) {
    console.error('Interview API error:', error);
    
    // If headers have already been sent, we can't send JSON response
    if (res.headersSent) {
      res.end();
      return;
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default handler;