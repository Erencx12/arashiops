import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Meridian collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-24 px-6">
        <div className="max-w-[720px] mx-auto">
          <div className="mb-12">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
              Legal
            </p>
            <h1 className="text-[38px] font-bold tracking-[-0.03em] text-[#111111] mb-4">
              Privacy Policy
            </h1>
            <p className="text-[14px] text-[#9ca3af]">
              Last updated: January 1, 2025
            </p>
          </div>

          <div className="prose-section space-y-10">
            <Section title="Overview">
              <p>
                Meridian (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your
                personal information. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you visit our website or engage with our
                services.
              </p>
              <p>
                By using our website, you agree to the collection and use of information in
                accordance with this policy. We will not use or share your information with anyone
                except as described in this Privacy Policy.
              </p>
            </Section>

            <Section title="Information We Collect">
              <p>We collect information you provide directly to us, including:</p>
              <ul>
                <li>
                  <strong>Contact information</strong> — name, email address, phone number, company
                  name when you submit a form or request.
                </li>
                <li>
                  <strong>Business information</strong> — industry, team size, revenue range, and
                  goals when you complete our onboarding process.
                </li>
                <li>
                  <strong>Communications</strong> — any messages you send to us via contact forms or
                  email.
                </li>
              </ul>
              <p>We also automatically collect certain information when you visit our website:</p>
              <ul>
                <li>Log data (IP address, browser type, pages visited, time and date)</li>
                <li>Device information (hardware model, operating system, unique device identifiers)</li>
                <li>Usage data (how you interact with our website)</li>
              </ul>
            </Section>

            <Section title="How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, operate, and maintain our services</li>
                <li>Respond to your inquiries and fulfill your requests</li>
                <li>Send administrative information and updates</li>
                <li>Process meeting bookings and send confirmation emails</li>
                <li>Analyze and improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We do
                not use your information for automated decision-making or profiling.
              </p>
            </Section>

            <Section title="Data Retention">
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes
                outlined in this policy, unless a longer retention period is required by law. Lead
                and inquiry data is retained for up to 24 months from the date of last interaction.
              </p>
              <p>
                You may request deletion of your data at any time by contacting us at{" "}
                <a href="mailto:privacy@meridian.co" className="text-[#4f46e5] hover:underline">
                  privacy@meridian.co
                </a>
                .
              </p>
            </Section>

            <Section title="Cookies">
              <p>
                Our website uses essential cookies required for basic site functionality. We do not
                use third-party advertising cookies or tracking pixels. You can instruct your browser
                to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </Section>

            <Section title="Third-Party Services">
              <p>
                We may use trusted third-party services to support our operations (e.g., email
                delivery, analytics). These providers have access to your information only to
                perform specific tasks on our behalf and are obligated not to disclose or use it
                for any other purpose.
              </p>
            </Section>

            <Section title="Security">
              <p>
                The security of your personal information is important to us. We implement
                industry-standard technical and organizational measures to protect your data against
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                However, no method of transmission over the internet or electronic storage is 100%
                secure. While we strive to use commercially acceptable means to protect your
                personal information, we cannot guarantee its absolute security.
              </p>
            </Section>

            <Section title="Your Rights">
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict our processing of your information</li>
                <li>Data portability (receive your data in a machine-readable format)</li>
              </ul>
              <p>
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@meridian.co" className="text-[#4f46e5] hover:underline">
                  privacy@meridian.co
                </a>
                .
              </p>
            </Section>

            <Section title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
                We encourage you to review this Privacy Policy periodically.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please
                contact us at:
              </p>
              <address className="not-italic">
                <p className="font-medium text-[#111111]">Meridian</p>
                <p>
                  Email:{" "}
                  <a href="mailto:privacy@meridian.co" className="text-[#4f46e5] hover:underline">
                    privacy@meridian.co
                  </a>
                </p>
              </address>
            </Section>
          </div>

          <div className="mt-16 pt-8 border-t border-[#e5e7eb]">
            <Link
              href="/"
              className="text-[13.5px] text-[#6b7280] hover:text-[#111111] transition-colors"
            >
              ← Back to Meridian
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[18px] font-semibold text-[#111111] mb-4 tracking-tight">
        {title}
      </h2>
      <div className="space-y-3 text-[14.5px] text-[#374151] leading-[1.75] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:font-semibold [&_strong]:text-[#111111]">
        {children}
      </div>
    </section>
  );
}
