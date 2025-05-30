import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	extend: {
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: '#005A8D',
    				foreground: '#ffffff'
    			},
    			secondary: {
    				DEFAULT: '#2E7D32',
    				foreground: '#ffffff'
    			},
    			accent: {
    				DEFAULT: '#E0F2F1',
    				foreground: '#004D40'
    			},
    			muted: {
    				DEFAULT: '#f4f4f4',
    				foreground: '#757575'
    			},
    			destructive: {
    				DEFAULT: '#D32F2F',
    				foreground: '#ffffff'
    			},
    			input: '#E0E0E0',
    			border: '#BDBDBD',
    			ring: '#80CBC4',
    			card: {
    				DEFAULT: '#ffffff',
    				foreground: '#212121'
    			},
    			chart: {
    				'1': '#005A8D',
    				'2': '#2E7D32',
    				'3': '#FF7043',
    				'4': '#AB47BC',
    				'5': '#26C6DA'
    			}
    		},
    		borderRadius: {
    			lg: '1rem',
    			md: '0.5rem',
    			sm: '0.25rem'
    		},
    		fontFamily: {
    			sans: [
    				'Inter',
    				'sans-serif'
    			],
    			serif: [
    				'Lora',
    				'serif'
    			]
    		},
    		keyframes: {
    			marquee: {
    				from: {
    					transform: 'translateX(0)'
    				},
    				to: {
    					transform: 'translateX(calc(-100% - var(--gap)))'
    				}
    			},
    			'marquee-vertical': {
    				from: {
    					transform: 'translateY(0)'
    				},
    				to: {
    					transform: 'translateY(calc(-100% - var(--gap)))'
    				}
    			},
    			rippling: {
    				'0%': {
    					opacity: '1'
    				},
    				'100%': {
    					transform: 'scale(2)',
    					opacity: '0'
    				}
    			},
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			marquee: 'marquee var(--duration) infinite linear',
    			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
    			rippling: 'rippling var(--duration) ease-out',
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
