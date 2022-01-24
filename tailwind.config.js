module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        absent: '#787c7e',
        correct: '#6aaa64',
        present: '#c9b458'
      },
    },
  },
  plugins: [],
}