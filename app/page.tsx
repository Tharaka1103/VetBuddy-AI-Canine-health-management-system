"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  Calendar,
  Bell,
  Shield,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Star,
  Activity,
  Brain,
  Stethoscope,
  PawPrint,
  Award,
  Clock,
  Smile,
  Dog,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Fixed Large Background Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden bg-lime-400/20 blur-sm">
        <h1 className="text-[15vw] md:text-[18vw] font-black text-lime-900/20 leading-none tracking-tighter">
          WOOFY
        </h1>
        <Dog strokeWidth={1} className="ml-5 w-56 h-56 text-lime-900/20"/>
      </div>
      </div>

      {/* All Sections with proper z-index */}
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection />

        {/* Services Overview */}
        <ServicesSection />

        {/* AI Dog Health Profile - Special Section */}
        <AIHealthProfileSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Fun Stats */}
        <StatsSection />

        {/* CTA Section */}
        <CTASection />
      </div>
    </div>
  );
}

// 1. Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 leading-tight">
            For a lifetime of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
              WET-NOSED NUZZLES
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Because your furry friend deserves more than just belly rubs! 🐕
            <br />
            Manage your dog's health with AI-powered profiles, smart reminders,
            and a dash of tail-wagging technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signup">
                <Button className="bg-lime-400 hover:bg-lime-500 text-black font-bold px-8 py-6 text-base">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="#how-it-works">
                <Button className="bg-transparent hover:bg-lime-50 border-2 border-lime-400 text-black font-bold px-8 py-6 text-base">
                  See How It Works
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>24/7 Support</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-green-500 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
}

// 2. Services Section
function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const services = [
    {
      icon: Calendar,
      title: "Vaccination Tracking",
      description:
        "Never miss a shot! We'll remind you before your pup starts side-eyeing the vet.",
      color: "from-blue-400 to-blue-500",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description:
        "Meal times, medicine, walks - we've got more alerts than your dog has hiding spots for treats!",
      color: "from-purple-400 to-purple-500",
    },
    {
      icon: Activity,
      title: "Health Monitoring",
      description:
        "Track weight, activity, and mood swings (yes, dogs have those too!).",
      color: "from-pink-400 to-pink-500",
    },
    {
      icon: Stethoscope,
      title: "Vet Appointments",
      description:
        "Schedule and manage vet visits. We promise not to tell your dog where you're really going.",
      color: "from-green-400 to-green-500",
    },
    {
      icon: Shield,
      title: "Medical Records",
      description:
        "All health records in one place, safer than where your dog hides their bones!",
      color: "from-orange-400 to-orange-500",
    },
    {
      icon: Users,
      title: "Multi-Dog Management",
      description:
        "Got a whole pack? Manage all your fur babies without losing your mind!",
      color: "from-teal-400 to-teal-500",
    },
  ];

  return (
    <section ref={ref} className="py-20 px-4 relative bg-white">
      {/* Section Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h2 className="text-[20vw] md:text-[20vw] font-black text-lime-900/20 leading-none tracking-tighter">
          SERVICES
        </h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6">
            Our Services
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything your dog needs (except unlimited treats - that's on you!)
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-lime-400/20 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-green-500/10 hover:border-green-400 transition-all"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${service.color} mb-4 shadow-lg`}
              >
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// 3. AI Health Profile - Special Section
function AIHealthProfileSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="py-20 px-4 relative bg-gradient-to-br from-green-50 via-green-100/50 to-white"
    >
      {/* Large Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[20vw] md:text-[25vw] lg:text-[30vw] font-black text-green-900/50 leading-none tracking-tighter">
          AI
        </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 leading-tight">
            Introducing
            <br />
            <span className="text-transparent bg-clip-text bg-green-500">
              Buddy's Board
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            The smartest way to track your dog's health
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-green-500 rounded-sm blur-2xl opacity-20"></div>
              <div className="relative ">
                <Image
                  src="/dogprofile.png"
                  alt="Happy dog with AI health monitoring"
                  width={800}
                  height={600}
                  className="rounded-sm mb-6"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="space-y-6"
          >
            {[
              {
                icon: Brain,
                title: "AI-Powered Analysis",
                description:
                  "Our AI is like a vet who never sleeps (and doesn't charge overtime). It analyzes your dog's health data 24/7!",
              },
              {
                icon: Zap,
                title: "Instant Health Insights",
                description:
                  "Get personalized recommendations faster than your dog can fetch a ball. That's pretty fast!",
              },
              {
                icon: TrendingUp,
                title: "Predictive Health Alerts",
                description:
                  "We spot potential issues before they become actual issues. It's like having a crystal ball, but for dog health!",
              },
              {
                icon: Heart,
                title: "Customized Care Plans",
                description:
                  "Every dog is unique (yours is the best, obviously). Our AI creates personalized health plans just for them.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ x: 10 }}
                className="flex gap-4 bg-lime-200/10 backdrop-blur-sm rounded-sm p-5 hover:border-green-500 hover:shadow-lg transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-900">{feature.description}</p>
                </div>
              </motion.div>
            ))}

            <motion.div variants={fadeInUp} className="pt-4">
              <Link
                href="/signup"
              >
                <Button className="bg-lime-400 hover:bg-lime-500 text-black px-8 py-6 text-base">
                  Try AI Health Profile Free
                  <Sparkles className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// 4. How It Works Section
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const steps = [
    {
      number: "01",
      title: "Create Your Dog's Profile",
      description:
        "Name, breed, birthday, favorite toy - tell us everything! (Okay, maybe not everything...)",
      image: "/homebg.jpg",
    },
    {
      number: "02",
      title: "Add Health Information",
      description:
        "Vaccination records, medications, allergies. It's like Facebook, but actually useful!",
      image: "/homebg.jpg",
    },
    {
      number: "03",
      title: "Let AI Work Its Magic",
      description:
        "Our AI analyzes the data and creates a personalized health plan. No magic wand needed!",
      image: "/homebg.jpg",
    },
    {
      number: "04",
      title: "Stay Healthy & Happy",
      description:
        "Get reminders, insights, and peace of mind. Your dog gets treats. Everyone wins!",
      image: "/homebg.jpg",
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-20 px-4 relative bg-white"
    >
      {/* Section Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden blur-sm">
        <h2 className="text-[20vw] md:text-[25vw] font-black text-lime-900/10 leading-none tracking-tighter">
          WORKS
        </h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Four steps to canine health nirvana. Easier than teaching "stay"!
          </p>
        </motion.div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center`}
            >
              <div className="flex-1">
                <div className="relative">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={600}
                    height={400}
                    className="relative rounded-2xl shadow-2xl border-2 border-gray-200"
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="text-7xl md:text-8xl lg:text-9xl font-black text-lime-400/50 mb-4">
                  {step.number}
                </div>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 5. Benefits Section
function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description:
        "More time for walks, less time for paperwork. Your dog approves this message!",
    },
    {
      icon: Shield,
      title: "Peace of Mind",
      description:
        "Sleep better knowing your pup's health is monitored by AI (and you).",
    },
    {
      icon: Award,
      title: "Better Care",
      description:
        "Proactive health management means fewer vet emergencies and more tail wags!",
    },
    {
      icon: Smile,
      title: "Happier Dogs",
      description:
        "Healthy dogs = happy dogs. It's science! (Okay, it's common sense.)",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 px-4 relative bg-gradient-to-br from-gray-50 to-white"
    >
      {/* Section Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-5">
        <h2 className="text-[20vw] md:text-[20vw] font-black text-gray-900 leading-none tracking-tighter">
          BENEFITS
        </h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6">
            Why Choose Us?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Because your dog deserves the best (and so do you!)
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-lime-200/20 rounded-2xl p-8 text-center border-2 border-gray-200 hover:border-green-500 hover:shadow-xl transition-all"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-500 mb-6 shadow-lg shadow-green-500/50">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// 6. Testimonials Section
function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const testimonials = [
    {
      name: "Sarah Johnson",
      dog: "Max, Golden Retriever",
      image: "/homebg.jpg",
      text: "This app is like having a vet in my pocket! Max's health has never been better tracked. Plus, the reminders saved me from missing his vaccine!",
      rating: 5,
    },
    {
      name: "Mike Peterson",
      dog: "Luna & Bella, Huskies",
      image: "/homebg.jpg",
      text: "Managing two dogs was chaos until I found this. The AI insights are actually useful, not just marketing fluff!",
      rating: 5,
    },
    {
      name: "Emily Chen",
      dog: "Charlie, Beagle",
      image: "/homebg.jpg",
      text: "Charlie ate something weird (again), and the app's health monitoring helped me catch it early. Literally a lifesaver!",
      rating: 5,
    },
  ];

  return (
    <section ref={ref} className="py-20 px-4 relative bg-white">
      {/* Section Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-5">
        <h2 className="text-[20vw] md:text-[20vw] font-black text-gray-900 leading-none tracking-tighter">
          REVIEWS
        </h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6">
            Happy Tails
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from real dog parents!
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-lime-200/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-lime-400 hover:border-green-500 hover:shadow-xl transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={50}
                  height={50}
                  className="rounded-full border-2 border-gray-200"
                />
                <div>
                  <div className="font-bold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">{testimonial.dog}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// 7. Stats Section
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const stats = [
    {
      number: "50K+",
      label: "Happy Dogs",
      icon: PawPrint,
      suffix: "and counting!",
    },
    {
      number: "99.9%",
      label: "Uptime",
      icon: Zap,
      suffix: "always there",
    },
    {
      number: "1M+",
      label: "Reminders Sent",
      icon: Bell,
      suffix: "never miss a thing",
    },
    {
      number: "24/7",
      label: "AI Monitoring",
      icon: Brain,
      suffix: "never sleeps",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 px-4 relative bg-gradient-to-br from-green-500 to-green-600"
    >
      {/* Large Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden blur-sm">
        <h1 className="text-[20vw] md:text-[25vw] lg:text-[30vw] font-black text-lime-900/30 leading-none tracking-tighter">
          STATS
        </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6">
            By The Numbers
          </h2>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
            Stats that'll make your tail wag!
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ scale: 1.05 }}
              className=" rounded-2xl p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-black text-white mb-2">
                {stat.number}
              </div>
              <div className="text-xl font-bold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-green-100">{stat.suffix}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// 8. CTA Section
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-32 px-4 relative bg-white">
      {/* Large Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[15vw] md:text-[20vw] lg:text-[25vw] font-black text-lime-900/20 leading-none tracking-tighter">
          JOIN
        </h1>
      </div>

      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >

        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 leading-tight">
          Ready to Give Your Dog
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
            The Best Care?
          </span>
        </h2>

        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Join thousands of dog parents who've made the switch to smarter,
          AI-powered health management. Your dog will thank you (probably with
          slobbery kisses)! 🐕💚
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/signup"
            >
              <Button className="bg-lime-400 hover:bg-lime-500 text-black font-bold px-8 py-6 text-base">
              Start Free Today
              <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          No credit card required • Free forever • Cancel anytime (but you won't
          want to!)
        </p>
      </motion.div>
    </section>
  );
}