/// <reference types="node" />
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'node:stream';

// Add timeout handling
const TIMEOUT_MS = 25000; // 25 seconds to stay under 30s limit

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

    // Call OpenAI API with timeout
    console.log('Calling OpenAI API with messages:', messages.length);
    const openaiController = new AbortController();
    const openaiTimeout = setTimeout(() => openaiController.abort(), 15000); // 15 second timeout
    
    let interviewerResponse: string;
    
    try {
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
        signal: openaiController.signal,
      });

      clearTimeout(openaiTimeout);

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('OpenAI API error:', openaiResponse.status, errorText);
        throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
      }

      const openaiData = await openaiResponse.json();
      interviewerResponse = openaiData.choices[0]?.message?.content;

      if (!interviewerResponse) {
        throw new Error('No response from OpenAI');
      }
      
      console.log('OpenAI response received:', interviewerResponse.substring(0, 100) + '...');
      
    } catch (openaiError) {
      clearTimeout(openaiTimeout);
      if (openaiError instanceof Error && openaiError.name === 'AbortError') {
        throw new Error('OpenAI API request timed out');
      }
      throw openaiError;
    }

    // Call Speechify TTS API with timeout
    console.log('Calling Speechify API with response:', interviewerResponse.substring(0, 100) + '...');
    const speechifyController = new AbortController();
    const speechifyTimeout = setTimeout(() => speechifyController.abort(), 15000); // 15 second timeout
    
    let speechifyResponse: Response;
    
    try {
      speechifyResponse = await fetch('https://api.speechify.com/v1/audio/speech', {
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
        signal: speechifyController.signal,
      });

      clearTimeout(speechifyTimeout);

      if (!speechifyResponse.ok) {
        const errorText = await speechifyResponse.text();
        console.error('Speechify API error:', speechifyResponse.status, errorText);
        throw new Error(`Speechify API error: ${speechifyResponse.status} - ${errorText}`);
      }
      
      console.log('Speechify API call successful');
      
    } catch (speechifyError) {
      clearTimeout(speechifyTimeout);
      if (speechifyError instanceof Error && speechifyError.name === 'AbortError') {
        throw new Error('Speechify API request timed out');
      }
      throw speechifyError;
    }

    // Headers will be set when sending the response

    // Get the audio response from Speechify
    const speechifyStream = speechifyResponse.body;
    console.log('Speechify stream available:', !!speechifyStream);
    
    if (!speechifyStream) {
      throw new Error('No audio stream received from Speechify');
    }

    // Set up timeout
    const timeout = setTimeout(() => {
      console.error('Stream timeout after', TIMEOUT_MS, 'ms');
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream timeout', details: 'Audio generation took too long' });
      }
    }, TIMEOUT_MS);

    try {
      // Read all chunks into a buffer
      const reader = speechifyStream.getReader();
      let chunkCount = 0;
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        chunkCount++;
        
        if (chunkCount % 10 === 0) {
          console.log('Stream chunk:', chunkCount, 'size:', value?.length);
        }
      }
      
      console.log('Stream completed, total chunks:', chunkCount);
      
      // Clear timeout since we completed successfully
      clearTimeout(timeout);
      
      if (chunks.length === 0) {
        throw new Error('No audio data received from Speechify');
      }
      
      // Combine all chunks into a single buffer
      const audioBuffer = Buffer.concat(chunks);
      console.log('Total audio size:', audioBuffer.length, 'bytes');
      
      // Send as single response
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length.toString());
      res.setHeader('Cache-Control', 'no-cache');
      
      res.end(audioBuffer);
      
    } catch (streamError) {
      clearTimeout(timeout);
      console.error('Stream processing error:', streamError);
      
      // If we can't get audio, return a simple text response
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Audio generation failed', 
          details: streamError instanceof Error ? streamError.message : 'Unknown stream error',
          fallback: 'Text response only'
        });
      }
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