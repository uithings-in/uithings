import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Josefin_Sans, Inter, Maven_Pro } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import type { User } from "../lib/types";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  variable: "--font-maven",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ui things - Streamline Design with Components",
  description: "Accelerate your workflow with highly adaptable, accessible and consistent components built for modern design systems.",
  icons: {
    icon: "/assets/icon.svg",
    shortcut: "/assets/icon.svg",
    apple: "/assets/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const authUserCookie = cookieStore.get("authUser")?.value;
  let initialUser: User | null = null;
  if (authUserCookie) {
    try {
      initialUser = JSON.parse(decodeURIComponent(authUserCookie));
    } catch {}
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolageGrotesque.variable} ${plusJakartaSans.variable} ${josefinSans.variable} ${inter.variable} ${mavenPro.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var theme = localStorage.getItem('theme');
                var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.backgroundColor = '#000000';
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.backgroundColor = '#FAFAFB';
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch(e){}
            })();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[#FAFAFB] dark:bg-black text-slate-900 dark:text-white selection:bg-[#4343D5] selection:text-white">
        <Providers initialUser={initialUser}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

