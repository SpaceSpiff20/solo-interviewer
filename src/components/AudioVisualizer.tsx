import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  audioLevel: number;
  isActive: boolean;
  title: string;
  className?: string;
}

export function AudioVisualizer({ audioLevel, isActive, title, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (isActive && audioLevel > 0) {
        // Draw waveform bars
        const barCount = 32;
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const barHeight = (Math.random() * audioLevel * height * 0.8) + (audioLevel * height * 0.2);
          const x = i * barWidth;
          const y = (height - barHeight) / 2;

          ctx.fillStyle = isActive ? '#4A90FF' : '#E5E7EB';
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
      } else {
        // Draw static bars when inactive
        const barCount = 32;
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const barHeight = 4;
          const x = i * barWidth;
          const y = (height - barHeight) / 2;

          ctx.fillStyle = '#E5E7EB';
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
      }
    };

    const animationId = requestAnimationFrame(function animate() {
      draw();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationId);
  }, [audioLevel, isActive]);

  return (
    <div className={cn("border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]", className)}>
      <h3 className="text-lg font-bold mb-4 text-center">{title}</h3>
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full h-20 border-2 border-black"
      />
      <div className="mt-2 text-center text-sm text-gray-600">
        {isActive ? 'Active' : 'Inactive'}
      </div>
    </div>
  );
}