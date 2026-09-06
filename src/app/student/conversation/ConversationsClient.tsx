'use client'

import React, { useState, useRef, useEffect } from "react";
import { Send, GraduationCap } from "lucide-react";

interface Message {
  id: number | string;
  sender: "admin" | "student" | "update";
  text: string;
  time: string;
}

const DEFAULT_MESSAGES: Message[] = [
  { id: 1, sender: "admin", text: "Welcome to your profile updates!", time: "10:00 AM" },
  { id: 2, sender: "student", text: "Thank you sir 🙏", time: "10:02 AM" },
  { id: 3, sender: "update", text: "Your course registration has been approved 🎉", time: "10:05 AM" },
];

export default function ConversationsClient() {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "student", text: newMsg.trim(), time: currentTime },
    ]);
    setNewMsg("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-white overflow-hidden">
      {/* Header — Full Width */}
      <div className="px-6 py-4 flex items-center gap-3 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xs shrink-0">
        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-xs">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Conversation</h2>
          <p className="text-xs text-blue-100 font-normal">Student & Advisor Communication Desk</p>
        </div>
      </div>

      {/* Chat Area — Full Width & Height with auto-scroll */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6 bg-slate-50/60 scrollbar-thin">
        {messages.map((msg) => {
          if (msg.sender === "update") {
            return (
              <div key={msg.id} className="flex flex-col items-center my-3">
                <div className="bg-linear-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-200/90 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold shadow-xs">
                  {msg.text}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 italic">{msg.time}</span>
              </div>
            );
          }

          const isStudent = msg.sender === "student";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isStudent ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] md:max-w-[55%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isStudent
                    ? "bg-blue-600 text-white rounded-br-xs font-medium"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs font-medium"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 px-1 italic">{msg.time}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — Full Width Bottom Bar */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3 w-full">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-2xl px-5 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-400 shadow-2xs"
          />
          <button
            type="button"
            onClick={handleSend}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl shadow-sm transition-all flex items-center gap-2 font-semibold text-xs sm:text-sm cursor-pointer shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
