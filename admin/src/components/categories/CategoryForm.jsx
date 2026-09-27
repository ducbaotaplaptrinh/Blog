import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';

export const CategoryForm = ({ onSubmit, initialData = null, loading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        description: initialData.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Tên danh mục *"
        placeholder="Ví dụ: Công nghệ, Đời sống, Lập trình..."
        error={errors.name?.message}
        {...register('name', { required: 'Tên danh mục không được để trống' })}
      />

      <div className="mb-5">
        <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          Mô tả ngắn
        </label>
        <textarea
          rows={3}
          placeholder="Mô tả tóm tắt về danh mục này..."
          className="w-full px-3 py-2.5 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none transition-colors"
          {...register('description')}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? (initialData ? 'Đang cập nhật...' : 'Đang tạo danh mục...')
          : (initialData ? 'Cập Nhật Danh Mục' : 'Tạo Danh Mục')}
      </Button>
    </form>
  );
};
