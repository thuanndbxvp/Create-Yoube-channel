import React, { useState } from 'react';
import { ResultData, LANGUAGES } from '../types';
import { useApi } from '../contexts/ApiContext';
import { SparklesIcon } from './icons';

interface IdeaGeneratorProps {
  ideaValue: string;
  setLoading: (loading: boolean) => void;
  setResult: (result: ResultData) => void;
  setError: (error: string | null) => void;
  handleReset: () => void;
  setGeneratorInputIdea: (idea: string) => void;
}

const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ ideaValue, setLoading, setResult, setError, handleReset, setGeneratorInputIdea }) => {
  const [language, setLanguage] = useState<string>('en-US');
  const [numResults, setNumResults] = useState<number>(5);
  const { 
    activeApiKey,
    executeApiCall
  } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApiKey) {
      setError('Vui lòng kích hoạt một API key và chọn model trong phần Quản lý API.');
      return;
    }
    if (!ideaValue.trim()) {
      setError('Vui lòng nhập ý tưởng của bạn.');
      return;
    }

    handleReset();
    setLoading(true);

    try {
      // Use the context's executeApiCall which handles retries and key switching
      const result = await executeApiCall('generateChannelAssets', ideaValue, language, numResults);
      setResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(`Lỗi: ${errorMessage}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-center text-slate-200">
        Biến ý tưởng của bạn thành một kênh YouTube hoàn chỉnh
      </h2>
      <p className="text-center text-slate-400">
        Chỉ cần nhập chủ đề hoặc ý tưởng, AI sẽ đề xuất nhiều bộ ý tưởng độc đáo cho kênh của bạn.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={ideaValue}
          onChange={(e) => {
            setGeneratorInputIdea(e.target.value);
          }}
          placeholder="Ví dụ: một kênh về làm bánh mì tại nhà cho người mới bắt đầu..."
          className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-slate-400 mb-1">
              Ngôn ngữ kênh
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
            >
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="results-count-select" className="block text-sm font-medium text-slate-400 mb-1">
              Số lượng kết quả
            </label>
            <select
              id="results-count-select"
              value={numResults}
              onChange={(e) => setNumResults(parseInt(e.target.value, 10))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
            >
              {Array.from({ length: 16 }, (_, i) => i + 5).map(num => (
                  <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!activeApiKey}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 duration-200 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          <SparklesIcon className="w-5 h-5" />
          Tạo Ý Tưởng
        </button>
         {!activeApiKey && (
          <p className="text-center text-sm text-yellow-400">Vui lòng thêm và kích hoạt API key để sử dụng tính năng này.</p>
        )}
      </form>
    </div>
  );
};

export default IdeaGenerator;