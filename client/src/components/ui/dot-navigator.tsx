import { COLORS } from "@/lib/colors";

interface DotNavigatorProps {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  activeColor?: string;
  inactiveColor?: string;
}

export function DotNavigator({
  count,
  activeIndex,
  onSelect,
  activeColor = COLORS.INTERACTIVE.DOT_ACTIVE,
  inactiveColor = COLORS.INTERACTIVE.DOT_INACTIVE,
}: DotNavigatorProps) {
  return (
    <div
      className="flex items-center justify-center pb-2"
      style={{ gap: '8px' }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(index);
          }}
          className="rounded-full transition-all"
          style={{
            width: index === activeIndex ? '24px' : '8px',
            height: '8px',
            backgroundColor: index === activeIndex ? activeColor : inactiveColor,
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label={`Go to item ${index + 1}`}
          aria-current={index === activeIndex ? 'true' : 'false'}
        />
      ))}
    </div>
  );
}
