import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مركز المسار المهني | كلية الحقوق، كليات الأصالة",
  description: "مركز مهني متكامل لجامعتك، يرافق الطالب من أول سنة حتى بعد التخرج (نموذج تجريبي)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" >
      <body className="min-h-screen bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
