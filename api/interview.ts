import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, conversationHistory, apiKeys, interviewData } = req.body;

    if (!apiKeys?.openai || !apiKeys?.speechify) {
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
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const interviewerResponse = openaiData.choices[0]?.message?.content;

    if (!interviewerResponse) {
      throw new Error('No response from OpenAI');
    }

    // Call Speechify TTS API
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
      throw new Error(`Speechify API error: ${speechifyResponse.status}`);
    }

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the audio response
    const speechifyStream = speechifyResponse.body;
    if (speechifyStream) {
      speechifyStream.pipe(res);
    } else {
      throw new Error('No audio stream received from Speechify');
    }

  } catch (error) {
    console.error('Interview API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}