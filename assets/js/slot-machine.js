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
  let soundToggle;
  let placeholder;
  let soundEnabled = false;
  let hasSpun = false;
  /** @type {number | null} */
  let spinInterval = null;
  const spinSound = new Audio(`${assetsUrl}/sounds/spin.mp3`);
  const winSound = new Audio(`${assetsUrl}/sounds/win.mp3`);
  spinSound.volume = 0.6;
  winSound.volume = 0.9;
  const getIconUrl = icon => `${assetsUrl}/img/${icon}`;

  /**
   * Randomize the reel icons for the spin animation.
   */
  function setRandomIcons() {
    const shuffled = [...icons].sort(() => Math.random() - 0.5);
    reels.forEach((reel, index) => {
      reel.innerHTML = `<img src="${getIconUrl(shuffled[index % icons.length])}" alt="" loading="lazy" decoding="async">`;
    });
  }

  /**
   * Show the surprise placeholder image before the first spin.
   */
  function showSurprise() {
    if (!hasSpun && placeholder) {
      placeholder.innerHTML = `<img src="${assetsUrl}/img/surprice-trans.png" alt="Surprise" class="tmw-surprise-img">`;
    }
  }

  /**
   * Toggle sound playback and update the UI state.
   */
  function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Enable Sound';
    soundToggle.classList.toggle('active', soundEnabled);
  }

  /**
   * Render win/loss results and optional claim CTA.
   */
  function showResult() {
    const isWin = Math.random() * 100 < winRate;
    const winIcon = icons[Math.floor(Math.random() * icons.length)];

    if (isWin) {
      reels.forEach(reel => {
        reel.innerHTML = `<img src="${getIconUrl(winIcon)}" alt="">`;
      });

      // Offers are index-aligned with the icons array in configuration.
      const offerIndex = icons.indexOf(winIcon);
      const offer = offers[offerIndex];

      if (offer && offer.title) {
        result.textContent = `🎉 ${offer.title}!`;
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
          claimBtn.rel = 'nofollow noopener';
          claimBtn.textContent = 'Claim Your Bonus';
          const slotRight = container.querySelector('.slot-right');
          if (slotRight) {
            slotRight.prepend(claimBtn);
          }
        }
      } else {
        result.textContent = '🎉 You Win!';
        result.className = 'tmw-result slot-result win-text show';
      }

      if (soundEnabled) {
        winSound.currentTime = 0;
        winSound.play().catch(() => {});
      }
    } else {
      const mixed = [...icons].sort(() => Math.random() - 0.5).slice(0, 3);
      if (mixed[0] === mixed[1] && mixed[1] === mixed[2]) {
        mixed[2] = icons.find(icon => icon !== mixed[0]) || mixed[2];
      }
      reels.forEach((reel, index) => {
        reel.innerHTML = `<img src="${getIconUrl(mixed[index])}" alt="">`;
      });
      result.textContent = 'Try Again!';
      result.className = 'tmw-result slot-result show';
    }

    btn.disabled = false;
    btn.textContent = 'Spin Again';
  }

  /**
   * Animate the reels, then resolve the result state.
   */
  function spin() {
    if (!hasSpun && placeholder) {
      placeholder.innerHTML = '';
    }
    hasSpun = true;
    btn.disabled = true;
    result.textContent = '';
    result.className = 'tmw-result slot-result';

    const oldClaim = container.querySelector('.tmw-claim-bonus');
    if (oldClaim) {
      oldClaim.remove();
    }

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

  /**
   * Initialize DOM references and bind listeners.
   */
  function init() {
    window.addEventListener('pagehide', () => {
      if (spinInterval != null) {
        clearInterval(spinInterval);
      }
      spinInterval = null;
    });

    container = document.querySelector('.tmw-slot-machine');
    if (!container) {
      return;
    }

    btn = document.getElementById('tmw-slot-btn');
    reels = container.querySelectorAll('.reel');
    result = container.querySelector('.tmw-result');
    soundToggle = document.getElementById('soundToggle');
    placeholder = container.querySelector('.tmw-slot-placeholder');

    if (!btn || reels.length === 0 || !result || !soundToggle) {
      return;
    }

    showSurprise();
    setRandomIcons();

    btn.addEventListener('click', spin);
    soundToggle.addEventListener('click', toggleSound);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
