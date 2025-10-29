
import React from 'react';
import { ResultData, ChannelAssets } from '../types';
import Spinner from './Spinner';

interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  result: ResultData;
}

// Make TypeScript aware of the `marked` library loaded from the CDN
declare var marked: any;

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

  const renderAnalysisResult = (markdownText: string) => {
    // Sanitize option is recommended for security if the content can be user-generated
    // but for AI-generated content we trust, we can proceed.
    const htmlContent = marked.parse(markdownText);
    return (
        <div>
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Kết Quả Phân Tích Chi Tiết</h3>
            <div 
                className="prose prose-invert max-w-none 
                           prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-sky-400 
                           prose-ul:list-disc prose-li:my-1 prose-li:text-slate-300 
                           prose-a:text-sky-400 hover:prose-a:text-sky-300
                           prose-table:border-collapse prose-table:w-full
                           prose-thead:border-b prose-thead:border-slate-600
                           prose-th:p-2 prose-th:text-left prose-th:font-semibold
                           prose-tbody:divide-y prose-tbody:divide-slate-700
                           prose-td:p-2 prose-td:align-baseline
                           prose-code:bg-slate-700 prose-code:rounded prose-code:p-1 prose-code:text-sm prose-code:font-mono
                           "
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
        </div>
    );
  };


  return (
    <div className="mt-8 p-6 bg-slate-800 rounded-xl shadow-lg animate-fade-in">
        {isChannelAssets(result) 
            ? renderChannelAssets(result)
            : renderAnalysisResult(result as string)
        }
    </div>
  );
};

export default ResultsDisplay;