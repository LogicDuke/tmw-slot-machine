(function () {
  'use strict';
  
  const config = window.tmwSlot || {};
  const assetsUrl = config.assetsUrl || '/wp-content/plugins/tmw-slot-machine/assets';
  const winRate = Number.isFinite(config.winRate) ? config.winRate : 50;
  const offers = Array.isArray(config.offers) ? config.offers : [];
  const icons = ['bonus.png', 'peeks.png', 'deal.png', 'roses.png', 'value.png'];
  
  let container;
  let btn;
  let reels;
  let result;
  let placeholder;
  let soundEnabled = false;
  let hasSpun = false;
  let spinInterval = null;
  
  const spinSound = new Audio(`${assetsUrl}/sounds/spin.mp3`);
  const winSound = new Audio(`${assetsUrl}/sounds/win.mp3`);
  spinSound.volume = 0.6;
  winSound.volume = 0.9;
  
  const getIconUrl = icon => `${assetsUrl}/img/${icon}`;

  function setRandomIcons() {
    const shuffled = [...icons].sort(() => Math.random() - 0.5);
    reels.forEach((reel, index) => {
      reel.innerHTML = `<img src="${getIconUrl(shuffled[index % icons.length])}" alt="" loading="lazy" decoding="async">`;
    });
  }

  function showSurprise() {
    if (!hasSpun && placeholder) {
      placeholder.innerHTML = `<img src="${assetsUrl}/img/surprice-trans.png" alt="Surprise" class="tmw-surprise-img">`;
    }
  }

  function updateSoundUI() {
    const toggle = container ? container.querySelector('.tmw-slot-sound-toggle, .sound-toggle') : null;
    if (toggle) {
      toggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
      toggle.classList.toggle('active', soundEnabled);
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundUI();
  }

  function tryEnableSound() {
    spinSound.play().then(() => {
      spinSound.pause();
      spinSound.currentTime = 0;
    }).catch(() => {});
  }

  function setReelsSpinning(isSpinning) {
    reels.forEach(reel => {
      if (isSpinning) {
        reel.classList.add('spinning');
      } else {
        reel.classList.remove('spinning');
      }
    });
  }

  function setReelsWin(isWin) {
    reels.forEach(reel => {
      if (isWin) {
        reel.classList.add('win');
      } else {
        reel.classList.remove('win');
      }
    });
  }

  function showResult() {
    setReelsSpinning(false);
    
    const isWin = Math.random() * 100 < winRate;
    const winIcon = icons[Math.floor(Math.random() * icons.length)];

    if (isWin) {
      container.classList.add('winning');
      setTimeout(() => container.classList.remove('winning'), 800);
      
      reels.forEach(reel => {
        reel.innerHTML = `<img src="${getIconUrl(winIcon)}" alt="">`;
      });
      
      setReelsWin(true);

      const offerIndex = icons.indexOf(winIcon);
      const offer = offers[offerIndex];

      if (offer && offer.title) {
        result.textContent = offer.title;
        result.className = 'tmw-result slot-result win-text show';

        let claimHref = '';
        if (offer.url) {
          try {
            const url = new URL(offer.url, window.location.href);
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              claimHref = url.href;
            }
          } catch {
            claimHref = '';
          }
        }

        if (claimHref) {
          const claimBtn = document.createElement('a');
          claimBtn.className = 'tmw-claim-bonus';
          claimBtn.href = claimHref;
          claimBtn.target = '_blank';
          claimBtn.rel = 'nofollow noopener noreferrer';
          claimBtn.textContent = 'Claim Bonus';
          const slotRight = container.querySelector('.slot-right');
          if (slotRight) {
            slotRight.prepend(claimBtn);
          }
        }
      } else {
        result.textContent = 'You Win!';
        result.className = 'tmw-result slot-result win-text show';
      }

      if (soundEnabled) {
        winSound.currentTime = 0;
        winSound.play().catch(() => {});
      }
    } else {
      setReelsWin(false);
      
      const mixed = [...icons].sort(() => Math.random() - 0.5).slice(0, 3);
      if (mixed[0] === mixed[1] && mixed[1] === mixed[2]) {
        mixed[2] = icons.find(icon => icon !== mixed[0]) || mixed[2];
      }
      reels.forEach((reel, index) => {
        reel.innerHTML = `<img src="${getIconUrl(mixed[index])}" alt="">`;
      });
      result.textContent = 'Try Again!';
      result.className = 'tmw-result slot-result lose-text show';
    }

    btn.disabled = false;
    btn.textContent = 'Spin Again';
  }

  function spin() {
    if (!hasSpun && placeholder) {
      placeholder.style.display = 'none';
    }
    hasSpun = true;
    btn.disabled = true;
    result.textContent = '';
    result.className = 'tmw-result slot-result';
    setReelsWin(false);

    const oldClaim = container.querySelector('.tmw-claim-bonus');
    if (oldClaim) {
      oldClaim.remove();
    }

    setReelsSpinning(true);

    let elapsed = 0;
    const duration = 1400;
    if (spinInterval) {
      clearInterval(spinInterval);
    }
    spinInterval = setInterval(() => {
      setRandomIcons();
      elapsed += 110;
      if (elapsed >= duration) {
        clearInterval(spinInterval);
        spinInterval = null;
        showResult();
      }
    }, 110);

    if (soundEnabled) {
      spinSound.currentTime = 0;
      spinSound.play().catch(() => {});
    }
  }

  function init() {
    window.addEventListener('pagehide', () => {
      if (spinInterval) {
        clearInterval(spinInterval);
      }
      spinInterval = null;
    });

    container = document.querySelector('.tmw-slot-machine');
    if (!container) {
      return;
    }

    btn = container.querySelector('.tmw-slot-btn');
    reels = container.querySelectorAll('.reel');
    result = container.querySelector('.tmw-result');
    placeholder = container.querySelector('.tmw-slot-placeholder');

    const allSoundToggles = container.querySelectorAll('.tmw-slot-sound-toggle, .sound-toggle');

    if (!btn || reels.length === 0 || !result) {
      return;
    }

    updateSoundUI();
    
    allSoundToggles.forEach(toggle => {
      toggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
      toggle.classList.toggle('active', soundEnabled);
    });

    showSurprise();
    setRandomIcons();

    btn.addEventListener('click', () => {
      tryEnableSound();
      spin();
    });
    
    allSoundToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggleSound();
        allSoundToggles.forEach(t => {
          t.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
          t.classList.toggle('active', soundEnabled);
        });
      });
    });

    document.addEventListener('click', tryEnableSound, { once: true });
    document.addEventListener('touchstart', tryEnableSound, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
