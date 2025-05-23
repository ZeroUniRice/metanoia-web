/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './src/lib/components/*.{html,js,svelte,ts}'],
  darkMode: 'class', 
  theme: {
    colors: {
      primary: {
        light: '#00246a', 
        DEFAULT: '#00246a', 
        dark: '#011d54',  
      },
      secondary: {
        light: '#EFF6FF', 
        DEFAULT: '#DBEAFE', 
        dark: '#BFDBFE', 
      },
      neutral: {
        light: '#F9FAFB',
        DEFAULT: '#F3F4F6',
        dark: '#1F2937',
      },
      'dark-bg': '#111827',
      'dark-surface': '#1F2937',
      'dark-text': '#F3F4F6',
    },
  },
  plugins: [],
};
