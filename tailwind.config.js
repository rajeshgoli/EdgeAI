/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                edge: {
                    900: '#0a0a0f',
                    800: '#13131f',
                    700: '#1c1c2e',
                    neon: '#00f0ff',
                    bull: '#22c55e',
                    bear: '#ef4444',
                }
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            }
        },
    },
    plugins: [],
}
