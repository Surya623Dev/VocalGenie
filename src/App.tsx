import React, { useState, useCallback } from 'react';
import { Upload, Mic, Play, Download, Music, Users, User } from 'lucide-react';
import Header from './components/Header';
import UploadStep from './components/UploadStep';
import ProcessingStep from './components/ProcessingStep';
import VocalReplaceStep from './components/VocalReplaceStep';
import PreviewStep from './components/PreviewStep';
import { AudioFile, VocalTrack, InstrumentalTrack, ProcessingStep as Step } from './types/audio';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null);
  const [vocalTracks, setVocalTracks] = useState<VocalTrack[]>([]);
  const [instrumentalTrack, setInstrumentalTrack] = useState<InstrumentalTrack | null>(null);
  const [userVocals, setUserVocals] = useState<AudioFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback((file: AudioFile) => {
    setUploadedFile(file);
    setCurrentStep('processing');
  }, []);

  const handleProcessingComplete = useCallback((tracks: VocalTrack[], instrumental: InstrumentalTrack) => {
    setVocalTracks(tracks);
    setInstrumentalTrack(instrumental);
    setCurrentStep('replace');
  }, []);

  const handleVocalUpload = useCallback((vocals: AudioFile[]) => {
    setUserVocals(vocals);
    setCurrentStep('preview');
  }, []);

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'processing':
        setCurrentStep('upload');
        setUploadedFile(null);
        break;
      case 'replace':
        setCurrentStep('processing');
        break;
      case 'preview':
        setCurrentStep('replace');
        break;
    }
  }, [currentStep]);

  const getStepIcon = (step: Step) => {
    switch (step) {
      case 'upload': return Upload;
      case 'processing': return Music;
      case 'replace': return Mic;
      case 'preview': return Play;
      default: return Upload;
    }
  };

  const steps: { id: Step; title: string; description: string }[] = [
    { id: 'upload', title: 'Upload Song', description: 'Choose your track' },
    { id: 'processing', title: 'Separate Vocals', description: 'AI processing' },
    { id: 'replace', title: 'Replace Vocals', description: 'Add your voice' },
    { id: 'preview', title: 'Preview & Download', description: 'Final result' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.03%22%3E%3Cpath d=%22m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const Icon = getStepIcon(step.id);
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    relative flex flex-col items-center transition-all duration-500
                    ${isActive ? 'scale-110' : 'scale-100'}
                  `}>
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center mb-3
                      transition-all duration-500 border-2
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 shadow-lg shadow-purple-500/50' 
                        : isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400'
                        : 'bg-gray-800 border-gray-600'
                      }
                    `}>
                      <Icon className={`w-6 h-6 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                    {isActive && (
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-24 h-0.5 mx-4 transition-all duration-500
                      ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'}
                    `}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'upload' && (
            <UploadStep onFileUpload={handleFileUpload} />
          )}
          
          {currentStep === 'processing' && uploadedFile && (
            <ProcessingStep 
              audioFile={uploadedFile} 
              onProcessingComplete={handleProcessingComplete}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 'replace' && (
            <VocalReplaceStep 
              vocalTracks={vocalTracks}
              onVocalUpload={handleVocalUpload}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 'preview' && uploadedFile && instrumentalTrack && (
            <PreviewStep 
              originalFile={uploadedFile}
              instrumentalTrack={instrumentalTrack}
              vocalTracks={vocalTracks}
              userVocals={userVocals}
              onBack={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;