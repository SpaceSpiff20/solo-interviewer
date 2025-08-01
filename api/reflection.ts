/// <reference types="node" />
import { VercelRequest, VercelResponse } from '@vercel/node';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcripts, interviewData, duration, apiKeys } = req.body;

    if (!apiKeys?.openai) {
      return res.status(400).json({ error: 'OpenAI API key required' });
    }

    // Format transcripts for analysis
    const conversationText = transcripts
      .map((t: any) => `${t.speaker}: ${t.text}`)
      .join('\n');

    const reflectionPrompt = `Analyze this job interview and provide constructive feedback.

Job Description: ${interviewData?.jobDescription || 'Not provided'}
Resume: ${interviewData?.resume || 'Not provided'}
Interview Duration: ${Math.floor(duration / 60)} minutes

Interview Transcript:
${conversationText}

Please provide:
1. A brief overall summary (2-3 sentences) highlighting strengths and areas for improvement
2. 3-5 specific moments with timestamps, questions asked, candidate responses, and recommendations

Format your response as JSON:
{
  "summary": "Overall assessment...",
  "feedbackMoments": [
    {
      "id": "1",
      "timestamp": "2:30",
      "question": "Question that was asked",
      "userResponse": "How the candidate responded",
      "feedback": "What they did well or could improve",
      "recommendation": "Specific advice for improvement",
      "type": "strength" or "improvement"
    }
  ]
}`;

    // Call OpenAI API for reflection
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.openai}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert job interview coach providing constructive feedback.' },
          { role: 'user', content: reflectionPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const reflectionText = openaiData.choices[0]?.message?.content;

    if (!reflectionText) {
      throw new Error('No reflection generated');
    }

    // Parse the JSON response
    const reflection = JSON.parse(reflectionText);

    res.status(200).json(reflection);

  } catch (error) {
    console.error('Reflection API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default handler;