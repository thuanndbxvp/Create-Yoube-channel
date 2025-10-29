
import React, { useState } from 'react';
import { generateChannelAssets } from '../services/geminiService';
import { ResultData } from '../types';
import { SparklesIcon } from './icons';

interface IdeaGeneratorProps {
  setLoading: (loading: boolean) => void;
  setResult: (result: ResultData) => void;
  setError: (error: string | null) => void;
  handleReset: () => void;
}

const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ setLoading, setResult, setError, handleReset }) => {
  const [idea, setIdea] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError('Vui lòng nhập ý tưởng của bạn.');
      return;
    }

    handleReset();
    setLoading(true);

    try {
      const result = await generateChannelAssets(idea);
      setResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.');
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
        Chỉ cần nhập chủ đề hoặc ý tưởng, AI sẽ đề xuất tên kênh, mô tả, hashtag và hơn thế nữa.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Ví dụ: một kênh về làm bánh mì tại nhà cho người mới bắt đầu..."
          className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 resize-none"
        />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 duration-200 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          <SparklesIcon className="w-5 h-5" />
          Tạo Ý Tưởng
        </button>
      </form>
    </div>
  );
};

export default IdeaGenerator;
