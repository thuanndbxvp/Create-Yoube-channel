import React, { useState } from 'react';
import { ResultData, ChannelIdeaSet } from '../types';
import Spinner from './Spinner';
import { CopyIcon, CheckIcon } from './icons';

interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  result: ResultData;
}

// Make TypeScript aware of the `marked` library loaded from the CDN
declare var marked: any;

const isChannelIdeaSets = (res: ResultData): res is ChannelIdeaSet[] => {
  return Array.isArray(res) && res.length > 0 && 'channelName' in res[0];
};

const IdeaCard: React.FC<{ idea: ChannelIdeaSet; index: number }> = ({ idea, index }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string | string[], type: string) => {
    const textToCopy = Array.isArray(text) ? text.join(' ') : text;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 transform transition-transform hover:scale-[1.02] hover:border-primary-500/50">
      <h3 className="text-xl font-bold text-primary-400 mb-1">Ý tưởng {index + 1}: <span className="text-white">{idea.channelName}</span></h3>
      {idea.channelName_vi && <p className="text-sm text-slate-400 italic mb-4">({idea.channelName_vi})</p>}
      
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-slate-300">Mô tả kênh</h4>
            <button 
              onClick={() => copyToClipboard(idea.description, 'description')} 
              className={`p-1.5 rounded-md transition-colors ${
                copied === 'description' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
              title={copied === 'description' ? 'Đã chép!' : 'Chép Mô tả'}
            >
              {copied === 'description' ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-slate-400 whitespace-pre-wrap">{idea.description}</p>
          {idea.description_vi && <p className="mt-2 text-sm text-slate-500 italic border-l-2 border-slate-600 pl-2">Giải thích: {idea.description_vi}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-300">Hashtags</h4>
             <button 
                onClick={() => copyToClipboard(idea.hashtags, 'hashtags')} 
                className={`p-1.5 rounded-md transition-colors ${
                  copied === 'hashtags' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
                title={copied === 'hashtags' ? 'Đã chép!' : 'Chép Hashtags'}
              >
                {copied === 'hashtags' ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
              </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {idea.hashtags.map((tag, i) => <span key={i} className="bg-slate-700 text-primary-300 text-sm font-medium px-2.5 py-1 rounded-full">{tag}</span>)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-700">
          <div className="flex flex-col flex-grow">
            <div className="flex-grow">
              <h4 className="font-semibold text-slate-300 mb-1">Ý tưởng Banner</h4>
              <p className="text-slate-400 text-sm italic mb-2">{idea.bannerIdea}</p>
              {idea.bannerIdea_vi && <p className="mb-2 text-sm text-slate-500 italic border-l-2 border-slate-600 pl-2">Giải thích: {idea.bannerIdea_vi}</p>}
            </div>
            <div className="relative mt-auto pt-2">
              <pre className="bg-slate-800 p-3 rounded-md text-sm text-slate-300 overflow-x-auto font-mono"><code>{idea.bannerPrompt}</code></pre>
              <button 
                onClick={() => copyToClipboard(idea.bannerPrompt, 'banner')} 
                className={`absolute top-4 right-2 p-1.5 rounded-md transition-colors ${
                  copied === 'banner' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                }`}
                title={copied === 'banner' ? 'Đã chép!' : 'Chép Prompt'}
              >
                {copied === 'banner' ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col flex-grow">
            <div className="flex-grow">
              <h4 className="font-semibold text-slate-300 mb-1">Ý tưởng Logo</h4>
              <p className="text-slate-400 text-sm italic mb-2">{idea.logoIdea}</p>
              {idea.logoIdea_vi && <p className="mb-2 text-sm text-slate-500 italic border-l-2 border-slate-600 pl-2">Giải thích: {idea.logoIdea_vi}</p>}
            </div>
            <div className="relative mt-auto pt-2">
              <pre className="bg-slate-800 p-3 rounded-md text-sm text-slate-300 overflow-x-auto font-mono"><code>{idea.logoPrompt}</code></pre>
               <button 
                onClick={() => copyToClipboard(idea.logoPrompt, 'logo')} 
                className={`absolute top-4 right-2 p-1.5 rounded-md transition-colors ${
                  copied === 'logo' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                }`}
                title={copied === 'logo' ? 'Đã chép!' : 'Chép Prompt'}
               >
                {copied === 'logo' ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const renderChannelIdeaSets = (sets: ChannelIdeaSet[]) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-center text-slate-100">Đây là các ý tưởng dành cho bạn!</h2>
    {sets.map((idea, index) => (
      <IdeaCard key={index} idea={idea} index={index} />
    ))}
  </div>
);

const renderAnalysisResult = (markdownText: string) => {
    // Split the markdown into sections based on H2 headings (##)
    const sections = markdownText.trim().split(/\n(?=##\s)/);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-slate-100">Kết Quả Phân Tích Chi Tiết</h2>
            {sections.map((section, index) => {
                // Add horizontal rules before H3s within a section for further separation
                const sectionWithSeparators = section.replace(/\n(###\s)/g, '\n<hr class="my-6 border-slate-700"/>\n$1');
                
                const htmlContent = marked.parse(sectionWithSeparators);

                return (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                        <div 
                            className="prose prose-invert max-w-none 
                                       prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-primary-400 
                                       prose-ul:list-disc prose-li:my-1 prose-li:text-slate-300 
                                       prose-a:text-primary-400 hover:prose-a:text-primary-300
                                       prose-table:border-collapse prose-table:w-full
                                       prose-thead:border-b prose-thead:border-slate-600
                                       prose-th:p-2 prose-th:text-left prose-th:font-semibold
                                       prose-tbody:divide-y prose-tbody:divide-slate-700
                                       prose-td:p-2 prose-td:align-baseline
                                       prose-code:bg-slate-700 prose-code:rounded prose-code:p-1 prose-code:text-sm prose-code:font-mono
                                       prose-hr:border-slate-700"
                            dangerouslySetInnerHTML={{ __html: htmlContent }} 
                        />
                    </div>
                );
            })}
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ loading, error, result }) => {
  if (loading) {
    return (
      <div className="mt-8 p-6 bg-slate-800 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[200px]">
        <Spinner />
        <p className="mt-4 text-slate-400">AI đang sáng tạo, vui lòng chờ trong giây lát...</p>
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
  
  return (
    <div className="mt-8 p-6 bg-slate-800 rounded-xl shadow-lg animate-fade-in">
        {isChannelIdeaSets(result) 
            ? renderChannelIdeaSets(result)
            : renderAnalysisResult(result as string)
        }
    </div>
  );
};

export default ResultsDisplay;