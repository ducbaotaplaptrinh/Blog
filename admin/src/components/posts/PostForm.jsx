import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema } from '../../schemas/authSchema';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { RichTextEditor } from '../editor/RichTextEditor';
import { uploadService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { Image as ImageIcon, UploadCloud, X, RefreshCw, Link as LinkIcon, AlertCircle, Send, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const PostForm = ({ onSubmit, categories = [], loading = false, initialData = null }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(initialData?.status || 'draft');

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      content: initialData?.content || '',
      category_id: initialData?.category_id
        ? String(initialData.category_id)
        : (categories[0]?.id ? String(categories[0].id) : ''),
      thumbnail: initialData?.thumbnail || '',
    },
  });

  const thumbnailValue = watch('thumbnail');

  useEffect(() => {
    setImageError(false);
  }, [thumbnailValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        summary: initialData.summary || '',
        content: initialData.content || '',
        category_id: initialData.category_id ? String(initialData.category_id) : '',
        thumbnail: initialData.thumbnail || '',
      });
    } else {
      reset({
        title: '',
        summary: '',
        content: '',
        category_id: categories[0]?.id ? String(categories[0].id) : '',
        thumbnail: '',
      });
    }
  }, [initialData, categories, reset]);

  // Xử lý khi người dùng chọn file ảnh từ máy tính
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn một tệp hình ảnh (jpg, png, webp...)');
      return;
    }

    try {
      setUploadingImage(true);
      const url = await uploadService.uploadImage(file);
      setValue('thumbnail', url, { shouldValidate: true });
      toast.success('Tải ảnh đại diện thành công!');
    } catch (err) {
      console.warn('Lỗi upload server, sử dụng fallback Base64:', err);
      // Fallback lưu trực tiếp dưới dạng Base64 Data URL nếu server lỗi
      const reader = new FileReader();
      reader.onload = (event) => {
        setValue('thumbnail', event.target.result, { shouldValidate: true });
        toast.success('Đã tải ảnh từ máy tính!');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveThumbnail = () => {
    setValue('thumbnail', '', { shouldValidate: true });
  };

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      status: submitStatus,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {initialData?.status === 'rejected' && initialData?.rejection_reason && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm mb-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-red-200">Bài viết bị từ chối phê duyệt</h5>
            <p className="mt-1 text-xs text-red-300/90 leading-relaxed font-mono">
              "{initialData.rejection_reason}"
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Vui lòng sửa nội dung theo góp ý và nhấn <strong>"Gửi Duyệt Bài"</strong>.
            </p>
          </div>
        </div>
      )}

      <Input
        label="Tiêu đề bài viết *"
        placeholder="Nhập tiêu đề bài viết..."
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="mb-4">
        <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          Danh mục bài viết *
        </label>
        <select
          {...register('category_id')}
          className={`w-full px-3 py-2.5 bg-white dark:bg-slate-950/60 border ${
            errors.category_id ? 'border-red-500' : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500'
          } rounded-lg text-slate-900 dark:text-white text-sm outline-none transition-colors`}
        >
          <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <span className="block mt-1 text-xs text-red-500">
            {errors.category_id.message}
          </span>
        )}
      </div>

      {/* KHỐI ẢNH ĐẠI DIỆN (CHỌN TỪ MÁY / NHẬP URL) */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Ảnh đại diện (Thumbnail)
          </label>
          <button
            type="button"
            onClick={() => setUseUrlInput((prev) => !prev)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
          >
            {useUrlInput ? (
              <>
                <UploadCloud size={14} /> Chọn ảnh từ máy tính
              </>
            ) : (
              <>
                <LinkIcon size={14} /> Hoặc nhập link ảnh URL
              </>
            )}
          </button>
        </div>

        {/* Input file ẩn */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {thumbnailValue && !imageError ? (
          /* Khi đã có ảnh: Hiển thị preview và các nút thao tác */
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={thumbnailValue}
                alt="Thumbnail Preview"
                onError={() => setImageError(true)}
                className="w-16 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-700 shadow-xs"
              />
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-xs">
                  {thumbnailValue.startsWith('data:') ? 'Ảnh từ máy tính (Data URL)' : thumbnailValue}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Ảnh hợp lệ</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} className={uploadingImage ? 'animate-spin' : ''} />
                {uploadingImage ? 'Đang tải...' : 'Thay ảnh'}
              </button>
              <button
                type="button"
                onClick={handleRemoveThumbnail}
                className="p-1.5 text-xs text-red-500 hover:bg-red-500/15 rounded border border-red-500/30 cursor-pointer"
                title="Xóa ảnh"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ) : useUrlInput ? (
          /* Nhập bằng URL thủ công */
          <Input
            placeholder="https://example.com/hinh-anh.jpg"
            icon={ImageIcon}
            error={errors.thumbnail?.message}
            {...register('thumbnail')}
          />
        ) : (
          /* Khung bấm để tải ảnh từ máy tính */
          <div
            onClick={() => !uploadingImage && fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500/60 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/40 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-2">
              {uploadingImage ? (
                <RefreshCw size={20} className="animate-spin text-indigo-500 dark:text-indigo-400" />
              ) : (
                <UploadCloud size={20} />
              )}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {uploadingImage ? 'Đang tải ảnh lên hệ thống...' : 'Bấm vào đây để chọn ảnh từ máy tính'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ định dạng JPG, PNG, WEBP hoặc GIF (Tối đa 10MB)
            </p>
          </div>
        )}
      </div>

      <Input
        label="Tóm tắt ngắn"
        placeholder="Mô tả ngắn gọn về bài viết..."
        error={errors.summary?.message}
        {...register('summary')}
      />

      <div className="mb-5">
        <label className="block mb-1.5 text-sm font-medium text-slate-400">
          Nội dung bài viết (Trình soạn thảo trực quan) *
        </label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Soạn nội dung bài viết, in đậm, in nghiêng, chèn ảnh..."
            />
          )}
        />
        {errors.content && (
          <span className="block mt-1 text-xs text-red-500">
            {errors.content.message}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          type="submit"
          variant="outline"
          onClick={() => setSubmitStatus('draft')}
          disabled={loading || uploadingImage}
          className="flex-1 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Save size={16} /> Lưu Bản Nháp
        </Button>

        {user?.role === 'author' ? (
          <Button
            type="submit"
            onClick={() => setSubmitStatus('pending')}
            disabled={loading || uploadingImage}
            className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500"
          >
            <Send size={16} /> {initialData?.status === 'rejected' ? 'Gửi Duyệt Lại' : 'Gửi Duyệt Bài'}
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={() => setSubmitStatus('published')}
            disabled={loading || uploadingImage}
            className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Check size={16} /> Xuất Bản Ngay
          </Button>
        )}
      </div>
    </form>
  );
};
