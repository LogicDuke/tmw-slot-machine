(function () {
  'use strict';
  
  var config = window.tmwSlot || {};
  var assetsUrl = config.assetsUrl || '/wp-content/plugins/tmw-slot-machine/assets';
  var winRate = Number.isFinite(config.winRate) ? config.winRate : 50;
  var offers = Array.isArray(config.offers) ? config.offers : [];
  var icons = ['bonus.png', 'peeks.png', 'deal.png', 'roses.png', 'value.png'];
  
  // Default offers if none configured (fallback)
  var defaultOffers = [
    { title: '70% OFF Welcome Bonus', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' },
    { title: '10 Free Peeks', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' },
    { title: 'Hot Deal: Private Shows', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' },
    { title: '15% OFF Million Roses', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' },
    { title: 'Best Value – From 0.01 Credits', url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u' }
  ];
  
  // Use default offers if none provided
  if (!offers || offers.length === 0) {
    offers = defaultOffers;
  }
  
  var container;
  var btn;
  var reels;
  var result;
  var placeholder;
  var soundEnabled = true; // Default to ON so users hear sound
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
    } catch (e) {
      console.log('[TMW Slot] Could not load sounds');
    }
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
    // Try to unlock audio on toggle
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
        }).catch(function() {
          // Autoplay blocked - that's ok
        });
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

  function showWinResult(offer, slotRight) {
    // Show bonus title text
    result.textContent = offer.title;
    result.className = 'tmw-result slot-result win-text show';
    result.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; font-family: Montserrat, sans-serif !important; font-size: 13px !important; font-weight: 600 !important; text-align: center !important; max-width: 160px !important; line-height: 1.3 !important; color: #f4e4bc !important; text-shadow: 0 0 10px #d4af37, 0 0 20px #d4af37 !important; margin-top: 4px !important;';

    // Create and add CLAIM BONUS button
    if (offer.url && slotRight) {
      var claimBtn = createClaimButton(offer.url);
      slotRight.insertBefore(claimBtn, slotRight.firstChild);
    }
  }

  function showResult() {
    setReelsSpinning(false);
    
    // Ensure placeholder stays hidden (no "Your Bonus Awaits" after spin)
    if (placeholder) {
      placeholder.style.display = 'none';
    }
    
    var isWin = Math.random() * 100 < winRate;
    var winIconIndex = Math.floor(Math.random() * icons.length);
    var winIcon = icons[winIconIndex];

    // Remove old claim button if exists
    var oldClaim = container.querySelector('.tmw-claim-bonus');
    if (oldClaim) {
      oldClaim.parentNode.removeChild(oldClaim);
    }

    if (isWin) {
      container.classList.add('winning');
      setTimeout(function() { container.classList.remove('winning'); }, 800);
      
      // Set all reels to winning icon
      reels.forEach(function(reel) {
        reel.innerHTML = '<img src="' + getIconUrl(winIcon) + '" alt="" style="width:78%!important;height:78%!important;object-fit:contain!important;">';
      });
      
      setReelsWin(true);

      // Get the offer for this icon
      var offer = offers[winIconIndex];
      var slotRight = container.querySelector('.slot-right');
      
      // If no offer at that index, use first available offer
      if (!offer || !offer.title) {
        offer = offers[0] || defaultOffers[0];
      }
      
      if (offer && offer.title) {
        showWinResult(offer, slotRight);
      } else {
        // Fallback if still no offer
        result.textContent = 'You Win!';
        result.className = 'tmw-result slot-result win-text show';
        result.style.cssText = 'display: block !important; visibility: visible !important; font-family: Montserrat, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; text-align: center !important; color: #f4e4bc !important; text-shadow: 0 0 10px #d4af37 !important;';
      }

      // Play win sound
      if (soundEnabled && winSound) {
        playSound(winSound);
      }
    } else {
      // LOSE
      setReelsWin(false);
      
      // Set mixed icons (not all same)
      var mixed = icons.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 3);
      if (mixed[0] === mixed[1] && mixed[1] === mixed[2]) {
        mixed[2] = icons.find(function(icon) { return icon !== mixed[0]; }) || mixed[2];
      }
      reels.forEach(function(reel, index) {
        reel.innerHTML = '<img src="' + getIconUrl(mixed[index]) + '" alt="" style="width:78%!important;height:78%!important;object-fit:contain!important;">';
      });
      
      // Show Try Again text
      result.textContent = 'Try Again!';
      result.className = 'tmw-result slot-result lose-text show';
      result.style.cssText = 'display: block !important; visibility: visible !important; font-family: Montserrat, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; text-align: center !important; color: rgba(255, 255, 255, 0.6) !important;';
    }

    btn.disabled = false;
    btn.textContent = 'Spin Again';
  }

  function spin() {
    // Load sounds on first interaction
    loadSounds();
    
    // ALWAYS hide placeholder when spinning (Your Bonus Awaits disappears)
    if (placeholder) {
      placeholder.style.display = 'none';
    }
    hasSpun = true;
    
    btn.disabled = true;
    result.textContent = '';
    result.className = 'tmw-result slot-result';
    result.style.cssText = '';
    setReelsWin(false);

    // Remove old claim button
    var oldClaim = container.querySelector('.tmw-claim-bonus');
    if (oldClaim) {
      oldClaim.parentNode.removeChild(oldClaim);
    }

    setReelsSpinning(true);

    // Play spin sound
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
    
    // Force gold border
    container.style.border = '2px solid rgba(212, 175, 55, 0.5)';
    container.style.borderColor = 'rgba(212, 175, 55, 0.5)';
    container.style.borderStyle = 'solid';
    container.style.borderWidth = '2px';
    container.style.borderRadius = '8px';
    container.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)';
    container.style.boxShadow = '0 0 0 1px rgba(212,175,55,0.4), 0 0 0 3px rgba(212,175,55,0.15), 0 20px 40px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)';
    
    // Force placeholder visible initially
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.style.visibility = 'visible';
      placeholder.style.opacity = '1';
    }
    
    // Force teaser text styles
    var teaserText = container.querySelector('.teaser-text');
    if (teaserText) {
      teaserText.style.cssText = 'display: inline !important; visibility: visible !important; color: #f4e4bc !important; font-family: "Playfair Display", serif !important; font-size: 14px !important; font-weight: 600 !important; text-shadow: 0 0 10px #d4af37, 0 0 20px #d4af37, 0 0 30px rgba(212,175,55,0.5) !important;';
    }
    
    var teaserSub = container.querySelector('.teaser-sub');
    if (teaserSub) {
      teaserSub.style.cssText = 'display: inline !important; visibility: visible !important; color: rgba(212, 175, 55, 0.5) !important; font-family: Montserrat, sans-serif !important; font-size: 9px !important; letter-spacing: 1px !important; text-transform: uppercase !important;';
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

    if (!btn || reels.length === 0 || !result) {
      return;
    }

    // Read sound default from data attribute
    var soundDefault = container.getAttribute('data-sound-default');
    soundEnabled = (soundDefault === 'on');

    // Force container styles
    forceContainerStyles();

    // Initialize sound UI
    updateSoundUI();

    // Set random icons in reels
    setRandomIcons();

    // Spin button click
    btn.addEventListener('click', function() {
      spin();
    });
    
    // Sound toggle click
    var allSoundToggles = container.querySelectorAll('.tmw-slot-sound-toggle, .sound-toggle');
    allSoundToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSound();
      });
    });

    // Preload sounds on any user interaction
    document.addEventListener('click', function() { loadSounds(); }, { once: true });
    document.addEventListener('touchstart', function() { loadSounds(); }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
