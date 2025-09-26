/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Hermetiq Design System - Dark-first
        ink: {
          950: "#0B0F14", // app background
          900: "#0F1A22", // cards/surfaces
          800: "#16232C", // secondary surfaces, table rows
        },
        mist: {
          50: "#F4F7FA", // light theme background
          100: "#E9EEF5", // primary text on dark
          300: "#C7D2DF", // muted text/icons
        },
        // Brand Accents
        seal: {
          mint: {
            500: "#2BE8C8", // primary accent
            600: "#20D2B5", // hover/active
            700: "#16B79C", // pressed/focus
          },
          glow: "rgba(32, 210, 181, 0.35)", // glows, rings, outlines
        },
        // Semantic
        safe: "#22C55E",
        warn: "#F59E0B",
        danger: "#EF4444",
        info: "#60A5FA",
        // Legacy support (can be removed after migration)
        bg: {
          base: "#0B0F14",
          elev: "#0F1A22",
        },
        stroke: "#16232C",
        text: {
          primary: "#E9EEF5",
          muted: "#C7D2DF",
        },
        accent: {
          gold: "#E8B923",
          mint: "#20D2B5", // updated to match seal-mint-600
          amber: "#F59E0B",
          red: "#EF4444",
          blue: "#60A5FA",
        },
      },
      fontFamily: {
        heading: ["Outfit", "Inter Tight", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "Monaco", "monospace"],
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "28px",
        "4xl": "36px",
      },
      lineHeight: {
        heading: "1.35",
        body: "1.55",
        code: "1.6",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
      },
      borderRadius: {
        card: "16px",
        chip: "12px",
        input: "12px",
      },
      boxShadow: {
        ambient: "0 8px 24px rgba(0,0,0,0.3)",
        glow: "0 0 20px rgba(232, 185, 35, 0.3)",
      },
      screens: {
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      backgroundImage: {
        "grad-cta": "linear-gradient(45deg, #E8B923, #6FFFD4)",
        "grad-loader":
          "linear-gradient(90deg, transparent, rgba(232, 185, 35, 0.8), transparent)",
      },
      animation: {
        "seam-sweep": "seam-sweep 2s ease-out",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "scan-line": "scan-line 3s ease-in-out infinite",
        "technique-check": "technique-check 1.5s ease-in-out infinite",
        "vulnerability-found": "vulnerability-found 0.5s ease-out",
        "analysis-pulse": "analysis-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "seam-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(232, 185, 35, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(232, 185, 35, 0.6)" },
        },
        "scan-line": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateX(100%)",
            opacity: "0",
          },
        },
        "technique-check": {
          "0%": {
            transform: "scale(1)",
            opacity: "0.7",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "0.7",
          },
        },
        "vulnerability-found": {
          "0%": {
            transform: "scale(1)",
            backgroundColor: "rgba(255, 77, 77, 0.1)",
          },
          "50%": {
            transform: "scale(1.02)",
            backgroundColor: "rgba(255, 77, 77, 0.2)",
          },
          "100%": {
            transform: "scale(1)",
            backgroundColor: "rgba(255, 77, 77, 0.1)",
          },
        },
        "analysis-pulse": {
          "0%, 100%": {
            opacity: "0.6",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.02)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
