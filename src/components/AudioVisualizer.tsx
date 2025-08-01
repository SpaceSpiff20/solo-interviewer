import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  audioLevel: number;
  isActive: boolean;
  title: string;
  className?: string;
}

export function AudioVisualizer({ audioLevel, isActive, title, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Debug logging
  useEffect(() => {
    console.log(`${title} - Audio Level: ${audioLevel}, Active: ${isActive}`);
  }, [audioLevel, isActive, title]);

  // Test mode - simulate audio levels for debugging
  const [testMode, setTestMode] = useState(false);
  const [testAudioLevel, setTestAudioLevel] = useState(0);

  useEffect(() => {
    if (testMode) {
      const interval = setInterval(() => {
        setTestAudioLevel(Math.random() * 0.8 + 0.2);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [testMode]);

  const actualAudioLevel = testMode ? testAudioLevel : audioLevel;
  const actualIsActive = testMode ? true : isActive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    // Initial size
    updateCanvasSize();

    // Resize observer
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvas);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (actualIsActive && actualAudioLevel > 0) {
        // Draw waveform bars
        const barCount = 32;
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          // Ensure minimum bar height for visibility
          const minHeight = height * 0.1;
          const maxHeight = height * 0.8;
          const barHeight = Math.max(minHeight, (Math.random() * actualAudioLevel * maxHeight) + (actualAudioLevel * height * 0.2));
          const x = i * barWidth;
          const y = (height - barHeight) / 2;

          ctx.fillStyle = actualIsActive ? '#4A90FF' : '#E5E7EB';
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
      } else {
        // Draw static bars when inactive
        const barCount = 32;
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.max(4, height * 0.05);
          const x = i * barWidth;
          const y = (height - barHeight) / 2;

          ctx.fillStyle = '#E5E7EB';
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [actualAudioLevel, actualIsActive]);

  return (
    <div className={cn("border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <button
          onClick={() => setTestMode(!testMode)}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 border border-black"
        >
          {testMode ? 'Disable Test' : 'Test Mode'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-20 border-2 border-black"
        style={{ width: '100%', height: '80px' }}
      />
      <div className="mt-2 text-center text-sm text-gray-600">
        {actualIsActive ? 'Active' : 'Inactive'} - Level: {Math.round(actualAudioLevel * 100)}%
        {actualAudioLevel === 0 && actualIsActive && (
          <div className="text-xs text-orange-600 mt-1">
            No audio detected. Please check microphone permissions.
          </div>
        )}
      </div>
    </div>
  );
}