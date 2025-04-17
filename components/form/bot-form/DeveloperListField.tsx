'use client';

import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const DeveloperListField = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'developers',
  });

  console.log('fields:', fields);

  const [inputValue, setInputValue] = useState('');

  const devs = useWatch({ name: 'developers' });
  console.log('🧪 developers:', devs);

  const handleAddDeveloper = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      append({ name: trimmed });
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-4">
      <FormLabel
        className={cn(
          'text-base',
          errors.developers?.message && 'text-destructive',
        )}
      >
        開發者列表 *
      </FormLabel>

      {/* 顯示已新增的開發者 */}
      {fields.map((field, index) => (
        <FormField
          key={field.id}
          control={control}
          name={`developers.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Input
                    placeholder="開發者 ID"
                    {...field}
                    className="bg-[#36393f] border-[#1e1f22] text-white flex-1"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemove(index)}
                  className="p-2 h-10 w-10 flex items-center justify-center"
                >
                  <Trash />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      {/* 新增欄位 */}
      <div className="flex items-center space-x-2 pt-2">
        <Input
          placeholder="輸入開發者 ID"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddDeveloper();
            }
          }}
          className="bg-[#36393f] border-[#1e1f22] text-white flex-1"
        />
        <Button type="button" className="discord" onClick={handleAddDeveloper}>
          新增
        </Button>
      </div>
      {fields.length === 0 && errors.developers?.message && (
        <p className="text-sm text-destructive">
          {errors.developers.message as string}
        </p>
      )}
    </div>
  );
};
