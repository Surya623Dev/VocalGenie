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
  }, []);

  const handleRecording = useCallback(async (trackId: string) => {
    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false);
      setRecordingTrackId(null);
    } else {
      // Start recording logic would go here
      setIsRecording(true);
      setRecordingTrackId(trackId);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Recording implementation would go here
        console.log('Recording started for track:', trackId);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setIsRecording(false);
        setRecordingTrackId(null);
      }
    }
  }, [isRecording]);

  const handlePlayOriginal = useCallback((trackId: string) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(trackId);
    }
  }, [currentlyPlaying]);

  const canProceed = vocalTracks.length === 1 ? userVocals.length >= 1 : userVocals.length >= 1;

  const handleContinue = () => {
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
            ? "Upload or record your vocal to replace the original singer"
            : "Upload or record vocals for each detected singer"
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
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Mic className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-green-400 font-medium">Vocal Ready</p>
                            <p className="text-gray-400 text-sm">{userVocal.name}</p>
                          </div>
                        </div>
                        <button className="text-green-400 hover:text-green-300 text-sm">
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                      <p className="text-gray-400 text-center mb-4">No vocal uploaded yet</p>
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
        <h4 className="text-lg font-semibold text-white mb-3">🎤 Recording Tips</h4>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Use a quiet environment with minimal background noise</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Keep consistent distance from your microphone</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Try to match the timing and energy of the original vocal</span>
          </li>
        </ul>
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={handleContinue}
          disabled={!canProceed}
          className={`
            px-8 py-4 font-medium rounded-xl transition-all duration-200 transform
            ${canProceed
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continue to Preview
        </button>
        {!canProceed && (
          <p className="text-gray-400 text-sm mt-2">
            Upload at least one vocal to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default VocalReplaceStep;