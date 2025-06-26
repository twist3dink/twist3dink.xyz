// echo.js — Random flash to simulate static glitch
setInterval(() => {
  document.body.style.filter = "contrast(1.4) brightness(0.9)";
  setTimeout(() => {
    document.body.style.filter = "";
  }, 120);
}, 6000);
