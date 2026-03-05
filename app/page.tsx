"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dog,
  Heart,
  Activity,
  Brain,
  Shield,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useGsapFadeIn } from "@/hooks/use-gsap";

const features = [
  {
    icon: Heart,
    title: "Live Vitals Monitoring",
    description:
      "Track your dog's temperature, heart rate, and activity in real-time with intuitive dashboards.",
  },
  {
    icon: Brain,
    title: "AI-Powered Diagnostics",
    description:
      "Advanced machine learning detects health anomalies before they become serious problems.",
  },
  {
    icon: Activity,
    title: "Historical Analytics",
    description:
      "Beautiful charts showing health trends over time help you make informed decisions.",
  },
  {
    icon: Shield,
    title: "Continuous Learning",
    description:
      "Your feedback makes the AI smarter — the system learns and improves with every diagnosis.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  const heroRef = useGsapFadeIn<HTMLDivElement>(0.1, 0.9);

  return (
    <div className="flex flex-col">
      {/* ---- Hero Section ---- */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
        {/* Gradient background blob */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div
          ref={heroRef}
          className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Dog className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            AI-Powered{" "}
            <span className="text-primary">Canine Health</span>{" "}
            Management
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Monitor vitals, detect anomalies early, and keep your furry
            companion healthy with real-time AI diagnostics and
            continuous learning.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Features Section ---- */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything Your Dog Needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              A complete health platform powered by explainable AI
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- CTA Section ---- */}
      <section className="py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm"
        >
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to protect your pup?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join thousands of pet owners using WOOFY for smarter,
            healthier dog care.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/register">
              Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WOOFY. Built with Next.js, Shadcn UI & AI.</p>
        </div>
      </footer>
    </div>
  );
}
