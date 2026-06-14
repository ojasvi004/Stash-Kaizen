"use client";
import Link from "next/link";
import Button from "../ui/Button";
import { LuArrowRight as ArrowRight } from "react-icons/lu";
import { motion } from "framer-motion";

export default function ProductShowcase() {
  return (
    <section className="section bg-gradient-mesh" id="product-showcase" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: "3rem" }}>
          <span className="section-badge glass-dark" style={{ color: "var(--color-brand-600)", borderColor: "var(--color-brand-200)" }}>
            Multimodal AI Platform
          </span>
          <h2 className="section-title">
            Multimodal AI-Powered Management System
          </h2>
          <p className="section-desc">
            Interact with your inventory via voice, text commands, and document scans. Stash's multimodal intelligence interprets invoices, responds to spoken Hindi/English prompts, and automatically handles complex godown operations.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ maxWidth: "1100px", margin: "0 auto" }}
        >
          {/* Photo Displayed Directly */}
          <img
            src="/demo.png"
            alt="Stash Multimodal AI Web Dashboard"
            style={{
              width: "100%",
              height: "auto",
              display: "block"
            }}
          />

          <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem" }}>
            <Link href="/dashboard">
              <Button size="lg" icon={<ArrowRight size={20} />}>
                Try Live Dashboard Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
