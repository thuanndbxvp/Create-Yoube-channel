import React, { useState, useRef } from 'react';
import { ResultData } from '../types';
import { useApi } from '../contexts/ApiContext';
import { UploadIcon, ChartBarIcon } from './icons';

declare var XLSX: any;

interface CompetitorAnalyzerProps {
  setLoading: (loading: boolean) => void;
  setResult: (result: ResultData) => void;
  setError: (error: string | null) => void;
  handleReset: () => void;
  setAnalyzerInputFileName: (name: string) => void;
}

const ANALYSIS_PROMPT = `Bạn là chuyên gia Phân tích Chiến lược YouTube. Dựa trên dữ liệu Excel được cung cấp (mỗi sheet là một kênh đối thủ), hãy tạo một báo cáo chiến lược toàn diện cho kênh của người dùng.

**Quan trọng:** Báo cáo này nên tập trung vào phân tích **định tính** và các đề xuất chiến lược. **Không** tạo các bảng dữ liệu chi tiết với các con số thống kê cụ thể để vẽ biểu đồ. Thay vào đó, hãy đưa ra các nhận định và tóm tắt.

Báo cáo cần bao gồm các phần chính sau, trình bày bằng tiếng Việt và sử dụng Markdown:

1.  **Tổng quan thị trường ngách:** Thay vì liệt kê số liệu, hãy nhận định chung về chủ đề, phong cách video phổ biến và mức độ cạnh tranh.
2.  **Phân tích từng đối thủ:** Với mỗi kênh, tập trung vào:
    *   Các chủ đề và từ khóa cốt lõi họ đang nhắm tới.
    *   Điểm mạnh, điểm yếu và chiến lược nội dung đặc trưng (ví dụ: họ tập trung vào hướng dẫn, giải trí, hay tin tức?).
3.  **Xu hướng và Cơ hội:** Xác định các xu hướng nội dung chung và các "khoảng trống" hoặc cơ hội mà kênh của người dùng có thể khai thác.
4.  **Chiến lược đề xuất cho kênh của tôi:**
    *   **Định vị:** Xác định khán giả mục tiêu và các chủ đề nội dung (content pillars) chính dựa trên phân tích.
    *   **Nội dung:** Gợi ý các định dạng video, phong cách biên tập và cách tiếp cận để tạo sự khác biệt.
    *   **SEO:** Cung cấp bộ từ khóa ban đầu và mẫu mô tả video tối ưu.
5.  **Ý tưởng nội dung:** Liệt kê 15-20 chủ đề video tiềm năng, dựa trên những gì đang hiệu quả và các cơ hội đã xác định.
6.  **Gói thương hiệu:** Đề xuất 3-4 concept thương hiệu cho kênh (tên, mô tả, phong cách hình ảnh).
7.  **Lộ trình phát triển:** Vạch ra các bước hành động chính cho 30-60 ngày đầu tiên.

Hãy tập trung vào việc đưa ra những nhận định sâu sắc và các đề xuất có tính ứng dụng cao.`;

const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (error) => reject(error);
    });
};

const CompetitorAnalyzer: React.FC<CompetitorAnalyzerProps> = ({ setLoading, setResult, setError, handleReset, setAnalyzerInputFileName }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const { 
    activeApiKey,
    executeApiCall
  } = useApi();

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setExcelFile(file);
      setAnalyzerInputFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApiKey) {
      setError('Vui lòng kích hoạt một API key và chọn model trong phần Quản lý API.');
      return;
    }
    if (!excelFile) {
      setError('Vui lòng tải lên file dữ liệu Excel.');
      return;
    }

    handleReset();
    setLoading(true);

    try {
      const excelBuffer = await fileToArrayBuffer(excelFile);

      const workbook = XLSX.read(excelBuffer, { type: 'array' });
      let allSheetsData = '';
      workbook.SheetNames.forEach((sheetName: string) => {
        allSheetsData += `--- START OF SHEET: ${sheetName} ---\n`;
        const worksheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        allSheetsData += csv;
        allSheetsData += `\n--- END OF SHEET: ${sheetName} ---\n\n`;
      });
      
      const result = await executeApiCall('analyzeCompetitorData', ANALYSIS_PROMPT, allSheetsData);
      setResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi xử lý file. Vui lòng thử lại.';
      setError(`Lỗi: ${errorMessage}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-center text-slate-200">
        Học hỏi từ đối thủ, bứt phá tăng trưởng
      </h2>
      <p className="text-center text-slate-400">
        Tải lên dữ liệu Excel của đối thủ để AI phân tích và đưa ra chiến lược cho bạn.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelChange} className="hidden" ref={excelInputRef} />
             <button type="button" onClick={() => excelInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-slate-200 font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                <UploadIcon className="w-5 h-5"/>
                {excelFile ? excelFile.name : 'Tải lên Dữ liệu Excel'}
            </button>
        </div>

        <button
          type="submit"
          disabled={!excelFile || !activeApiKey}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 duration-200 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          <ChartBarIcon className="w-5 h-5" />
          Phân Tích
        </button>
        {!activeApiKey && (
          <p className="text-center text-sm text-yellow-400">Vui lòng thêm và kích hoạt API key để sử dụng tính năng này.</p>
        )}
      </form>
    </div>
  );
};

export default CompetitorAnalyzer;