import Link from "next/link";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "ghost";
  className?: string;
  // When true (with href), render an external anchor that opens in a new tab
  // instead of a client-side <Link>.
  external?: boolean;
  children: React.ReactNode;
};

const styles = {
  primary:
    "bg-gold text-navy hover:brightness-95 border border-transparent",
  ghost:
    "bg-transparent text-white hover:bg-white/10 border border-white/30",
};

export function Button({
  href,
  variant = "primary",
  className = "",
  external = false,
  children,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center rounded-tile-sm px-6 py-3 font-mono text-sm uppercase tracking-label transition ${styles[variant]} ${className}`;
  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <button className={cls}>{children}</button>;
}
