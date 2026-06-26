import { cn } from "@/lib/utils";

function PlaceholderBlock({
  className,
  shimmer = false,
  style,
}: {
  className?: string;
  shimmer?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/30",
        shimmer && "shimmer",
        className,
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

function PlaceholderCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-border/80 hover:bg-card/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardPlaceholder() {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="space-y-3">
        <PlaceholderBlock className="h-7 w-44" shimmer />
        <PlaceholderBlock className="h-4 w-64 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <PlaceholderCard key={index} className="space-y-4">
            <PlaceholderBlock className="h-3 w-20" shimmer />
            <PlaceholderBlock className="h-8 w-24" />
            <PlaceholderBlock className="h-3 w-32" />
          </PlaceholderCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <PlaceholderCard className="flex min-h-[320px] flex-col gap-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <PlaceholderBlock className="h-4 w-28" shimmer />
            <PlaceholderBlock className="h-8 w-24 rounded-lg" />
          </div>
          <div className="flex flex-1 items-end gap-2 pt-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <PlaceholderBlock
                key={index}
                className="flex-1 rounded-sm"
                style={{ height: `${32 + (index % 5) * 14}%` }}
                shimmer={index % 3 === 0}
              />
            ))}
          </div>
        </PlaceholderCard>

        <PlaceholderCard className="min-h-[320px] space-y-4 lg:col-span-2">
          <PlaceholderBlock className="h-4 w-32" shimmer />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <PlaceholderBlock className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <PlaceholderBlock className="h-3 w-full max-w-[180px]" />
                <PlaceholderBlock className="h-2.5 w-2/3 max-w-[120px]" />
              </div>
            </div>
          ))}
        </PlaceholderCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <PlaceholderCard key={index} className="min-h-[160px] space-y-4">
            <PlaceholderBlock className="h-4 w-36" shimmer />
            <PlaceholderBlock className="h-3 w-full" />
            <PlaceholderBlock className="h-3 w-[80%]" />
            <PlaceholderBlock className="h-3 w-[60%]" />
          </PlaceholderCard>
        ))}
      </div>
    </div>
  );
}
