import { useState, useRef, useCallback, useEffect } from 'react';
import { APIKeys, InterviewData } from '@/types/interview';

interface UseInterviewStreamProps {
  apiKeys: APIKeys;
  interviewData: InterviewData;
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onInterviewerSpeaking: (speaking: boolean) => void;
  onError: (error: string) => void;
}

export function useInterviewStream({
  apiKeys,
  interviewData,
  onTranscript,
  onInterviewerSpeaking,
  onError
}: UseInterviewStreamProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [interviewerAudioLevel, setInterviewerAudioLevel] = useState(0);
  
  const deepgramSocket = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const isListeningRef = useRef(false);

  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // Initialize audio context for visualization
      audioContext.current = new AudioContext({ sampleRate: 16000 });
      
      // Resume audio context if suspended (required for autoplay policy)
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }
      
      const source = audioContext.current.createMediaStreamSource(stream);
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      analyser.current.smoothingTimeConstant = 0.8;
      source.connect(analyser.current);

      // Start audio level monitoring
      const monitorAudioLevel = () => {
        try {
          if (analyser.current && isListeningRef.current) {
            const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
            analyser.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average / 255);
          }
        } catch (error) {
          console.error('Error monitoring audio level:', error);
        }
        requestAnimationFrame(monitorAudioLevel);
      };
      monitorAudioLevel();

      return stream;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      onError('Failed to access microphone');
      throw error;
    }
  }, [onError]);

  const connectToDeepgram = useCallback(() => {
    if (!apiKeys.deepgram) {
      onError('Deepgram API key required');
      return;
    }

    const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&interim_results=true&endpointing=300`;
    
    deepgramSocket.current = new WebSocket(wsUrl, ['token', apiKeys.deepgram]);

    deepgramSocket.current.onopen = () => {
      console.log('Connected to Deepgram');
    };

    deepgramSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.channel?.alternatives?.[0]) {
        const transcript = data.channel.alternatives[0].transcript;
        const isFinal = data.is_final;
        if (transcript) {
          onTranscript(transcript, isFinal);
        }
      }
    };

    deepgramSocket.current.onerror = (error) => {
      console.error('Deepgram WebSocket error:', error);
      onError('Connection to speech recognition failed');
    };

    deepgramSocket.current.onclose = () => {
      console.log('Deepgram connection closed');
    };
  }, [apiKeys.deepgram, onTranscript, onError]);

  const startListening = useCallback(async () => {
    try {
      const stream = await initializeAudio();
      
      // Initialize MediaRecorder for Deepgram
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      connectToDeepgram();
      
      if (mediaRecorder.current && deepgramSocket.current) {
        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0 && deepgramSocket.current?.readyState === WebSocket.OPEN) {
            deepgramSocket.current.send(event.data);
          }
        };

        mediaRecorder.current.start(100); // Send data every 100ms
        setIsListening(true);
        setIsSpeaking(true);
        isListeningRef.current = true;
      }
    } catch (error) {
      onError('Failed to start listening');
    }
  }, [initializeAudio, connectToDeepgram, onError]);

  const stopListening = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    if (deepgramSocket.current) {
      deepgramSocket.current.close();
    }
    if (audioContext.current) {
      audioContext.current.close();
    }
    setIsListening(false);
    setIsSpeaking(false);
    setAudioLevel(0);
    isListeningRef.current = false;
  }, []);

  const playInterviewerAudio = useCallback(async (audioUrl: string) => {
    try {
      if (currentAudio.current) {
        currentAudio.current.pause();
      }

      currentAudio.current = new Audio(audioUrl);
      onInterviewerSpeaking(true);
      
      // Monitor interviewer audio level
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(currentAudio.current);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      const monitorInterviewerLevel = () => {
        if (analyser) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setInterviewerAudioLevel(average / 255);
          
          if (!currentAudio.current?.paused) {
            requestAnimationFrame(monitorInterviewerLevel);
          }
        }
      };

      currentAudio.current.onplay = () => {
        monitorInterviewerLevel();
      };

      currentAudio.current.onended = () => {
        onInterviewerSpeaking(false);
        setInterviewerAudioLevel(0);
      };

      await currentAudio.current.play();
    } catch (error) {
      onError('Failed to play interviewer audio');
      onInterviewerSpeaking(false);
    }
  }, [onInterviewerSpeaking, onError]);

  const sendTranscriptToAPI = useCallback(async (transcript: string, conversationHistory: any[]) => {
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          conversationHistory,
          apiKeys,
          interviewData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get interviewer response');
      }

      // Handle streaming audio response
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        // Create audio blob and play
        const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        await playInterviewerAudio(audioUrl);
      }
    } catch (error) {
      onError('Failed to communicate with interviewer API');
    }
  }, [apiKeys, interviewData, playInterviewerAudio, onError]);

  useEffect(() => {
    return () => {
      stopListening();
      if (currentAudio.current) {
        currentAudio.current.pause();
      }
    };
  }, [stopListening]);

  return {
    isListening,
    isSpeaking,
    audioLevel,
    interviewerAudioLevel,
    startListening,
    stopListening,
    sendTranscriptToAPI
  };
}