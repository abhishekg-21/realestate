// src/app/dashboard/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Notification = {
    id: string;
    title: string;
    body: string;
    target_role: string;
    sent_by: string | null;
    created_at: string;
};

export default function UserNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [read, setRead] = useState<Set<string>>(() => {
        // Persist read state in localStorage
        if (typeof window === "undefined") return new Set();
        try {
            const stored = localStorage.getItem("pn_read_notifications");
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });

    const markRead = (id: string) => {
        setRead((prev) => {
            const next = new Set(prev);
            next.add(id);
            try {
                localStorage.setItem("pn_read_notifications", JSON.stringify([...next]));
            } catch { }
            return next;
        });
    };

    const markAllRead = () => {
        const allIds = notifications.map((n) => n.id);
        setRead((prev) => {
            const next = new Set([...prev, ...allIds]);
            try {
                localStorage.setItem("pn_read_notifications", JSON.stringify([...next]));
            } catch { }
            return next;
        });
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data, error } = await supabase
                .from("admin_notifications")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error) setNotifications(data ?? []);
            setLoading(false);
        };
        load();
    }, []);

    const unreadCount = notifications.filter((n) => !read.has(n.id)).length;

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="p-6 sm:p-8 max-w-[780px] w-full mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[26px] sm:text-[30px] font-bold text-[#111827] flex items-center gap-2">
                        🔔 Notifications
                        {unreadCount > 0 && (
                            <span className="text-[13px] font-bold bg-[#d49a38] text-white px-2.5 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-[13px] text-[#6b7280] mt-1">
                        Platform announcements and updates from PropertiesNexus.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="shrink-0 text-[12px] font-bold text-[#d49a38] hover:underline mt-1"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm overflow-hidden">
                {loading ? (
                    <div className="px-6 py-12 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-[#d49a38] border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-[13px] text-[#9ca3af]">Loading notifications…</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-[14px] font-semibold text-[#374151]">No notifications yet</p>
                        <p className="text-[12px] text-[#9ca3af] mt-1">
                            Platform announcements will appear here.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-[#f3f4f6]">
                        {notifications.map((n) => {
                            const isUnread = !read.has(n.id);
                            return (
                                <li
                                    key={n.id}
                                    onClick={() => markRead(n.id)}
                                    className={`px-5 sm:px-6 py-4 sm:py-5 cursor-pointer transition-colors hover:bg-[#fafafa] ${isUnread ? "bg-[#fffbf2]" : "bg-white"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Unread dot */}
                                        <div className="mt-[6px] shrink-0">
                                            {isUnread ? (
                                                <span className="block h-2 w-2 rounded-full bg-[#d49a38]" />
                                            ) : (
                                                <span className="block h-2 w-2 rounded-full bg-transparent" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                                <p
                                                    className={`text-[14px] leading-snug ${isUnread
                                                            ? "font-bold text-[#111827]"
                                                            : "font-semibold text-[#374151]"
                                                        }`}
                                                >
                                                    {n.title}
                                                </p>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize whitespace-nowrap">
                                                        {n.target_role === "all" ? "🌐 Everyone" : n.target_role}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-[13px] text-[#6b7280] leading-relaxed mt-1">
                                                {n.body}
                                            </p>

                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <span className="text-[11px] text-[#9ca3af]">
                                                    {formatDate(n.created_at)}
                                                </span>
                                                {n.sent_by && (
                                                    <>
                                                        <span className="text-[#d1d5db]">·</span>
                                                        <span className="text-[11px] text-[#9ca3af]">
                                                            by {n.sent_by}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}