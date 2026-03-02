interface CardHeaderProps {
  label: string;
  labelColor: string;
  accentColor?: string;
  isExpanded: boolean;
  onClose?: () => void;
  buttonColor?: string;
  showButton?: boolean;
}

export function CardHeader({
  label,
  labelColor,
  accentColor,
  isExpanded,
  onClose,
  showButton = true,
}: CardHeaderProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <div
      className="flex items-center justify-between"
      style={{
        height: 'var(--close-btn-size)',
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: 'calc(var(--text-label) * 0.6)' }}
      >
        {accentColor && (
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: 'calc(var(--text-label) * 0.8)',
              height: 'calc(var(--text-label) * 0.8)',
              backgroundColor: accentColor,
            }}
          />
        )}
        <div
          className="type-label"
          style={{ color: labelColor }}
        >
          {label}
        </div>
      </div>

      {showButton && (
        <button
          onClick={onClose ? handleClick : undefined}
          className="flex items-center justify-center"
          style={{
            width: 'var(--close-btn-size)',
            height: 'var(--close-btn-size)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: onClose ? 'pointer' : 'default',
          }}
          aria-label={isExpanded ? 'Close' : 'Expand'}
        >
          {isExpanded ? (
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              style={{
                width: 'calc(var(--close-btn-size) * 0.35)',
                height: 'calc(var(--close-btn-size) * 0.35)',
              }}
            >
              <path
                d="M1 1L9 9M9 1L1 9"
                stroke={labelColor}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              style={{
                width: 'calc(var(--close-btn-size) * 0.35)',
                height: 'auto',
              }}
            >
              <path
                d="M1 1L5 5L9 1"
                stroke={labelColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
