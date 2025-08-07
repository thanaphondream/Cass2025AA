import "./globals.css";

export const metadata = {
  title: "My App",
  description: "Next.js App with Global Styles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
