export type ServiceGroup = {
  key: string;
  title: string;
  blurb: string;
  description: string;
  deliverables: string[];
  items: string[];
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
  },
];
