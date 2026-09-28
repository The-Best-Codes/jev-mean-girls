import type { Metadata, Viewport } from "next";
import { DM_Sans, Shrikhand } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const shrikhand = Shrikhand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-shrikhand",
});

export const metadata: Metadata = {
  title: "Which Mean Girl Are You?",
  description:
    "Type something. We classify which Mean Girl you are, live, and pull her out of the pile.",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffd1e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${shrikhand.variable} bg-background`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
