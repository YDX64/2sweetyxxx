/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
    'node_modules/preline/dist/*.js'
  ],
  theme: {
    extend: {screens: {
      '_1750_' : '1750px',
      '_1700_' : '1700px',
      '_1500_' : '1500px',
      '_1490_' : '1490px',
      '_1445_' : '1445px',
      '_1360_' : '1360px',
      '_1300_' : '1300px',
      '_1200_' : '1200px',
      '_1090_' : '1090px',
      '_1145_' : '1145px',
      '_1030_' : '1030px',
      '_991_' : '992px',
      '_830_' : '830px',
      '_990_' : '990px',
      '_800_' : '800px',
      '_770_' : '770px',
      '_768_' : '768px',
      '_715_' : '720px',
      '_710_' : '710px',
      '_700_' : '700px',
      '_680_' : '680px',
      '_600_' : '600px',
      '_580_' : '580px',
      '_500_' : '500px',
      '_475_' : '475px',
      '_430_' : '430px',
      '_380_' : '380px',
      '_330_' : '330px',
    }
    },
  },
  plugins: [ require('preline/plugin')],
}