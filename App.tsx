
import React, { useState } from 'react';
import { AppTab, ResultData } from './types';
import IdeaGenerator from './components/IdeaGenerator';
import CompetitorAnalyzer from './components/CompetitorAnalyzer';
import ResultsDisplay from './components/ResultsDisplay';
import { YouTubeIcon, SparklesIcon, ChartBarIcon } from './components/icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GENERATOR);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData>(null);

  const handleReset = () => {
    setResult(null);
    setError(null);
  };
  
  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    handleReset();
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <YouTubeIcon className="h-12 w-12 text-red-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
              Trợ lý Kênh YouTube AI
            </h1>
          </div>
          <p className="text-slate-400">
            Khai phá tiềm năng kênh YouTube của bạn với sức mạnh của AI.
          </p>
        </header>

        <main>
          <div className="mb-6 bg-slate-800/50 rounded-lg p-1 flex space-x-1 backdrop-blur-sm">
            <button
              onClick={() => handleTabChange(AppTab.GENERATOR)}
              className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
                activeTab === AppTab.GENERATOR
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-300 hover:bg-white/[0.12] hover:text-white'
              }`}
            >
              <SparklesIcon className="w-5 h-5" />
              Tạo Ý Tưởng Kênh
            </button>
            <button
              onClick={() => handleTabChange(AppTab.ANALYZER)}
              className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
                activeTab === AppTab.ANALYZER
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-300 hover:bg-white/[0.12] hover:text-white'
              }`}
            >
              <ChartBarIcon className="w-5 h-5" />
              Phân Tích Đối Thủ
            </button>
          </div>
          
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 min-h-[200px]">
            {activeTab === AppTab.GENERATOR ? (
              <IdeaGenerator setLoading={setLoading} setResult={setResult} setError={setError} handleReset={handleReset} />
            ) : (
              <CompetitorAnalyzer setLoading={setLoading} setResult={setResult} setError={setError} handleReset={handleReset} />
            )}
          </div>

          <ResultsDisplay loading={loading} error={error} result={result} />

        </main>
      </div>
       <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Được xây dựng với React, Tailwind CSS, và Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
