import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Music, Users, User, AudioWaveform as Waveform, Brain, Zap } from 'lucide-react';
import { AudioFile, VocalTrack } from '../types/audio';
import WaveformVisualizer from './WaveformVisualizer';

interface ProcessingStepProps {
  audioFile: AudioFile;
  onProcessingComplete: (tracks: VocalTrack[]) => void;
  onBack: () => void;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ 
  audioFile, 
  onProcessingComplete, 
  onBack 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [detectedVocals, setDetectedVocals] = useState<'single' | 'duet' | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const stages = [
    { name: 'Loading Audio', description: 'Reading audio file...', duration: 1000 },
    { name: 'AI Analysis', description: 'Analyzing vocal patterns...', duration: 2000 },
    { name: 'Vocal Detection', description: 'Identifying singers...', duration: 1500 },
    { name: 'Separation Process', description: 'Isolating vocal tracks...', duration: 2500 },
    { name: 'Quality Enhancement', description: 'Optimizing audio quality...', duration: 1000 },
  ];

  useEffect(() => {
    const processAudio = async () => {
      let totalProgress = 0;
      
      for (let i = 0; i < stages.length; i++) {
        setCurrentStage(i);
        const stageProgress = 100 / stages.length;
        
        // Animate progress for current stage
        const startProgress = totalProgress;
        const endProgress = totalProgress + stageProgress;
        const duration = stages[i].duration;
        const steps = 50;
        const stepDuration = duration / steps;
        
        for (let step = 0; step <= steps; step++) {
          const currentProgress = startProgress + (endProgress - startProgress) * (step / steps);
          setProgress(currentProgress);
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
        
        totalProgress = endProgress;

        // Special handling for vocal detection stage
        if (i === 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const vocalType = Math.random() > 0.6 ? 'duet' : 'single';
          setDetectedVocals(vocalType);
          setIsAnalyzing(false);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Generate mock vocal tracks
      const tracks: VocalTrack[] = detectedVocals === 'duet' 
        ? [
            {
              id: 'vocal-1',
              name: 'Male Vocal',
              type: 'male',
              url: audioFile.url, // This would be the separated vocal track
              duration: 180,
              confidence: 0.92
            },
            {
              id: 'vocal-2', 
              name: 'Female Vocal',
              type: 'female',
              url: audioFile.url, // This would be the separated vocal track
              duration: 180,
              confidence: 0.89
            }
          ]
        : [
            {
              id: 'vocal-1',
              name: 'Main Vocal',
              type: Math.random() > 0.5 ? 'male' : 'female',
              url: audioFile.url, // This would be the separated vocal track
              duration: 180,
              confidence: 0.95
            }
          ];

      // Create instrumental track (vocals removed)
      // In real implementation, this would be the result of vocal separation
      const instrumentalTrack = {
        id: 'instrumental',
        name: 'Instrumental',
        url: audioFile.url, // This would be the instrumental-only track
        duration: 180
      };

      setTimeout(() => {
        onProcessingComplete(tracks, instrumentalTrack);
      }, 1000);
    };

    processAudio();
  }, [audioFile, detectedVocals, onProcessingComplete]);

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Upload</span>
      </button>

      {/* Processing Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse"></div>
        </div>
        <h2 className="text-3xl font-bold text-white">AI Processing in Progress</h2>
        <p className="text-gray-300">Our advanced AI is analyzing your track</p>
      </div>

      {/* File Info */}
      <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{audioFile.name}</h3>
            <p className="text-gray-400">
              {(audioFile.size / 1024 / 1024).toFixed(1)} MB • {audioFile.type}
            </p>
          </div>
          {audioFile.url && <WaveformVisualizer audioUrl={audioFile.url} />}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">{stages[currentStage]?.name}</span>
          <span className="text-purple-400 font-mono">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          >
            <div className="w-full h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm">{stages[currentStage]?.description}</p>
      </div>

      {/* Vocal Detection Results */}
      {detectedVocals && (
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 animate-fadeIn">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Vocal Analysis Complete!</h3>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              {detectedVocals === 'duet' ? (
                <Users className="w-8 h-8 text-purple-400" />
              ) : (
                <User className="w-8 h-8 text-blue-400" />
              )}
              <div>
                <p className="text-white font-medium">
                  {detectedVocals === 'duet' ? 'Duet Detected' : 'Single Vocal Detected'}
                </p>
                <p className="text-gray-400 text-sm">
                  {detectedVocals === 'duet' 
                    ? 'Found multiple vocal tracks (male & female)' 
                    : 'Found single main vocal track'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex-1 text-right">
              <div className="inline-flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">High Confidence</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Stages */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">Processing Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage, index) => {
            const isActive = index === currentStage;
            const isCompleted = index < currentStage;
            
            return (
              <div
                key={index}
                className={`
                  relative p-4 rounded-xl border transition-all duration-500
                  ${isActive 
                    ? 'bg-purple-500/20 border-purple-400 scale-105' 
                    : isCompleted 
                    ? 'bg-green-500/10 border-green-400'
                    : 'bg-black/20 border-gray-600'
                  }
                `}
              >
                <div className="text-center">
                  <div className={`
                    w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold
                    ${isActive 
                      ? 'bg-purple-500 text-white' 
                      : isCompleted 
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                    }
                  `}>
                    {index + 1}
                  </div>
                  <p className={`text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>
                    {stage.name}
                  </p>
                </div>
                
                {isActive && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioFile.url} preload="metadata" />
    </div>
  );
};

export default ProcessingStep;