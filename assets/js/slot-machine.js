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

  // REMOVED: showSurprise() function - we want teaser text to stay visible

  function updateSoundUI() {
    const allToggles = container ? container.querySelectorAll('.tmw-slot-sound-toggle, .sound-toggle') : [];
    allToggles.forEach(toggle => {
      toggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
      toggle.classList.toggle('active', soundEnabled);
      // Force gold color via JS
      toggle.style.color = soundEnabled ? '#d4af37' : 'rgba(212, 175, 55, 0.5)';
    });
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

  function applyClaimButtonStyles(btn) {
    // Apply inline styles to dynamically created claim button
    btn.style.cssText = `
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-width: 140px !important;
      height: 40px !important;
      padding: 0 20px !important;
      border: none !important;
      border-radius: 4px !important;
      font-family: Montserrat, sans-serif !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      letter-spacing: 1.5px !important;
      text-transform: uppercase !important;
      text-decoration: none !important;
      color: #0f0f0f !important;
      background: linear-gradient(180deg, #f4e4bc 0%, #d4af37 50%, #a68b2c 100%) !important;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.35) !important;
      margin-bottom: 8px !important;
    `;
  }

  function applyResultStyles(el, isWin) {
    el.style.cssText = `
      font-family: Montserrat, sans-serif !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      text-align: center !important;
      max-width: 150px !important;
      line-height: 1.3 !important;
      color: ${isWin ? '#f4e4bc' : 'rgba(255, 255, 255, 0.6)'} !important;
      ${isWin ? 'text-shadow: 0 0 10px #d4af37 !important;' : ''}
    `;
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
        applyResultStyles(result, true);

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
          applyClaimButtonStyles(claimBtn);
          const slotRight = container.querySelector('.slot-right');
          if (slotRight) {
            slotRight.prepend(claimBtn);
          }
        }
      } else {
        result.textContent = 'You Win!';
        result.className = 'tmw-result slot-result win-text show';
        applyResultStyles(result, true);
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
      applyResultStyles(result, false);
    }

    btn.disabled = false;
    btn.textContent = 'Spin Again';
  }

  function spin() {
    // Hide placeholder on first spin
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

  function forceContainerStyles() {
    if (!container) return;
    
    // Force gold border on container
    container.style.border = '2px solid rgba(212, 175, 55, 0.5)';
    container.style.borderColor = 'rgba(212, 175, 55, 0.5)';
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

    // Force container styles
    forceContainerStyles();

    // Initialize sound UI
    updateSoundUI();

    // Set random icons in reels (but keep teaser text visible!)
    setRandomIcons();

    // NOTE: We do NOT call showSurprise() anymore - teaser text stays visible

    btn.addEventListener('click', () => {
      tryEnableSound();
      spin();
    });
    
    allSoundToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggleSound();
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
