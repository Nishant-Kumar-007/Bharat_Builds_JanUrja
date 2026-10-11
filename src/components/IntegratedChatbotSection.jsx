import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Check,
  CheckCircle2,
  RefreshCw,
  User,
  Zap,
  HelpCircle
} from 'lucide-react';
import { JANURJA_FAQ_KNOWLEDGE_BASE } from './Chatbot';
import { useApp } from '../context/AppContext';

export default function IntegratedChatbotSection() {
  const { offers, getActiveUserNode } = useApp();
  const activeNode = getActiveUserNode();

  // Preset suggested prompts matching Image 3 workflow
  const SUGGESTED_PROMPTS = [
    { text: "What is today's solar surplus in Hebbal?", query: 'solar surplus' },
    { text: 'Explain how autonomous dynamic pricing works.', query: 'agentic pricing' },
    { text: 'How do I charge my EV using clean community power?', query: 'ev charging' },
    { text: 'What are the BESCOM wheeling charges?', query: 'wheeling fee' },
  ];

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hello! I am **JanUrja's Autonomous Energy Agent**. I monitor real-time solar generation, 11kV feeder lines, and autonomous Beckn microgrid smart contracts. How can I assist your energy trading today?",
      time: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Answer matching using knowledge base & live telemetry
  const findAnswer = (query) => {
    const qLower = query.toLowerCase();

    // 1. Live telemetry queries
    if (qLower.includes('surplus') || qLower.includes('hebbal') || qLower.includes('generation')) {
      return `☀️ **Live Hebbal Solar Telemetry:**\n• Current PV Generation: **32.50 kWh**\n• Self-Consumption: **28.00 kWh**\n• Verified Surplus: **+4.50 kWh** available for immediate P2P transfer!\n• Cleared Unit Price: **₹5.80/kWh** (Undercuts BESCOM grid by 25%).`;
    }

    if (qLower.includes('ev') || qLower.includes('charger') || qLower.includes('koramangala')) {
      return `🚗 **EV Fast Charge Node (NODE-3045):**\n• Located in Koramangala (S3-South).\n• Current Deficit: **8.20 kWh**.\n• Matched with Hebbal Solar Park over 11kV Koramangala distribution feeder.\n• Estimated session cost: ₹47.56 via atomic UPI AutoPay.`;
    }

    // 2. Knowledge base keyword matching
    for (const faq of JANURJA_FAQ_KNOWLEDGE_BASE) {
      if (faq.keywords.some((kw) => qLower.includes(kw))) {
        return faq.answer;
      }
    }

    return `⚡ **JanUrja Energy Intelligence:**\nI have logged your inquiry into our decentralized microgrid network. You can trade solar surplus at **₹5.80/unit** with automated UPI settlement and guaranteed SerC-compliant wheeling at ₹0.15/kWh. Ask me about **pricing rules**, **EV charging**, or **grid stability**!`;
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

    let botResponse = null;
    if (apiBaseUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${apiBaseUrl}/api/agent/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text, requested_kwh: 5.0, consumer_zone: 'S2-East' }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.response) {
            botResponse = data.response;
          }
        }
      } catch (err) {
        console.debug('Backend agent fetch bypassed, using local engine:', err);
      }
    }

    if (!botResponse) {
      botResponse = findAnswer(text);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsTyping(false);
  };

  return (
    <section className="relative w-full bg-[#070A08] py-16 px-4 sm:px-8 border-t border-emerald-950/60 text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* TOP ROW: Robot Showcase + Features (Matching Image 3) */}
        <div className="bg-[#0C100D]/90 backdrop-blur-2xl rounded-[36px] border border-emerald-900/40 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Left Text & Feature Checklist (Image 3 Style) */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8FF24] animate-pulse"></span>
                <span className="text-xs font-mono uppercase tracking-widest text-[#B8FF24] font-bold">
                  24/7 Autonomous Energy Agent
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                AI Chatbot integration
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-lg leading-relaxed">
                Better conversations. Less busywork. Connect your household with clean solar intelligence around the clock.
              </p>
            </div>

            {/* Feature Checklist with Neon Lime Checkmarks (Image 3 Style) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-sm sm:text-base text-slate-200">
                <div className="w-6 h-6 rounded-full bg-[#B8FF24]/20 border border-[#B8FF24]/50 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[#B8FF24] stroke-[3]" />
                </div>
                <span>Boost Efficiency & Eliminate Peak Utility Tariffs</span>
              </div>

              <div className="flex items-center space-x-3 text-sm sm:text-base text-slate-200">
                <div className="w-6 h-6 rounded-full bg-[#B8FF24]/20 border border-[#B8FF24]/50 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[#B8FF24] stroke-[3]" />
                </div>
                <span>24/7 Feeder Congestion & Duck Curve Mitigation</span>
              </div>

              <div className="flex items-center space-x-3 text-sm sm:text-base text-slate-200">
                <div className="w-6 h-6 rounded-full bg-[#B8FF24]/20 border border-[#B8FF24]/50 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[#B8FF24] stroke-[3]" />
                </div>
                <span>Seamless Universal Energy Interface (UEI) Integration</span>
              </div>
            </div>
          </div>

          {/* Right Image: Futuristic Robot Avatar (Image 3 Style) */}
          <div className="w-full lg:w-96 flex-shrink-0 flex justify-center">
            <div className="relative group overflow-hidden rounded-[32px] border border-emerald-500/30 bg-[#070A08] shadow-2xl p-2 max-w-[340px]">
              <img
                src="/ai-robot.jpg"
                alt="AI Energy Assistant Humanoid Robot"
                className="w-full h-80 object-cover rounded-[24px] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none rounded-[24px]"></div>
              <div className="absolute bottom-5 left-5 right-5 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#B8FF24] bg-black/80 px-3 py-1 rounded-full border border-emerald-500/40">
                  POWERED BY JANURJA AGENT
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* INTEGRATED INTERACTIVE CONVERSATIONAL TERMINAL */}
        <div className="bg-[#0C100D]/95 rounded-3xl border border-emerald-900/40 p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-950/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8FF24]/20 border border-[#B8FF24]/40 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#B8FF24]" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Live Intelligence Console</h3>
                <p className="text-xs text-slate-400 font-mono">Trained on Universal Energy Interface (UEI) standards</p>
              </div>
            </div>

            <button
              onClick={() => setMessages([messages[0]])}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#070A08] transition-all text-xs font-mono flex items-center gap-1 cursor-pointer"
              title="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.text)}
                className="text-xs font-mono bg-[#070A08] hover:bg-[#0E1510] text-slate-300 hover:text-[#B8FF24] border border-emerald-950 hover:border-[#B8FF24]/40 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                {prompt.text}
              </button>
            ))}
          </div>

          {/* Messages Thread Container */}
          <div className="max-h-[360px] min-h-[220px] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isBot
                        ? 'bg-[#B8FF24]/20 text-[#B8FF24] border border-[#B8FF24]/40'
                        : 'bg-emerald-950 text-white border border-emerald-800'
                    }`}
                  >
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-md ${
                      isBot
                        ? 'bg-[#070A08] text-slate-200 border border-emerald-950'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                    }`}
                  >
                    {msg.text}
                    <div className="mt-1 text-[10px] text-slate-500 font-mono text-right">
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-[#B8FF24] animate-ping"></span>
                <span>JanUrja Agent is computing microgrid telemetry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-3 border-t border-emerald-950/80"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask JanUrja about rooftop solar surplus, tariffs, or EV charging..."
              className="flex-1 bg-[#070A08] border border-emerald-950 focus:border-[#B8FF24] focus:ring-1 focus:ring-[#B8FF24] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white outline-none font-mono"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="bg-[#B8FF24] hover:bg-[#a5f012] disabled:opacity-50 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-[#B8FF24]/20"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
