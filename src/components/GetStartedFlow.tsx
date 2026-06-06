"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Calendar, Clock } from "lucide-react";
import { LogoMark } from "@/components/Logo";

// ─── Schemas ────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Phone number is required"),
});

const step2Schema = z.object({
  website: z.string().url("Enter a valid URL").or(z.literal("")),
  industry: z.string().min(1, "Select an industry"),
  dealSize: z.string().min(1, "Select average deal size"),
  crm: z.string().min(1, "Select your CRM"),
});

const step3Schema = z.object({
  goals: z.array(z.string()).min(1, "Select at least one goal"),
});

const step4Schema = z.object({
  details: z.string().min(30, "Please tell us a bit more (at least 30 characters)"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;

const industries = [
  "B2B SaaS",
  "Professional Services",
  "E-Commerce",
  "Financial Services",
  "Healthcare",
  "Real Estate",
  "Consulting",
  "Marketing Agency",
  "Manufacturing",
  "Other",
];

const dealSizes = [
  "Under $1K",
  "$1K–$5K",
  "$5K–$20K",
  "$20K–$50K",
  "$50K–$100K",
  "$100K+",
];

const crmOptions = [
  "HubSpot",
  "Salesforce",
  "Pipedrive",
  "Close",
  "Zoho",
  "None",
  "Other",
];

const goals = [
  {
    id: "pipeline-building",
    title: "Pipeline Building",
    desc: "Build predictable outbound acquisition systems",
  },
  {
    id: "lead-qualification",
    title: "Lead Qualification",
    desc: "Qualify and route prospects automatically",
  },
  {
    id: "crm-infrastructure",
    title: "CRM Infrastructure",
    desc: "Automate CRM routing and deal tracking",
  },
  {
    id: "full-outbound-system",
    title: "Full Outbound System",
    desc: "End-to-end outbound revenue infrastructure",
  },
];

// Time slots for the scheduler
const timeSlots = [
  { time: "9:00 AM", available: true },
  { time: "10:00 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "1:00 PM", available: true },
  { time: "2:00 PM", available: true },
  { time: "3:00 PM", available: false },
  { time: "4:00 PM", available: true },
  { time: "5:00 PM", available: true },
];

function generateCalendarDays() {
  const today = new Date();
  const days = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(d);
    }
  }
  return days;
}

const calendarDays = generateCalendarDays();

// ─── Step indicators ─────────────────────────────────────────────────────────

const steps = [
  "Basic Info",
  "Business",
  "Goals",
  "Details",
  "Schedule",
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                i < current
                  ? "bg-[#111111] text-white"
                  : i === current
                  ? "bg-[#111111] text-white ring-4 ring-[#111111]/10"
                  : "bg-[#f3f4f6] text-[#9ca3af]"
              }`}
            >
              {i < current ? <Check size={12} /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${
                i <= current ? "text-[#111111]" : "text-[#9ca3af]"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-10 sm:w-14 mb-4 mx-1 transition-colors ${
                i < current ? "bg-[#111111]" : "bg-[#e5e7eb]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Slide variants ──────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
};

// ─── Form field components ────────────────────────────────────────────────────

function Field({
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
        <p className="mt-1 text-[12px] text-red-500">{error}</p>
      )}
    </div>
  );
}

function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 text-[14px] bg-white border rounded-md outline-none transition-colors ${
        error
          ? "border-red-300 focus:border-red-400"
          : "border-[#e5e7eb] focus:border-[#111111]"
      } placeholder:text-[#9ca3af]`}
    />
  );
}

function Select({
  options,
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: string[];
  error?: boolean;
}) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 text-[14px] bg-white border rounded-md outline-none transition-colors appearance-none cursor-pointer ${
        error
          ? "border-red-300 focus:border-red-400"
          : "border-[#e5e7eb] focus:border-[#111111]"
      } ${!props.value ? "text-[#9ca3af]" : "text-[#111111]"}`}
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GetStartedFlow() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data & Step4Data>>({});
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema), defaultValues: formData });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: formData });
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema), defaultValues: { goals: selectedGoals } });
  const form4 = useForm<Step4Data>({ resolver: zodResolver(step4Schema), defaultValues: formData });

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const handleStep1 = form1.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    goTo(1);
  });

  const handleStep2 = form2.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    goTo(2);
  });

  const handleStep3 = () => {
    if (selectedGoals.length === 0) return;
    setFormData((prev) => ({ ...prev, goals: selectedGoals }));
    goTo(3);
  };

  const handleStep4 = form4.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    goTo(4);
  });

  const handleConfirm = () => {
    if (!selectedDay || !selectedTime) return;
    setConfirmed(true);
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  if (confirmed) {
    return <ConfirmationScreen formData={formData} day={selectedDay!} time={selectedTime!} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[#e5e7eb] sticky top-0 bg-white z-10">
        <div className="max-w-[720px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <LogoMark size="sm" />
            <span className="text-[14px] font-semibold text-[#111111]">Arashi OPS</span>
          </Link>
          <StepIndicator current={step} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-16">
        <div className="w-full max-w-[520px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {step === 0 && (
                <StepOne form={form1} onSubmit={handleStep1} />
              )}
              {step === 1 && (
                <StepTwo form={form2} onSubmit={handleStep2} onBack={() => goTo(0)} />
              )}
              {step === 2 && (
                <StepThree
                  selectedGoals={selectedGoals}
                  onToggle={toggleGoal}
                  onNext={handleStep3}
                  onBack={() => goTo(1)}
                />
              )}
              {step === 3 && (
                <StepFour form={form4} onSubmit={handleStep4} onBack={() => goTo(2)} />
              )}
              {step === 4 && (
                <StepFive
                  selectedDay={selectedDay}
                  selectedTime={selectedTime}
                  onSelectDay={setSelectedDay}
                  onSelectTime={setSelectedTime}
                  onConfirm={handleConfirm}
                  onBack={() => goTo(3)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Basic Information ────────────────────────────────────────────────

function StepOne({ form, onSubmit }: { form: ReturnType<typeof useForm<Step1Data>>; onSubmit: () => void }) {
  const { register, formState: { errors } } = form;
  return (
    <div>
      <StepHeader
        step="Step 1 of 5"
        title="Let's start with the basics."
        description="Tell us who you are and how to reach you."
      />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name" error={errors.fullName?.message}>
            <Input {...register("fullName")} placeholder="Jane Smith" error={!!errors.fullName} />
          </Field>
          <Field label="Company Name" error={errors.companyName?.message}>
            <Input {...register("companyName")} placeholder="Acme Corp" error={!!errors.companyName} />
          </Field>
        </div>
        <Field label="Work Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" placeholder="jane@company.com" error={!!errors.email} />
        </Field>
        <Field label="Phone Number" error={errors.phone?.message}>
          <Input {...register("phone")} type="tel" placeholder="+1 (555) 000-0000" error={!!errors.phone} />
        </Field>
        <NavButtons onNext={onSubmit} hideBack />
      </form>
    </div>
  );
}

// ─── Step 2: Business Information ─────────────────────────────────────────────

function StepTwo({
  form,
  onSubmit,
  onBack,
}: {
  form: ReturnType<typeof useForm<Step2Data>>;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const { register, watch, setValue, formState: { errors } } = form;
  return (
    <div>
      <StepHeader
        step="Step 2 of 5"
        title="About your business."
        description="This helps us understand your context and where you are today."
      />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Website" error={errors.website?.message}>
          <Input {...register("website")} placeholder="https://yourcompany.com" error={!!errors.website} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Industry" error={errors.industry?.message}>
            <Select
              options={industries}
              value={watch("industry") || ""}
              onChange={(e) => setValue("industry", e.target.value)}
              error={!!errors.industry}
            />
          </Field>
          <Field label="Average Deal Size" error={errors.dealSize?.message}>
            <Select
              options={dealSizes}
              value={watch("dealSize") || ""}
              onChange={(e) => setValue("dealSize", e.target.value)}
              error={!!errors.dealSize}
            />
          </Field>
        </div>
        <Field label="Existing CRM" error={errors.crm?.message}>
          <Select
            options={crmOptions}
            value={watch("crm") || ""}
            onChange={(e) => setValue("crm", e.target.value)}
            error={!!errors.crm}
          />
        </Field>
        <NavButtons onNext={onSubmit} onBack={onBack} />
      </form>
    </div>
  );
}

// ─── Step 3: Goals ────────────────────────────────────────────────────────────

function StepThree({
  selectedGoals,
  onToggle,
  onNext,
  onBack,
}: {
  selectedGoals: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <StepHeader
        step="Step 3 of 5"
        title="What are you trying to achieve?"
        description="Select all that apply. We'll tailor our approach accordingly."
      />
      <div className="space-y-3 mb-8">
        {goals.map((goal) => {
          const selected = selectedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => onToggle(goal.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                selected
                  ? "border-[#111111] bg-[#fafafa]"
                  : "border-[#e5e7eb] hover:border-[#d1d5db]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                  selected ? "bg-[#111111] border-[#111111]" : "border-[#d1d5db]"
                }`}
              >
                {selected && <Check size={11} className="text-white" />}
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#111111]">{goal.title}</p>
                <p className="text-[12.5px] text-[#6b7280]">{goal.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
      {selectedGoals.length === 0 && (
        <p className="text-[12px] text-[#9ca3af] mb-4">Select at least one goal to continue.</p>
      )}
      <NavButtons
        onNext={onNext}
        onBack={onBack}
        nextDisabled={selectedGoals.length === 0}
      />
    </div>
  );
}

// ─── Step 4: Project Details ──────────────────────────────────────────────────

function StepFour({
  form,
  onSubmit,
  onBack,
}: {
  form: ReturnType<typeof useForm<Step4Data>>;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const { register, watch, formState: { errors } } = form;
  const val = watch("details") || "";
  return (
    <div>
      <StepHeader
        step="Step 4 of 5"
        title="Tell us about your business and goals."
        description="Be as specific as possible. The more context you give us, the better we can prepare."
      />
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <textarea
            {...register("details")}
            rows={7}
            placeholder="We're a B2B SaaS company targeting mid-market operations teams. Our average deal is $15K and we currently have no outbound motion — pipeline comes entirely from referrals. We want 30+ qualified meetings per month within 90 days..."
            className={`w-full px-3 py-3 text-[14px] bg-white border rounded-md outline-none transition-colors resize-none leading-relaxed ${
              errors.details
                ? "border-red-300 focus:border-red-400"
                : "border-[#e5e7eb] focus:border-[#111111]"
            } placeholder:text-[#9ca3af]`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.details ? (
              <p className="text-[12px] text-red-500">{errors.details.message}</p>
            ) : (
              <span />
            )}
            <p className="text-[11px] text-[#9ca3af]">{val.length} chars</p>
          </div>
        </div>
        <NavButtons onNext={onSubmit} onBack={onBack} />
      </form>
    </div>
  );
}

// ─── Step 5: Meeting Scheduler ────────────────────────────────────────────────

function StepFive({
  selectedDay,
  selectedTime,
  onSelectDay,
  onSelectTime,
  onConfirm,
  onBack,
}: {
  selectedDay: Date | null;
  selectedTime: string | null;
  onSelectDay: (d: Date) => void;
  onSelectTime: (t: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const fmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div>
      <StepHeader
        step="Step 5 of 5"
        title="Schedule your discovery call."
        description="45 minutes. No pitch, no agenda. Just a real conversation about your business."
      />

      <div className="mb-6 flex items-center gap-3 p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
        <div className="w-8 h-8 bg-[#111111] rounded-md flex items-center justify-center shrink-0">
          <Calendar size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-[#111111]">Discovery Call — 45 min</p>
          <p className="text-[12px] text-[#6b7280]">Google Meet · Times shown in your local timezone</p>
        </div>
      </div>

      {/* Day picker */}
      <div className="mb-5">
        <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide mb-2">
          Select a date
        </p>
        <div className="flex flex-wrap gap-2">
          {calendarDays.slice(0, 10).map((day) => {
            const isSelected = selectedDay?.toDateString() === day.toDateString();
            return (
              <button
                key={day.toDateString()}
                type="button"
                onClick={() => { onSelectDay(day); onSelectTime(""); }}
                className={`px-3 py-2 rounded-md border text-[12.5px] font-medium transition-all ${
                  isSelected
                    ? "border-[#111111] bg-[#111111] text-white"
                    : "border-[#e5e7eb] text-[#374151] hover:border-[#d1d5db] hover:bg-[#f9fafb]"
                }`}
              >
                {fmt.format(day)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time picker */}
      {selectedDay && (
        <div className="mb-8">
          <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide mb-2">
            Select a time
          </p>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => onSelectTime(slot.time)}
                className={`py-2 rounded-md border text-[12.5px] font-medium transition-all flex items-center justify-center gap-1 ${
                  !slot.available
                    ? "border-[#f3f4f6] text-[#d1d5db] cursor-not-allowed bg-[#fafafa]"
                    : selectedTime === slot.time
                    ? "border-[#111111] bg-[#111111] text-white"
                    : "border-[#e5e7eb] text-[#374151] hover:border-[#d1d5db]"
                }`}
              >
                {!slot.available ? (
                  <span className="line-through">{slot.time}</span>
                ) : (
                  <>
                    <Clock size={10} />
                    {slot.time}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDay && selectedTime && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
          <p className="text-[13px] font-medium text-emerald-800">
            {fmt.format(selectedDay)} at {selectedTime}
          </p>
          <p className="text-[12px] text-emerald-600 mt-0.5">
            A calendar invite will be sent to your email.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-medium text-[#6b7280] border border-[#e5e7eb] rounded-md hover:bg-[#f9fafb] transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!selectedDay || !selectedTime}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[14px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm Booking
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Confirmation Screen ──────────────────────────────────────────────────────

function ConfirmationScreen({
  formData,
  day,
  time,
}: {
  formData: Partial<Step1Data & Step2Data & Step3Data & Step4Data>;
  day: Date;
  time: string;
}) {
  const fmt = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-[480px] w-full text-center"
      >
        <div className="w-14 h-14 bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={22} className="text-white" />
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#111111] mb-3">
          You're all set, {formData.fullName?.split(" ")[0]}.
        </h1>
        <p className="text-[15px] text-[#6b7280] leading-relaxed mb-8">
          Your discovery call is confirmed. A calendar invite has been sent to{" "}
          <strong className="text-[#111111]">{formData.email}</strong>.
        </p>

        <div className="border border-[#e5e7eb] rounded-xl p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e5e7eb]">
            <div className="w-9 h-9 bg-[#f3f4f6] rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-[#374151]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#111111]">Discovery Call — 45 min</p>
              <p className="text-[12px] text-[#9ca3af]">Google Meet</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-[#6b7280]">Date</span>
              <span className="text-[12.5px] font-medium text-[#111111]">{fmt.format(day)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-[#6b7280]">Time</span>
              <span className="text-[12.5px] font-medium text-[#111111]">{time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-[#6b7280]">With</span>
              <span className="text-[12.5px] font-medium text-[#111111]">Arashi OPS Strategy Team</span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 mb-8 text-left bg-[#fafafa] border border-[#e5e7eb] rounded-xl p-5">
          <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-widest mb-3">
            What to expect
          </p>
          {[
            "We'll review your submission before the call",
            "Come prepared to discuss your current bottlenecks",
            "We'll share a revenue system roadmap specific to you",
            "No pressure. We'll only move forward if there's a clear fit.",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-[13px] text-[#374151]">{item}</span>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[14px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          Back to Arashi OPS
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StepHeader({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-2">
        {step}
      </p>
      <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#111111] mb-2 leading-tight">
        {title}
      </h1>
      <p className="text-[14px] text-[#6b7280] leading-relaxed">{description}</p>
    </div>
  );
}

function NavButtons({
  onNext,
  onBack,
  hideBack = false,
  nextDisabled = false,
  nextLabel = "Continue",
}: {
  onNext?: () => void;
  onBack?: () => void;
  hideBack?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 mt-6">
      {!hideBack && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-medium text-[#6b7280] border border-[#e5e7eb] rounded-md hover:bg-[#f9fafb] transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </button>
      )}
      <button
        type={onNext ? "button" : "submit"}
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[14px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {nextLabel}
        <ArrowRight size={13} />
      </button>
    </div>
  );
}
