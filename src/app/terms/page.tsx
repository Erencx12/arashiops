import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing use of Meridian services.",
};

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-[14px] text-[#9ca3af]">Last updated: January 1, 2025</p>
          </div>

          <div className="space-y-10">
            <Section title="Acceptance of Terms">
              <p>
                By accessing or using the Meridian website or services, you agree to be bound by
                these Terms of Service. If you do not agree to these terms, please do not use our
                website or services.
              </p>
              <p>
                These terms apply to all visitors, users, and others who access or use our
                services. We reserve the right to update these terms at any time, with changes
                effective upon posting.
              </p>
            </Section>

            <Section title="Services">
              <p>
                Meridian provides revenue operations consulting and implementation services to
                business clients. Our services include but are not limited to lead generation
                systems, sales infrastructure design, content operations, and CRM implementation.
              </p>
              <p>
                Specific services, deliverables, timelines, and pricing are governed by separate
                engagement agreements or statements of work entered into between Meridian and each
                client.
              </p>
            </Section>

            <Section title="Use of Our Website">
              <p>You agree not to:</p>
              <ul>
                <li>Use our website for any unlawful purpose or in violation of these terms</li>
                <li>
                  Attempt to gain unauthorized access to any portion of our website or systems
                </li>
                <li>Transmit any material that is harmful, offensive, or disruptive</li>
                <li>
                  Use automated tools to scrape, crawl, or extract data from our website without
                  permission
                </li>
                <li>Impersonate any person or entity</li>
              </ul>
            </Section>

            <Section title="Intellectual Property">
              <p>
                All content on this website — including text, graphics, logos, and software — is
                the property of Meridian or its content suppliers and protected by applicable
                intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works, publicly display,
                or exploit any content from this website without prior written permission from
                Meridian.
              </p>
            </Section>

            <Section title="Confidentiality">
              <p>
                Any information you provide to Meridian in the course of exploring or engaging our
                services is treated as confidential and will not be shared with third parties without
                your consent, except as required by law or to provide the services you have
                requested.
              </p>
            </Section>

            <Section title="Disclaimers">
              <p>
                Our website and services are provided &ldquo;as is&rdquo; without warranties of any kind,
                either express or implied. Meridian does not warrant that our services will meet
                your specific requirements, be uninterrupted, or be error-free.
              </p>
              <p>
                While we provide case studies and performance data from past engagements, past
                results do not guarantee or predict future outcomes. Results will vary based on
                your business, market conditions, and other factors.
              </p>
            </Section>

            <Section title="Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law, Meridian shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages arising from
                your use of our website or services, even if we have been advised of the possibility
                of such damages.
              </p>
            </Section>

            <Section title="Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                applicable jurisdiction, without regard to its conflict of law provisions. Any
                disputes arising under these terms shall be resolved through binding arbitration
                or in the courts of the applicable jurisdiction.
              </p>
            </Section>

            <Section title="Termination">
              <p>
                We reserve the right to terminate or suspend access to our website and services,
                without prior notice or liability, for any reason, including breach of these Terms.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about these Terms should be directed to:
              </p>
              <address className="not-italic">
                <p className="font-medium text-[#111111]">Meridian</p>
                <p>
                  Email:{" "}
                  <a href="mailto:legal@meridian.co" className="text-[#4f46e5] hover:underline">
                    legal@meridian.co
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
