// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "My App",
  description: "Next.js App with Global Styles",
  icons: {
    icon: "../../public/cass2025.jpg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
