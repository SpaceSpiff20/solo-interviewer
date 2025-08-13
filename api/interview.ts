/// <reference types="node" />
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'node:stream';
import { SpeechifyClient } from "@speechify/api";

// Hopefully ensures proper ES module handling
const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, conversationHistory, apiKeys, interviewData, voice = 'oliver' } = req.body;

    console.log('Received request with:', {
      hasTranscript: !!transcript,
      conversationHistoryLength: conversationHistory?.length || 0,
      hasOpenAIKey: !!apiKeys?.openai,
      hasSpeechifyKey: !!apiKeys?.speechify,
      voice: voice,
      hasInterviewData: !!interviewData,
      openaiKeyLength: apiKeys?.openai?.length || 0,
      openaiKeyStart: apiKeys?.openai?.substring(0, 10) || 'none'
    });

    // Debug conversation history structure
    if (conversationHistory?.length > 0) {
      console.log('Conversation history sample:', conversationHistory[0]);
    }

    if (!apiKeys?.openai) {
      console.error('Missing API key:', { openai: !!apiKeys?.openai });
      return res.status(400).json({ error: 'Missing required OpenAI API key' });
    }

    if (!apiKeys?.speechify) {
      console.error('Missing API key:', { speechify: !!apiKeys?.speechify });
      return res.status(400).json({ error: 'Missing required Speechify API key' });
    }

    // Prepare the conversation context for OpenAI
    const systemPrompt = `You are conducting a job interview. You have access to the candidate's resume and the job description. Ask relevant, professional questions based on this information. Keep responses concise and natural. End the interview when you feel you have gathered sufficient information.

Job Description: ${interviewData?.jobDescription || 'Not provided'}
Resume: ${interviewData?.resume || 'Not provided'}
Cover Letter: ${interviewData?.coverLetter || 'Not provided'}

Guidelines:
- Ask 1 question at a time
- Ask questions relevant to the job and candidate's background
- Or ask follow up questions in response to an answer the candidate gave
- Vary question types (experience, situational, technical as appropriate, etc)
- Be professional but conversational
- If the candidate gives a good comprehensive answer, acknowledge it briefly before the next question
- End the interview naturally when you've covered key areas`;

    // Format conversation history to match OpenAI API requirements
    const formattedHistory = conversationHistory?.filter((msg: any) => 
      msg && (msg.text || msg.content) && msg.speaker
    ).map((msg: any) => ({
      role: msg.speaker === 'user' ? 'user' : 'assistant',
      content: msg.text || msg.content
    })) || [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: transcript }
    ];

    console.log('Formatted messages for OpenAI:', {
      totalMessages: messages.length,
      formattedHistoryLength: formattedHistory.length,
      systemPromptLength: systemPrompt.length,
      transcriptLength: transcript.length
    });

    // First, generate the text response using GPT-4o
    console.log('Calling OpenAI API to generate interview response...');
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

    // Then, convert the response to speech using Speechify (if available) or OpenAI TTS
    console.log('Converting response to speech...');
    const ttsController = new AbortController();
    const ttsTimeout = setTimeout(() => ttsController.abort(), 15000); // 15 second timeout
    
    let audioData: ArrayBuffer;
    
    try {
      // Use Speechify for TTS (now required)
      console.log('Using Speechify for TTS...');
      const client = new SpeechifyClient({ token: apiKeys.speechify });
      
      // Map voice to Speechify voice ID
      const voiceMapping: Record<string, string> = {
        'oliver': 'oliver',
        'geoge': 'geoge', 
        'henry': 'henry',
        'lisa': 'lisa',
        'emily': 'emily'
      };
      
      const speechifyVoiceId = voiceMapping[voice] || 'oliver'; // Default to oliver if voice not found
      
      const speechifyResponse = await client.tts.audio.stream({
        accept: "audio/mpeg",
        input: interviewerResponse,
        language: "en",
        model: "simba-english",
        voiceId: speechifyVoiceId
      });

      clearTimeout(ttsTimeout);

      // Convert Readable stream to ArrayBuffer
      const chunks: Buffer[] = [];
      for await (const chunk of speechifyResponse) {
        chunks.push(Buffer.from(chunk));
      }
      
      audioData = Buffer.concat(chunks);
      console.log('Speechify TTS response received, audio size:', audioData.byteLength, 'bytes');
      
    } catch (ttsError) {
      clearTimeout(ttsTimeout);
      if (ttsError instanceof Error && ttsError.name === 'AbortError') {
        throw new Error('TTS API request timed out');
      }
      throw ttsError;
    }

    // Send the audio response
    console.log('Sending audio response...');
    
    // Set headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioData.byteLength.toString());
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send the audio buffer
    res.end(Buffer.from(audioData));

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
};

export default handler;