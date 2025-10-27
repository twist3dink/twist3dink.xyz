// devil.js — Random red flash
setInterval(() => {
  document.body.style.backgroundColor = '#100' // subtle red pulse
  setTimeout(() => {
    document.body.style.backgroundColor = ''
  }, 100)
}, 8000)
