export type Work = {
  name: string;
  blurb: string;
  href: string;
  image?: string; // e.g. "/work/sumdeting.webp"; omit until the file is committed
  slug: string;
};

export const SELECTED_WORK: Work[] = [
  {
    name: "SumDeTing",
    blurb:
      "An AI math tutor for Caribbean students, from Common Entrance to CXC — Socratic and patient, built on Claude via Amazon Bedrock.",
    href: "https://sumdeting.246labs.cloud",
    image: "/work/sumdeting.webp",
    slug: "sumdeting",
  },
  {
    name: "Bim Weather",
    blurb:
      "Real-time weather and hurricane tracking for Barbados — live radar, forecasts, and storm alerts down to the parish.",
    href: "https://bimweather.246labs.cloud",
    image: "/work/bimweather.webp",
    slug: "bimweather",
  },
  {
    name: "CargoLink Barbados",
    blurb:
      "A smarter way to ship — a logistics platform for moving cargo to and from Barbados.",
    href: "https://cargolinkbarbados.com",
    image: "/work/cargolink.webp",
    slug: "cargolink",
  },
];
