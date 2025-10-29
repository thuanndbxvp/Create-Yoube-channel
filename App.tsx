import React, { useState } from 'react';
import { AppTab, ResultData, SavedSession } from './types';
import IdeaGenerator from './components/IdeaGenerator';
import CompetitorAnalyzer from './components/CompetitorAnalyzer';
import ResultsDisplay from './components/ResultsDisplay';
import { YouTubeIcon, SparklesIcon, ChartBarIcon, KeyIcon, SaveIcon, LibraryIcon, CheckIcon } from './components/icons';
import ApiKeyManager from './components/ApiKeyManager';
import Library from './components/Library';
import { useSession } from './contexts/SessionContext';
import ThemeSelector from './components/ThemeSelector';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GENERATOR);
  
  // State is now fully separated for each tab to preserve results and loading states
  const [generatorLoading, setGeneratorLoading] = useState<boolean>(false);
  const [analyzerLoading, setAnalyzerLoading] = useState<boolean>(false);
  const [generatorResult, setGeneratorResult] = useState<ResultData>(null);
  const [analyzerResult, setAnalyzerResult] = useState<ResultData>(null);
  const [generatorError, setGeneratorError] = useState<string | null>(null);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  
  // Lifted state for session naming
  const [generatorInputIdea, setGeneratorInputIdea] = useState<string>('');
  const [analyzerInputFileName, setAnalyzerInputFileName] = useState<string>('');

  const [isApiManagerOpen, setIsApiManagerOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSessionSaved, setIsSessionSaved] = useState(false);
  
  const { saveSession } = useSession();

  const handleReset = (tab: AppTab) => {
    if (tab === AppTab.GENERATOR) {
        setGeneratorResult(null);
        setGeneratorError(null);
    } else {
        setAnalyzerResult(null);
        setAnalyzerError(null);
    }
  };
  
  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
  }

  const handleSaveSession = () => {
    const resultToSave = activeTab === AppTab.GENERATOR ? generatorResult : analyzerResult;
    if (!resultToSave) return;
    
    let sessionName = '';
    const timestamp = new Date().toLocaleString('vi-VN');

    if (activeTab === AppTab.GENERATOR) {
        const keywords = generatorInputIdea.trim().split(/\s+/).slice(0, 5).join(' ');
        const keywordPart = keywords ? `"${keywords}..."` : 'Ý tưởng chưa đặt tên';
        sessionName = `Ý tưởng: ${keywordPart} - ${timestamp}`;
    } else {
        const fileNamePart = analyzerInputFileName || 'File phân tích';
        sessionName = `Phân tích: ${fileNamePart} - ${timestamp}`;
    }
    
    saveSession(sessionName, activeTab, resultToSave);
    
    setIsSessionSaved(true);
    setTimeout(() => {
        setIsSessionSaved(false);
    }, 2000);
  };

  const handleLoadSession = (session: SavedSession) => {
    setActiveTab(session.type);
    if (session.type === AppTab.GENERATOR) {
      setGeneratorResult(session.data);
      setGeneratorError(null);
      setGeneratorLoading(false); // Stop loading for this tab only
    } else {
      setAnalyzerResult(session.data);
      setAnalyzerError(null);
      setAnalyzerLoading(false); // Stop loading for this tab only
    }
    setIsLibraryOpen(false);
  };

  const currentLoading = activeTab === AppTab.GENERATOR ? generatorLoading : analyzerLoading;
  const currentResult = activeTab === AppTab.GENERATOR ? generatorResult : analyzerResult;
  const currentError = activeTab === AppTab.GENERATOR ? generatorError : analyzerError;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 relative">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:top-8 lg:left-8 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsLibraryOpen(true)}
          className="flex-shrink-0 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
          title="Thư viện"
        >
          <LibraryIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Thư viện</span>
        </button>
        {currentResult && !currentLoading && (
            <button
              onClick={handleSaveSession}
              disabled={isSessionSaved}
              className={`flex-shrink-0 flex items-center justify-center gap-2 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                isSessionSaved
                  ? 'bg-green-600 cursor-default'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
              title={isSessionSaved ? "Đã lưu!" : "Lưu phiên"}
            >
              {isSessionSaved ? (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Đã lưu!</span>
                </>
              ) : (
                <>
                  <SaveIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Lưu Phiên</span>
                </>
              )}
            </button>
        )}
      </div>
      
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-10 flex items-center gap-2">
        <ThemeSelector />
        <button
          onClick={() => setIsApiManagerOpen(true)}
          className="flex-shrink-0 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
          title="Quản lý API"
        >
          <KeyIcon className="w-5 h-5" />
          <span className="hidden sm:inline">API</span>
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <YouTubeIcon className="h-12 w-12 text-red-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">
              Trợ lý Kênh YouTube AI
            </h1>
          </div>
          <p className="text-slate-400">
            Khai phá tiềm năng kênh YouTube của bạn với sức mạnh của AI.
          </p>
        </header>

        <main>
          <div className="flex justify-between items-center mb-6 gap-2 sm:gap-4">
            <div className="bg-slate-800/50 rounded-lg p-1 flex space-x-1 backdrop-blur-sm flex-grow">
              <button
                onClick={() => handleTabChange(AppTab.GENERATOR)}
                className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
                  activeTab === AppTab.GENERATOR
                    ? 'bg-primary-500 text-white shadow'
                    : 'text-slate-300 hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                <SparklesIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Tạo Ý Tưởng Kênh</span>
                <span className="sm:hidden">Ý Tưởng</span>
              </button>
              <button
                onClick={() => handleTabChange(AppTab.ANALYZER)}
                className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
                  activeTab === AppTab.ANALYZER
                    ? 'bg-primary-500 text-white shadow'
                    : 'text-slate-300 hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                <ChartBarIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Phân Tích Đối Thủ</span>
                 <span className="sm:hidden">Phân Tích</span>
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 min-h-[200px]">
            {activeTab === AppTab.GENERATOR ? (
              <IdeaGenerator 
                setLoading={setGeneratorLoading} 
                setResult={setGeneratorResult} 
                setError={setGeneratorError} 
                handleReset={() => handleReset(AppTab.GENERATOR)} 
                setGeneratorInputIdea={setGeneratorInputIdea}
              />
            ) : (
              <CompetitorAnalyzer 
                setLoading={setAnalyzerLoading} 
                setResult={setAnalyzerResult} 
                setError={setAnalyzerError} 
                handleReset={() => handleReset(AppTab.ANALYZER)} 
                setAnalyzerInputFileName={setAnalyzerInputFileName}
              />
            )}
          </div>

          <ResultsDisplay loading={currentLoading} error={currentError} result={currentResult} />

        </main>
      </div>
       <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Được xây dựng với React, Tailwind CSS, và các API Generative AI.</p>
      </footer>
      <ApiKeyManager isOpen={isApiManagerOpen} onClose={() => setIsApiManagerOpen(false)} />
      <Library isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onLoadSession={handleLoadSession} />
    </div>
  );
};

export default App;