import React from "react";
import { classes, Icon } from "../utils";

// --- CUSTOM BUTTON COMPONENT ---
export const Button = React.forwardRef(
  ({ href, secondary, children, icon, iconEnd, ...rest }, ref) => {
    const isExternal = href?.includes("://");
    return (
      <a
        ref={ref}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={classes("button", secondary ? "button-secondary" : "")}
        {...rest}
      >
        {icon && (
          <Icon icon={icon} className="button-icon-start" data-shift="true" />
        )}
        <span className="button-text">{children}</span>
        {iconEnd && (
          <Icon icon={iconEnd} className="button-icon-end" data-shift="true" />
        )}
      </a>
    );
  },
);
