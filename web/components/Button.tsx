import Link from "next/link";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "ghost";
  className?: string;
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
  children,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center rounded-tile-sm px-6 py-3 font-mono text-sm uppercase tracking-label transition ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <button className={cls}>{children}</button>;
}
