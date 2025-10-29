import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ApiKey, ApiProviderType, AVAILABLE_MODELS } from '../types';

interface ApiContextType {
  apiKeys: ApiKey[];
  activeApiKey: ApiKey | null;
  addApiKey: (provider: ApiProviderType, key: string) => void;
  removeApiKey: (id: string) => void;
  setActiveApiKeyId: (id: string | null) => void;
  selectedModels: { [key in ApiProviderType]?: string };
  selectModel: (provider: ApiProviderType, model: string) => void;
  selectedModelForActiveProvider: string | undefined;
  availableModelsForActiveProvider: string[];
  executeApiCall: <T extends any[], R>(
    apiFunction: (...args: [...T, string, string]) => Promise<R>,
    ...args: T
  ) => Promise<R>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = 'yt_assistant_api_keys';
const LOCAL_STORAGE_ACTIVE_ID = 'yt_assistant_active_api_key_id';
const LOCAL_STORAGE_MODELS = 'yt_assistant_selected_models';

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    try {
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEYS);
      return storedKeys ? JSON.parse(storedKeys) : [];
    } catch (error) {
      console.error("Failed to parse API keys from localStorage", error);
      return [];
    }
  });

  const [activeApiKeyId, setActiveApiKeyIdState] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_ACTIVE_ID) || null;
  });
  
  const [selectedModels, setSelectedModels] = useState<{ [key in ApiProviderType]?: string }>(() => {
    try {
      const storedModels = localStorage.getItem(LOCAL_STORAGE_MODELS);
      const parsed = storedModels ? JSON.parse(storedModels) : {};
      const defaults = {
        gemini: AVAILABLE_MODELS.gemini[0],
        openai: AVAILABLE_MODELS.openai[0],
      };
      return { ...defaults, ...parsed };
    } catch (error) {
      console.error("Failed to parse selected models from localStorage", error);
      return {
        gemini: AVAILABLE_MODELS.gemini[0],
        openai: AVAILABLE_MODELS.openai[0],
      };
    }
  });


  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS, JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    if (activeApiKeyId) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_ID, activeApiKeyId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_ID);
    }
  }, [activeApiKeyId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_MODELS, JSON.stringify(selectedModels));
  }, [selectedModels]);
  
  const addApiKey = useCallback((provider: ApiProviderType, key: string) => {
    if (!key.trim()) return;
    const newKey: ApiKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      provider,
      key,
      displayName: `${provider === 'gemini' ? 'Gemini' : 'OpenAI'} Key ...${key.slice(-4)}`
    };
    setApiKeys(prev => [...prev, newKey]);
    if (!activeApiKeyId) {
      setActiveApiKeyIdState(newKey.id);
    }
  }, [activeApiKeyId]);

  const removeApiKey = useCallback((id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    if (activeApiKeyId === id) {
        const remainingKeys = apiKeys.filter(key => key.id !== id);
        setActiveApiKeyIdState(remainingKeys.length > 0 ? remainingKeys[0].id : null);
    }
  }, [apiKeys, activeApiKeyId]);
  
  const setActiveApiKeyId = useCallback((id: string | null) => {
    setActiveApiKeyIdState(id);
  }, []);
  
  const selectModel = useCallback((provider: ApiProviderType, model: string) => {
    setSelectedModels(prev => ({...prev, [provider]: model}));
  }, []);
  
  const activeApiKey = useMemo(() => {
    if (!activeApiKeyId) return null;
    let key = apiKeys.find(k => k.id === activeApiKeyId);
    if (!key && apiKeys.length > 0) {
      key = apiKeys[0];
      setActiveApiKeyIdState(key.id);
    }
    if (!key) {
        setActiveApiKeyIdState(null);
        return null;
    }
    return key;
  }, [apiKeys, activeApiKeyId]);

  const selectedModelForActiveProvider = useMemo(() => {
    if (!activeApiKey) return undefined;
    return selectedModels[activeApiKey.provider];
  }, [activeApiKey, selectedModels]);

  const availableModelsForActiveProvider = useMemo(() => {
    if (!activeApiKey) return [];
    return AVAILABLE_MODELS[activeApiKey.provider] || [];
  }, [activeApiKey]);

  const executeApiCall = useCallback(async <T extends any[], R>(
    apiFunction: (...args: [...T, string, string]) => Promise<R>,
    ...args: T
  ): Promise<R> => {
    if (!activeApiKey || !selectedModelForActiveProvider) {
      throw new Error("Vui lòng kích hoạt một API key và chọn model trong phần Quản lý API.");
    }

    const provider = activeApiKey.provider;
    const keysForProvider = apiKeys.filter(k => k.provider === provider);
    if (keysForProvider.length === 0) {
      throw new Error(`Không tìm thấy API key nào cho ${provider}.`);
    }

    let startIndex = keysForProvider.findIndex(k => k.id === activeApiKey.id);
    if (startIndex === -1) startIndex = 0;

    for (let i = 0; i < keysForProvider.length; i++) {
      const keyIndex = (startIndex + i) % keysForProvider.length;
      const currentKey = keysForProvider[keyIndex];
      const model = selectedModels[provider];

      if (!model) {
        throw new Error(`Không tìm thấy model nào được chọn cho ${provider}.`);
      }

      try {
        console.log(`Attempting API call with key: ${currentKey.displayName}`);
        const result = await apiFunction(...args, currentKey.key, model);
        
        if (currentKey.id !== activeApiKey.id) {
            console.log(`API call successful. Switching active key to: ${currentKey.displayName}`);
            setActiveApiKeyId(currentKey.id);
        }
        return result;
      } catch (error) {
        console.warn(`API call failed for key ${currentKey.displayName}:`, error);
        if (i === keysForProvider.length - 1) {
          // This was the last key, throw the final error
          throw new Error(`Tất cả API keys cho ${provider} đều thất bại. Lỗi cuối cùng: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    // This should not be reachable, but as a fallback:
    throw new Error(`Tất cả API keys cho ${provider} đều thất bại.`);

  }, [apiKeys, activeApiKey, selectedModelForActiveProvider, selectedModels, setActiveApiKeyId]);


  const value = {
    apiKeys,
    activeApiKey,
    addApiKey,
    removeApiKey,
    setActiveApiKeyId,
    selectedModels,
    selectModel,
    selectedModelForActiveProvider,
    availableModelsForActiveProvider,
    executeApiCall,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};