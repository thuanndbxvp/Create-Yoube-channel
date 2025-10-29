
import React from 'react';
import { ResultData, ChannelAssets } from '../types';
import Spinner from './Spinner';

interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  result: ResultData;
}

const renderChannelAssets = (assets: ChannelAssets) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-sky-400 mb-2">Tên Kênh Gợi Ý</h3>
      <ul className="list-disc list-inside space-y-1 pl-2">
        {assets.channelNames.map((name, index) => <li key={index}>{name}</li>)}
      </ul>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-sky-400 mb-2">Mô Tả Kênh</h3>
      <p className="whitespace-pre-wrap text-slate-300 bg-slate-900/50 p-3 rounded-md">{assets.description}</p>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-sky-400 mb-2">Hashtags</h3>
      <div className="flex flex-wrap gap-2">
        {assets.hashtags.map((tag, index) => <span key={index} className="bg-slate-700 text-sky-300 text-sm font-medium px-2.5 py-1 rounded-full">{tag}</span>)}
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-sky-400 mb-2">Gợi Ý Thumbnail</h3>
      <p className="whitespace-pre-wrap text-slate-300 bg-slate-900/50 p-3 rounded-md">{assets.thumbnailSuggestion}</p>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-sky-400 mb-2">Gợi Ý Logo</h3>
      <p className="whitespace-pre-wrap text-slate-300 bg-slate-900/50 p-3 rounded-md">{assets.logoSuggestion}</p>
    </div>
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ loading, error, result }) => {
  if (loading) {
    return (
      <div className="mt-8 p-6 bg-slate-800 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[200px]">
        <Spinner />
        <p className="mt-4 text-slate-400">AI đang suy nghĩ, vui lòng chờ trong giây lát...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-red-900/20 border border-red-500 text-red-300 rounded-xl shadow-lg">
        <h3 className="font-semibold mb-2">Đã xảy ra lỗi</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }
  
  const isChannelAssets = (res: ResultData): res is ChannelAssets => {
    return res !== null && typeof res === 'object' && 'channelNames' in res;
  };

  return (
    <div className="mt-8 p-6 bg-slate-800 rounded-xl shadow-lg animate-fade-in">
        {isChannelAssets(result) ? (
            renderChannelAssets(result)
        ) : (
            <div>
                 <h3 className="text-lg font-semibold text-sky-400 mb-4">Kết Quả Phân Tích</h3>
                 <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-sky-400 prose-ul:list-disc prose-li:text-slate-300 prose-a:text-sky-400 hover:prose-a:text-sky-300">
                    <pre className="whitespace-pre-wrap bg-slate-900/50 p-4 rounded-md text-slate-300 text-sm leading-relaxed font-sans">{result}</pre>
                 </div>
            </div>
        )}
    </div>
  );
};

export default ResultsDisplay;

