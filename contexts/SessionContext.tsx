import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SavedSession, AppTab, ResultData } from '../types';

interface SessionContextType {
  savedSessions: SavedSession[];
  saveSession: (name: string, type: AppTab, data: NonNullable<ResultData>) => void;
  deleteSession: (id: string) => void;
  exportSessions: () => void;
  importSessions: (file: File) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSIONS = 'yt_assistant_sessions';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    try {
      const storedSessions = localStorage.getItem(LOCAL_STORAGE_SESSIONS);
      return storedSessions ? JSON.parse(storedSessions) : [];
    } catch (error) {
      console.error("Failed to parse sessions from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SESSIONS, JSON.stringify(savedSessions));
  }, [savedSessions]);

  const saveSession = useCallback((name: string, type: AppTab, data: NonNullable<ResultData>) => {
    const newSession: SavedSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      timestamp: Date.now(),
      type,
      data,
    };
    setSavedSessions(prev => [newSession, ...prev]);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSavedSessions(prev => prev.filter(session => session.id !== id));
  }, []);

  const exportSessions = useCallback(() => {
    if (savedSessions.length === 0) {
      alert("Không có phiên nào để xuất.");
      return;
    }
    const dataStr = JSON.stringify(savedSessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `youtube_assistant_sessions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [savedSessions]);

  const importSessions = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File content is not valid text.");
                }
                const importedData = JSON.parse(text);
                if (!Array.isArray(importedData)) {
                    throw new Error("File format is incorrect. Expected an array of sessions.");
                }
                
                // Basic validation of imported sessions
                const validSessions = importedData.filter(item => 
                    item.id && item.name && item.timestamp && item.type && item.data
                );

                setSavedSessions(prev => {
                    const existingIds = new Set(prev.map(s => s.id));
                    const newSessions = validSessions.filter(s => !existingIds.has(s.id));
                    return [...prev, ...newSessions];
                });
                resolve();

            } catch (error) {
                console.error("Failed to import sessions:", error);
                alert(`Lỗi khi nhập file: ${error instanceof Error ? error.message : 'Unknown error'}`);
                reject(error);
            }
        };
        reader.onerror = (error) => {
            console.error("File reading error:", error);
            alert("Đã xảy ra lỗi khi đọc file.");
            reject(error);
        };
        reader.readAsText(file);
    });
  }, []);

  const value = {
    savedSessions,
    saveSession,
    deleteSession,
    exportSessions,
    importSessions,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};