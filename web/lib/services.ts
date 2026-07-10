export type ServiceGroup = {
  key: string;
  title: string;
  blurb: string;
  items: string[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    key: "ai",
    title: "AI",
    blurb:
      "Put AI to work where it actually moves the needle — no hype, no science projects.",
    items: ["AI adoption consulting", "AI engineering", "Workflow automation"],
  },
  {
    key: "build",
    title: "Build",
    blurb:
      "Ship the product. Web apps, mobile-ready apps, and reworks of sites that have outgrown themselves.",
    items: ["Web app development", "App building", "Website reworks"],
  },
  {
    key: "run",
    title: "Run",
    blurb:
      "Keep it live and fast. Hosting, pipelines, and the boring maintenance that keeps you out of the news.",
    items: ["Hosting", "CI/CD pipelines", "App maintenance"],
  },
  {
    key: "cloud",
    title: "Cloud & DevOps",
    blurb:
      "AWS done properly — infrastructure as code, sane environments, and automation you can trust.",
    items: ["AWS solutions", "DevOps engineering"],
  },
  {
    key: "assurance",
    title: "Assurance",
    blurb:
      "Know where you stand. Security and compliance audits with findings you can act on.",
    items: ["Security audits", "Compliance audits"],
  },
  {
    key: "hardware",
    title: "Hardware",
    blurb:
      "When the problem is physical, we fix that too — practical support for the machines you depend on.",
    items: ["Hardware fixes", "On-site support"],
  },
];
