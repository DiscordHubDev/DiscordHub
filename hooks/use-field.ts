import { useWatch, UseFormReturn, Path, FieldValues } from 'react-hook-form';
import { useEffect } from 'react';

export function usePersistedFormField<T extends FieldValues>(
  key: string,
  fieldName: Path<T>,
  form: UseFormReturn<T>,
) {
  const value = useWatch({ control: form.control, name: fieldName });

  // 只在有值時寫入
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      localStorage.setItem(key, value);
    }
  }, [key, value]);

  // 掛載時還原草稿（確保 form 存在）
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      form.setValue(fieldName, saved as any);
    }
  }, [form, key, fieldName]);
}
