import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Icons } from "@/components/icons";
import { Toaster } from "@/components/ui/sonner";
import { ProgressBar } from "@/components/progress-bar";
import { ThemeProvider } from "@/components/theme-provider";
import { host, site } from "@/lib/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(host),
  applicationName: site.name,
  title: {
    default: site.name,
    template: `%s - ${site.name}`,
  },
  description: site.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: site.name,
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: false,
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: {
      default: site.name,
      template: `%s - ${site.name}`,
    },
    description: site.description,
  },
};
export const viewport: Viewport = {
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta
          name="theme-color"
          content="#101214"
          media="(prefers-color-scheme: dark)"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground">
        <main className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange
            themes={["light", "dark", "discord-dark"]}
          >
            <ProgressBar className="fixed top-0 z-[100] h-1 bg-primary">
              {children}
            </ProgressBar>
            <Toaster
              closeButton
              icons={{
                success: (
                  <Icons.circleDashedCheck className="size-5 text-[#089445] dark:text-[#32d46c]" />
                ),
                info: <Icons.infoCircle className="size-5 text-[#3498d9]" />,
                warning: (
                  <Icons.alertTriangle className="size-5 text-[#f0c100]" />
                ),
                error: (
                  <Icons.exclamationCircle className="size-5 text-[#da1415]" />
                ),
              }}
            />
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
}
