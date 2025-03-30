/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			backgroundImage: {
				'paris': "url('/src/images/paris.png')",
				'london': "url('/src/images/london.png')",
				'berlin': "url('/src/images/berlin.png')",
				'stockholm': "url('/src/images/stockholm.png')",
				'brussels': "url('/src/images/brussels.png')",
				'amsterdam': "url('/src/images/amsterdam.png')",
				'bluehue': "url('/src/images/blue-hue.png')",
				'meeting': "url('/src/images/positive-startup-group-with-laptops-chatting-meeting-room.png')",
			},
			fontFamily: {
				'roboto': ['Roboto', 'sans-serif'],
				'nunito': ["'Nunito'", 'sans-serif'],
			},
		},
	},
	plugins: [],
}
