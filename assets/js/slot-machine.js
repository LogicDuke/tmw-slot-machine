(function () {
  'use strict';
  
  var config = window.tmwSlot || {};
  var assetsUrl = config.assetsUrl || '/wp-content/plugins/tmw-slot-machine/assets';
  var winRate = Number.isFinite(config.winRate) ? config.winRate : 50;
  var offers = Array.isArray(config.offers) ? config.offers : [];
  var icons = ['bonus.png', 'peeks.png', 'deal.png', 'roses.png', 'value.png'];
  
  var defaultOffers = [
    { title: '70% OFF Welcome Bonus', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' },
    { title: '10 Free Peeks', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' },
    { title: 'Hot Deal: Private Shows', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' },
    { title: '15% OFF Million Roses', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' },
    { title: 'Best Value – From 0.01 Credits', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' }
  ];
  
  if (!offers || offers.length === 0) {
    offers = defaultOffers;
  }
  
  var container;
  var btn;
  var reels;
  var result;
  var placeholder;
  var teaserText;
  var teaserSub;
  var soundEnabled = false; // DEFAULT OFF
  var hasSpun = false;
  var spinInterval = null;
  var spinSound = null;
  var winSound = null;
  var soundsLoaded = false;
  
  function loadSounds() {
    if (soundsLoaded) return;
    try {
      spinSound = new Audio(assetsUrl + '/sounds/spin.mp3');
      winSound = new Audio(assetsUrl + '/sounds/win.mp3');
      spinSound.volume = 0.6;
      winSound.volume = 0.9;
      spinSound.preload = 'auto';
      winSound.preload = 'auto';
      soundsLoaded = true;
    } catch (e) {}
  }
  
  function getIconUrl(icon) {
    return assetsUrl + '/img/' + icon;
  }

  function setRandomIcons() {
    var shuffled = icons.slice().sort(function() { return Math.random() - 0.5; });
    reels.forEach(function(reel, index) {
      reel.innerHTML = '<img src="' + getIconUrl(shuffled[index % icons.length]) + '" alt="" loading="lazy" decoding="async" style="width:78%!important;height:78%!important;object-fit:contain!important;">';
    });
  }

  function updateSoundUI() {
    var allToggles = container ? container.querySelectorAll('.tmw-slot-sound-toggle, .sound-toggle') : [];
    allToggles.forEach(function(toggle) {
      toggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
      toggle.className = soundEnabled ? 'sound-toggle tmw-slot-sound-toggle active' : 'sound-toggle tmw-slot-sound-toggle';
      toggle.style.cssText = 'color: ' + (soundEnabled ? '#d4af37' : 'rgba(212, 175, 55, 0.5)') + ' !important; background: transparent !important; border: none !important; font-family: Montserrat, sans-serif !important; font-size: 9px !important; cursor: pointer !important;';
    });
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundUI();
    if (soundEnabled) {
      loadSounds();
      playSound(spinSound, true);
    }
  }

  function playSound(sound, justUnlock) {
    if (!soundEnabled || !sound) return;
    try {
      sound.currentTime = 0;
      var playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise.then(function() {
          if (justUnlock) {
            sound.pause();
            sound.currentTime = 0;
          }
        }).catch(function() {});
      }
    } catch (e) {}
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
        reel.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 12px rgba(212,175,55,0.25)';
      } else {
        reel.classList.remove('win');
        reel.style.borderColor = 'rgba(212, 175, 55, 0.15)';
        reel.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.4)';
      }
    });
  }

  function hideTeaser() {
    if (placeholder) {
      placeholder.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; overflow: hidden !important;';
    }
    if (teaserText) {
      teaserText.style.cssText = 'display: none !important; visibility: hidden !important;';
    }
    if (teaserSub) {
      teaserSub.style.cssText = 'display: none !important; visibility: hidden !important;';
    }
  }

  function showTeaser() {
    if (placeholder) {
      placeholder.style.cssText = 'display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; gap: 4px !important; text-align: center !important; visibility: visible !important; opacity: 1 !important; height: auto !important; overflow: visible !important;';
    }
    if (teaserText) {
      teaserText.style.cssText = 'display: inline !important; visibility: visible !important; color: #f4e4bc !important; font-family: "Playfair Display", serif !important; font-size: 14px !important; font-weight: 600 !important; text-shadow: 0 0 10px #d4af37, 0 0 20px #d4af37, 0 0 30px rgba(212,175,55,0.5) !important;';
    }
    if (teaserSub) {
      teaserSub.style.cssText = 'display: inline !important; visibility: visible !important; color: rgba(212, 175, 55, 0.5) !important; font-family: Montserrat, sans-serif !important; font-size: 9px !important; letter-spacing: 1px !important; text-transform: uppercase !important;';
    }
  }

  function createClaimButton(href) {
    var claimBtn = document.createElement('a');
    claimBtn.className = 'tmw-claim-bonus';
    claimBtn.href = href;
    claimBtn.target = '_blank';
    claimBtn.rel = 'nofollow noopener noreferrer';
    claimBtn.textContent = 'CLAIM BONUS';
    claimBtn.style.cssText = 'display: inline-flex !important; visibility: visible !important; opacity: 1 !important; align-items: center !important; justify-content: center !important; min-width: 140px !important; height: 40px !important; padding: 0 20px !important; border: none !important; border-radius: 4px !important; font-family: Montserrat, sans-serif !important; font-size: 11px !important; font-weight: 700 !important; letter-spacing: 1.5px !important; text-transform: uppercase !important; text-decoration: none !important; color: #0f0f0f !important; background: linear-gradient(180deg, #f4e4bc 0%, #d4af37 50%, #a68b2c 100%) !important; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.35) !important; margin-bottom: 8px !important; cursor: pointer !important;';
    return claimBtn;
  }

  function showResult() {
    setReelsSpinning(false);
    
    var isWin = Math.random() * 100 < winRate;
    var winIconIndex = Math.floor(Math.random() * icons.length);
    var winIcon = icons[winIconIndex];

    // Remove old claim button
    var oldClaim = container.querySelector('.tmw-claim-bonus');
    if (oldClaim) {
      oldClaim.parentNode.removeChild(oldClaim);
    }

    if (isWin) {
      // WIN: Hide teaser, show CLAIM BONUS + bonus title
      hideTeaser();
      
      container.classList.add('winning');
      setTimeout(function() { container.classList.remove('winning'); }, 800);
      
      reels.forEach(function(reel) {
        reel.innerHTML = '<img src="' + getIconUrl(winIcon) + '" alt="" style="width:78%!important;height:78%!important;object-fit:contain!important;">';
      });
      
      setReelsWin(true);

      var offer = offers[winIconIndex];
      var slotRight = container.querySelector('.slot-right');
      
      if (!offer || !offer.title) {
        offer = offers[0] || defaultOffers[0];
      }
      
      if (offer && offer.title) {
        result.textContent = offer.title;
        result.className = 'tmw-result slot-result win-text show';
        result.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; font-family: Montserrat, sans-serif !important; font-size: 13px !important; font-weight: 600 !important; text-align: center !important; max-width: 160px !important; line-height: 1.3 !important; color: #f4e4bc !important; text-shadow: 0 0 10px #d4af37, 0 0 20px #d4af37 !important; margin-top: 4px !important;';

        if (offer.url && slotRight) {
          var claimBtn = createClaimButton(offer.url);
          slotRight.insertBefore(claimBtn, slotRight.firstChild);
        }
      } else {
        result.textContent = 'You Win!';
        result.className = 'tmw-result slot-result win-text show';
        result.style.cssText = 'display: block !important; visibility: visible !important; font-family: Montserrat, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; text-align: center !important; color: #f4e4bc !important; text-shadow: 0 0 10px #d4af37 !important;';
      }

      if (soundEnabled && winSound) {
        playSound(winSound);
      }
    } else {
      // LOSE: Show teaser + Try Again!
      setReelsWin(false);
      
      var mixed = icons.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 3);
      if (mixed[0] === mixed[1] && mixed[1] === mixed[2]) {
        mixed[2] = icons.find(function(icon) { return icon !== mixed[0]; }) || mixed[2];
      }
      reels.forEach(function(reel, index) {
        reel.innerHTML = '<img src="' + getIconUrl(mixed[index]) + '" alt="" style="width:78%!important;height:78%!important;object-fit:contain!important;">';
      });
      
      // SHOW teaser text again on LOSE
      showTeaser();
      
      // Show Try Again below teaser
      result.textContent = 'Try Again!';
      result.className = 'tmw-result slot-result lose-text show';
      result.style.cssText = 'display: block !important; visibility: visible !important; font-family: Montserrat, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; text-align: center !important; color: rgba(255, 255, 255, 0.6) !important; margin-top: 4px !important;';
    }

    btn.disabled = false;
    btn.textContent = 'Spin Again';
  }

  function spin() {
    loadSounds();
    
    // Hide teaser during spinning animation
    hideTeaser();
    
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

    if (soundEnabled && spinSound) {
      playSound(spinSound);
    }

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
  }

  function forceContainerStyles() {
    if (!container) return;
    
    // Use cssText with !important to override any theme CSS
    container.style.cssText = container.style.cssText + '; border: 2px solid rgba(212, 175, 55, 0.5) !important; border-color: rgba(212, 175, 55, 0.5) !important; border-style: solid !important; border-width: 2px !important; border-radius: 8px !important; outline: none !important;';
  }

  function init() {
    window.addEventListener('pagehide', function() {
      if (spinInterval) {
        clearInterval(spinInterval);
      }
      spinInterval = null;
    });

    container = document.querySelector('.tmw-slot-machine');
    if (!container) return;

    btn = container.querySelector('.tmw-slot-btn');
    reels = container.querySelectorAll('.reel');
    result = container.querySelector('.tmw-result');
    placeholder = container.querySelector('.tmw-slot-placeholder');
    teaserText = container.querySelector('.teaser-text');
    teaserSub = container.querySelector('.teaser-sub');

    if (!btn || reels.length === 0 || !result) return;

    // Read sound default from data attribute (defaults to 'off' now)
    var soundDefault = container.getAttribute('data-sound-default');
    soundEnabled = (soundDefault === 'on');

    // Force gold border
    forceContainerStyles();
    
    updateSoundUI();
    setRandomIcons();
    showTeaser();

    btn.addEventListener('click', function() {
      spin();
    });
    
    var allSoundToggles = container.querySelectorAll('.tmw-slot-sound-toggle, .sound-toggle');
    allSoundToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSound();
      });
    });

    document.addEventListener('click', function() { loadSounds(); }, { once: true });
    document.addEventListener('touchstart', function() { loadSounds(); }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
