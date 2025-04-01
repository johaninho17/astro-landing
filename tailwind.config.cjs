/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			backgroundImage: {
				'paris': "url('/images/paris.png')",
				'london': "url('/images/london.png')",
				'berlin': "url('/images/berlin.png')",
				'stockholm': "url('/images/stockholm.png')",
				'brussels': "url('/images/brussels.png')",
				'amsterdam': "url('/images/amsterdam.png')",
				'bluehue': "url('/images/blue-hue.png')",
				'meeting': "url('/images/positive-startup-group-with-laptops-chatting-meeting-room.png')",
			},
			fontFamily: {
				'roboto': ['Roboto', 'sans-serif'],
				'nunito': ["'Nunito'", 'sans-serif'],
			},
		},
	},
	plugins: [],
}
