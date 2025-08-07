import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Download, Volume2, RotateCcw, Settings } from 'lucide-react';
import { AudioFile, VocalTrack } from '../types/audio';
import WaveformVisualizer from './WaveformVisualizer';

interface PreviewStepProps {
  originalFile: AudioFile;
  vocalTracks: VocalTrack[];
  userVocals: AudioFile[];
  onBack: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ 
  originalFile, 
  vocalTracks, 
  userVocals, 
  onBack 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [showMixer, setShowMixer] = useState(false);
  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>({
    original: 50,
    vocals: 80,
    instrumental: 60
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleTrackVolumeChange = (track: string, value: number) => {
    setTrackVolumes(prev => ({ ...prev, [track]: value }));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    setDownloadProgress(0);
    
    // Simulate processing and download
    for (let i = 0; i <= 100; i += 10) {
      setDownloadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Create download link (in a real app, this would be the processed audio)
    const link = document.createElement('a');
    link.href = originalFile.url;
    link.download = `VocalGenie_${originalFile.name.replace(/\.[^/.]+$/, '')}_remix.mp3`;
    link.click();
    
    setTimeout(() => setDownloadProgress(null), 1000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Vocals</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Preview Your Creation</h2>
        <p className="text-gray-300">Listen to your vocal-swapped track and download when ready</p>
      </div>

      {/* Audio Player */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
          {/* Album Art & Info */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center animate-spin-slow">
                <div className="w-28 h-28 bg-black rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">
                {originalFile.name.replace(/\.[^/.]+$/, '')} (VocalGenie Remix)
              </h3>
              <p className="text-gray-400 mb-4">
                {vocalTracks.length === 1 ? 'Single Vocal Replacement' : 'Duet Vocal Replacement'} • 
                {userVocals.length} custom vocal{userVocals.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  AI Enhanced
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  Studio Quality
                </span>
              </div>
            </div>
          </div>

          {/* Waveform */}
          <div className="mb-6">
            <WaveformVisualizer 
              audioUrl={originalFile.url} 
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
            />
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-6">
            <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
              <RotateCcw className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-all transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>

            <button 
              onClick={() => setShowMixer(!showMixer)}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-400 text-sm w-8">{volume}</span>
            </div>
          </div>
        </div>

        {/* Audio Mixer */}
        {showMixer && (
          <div className="mt-6 bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Audio Mixer</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(trackVolumes).map(([track, value]) => (
                <div key={track} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white capitalize">{track}</span>
                    <span className="text-gray-400 text-sm">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => handleTrackVolumeChange(track, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Original Vocals</h4>
          <div className="space-y-3">
            {vocalTracks.map(track => (
              <div key={track.id} className="flex items-center space-x-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                  ${track.type === 'male' ? 'bg-blue-500' : 'bg-pink-500'}
                `}>
                  {track.type === 'male' ? 'M' : 'F'}
                </div>
                <div>
                  <p className="text-white font-medium">{track.name}</p>
                  <p className="text-gray-400 text-sm capitalize">{track.type} vocal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Your Vocals</h4>
          <div className="space-y-3">
            {userVocals.map(vocal => (
              <div key={vocal.id} className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <div>
                  <p className="text-white font-medium">{vocal.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(vocal.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-2">Ready to Download?</h4>
          <p className="text-gray-300 mb-4">
            Your AI-enhanced track is ready for download in high-quality MP3 format
          </p>
          
          {downloadProgress !== null ? (
            <div className="space-y-3">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="text-green-400 text-sm">
                {downloadProgress === 100 ? 'Download Complete!' : `Preparing download... ${downloadProgress}%`}
              </p>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Download Your Track</span>
            </button>
          )}
        </div>

        <div className="text-sm text-gray-400 space-y-1">
          <p>File format: MP3 320kbps • Studio Quality</p>
          <p>Processing time: ~3 minutes • 100% Free</p>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={originalFile.url} />
    </div>
  );
};

export default PreviewStep;