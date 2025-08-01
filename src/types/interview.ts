export interface InterviewSettings {
  duration: number; // minutes
  language: string;
  voice: string;
  allowEarlyEnd: boolean;
  liveFeedback: boolean;
  timeRemaining: boolean;
  postReflection: boolean;
}

export interface APIKeys {
  deepgram: string;
  openai: string;
  speechify?: string;
}

export interface InterviewData {
  jobDescription: string;
  resume: string;
  coverLetter?: string;
}

export interface FeedbackMoment {
  id: string;
  timestamp: string;
  question: string;
  userResponse: string;
  feedback: string;
  recommendation: string;
  type: 'strength' | 'improvement';
}

export interface InterviewSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  transcripts: Array<{
    speaker: 'interviewer' | 'user';
    text: string;
    timestamp: Date;
  }>;
  feedbackMoments: FeedbackMoment[];
  summary?: string;
}

export type InterviewPhase = 'landing' | 'setup' | 'interview' | 'reflection';