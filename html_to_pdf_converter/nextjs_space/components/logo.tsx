"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

export function Logo() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before mounting, use a default (light logo)
  if (!mounted) {
    return (
      <div className="relative h-10 w-40">
        <Image
          src="https://thedrobot.com/wp-content/uploads/2024/06/TheDrobot_new-Logo1.svg"
          alt="TheDrobot Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    );
  }

  // Determine the actual theme (considering system preference)
  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc =
    currentTheme === "dark"
      ? "https://thedrobot.com/wp-content/uploads/2025/09/The-Drobot_white.svg"
      : "https://thedrobot.com/wp-content/uploads/2024/06/TheDrobot_new-Logo1.svg";

  return (
    <div className="relative h-10 w-40">
      <Image
        src={logoSrc}
        alt="TheDrobot Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
