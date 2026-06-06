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
      "This Series A SaaS company had product-market fit and a capable team but no repeatable way to fill the pipeline. The CEO was closing deals entirely from his personal network. Arashi OPS built the outbound system from scratch: research, copy, tooling, automation. What had been invisible and unpredictable became a measurable growth engine.",
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
      "This firm's senior consultants were spending 15 hours each per week on prospecting, follow-up, and CRM maintenance. The firm had no automation, no content engine, and no way to scale without hiring. Arashi OPS rebuilt the entire sales infrastructure, stripping out the manual overhead and replacing it with systems that ran around the clock.",
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
          name: "Phase 3: Outbound Automation",
          detail:
            "Deployed automated multi-touch outreach sequences for all three buyer personas. Integrated Clay for prospect enrichment and Instantly for campaign management. Qualification layer built to filter leads before partner contact.",
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
          milestone: "All outreach sequences live, first qualified responses entering pipeline, partner hours on sales reduced from 30hr/week to 14hr/week",
        },
        {
          week: "Month 3",
          milestone:
            "Follow-up automation fully operational, partner hours on sales reduced from 30hr/week to 8hr/week",
        },
        {
          week: "Month 4–5",
          milestone: "Outbound system at full operating rhythm, average deal size increased 133%, inbound referrals up from increased market visibility",
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
        title: "Automation creates leverage for senior teams.",
        body: "When the prospecting, follow-up, and data entry is automated, senior partners get their time back. 22 hours per week returned to billable and strategic work produced far more revenue growth than any additional salesperson would have.",
      },
      {
        title: "Visibility changes behaviour.",
        body: "When the partners could see their pipeline in real time for the first time, they made better decisions. The CRM didn't just organise data. It changed how they prioritised their week. Clarity is a growth lever.",
      },
    ],
  },

  {
    slug: "dtc-consumer-brand",
    company: "B2B Payments Platform",
    industry: "B2B FinTech",
    category: "B2B Payments · Series A",
    period: "4 months",
    tagline:
      "From no outbound motion to 52 qualified meetings per month and $740K pipeline in 4 months.",
    heroMetric: { value: "52", label: "Qualified meetings / month" },
    summary:
      "This Series A payments platform had strong product-market fit within their existing network but no structured way to reach beyond it. Pipeline was unpredictable and entirely dependent on founder relationships. Arashi OPS built a full outbound infrastructure targeting CFOs and finance leads at mid-market companies — taking them from 4 qualified meetings per month to 52 in under four months.",
    challenge: {
      overview:
        "The company had closed their first eight customers through founder relationships and warm introductions. That network was running dry. The sales team had no outbound process, no verified prospect lists, and no infrastructure for cold outreach. Every quarter was a guessing game.",
      bullets: [
        "4 qualified meetings per month — all from existing relationships",
        "No outbound process. Zero cold email infrastructure in place.",
        "No ICP definition. Team was reaching out to any company that seemed relevant.",
        "CRM had less than 200 contacts with no enrichment or lead scoring",
        "Sales cycle averaging 110 days due to late-stage qualification",
      ],
    },
    strategy: {
      overview:
        "Before deploying a single email, we spent two weeks defining the ICP with precision: company size, tech stack indicators, growth signals, and the specific buyer title most likely to champion the product. The strategy was multi-domain cold email targeting two buyer personas simultaneously — CFOs and VP Finance — with separate sequences and value propositions.",
      phases: [
        {
          name: "Phase 1: ICP & Infrastructure",
          detail:
            "Two-week ICP definition sprint followed by cold email infrastructure setup. Three sending domains configured and warmed. Apollo and Clay deployed for prospect research and data enrichment.",
        },
        {
          name: "Phase 2: Campaign Deployment",
          detail:
            "Launched two parallel campaigns targeting CFO and VP Finance personas. 7-touch sequences with A/B tested subject lines. Smartlead deployed for sending management and deliverability monitoring.",
        },
        {
          name: "Phase 3: Qualification & Routing",
          detail:
            "Claude qualification layer built to score positive replies against ICP criteria. Qualified leads routed directly into HubSpot with deal stage pre-set and context attached. Sales cycle reduced by 50 days as a result.",
        },
      ],
    },
    execution: {
      overview:
        "The first three weeks were entirely infrastructure: domains, data, and sequence writing. No outreach went out until the system was fully tested. By week four, the first campaign was live. By week eight, both personas were running at full volume with daily lead flow into the CRM.",
      steps: [
        {
          week: "Weeks 1–2",
          milestone:
            "ICP definition, domain setup and warming, Apollo/Clay deployment, prospect lists built",
        },
        {
          week: "Weeks 3–4",
          milestone:
            "Sequences written and approved, Smartlead configured, first CFO campaign launched",
        },
        {
          week: "Weeks 5–6",
          milestone:
            "VP Finance campaign launched, Claude qualification layer live, first qualified meetings booked",
        },
        {
          week: "Month 3",
          milestone:
            "Both campaigns at full volume, 28 qualified meetings in the month, HubSpot pipeline active",
        },
        {
          week: "Month 4",
          milestone:
            "52 qualified meetings, $740K pipeline value, sales cycle down to 58 days",
        },
      ],
    },
    results: {
      overview:
        "Four months in, the company had a fully operational outbound system generating 52 qualified meetings per month. Pipeline had grown from near-zero to $740K. The sales team was working qualified, context-rich leads — not chasing cold contacts. The founder was no longer the primary driver of new pipeline.",
    },
    metrics: [
      { label: "Qualified meetings / month", before: "4", after: "52" },
      { label: "Pipeline value", before: "$90K", after: "$740K" },
      { label: "Response rate", before: "2%", after: "14%" },
      { label: "Prospects contacted / month", before: "40", after: "620" },
      { label: "Sales cycle (days)", before: "110", after: "58" },
      { label: "Founder hours on BD / week", before: "18h", after: "4h" },
    ],
    lessons: [
      {
        title: "Cold email infrastructure is not optional.",
        body: "Most companies try cold email with a single domain and generic copy, get poor results, and conclude it doesn't work. The problem is never the channel — it's the absence of proper domain setup, warm-up, deliverability management, and sequence strategy. Infrastructure first.",
      },
      {
        title: "Qualification at entry changes everything downstream.",
        body: "Building a qualification layer that scored replies before any human contact reduced the average sales cycle from 110 to 58 days. Reps spent time on leads that could actually close. That alone justified the entire engagement.",
      },
      {
        title: "Founder-dependent pipeline has a ceiling.",
        body: "Every company that scales past a certain point does so because they replaced founder-driven sales with a repeatable system. The transition is uncomfortable. It's also necessary. The sooner it happens, the longer the compounding runway.",
      },
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}
