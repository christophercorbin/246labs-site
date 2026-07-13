const schema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "246Labs",
  url: "https://246labs.cloud",
  logo: "https://246labs.cloud/apple-icon",
  description:
    "Caribbean cloud-engineering studio: AI, web & app development, AWS, DevOps, hosting, and security audits.",
  email: "hello@246labs.cloud",
  areaServed: ["Barbados", "Caribbean"],
  sameAs: ["https://github.com/christophercorbin/246labs-site"],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
