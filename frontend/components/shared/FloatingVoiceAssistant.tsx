"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  LuSparkles, LuUser, LuSend, LuMic, LuMicOff,
  LuImage, LuCheck, LuX, LuTrash2,
  LuArrowRight, LuVolume2, LuVolumeX,
  LuMaximize2, LuMinimize2, LuGripHorizontal
} from "react-icons/lu";
import ChatbotIcon from "@/components/shared/ChatbotIcon";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { CLIENT_BACKEND_URL } from "@/lib/backend-url";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const API_BASE = CLIENT_BACKEND_URL;

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  type?: string;
  title?: string;
  uiContent?: any;
  imagePreview?: string;
  audioBlobUrl?: string;
  voiceReplyText?: string;
}

const SUGGESTIONS = [
  { text: "📦 Bhai, low stock dikhao", query: "Show low stock items" },
  { text: "📊 Iss mahine ka hisaab-kitab", query: "Revenue summary this month" },
  { text: "🛒 Naye orders dikhana", query: "Show recent orders" },
  { text: "🔄 Kya maal mangwana hai?", query: "Restock suggestions" },
];

export default function FloatingVoiceAssistant() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const recorderOptions = typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? { mimeType: "audio/webm;codecs=opus" }
    : undefined;

  const role = ((session?.user as any)?.role || "worker").toLowerCase();
  const userName = (session?.user as any)?.name || "Admin";

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (muted || typeof window === "undefined") return;
    const cleanText = text.replace(/[*#`₹]/g, "").trim();
    if (!cleanText) return;

    try {
      stopAudio();
      const response = await fetch(`${API_BASE}/api/voice/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          source: "floating_chat",
          role: "admin",
          caller: "web_user",
          language_hint: navigator.language || "en-IN",
          user_name: userName,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
      }
    } catch (err) {
      console.error("TTS playback failed", err);
    }
  }, [muted, userName, stopAudio]);

  const send = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text && !selectedImage) return;

    setInput("");
    const userMsgId = Math.random().toString();
    const newMsg: Msg = {
      id: userMsgId,
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      imagePreview: imagePreview || undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    setSelectedImage(null);
    setImagePreview(null);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content || ""
      }));

      let responseData;

      if (selectedImage) {
        const formData = new FormData();
        formData.append("query", text);
        formData.append("history", JSON.stringify(historyPayload));
        formData.append("file", selectedImage);
        formData.append("user_phone", (session?.user as any)?.phone || "");

        const token = localStorage.getItem("stash_token");
        const res = await fetch(`${API_BASE}/api/chat/multimodal`, {
          method: "POST",
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
          body: formData,
        });

        if (!res.ok) throw new Error("Server error");
        responseData = await res.json();
      } else {
        const token = localStorage.getItem("stash_token");
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: text,
            history: historyPayload,
            user_phone: (session?.user as any)?.phone || "",
          }),
        });

        if (!res.ok) throw new Error("Server error");
        responseData = await res.json();
      }

      const botMsg: Msg = {
        id: responseData.id || Math.random().toString(),
        role: "assistant",
        content: responseData.content?.markdown || responseData.voice_reply || "Processed successfully",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: responseData.type,
        title: responseData.title,
        uiContent: responseData.content,
        voiceReplyText: responseData.voice_reply,
      };

      setMessages(prev => [...prev, botMsg]);
      if (responseData.voice_reply) {
        speak(responseData.voice_reply);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: "⚠️ Sorry, I could not process that request. Please check your connection.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        if (!isOpen) setIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleMic = () => {
    if (listening) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
      setListening(false);
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        if (!isOpen) setIsOpen(true);
        const mediaRecorder = recorderOptions
          ? new MediaRecorder(stream, recorderOptions)
          : new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const mimeType = mediaRecorder.mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          await processVoice(audioBlob, mimeType);
        };

        mediaRecorder.start();
        setListening(true);
      })
      .catch(err => {
        console.error("Microphone access denied:", err);
        alert("Microphone permission is required for voice input");
      });
  };

  const processVoice = async (audioBlob: Blob, mimeType: string) => {
    setLoading(true);
    const formData = new FormData();
    const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
    formData.append("audio", audioBlob, `voice_input.${ext}`);
    formData.append("history", JSON.stringify(messages.map(m => ({ role: m.role, content: m.content }))));
    formData.append("language_hint", navigator.language || "en-IN");

    try {
      const token = localStorage.getItem("stash_token");
      const res = await fetch(`${API_BASE}/api/chat/voice`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error("Voice process error");
      const data = await res.json();
      
      if (data.transcript) {
        const userMsg: Msg = {
          id: Math.random().toString(),
          role: "user",
          content: data.transcript,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          audioBlobUrl: URL.createObjectURL(audioBlob),
        };
        setMessages(prev => [...prev, userMsg]);
      }

      if (data.response) {
        const botMsg: Msg = {
          id: data.response.id || Math.random().toString(),
          role: "assistant",
          content: data.response.content?.markdown || data.response.voice_reply || "Processed successfully",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: data.response.type,
          title: data.response.title,
          uiContent: data.response.content,
          voiceReplyText: data.response.voice_reply,
        };
        setMessages(prev => [...prev, botMsg]);
        if (data.response.voice_reply) {
          speak(data.response.voice_reply);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to transcribe or process voice.");
    } finally {
      setLoading(false);
    }
  };

  // Only show for admin/owner
  if (role !== "admin" && role !== "owner") {
    return null;
  }

  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            ref={chatContainerRef}
            style={{
              width: isExpanded ? "800px" : "420px",
              height: isExpanded ? "80vh" : "600px",
              maxHeight: "calc(100vh - 100px)",
              maxWidth: "calc(100vw - 32px)",
              backgroundColor: "white",
              borderRadius: "1.25rem",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              border: "1px solid var(--color-divider)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", background: "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-400) 100%)", color: "white", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <LuSparkles size={18} />
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Stash AI</h3>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setMuted(!muted)}
                  style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem", opacity: 0.8 }}
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <LuVolumeX size={16} /> : <LuVolume2 size={16} />}
                </button>
                <button
                  onClick={() => setMessages([])}
                  style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem", opacity: 0.8 }}
                  title="Clear Chat"
                >
                  <LuTrash2 size={16} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem", opacity: 0.8 }}
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <LuMinimize2 size={16} /> : <LuMaximize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem", opacity: 0.8 }}
                  title="Close"
                >
                  <LuX size={18} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem", backgroundColor: "#f9fafb" }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: "linear-gradient(135deg, var(--color-brand-100), var(--color-brand-200))", marginBottom: "1rem" }}>
                    <LuSparkles size={28} color="var(--color-brand-600)" />
                  </div>
                  <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 700, background: "linear-gradient(90deg, var(--color-brand-700), var(--color-brand-500))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Namaste Seth {userName} ji
                  </h2>
                  <p style={{ margin: "0 0 1.5rem", fontSize: "0.875rem", color: "var(--color-muted)" }}>
                    Aaj godown ka kya hisaab-kitab hai boss?
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                    {SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => send(s.query)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--color-divider)", background: "white", cursor: "pointer", textAlign: "left", fontSize: "0.875rem", color: "var(--color-brand-800)", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-brand-500)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-divider)"; }}
                      >
                        {s.text} <LuArrowRight size={14} color="var(--color-brand-500)" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {messages.map((m) => (
                    <div key={m.id} style={{ display: "flex", gap: "0.75rem", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "50%", flexShrink: 0, background: m.role === "user" ? "var(--color-brand-100)" : "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))", color: m.role === "user" ? "var(--color-brand-800)" : "white" }}>
                        {m.role === "user" ? <LuUser size={14} /> : <ChatbotIcon size={14} />}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", maxWidth: "85%", gap: "0.25rem" }}>
                        {m.imagePreview && (
                          <img src={m.imagePreview} alt="Upload" style={{ maxWidth: "100%", borderRadius: "0.5rem", marginBottom: "0.5rem", border: "1px solid var(--color-divider)" }} />
                        )}

                        <div style={{ background: m.role === "user" ? "var(--color-brand-50)" : "white", padding: "0.625rem 0.875rem", borderRadius: "0.75rem", border: m.role === "user" ? "1px solid var(--color-brand-100)" : "1px solid var(--color-divider)", fontSize: "0.875rem", color: "var(--color-text)", lineHeight: "1.5", whiteSpace: "pre-wrap", boxShadow: m.role === "user" ? "none" : "0 1px 2px rgba(0,0,0,0.05)", position: "relative" }}>
                          {m.role === "user" ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div>{m.content}</div>
                              {m.audioBlobUrl && (
                                <button onClick={() => { const a = new Audio(m.audioBlobUrl); a.play(); }} style={{ background: "var(--color-brand-200)", border: "none", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-brand-800)", flexShrink: 0 }} title="Play Voice Input">
                                  <LuVolume2 size={12} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                {m.title && <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--color-brand-800)" }}>{m.title}</h3>}
                                {m.voiceReplyText && (
                                  <button onClick={() => speak(m.voiceReplyText!)} style={{ background: "transparent", border: "1px solid var(--color-divider)", borderRadius: "4px", padding: "2px 6px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", color: "var(--color-muted)", fontSize: "0.7rem", transition: "all 0.2s" }} title="Replay Response">
                                    <LuVolume2 size={12} /> Play
                                  </button>
                                )}
                              </div>
                              {m.content && <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />}
                              {m.uiContent && (
                                <GenerativeUI 
                                  type={m.type} 
                                  data={m.uiContent} 
                                  onApprove={async (action, items) => {
                                    setLoading(true);
                                    try {
                                      const token = localStorage.getItem("stash_token");
                                      const res = await fetch(`${API_BASE}/api/chat/commit`, {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                                        },
                                        body: JSON.stringify({ action, items }),
                                      });
                                      if (!res.ok) throw new Error("Failed to commit");
                                      const data = await res.json();
                                      const successMsg: Msg = {
                                        id: Math.random().toString(),
                                        role: "assistant",
                                        content: data.content?.markdown || data.voice_reply || "Operation successful.",
                                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                        type: data.type,
                                        title: data.title,
                                        uiContent: data.content,
                                      };
                                      setMessages(prev => [...prev, successMsg]);
                                    } catch (e) {
                                      console.error("Approval error", e);
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: "0.65rem", color: "var(--color-muted)", alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}>{m.time}</span>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "50%", background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))", color: "white" }}>
                        <ChatbotIcon size={14} />
                      </div>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center", height: "2rem" }}>
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-brand-600)" }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div style={{ padding: "1rem", background: "white", borderTop: "1px solid var(--color-divider)", flexShrink: 0 }}>
              {imagePreview && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--color-brand-50)", padding: "0.375rem 0.5rem", borderRadius: "0.5rem", marginBottom: "0.5rem", width: "fit-content" }}>
                  <img src={imagePreview} alt="Upload thumb" style={{ height: "30px", width: "30px", objectFit: "cover", borderRadius: "0.25rem" }} />
                  <button onClick={removeImage} style={{ background: "transparent", border: "none", color: "var(--color-danger-500)", cursor: "pointer", display: "flex", alignItems: "center" }}><LuX size={14} /></button>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "#f1f3f4", borderRadius: "1.5rem", padding: "0.375rem 0.5rem 0.375rem 1rem", border: "1px solid transparent", transition: "all 0.2s" }} onFocusCapture={e => e.currentTarget.style.borderColor = "var(--color-brand-500)"} onBlurCapture={e => e.currentTarget.style.borderColor = "transparent"}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  style={{ background: "transparent", border: "none", color: "var(--color-muted)", cursor: "pointer", padding: "0.25rem", display: "flex", alignItems: "center" }}
                  title="Upload Image"
                >
                  <LuImage size={18} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: "none" }} />

                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder={listening ? "Sun raha hoon bhai..." : "Bolo bhai, kya check karna hai..."}
                  disabled={loading || listening}
                  style={{ flex: 1, border: "none", background: "transparent", outline: "none", padding: "0.25rem 0", fontSize: "0.875rem" }}
                />

                <button
                  onClick={toggleMic}
                  disabled={loading}
                  style={{ background: "transparent", border: "none", color: listening ? "var(--color-danger-500)" : "var(--color-muted)", cursor: "pointer", padding: "0.25rem", display: "flex", alignItems: "center", animation: listening ? "pulse 1s infinite" : "none" }}
                  title={listening ? "Stop Recording" : "Speak to AI"}
                >
                  {listening ? <LuMicOff size={18} /> : <LuMic size={18} />}
                </button>

                <button
                  onClick={() => send()}
                  disabled={loading || (!input.trim() && !selectedImage)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "50%", border: "none", background: (input.trim() || selectedImage) ? "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))" : "transparent", color: (input.trim() || selectedImage) ? "white" : "var(--color-muted)", cursor: (input.trim() || selectedImage) ? "pointer" : "default", transition: "all 0.2s" }}
                >
                  <LuSend size={14} />
                </button>
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", width: "3.5rem", height: "3.5rem", borderRadius: "50%",
          background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))", color: "white", border: "none", cursor: "pointer",
          boxShadow: "0 8px 24px rgba(107, 66, 38, 0.4)", zIndex: 10000
        }}
      >
        {isOpen ? <LuX size={24} /> : <LuSparkles size={24} />}
      </motion.button>
    </div>
  );
}

// Sub-component for Generative UI elements
function GenerativeUI({ type, data, onApprove }: { type?: string; data: any; onApprove?: (action: string, items: any[]) => void }) {
  const [approvedItems, setApprovedItems] = useState<Record<string, boolean>>({});

  if (!type || !data) return null;

  switch (type) {
    case "list":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", background: "white", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--color-divider)", marginTop: "0.5rem" }}>
          {data.items?.map((item: any, i: number) => {
            const badgeColors =
              item.badge === "error" ? { bg: "#fef2f2", color: "#ef4444" } :
              item.badge === "warn" ? { bg: "#fffbeb", color: "#f59e0b" } :
              item.badge === "info" ? { bg: "#eff6ff", color: "#3b82f6" } :
              { bg: "#f0fdf4", color: "#22c55e" };

            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.375rem", borderBottom: i < data.items.length - 1 ? "1px solid #f1f3f4" : "none" }}>
                <div style={{ maxWidth: "65%" }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8rem", color: "var(--color-brand-800)" }}>{item.label}</p>
                  {item.subtitle && <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--color-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.subtitle}</p>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{item.value}</span>
                  {item.badge && (
                    <span style={{ padding: "0.1rem 0.4rem", borderRadius: "9999px", fontSize: "0.6rem", fontWeight: 700, backgroundColor: badgeColors.bg, color: badgeColors.color }}>
                      {item.badge.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );

    case "table":
      return (
        <div style={{ overflowX: "auto", background: "white", borderRadius: "0.5rem", border: "1px solid var(--color-divider)", marginTop: "0.5rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "1px solid var(--color-divider)" }}>
                {data.headers?.map((h: string, i: number) => (
                  <th key={i} style={{ padding: "0.5rem", fontWeight: 700, color: "var(--color-brand-800)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows?.map((row: any[], i: number) => (
                <tr key={i} style={{ borderBottom: i < data.rows.length - 1 ? "1px solid #f1f3f4" : "none" }}>
                  {row.map((cell: any, j: number) => (
                    <td key={j} style={{ padding: "0.5rem" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "card":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.5rem", marginTop: "0.5rem" }}>
          {data.items?.map((card: any, i: number) => (
            <div key={i} style={{ background: "white", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-divider)" }}>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--color-muted)" }}>{card.title}</p>
              <h4 style={{ margin: "0.25rem 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-brand-800)" }}>{card.value}</h4>
              {card.trend && <span style={{ fontSize: "0.65rem", color: card.trend.includes("-") ? "#ef4444" : "#10b981", fontWeight: 600 }}>{card.trend}</span>}
            </div>
          ))}
        </div>
      );

    case "chart":
      const chartData = data.labels?.map((label: string, idx: number) => {
        const item: any = { name: label };
        data.datasets?.forEach((dataset: any) => {
          item[dataset.label] = dataset.values[idx];
        });
        return item;
      }) || [];

      return (
        <div style={{ background: "white", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-divider)", marginTop: "0.5rem" }}>
          <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-brand-800)" }}>{data.chart_title || "Analytics Chart"}</h4>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              {data.chart_type === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#888" fontSize={9} />
                  <YAxis stroke="#888" fontSize={9} />
                  <Tooltip />
                  {data.datasets?.map((ds: any, i: number) => (
                    <Bar key={i} dataKey={ds.label} fill={ds.color || "var(--color-brand-500)"} radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              ) : (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#888" fontSize={9} />
                  <YAxis stroke="#888" fontSize={9} />
                  <Tooltip />
                  {data.datasets?.map((ds: any, i: number) => (
                    <Area key={i} type="monotone" dataKey={ds.label} stroke={ds.color || "var(--color-brand-500)"} fill={ds.color || "var(--color-brand-500)"} fillOpacity={0.1} />
                  ))}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      );

    case "approval":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
          {data.items?.map((item: any, i: number) => {
            const itemId = item.id || i;
            return (
              <div key={i} style={{ background: "white", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "var(--color-brand-800)" }}>{item.name}</p>
                  <p style={{ margin: "0.1rem 0 0", fontSize: "0.7rem", color: "var(--color-muted)" }}>Qty: {item.qty} {item.unit} · Cost: ₹{item.cost?.toLocaleString("en-IN") || 0}</p>
                </div>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  {approvedItems[itemId] === true ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "#10b981", fontSize: "0.75rem", fontWeight: 700 }}>
                      <LuCheck size={14} /> Approved
                    </span>
                  ) : approvedItems[itemId] === false ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>
                      <LuX size={14} /> Declined
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setApprovedItems(prev => ({ ...prev, [itemId]: true }));
                          if (onApprove) onApprove(data.action || "add_inventory", [item]);
                        }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "0.375rem", border: "none", backgroundColor: "var(--color-brand-600)", color: "white", cursor: "pointer" }}
                        title="Approve"
                      >
                        <LuCheck size={14} />
                      </button>
                      <button
                        onClick={() => setApprovedItems(prev => ({ ...prev, [itemId]: false }))}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "0.375rem", border: "1px solid var(--color-danger-500)", backgroundColor: "white", color: "var(--color-danger-500)", cursor: "pointer" }}
                        title="Decline"
                      >
                        <LuX size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );

    case "mixed":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
          {data.sections?.map((sect: any, i: number) => (
            <GenerativeUI key={i} type={sect.type} data={sect} />
          ))}
        </div>
      );

    default:
      return null;
  }
}
