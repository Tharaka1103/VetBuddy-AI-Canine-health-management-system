"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, 
  X, 
  ChevronDown,
  Heart,
  LogIn,
  UserPlus,
  Phone,
  Mail
} from "lucide-react"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const navigation = [
    {
      name: "Features",
      href: "#",
      dropdown: [
        { name: "AI Health Analysis", href: "/features/ai-analysis", icon: "🧠" },
        { name: "Disease Identification", href: "/disease-identify", icon: "🔍" },
        { name: "Health Reports", href: "/report-master", icon: "📊" },
        { name: "Nutrition Planning", href: "/nutrition-buddy", icon: "🥗" },
      ]
    },
    {
      name: "Resources",
      href: "#",
      dropdown: [
        { name: "Common Diseases", href: "/common-diseases", icon: "📚" },
        { name: "Health Library", href: "/library", icon: "📖" },
        { name: "FAQs", href: "/faqs", icon: "❓" },
        { name: "Blog", href: "/blog", icon: "✍️" },
      ]
    },
    { name: "Pricing", href: "/pricing" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-transparent" 
            : "bg-transparent"
        }`}
      >
        {/* Main Navigation */}
        <nav className="container mx-auto px-4 py-4">
          <div className={`flex items-center justify-between rounded-full ${
          isScrolled 
            ? " bg-white" 
            : "bg-transparent text-white"
        }`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group ml-5">
              <span className="text-2xl font-bold text-black">
                WOOFY
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-black hover:text-primary font-medium transition-colors"
                  >
                    {item.name}
                    {item.dropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-primary/10 overflow-hidden"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors"
                            >
                              <span className="text-2xl">{subItem.icon}</span>
                              <span className="text-text font-medium">{subItem.name}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/signin"
                className="flex bg-lime-400/50 rounded-r-full items-center gap-2 px-4 py-2 text-black hover:text-black font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-background z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white fill-white" />
                    </div>
                    <span className="text-2xl font-bold text-text">
                      Paw<span className="text-primary">Health</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-text hover:text-primary transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.dropdown ? (
                        <>
                          <button
                            onClick={() => setActiveDropdown(
                              activeDropdown === item.name ? null : item.name
                            )}
                            className="w-full flex items-center justify-between px-4 py-3 text-text hover:bg-card rounded-lg transition-colors"
                          >
                            <span className="font-medium">{item.name}</span>
                            <ChevronDown className={`w-5 h-5 transition-transform ${
                              activeDropdown === item.name ? 'rotate-180' : ''
                            }`} />
                          </button>
                          <AnimatePresence>
                            {activeDropdown === item.name && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                {item.dropdown.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 ml-4 text-text/70 hover:text-primary hover:bg-card rounded-lg transition-colors"
                                  >
                                    <span className="text-xl">{subItem.icon}</span>
                                    <span>{subItem.name}</span>
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-3 text-text hover:bg-card rounded-lg transition-colors font-medium"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile CTA Buttons */}
                <div className="mt-8 space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 font-medium transition-colors w-full"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-all w-full shadow-lg"
                  >
                    <UserPlus className="w-5 h-5" />
                    Get Started Free
                  </Link>
                </div>

                {/* Mobile Contact Info */}
                <div className="mt-8 pt-8 border-t border-primary/10 space-y-3">
                  <a href="tel:+1234567890" className="flex items-center gap-3 text-text/70 hover:text-primary transition-colors">
                    <Phone className="w-5 h-5" />
                    <span>+1 (234) 567-890</span>
                  </a>
                  <a href="mailto:support@pawhealth.com" className="flex items-center gap-3 text-text/70 hover:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                    <span>support@pawhealth.com</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}