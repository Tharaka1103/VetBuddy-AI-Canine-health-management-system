"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { 
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Send,
  ArrowRight,
  Shield,
  Award,
  Clock
} from "lucide-react"
import { useState } from "react"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription logic here
    setIsSubscribed(true)
    setTimeout(() => {
      setEmail("")
      setIsSubscribed(false)
    }, 3000)
  }

  const footerLinks = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Disease Identification", href: "/disease-identify" },
      { name: "Health Reports", href: "/report-master" },
      { name: "Nutrition Planning", href: "/nutrition-buddy" },
      { name: "Pricing", href: "/pricing" },
      { name: "Mobile App", href: "/app" },
    ],
    resources: [
      { name: "Common Diseases", href: "/common-diseases" },
      { name: "Health Library", href: "/library" },
      { name: "Blog", href: "/blog" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "FAQs", href: "/faqs" },
      { name: "Help Center", href: "/help" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press Kit", href: "/press" },
      { name: "Partners", href: "/partners" },
      { name: "Contact", href: "/contact" },
      { name: "Veterinarians", href: "/vets" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
      { name: "Disclaimer", href: "/disclaimer" },
      { name: "Refund Policy", href: "/refund" },
    ]
  }

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com", color: "hover:text-[#1877F2]" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:text-[#1DA1F2]" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com", color: "hover:text-[#E4405F]" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com", color: "hover:text-[#0A66C2]" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com", color: "hover:text-[#FF0000]" },
  ]

  const trustBadges = [
    { icon: Shield, text: "HIPAA Compliant" },
    { icon: Award, text: "Vet Approved" },
    { icon: Clock, text: "24/7 Support" },
  ]

  return (
    <footer className="bg-card border-t border-primary/10">

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8  backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[8vw] font-bold text-text">
                WOOFY
              </span>
            </Link>
            <p className="text-text/70 mb-3 leading-relaxed">
              Your trusted partner in canine health. Powered by AI to help you keep your furry friend healthy, happy, and thriving.
            </p>


            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-background rounded-lg flex items-center justify-center text-text/60 ${social.color} transition-all hover:scale-110`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-bold text-text mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-text/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-bold text-text mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-text/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-bold text-text mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-text/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-bold text-text mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-text/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text/60 mb-1">Call Us</p>
                <a href="tel:+1234567890" className="text-text font-semibold hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text/60 mb-1">Email Us</p>
                <a href="mailto:support@pawhealth.com" className="text-text font-semibold hover:text-primary transition-colors">
                  support@pawhealth.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text/60 mb-1">Visit Us</p>
                <p className="text-text font-semibold">
                  123 Pet Care St, San Francisco, CA 94102
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-text/60 text-sm text-center md:text-left">
              © {new Date().getFullYear()} PawHealth. All rights reserved. Made with{" "}
              <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> for dogs everywhere.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/sitemap" className="text-text/60 hover:text-primary text-sm transition-colors">
                Sitemap
              </Link>
              <Link href="/accessibility" className="text-text/60 hover:text-primary text-sm transition-colors">
                Accessibility
              </Link>
              <div className="flex items-center gap-2">
                <a href="https://www.payhere.lk" target="_blank"><img src="https://www.payhere.lk/downloads/images/payhere_short_banner.png" alt="PayHere" width="250"/></a>

              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}