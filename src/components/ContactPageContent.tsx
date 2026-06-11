"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Clock, Mail, MessageSquare } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(2, "Your name is required"),
  email: z.string().email("Enter a valid email address"),
  company: z.string().min(1, "Company name is required"),
  message: z.string().min(20, "Please include a bit more detail (20+ characters)"),
});

type FormData = z.infer<typeof schema>;

const faqs = [
  { q: "What's the fastest way to get started?", href: "/get-started" },
  { q: "How does pricing work?", href: "/#pricing" },
  { q: "What industries do you work with?", href: "/#faq" },
  { q: "How long until we see results?", href: "/#faq" },
];

export function ContactPageContent() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
  };

  return (
    <main className="pt-28 pb-24 px-6 min-h-screen">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid lg:grid-cols-[420px_1fr] gap-20">

          {/* Left: info panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-4">
              Contact
            </p>
            <h1 className="text-[38px] font-bold tracking-[-0.03em] text-[#111111] leading-[1.1] mb-5">
              Let&apos;s talk about
              <br />
              your business.
            </h1>
            <p className="text-[16px] text-[#6b7280] leading-relaxed mb-10 max-w-[360px]">
              Fill in the form and we&apos;ll get back to you within one business day.
              For a structured discovery process,{" "}
              <Link
                href="/get-started"
                className="text-[#111111] underline underline-offset-2 hover:no-underline transition-all"
              >
                use Get Started instead
              </Link>
              .
            </p>

            {/* Contact details */}
            <div className="space-y-4 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f3f4f6] rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-[#6b7280]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#9ca3af] mb-0.5">Email</p>
                  <a
                    href="mailto:hello@meridian.co"
                    className="text-[14px] font-medium text-[#111111] hover:text-[#4f46e5] transition-colors"
                  >
                    hello@meridian.co
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f3f4f6] rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-[#6b7280]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#9ca3af] mb-0.5">Response time</p>
                  <p className="text-[14px] font-medium text-[#111111]">
                    Within 1 business day
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f3f4f6] rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare size={14} className="text-[#6b7280]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#9ca3af] mb-0.5">For structured intake</p>
                  <Link
                    href="/get-started"
                    className="text-[14px] font-medium text-[#4f46e5] hover:underline underline-offset-2"
                  >
                    Use the onboarding form →
                  </Link>
                </div>
              </div>
            </div>

            {/* FAQ shortcuts */}
            <div className="border-t border-[#e5e7eb] pt-8">
              <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-4">
                Common questions
              </p>
              <ul className="space-y-2">
                {faqs.map((faq) => (
                  <li key={faq.q}>
                    <Link
                      href={faq.href}
                      className="group flex items-center justify-between py-2 text-[13.5px] text-[#374151] hover:text-[#111111] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ArrowRight
                        size={13}
                        className="text-[#9ca3af] group-hover:text-[#6b7280] transition-colors shrink-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="max-w-[560px]"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="h-full flex flex-col items-start justify-center py-16"
                >
                  <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mb-6">
                    <Check size={20} className="text-white" />
                  </div>
                  <h2 className="text-[28px] font-bold tracking-tight text-[#111111] mb-3">
                    Message received.
                  </h2>
                  <p className="text-[15px] text-[#6b7280] leading-relaxed mb-8 max-w-[400px]">
                    We&apos;ll review your message and respond within one business day.
                    For a faster path, complete our structured onboarding.
                  </p>
                  <Link
                    href="/get-started"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[14px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
                  >
                    Start Onboarding
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField label="Full Name" error={errors.fullName?.message}>
                      <input
                        {...register("fullName")}
                        placeholder="Jane Smith"
                        className={fieldClass(!!errors.fullName)}
                      />
                    </FormField>
                    <FormField label="Work Email" error={errors.email?.message}>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="jane@company.com"
                        className={fieldClass(!!errors.email)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Company" error={errors.company?.message}>
                    <input
                      {...register("company")}
                      placeholder="Acme Corp"
                      className={fieldClass(!!errors.company)}
                    />
                  </FormField>

                  <FormField label="Message" error={errors.message?.message}>
                    <textarea
                      {...register("message")}
                      rows={6}
                      placeholder="Tell us about your business and what you're trying to solve..."
                      className={`${fieldClass(!!errors.message)} resize-none leading-relaxed`}
                    />
                  </FormField>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#111111] text-white text-[14px] font-medium rounded-md hover:bg-[#1a1a1a] active:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  <p className="text-[12px] text-[#9ca3af] text-center">
                    Prefer structured onboarding?{" "}
                    <Link
                      href="/get-started"
                      className="text-[#6b7280] underline underline-offset-2 hover:text-[#111111] transition-colors"
                    >
                      Use Get Started
                    </Link>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-[12px] text-red-500 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}

function fieldClass(hasError: boolean) {
  return `w-full px-3 py-2.5 text-[14px] bg-white border rounded-md outline-none transition-colors duration-150 placeholder:text-[#9ca3af] ${
    hasError
      ? "border-red-300 focus:border-red-400"
      : "border-[#e5e7eb] focus:border-[#111111]"
  }`;
}
