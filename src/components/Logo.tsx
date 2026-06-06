import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizes = {
  sm: { container: "w-5 h-5 rounded-[3px]", svg: 10, text: "text-[13px]", gap: "gap-1.5" },
  md: { container: "w-6 h-6 rounded-[4px]", svg: 12, text: "text-[15px]", gap: "gap-2" },
  lg: { container: "w-8 h-8 rounded-[5px]", svg: 16, text: "text-[18px]", gap: "gap-2.5" },
};

export function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = sizes[size];
  return (
    <div
      className={`${s.container} bg-[#111111] flex items-center justify-center shrink-0`}
    >
      <svg
        width={s.svg}
        height={s.svg}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        {/* Meridian mark: geometric peak — represents apex, noon, summit */}
        <path
          d="M3 12L8 4L13 12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="5.5"
          y1="9"
          x2="10.5"
          y2="9"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function Logo({ size = "md", href = "/", className = "" }: LogoProps) {
  const s = sizes[size];
  return (
    <Link
      href={href}
      className={`inline-flex items-center ${s.gap} group ${className}`}
      aria-label="Meridian — Home"
    >
      <LogoMark size={size} />
      <span
        className={`${s.text} font-semibold tracking-tight text-[#111111] group-hover:text-[#111111] transition-colors`}
      >
        Meridian
      </span>
    </Link>
  );
}
