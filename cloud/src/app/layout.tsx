import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuchu Nav API",
  description: "Navbar link API for Webflow Code Components",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 24 }}>{children}</body>
    </html>
  );
}
