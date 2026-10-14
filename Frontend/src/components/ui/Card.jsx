import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  bodyClassName = '',
  hoverEffect = false,
  noPadding = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E2EAE4] shadow-xs ${
        hoverEffect ? 'hover:shadow-md hover:border-emerald-200 transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-[#E2EAE4] flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[#17211B] tracking-tight">{title}</h3>
            )}
            {subtitle && <p className="text-xs text-[#647067] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className={noPadding ? bodyClassName : `p-6 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className="px-6 py-3.5 bg-[#F5FBF7]/50 rounded-b-xl border-t border-[#E2EAE4] text-xs text-[#647067]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
