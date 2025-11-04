"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { 
  Heart,
  Shield, 
  Clock, 
  Brain,
  Activity,
  FileCheck,
  Utensils,
  BookOpen,
  ArrowRight,
  Star,
  Check,
  Users,
  TrendingUp,
  Sparkles,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: "AI Health Analysis",
      description: "Advanced AI technology analyzes symptoms and provides instant health insights for your dog",
      image: "/homebg.jpg"
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Track vital signs, activity levels, and behavioral patterns in real-time",
      image: "/homebg.jpg"
    },
    {
      icon: FileCheck,
      title: "Digital Health Records",
      description: "Store and manage all medical records, vaccinations, and treatments in one place",
      image: "/homebg.jpg"
    },
    {
      icon: Utensils,
      title: "Smart Nutrition Plans",
      description: "Get personalized meal plans based on breed, age, weight, and health conditions",
      image: "/homebg.jpg"
    }
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Dog's Profile",
      description: "Add your dog's basic information, breed, age, and medical history"
    },
    {
      step: "2",
      title: "Track Daily Health",
      description: "Monitor symptoms, behaviors, and activities through our easy-to-use dashboard"
    },
    {
      step: "3",
      title: "Get AI Insights",
      description: "Receive intelligent health recommendations and early warning alerts"
    },
    {
      step: "4",
      title: "Connect with Vets",
      description: "Share reports with veterinarians and get professional guidance"
    }
  ]

  const benefits = [
    "Early disease detection and prevention",
    "24/7 health monitoring and alerts",
    "Comprehensive medical history tracking",
    "Personalized nutrition recommendations",
    "Vaccination and medication reminders",
    "Access to veterinary resources",
    "Community support and tips",
    "Data-driven health insights"
  ]

  const stats = [
    { icon: Users, value: "50,000+", label: "Active Users" },
    { icon: Heart, value: "100,000+", label: "Dogs Monitored" },
    { icon: Shield, value: "99.2%", label: "Accuracy Rate" },
    { icon: TrendingUp, value: "85%", label: "Early Detection" }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Golden Retriever Owner",
      image: "/images/user1.jpg",
      rating: 5,
      text: "PawHealth detected early signs of arthritis in my 7-year-old Max. The AI recommendations helped us start treatment early, and he's doing much better now!"
    },
    {
      name: "Michael Chen",
      role: "Veterinarian",
      image: "/images/user2.jpg",
      rating: 5,
      text: "I recommend PawHealth to all my clients. The detailed health tracking and reports make diagnosis easier and help owners stay proactive about their pet's health."
    },
    {
      name: "Emily Rodriguez",
      role: "Labrador Owner",
      image: "/images/user3.jpg",
      rating: 5,
      text: "The nutrition planning feature transformed my dog's diet. Luna lost weight healthily and has more energy than ever. This app is a game-changer!"
    }
  ]

  const faqs = [
    {
      question: "How accurate is the AI disease identification?",
      answer: "Our AI has a 99.2% accuracy rate, trained on millions of veterinary cases. However, it's designed to assist, not replace, professional veterinary care."
    },
    {
      question: "Is my dog's data secure?",
      answer: "Yes, we use bank-level encryption and comply with all data protection regulations. Your dog's health information is completely private and secure."
    },
    {
      question: "Can I use this for multiple dogs?",
      answer: "Absolutely! You can create and manage profiles for unlimited dogs under one account at no extra cost."
    },
    {
      question: "Do I need any special equipment?",
      answer: "No special equipment needed. Just your smartphone to track symptoms and activities. Optional integration with smart collars available."
    }
  ]

  return (
    <div className="overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/homebg.jpg"
            alt="Happy dog background"
            fill
            className="object-cover opacity-100"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Canine Health Platform</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Your Dog's Health,
                <span className="text-primary"> Simplified</span>
              </h1>

              <p className="text-xl text-white mb-8 leading-relaxed">
                Monitor, track, and improve your dog's wellbeing with AI-powered health insights, 
                personalized care plans, and 24/7 support.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/signup"
                >
                  <Button className="text-black rounded-sm font-bold">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link
                  href="#how-it-works"
                >
                  <Button className="bg-transparent border border-primary font-bold">
                  See How It Works
                  <ChevronDown className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-4xl font-bold text-text mb-2">{stat.value}</h3>
                <p className="text-text/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
              Powerful Features for Complete Care
            </h2>
            <p className="text-xl text-text/70 max-w-3xl mx-auto">
              Everything you need to keep your canine companion healthy, happy, and thriving
            </p>
          </motion.div>

          <div className="space-y-24">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-text mb-4">{feature.title}</h3>
                  <p className="text-lg text-text/70 mb-6">{feature.description}</p>
                  <Link
                    href="/features"
                    className="inline-flex items-center text-primary font-semibold hover:gap-3 transition-all"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="relative h-[400px] rounded-sm overflow-hidden bg-card shadow-xl">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
              How PawHealth Works
            </h2>
            <p className="text-xl text-text/70 max-w-3xl mx-auto">
              Get started in minutes and give your dog the care they deserve
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-background rounded-2xl p-8 h-full shadow-lg">
                  <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-text mb-3">{item.title}</h3>
                  <p className="text-text/70">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-text mb-6">
                Why Choose PawHealth?
              </h2>
              <p className="text-xl text-text/70 mb-8">
                Join thousands of pet parents who trust us with their dog's health
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-text/80">{benefit}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[500px]"
            >
              <Image
                src="/images/benefits.jpg"
                alt="Dog health benefits"
                fill
                className="object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
              Trusted by Dog Lovers Everywhere
            </h2>
            <p className="text-xl text-text/70 max-w-3xl mx-auto">
              See what our community has to say about their experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-secondary fill-secondary" />
                  ))}
                </div>
                <p className="text-text/80 mb-6 leading-relaxed">{testimonial.text}</p>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-secondary/20">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-text">{testimonial.name}</p>
                    <p className="text-sm text-text/60">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-text/70 max-w-3xl mx-auto">
              Everything you need to know about PawHealth
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold text-text mb-3">{faq.question}</h3>
                <p className="text-text/70 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Dog's Health?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join 50,000+ dog owners who are already using PawHealth to keep their furry friends healthy and happy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-lg hover:bg-white/90 transition-all duration-200 font-semibold shadow-xl"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold"
              >
                Contact Sales
              </Link>
            </div>
            <p className="text-white/70 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}