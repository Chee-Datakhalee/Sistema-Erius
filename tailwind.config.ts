import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08111F",
        panel: "#0E1A2E",
        panel2: "#12213A",
        line: "#1D2C47",
        ink: "#E6EDF7",
        mute: "#8A9BB5",
        verde: "#22C55E",
        azul: "#3B82F6",
        amarelo: "#FACC15",
        roxo: "#8B5CF6",
        ciano: "#22D3EE",
        vermelho: "#EF4444",
      },
      fontFamily: {
        display: ["Saira", "system-ui", "sans-serif"],
        sans: ["Barlow", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
