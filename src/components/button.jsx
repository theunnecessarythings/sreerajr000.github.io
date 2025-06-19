import React from "react";
import { classes, Icon } from "../utils";
import { Link } from "react-router-dom";

// --- CUSTOM BUTTON COMPONENT ---
export const Button = React.forwardRef(
  ({ to, href, secondary, children, icon, iconEnd, ...rest }, ref) => {
    const isExternal = href?.includes("://");
    const As = to ? Link : "a";
    const props = {
      ref,
      href: to ? undefined : href,
      to: to,
      target: isExternal ? "_blank" : undefined,
      rel: isExternal ? "noopener noreferrer" : undefined,
      className: classes("button", secondary ? "button-secondary" : ""),
      ...rest,
    };

    return (
      <As {...props}>
        {icon && (
          <Icon icon={icon} className="button-icon-start" data-shift="true" />
        )}
        <span className="button-text">{children}</span>
        {iconEnd && (
          <Icon icon={iconEnd} className="button-icon-end" data-shift="true" />
        )}
      </As>
    );
  },
);
