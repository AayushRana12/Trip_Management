import "@/app/globals.css";
import "@/assets/styles/navbar.css";
import "@/assets/styles/footer.css";
import "@/assets/styles/card.css";
import "@/assets/styles/packages.css";
import "@/assets/styles/auth.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/Chatbot";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}