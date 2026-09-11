import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Josefin_Sans, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ui things - Streamline Design with Components",
  description: "Accelerate your workflow with highly adaptable, accessible and consistent components built for modern design systems.",
  icons: {
    icon: "/assets/logo.svg",
    shortcut: "/assets/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolageGrotesque.variable} ${plusJakartaSans.variable} ${josefinSans.variable} ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(window.scrollY>20){var s=document.createElement('style');s.id='nav-scrolled-css';s.textContent='header.landing-nav{background:rgba(0,0,0,.8);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.1);box-shadow:0 20px 25px -5px rgba(0,0,0,.5)}';document.head.appendChild(s);}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Josefin+Sans:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400..800&family=Inter:wght@400;500;600;700&family=Maven+Pro:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-black text-white selection:bg-[#4343D5] selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

