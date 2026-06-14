"use client";
import CTASection from "@/components/marketing/CTASection";
import { motion } from "framer-motion";
import { LuMic as Mic, LuBrain as Brain, LuUsers as Users, LuReceipt as Receipt, LuMessageSquare as MessageSquare, LuGlobe as Globe, LuZap as Zap } from 'react-icons/lu';

const features = [
  {
    id: "ai-stock",
    icon: <Brain />,
    title: "AI Stock Intelligence",
    desc: "Predict demand 14 days ahead and optimize reordering using advanced ML models. Never run out of fast-moving goods.",
    accent: "var(--color-brand-600)",
    bg: "rgba(107, 66, 38, 0.05)",
  },
  {
    id: "voice-first",
    icon: <Mic />,
    title: "Voice-First Operations",
    desc: "Manage everything using simple multilingual voice commands. Speak naturally, and Stash handles the rest.",
    accent: "#4285F4",
    bg: "rgba(66, 133, 244, 0.05)",
  },
  {
    id: "supplier",
    icon: <Users />,
    title: "Supplier Automation",
    desc: "Automatically coordinate with primary and backup suppliers.",
    accent: "var(--color-warning)",
    bg: "rgba(242, 153, 0, 0.05)",
  },
  {
    id: "smart-billing",
    icon: <Receipt />,
    title: "Smart Billing",
    desc: "Auto-generate GST invoices and track buyer credit with automated WhatsApp & Telegram reminders.",
    accent: "var(--color-success)",
    bg: "rgba(16, 133, 72, 0.05)",
  },
  {
    id: "language",
    icon: <Globe />,
    title: "22 Language Support",
    desc: "Interface and voice processing in all major Indian languages for total accessibility and zero learning curve.",
    accent: "var(--color-brand-500)",
    bg: "rgba(139, 94, 60, 0.05)",
  },
  {
    id: "negotiation",
    icon: <MessageSquare />,
    title: "AI Negotiation",
    desc: "Smart 4-tier price negotiation strategies that maintain your margins automatically with suppliers.",
    accent: "var(--color-brand-700)",
    bg: "rgba(84, 52, 30, 0.05)",
  }
];

export default function FeaturesPage() {
  return (
    <main style={{ backgroundColor: 'var(--color-brand-50)', minHeight: '100vh', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .bento-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .bento-item-ai-stock { grid-column: span 2; }
          .bento-item-negotiation { grid-column: span 2; }
        }
        @media (min-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .bento-item-ai-stock { grid-column: span 2; }
          .bento-item-voice-first { grid-column: span 1; }
          .bento-item-supplier { grid-column: span 1; }
          .bento-item-smart-billing { grid-column: span 1; }
          .bento-item-language { grid-column: span 1; }
          .bento-item-negotiation { grid-column: span 3; }
        }
        .bento-card {
          background-color: #ffffff;
          border-radius: 24px;
          padding: 2.5rem;
          border: 1px solid var(--color-divider);
          box-shadow: var(--shadow-card);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: all 0.3s ease;
          height: 100%;
        }
        .bento-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        }
        .bento-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
      `}} />

      {/* Dynamic Hero Header */}
      <section style={{ paddingTop: '10rem', paddingBottom: '6rem', position: 'relative' }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(107,66,38,0.15) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(66,133,244,0.1) 0%, transparent 70%)', filter: 'blur(50px)', borderRadius: '50%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#ffffff', borderRadius: '999px', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}
            >
              <Zap size={16} color="var(--color-brand-500)" />
              <span style={{ color: 'var(--color-brand-700)', fontWeight: 600, fontSize: '0.875rem' }}>Next-Gen Capabilities</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-brand-900)', marginTop: '1rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}
            >
              Everything you need to <br/>
              <span className="text-gradient" style={{ background: 'linear-gradient(135deg, var(--color-brand-600) 0%, #4285F4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>digitize your operations.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: '1.25rem', color: 'var(--color-muted)', marginTop: '1.5rem', lineHeight: 1.6 }}
            >
              Stash combines Gemini AI with enterprise supply chain logic to create a platform that requires absolutely zero training. Just speak, and it works.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Bento Grid Showcase */}
      <section style={{ padding: '0 0 8rem 0', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="bento-grid">
            {features.map((f, i) => (
              <motion.div 
                key={f.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`bento-card glass bento-item-${f.id}`}
              >
                 <div className="bento-icon-box" style={{ backgroundColor: f.bg, color: f.accent }}>
                   {f.icon}
                 </div>
                 <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
                   <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand-900)', marginBottom: '0.75rem' }}>{f.title}</h3>
                   <p style={{ color: 'var(--color-muted)', lineHeight: 1.6, fontSize: '1rem' }}>{f.desc}</p>
                 </div>
                 
                 {/* Decorative element */}
                 <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.03, transform: 'scale(5)', pointerEvents: 'none', zIndex: 1 }}>
                   {f.icon}
                 </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
