<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Say Less | tw¡st3d_¡nk" />
  <title>Say Less</title>
  <link rel="stylesheet" href="assets/styles/sayless.css" />
  <style>
    .quote-card {
      background: rgba(0, 0, 0, 0.65);
      border: 1px solid #0ff;
      padding: 1rem;
      margin: 1rem;
      font-size: 1.2rem;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .quote-card:hover {
      background-color: rgba(255, 0, 0, 0.1);
      transform: scale(1.02) rotate(0.3deg);
      box-shadow: 0 0 12px #0ff;
    }

    .quote-card.glitch {
      animation: glitchFlash 0.2s ease-in-out;
    }

    @keyframes glitchFlash {
      0% { transform: skewX(-2deg); filter: contrast(1.6); }
      50% { transform: skewX(2deg) scale(1.05); filter: brightness(1.2); }
      100% { transform: none; filter: none; }
    }
  </style>
</head>
<body style="background: url('assets/images/sayless_bg.jpg') no-repeat center center fixed; background-size: cover; color: #fff; font-family: 'Courier New', monospace;">
  <audio autoplay loop>
    <source src="assets/audio/static.mp3" type="audio/mpeg">
  </audio>
  <main id="quote-grid">
    <div class="quote-card">Some scars don’t heal—they just learn how to speak without bleeding.</div>
    <div class="quote-card">Silence isn’t empty. It’s where the truth echoes the loudest.</div>
    <div class="quote-card">I didn’t survive to be silent. I endured to be impossible to ignore.</div>
    <div class="quote-card">You don’t need a voice to be heard. Just the guts to stand still in the storm.</div>
    <div class="quote-card">Pain taught me a language even the dead remember.</div>
    <div class="quote-card">Every time I broke, I leaked something real.</div>
    <div class="quote-card">They called it attitude. I called it armor.</div>
    <div class="quote-card">I don’t say much—but when I do, it’s warpaint not lipstick.</div>
    <div class="quote-card">I bled quietly. Now I write loudly.</div>
    <div class="quote-card">They tried to mute me. I turned the silence into scripture.</div>
  </main>

  <script>
    const cards = document.querySelectorAll('.quote-card');

    // Glitch pulse loop
    setInterval(() => {
      cards.forEach(card => {
        card.classList.add('glitch');
        setTimeout(() => card.classList.remove('glitch'), 200);
      });
    }, 7000);

    // Click distort
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.style.transform = 'scale(0.95) rotate(-0.5deg)';
        card.style.filter = 'brightness(0.7)';
        setTimeout(() => {
          card.style.transform = '';
          card.style.filter = '';
        }, 250);
      });
    });
  </script>
</body>
</html>
