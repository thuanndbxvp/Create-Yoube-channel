import React, { useState, useRef } from 'react';
import { analyzeCompetitorData } from '../services/aiService';
import { ResultData } from '../types';
import { useApi } from '../contexts/ApiContext';
import { UploadIcon, ChartBarIcon } from './icons';

declare var XLSX: any;

interface CompetitorAnalyzerProps {
  setLoading: (loading: boolean) => void;
  setResult: (result: ResultData) => void;
  setError: (error: string | null) => void;
  handleReset: () => void;
}

const ANALYSIS_PROMPT = `Bạn là chuyên gia YouTube Data & Strategy. Hãy đọc file Excel có nhiều sheet (mỗi sheet là dữ liệu 1 kênh với các cột: Tên video, Mô tả, Thời lượng, Lượt xem, Like, URL). Phân tích từng sheet, so sánh các kênh, tìm mô hình nội dung hiệu quả, đề xuất chiến lược, gói brand, 24 chủ đề trend, công thức sản xuất và hướng phát triển cho kênh của người dùng.

Hãy phân tích và xuất ra báo cáo đầy đủ theo cấu trúc chuẩn sau:

## 📊 1. Tổng quan dữ liệu (All Channels Overview)
- Tổng số kênh (sheet): {count_channels}
- Tổng số video: {total_videos}
- Tổng lượt xem: {sum_views_all}
- View trung bình/video: {avg_views_all}
- Like trung bình/video: {avg_likes_all}
- Tỷ lệ Like/View trung bình: {(avg_likes_all/avg_views_all)*100}%
- Thời lượng trung bình: {avg_duration_all}

## 📈 2. Phân tích chi tiết từng kênh (Per-Channel Analysis)
### Kênh: {sheet_name}
- Số video, tổng view, view TB, like TB, Like/View%, thời lượng TB
- Top 5 video view cao nhất & Top 5 video tỷ lệ Like/View cao nhất
- Top 10 từ khóa phổ biến từ tên và mô tả
- Phân bố độ dài: <5p | 5-15p | >15p + hiệu suất mỗi nhóm
- Phân tích tương quan (Duration ↔ Views)
- Nhận định nhanh về điểm mạnh và điểm yếu nội dung

## ⚔️ 3. So sánh chéo giữa các kênh (Cross-Channel Benchmark)
- Bảng tổng hợp hiệu suất | Kênh | Tổng video | Tổng view | View TB | Like TB | Like/View % | Độ dài TB |
- Nhận diện kênh dẫn đầu và xu hướng nội dung chung
- 3 insight liên-kênh và điểm khác biệt đáng chú ý

## 🧭 4. Hướng nội dung cho KÊNH CỦA TÔI (Content Direction for My Channel)
- 3 persona khán giả mục tiêu (nỗi đau – động lực – ngữ cảnh xem – thời gian xem)
- 3 content pillars cốt lõi + giải thích vì sao phù hợp
- 5 định dạng video đề xuất (ví dụ: story-driven, short facts, animated explainer …)
- Độ dài tối ưu và 3 khung giờ đăng hiệu quả nhất
- SEO starter pack = 10 từ khóa chính + 10 phụ + mẫu mô tả 160–220 ký tự

## ⚙️ 5. Công thức sản xuất (Production Formula)
- **Cấu trúc video:** Hook (0–15s) → Value Blocks (3 đoạn) → Recap → CTA
- **Nhịp dựng:** Cắt mỗi X giây | B-roll mỗi Y giây | WPM ≈ {wpm}
- **Âm thanh:** Nhạc thể loại gợi ý + mức âm lượng tương đối
- **Thumbnail:** Bố cục 3 điểm, tối đa 4 từ text, tương phản cao
- **Checklist 8 bước QA:** Âm – Ảnh – Sub – Metadata – Tags – End Screen …
- **A/B Testing Plan 4 tuần:** Tiêu đề + Thumbnail + 30s đầu → đánh giá CTR, AVD

## 🔥 6. 24 Chủ đề video “đi đúng trend” (24 Trending Video Topics)
- Chia 3 nhóm (8 chủ đề/nhóm): Hot Keywords / Evergreen Boost / News-Adjacent
- Mỗi chủ đề gồm: Tiêu đề gợi ý | Hook 10-15s | Mô tả ≤ 25 từ | Từ khóa chính/phụ | Độ dài gợi ý | CTA | Text thumbnail

## 🎨 7. Gói brand đề xuất (5 phương án)
Mỗi phương án gồm:
- **Tên kênh (EN)** + Chú giải ý nghĩa (VI)
- **Mô tả kênh:** 1 câu giá trị + 1 câu bằng chứng/xã hội
- **Hashtags:** 8-12 từ cốt lõi
- **Thumbnail style:** Màu chủ đạo + font + bố cục + ví dụ text
- **Logo idea:** Biểu tượng, ý nghĩa, palette 4 màu (mã HEX)

## 📅 8. Lộ trình 30–60–90 ngày & KPI
- Mục tiêu: CTR ↑ %, AVD ↑ %, Like/View ↑ %, tần suất đăng
- Lịch mẫu 4 tuần (ngày | chủ đề | độ dài | loại video)
- Checklist 10 mục khi xuất bản

## 📈 9. Biểu đồ (thực thi nếu có Code Interpreter)
- Scatter Views vs Duration (theo kênh)
- Histogram Like/View %
- Bar chart Top keywords

## 📚 10. Phụ lục & Template
- Top 20 video toàn hệ theo Views và Like/View %
- Template tiêu đề (10 công thức) / mô tả (3 mẫu) / CTA (5 mẫu)
- Gợi ý đặt tên file & cấu trúc thư mục dự án`;

const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (error) => reject(error);
    });
};

const CompetitorAnalyzer: React.FC<CompetitorAnalyzerProps> = ({ setLoading, setResult, setError, handleReset }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const { 
    activeApiKey,
    executeApiCall
  } = useApi();

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExcelFile(e.target.files[0]);
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
      
      // Use the context's executeApiCall which handles retries and key switching
      const result = await executeApiCall(analyzeCompetitorData, ANALYSIS_PROMPT, allSheetsData);
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