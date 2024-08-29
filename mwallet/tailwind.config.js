/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: { 

        // Agregar o anular colores aquí 
        primary: '#22c55e', 
        secondary: '#FFA500', 
    }, 
    },
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}

