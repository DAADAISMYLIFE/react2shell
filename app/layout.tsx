export const metadata = {
  title: "NexTech Store",
  description: "Premium Tech & Electronics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', sans-serif", background: "#0f0f0f", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}
