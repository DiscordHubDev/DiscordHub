"use client";

import { updateUserSettings } from "@/lib/actions/user";
import { SOCIAL_PLATFORMS } from "@/lib/socialPlatforms";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function UserSettingsForm({ user }: { user: any }) {
  const initialState = { success: undefined, error: undefined };
  const [state, formAction] = useActionState(updateUserSettings, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(state.success, {
        style: {
          background: "#1e1f22",
          color: "#fff",
        },
      });
      router.refresh();
    }

    if (state.error) {
      toast.error(state.error, {
        style: {
          background: "#1e1f22",
          color: "#fff",
        },
      });
    }
  }, [state.success, state.error]);

  const socialEntries = Object.entries(SOCIAL_PLATFORMS);
  const socialData = user.social as Record<string, string>;

  return (
    <form action={formAction}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">用戶名</label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2"></div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-300">
              個人簡介
            </label>
            <textarea
              name="bio"
              defaultValue={user.bio ?? ""}
              rows={4}
              className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-6">社交連結</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialEntries.map(([platform, config]) => (
              <div key={platform} className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  {config.name}
                </label>
                <input
                  type="text"
                  name={`social.${platform}`}
                  defaultValue={socialData?.[platform] || ""}
                  className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
            >
              保存更改
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
