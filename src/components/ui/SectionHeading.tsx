import Link from "next/link";
import clsx from "clsx";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, action, align = "center", className }: Props) {
  return (
    <div
      className={clsx(
        "mb-10 flex flex-col gap-4 md:mb-14",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={clsx("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3 text-gold">{eyebrow}</p>}
        <h2 className="font-serif text-4xl leading-tight font-light text-charcoal md:text-5xl">{title}</h2>
        {description && <p className="mt-4 text-sm leading-relaxed text-ink/70 md:text-base">{description}</p>}
        {align === "center" && <span className="mx-auto mt-6 block h-px w-16 bg-gold" />}
      </div>
      {action && (
        <Link href={action.href} className="link-underline eyebrow shrink-0 text-ink hover:text-gold">
          {action.label}
        </Link>
      )}
    </div>
  );
}
