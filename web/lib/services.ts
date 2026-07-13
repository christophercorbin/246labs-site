export type ServiceGroup = {
  key: string;
  title: string;
  blurb: string;
  description: string;
  deliverables: string[];
  items: string[];
  longIntro: string;
  howWeWork: string[];
  relatedWork?: string[];
  proofNote?: string;
  ctaLabel: string;
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    key: "ai",
    title: "AI",
    blurb:
      "Put AI to work where it actually moves the needle — no hype, no science projects.",
    description:
      "We help teams adopt AI that earns its place: automating real workflows and shipping AI-powered features, not demos. If it won't move a number that matters, we'll tell you before you spend on it.",
    deliverables: [
      "AI adoption roadmap",
      "Production AI features & agents",
      "Automated workflows & integrations",
    ],
    items: ["AI adoption consulting", "AI engineering", "Workflow automation"],
    longIntro:
      "Put AI to work where it actually moves the needle — no hype, no science projects. We help teams adopt AI that earns its place: automating the workflows that eat your week and shipping AI features customers actually use. If it won't move a number that matters, we'll tell you before you spend on it.",
    howWeWork: [
      "Find the wedge — we start from a workflow or a metric, not a model.",
      "Prove it small — a scoped pilot against your real data before you commit.",
      "Ship to production — built on Claude via Amazon Bedrock, in your own AWS.",
      "Measure and hand off — you own it, with the numbers to show it worked.",
    ],
    relatedWork: ["sumdeting"],
    ctaLabel: "Start an AI project →",
  },
  {
    key: "build",
    title: "Build",
    blurb:
      "Ship the product. Web apps, mobile-ready apps, and reworks of sites that have outgrown themselves.",
    description:
      "We design and ship web and mobile-ready applications end to end — and rebuild the sites and apps that have outgrown what they started as, without a rewrite-for-its-own-sake.",
    deliverables: [
      "Web & mobile-ready apps",
      "Site & app rebuilds",
      "APIs & third-party integrations",
    ],
    items: ["Web app development", "App building", "Website reworks"],
    longIntro:
      "Ship the product. We design and build web and mobile-ready applications end to end — and rebuild the sites and apps that have outgrown what they started as, without a rewrite for its own sake. You get software that works, that you can maintain, and that looks like you meant it.",
    howWeWork: [
      "Scope the real thing — the smallest version that's actually useful, shipped first.",
      "Design and build in the open — you see working software early, not just mockups.",
      "Wire up the plumbing — APIs, auth, payments, and the integrations you depend on.",
      "Launch and keep improving — on infrastructure we can run and hand back to you.",
    ],
    relatedWork: ["cargolink", "bimweather"],
    ctaLabel: "Start a build project →",
  },
  {
    key: "run",
    title: "Run",
    blurb:
      "Keep it live and fast. Hosting, pipelines, and the boring maintenance that keeps you out of the news.",
    description:
      "We keep what you've shipped fast, available, and quietly maintained: managed hosting, push-button deploys, and the unglamorous upkeep that prevents the 2 a.m. outage.",
    deliverables: [
      "Managed hosting",
      "CI/CD deploy pipelines",
      "Monitoring & ongoing maintenance",
    ],
    items: ["Hosting", "CI/CD pipelines", "App maintenance"],
    longIntro:
      "Keep it live and fast. We host what you've shipped, deploy it with push-button pipelines, and handle the unglamorous upkeep that prevents the 2 a.m. outage — patching, backups, monitoring, and the alerts that reach us before they reach your customers.",
    howWeWork: [
      "Take stock — what's running, where, and what breaks it.",
      "Make deploys boring — push-button pipelines, no hand-edited servers.",
      "Watch it — monitoring and alerts that page us, not you.",
      "Keep it current — patches, backups, and the quiet maintenance that keeps you out of the news.",
    ],
    relatedWork: ["sumdeting", "bimweather", "cargolink"],
    ctaLabel: "Talk to us about hosting →",
  },
  {
    key: "cloud",
    title: "Cloud & DevOps",
    blurb:
      "AWS done properly — infrastructure as code, sane environments, and automation you can trust.",
    description:
      "We build AWS environments the right way: infrastructure as code, least-privilege access, and automation you can hand off and trust. The same setup that runs this site and our own products.",
    deliverables: [
      "AWS architecture & setup",
      "Infrastructure as code (Terraform / OpenTofu)",
      "CI/CD & environment automation",
    ],
    items: ["AWS solutions", "DevOps engineering"],
    longIntro:
      "AWS done properly. We build cloud environments the right way — infrastructure as code, least-privilege access, sane environments, and automation you can hand off and trust. Not a pile of hand-clicked resources nobody dares touch.",
    howWeWork: [
      "Design for your scale — not a diagram from a conference talk.",
      "Codify everything — Terraform / OpenTofu, versioned and reviewable.",
      "Automate the path to production — CI/CD, environments, and guardrails.",
      "Hand over the keys — documented, least-privilege, yours to run.",
    ],
    proofNote:
      "This site — and every product we've shipped — runs on AWS we set up this way: infrastructure as code, a CI/CD pipeline with no stored keys, and least-privilege roles. We run our own practice before we sell it.",
    ctaLabel: "Start a cloud project →",
  },
  {
    key: "assurance",
    title: "Assurance",
    blurb:
      "Know where you stand. Security and compliance audits with findings you can act on.",
    description:
      "We tell you where you actually stand: security and compliance reviews that produce findings ranked by what matters, with a plan to fix them — not a PDF that gathers dust.",
    deliverables: [
      "Security audit & report",
      "Compliance gap assessment",
      "Prioritised remediation plan",
    ],
    items: ["Security audits", "Compliance audits"],
    longIntro:
      "Know where you stand. We run security and compliance reviews that produce findings ranked by what actually matters, each with a plan to fix it — not a 200-page PDF that gathers dust. Built for teams that would rather hear it from us than from an attacker.",
    howWeWork: [
      "Scope honestly — what you have, what you must protect, what you're measured against.",
      "Test and review — infrastructure, access, code, and configuration.",
      "Rank by real risk — the handful that matter first, not an alphabetised dump.",
      "Hand you a plan — prioritised remediation you can actually work through.",
    ],
    proofNote:
      "We hold ourselves to the same bar: our own analytics run on a hardened, SSM-only instance — no SSH, IMDSv2 enforced, encrypted at rest. If we'd flag it in your audit, we don't ship it in ours.",
    ctaLabel: "Request an audit →",
  },
  {
    key: "hardware",
    title: "Hardware",
    blurb:
      "When the problem is physical, we fix that too — practical support for the machines you depend on.",
    description:
      "When the problem is physical, we handle that too: practical diagnosis and repair for the machines your work depends on, without the runaround.",
    deliverables: [
      "Diagnosis & repair",
      "On-site support",
      "Upgrades & setup",
    ],
    items: ["Hardware fixes", "On-site support"],
    longIntro:
      "When the problem is physical, we handle that too. Practical diagnosis and repair for the machines your work depends on — no runaround, no upsell to a box you don't need. Sometimes the fastest fix is a screwdriver, not a subscription.",
    howWeWork: [
      "Diagnose first — find the actual fault before quoting a fix.",
      "Fix or advise — repair, upgrade, or an honest \"replace it\" when that's cheaper.",
      "Set it up right — configured, updated, and ready to work.",
    ],
    ctaLabel: "Get hardware help →",
  },
];
