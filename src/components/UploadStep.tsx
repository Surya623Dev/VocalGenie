import React, { useState, useCallback } from 'react';
import { Upload, Music, FileAudio, AlertCircle } from 'lucide-react';
import { AudioFile } from '../types/audio';

interface UploadStepProps {
  onFileUpload: (file: AudioFile) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file');
      return;
    }

    setIsLoading(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const audioFile: AudioFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      duration: 0, // Will be calculated later
      url: URL.createObjectURL(file)
    };

    onFileUpload(audioFile);
    setIsLoading(false);
  }, [onFileUpload]);

  const supportedFormats = ['MP3', 'WAV', 'FLAC', 'M4A', 'OGG'];
  const supportedLanguages = ['English', 'Hindi', 'Telugu'];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
          Transform Any Song with AI
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Upload your favorite track and let our AI separate vocals, detect singers, and replace them with your own voice
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        <div
          className={`
            relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
            ${isDragOver 
              ? 'border-purple-400 bg-purple-500/10 scale-105' 
              : 'border-gray-600 bg-black/20 hover:border-purple-500'
            }
            ${isLoading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className={`
                w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500
                ${isDragOver 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-110' 
                  : 'bg-gradient-to-r from-gray-700 to-gray-600'
                }
              `}>
                {isLoading ? (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Upload className="w-10 h-10 text-white" />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                {isLoading ? 'Processing...' : 'Drop your audio file here'}
              </h3>
              <p className="text-gray-400 mb-6">
                {isLoading ? 'Preparing your track for AI processing' : 'or click to browse your device'}
              </p>

              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="audio-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="audio-upload"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 cursor-pointer transform hover:scale-105"
              >
                <FileAudio className="w-5 h-5 mr-2" />
                Browse Files
              </label>
            </div>
          </div>

          {isDragOver && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl border-2 border-purple-400"></div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
            <Music className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Smart Vocal Separation</h3>
          <p className="text-gray-400">AI-powered technology to cleanly separate vocals from instrumentals</p>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
            <FileAudio className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Multiple Formats</h3>
          <p className="text-gray-400">
            Supports {supportedFormats.join(', ')} and more audio formats
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10 md:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Multi-Language Support</h3>
          <p className="text-gray-400">
            Optimized for {supportedLanguages.join(', ')} songs
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-3">💡 Pro Tips for Best Results</h4>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Use high-quality audio files (320kbps MP3 or lossless formats)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Songs with clear vocal separation work best</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Avoid heavily processed or auto-tuned vocals for optimal results</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UploadStep;