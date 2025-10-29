import React, { useRef } from 'react';
import { useSession } from '../contexts/SessionContext';
import { AppTab, SavedSession } from '../types';
import { LibraryIcon, XMarkIcon, TrashIcon, ExportIcon, ImportIcon } from './icons';

interface LibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: SavedSession) => void;
}

const Library: React.FC<LibraryProps> = ({ isOpen, onClose, onLoadSession }) => {
  const { savedSessions, deleteSession, exportSessions, importSessions } = useSession();
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importSessions(file);
        alert('Nhập phiên thành công!');
      } catch (error) {
        // Error is already alerted in the context
      }
    }
     // Reset file input
    if(e.target) e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <LibraryIcon className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-slate-100">Thư viện Phiên</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-grow overflow-y-auto max-h-[60vh]">
          {savedSessions.length === 0 ? (
            <p className="text-slate-400 text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
              Thư viện của bạn trống. <br/> Hãy lưu một kết quả để xem lại sau.
            </p>
          ) : (
            <div className="space-y-3">
              {savedSessions.map(session => (
                <div key={session.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex-grow">
                    <p className="font-semibold text-slate-100">{session.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                       <span className={`px-2 py-0.5 rounded-full ${session.type === AppTab.GENERATOR ? 'bg-primary-500/20 text-primary-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                          {session.type === AppTab.GENERATOR ? 'Ý tưởng' : 'Phân tích'}
                       </span>
                       <span>{new Date(session.timestamp).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <button onClick={() => onLoadSession(session)} className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors whitespace-nowrap px-3 py-1.5 rounded-md hover:bg-primary-500/10">
                    Tải
                  </button>
                  <button onClick={() => deleteSession(session.id)} className="p-2 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-slate-700 flex-shrink-0 flex flex-col sm:flex-row items-center justify-end gap-3">
          <input type="file" accept=".json" ref={importInputRef} onChange={handleFileImport} className="hidden" />
          <button
            onClick={handleImportClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <ImportIcon className="w-5 h-5"/>
            Nhập phiên (.json)
          </button>
          <button
            onClick={exportSessions}
            disabled={savedSessions.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            <ExportIcon className="w-5 h-5"/>
            Xuất tất cả
          </button>
        </div>

      </div>
    </div>
  );
};

export default Library;