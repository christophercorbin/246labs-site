export type Metric = { label: string; value: string };

export type Work = {
  name: string;
  blurb: string;
  href: string; // live product URL (external)
  image?: string; // e.g. "/work/sumdeting.webp"; omit until the file is committed
  slug: string;
  // Case-study fields (optional; narrative-first, metrics-ready).
  problem?: string;
  approach?: string[];
  outcome?: string;
  stack?: string[];
  metrics?: Metric[];
  relatedServices?: string[]; // SERVICE_GROUPS keys to cross-link
};

export const SELECTED_WORK: Work[] = [
  {
    name: "SumDeTing",
    blurb:
      "An AI math tutor for Caribbean students, from Common Entrance to CXC — Socratic and patient, built on Claude via Amazon Bedrock.",
    href: "https://sumdeting.246labs.cloud",
    image: "/work/sumdeting.webp",
    slug: "sumdeting",
    problem:
      "Caribbean students preparing for Common Entrance and CXC rarely have access to one-on-one tutoring, and generic math apps don't teach to the exams or the way local curricula expect.",
    approach: [
      "Built a Socratic tutor that guides students to the answer instead of handing it over.",
      "Grounded it in the Caribbean path from Common Entrance through CXC.",
      "Ran it on Claude via Amazon Bedrock, inside our own AWS.",
      "Shipped it as a web app any student can use from any device.",
    ],
    outcome:
      "A patient, always-available tutor that meets Caribbean students where they are — the same standard of AI product we'd build for a client.",
    stack: ["Claude", "Amazon Bedrock", "AWS"],
    relatedServices: ["ai", "build"],
  },
  {
    name: "Bim Weather",
    blurb:
      "Real-time weather and hurricane tracking for Barbados — live radar, forecasts, and storm alerts down to the parish.",
    href: "https://bimweather.246labs.cloud",
    image: "/work/bimweather.webp",
    slug: "bimweather",
    problem:
      "Barbados sits in the hurricane belt, but residents often rely on regional forecasts that don't resolve down to the parish or update fast enough as a storm moves.",
    approach: [
      "Pulled live radar, forecasts, and storm data into one real-time view.",
      "Resolved it to parish-level detail for Barbados.",
      "Built storm alerts that surface quickly when conditions change.",
      "Hosted it on AWS infrastructure we run and monitor.",
    ],
    outcome:
      "Real-time weather and hurricane tracking Barbadians can rely on when it matters most.",
    stack: ["AWS"],
    relatedServices: ["build", "run"],
  },
  {
    name: "CargoLink Barbados",
    blurb:
      "A smarter way to ship — a logistics platform for moving cargo to and from Barbados.",
    href: "https://cargolinkbarbados.com",
    image: "/work/cargolink.webp",
    slug: "cargolink",
    problem:
      "Moving cargo to and from Barbados meant juggling brokers, forms, and phone calls, with little visibility into where a shipment stood.",
    approach: [
      "Built a logistics platform to coordinate cargo moving to and from Barbados.",
      "Brought booking and tracking into one place.",
      "Designed it mobile-ready for operators who aren't at a desk.",
      "Deployed it on AWS with our standard CI/CD and least-privilege setup.",
    ],
    outcome:
      "A smarter way to ship — logistics coordination without the runaround.",
    stack: ["AWS"],
    relatedServices: ["build", "run"],
  },
];
