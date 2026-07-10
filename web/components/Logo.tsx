type LogoProps = {
  variant?: "dark" | "light";
  showIcon?: boolean;
  className?: string;
};

export function Logo({
  variant = "dark",
  showIcon = true,
  className = "",
}: LogoProps) {
  const accent = variant === "dark" ? "text-gold" : "text-flag-blue";
  const wordColor = variant === "dark" ? "text-white" : "text-flag-blue";

  return (
    <span
      role="img"
      aria-label="246Labs"
      className={`inline-flex items-center gap-3 ${className}`}
    >
      {showIcon && (
        <span
          aria-hidden
          className="relative inline-flex h-[52px] w-[52px] flex-col overflow-hidden rounded-tile-sm bg-navy"
        >
          <span className="flex h-[13px] items-center gap-[3px] bg-panel-blue px-[5px]">
            <span className="h-[4px] w-[4px] rounded-full bg-traffic-red" />
            <span className="h-[4px] w-[4px] rounded-full bg-traffic-amber" />
            <span className="h-[4px] w-[4px] rounded-full bg-traffic-green" />
          </span>
          <span className="flex flex-1 items-center justify-center gap-[3px]">
            <span
              className="mark-mask h-[26px] w-[24px] text-gold"
              style={{ WebkitMaskImage: "url(/brand/trident-white.png)", maskImage: "url(/brand/trident-white.png)" }}
            />
            <span className="h-[26px] w-[3px] bg-gold" />
          </span>
        </span>
      )}
      <span
        className={`font-sans text-3xl font-bold leading-[0.82] tracking-wordmark ${wordColor}`}
      >
        246La
        <span
          className="mark-mask inline-block h-[0.8em] w-[0.7em] translate-y-[0.08em] text-current"
          aria-hidden
          style={{ WebkitMaskImage: "url(/brand/map-white.png)", maskImage: "url(/brand/map-white.png)" }}
        />
        <span className={accent}>s</span>
      </span>
    </span>
  );
}
