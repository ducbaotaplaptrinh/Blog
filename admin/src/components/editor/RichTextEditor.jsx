import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import api from '../../services/api';

export const RichTextEditor = ({ value = '', onChange, placeholder = 'Viết nội dung bài viết ở đây...' }) => {
  const wrapperRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    // Dọn sạch hoàn toàn container trước khi khởi tạo (ngăn duplicate toolbar do React StrictMode)
    wrapperRef.current.innerHTML = '';

    const editorDiv = document.createElement('div');
    wrapperRef.current.appendChild(editorDiv);

    // Custom Image Handler upload trực tiếp lên server lưu trữ file sạch thay vì Base64
    function imageHandler() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        // Giới hạn kích thước ảnh 10MB
        if (file.size > 10 * 1024 * 1024) {
          alert('Kích thước ảnh không được vượt quá 10MB!');
          return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
          const res = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const imageUrl = res.data?.data?.url;
          if (imageUrl && quillRef.current) {
            const range = quillRef.current.getSelection(true);
            quillRef.current.insertEmbed(range.index, 'image', imageUrl);
            quillRef.current.setSelection(range.index + 1);
          }
        } catch (err) {
          console.error('Failed to upload image:', err);
          alert('Tải ảnh lên máy chủ thất bại: ' + (err.response?.data?.message || err.message));
        }
      };
    }

    // Khởi tạo Quill instance với custom toolbar image handler
    const quill = new Quill(editorDiv, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
          ],
          handlers: {
            image: imageHandler,
          },
        },
      },
    });

    quillRef.current = quill;

    if (value) {
      quill.root.innerHTML = value;
    }

    quill.on('text-change', () => {
      const html = quill.root.innerHTML;
      // Nếu chỉ có thẻ rỗng <p><br></p> thì coi như chuỗi rỗng
      const cleanHtml = html === '<p><br></p>' ? '' : html;
      onChange?.(cleanHtml);
    });

    return () => {
      quillRef.current = null;
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = '';
      }
    };
  }, []);

  // Đồng bộ giá trị từ ngoài vào khi value thay đổi (ví dụ khi load initialData)
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className="rich-editor-wrapper text-slate-900 dark:text-slate-100">
      <div ref={wrapperRef} style={{ minHeight: '220px' }} />
      <style>{`
        /* ==================================================
           1. TOOLBAR CONTAINER
           ================================================== */
        .rich-editor-wrapper .ql-toolbar.ql-snow {
          background-color: var(--editor-toolbar-bg, #f8fafc);
          border: 1px solid var(--editor-border, #e2e8f0);
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          padding: 8px 10px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 3px;
        }

        .dark .rich-editor-wrapper .ql-toolbar.ql-snow {
          background-color: #0f172a;
          border-color: #1e293b;
        }

        /* Tool groups divider */
        .rich-editor-wrapper .ql-formats {
          margin-right: 8px !important;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        /* ==================================================
           2. TOOLBAR BUTTONS & ICONS (LIGHT MODE)
           ================================================== */
        .rich-editor-wrapper .ql-snow.ql-toolbar button {
          width: 30px;
          height: 30px;
          border-radius: 0.375rem;
          padding: 5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .rich-editor-wrapper .ql-snow .ql-stroke {
          stroke: #475569;
          transition: stroke 0.15s ease;
        }

        .rich-editor-wrapper .ql-snow .ql-fill {
          fill: #475569;
          transition: fill 0.15s ease;
        }

        .rich-editor-wrapper .ql-snow.ql-toolbar button:hover {
          background-color: #e2e8f0;
        }

        .rich-editor-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke {
          stroke: #6366f1;
        }

        .rich-editor-wrapper .ql-snow.ql-toolbar button:hover .ql-fill {
          fill: #6366f1;
        }

        .rich-editor-wrapper .ql-snow.ql-toolbar button.ql-active {
          background-color: rgba(99, 102, 241, 0.12);
          box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.3);
        }

        .rich-editor-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke {
          stroke: #6366f1;
        }

        .rich-editor-wrapper .ql-snow.ql-toolbar button.ql-active .ql-fill {
          fill: #6366f1;
        }

        /* ==================================================
           3. TOOLBAR BUTTONS & ICONS (DARK MODE - HIGH CONTRAST)
           ================================================== */
        .dark .rich-editor-wrapper .ql-snow .ql-stroke {
          stroke: #cbd5e1 !important;
        }

        .dark .rich-editor-wrapper .ql-snow .ql-fill {
          fill: #cbd5e1 !important;
        }

        .dark .rich-editor-wrapper .ql-snow.ql-toolbar button:hover {
          background-color: #1e293b;
        }

        .dark .rich-editor-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke {
          stroke: #818cf8 !important;
        }

        .dark .rich-editor-wrapper .ql-snow.ql-toolbar button:hover .ql-fill {
          fill: #818cf8 !important;
        }

        .dark .rich-editor-wrapper .ql-snow.ql-toolbar button.ql-active {
          background-color: rgba(99, 102, 241, 0.25);
          box-shadow: inset 0 0 0 1px rgba(129, 140, 248, 0.4);
        }

        .dark .rich-editor-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke {
          stroke: #818cf8 !important;
        }

        .dark .rich-editor-wrapper .ql-snow.ql-toolbar button.ql-active .ql-fill {
          fill: #818cf8 !important;
        }

        /* ==================================================
           4. DROPDOWN PICKERS (NORMAL / HEADINGS)
           ================================================== */
        .rich-editor-wrapper .ql-snow .ql-picker {
          color: #334155;
          font-size: 0.85rem;
          font-weight: 500;
          height: 30px;
          border-radius: 0.375rem;
          transition: all 0.15s ease;
        }

        .dark .rich-editor-wrapper .ql-snow .ql-picker {
          color: #e2e8f0;
        }

        .rich-editor-wrapper .ql-snow .ql-picker-label {
          padding: 4px 8px;
          border-radius: 0.375rem;
          border: 1px solid transparent;
          transition: all 0.15s ease;
        }

        .rich-editor-wrapper .ql-snow .ql-picker-label:hover {
          background-color: #e2e8f0;
          color: #6366f1;
        }

        .dark .rich-editor-wrapper .ql-snow .ql-picker-label:hover {
          background-color: #1e293b;
          color: #818cf8;
        }

        .rich-editor-wrapper .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: #6366f1;
          color: #6366f1;
        }

        .dark .rich-editor-wrapper .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: #818cf8;
          color: #818cf8;
        }

        /* Picker dropdown popover list */
        .rich-editor-wrapper .ql-snow .ql-picker-options {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          padding: 6px;
          z-index: 50;
        }

        .dark .rich-editor-wrapper .ql-snow .ql-picker-options {
          background-color: #0f172a;
          border-color: #334155;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6);
        }

        .rich-editor-wrapper .ql-snow .ql-picker-item {
          padding: 6px 10px;
          border-radius: 0.375rem;
          font-size: 0.85rem;
          color: #475569;
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .dark .rich-editor-wrapper .ql-snow .ql-picker-item {
          color: #94a3b8;
        }

        .rich-editor-wrapper .ql-snow .ql-picker-item:hover {
          background-color: #f1f5f9;
          color: #6366f1;
        }

        .dark .rich-editor-wrapper .ql-snow .ql-picker-item:hover {
          background-color: #1e293b;
          color: #818cf8;
        }

        .rich-editor-wrapper .ql-snow .ql-picker-item.ql-selected {
          font-weight: 600;
          color: #6366f1;
        }

        .dark .rich-editor-wrapper .ql-snow .ql-picker-item.ql-selected {
          color: #818cf8;
        }

        /* ==================================================
           5. EDITOR CONTAINER & CANVAS
           ================================================== */
        .rich-editor-wrapper .ql-container.ql-snow {
          background-color: var(--editor-content-bg, #ffffff);
          border: 1px solid var(--editor-border, #e2e8f0);
          border-top: none;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.95rem;
          line-height: 1.65;
          color: #0f172a;
          transition: border-color 0.2s ease;
        }

        .dark .rich-editor-wrapper .ql-container.ql-snow {
          background-color: #020617;
          border-color: #1e293b;
          color: #f8fafc;
        }

        .rich-editor-wrapper:focus-within .ql-toolbar.ql-snow {
          border-color: #6366f1;
        }

        .rich-editor-wrapper:focus-within .ql-container.ql-snow {
          border-color: #6366f1;
        }

        .dark .rich-editor-wrapper:focus-within .ql-toolbar.ql-snow {
          border-color: #6366f1;
        }

        .dark .rich-editor-wrapper:focus-within .ql-container.ql-snow {
          border-color: #6366f1;
        }

        .rich-editor-wrapper .ql-editor {
          min-height: 220px;
          max-height: 420px;
          overflow-y: auto;
          padding: 16px;
        }

        .rich-editor-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }

        .dark .rich-editor-wrapper .ql-editor.ql-blank::before {
          color: #64748b;
        }

        /* ==================================================
           6. CONTENT TYPOGRAPHY
           ================================================== */
        .rich-editor-wrapper .ql-editor h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .rich-editor-wrapper .ql-editor h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.85rem;
          margin-bottom: 0.4rem;
          line-height: 1.35;
        }

        .rich-editor-wrapper .ql-editor h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.35rem;
          line-height: 1.4;
        }

        .rich-editor-wrapper .ql-editor blockquote {
          border-left: 3px solid #6366f1;
          margin: 1rem 0;
          padding-left: 1rem;
          color: #64748b;
          font-style: italic;
        }

        .dark .rich-editor-wrapper .ql-editor blockquote {
          color: #94a3b8;
        }

        .rich-editor-wrapper .ql-editor pre.ql-syntax {
          background-color: #0f172a;
          color: #e2e8f0;
          border: 1px solid #1e293b;
          border-radius: 0.5rem;
          padding: 12px 16px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.875rem;
          margin: 0.75rem 0;
        }

        .rich-editor-wrapper .ql-editor a {
          color: #6366f1;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .dark .rich-editor-wrapper .ql-editor a {
          color: #818cf8;
        }

        .rich-editor-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem auto;
          display: block;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};
