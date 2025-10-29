import React, { useState } from 'react';
import { ResultData, ChannelIdeaSet } from '../types';
import Spinner from './Spinner';
import { 
    CopyIcon, CheckIcon, ChartBarIcon, MagnifyingGlassIcon, ScaleIcon, CompassIcon, 
    CogIcon, FireIcon, PaletteIcon, CalendarIcon, BookOpenIcon, PlusIcon, MinusIcon
} from './icons';

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

// Helper Components for Analysis Display
const Collapsible: React.FC<{ title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex-grow font-semibold text-slate-200">{title}</div>
                <div className="text-slate-400">
                    {isOpen ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                </div>
            </button>
            {isOpen && <div className="p-4 border-t border-slate-700">{children}</div>}
        </div>
    );
};

const SimpleHorizontalBarChart: React.FC<{ data: { label: string; value: number; formattedValue: string }[]; title: string }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    if (maxValue === 0) return null; // Don't render if no data
    return (
        <div className="my-4">
            <h4 className="font-semibold text-slate-300 mb-2">{title}</h4>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2/5 truncate text-slate-400" title={item.label}>{item.label}</div>
                        <div className="w-3/5 flex items-center gap-2">
                            <div className="flex-grow bg-slate-700 rounded-full h-4">
                                <div
                                    className="bg-primary-500 h-4 rounded-full"
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                ></div>
                            </div>
                            <span className="w-20 text-right font-medium text-slate-300">{item.formattedValue}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Analysis Rendering Logic as a Component to handle its own state
const AnalysisResult: React.FC<{ markdownText: string }> = ({ markdownText }) => {
    const sections = markdownText.trim().split(/\n(?=##\s)/);
    const [copied, setCopied] = useState(false);
    // State to manage collapsible main sections. First section is open by default.
    const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true });

    const toggleSection = (index: number) => {
        setOpenSections(prev => ({ ...prev, [index]: !(prev[index] ?? false) }));
    };

    const copyReportToClipboard = () => {
        navigator.clipboard.writeText(markdownText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const getIconAndTitle = (section: string): { icon: React.ReactNode, title: string, restOfContent: string } => {
        const lines = section.trim().split('\n');
        const titleLine = lines.shift()?.replace(/^[#📈📊⚔️🧭⚙️🔥🎨📅📚\s]*/, '') || '';
        const restOfContent = lines.join('\n');
        
        const lowerTitle = titleLine.toLowerCase();
        let icon: React.ReactNode = null;

        if (lowerTitle.includes('tổng quan')) icon = <ChartBarIcon className="w-7 h-7" />;
        else if (lowerTitle.includes('phân tích chi tiết')) icon = <MagnifyingGlassIcon className="w-7 h-7" />;
        else if (lowerTitle.includes('so sánh chéo')) icon = <ScaleIcon className="w-7 h-7" />;
        else if (lowerTitle.includes('hướng nội dung')) icon = <CompassIcon className="w-7 h-7" />;
        else if (lowerTitle.includes('công thức sản xuất')) icon = <CogIcon className="w-7 h-7" />;
        else if (lowerTitle.includes('chủ đề video')) icon = <FireIcon className="w-7 h-7" />;
        else if (lowerTitle.includes('gói brand')) icon = <PaletteIcon className="w-7 h-7" />;
        else if (lowerTitle.includes('lộ trình')) icon = <CalendarIcon className="w-7 h-7" />;
        else if (lowerTitle.includes('biểu đồ')) icon = <ChartBarIcon className="w-7 h-7" />;
        else if (lowerTitle.includes('phụ lục')) icon = <BookOpenIcon className="w-7 h-7" />;
        
        return { icon, title: titleLine, restOfContent };
    };
    
    // Parser for "So sánh chéo" table
    const parseComparisonTable = (markdown: string) => {
        const lines = markdown.split('\n').filter(line => line.startsWith('|'));
        if (lines.length < 3) return [];
        const dataLines = lines.slice(2);
        return dataLines.map(line => {
            const [_, kênh, __, tổngView, viewTB, ___, likeView] = line.split('|').map(s => s.trim());
            return {
                kênh,
                tổngView: parseFloat(tổngView.replace(/,/g, '')),
                viewTB: parseFloat(viewTB.replace(/,/g, '')),
                likeView: parseFloat(likeView.replace('%', '')),
            };
        }).filter(d => d.kênh && !isNaN(d.tổngView));
    };
    
    // Parser for "Top 5 video" lists
    const parseTopVideos = (content: string, type: 'view' | 'like') => {
        const regex = type === 'view'
            ? /-\s(.*?)\s+\(([\d,.]+)\s+lượt xem\)/g
            : /-\s(.*?)\s+\(([\d,.]+)%\)/g;
        const matches = [...content.matchAll(regex)];
        return matches.map(match => ({
            label: match[1].trim(),
            value: parseFloat(match[2].replace(/,/g, '')),
            formattedValue: type === 'view' ? parseInt(match[2].replace(/,/g, '')).toLocaleString('vi-VN') : `${match[2]}%`,
        })).slice(0, 5);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-center text-slate-100">Kết Quả Phân Tích Chi Tiết</h2>
                <button 
                  onClick={copyReportToClipboard} 
                  className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                    copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                  title={copied ? 'Đã chép!' : 'Chép toàn bộ báo cáo'}
                >
                  {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                  {copied ? 'Đã chép' : 'Chép báo cáo'}
                </button>
            </div>
            {sections.map((section, index) => {
                const { icon, title, restOfContent } = getIconAndTitle(section);
                let chartElement: React.ReactNode = null;
                let customContent: React.ReactNode = null;
                const isOpen = openSections[index] ?? false;

                if (title.toLowerCase().includes('so sánh chéo')) {
                    const tableData = parseComparisonTable(restOfContent);
                    if (tableData.length > 0) {
                        chartElement = (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <SimpleHorizontalBarChart
                                    title="So sánh Tổng Lượt Xem"
                                    data={tableData.map(d => ({ label: d.kênh, value: d.tổngView, formattedValue: d.tổngView.toLocaleString('vi-VN') }))}
                                />
                                <SimpleHorizontalBarChart
                                    title="So sánh Tỷ lệ Like/View"
                                    data={tableData.map(d => ({ label: d.kênh, value: d.likeView, formattedValue: `${d.likeView.toFixed(2)}%` }))}
                                />
                            </div>
                        );
                    }
                }
                
                if (title.toLowerCase().includes('phân tích chi tiết')) {
                    const channelSections = restOfContent.trim().split(/\n(?=###\sKênh:)/);
                    customContent = (
                        <div className="space-y-4">
                        {channelSections.map((channelMarkdown, i) => {
                            const lines = channelMarkdown.trim().split('\n');
                            const channelTitle = lines.shift()?.replace(/###\sKênh:/, '').trim() || `Kênh ${i + 1}`;
                            const content = lines.join('\n');
                            
                            const topViewsData = parseTopVideos(content, 'view');
                            const topLikesData = parseTopVideos(content, 'like');

                            return (
                                <Collapsible key={i} title={channelTitle} defaultOpen={i < 2}>
                                    {topViewsData.length > 0 && <SimpleHorizontalBarChart title="Top 5 video view cao nhất" data={topViewsData} />}
                                    {topLikesData.length > 0 && <SimpleHorizontalBarChart title="Top 5 video tỷ lệ Like/View cao nhất" data={topLikesData} />}
                                    <div 
                                        className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-primary-400 prose-ul:list-disc prose-li:my-1 prose-li:text-slate-300 prose-a:text-primary-400 hover:prose-a:text-primary-300 prose-table:border-collapse prose-table:w-full prose-thead:border-b prose-thead:border-slate-600 prose-th:p-2 prose-th:text-left prose-th:font-semibold prose-tbody:divide-y prose-tbody:divide-slate-700 prose-td:p-2 prose-td:align-baseline prose-code:bg-slate-700 prose-code:rounded prose-code:p-1 prose-code:text-sm prose-code:font-mono prose-hr:border-slate-700 prose-p:first:mt-0 prose-ul:first:mt-0 prose-ol:first:mt-0 prose-table:first:mt-0 prose-h3:first:mt-0 prose-h4:first:mt-0"
                                        dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
                                    />
                                </Collapsible>
                            );
                        })}
                        </div>
                    );
                }

                return (
                    <div key={index} className="bg-slate-900/50 rounded-lg border border-slate-700">
                        <button onClick={() => toggleSection(index)} className="w-full flex items-center justify-between p-4 sm:p-6 text-left transition-colors hover:bg-slate-800/50">
                            <div className="flex items-center gap-4 flex-grow">
                               {icon && <div className="text-primary-400 flex-shrink-0">{icon}</div>}
                               <h2 className="text-xl font-bold text-slate-100">{title}</h2>
                            </div>
                            <div className="text-slate-400 flex-shrink-0 ml-4">
                                {isOpen ? <MinusIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
                            </div>
                        </button>
                        {isOpen && (
                            <div className="px-4 sm:px-6 pb-6 pt-4 border-t border-slate-700">
                                {chartElement}
                                {customContent ? customContent : (
                                    <div 
                                        className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-primary-400 prose-ul:list-disc prose-li:my-1 prose-li:text-slate-300 prose-a:text-primary-400 hover:prose-a:text-primary-300 prose-table:border-collapse prose-table:w-full prose-thead:border-b prose-thead:border-slate-600 prose-th:p-2 prose-th:text-left prose-th:font-semibold prose-tbody:divide-y prose-tbody:divide-slate-700 prose-td:p-2 prose-td:align-baseline prose-code:bg-slate-700 prose-code:rounded prose-code:p-1 prose-code:text-sm prose-code:font-mono prose-hr:border-slate-700 prose-p:first:mt-0 prose-ul:first:mt-0 prose-ol:first:mt-0 prose-table:first:mt-0 prose-h3:first:mt-0 prose-h4:first:mt-0"
                                        dangerouslySetInnerHTML={{ __html: marked.parse(restOfContent) }} 
                                    />
                                )}
                            </div>
                        )}
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
            : <AnalysisResult markdownText={result as string} />
        }
    </div>
  );
};

export default ResultsDisplay;