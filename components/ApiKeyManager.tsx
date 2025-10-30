import React, { useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { ApiProviderType, AVAILABLE_MODELS } from '../types';
import { PlusIcon, TrashIcon, CheckCircleIcon, KeyIcon, XMarkIcon } from './icons';
import { validateApiKey } from '../services/aiService';
import Spinner from './Spinner';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose }) => {
  const { 
    apiKeys, 
    activeApiKey, 
    addApiKey, 
    removeApiKey, 
    setActiveApiKeyId,
    selectModel,
    selectedModels,
    availableModelsForActiveProvider
  } = useApi();
  const [newKey, setNewKey] = useState('');
  const [provider, setProvider] = useState<ApiProviderType>('gemini');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAddKey = async () => {
    if (!newKey.trim()) {
      setError('API key không được để trống.');
      return;
    }
    setError('');
    setIsVerifying(true);

    if (provider === 'openai') {
        // OpenAI keys are added directly without validation for now
        addApiKey(provider, newKey);
        setNewKey('');
        setIsVerifying(false);
        return;
    }

    const { success, error: validationError } = await validateApiKey(provider, newKey);
    setIsVerifying(false);

    if (success) {
      addApiKey(provider, newKey);
      setNewKey('');
    } else {
      setError(validationError || 'API key không hợp lệ.');
    }
  };
  
  if (!isOpen) return null;

  const providerToShow: ApiProviderType = activeApiKey?.provider || 'gemini';
  const providerName = providerToShow === 'gemini' ? 'Gemini' : 'OpenAI';
  const modelsToList = activeApiKey ? availableModelsForActiveProvider : AVAILABLE_MODELS.gemini;
  const selectedValue = selectedModels[providerToShow] || '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <KeyIcon className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-slate-100">Quản lý API & Models</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Add new key form */}
          <div className="space-y-3">
            <h3 className="font-medium text-slate-300">Thêm Key Mới</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as ApiProviderType)}
                className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 flex-shrink-0"
              >
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
              <input
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Dán API key của bạn vào đây"
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              />
              <button
                onClick={handleAddKey}
                disabled={isVerifying}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 duration-200 disabled:bg-slate-600 disabled:cursor-wait"
              >
                {isVerifying ? <Spinner /> : <PlusIcon className="w-5 h-5" />}
                <span className="sm:inline">{isVerifying ? "Đang kiểm tra..." : (provider === 'gemini' ? "Kiểm tra & Thêm" : "Thêm")}</span>
              </button>
            </div>
             {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          {/* Key list */}
          <div className="space-y-3">
             <h3 className="font-medium text-slate-300">Keys Đã Lưu</h3>
             {apiKeys.length === 0 ? (
                <p className="text-slate-400 text-center py-4 border-2 border-dashed border-slate-700 rounded-lg">Chưa có API key nào được lưu.</p>
             ) : (
                <div className="space-y-2">
                    {apiKeys.map(key => (
                        <div key={key.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeApiKey?.id === key.id ? 'bg-primary-500/10' : 'bg-slate-700/50'}`}>
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-100">{key.displayName}</p>
                                <p className="text-xs text-slate-400">{key.provider.charAt(0).toUpperCase() + key.provider.slice(1)}</p>
                            </div>
                            {activeApiKey?.id === key.id ? (
                                <span className="flex items-center gap-1.5 text-sm font-medium text-green-400 px-2.5 py-1 rounded-full bg-green-500/10">
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Đang hoạt động
                                </span>
                            ) : (
                                <button onClick={() => setActiveApiKeyId(key.id)} className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors whitespace-nowrap px-3 py-1 rounded-md hover:bg-primary-500/10">
                                    Kích hoạt
                                </button>
                            )}
                            <button onClick={() => removeApiKey(key.id)} className="p-2 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                </div>
             )}
          </div>
          
          {/* Model Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <h3 className="font-medium text-slate-300">Chọn Model AI</h3>
            <div>
              <label htmlFor="active-model-select" className="block text-sm font-medium text-slate-400 mb-1">
                Model cho {providerName}
              </label>
              <select
                  id="active-model-select"
                  value={selectedValue}
                  onChange={(e) => selectModel(providerToShow, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              >
                  {modelsToList.map(model => (
                      <option key={model} value={model}>{model}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end">
             <button
                onClick={onClose}
                className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;