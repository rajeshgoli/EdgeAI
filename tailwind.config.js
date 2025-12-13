/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                edge: {
                    900: '#0B0E11', // Main dark background
                    800: '#15191E', // Sidebar/Panel background
                    700: '#2A2E35', // Borders/Separators
                    neon: '#00F0FF', // Primary Cyan
                    bull: '#00F0FF', // Using Cyan for positive/action
                    bear: '#FF3D3D', // Red
                    text: '#E1E3E6', // Primary Text
                    muted: '#8A919E', // Secondary Text
                }
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'neon': '0 0 20px rgba(0, 240, 255, 0.3)',
                'glow': '0 0 10px rgba(0, 240, 255, 0.5)',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
