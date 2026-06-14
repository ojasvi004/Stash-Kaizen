"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  FaMicrophone, 
  FaRobot, 
  FaRupeeSign, 
  FaChartLine, 
  FaMobileAlt, 
  FaNetworkWired,
  FaArrowRight,
  FaCheckCircle,
  FaGlobeAsia,
  FaUsers,
  FaBoxes,
  FaShippingFast,
  FaFileInvoiceDollar,
  FaPhoneAlt
} from "react-icons/fa";
import { FiPackage, FiTruck, FiBarChart2, FiClipboard, FiBook, FiAlertTriangle, FiCheck } from "react-icons/fi";
import { BsLightningChargeFill, BsGraphUpArrow } from "react-icons/bs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';

const FadeIn = ({ children, delay = 0, direction = "up", width = "auto", fullHeight = false }: { children: React.ReactNode, delay?: number, direction?: "up" | "left" | "right" | "down", width?: string, fullHeight?: boolean }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 }
  };

  return (
    <motion.div
      style={{ width, height: fullHeight ? '100%' : 'auto' }}
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

// Data for Charts
const timeComparisonData = [
  { name: 'Stock Entry', manual: 15, stash: 2 },
  { name: 'Order Matching', manual: 25, stash: 3 },
  { name: 'Supplier Call', manual: 10, stash: 0.5 },
  { name: 'Billing', manual: 20, stash: 1 },
];

const networkEffectsData = [
  { month: 'M1', users: 100, accuracy: 80 },
  { month: 'M3', users: 500, accuracy: 85 },
  { month: 'M6', users: 2000, accuracy: 92 },
  { month: 'M9', users: 5000, accuracy: 96 },
  { month: 'M12', users: 12000, accuracy: 99 },
];

const marketSizeData = [
  { name: 'TAM (Global Voice AI)', value: 45 },
  { name: 'SAM (India Supply Chain)', value: 12 },
  { name: 'SOM (Tier 2/3 Godowns)', value: 2.5 },
];

export default function PitchDeck() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: 'var(--color-bg-alt)', overflowX: 'hidden', color: 'var(--color-text)', fontFamily: 'var(--font-noto)' }}>
      
      {/* SECTION 1: TITLE SLIDE */}
      <section className="bg-gradient-mesh" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '5rem 1.5rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '40vw', height: '40vw', backgroundColor: 'var(--color-brand-300)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15 }}></div>
          <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30vw', height: '30vw', backgroundColor: 'var(--color-brand-500)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15 }}></div>
        </div>
        
        <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <FadeIn>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-brand-200)', marginBottom: '3rem', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-brand-500)' }}></span>
              <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-brand-700)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Team NERDS</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(4rem, 10vw, 7rem)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-brand-900)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              Stash.
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <h2 className="text-gradient" style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 600, marginBottom: '2.5rem', lineHeight: 1.3, paddingBottom: '0.5rem' }}>
              The voice-first intelligence layer<br/>for India's supply chain.
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.6}>
            <p style={{ fontFamily: 'var(--font-noto)', fontSize: 'clamp(1.125rem, 2vw, 1.375rem)', color: 'var(--color-muted)', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.6, fontWeight: 400 }}>
              Seamlessly integrating inventory, orders, supplier coordination, billing, and delivery through multilingual conversational AI.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 1.5: AUTOMATION HERO */}
      <section className="bg-gradient-mesh" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '8rem 1.5rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '40vw', height: '40vw', backgroundColor: 'var(--color-brand-300)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15 }}></div>
          <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30vw', height: '30vw', backgroundColor: 'var(--color-brand-500)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15 }}></div>
        </div>
        
        <div className="container" style={{ maxWidth: '72rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <FadeIn>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-brand-200)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                  <motion.span animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></motion.span>
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-brand-700)', fontSize: '0.875rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    Made for Indian Businesses
                  </span>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-brand-900)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                  Your godown, <br />
                  now <span className="text-gradient" style={{ background: 'linear-gradient(135deg, var(--color-brand-400), var(--color-brand-700))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>100% automated</span>
                </h1>
              </FadeIn>
              
              <FadeIn delay={0.4}>
                <p style={{ fontFamily: 'var(--font-noto)', fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', color: 'var(--color-muted)', marginBottom: '2.5rem', lineHeight: 1.6, fontWeight: 400 }}>
                  Stash is an AI voice assistant that handles your stock, orders, and customers — <strong>without complicated software</strong>. Just call, and the work is done.
                </p>
              </FadeIn>

              <FadeIn delay={0.6}>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-900)' }}>98%</span>
                    <span style={{ fontFamily: 'var(--font-noto)', fontSize: '0.875rem', color: 'var(--color-muted)', fontWeight: 500 }}>Accuracy Rate</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-900)' }}>₹0</span>
                    <span style={{ fontFamily: 'var(--font-noto)', fontSize: '0.875rem', color: 'var(--color-muted)', fontWeight: 500 }}>Setup Cost</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.4} direction="left">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} style={{ width: '320px', backgroundColor: '#111827', borderRadius: '54px', padding: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 0 2px rgba(255, 255, 255, 0.1), 0 0 80px rgba(196, 98, 45, 0.15)', position: 'relative', zIndex: 2 }}>
                  {/* Notch / Dynamic Island */}
                  <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '30px', backgroundColor: '#111827', borderRadius: '0 0 16px 16px', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '6px', borderRadius: '3px', backgroundColor: '#374151' }}></div>
                  </div>

                  <div style={{ 
                    backgroundColor: '#faf9f6', 
                    borderRadius: '42px', 
                    overflow: 'hidden', 
                    height: '600px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    position: 'relative'
                  }}>
                    {/* Chat Header */}
                    <div style={{ padding: '2.5rem 1.25rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'sticky', top: 0, zIndex: 5 }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontFamily: 'var(--font-jakarta)', boxShadow: '0 4px 10px rgba(196, 98, 45, 0.2)' }}>
                        S
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-brand-900)', margin: 0, lineHeight: 1.2 }}>Stash AI</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                          <span style={{ fontFamily: 'var(--font-noto)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 600 }}>Online</span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1.25rem', overflowY: 'auto' }}>
                      
                      {/* Message 1: AI */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', alignSelf: 'flex-start', maxWidth: '85%' }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', borderTopLeftRadius: '0.25rem', padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#1f2937', lineHeight: 1.5, textAlign: 'left', fontFamily: 'var(--font-noto)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
                          Namaste! Main aapka Stash AI hoon. Kya help chahiye?
                        </div>
                      </div>

                      {/* Message 2: User */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', alignSelf: 'flex-end', maxWidth: '85%', flexDirection: 'row-reverse' }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))', borderRadius: '1.5rem', borderTopRightRadius: '0.25rem', padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'white', lineHeight: 1.5, textAlign: 'left', fontFamily: 'var(--font-noto)', boxShadow: '0 4px 12px rgba(196, 98, 45, 0.2)' }}>
                          Bourbon ke boxes kitne bache hai?
                        </div>
                      </div>

                      {/* Message 3: AI */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', alignSelf: 'flex-start', maxWidth: '85%' }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', borderTopLeftRadius: '0.25rem', padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#1f2937', lineHeight: 1.5, textAlign: 'left', fontFamily: 'var(--font-noto)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
                          Raju bhai, <strong>Bourbon ka stock 32 boxes</strong> hai. <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontWeight: 700 }}><FiAlertTriangle size={12} /> Low stock</span> alert! Reorder karein?
                        </div>
                      </div>

                      {/* Message 4: User */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', alignSelf: 'flex-end', maxWidth: '85%', flexDirection: 'row-reverse' }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))', borderRadius: '1.5rem', borderTopRightRadius: '0.25rem', padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'white', lineHeight: 1.5, textAlign: 'left', fontFamily: 'var(--font-noto)', boxShadow: '0 4px 12px rgba(196, 98, 45, 0.2)' }}>
                          Haan, 150 boxes order kar do
                        </div>
                      </div>

                      {/* Message 5: AI */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', alignSelf: 'flex-start', maxWidth: '85%' }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', borderTopLeftRadius: '0.25rem', padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#1f2937', lineHeight: 1.5, textAlign: 'left', fontFamily: 'var(--font-noto)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
                          Order create ho gaya! <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 700 }}><FiCheck size={12} /> 150 boxes Bourbon.</span> Delivery kal tak expected!
                        </div>
                      </div>

                    </div>

                    {/* Chat Input Area */}
                    <div style={{ marginTop: 'auto', padding: '1rem', backgroundColor: 'white', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 5 }}>
                      <div style={{ flex: 1, height: '2.75rem', backgroundColor: '#f3f4f6', borderRadius: '9999px', display: 'flex', alignItems: 'center', padding: '0 1.25rem', color: '#9ca3af', fontFamily: 'var(--font-noto)', fontSize: '0.85rem' }}>
                        Type a message...
                      </div>
                      <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(196, 98, 45, 0.3)', flexShrink: 0 }}>
                        <FaMicrophone size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Cards */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} style={{ position: 'absolute', top: '30px', left: '-60px', backgroundColor: 'white', borderRadius: '8px', padding: '14px 18px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', zIndex: 3 }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(196, 98, 45, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#C4622D' }}>
                    <BsGraphUpArrow />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'var(--font-noto)' }}>Today's Orders</div>
                    <div style={{ color: '#111827', fontFamily: 'var(--font-jakarta)', fontSize: '0.9rem' }}>+16 orders</div>
                  </div>
                </motion.div>

                <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }} style={{ position: 'absolute', bottom: '60px', right: '-60px', backgroundColor: 'white', borderRadius: '8px', padding: '14px 18px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', zIndex: 3 }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(196, 98, 45, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#FF7722' }}>
                    <FiAlertTriangle />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'var(--font-noto)' }}>Low Stock Alert</div>
                    <div style={{ color: '#FF7722', fontFamily: 'var(--font-jakarta)', fontSize: '0.9rem' }}>Bourbon — 32 boxes</div>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM WITH GRAPH */}
      <section style={{ padding: '8rem 1.5rem', backgroundColor: 'var(--color-surface)', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '72rem' }}>
          <FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5rem' }}>
              <span style={{ fontFamily: 'var(--font-jakarta)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-error)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>The Problem</span>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--color-brand-900)', textAlign: 'center', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Warehousing is broken at the <br/>operator layer.
              </h2>
            </div>
          </FadeIn>
          
          <div className="grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
            <FadeIn direction="right" delay={0.2}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--color-brand-50)', transform: 'translate(1.5rem, 1.5rem)', borderRadius: '2rem', zIndex: 0 }}></div>
                <div style={{ backgroundColor: 'white', padding: '3.5rem', borderRadius: '2rem', border: '1px solid var(--color-brand-100)', position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
                      <FaChartLine size={32} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-900)' }}>Bleeding Capital</h3>
                      <p style={{ color: 'var(--color-muted)' }}>The cost of manual tracking</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '3rem', fontWeight: 800, color: 'var(--color-error)', lineHeight: 1 }}>40%</p>
                      <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.125rem', color: 'var(--color-brand-800)', marginTop: '0.5rem', fontWeight: 500 }}>discrepancy rate between logs and actual stock.</p>
                    </div>
                    <div style={{ height: '1px', backgroundColor: 'var(--color-divider)' }}></div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '3rem', fontWeight: 800, color: 'var(--color-error)', lineHeight: 1 }}>₹2.5 Cr</p>
                      <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.125rem', color: 'var(--color-brand-800)', marginTop: '0.5rem', fontWeight: 500 }}>daily loss from missed entries, theft, and delays.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn direction="left" delay={0.4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-brand-800)', marginBottom: '1rem' }}>Task Duration: Manual vs Voice AI</h3>
                
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeComparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-divider)" />
                      <XAxis type="number" unit="m" stroke="var(--color-muted)" />
                      <YAxis dataKey="name" type="category" width={100} stroke="var(--color-brand-800)" tick={{fontFamily: 'var(--font-noto)', fontSize: 12}} />
                      <RechartsTooltip cursor={{fill: 'var(--color-brand-50)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-card)'}} />
                      <Bar dataKey="manual" name="Manual App (mins)" fill="#d93025" radius={[0, 4, 4, 0]} barSize={20} />
                      <Bar dataKey="stash" name="Stash Voice (mins)" fill="var(--color-success)" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ padding: '2rem', backgroundColor: 'var(--color-brand-900)', borderRadius: '1rem', marginTop: '1rem' }}>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.25rem', fontWeight: 500, color: 'white', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "Current tech completely ignores the operator layer, the very point where data is supposed to be inputted."
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 2.5: PAIN POINTS GRID */}
      <section style={{ padding: '8rem 1.5rem', backgroundColor: 'white' }}>
        <div className="container" style={{ maxWidth: '72rem' }}>
          <FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4rem' }}>
              <span style={{ fontFamily: 'var(--font-jakarta)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-500)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>Familiar Pain Points</span>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--color-brand-900)', textAlign: 'center', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Every warehouse operator faces <br/>the same bottlenecks
              </h2>
              <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.125rem', color: 'var(--color-muted)', maxWidth: '42rem', textAlign: 'center', marginTop: '1.25rem', lineHeight: 1.6 }}>
                When every task is manual, errors compound — costing time, money, and customer trust.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {[
              { icon: <FiClipboard />, title: 'Stock counts are never accurate', desc: 'Discrepancies between physical counts and records cause phantom stock, missed reorders, and customer dissatisfaction.' },
              { icon: <FaPhoneAlt />, title: 'Calls eat up the entire day', desc: 'Coordinating with suppliers, drivers, and buyers over phone burns hours that should go toward growing the business.' },
              { icon: <FiTruck />, title: 'Deliveries are a black box', desc: 'Once goods leave the warehouse, tracking is a manual phone chase — no visibility until something goes wrong.' },
              { icon: <FiBook />, title: 'Paper logs and spreadsheets fail at scale', desc: 'Diaries get lost, Excel formulas break, and staff skip updates — leaving critical data permanently out of sync.' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1} fullHeight>
                <div
                  style={{ height: '100%', backgroundColor: 'var(--color-bg-alt)', border: '1px solid var(--color-brand-100)', borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', cursor: 'default', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--color-brand-300)'; 
                    e.currentTarget.style.backgroundColor = 'white'; 
                    e.currentTarget.style.transform = 'translateY(-6px)'; 
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(107, 66, 38, 0.05), 0 8px 10px -6px rgba(107, 66, 38, 0.01)'; 
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--color-brand-100)'; 
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-alt)'; 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = 'none'; 
                  }}
                >
                  <div style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--color-brand-50)', color: 'var(--color-brand-800)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0, border: '1px solid var(--color-brand-100)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-900)', marginBottom: '0.75rem', lineHeight: 1.3 }}>{item.title}</h3>
                    <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.05rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: MARKET OPPORTUNITY (NEW) */}
      <section style={{ padding: '8rem 1.5rem', backgroundColor: 'var(--color-brand-50)' }}>
        <div className="container" style={{ maxWidth: '72rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <span style={{ fontFamily: 'var(--font-jakarta)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-600)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>Market Size</span>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--color-brand-900)', letterSpacing: '-0.02em' }}>
                A Massive Untapped Market
              </h2>
            </div>
          </FadeIn>

          <div className="grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
            <FadeIn direction="right">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--color-brand-200)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <FaGlobeAsia size={24} color="var(--color-brand-400)" />
                    <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand-800)' }}>TAM: $45 Billion</h3>
                  </div>
                  <p style={{ fontFamily: 'var(--font-noto)', color: 'var(--color-muted)' }}>Global Voice AI & Logistics automation market, rapidly expanding due to AI breakthroughs.</p>
                </div>
                
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--color-brand-200)', boxShadow: 'var(--shadow-sm)', marginLeft: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <FaNetworkWired size={24} color="var(--color-brand-500)" />
                    <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand-800)' }}>SAM: $12 Billion</h3>
                  </div>
                  <p style={{ fontFamily: 'var(--font-noto)', color: 'var(--color-muted)' }}>India's supply chain optimization and localized software market.</p>
                </div>
                
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--color-brand-200)', boxShadow: 'var(--shadow-sm)', marginLeft: '4rem', background: 'linear-gradient(135deg, white, var(--color-brand-50))', borderLeft: '4px solid var(--color-brand-600)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <FaUsers size={24} color="var(--color-brand-700)" />
                    <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand-900)' }}>SOM: $2.5 Billion</h3>
                  </div>
                  <p style={{ fontFamily: 'var(--font-noto)', color: 'var(--color-brand-800)', fontWeight: 500 }}>Tier 2 & 3 Godowns in India lacking any form of digitization due to literacy barriers.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.2}>
              <div style={{ height: '400px', width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketSizeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-divider)" />
                    <XAxis dataKey="name" stroke="var(--color-brand-800)" tick={{fontFamily: 'var(--font-noto)', fontSize: 11}} axisLine={false} tickLine={false} />
                    <YAxis unit="B" stroke="var(--color-brand-800)" axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: 'var(--color-brand-100)'}} contentStyle={{borderRadius: '8px', border: '1px solid var(--color-brand-200)'}} />
                    <Bar dataKey="value" fill="var(--color-brand-500)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE SOLUTION */}
      <section style={{ padding: '8rem 1.5rem', backgroundColor: 'var(--color-brand-900)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(196, 98, 45, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div className="container" style={{ maxWidth: '72rem', position: 'relative', zIndex: 1 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <FadeIn>
                <span style={{ fontFamily: 'var(--font-jakarta)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-300)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem', display: 'block' }}>The Solution</span>
                <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
                  Just <span style={{ color: 'var(--color-brand-300)' }}>speak</span> —<br/>Stash does the rest
                </h2>
                <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.125rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                  No training, no complicated software. Just simple conversation — and everything is automated in the background.
                </p>
              </FadeIn>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  "Real-time stock updates — check anytime",
                  "Orders automatically created and tracked",
                  "AI speaks fluent Hindi & English naturally",
                  "GST-ready bills generated in a message",
                  "Setup in 2 minutes — zero training needed"
                ].map((point, i) => (
                  <FadeIn key={i} delay={0.2 + (i * 0.1)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', backgroundColor: 'rgba(196, 98, 45, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-300)', flexShrink: 0, fontSize: '0.875rem' }}>
                        <FaCheckCircle />
                      </div>
                      <span style={{ fontFamily: 'var(--font-noto)', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>{point}</span>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            <FadeIn delay={0.4} direction="left">
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '1.75rem', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-jakarta)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiBarChart2 style={{ color: 'var(--color-brand-300)' }} />
                    Live Dashboard
                  </span>
                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '6px', height: '6px', backgroundColor: '#34d399', borderRadius: '50%' }}></motion.span>
                    Live
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-noto)' }}>Total Stock Value</div>
                    <div style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>₹5.3L</div>
                    <div style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500 }}>↑ +14% this week</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-noto)' }}>Active Orders</div>
                    <div style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>28</div>
                    <div style={{ color: '#fbbf24', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500 }}>3 need attention</div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.25rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    Low Stock Alert <FiAlertTriangle style={{ color: '#fbbf24' }} size={14} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { item: 'Noodles', qty: '22 boxes', color: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24' },
                      { item: 'Biscuit', qty: '32 boxes', alert: true, color: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
                      { item: 'Rice 4 kgs', qty: '120 bags', success: true, color: 'rgba(16, 185, 129, 0.2)', text: '#34d399' }
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontFamily: 'var(--font-noto)' }}>{row.item}</span>
                        <span style={{ backgroundColor: row.color, color: row.text, padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          {row.qty}
                          {row.alert && <FiAlertTriangle size={12} />}
                          {row.success && <FiCheck size={12} />}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 4.5: HOW IT WORKS — 3 STEPS */}
      <section style={{ padding: '8rem 1.5rem', backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container" style={{ maxWidth: '72rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <span style={{ fontFamily: 'var(--font-jakarta)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-600)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem', display: 'block' }}>Simple Workflow</span>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--color-brand-900)', letterSpacing: '-0.02em' }}>
                Three steps. Fully automated.
              </h2>
              <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.125rem', color: 'var(--color-muted)', maxWidth: '40rem', margin: '1.25rem auto 0', lineHeight: 1.6 }}>
                No training required. No software to install. Just speak — Stash handles the rest.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', position: 'relative' }}>
            {/* Connector line (desktop only) */}
            <div style={{ position: 'absolute', top: '3.5rem', left: '20%', right: '20%', height: '2px', background: 'linear-gradient(90deg, var(--color-brand-300), var(--color-brand-500))', zIndex: 0, pointerEvents: 'none' }} aria-hidden="true" />

            {[
              { num: '01', title: 'Speak or Call In', desc: 'Use your native language — Hindi, English, or regional — to report stock changes, raise orders, or flag a delivery issue.' },
              { num: '02', title: 'AI Understands Context', desc: "Stash's voice intelligence maps intent to actions: inventory update, PO creation, supplier alert, or automated invoice." },
              { num: '03', title: 'Everything Syncs Instantly', desc: 'Dashboard, billing, and supplier records update in real-time. Confirmations go out automatically via call or message.' },
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.15} fullHeight>
                <div
                  style={{ height: '100%', backgroundColor: 'white', borderRadius: '1.75rem', padding: '2.5rem 2rem', textAlign: 'center', border: '1px solid var(--color-brand-100)', position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', cursor: 'default' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div style={{ width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, var(--color-brand-400), var(--color-brand-700))', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: '0 auto 1.75rem', boxShadow: '0 8px 20px rgba(107,66,38,0.3)' }}>
                    {step.num}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-900)', marginBottom: '0.75rem' }}>{step.title}</h3>
                  <p style={{ fontFamily: 'var(--font-noto)', fontSize: '0.95rem', color: 'var(--color-muted)', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: UNIQUE SELLING PROPOSITION */}
      <section style={{ padding: '8rem 1.5rem', backgroundColor: 'white' }}>
        <div className="container" style={{ maxWidth: '72rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--color-brand-900)', letterSpacing: '-0.02em' }}>
                Our Moat & USP
              </h2>
            </div>
          </FadeIn>
          
          <div className="grid-4" style={{ gap: '2rem' }}>
            {[
              { title: "Voice-Native", desc: "Multilingual capability that understands complex local slang.", icon: <FaMicrophone /> },
              { title: "Zero Literacy", desc: "Works perfectly on basic phones without needing a keyboard.", icon: <FaMobileAlt /> },
              { title: "Proactive AI", desc: "Predicts disruptions and demands before they actually occur.", icon: <BsLightningChargeFill /> },
              { title: "Closed-Loop", desc: "Autonomously calls suppliers, confirms data, and follows up.", icon: <FaRobot /> }
            ].map((usp, i) => (
              <FadeIn key={i} delay={0.2 + (i * 0.1)} fullHeight>
                <div style={{ backgroundColor: 'var(--color-brand-50)', padding: '2.5rem 2rem', borderRadius: '1.5rem', border: '1px solid var(--color-brand-100)', height: '100%', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s ease', cursor: 'default' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', marginBottom: '2rem', boxShadow: '0 8px 16px rgba(107, 66, 38, 0.2)' }}>
                    {usp.icon}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-900)', marginBottom: '1rem' }}>{usp.title}</h3>
                  <p style={{ fontFamily: 'var(--font-noto)', color: 'var(--color-muted)', lineHeight: 1.6 }}>{usp.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5.25: FEATURE HIGHLIGHTS GRID */}
      <section style={{ padding: '8rem 1.5rem', backgroundColor: 'white' }}>
        <div className="container" style={{ maxWidth: '72rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <span style={{ fontFamily: 'var(--font-jakarta)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-600)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem', display: 'block' }}>Core Capabilities</span>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--color-brand-900)', letterSpacing: '-0.02em' }}>
                Everything in one place
              </h2>
              <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.125rem', color: 'var(--color-muted)', maxWidth: '42rem', margin: '1.25rem auto 0', lineHeight: 1.6 }}>
                Purpose-built for the complexity of India's supply chain — without the enterprise complexity.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {[
              { icon: <FiPackage size={24} />, title: 'Real-time Inventory', desc: 'Live stock count across all SKUs with threshold alerts, auto-reorder triggers, and discrepancy flags — zero manual entry.' },
              { icon: <FiTruck size={24} />, title: 'Order & Delivery Ops', desc: 'Voice-raised orders auto-populate purchase records, assign carriers, and send status updates to buyers without lifting a finger.' },
              { icon: <FaPhoneAlt size={18} />, title: 'Intelligent Voice Ledger', desc: 'Every inbound and outbound call is transcribed, classified, and mapped to an action — supplier, buyer, or internal ops.' },
              { icon: <FaFileInvoiceDollar size={20} />, title: 'Instant GST Billing', desc: 'Compliant invoices generated automatically from order data. Share as PDF over WhatsApp or email in under a second.' },
              { icon: <FiBarChart2 size={24} />, title: 'Business Intelligence', desc: 'Weekly summaries, top-moving SKUs, and credit exposure — surfaced in plain language, not buried in pivot tables.' },
              { icon: <FaRobot size={22} />, title: 'Proactive AI Alerts', desc: 'Demand spikes, low margin orders, overdue payments — Stash flags risks before they become costly surprises.' },
            ].map((feat, i) => (
              <FadeIn key={i} delay={i * 0.08} fullHeight>
                <div
                  style={{ height: '100%', backgroundColor: 'var(--color-bg-alt)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid var(--color-brand-100)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.backgroundColor = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = 'var(--color-bg-alt)'; }}
                >
                  {/* Accent bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--color-brand-400), var(--color-brand-600))', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease' }} className="feat-accent" />
                  <div style={{ width: '3.5rem', height: '3.5rem', background: 'linear-gradient(135deg, var(--color-brand-50), var(--color-brand-100))', border: '1px solid var(--color-brand-200)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-600)', marginBottom: '1.5rem' }}>
                    {feat.icon}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-900)', marginBottom: '0.6rem' }}>{feat.title}</h3>
                  <p style={{ fontFamily: 'var(--font-noto)', fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.65 }}>{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5.5: TECH STACK */}
      <section style={{ padding: '8rem 1.5rem', backgroundColor: 'var(--color-surface)' }}>
        <div className="container" style={{ maxWidth: '72rem' }}>
          <div className="grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
            <FadeIn direction="right">
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, color: 'var(--color-brand-900)', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
                Built on a modern,<br/>scalable stack.
              </h2>
              <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.25rem', color: 'var(--color-muted)', marginBottom: '3rem', lineHeight: 1.6 }}>
                Our architecture is designed for extreme reliability in low-bandwidth areas while powering complex AI models in the cloud.
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {[
                  "Next.js 14+", "FastAPI", "Gemini 3.0 Flash", 
                  "Vertex AI", "Google STT/TTS", "Redis & Celery", 
                  "Firestore", "Cloud Run"
                ].map((tech, i) => (
                  <span key={i} style={{ padding: '0.5rem 1.25rem', backgroundColor: 'var(--color-brand-50)', border: '1px solid var(--color-brand-200)', borderRadius: '9999px', fontFamily: 'var(--font-jakarta)', fontWeight: 600, color: 'var(--color-brand-700)', fontSize: '0.875rem' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </FadeIn>
            
            <FadeIn direction="left" delay={0.2}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {[
                  { layer: "AI Intelligence", tech: "Gemini 3.0 Flash, Vertex AI, Prophet, XGBoost" },
                  { layer: "Application Logic", tech: "FastAPI, Redis, Celery, APScheduler" },
                  { layer: "Data & Infra", tech: "Firestore, Cloud Run, Docker, Pub/Sub" }
                ].map((stack, i) => (
                  <div key={i} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-500)', fontWeight: 800, marginBottom: '0.5rem' }}>{stack.layer}</h4>
                    <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-brand-900)' }}>{stack.tech}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 6: BUSINESS MODEL WITH NETWORK EFFECTS GRAPH */}
      <section style={{ padding: '8rem 1.5rem', backgroundColor: 'var(--color-surface)' }}>
        <div className="container" style={{ maxWidth: '72rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <span style={{ fontFamily: 'var(--font-jakarta)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-600)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>Economics & Scale</span>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--color-brand-900)', letterSpacing: '-0.02em' }}>
                Built for Exponential Growth
              </h2>
            </div>
          </FadeIn>
          
          <div className="grid-2" style={{ gap: '4rem', marginBottom: '4rem' }}>
            <FadeIn delay={0.1}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--color-brand-100)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-600)', fontSize: '1.25rem' }}>
                      <FaRupeeSign />
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-900)' }}>Revenue Streams</h3>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {["SaaS tiers (Basic, Pro, Enterprise)", "Transaction fees (UPI, GST invoices)", "B2B data & intelligence (Demand mapping)"].map((item, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
                        <FaCheckCircle style={{ color: 'var(--color-success)', marginTop: '0.25rem', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-noto)', color: 'var(--color-brand-800)', fontWeight: 600 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--color-brand-100)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-600)', fontSize: '1.25rem' }}>
                      <BsGraphUpArrow />
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-900)' }}>Growth Flywheel</h3>
                  </div>
                  <p style={{ fontFamily: 'var(--font-noto)', color: 'var(--color-muted)', lineHeight: 1.6, padding: '1.5rem', backgroundColor: 'var(--color-brand-50)', borderRadius: '1rem', borderLeft: '4px solid var(--color-brand-400)' }}>
                    Low CAC driven by word-of-mouth in highly connected mandi networks. High retention natively created by historical data lock-in and improving AI accuracy.
                  </p>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '2rem', border: '1px solid var(--color-brand-200)', boxShadow: 'var(--shadow-card)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand-900)', marginBottom: '0.5rem' }}>The AI Network Effect</h3>
                <p style={{ fontFamily: 'var(--font-noto)', color: 'var(--color-muted)', marginBottom: '2rem' }}>More operators = Better AI accuracy = Faster task completion.</p>
                
                <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={networkEffectsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="var(--color-brand-800)" tick={{fontFamily: 'var(--font-noto)', fontSize: 12}} />
                      <YAxis yAxisId="left" stroke="var(--color-brand-500)" tick={{fontFamily: 'var(--font-noto)', fontSize: 12}} />
                      <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" domain={[60, 100]} tick={{fontFamily: 'var(--font-noto)', fontSize: 12}} />
                      <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-card)'}} />
                      <Area yAxisId="left" type="monotone" dataKey="users" name="Active Users" stroke="var(--color-brand-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                      <Area yAxisId="right" type="monotone" dataKey="accuracy" name="AI Accuracy %" stroke="var(--color-success)" strokeWidth={3} fillOpacity={1} fill="url(#colorAccuracy)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 7: CALL TO ACTION */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', backgroundColor: 'var(--color-brand-900)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.1, mixBlendMode: 'overlay' }}></div>
        
        {/* Giant Half Icon Background at Bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', width: '100%', minWidth: '1000px', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
          <img src="/icon.svg" alt="Stash Logo" style={{ width: '100%', maxWidth: '1600px', height: 'auto', opacity: 0.15, filter: 'brightness(0) invert(1) drop-shadow(0px -20px 40px rgba(0,0,0,0.5))' }} />
        </div>

        <div className="container" style={{ maxWidth: '48rem', position: 'relative', zIndex: 10 }}>
          <FadeIn>
            <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '2rem', lineHeight: 1.1 }}>
              Ready to redefine <br/><span className="text-gradient" style={{ background: 'linear-gradient(135deg, var(--color-brand-300), var(--color-brand-100))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>warehousing?</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-noto)', fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginBottom: '3rem' }}>
              The prototype is live, hosted on Cloud Run with a fully operational MVP. 
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <button style={{ fontFamily: 'var(--font-jakarta)', backgroundColor: 'white', color: 'var(--color-brand-900)', border: 'none', padding: '1rem 2.5rem', borderRadius: '9999px', fontSize: '1.125rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Watch Demo Video
              </button>
              <button style={{ fontFamily: 'var(--font-jakarta)', backgroundColor: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.5)', padding: '1rem 2.5rem', borderRadius: '9999px', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}>
                View GitHub Repo
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
