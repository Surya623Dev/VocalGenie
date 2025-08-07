import React, { useRef, useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  audioUrl: string;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  height?: number;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioUrl,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  height = 60
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    generateWaveform();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (isPlaying) {
      startVisualization();
    }
  }, [isPlaying]);

  const generateWaveform = async () => {
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = 200; // Number of bars in waveform
      const samplesPerBar = Math.floor(channelData.length / samples);
      const waveform: number[] = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < samplesPerBar; j++) {
          sum += Math.abs(channelData[i * samplesPerBar + j]);
        }
        waveform.push(sum / samplesPerBar);
      }

      setWaveformData(waveform);
      audioContext.close();
    } catch (error) {
      console.error('Error generating waveform:', error);
      // Generate fake waveform data as fallback
      const fakeWaveform = Array.from({ length: 200 }, () => Math.random() * 0.8 + 0.1);
      setWaveformData(fakeWaveform);
    }
  };

  const startVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isPlaying) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / waveformData.length;
      const progress = duration > 0 ? currentTime / duration : 0;
      
      waveformData.forEach((amplitude, index) => {
        const barHeight = amplitude * canvas.height * 0.8;
        const x = index * barWidth;
        const y = (canvas.height - barHeight) / 2;
        
        // Color based on progress
        const isPlayed = index / waveformData.length <= progress;
        
        ctx.fillStyle = isPlayed 
          ? 'rgb(147, 51, 234)' // purple
          : 'rgb(55, 65, 81)'; // gray
        
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });

      requestAnimationFrame(draw);
    };

    draw();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = canvas.width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;
    
    waveformData.forEach((amplitude, index) => {
      const barHeight = amplitude * canvas.height * 0.8;
      const x = index * barWidth;
      const y = (canvas.height - barHeight) / 2;
      
      const isPlayed = index / waveformData.length <= progress;
      
      ctx.fillStyle = isPlayed 
        ? 'rgb(147, 51, 234)' 
        : 'rgb(55, 65, 81)';
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }, [waveformData, currentTime, duration]);

  return (
    <div className="relative w-full bg-gray-800/50 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-full"
        style={{ height: `${height}px` }}
      />
      {waveformData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gray-600 animate-pulse rounded"
                style={{
                  height: `${Math.random() * 40 + 10}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaveformVisualizer;