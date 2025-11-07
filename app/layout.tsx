"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { usePathname } from "next/navigation"
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Hide header and footer on auth pages
  const isAuthPage = pathname === "/signin" || pathname === "/signup"

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            {!isAuthPage && <Header />}
            <main >
              {children}
            </main>
            {!isAuthPage && <Footer />}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}