// components/form/CommandListField.tsx
'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

export const CommandListField = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'commands',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">指令列表</h2>
      <p className="text-sm text-gray-400">
        添加您機器人的主要指令，幫助用戶了解如何使用
      </p>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="bg-[#36393f] rounded-lg p-4 border border-[#1e1f22] space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`commands.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>指令名稱</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：help" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`commands.${index}.category`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分類（可選）</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：管理、音樂" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name={`commands.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Input placeholder="描述這個指令的功能" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`commands.${index}.usage`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>用法</FormLabel>
                <FormControl>
                  <Input placeholder="例如：!help [指令選項]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
            >
              <Trash2 size={16} className="mr-1" />
              移除指令
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={() =>
          append({
            name: '',
            description: '',
            usage: '',
            category: '',
          })
        }
        className="bg-[#5865f2] hover:bg-[#4752c4] w-full text-white"
      >
        <Plus size={16} className="mr-2" />
        添加指令
      </Button>

      {/* 顯示整體 commands 錯誤訊息（例如未填） */}
      <FormField
        control={control}
        name="commands"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
