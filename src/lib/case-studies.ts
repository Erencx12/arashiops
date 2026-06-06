export type CaseStudy = {
  slug: string;
  company: string;
  industry: string;
  category: string;
  period: string;
  tagline: string;
  heroMetric: { value: string; label: string };
  summary: string;
  challenge: {
    overview: string;
    bullets: string[];
  };
  strategy: {
    overview: string;
    phases: { name: string; detail: string }[];
  };
  execution: {
    overview: string;
    steps: { week: string; milestone: string }[];
  };
  results: {
    overview: string;
  };
  metrics: {
    label: string;
    before: string;
    after: string;
    note?: string;
  }[];
  lessons: {
    title: string;
    body: string;
  }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "revenue-intelligence-platform",
    company: "Revenue Intelligence Platform",
    industry: "B2B SaaS",
    category: "Series A · Revenue Intelligence",
    period: "90 days",
    tagline:
      "From founder-dependent pipeline to 94 qualified meetings per month. In 90 days.",
    heroMetric: { value: "94", label: "Qualified meetings / month" },
    summary:
      "This Series A SaaS company had product-market fit and a capable team but no repeatable way to fill the pipeline. The CEO was closing deals entirely from his personal network. Meridian built the outbound system from scratch: research, copy, tooling, automation. What had been invisible and unpredictable became a measurable growth engine.",
    challenge: {
      overview:
        "After raising their Series A, the company had a strong product and a handful of enterprise design-partners. What they didn't have was an outbound motion. The founding team was spending 70% of sales time on inbound demos that rarely converted, while competitors were reaching the same buyers first. The core problem was structural: there was no system.",
      bullets: [
        "Pipeline was entirely CEO-dependent. Sales stopped the moment the founder stopped selling.",
        "12 qualified meetings per month was the ceiling, driven by referrals and conference networking",
        "No ICP definition. The sales team was taking meetings with anyone who'd respond.",
        "CRM had 400+ stale contacts, no lead scoring, and no activity tracking",
        "Sales cycle averaged 92 days because qualification was happening too late in the process",
      ],
    },
    strategy: {
      overview:
        "Before touching outbound tooling, we spent two weeks in diagnostic mode. We interviewed six existing customers, mapped the exact trigger events that caused them to buy, and built a tight ICP profile around three distinct buyer segments. The strategy was precision over volume: fewer touches, to the right people, with the right message.",
      phases: [
        {
          name: "Phase 1: Intelligence",
          detail:
            "Two-week ICP definition sprint. Customer interviews, competitive win/loss analysis, and buying trigger mapping. Output: a 12-page ICP playbook and three persona profiles.",
        },
        {
          name: "Phase 2: Infrastructure",
          detail:
            "HubSpot rebuilt from scratch with custom deal stages, a lead scoring model, and automated activity logging. Set up Clay for data enrichment, Apollo for sequencing, and Slack alerts for hot leads.",
        },
        {
          name: "Phase 3: Activation",
          detail:
            "Launched three outbound campaigns simultaneously: CFO-direct email, LinkedIn decision-maker outreach, and a referral incentive programme. Each campaign had custom copy, 7-touch sequences, and A/B tested subject lines.",
        },
      ],
    },
    execution: {
      overview:
        "Deployment ran across 8 weeks with weekly performance check-ins. We held a campaign review in week 4 to reallocate budget away from LinkedIn (underperforming) toward email (outperforming 3x). By week 6, the system was running with minimal manual oversight.",
      steps: [
        {
          week: "Weeks 1–2",
          milestone: "ICP definition, customer interview analysis, persona playbook delivered",
        },
        {
          week: "Weeks 3–4",
          milestone: "HubSpot rebuild, CRM data hygiene, tooling stack deployed",
        },
        {
          week: "Weeks 5–6",
          milestone: "All three campaigns live, first qualified leads entering pipeline",
        },
        {
          week: "Weeks 7–8",
          milestone: "Campaign optimisation, sequence rewrite for top performer, handoff documentation",
        },
        {
          week: "Month 3",
          milestone: "Full operating rhythm. 94 qualified meetings per month, pipeline running on its own.",
        },
      ],
    },
    results: {
      overview:
        "By month three, the client had a fully operational outbound system running without founder involvement. Pipeline was visible, tracked, and predictable. The CRO runs a weekly pipeline review using data that didn't exist four months prior. The system has continued running without us. That was the goal from the start.",
    },
    metrics: [
      { label: "Qualified meetings / month", before: "12", after: "94" },
      { label: "Pipeline value", before: "$180K", after: "$1.4M" },
      { label: "Close rate", before: "8%", after: "23%" },
      { label: "Leads processed / month", before: "38", after: "312" },
      { label: "Sales cycle (days)", before: "92", after: "47" },
      { label: "CEO time on sales", before: "40h/wk", after: "6h/wk" },
    ],
    lessons: [
      {
        title: "ICP clarity precedes everything.",
        body: "The most impactful week of the engagement was week one: defining who to target with surgical precision. Without it, automation just accelerates failure. Most companies want to skip this step. We never do.",
      },
      {
        title: "Sales cycles shorten when qualification happens at entry.",
        body: "By filtering leads at the top of the funnel using a scoring model, the average deal cycle dropped from 92 to 47 days. Fewer bad-fit prospects in the pipe means reps spend time on deals that can actually close.",
      },
      {
        title: "Systems outlast campaigns.",
        body: "A campaign ends when the budget runs out. A system runs indefinitely. The goal was never to generate leads for 90 days. It was to build the infrastructure that generates leads without us.",
      },
    ],
  },

  {
    slug: "management-consulting-firm",
    company: "Management Consulting Firm",
    industry: "Professional Services",
    category: "Management Consulting",
    period: "6 months",
    tagline:
      "Replaced 30 hours of manual weekly sales work with automated infrastructure. Revenue 3.6× in 6 months.",
    heroMetric: { value: "3.6×", label: "Revenue in 6 months" },
    summary:
      "This firm's senior consultants were spending 15 hours each per week on prospecting, follow-up, and CRM maintenance. The firm had no automation, no content engine, and no way to scale without hiring. Meridian rebuilt the entire sales infrastructure, stripping out the manual overhead and replacing it with systems that ran around the clock.",
    challenge: {
      overview:
        "The firm had built a respected consulting practice over seven years. Their client outcomes were exceptional. Their growth was entirely dependent on the personal networks of two senior partners, and those networks were finite. Every new engagement required one of them to be directly involved in selling. The team was burning out.",
      bullets: [
        "Senior partners each spending 15+ hours per week on manual outreach and follow-up",
        "No CRM. Deal tracking lived in a shared spreadsheet with 800+ rows.",
        "Zero content presence. No thought leadership, no LinkedIn, no email list.",
        "Average deal size declining as the team took smaller work to fill the calendar",
        "Two partnership opportunities missed in 12 months because follow-up fell through the cracks",
      ],
    },
    strategy: {
      overview:
        "The diagnosis was clear: the business had a capacity problem disguised as a growth problem. Adding more salespeople would have replicated the manual process at higher cost. Instead, we designed a system that front-loaded qualification, automated follow-up, and separated the prospecting work from the partners' calendars.",
      phases: [
        {
          name: "Phase 1: Audit & Architecture",
          detail:
            "Full audit of existing pipeline, win/loss analysis, and identification of the three highest-value buyer profiles. Designed a qualification-first system that filtered leads before any human contact.",
        },
        {
          name: "Phase 2: Infrastructure Build",
          detail:
            "HubSpot implementation, email sequences for all three buyer personas, LinkedIn automation for the partners' profiles, and a content calendar delivering two thought-leadership pieces per week.",
        },
        {
          name: "Phase 3: Content Engine",
          detail:
            "Launched a systematic content programme across LinkedIn and email. Each piece was designed to drive inbound enquiries from pre-qualified buyers, reducing the need for cold outreach.",
        },
      ],
    },
    execution: {
      overview:
        "The most important early win was converting the 800-row spreadsheet into a structured HubSpot pipeline in week two. Partners could see, for the first time, exactly where every deal stood. This alone changed how they managed their week and removed two hours of daily confusion.",
      steps: [
        {
          week: "Month 1",
          milestone: "CRM migration, pipeline architecture, first email sequences drafted and approved",
        },
        {
          week: "Month 2",
          milestone: "All sequences live, LinkedIn programme active, first inbound enquiries from content",
        },
        {
          week: "Month 3",
          milestone:
            "Follow-up automation fully operational, partner hours on sales reduced from 30hr/week to 8hr/week",
        },
        {
          week: "Month 4–5",
          milestone: "Content programme driving consistent inbound, average deal size increased 133%",
        },
        {
          week: "Month 6",
          milestone: "Revenue at 3.6× baseline, system fully self-managing with monthly review cadence",
        },
      ],
    },
    results: {
      overview:
        "Six months in, the firm's senior partners work eight hours per week on business development instead of thirty. The firm is receiving inbound enquiries from prospects who found them through content. That had never happened in the company's seven-year history. Monthly revenue tripled without a single additional hire.",
    },
    metrics: [
      { label: "Partner hours on BD / week", before: "30h", after: "8h" },
      { label: "Monthly revenue", before: "$85K", after: "$310K" },
      { label: "Average deal size", before: "$12K", after: "$28K" },
      { label: "Weekly outreach volume", before: "60", after: "420" },
      { label: "Inbound leads / month", before: "0", after: "18" },
      { label: "Lead response rate", before: "4%", after: "18%" },
    ],
    lessons: [
      {
        title: "Manual effort is not a growth strategy.",
        body: "Talented people doing repetitive tasks is the most expensive way to run a business. When partners are spending their best hours on data entry and follow-up reminders, the ceiling is low. Systems create leverage.",
      },
      {
        title: "Content is the highest-ROI activity for professional services.",
        body: "Thought leadership content generated 18 inbound leads per month within four months, up from zero. These leads arrived pre-qualified and with higher intent than anything cold outreach produced. The cost per lead was a fraction of outbound.",
      },
      {
        title: "Visibility changes behaviour.",
        body: "When the partners could see their pipeline in real time for the first time, they made better decisions. The CRM didn't just organise data. It changed how they prioritised their week. Clarity is a growth lever.",
      },
    ],
  },

  {
    slug: "dtc-consumer-brand",
    company: "DTC Consumer Brand",
    industry: "E-Commerce",
    category: "DTC Consumer Brand",
    period: "4 months",
    tagline:
      "CAC reduced from $320 to $84 by replacing paid acquisition with an owned content and email infrastructure.",
    heroMetric: { value: "$84", label: "Customer acquisition cost" },
    summary:
      "This brand had grown to $2M in annual revenue entirely on paid social. When iOS privacy changes and rising CPMs made their unit economics unsustainable, they needed a new customer acquisition strategy built on owned assets. Meridian built the content and email infrastructure that shifted their growth from rented to owned.",
    challenge: {
      overview:
        "The brand's customer acquisition had been a single-channel bet on Facebook and Instagram ads since launch. It worked until it didn't. By mid-2024, rising CPMs had pushed CAC above $320, compressing margins to the point where growth was becoming unprofitable. The brand had no email list worth speaking of, no content presence, and no loyalty programme.",
      bullets: [
        "Customer acquisition cost of $320, up from $95 eighteen months prior",
        "Email list of 1,200, mostly inactive with no segmentation or automation",
        "Zero organic search presence. All traffic was paid or direct.",
        "No referral mechanism despite a 68% repeat purchase rate",
        "Content production: 2 posts per month, ad-hoc, no strategy",
      ],
    },
    strategy: {
      overview:
        "The strategy was to rebuild acquisition from the bottom up around owned assets: email, content, and referral. Rather than competing on paid channels with escalating budgets, we designed a system that compounded over time. The goal was a self-reinforcing loop: content builds audience → audience builds email list → email list drives sales → customers become advocates.",
      phases: [
        {
          name: "Phase 1: Email Infrastructure",
          detail:
            "Built a Klaviyo system from scratch with welcome series, abandonment flows, post-purchase nurture, and VIP segmentation. Rebuilt the sign-up incentive to convert at three times the previous rate.",
        },
        {
          name: "Phase 2: Content Operating System",
          detail:
            "Designed and launched a content machine producing 18 pieces per month across LinkedIn, email, and SEO. Each piece aligned to a buyer journey stage and linked to a trackable conversion goal.",
        },
        {
          name: "Phase 3: Referral Engine",
          detail:
            "Launched a structured referral programme leveraging the 68% repeat buyer base. Integrated with Klaviyo post-purchase flows. Within 60 days, referral became the second-largest acquisition channel.",
        },
      ],
    },
    execution: {
      overview:
        "The first month was entirely backend work. No content visible to customers. We rebuilt email before we wrote a word of content. This is counter-intuitive but critical: traffic without a capture and nurture mechanism is wasted. By month two, the email list was growing at 400 subscribers per week.",
      steps: [
        {
          week: "Month 1",
          milestone:
            "Klaviyo rebuild, welcome and abandonment flows live, new sign-up incentive deployed",
        },
        {
          week: "Month 2",
          milestone:
            "Content programme live (18/mo), email list growing 400/week, referral programme soft-launched",
        },
        {
          week: "Month 3",
          milestone:
            "Referral 2nd-largest acquisition channel, organic search traffic +180%, email revenue 28% of total",
        },
        {
          week: "Month 4",
          milestone:
            "CAC at $84 blended, paid spend reduced by 40% while maintaining revenue growth",
        },
      ],
    },
    results: {
      overview:
        "Four months after starting, the brand's blended CAC had dropped from $320 to $84. Email had become a primary revenue channel generating 28% of monthly sales. The referral programme was responsible for 22% of new customers. The business was no longer dependent on paid ads. For the first time in its history.",
    },
    metrics: [
      { label: "Customer acquisition cost", before: "$320", after: "$84" },
      { label: "Email subscribers", before: "1,200", after: "9,800" },
      { label: "Email % of revenue", before: "3%", after: "28%" },
      { label: "Organic leads / month", before: "22", after: "148" },
      { label: "Content pieces / month", before: "2", after: "18" },
      { label: "Referral new customers", before: "0%", after: "22%" },
    ],
    lessons: [
      {
        title: "Own your audience before you scale acquisition.",
        body: "Brands that rely entirely on paid channels are renting their customers from platforms that can reprice access at any time. An email list of 10,000 engaged subscribers is a durable asset that no algorithm change can take away.",
      },
      {
        title: "Build the infrastructure before the content.",
        body: "Most brands start writing content without a system to capture, nurture, and convert the audience it builds. We always build the conversion infrastructure first. Content without capture is wasted momentum.",
      },
      {
        title: "Your best customers are your best acquisition channel.",
        body: "With a 68% repeat purchase rate (clear evidence of a product people loved), a referral programme that captures this loyalty is, cost-for-cost, the highest-performing acquisition channel available. Most brands never build one.",
      },
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}
