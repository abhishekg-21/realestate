"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function BroadcastListener() {
  const [notification, setNotification] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: any;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let role = "user";
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile) role = profile.role;
      }

      channel = supabase
        .channel('public:admin_notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
          (payload) => {
            const newNotif = payload.new as { title: string; body: string; target_role: string };
            if (newNotif.target_role === "all" || newNotif.target_role === role) {
              setNotification({ title: newNotif.title, body: newNotif.body });
              // Auto hide after 8s
              setTimeout(() => {
                setNotification(null);
              }, 8000);
            }
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-white border-l-4 border-[#d49a38] shadow-2xl rounded-r-xl p-4 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-[#051426] m-0">{notification.title}</h4>
        <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600 font-bold ml-4 cursor-pointer">✕</button>
      </div>
      <p className="text-[13px] text-gray-600 m-0">{notification.body}</p>
    </div>
  );
}
