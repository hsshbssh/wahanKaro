"use client";

import { RootState } from "@/redux/store";
import axios from "axios";
import { Send, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

type Messages = {
  bookingId: string;
  sender: "user" | "driver";
  text: string;
  createdAt: Date;
};

const RideChat = ({ currentRole, bookingId, username, driverName }: any) => {
  const otherName = currentRole === "user" ? driverName : username; //iska mtlb hai ki agr currentRole user hai toh other name driver ka hoga and vice versa
  const myName = currentRole === "user" ? username : driverName;

  const [messages, setMessages] = useState<Messages[]>([]);
  const [lastMessage, setLastMessage] = useState("");
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  //ek state banani hogi jiske click pe mein ai suggestions ko toggle krsku
  const [showAI, setShowAI] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const { userData } = useSelector((state: RootState) => state.user);

  const formatTime = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  //message send krne ke liye api call krdete hai pehle
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const { data } = await axios.post("/api/chat/send", {
        bookingId,
        sender: currentRole,
        text: text.trim(),
      });

      console.log("Sent Message:", data);

      const newMessage = data.message || data;

      setMessages((prev) => [...prev, newMessage]);

      setText("");
    } catch (error: any) {
      console.error(
        "Send Message Error:",
        error.response?.data || error.message,
      );
    }
  };

  //saare messages ko get krlete hai ab

  const getMessages = async () => {
    try {
      const { data } = await axios.post("/api/chat/get-all", {
        bookingId,
      });

      console.log("Fetched Messages:", data);

      setMessages(data || []);
    } catch (error: any) {
      console.error(
        "Get Messages Error:",
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    if(bookingId){
      getMessages()
    }
  }, [bookingId]);

  //ai-suggestions ki api ko bhi fetch krlete hai
 
const getAiSuggestions = async () => {
  const recentMessage = messages[messages.length - 1]?.text || "";

  if (!recentMessage) {
    console.log("No message available for AI suggestions");
    return;
  }

  setAiLoading(true);
  setShowAI(true);

  try {
    const { data } = await axios.post("/api/chat/ai-suggestions", {
      lastMessage: recentMessage,
      role: currentRole,
    });

    console.log("AI Suggestions:", data);

    setSuggestions(data.suggestions || []);
  } catch (error: any) {
    console.error(
      "AI Suggestions Error:",
      error.response?.data || error.message
    );

    setSuggestions([]);
  } finally {
    setAiLoading(false);
  }
};


  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl overflow-hidden border border-zinc-100">
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-100">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-zinc-900 leading-none">
            {otherName}
          </p>
          <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">
            Active Now
          </p>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <Send size={18} className="text-zinc-400" />
            </div>

            <p className="text-sm text-zinc-400 font-medium">No messages yet</p>

            <p className="">Start the conversation below</p>
          </div>
        )}

        {messages.length > 0 &&
          messages.map((m, i) => {
            const isMine = m.sender === currentRole;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`flex items-end gap-2 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[72%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl shadow-sm ${
                    isMine
                      ? "bg-zinc-950 text-white rounded-br-sm"
                      : "bg-white border border-zinc-200 text-zinc-900 rounded-bl-sm"
                  }`}
                >
                  <p className="break-words">{m.text}</p>
                  <span className="text-[10px] text-gray-400">{formatTime(m.createdAt)}</span>
                </div>
              </motion.div>
            );
          })}
      </div>

      {showAI && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex-shrink-0 overflow-hidden border-t border-zinc-100 bg-white"
        >
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-violet-500" />

                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  AI Suggestions
                </span>
              </div>

              <button onClick={() => setShowAI(false)}>
                <X size={14} className="text-zinc-400 hover:text-zinc-600" />
              </button>

              {aiLoading ? (
                <div className="flex flex-col gap-1.5">
                  {[1, 2, 3].map(() => (
                    <div className="h-9 bg-zinc-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {suggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setText(s);
                        setShowAI(false);
                      }}
                      className="
        text-left text-sm text-zinc-700 bg-zinc-50
        hover:bg-violet-50
        hover:text-violet-700
        border border-zinc-100
        hover:border-violet-200
        px-3 py-2 rounded-xl transition-all
      "
                    >
                      {s}
                    </motion.div>
                  ))}

                  <button onClick={()=>getAiSuggestions()} className="text-[11px] text-violet-500 hover:text-violet-700 font-semibold text-center mt-1 transition-colors">
                    Refresh Suggestions
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      <div className="flex items-center gap-2 bg-zinc-100 rounded-2xl pl-3 pr-1.5 py-1.5">
        {messages.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              getAiSuggestions();
            }}
            className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              showAI
                ? "bg-violet-600 text-white"
                : "bg-white text-violet-500 hover:bg-violet-50 border border-zinc-200"
            }`}
          >
            <Sparkles size={16} />
          </motion.button>
        )}

        <input
          type="text"
          placeholder="Message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-200 focus:outline-none py-1.5 min-w-0"
        />
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => sendMessage()}
          disabled={!text.trim()}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            text.trim()
              ? "bg-zinc-950 text-white hover:bg-zinc-800"
              : "bg-transparent text-zinc-300 cursor-not-allowed"
          }`}
        >
          <Send size={14} />
        </motion.button>
      </div>
      
    </div>
  );
};

export default RideChat;
