// components/form/CommandListField.tsx
"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export const RulesField = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">規則</h2>
      <p className="text-sm text-gray-400">
        添加關於您伺服器的規則，幫助用戶了解如何遵守
      </p>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="bg-[#36393f] rounded-lg p-4 border border-[#1e1f22] space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`rules.${index}`}
              render={({ field }) => (
                <FormItem className="w-full space-y-2">
                  <FormLabel className="block text-sm text-white">
                    規則要點
                  </FormLabel>
                  <FormControl className="w-full">
                    {field ? (
                      <Input
                        placeholder="例如：請勿洗頻、傳送令人反感的附件等..."
                        className="w-full"
                        {...field}
                      />
                    ) : (
                      <></>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
            >
              <Trash2 size={16} className="mr-1" />
              移除規定
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={() => append("")}
        className="bg-[#5865f2] hover:bg-[#4752c4] w-full text-white"
      >
        <Plus size={16} className="mr-2" />
        添加規則
      </Button>
    </div>
  );
};
