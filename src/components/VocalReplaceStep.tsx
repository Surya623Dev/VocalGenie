import React, { useState, useCallback } from 'react';
import { ArrowLeft, Mic, Upload, User, Users, Play, Pause, Volume2 } from 'lucide-react';
import { VocalTrack, AudioFile } from '../types/audio';

interface VocalReplaceStepProps {
  vocalTracks: VocalTrack[];
  onVocalUpload: (vocals: AudioFile[]) => void;
  onBack: () => void;
}

const VocalReplaceStep: React.FC<VocalReplaceStepProps> = ({ 
  vocalTracks, 
  onVocalUpload, 
  onBack 
}) => {
  const [userVocals, setUserVocals] = useState<AudioFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [recordingTrackId, setRecordingTrackId] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);
  const [voiceCloneProgress, setVoiceCloneProgress] = useState<Record<string, number>>({});
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const handleFileUpload = useCallback((trackId: string, file: File) => {
    const audioFile: AudioFile = {
      id: `user-vocal-${trackId}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      duration: 0,
      url: URL.createObjectURL(file)
    };

    setUserVocals(prev => {
      const existing = prev.filter(v => v.id !== audioFile.id);
      return [...existing, audioFile];
    });

    // Start voice cloning process
    startVoiceCloning(trackId, audioFile);
  }, []);

  const startVoiceCloning = async (trackId: string, voiceSample: AudioFile) => {
    setIsProcessingVoice(true);
    setVoiceCloneProgress(prev => ({ ...prev, [trackId]: 0 }));

    // Simulate voice cloning process
    const stages = [
      'Analyzing voice characteristics...',
      'Extracting vocal features...',
      'Training voice model...',
      'Converting original vocals...',
      'Applying voice transformation...',
      'Finalizing audio...'
    ];

    for (let i = 0; i < stages.length; i++) {
      const progress = ((i + 1) / stages.length) * 100;
      setVoiceCloneProgress(prev => ({ ...prev, [trackId]: progress }));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsProcessingVoice(false);
  };

  const handleRecording = useCallback(async (trackId: string) => {
    if (isRecording && recordingTrackId === trackId) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setIsRecording(false);
      setRecordingTrackId(null);
    } else if (isRecording) {
      // Already recording another track, stop that first
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setIsRecording(false);
      setRecordingTrackId(null);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setRecordingChunks(prev => [...prev, event.data]);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(recordingChunks, { type: 'audio/wav' });
          const audioFile: AudioFile = {
            id: `user-vocal-${trackId}`,
            name: `Recording-${trackId}.wav`,
            size: audioBlob.size,
            type: 'audio/wav',
            file: new File([audioBlob], `Recording-${trackId}.wav`, { type: 'audio/wav' }),
            duration: 0,
            url: URL.createObjectURL(audioBlob)
          };

          setUserVocals(prev => {
            const existing = prev.filter(v => v.id !== audioFile.id);
            return [...existing, audioFile];
          });

          // Start voice cloning process
          startVoiceCloning(trackId, audioFile);
          
          setRecordingChunks([]);
          stream.getTracks().forEach(track => track.stop());
        };

        setMediaRecorder(recorder);
        setRecordingChunks([]);
        recorder.start();
        setIsRecording(true);
        setRecordingTrackId(trackId);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setIsRecording(false);
        setRecordingTrackId(null);
      }
    }
  }, [isRecording, recordingTrackId, mediaRecorder, recordingChunks]);

  const handlePlayOriginal = useCallback((trackId: string) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(trackId);
    }
  }, [currentlyPlaying]);

  const canProceed = vocalTracks.length === 1 ? userVocals.length >= 1 : userVocals.length >= 1;

  const handleContinue = () => {
    // Only proceed if voice cloning is complete
    const allProcessed = vocalTracks.every(track => {
      const userVocal = userVocals.find(v => v.id === `user-vocal-${track.id}`);
      return userVocal && voiceCloneProgress[track.id] === 100;
    });

    if (!allProcessed) {
      alert('Please wait for voice processing to complete');
      return;
    }

    onVocalUpload(userVocals);
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Processing</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
        </div>
        <h2 className="text-3xl font-bold text-white">Replace Vocals</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          {vocalTracks.length === 1 
            ? "Upload or record a sample of your voice. Our AI will learn your voice and make you sing the entire song!"
            : "Upload or record voice samples. Our AI will clone your voice to sing as each detected singer"
          }
        </p>
      </div>

      {/* Vocal Tracks */}
      <div className="max-w-4xl mx-auto space-y-6">
        {vocalTracks.map((track, index) => {
          const userVocal = userVocals.find(v => v.id === `user-vocal-${track.id}`);
          const isPlaying = currentlyPlaying === track.id;
          const isRecordingThis = recordingTrackId === track.id;

          return (
            <div key={track.id} className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <div className="flex items-start space-x-6">
                {/* Track Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${track.type === 'male' 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                        : 'bg-gradient-to-r from-pink-500 to-purple-500'
                      }
                    `}>
                      {track.type === 'male' ? (
                        <User className="w-6 h-6 text-white" />
                      ) : (
                        <Users className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{track.name}</h3>
                      <p className="text-gray-400 capitalize">{track.type} vocal • {Math.round(track.confidence * 100)}% confidence</p>
                    </div>
                  </div>

                  {/* Original Track Controls */}
                  <div className="flex items-center space-x-4 mb-4">
                    <button
                      onClick={() => handlePlayOriginal(track.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white" />
                      )}
                      <span className="text-white text-sm">Preview Original</span>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Volume2 className="w-4 h-4" />
                      <span className="text-sm">Duration: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* User Vocal Status */}
                  {userVocal ? (
                    <div className={`
                      border rounded-lg p-4 transition-all duration-500
                      ${voiceCloneProgress[track.id] === 100 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : 'bg-purple-500/10 border-purple-500/20'
                      }
                    `}>
                      {voiceCloneProgress[track.id] === 100 ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Mic className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-green-400 font-medium">Voice Cloned Successfully!</p>
                              <p className="text-gray-400 text-sm">Ready to sing the entire song in your voice</p>
                            </div>
                          </div>
                          <button className="text-green-400 hover:text-green-300 text-sm">
                            Change Sample
                          </button>
                        </div>
                      ) : voiceCloneProgress[track.id] > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div>
                              <p className="text-purple-400 font-medium">Cloning Your Voice...</p>
                              <p className="text-gray-400 text-sm">AI is learning how you sound</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${voiceCloneProgress[track.id]}%` }}
                            ></div>
                          </div>
                          <p className="text-purple-400 text-xs">{Math.round(voiceCloneProgress[track.id])}% complete</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <Mic className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-blue-400 font-medium">Voice Sample Ready</p>
                              <p className="text-gray-400 text-sm">Starting voice analysis...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                      <p className="text-gray-400 text-center mb-4">Upload a voice sample (10-30 seconds recommended)</p>
                    </div>
                  )}
                </div>

                {/* Upload/Record Controls */}
                <div className="flex flex-col space-y-3 min-w-[200px]">
                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(track.id, e.target.files[0])}
                      className="hidden"
                      id={`upload-${track.id}`}
                    />
                    <label
                      htmlFor={`upload-${track.id}`}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Audio</span>
                    </label>
                  </div>

                  {/* Record Button */}
                  <button
                    onClick={() => handleRecording(track.id)}
                    className={`
                      flex items-center justify-center space-x-2 px-4 py-3 font-medium rounded-lg transition-all duration-200
                      ${isRecordingThis
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }
                    `}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isRecordingThis ? 'Stop Recording' : 'Record Voice'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-3">🎤 Voice Cloning Tips</h4>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Record 10-30 seconds of clear speech or singing for best results</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Use a quiet environment with minimal background noise</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Speak naturally - the AI will learn your unique voice characteristics</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>The AI will make you sing the entire song in your voice style</span>
          </li>
        </ul>
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={handleContinue}
          disabled={!canProceed || isProcessingVoice}
          className={`
            px-8 py-4 font-medium rounded-xl transition-all duration-200 transform
            ${canProceed && !isProcessingVoice
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isProcessingVoice ? 'Processing Voice...' : 'Continue to Preview'}
        </button>
        {(!canProceed || isProcessingVoice) && (
          <p className="text-gray-400 text-sm mt-2">
            {isProcessingVoice ? 'AI is cloning your voice...' : 'Upload at least one voice sample to continue'}
          </p>
        )}
      </div>
    </div>
  );
};

export default VocalReplaceStep;