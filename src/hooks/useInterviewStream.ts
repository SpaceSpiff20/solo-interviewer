import { useState, useRef, useCallback, useEffect } from 'react';
import { APIKeys, InterviewData } from '@/types/interview';

interface UseInterviewStreamProps {
  apiKeys: APIKeys;
  interviewData: InterviewData;
  voice?: string;
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onInterviewerSpeaking: (speaking: boolean) => void;
  onError: (error: string) => void;
}

export function useInterviewStream({
  apiKeys,
  interviewData,
  voice = 'oliver',
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
  const isProcessingRef = useRef(false); // Prevent multiple simultaneous API calls
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Speech buffering state
  const currentTranscriptRef = useRef('');
  const finalTranscriptRef = useRef('');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  //const isSpeakingRef = useRef(false);

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

  const handleSpeechTimeout = useCallback(() => {
    if (finalTranscriptRef.current.trim().length > 0) {
      console.log('Speech timeout - sending accumulated transcript:', finalTranscriptRef.current);
      // Call the original onTranscript with the accumulated final transcript
      onTranscript(finalTranscriptRef.current, true);
      // Reset the transcripts
      currentTranscriptRef.current = '';
      finalTranscriptRef.current = '';
    }
    speechTimeoutRef.current = null;
  }, [onTranscript]);

  const connectToDeepgram = useCallback(() => {
    if (!apiKeys.deepgram) {
      onError('Deepgram API key required');
      return;
    }

    // Close existing connection if any
    if (deepgramSocket.current) {
      deepgramSocket.current.close();
      deepgramSocket.current = null;
    }

    const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&interim_results=true&endpointing=300&punctuate=true&diarize=true`;
    
    deepgramSocket.current = new WebSocket(wsUrl, ['token', apiKeys.deepgram]);

    deepgramSocket.current.onopen = () => {
      console.log('Connected to Deepgram');
    };

    deepgramSocket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.channel?.alternatives?.[0]) {
          const transcript = data.channel.alternatives[0].transcript;
          const isFinal = data.is_final;
          
          if (transcript && transcript.trim()) {
            // Clear any existing timeout
            if (speechTimeoutRef.current) {
              clearTimeout(speechTimeoutRef.current);
              speechTimeoutRef.current = null;
            }

            // Update the current transcript for display
            currentTranscriptRef.current = transcript;
            
            // If this is a final result, accumulate it to the final transcript
            if (isFinal) {
              if (finalTranscriptRef.current) {
                // Append to existing transcript with a space
                finalTranscriptRef.current += ' ' + transcript;
                console.log('Appended final transcript. Total:', finalTranscriptRef.current);
              } else {
                // Start new transcript
                finalTranscriptRef.current = transcript;
                console.log('Started new final transcript:', finalTranscriptRef.current);
              }
            } else {
              // For interim results, if we have a final transcript, append to it
              if (finalTranscriptRef.current) {
                // Show the accumulated transcript plus current interim
                const fullTranscript = finalTranscriptRef.current + ' ' + transcript;
                onTranscript(fullTranscript, false);
              } else {
                // Just show the current interim transcript
                onTranscript(transcript, false);
              }
            }

            // Set a 3-second timeout to send the final transcript
            speechTimeoutRef.current = setTimeout(handleSpeechTimeout, 3000);
          }
        }
      } catch (error) {
        console.error('Error parsing Deepgram message:', error);
      }
    };

    deepgramSocket.current.onerror = (error) => {
      console.error('Deepgram WebSocket error:', error);
      onError('Connection to speech recognition failed');
    };

    deepgramSocket.current.onclose = (event) => {
      console.log('Deepgram connection closed:', event.code, event.reason);
      // Only show error if it wasn't a clean close
      if (event.code !== 1000) {
        onError('Speech recognition connection lost');
        
        // Attempt to reconnect after 2 seconds
        if (isListeningRef.current && reconnectTimeoutRef.current === null) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect to Deepgram...');
            reconnectTimeoutRef.current = null;
            connectToDeepgram();
          }, 2000);
        }
      }
    };
  }, [apiKeys.deepgram, onTranscript, onError, handleSpeechTimeout]);

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

        // Wait a bit for the WebSocket to be ready
        setTimeout(() => {
          if (mediaRecorder.current && deepgramSocket.current?.readyState === WebSocket.OPEN) {
            mediaRecorder.current.start(100); // Send data every 100ms
            setIsListening(true);
            setIsSpeaking(true);
            isListeningRef.current = true;
          }
        }, 500);
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
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    setIsListening(false);
    setIsSpeaking(false);
    setAudioLevel(0);
    isListeningRef.current = false;
    
    // Reset speech buffering state
    currentTranscriptRef.current = '';
    finalTranscriptRef.current = '';
  }, []);

  const playInterviewerAudio = useCallback(async (audioUrl: string) => {
    try {
      // Stop any currently playing audio
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.src = '';
        currentAudio.current.load();
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
        if (analyser && currentAudio.current && !currentAudio.current.paused) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setInterviewerAudioLevel(average / 255);
          
          requestAnimationFrame(monitorInterviewerLevel);
        }
      };

      currentAudio.current.onplay = () => {
        monitorInterviewerLevel();
      };

      currentAudio.current.onended = () => {
        onInterviewerSpeaking(false);
        setInterviewerAudioLevel(0);
        // Clean up the audio URL to free memory
        URL.revokeObjectURL(audioUrl);
      };

      currentAudio.current.onerror = () => {
        onInterviewerSpeaking(false);
        setInterviewerAudioLevel(0);
        onError('Failed to play interviewer audio');
        URL.revokeObjectURL(audioUrl);
      };

      await currentAudio.current.play();
    } catch (error) {
      onError('Failed to play interviewer audio');
      onInterviewerSpeaking(false);
      URL.revokeObjectURL(audioUrl);
    }
  }, [onInterviewerSpeaking, onError]);

  const sendTranscriptToAPI = useCallback(async (transcript: string, conversationHistory: any[]) => {
    // Prevent multiple simultaneous API calls
    if (isProcessingRef.current) {
      console.log('Already processing a transcript, skipping:', transcript);
      return;
    }

    isProcessingRef.current = true;
    
    try {
      console.log('Sending transcript to API:', transcript);
      
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          conversationHistory,
          apiKeys,
          interviewData,
          voice
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`Failed to get interviewer response: ${response.status} - ${errorText}`);
      }

      // Handle streaming audio response
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }

          if (chunks.length === 0) {
            throw new Error('No audio data received from API');
          }

          // Create audio blob and play
          const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          await playInterviewerAudio(audioUrl);
        } catch (streamError) {
          console.error('Stream reading error:', streamError);
          const errorMessage = streamError instanceof Error ? streamError.message : 'Unknown stream error';
          throw new Error(`Failed to read audio stream: ${errorMessage}`);
        }
      } else {
        throw new Error('No response body available');
      }
    } catch (error) {
      console.error('Interview API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError(`Failed to communicate with interviewer API: ${errorMessage}`);
    } finally {
      isProcessingRef.current = false;
    }
  }, [apiKeys, interviewData, playInterviewerAudio, onError, voice]);

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