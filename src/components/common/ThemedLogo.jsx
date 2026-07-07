import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import logoLight from "../../assets/siralink-light.svg";
import logoDark from "../../assets/siralink-dark.svg";

/**
 * ThemedLogo Component
 *
 * Displays the appropriate SiraLink logo based on the current theme.
 *
 * - Uses the ThemeContext to detect whether the application is in
 *   light mode or dark mode.
 * - Automatically switches between:
 *     - siralink-light.svg
 *     - siralink-dark.svg
 * - Accepts all standard <img> props (className, alt, width, height, etc.)
 *   and forwards them to the underlying image element.
 *
 * Example:
 * <ThemedLogo
 *   alt="SiraLink"
 *   className="h-6 md:h-7 w-auto object-contain"
 * />
 *
 * This component should be used anywhere the application logo is displayed
 * to ensure consistent theme-aware branding across the platform.
 */

function ThemedLogo({ className = "", alt = "SiraLink", ...props }) {
  const { theme } = useTheme();

  return (
    <img
      src={theme === "dark" ? logoDark : logoLight}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

export default ThemedLogo;
