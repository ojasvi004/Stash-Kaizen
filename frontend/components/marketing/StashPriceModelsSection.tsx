"use client";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { LuArrowRight as ArrowRight, LuCheck as Check, LuStar as Star } from "react-icons/lu";

const priceModels = [
  {
    name: "Starter",
    price: "₹6k - ₹10k",
    cadence: "/ month",
    summary: "Best for a single godown that wants voice-led inventory control and simple billing automation.",
    accent: "var(--color-brand-600)",
    gradient: "linear-gradient(180deg, rgba(139,94,60,0.10), rgba(139,94,60,0.03))",
    features: [
      "1 warehouse workspace",
      "Multilingual voice inventory updates",
      "Basic GST billing and reminders",
      "Mobile app for easier management",
    ],
  },
  {
    name: "Growth",
    price: "₹10k - ₹15k",
    cadence: "/ month",
    summary: "For operators scaling across multiple lanes who need forecasting, supplier automation, and faster coordination.",
    accent: "var(--color-brand-700)",
    gradient: "linear-gradient(180deg, rgba(84,52,30,0.11), rgba(84,52,30,0.04))",
    featured: true,
    features: [
      "Up to 3 warehouse locations",
      "Predictive reorder alerts",
      "Supplier automation",
      "Mobile app for easier management",
    ],
  },
  {
    name: "Enterprise",
    price: "₹15k - ₹20k",
    cadence: "/ month",
    summary: "Built for larger supply chains that need custom integrations, SLAs, and dedicated rollout support.",
    accent: "var(--color-brand-800)",
    gradient: "linear-gradient(180deg, rgba(61,38,22,0.10), rgba(61,38,22,0.035))",
    features: [
      "Unlimited warehouses",
      "Custom integrations and workflows",
      "Mobile app for easier management",
      "Priority SLA and account review",
    ],
  },
];

export default function StashPriceModelsSection() {
  return (
    <section className="section" id="price-models-section" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge glass-dark" style={{ color: 'var(--color-brand-700)' }}>
            Pricing Models
          </span>
          <h2 className="section-title text-gradient">
            Choose the Right Stash Plan
          </h2>
          <p className="section-desc">
            Three launch-ready packages for teams at different stages of warehouse automation.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '0.9rem 1.25rem', borderRadius: '999px', backgroundColor: 'var(--color-brand-50)', border: '1px solid var(--color-divider)' }}>
            <span style={{ color: 'var(--color-brand-700)', fontWeight: 700 }}>
              Need something larger?
            </span>
            <span style={{ color: 'var(--color-muted)' }}>
              Try Stash free for a week before you commit.
            </span>
            <Button
              size="md"
              variant="secondary"
              icon={<ArrowRight size={16} />}
              onClick={() => window.location.href = '/signup'}
            >
              Try Stash Free for a Week
            </Button>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
            hidden: {},
          }}
          className="grid-3"
        >
          {priceModels.map((plan) => (
            <motion.div
              key={plan.name}
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.98 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
              }}
              className="feature-card glass"
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '2.25rem',
                border: plan.featured ? '1px solid rgba(84,52,30,0.28)' : '1px solid var(--color-divider)',
                background: plan.gradient,
                boxShadow: plan.featured ? '0 24px 60px rgba(84,52,30,0.10)' : undefined,
              }}
            >
              {plan.featured ? (
                <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', borderRadius: '999px', backgroundColor: 'rgba(139,94,60,0.10)', color: 'var(--color-brand-700)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Star size={14} />
                  Most Popular
                </div>
              ) : null}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-brand-900)', marginBottom: '0.35rem' }}>
                    {plan.name}
                  </h3>
                  <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
                    {plan.summary}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: plan.accent, lineHeight: 1 }}>
                  {plan.price}
                </span>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                  {plan.cadence}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-brand-900)', lineHeight: 1.5 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.45rem', height: '1.45rem', borderRadius: '999px', backgroundColor: 'rgba(139,94,60,0.10)', color: 'var(--color-brand-700)', flexShrink: 0, marginTop: '0.1rem' }}>
                      <Check size={14} />
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                variant={plan.featured ? "secondary" : "outline"}
                className="w-full"
                icon={<ArrowRight size={18} />}
                onClick={() => window.location.href = '/dashboard'}
              >
                Start with {plan.name}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}