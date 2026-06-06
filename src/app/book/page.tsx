import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookACallContent } from "@/components/BookACallContent";

export const metadata: Metadata = {
  title: "Book a Call",
  description:
    "Schedule a 45-minute discovery call with Arashi OPS. No pitch deck. A focused diagnostic conversation about your business and growth goals.",
};

export default function BookPage() {
  return (
    <>
      <Navbar />
      <BookACallContent />
      <Footer />
    </>
  );
}
