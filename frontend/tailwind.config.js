/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bgDark: '#0F172A',       // Slate 900
        cardDark: '#111827',     // Gray 900
        cardBorder: '#1F2937',   // Gray 800
        primaryBlue: '#1E40AF',  // Royal Blue
        accentOrange: '#F97316', // Orange Accent
        successGreen: '#22C55E', // Available Green
        bookedBlue: '#3B82F6',   // Booked Blue
        warningYellow: '#FACC15',// Pending Yellow
        dangerRed: '#EF4444',    // Sold Red
        textMain: '#F8FAFC',     // Slate 50
        textMuted: '#94A3B8'     // Slate 400
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
