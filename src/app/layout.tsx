import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings } from "@/lib/wp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    return {
      title: {
        default: settings.generalSettingsTitle,
        template: `%s | ${settings.generalSettingsTitle}`,
      },
      description: settings.generalSettingsDescription,
      metadataBase: new URL(
        settings.generalSettingsUrl || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"
      ),
    };
  } catch {
    return {
      title: "My Site",
      description: "Powered by WordPress and Next.js",
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased flex flex-col">
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
