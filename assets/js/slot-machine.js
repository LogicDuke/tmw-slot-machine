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
  
  const spinSound = new Audio(assetsUrl + '/sounds/spin.mp3');
  const winSound = new Audio(assetsUrl + '/sounds/win.mp3');
  spinSound.volume = 0.6;
  winSound.volume = 0.9;
  
  function getIconUrl(icon) {
    return assetsUrl + '/img/' + icon;
  }

  function setRandomIcons() {
    const shuffled = icons.slice().sort(function() { return Math.random() - 0.5; });
    reels.forEach(function(reel, index) {
      reel.innerHTML = '<img src="' + getIconUrl(shuffled[index % icons.length]) + '" alt="" loading="lazy" decoding="async" style="width:78%!important;height:78%!important;object-fit:contain!important;">';
    });
  }

  function updateSoundUI() {
    var allToggles = container ? container.querySelectorAll('.tmw-slot-sound-toggle, .sound-toggle') : [];
    allToggles.forEach(function(toggle) {
      toggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
      toggle.className = soundEnabled ? 'sound-toggle tmw-slot-sound-toggle active' : 'sound-toggle tmw-slot-sound-toggle';
      // Force gold color inline
      toggle.style.cssText = 'color: ' + (soundEnabled ? '#d4af37' : 'rgba(212, 175, 55, 0.5)') + ' !important; background: transparent !important; border: none !important;';
    });
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundUI();
  }

  function tryEnableSound() {
    spinSound.play().then(function() {
      spinSound.pause();
      spinSound.currentTime = 0;
    }).catch(function() {});
  }

  function setReelsSpinning(isSpinning) {
    reels.forEach(function(reel) {
      if (isSpinning) {
        reel.classList.add('spinning');
      } else {
        reel.classList.remove('spinning');
      }
    });
  }

  function setReelsWin(isWin) {
    reels.forEach(function(reel) {
      if (isWin) {
        reel.classList.add('win');
        reel.style.borderColor = '#d4af37';
      } else {
        reel.classList.remove('win');
        reel.style.borderColor = 'rgba(212, 175, 55, 0.15)';
      }
    });
  }

  function applyClaimButtonStyles(claimBtn) {
    claimBtn.style.cssText = 'display: inline-flex !important; align-items: center !important; justify-content: center !important; min-width: 140px !important; height: 40px !important; padding: 0 20px !important; border: none !important; border-radius: 4px !important; font-family: Montserrat, sans-serif !important; font-size: 10px !important; font-weight: 700 !important; letter-spacing: 1.5px !important; text-transform: uppercase !important; text-decoration: none !important; color: #0f0f0f !important; background: linear-gradient(180deg, #f4e4bc 0%, #d4af37 50%, #a68b2c 100%) !important; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.35) !important; margin-bottom: 8px !important;';
  }

  function applyResultStyles(el, isWin) {
    if (isWin) {
      el.style.cssText = 'font-family: Montserrat, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; text-align: center !important; max-width: 150px !important; line-height: 1.3 !important; color: #f4e4bc !important; text-shadow: 0 0 10px #d4af37, 0 0 20px #d4af37 !important;';
    } else {
      el.style.cssText = 'font-family: Montserrat, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; text-align: center !important; max-width: 150px !important; line-height: 1.3 !important; color: rgba(255, 255, 255, 0.6) !important;';
    }
  }

  function showResult() {
    setReelsSpinning(false);
    
    var isWin = Math.random() * 100 < winRate;
    var winIcon = icons[Math.floor(Math.random() * icons.length)];

    if (isWin) {
      container.classList.add('winning');
      setTimeout(function() { container.classList.remove('winning'); }, 800);
      
      reels.forEach(function(reel) {
        reel.innerHTML = '<img src="' + getIconUrl(winIcon) + '" alt="" style="width:78%!important;height:78%!important;object-fit:contain!important;">';
      });
      
      setReelsWin(true);

      var offerIndex = icons.indexOf(winIcon);
      var offer = offers[offerIndex];

      if (offer && offer.title) {
        result.textContent = offer.title;
        result.className = 'tmw-result slot-result win-text show';
        applyResultStyles(result, true);

        var claimHref = '';
        if (offer.url) {
          try {
            var url = new URL(offer.url, window.location.href);
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              claimHref = url.href;
            }
          } catch(e) {
            claimHref = '';
          }
        }

        if (claimHref) {
          var claimBtn = document.createElement('a');
          claimBtn.className = 'tmw-claim-bonus';
          claimBtn.href = claimHref;
          claimBtn.target = '_blank';
          claimBtn.rel = 'nofollow noopener noreferrer';
          claimBtn.textContent = 'Claim Bonus';
          applyClaimButtonStyles(claimBtn);
          var slotRight = container.querySelector('.slot-right');
          if (slotRight) {
            slotRight.insertBefore(claimBtn, slotRight.firstChild);
          }
        }
      } else {
        result.textContent = 'You Win!';
        result.className = 'tmw-result slot-result win-text show';
        applyResultStyles(result, true);
      }

      if (soundEnabled) {
        winSound.currentTime = 0;
        winSound.play().catch(function() {});
      }
    } else {
      setReelsWin(false);
      
      var mixed = icons.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 3);
      if (mixed[0] === mixed[1] && mixed[1] === mixed[2]) {
        mixed[2] = icons.find(function(icon) { return icon !== mixed[0]; }) || mixed[2];
      }
      reels.forEach(function(reel, index) {
        reel.innerHTML = '<img src="' + getIconUrl(mixed[index]) + '" alt="" style="width:78%!important;height:78%!important;object-fit:contain!important;">';
      });
      result.textContent = 'Try Again!';
      result.className = 'tmw-result slot-result lose-text show';
      applyResultStyles(result, false);
    }

    btn.disabled = false;
    btn.textContent = 'Spin Again';
  }

  function spin() {
    // Hide placeholder ONLY on first spin
    if (!hasSpun && placeholder) {
      placeholder.style.display = 'none';
    }
    hasSpun = true;
    btn.disabled = true;
    result.textContent = '';
    result.className = 'tmw-result slot-result';
    result.style.cssText = '';
    setReelsWin(false);

    var oldClaim = container.querySelector('.tmw-claim-bonus');
    if (oldClaim) {
      oldClaim.parentNode.removeChild(oldClaim);
    }

    setReelsSpinning(true);

    var elapsed = 0;
    var duration = 1400;
    if (spinInterval) {
      clearInterval(spinInterval);
    }
    spinInterval = setInterval(function() {
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
      spinSound.play().catch(function() {});
    }
  }

  function forceContainerStyles() {
    if (!container) return;
    
    // Force gold border directly on container
    container.style.border = '2px solid rgba(212, 175, 55, 0.5)';
    container.style.borderColor = 'rgba(212, 175, 55, 0.5)';
    container.style.borderStyle = 'solid';
    container.style.borderWidth = '2px';
    
    // Force placeholder visible
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.style.visibility = 'visible';
      placeholder.style.opacity = '1';
    }
    
    // Force teaser text visible
    var teaserText = container.querySelector('.teaser-text');
    if (teaserText) {
      teaserText.style.display = 'inline';
      teaserText.style.visibility = 'visible';
      teaserText.style.color = '#f4e4bc';
    }
    
    var teaserSub = container.querySelector('.teaser-sub');
    if (teaserSub) {
      teaserSub.style.display = 'inline';
      teaserSub.style.visibility = 'visible';
      teaserSub.style.color = 'rgba(212, 175, 55, 0.5)';
    }
  }

  function init() {
    window.addEventListener('pagehide', function() {
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

    var allSoundToggles = container.querySelectorAll('.tmw-slot-sound-toggle, .sound-toggle');

    if (!btn || reels.length === 0 || !result) {
      return;
    }

    // CRITICAL: Force container styles FIRST
    forceContainerStyles();

    // Initialize sound UI with gold colors
    updateSoundUI();

    // Set random icons in reels
    setRandomIcons();

    // NOTE: We do NOT call showSurprise() - teaser text stays visible!

    btn.addEventListener('click', function() {
      tryEnableSound();
      spin();
    });
    
    allSoundToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function() {
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
