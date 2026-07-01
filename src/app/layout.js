import { Cairo } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LanguageProvider } from "../context/LanguageContext";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "The Kitchen Company | المطابخ الفاخرة",
  description: "نصنع قلب المنزل.. بجودة لا تقبل المساومة. نحن وجهتك المتخصصة في تصميم وتصنيع المطابخ الكلاسيك، المودرن، والنيو كلاسيك.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body style={{ fontFamily: "var(--font-cairo), sans-serif" }}>
        <LanguageProvider>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 80px)' }}>
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}


