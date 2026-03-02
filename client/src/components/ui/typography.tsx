import { COLORS } from "@/lib/colors";

/**
 * Typography Scale (5-type system)
 * ─────────────────────────────────
 * display  — Date header (dynamic size, Satoshi-Bold, tight tracking)
 * label    — Category tags (Sora, uppercase, wide tracking, 10px)
 * headline — Card titles + static card content (Satoshi-Bold, 22px, tight tracking)
 * reading  — Expanded body text, descriptions (Satoshi-Regular, 15px)
 * caption  — Teasers, metadata, footer (Satoshi-Regular, 13px)
 *
 * All sizes scale with --scale via CSS variables.
 * Use CSS classes (.type-headline, .type-reading, etc.) directly when possible.
 * This component is a convenience wrapper for one-off overrides.
 */

type TypographyVariant = 'display' | 'label' | 'headline' | 'reading' | 'caption';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

const variantClasses: Record<TypographyVariant, string> = {
  display: 'type-display',
  label: 'type-label',
  headline: 'type-headline',
  reading: 'type-reading',
  caption: 'type-caption',
};

export function Typography({
  variant = 'headline',
  color,
  className = '',
  style,
  children,
  as: Tag = 'div',
}: TypographyProps) {
  return (
    <Tag
      className={`${variantClasses[variant]} ${className}`}
      style={{ color: color || undefined, ...style }}
    >
      {children}
    </Tag>
  );
}
