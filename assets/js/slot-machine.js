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
  
  var container, btn, reels, result, placeholder, teaserText, teaserSub;
  var soundEnabled = false;
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
      soundsLoaded = true;
    } catch (e) {}
  }
  
  function getIconUrl(icon) {
    return assetsUrl + '/img/' + icon;
  }

  function setRandomIcons() {
    var shuffled = icons.slice().sort(function() { return Math.random() - 0.5; });
    reels.forEach(function(reel, index) {
      reel.innerHTML = '<img src="' + getIconUrl(shuffled[index % icons.length]) + '" alt="">';
    });
  }

  function updateSoundUI() {
    var allToggles = container.querySelectorAll('.sound-toggle');
    allToggles.forEach(function(toggle) {
      toggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
      toggle.style.color = soundEnabled ? '#d4af37' : 'rgba(212,175,55,0.5)';
    });
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundUI();
    if (soundEnabled) {
      loadSounds();
      if (spinSound) {
        spinSound.play().then(function() {
          spinSound.pause();
          spinSound.currentTime = 0;
        }).catch(function() {});
      }
    }
  }

  function playSound(sound) {
    if (!soundEnabled || !sound) return;
    sound.currentTime = 0;
    sound.play().catch(function() {});
  }

  function hideTeaser() {
    if (placeholder) placeholder.style.cssText = 'display:none!important;';
    if (teaserText) teaserText.style.cssText = 'display:none!important;';
    if (teaserSub) teaserSub.style.cssText = 'display:none!important;';
  }

  function showTeaser() {
    if (placeholder) placeholder.style.cssText = 'display:flex!important;flex-direction:column!important;align-items:center!important;gap:4px!important;';
    if (teaserText) teaserText.style.cssText = 'display:inline!important;color:#f4e4bc!important;font-family:"Playfair Display",serif!important;font-size:14px!important;font-weight:600!important;text-shadow:0 0 10px #d4af37,0 0 20px #d4af37!important;';
    if (teaserSub) teaserSub.style.cssText = 'display:inline!important;color:rgba(212,175,55,0.5)!important;font-size:9px!important;letter-spacing:1px!important;text-transform:uppercase!important;';
  }

  function createClaimButton(href) {
    var btn = document.createElement('a');
    btn.className = 'tmw-claim-bonus';
    btn.href = href;
    btn.target = '_blank';
    btn.rel = 'nofollow noopener noreferrer';
    btn.textContent = 'CLAIM BONUS';
    btn.style.cssText = 'display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:140px!important;height:40px!important;padding:0 20px!important;border:none!important;border-radius:4px!important;font-family:Montserrat,sans-serif!important;font-size:11px!important;font-weight:700!important;letter-spacing:1.5px!important;text-transform:uppercase!important;text-decoration:none!important;color:#0f0f0f!important;background:linear-gradient(180deg,#f4e4bc 0%,#d4af37 50%,#a68b2c 100%)!important;box-shadow:0 4px 15px rgba(212,175,55,0.35)!important;margin-bottom:8px!important;cursor:pointer!important;';
    return btn;
  }

  function showResult() {
    reels.forEach(function(r) { r.classList.remove('spinning'); });
    
    var isWin = Math.random() * 100 < winRate;
    var winIconIndex = Math.floor(Math.random() * icons.length);
    var winIcon = icons[winIconIndex];

    var oldClaim = container.querySelector('.tmw-claim-bonus');
    if (oldClaim) oldClaim.remove();

    if (isWin) {
      hideTeaser();
      reels.forEach(function(r) {
        r.innerHTML = '<img src="' + getIconUrl(winIcon) + '" alt="">';
        r.classList.add('win');
      });

      var offer = offers[winIconIndex] || offers[0] || defaultOffers[0];
      var slotRight = container.querySelector('.slot-right');
      
      if (offer && offer.title) {
        result.textContent = offer.title;
        result.className = 'tmw-result slot-result win-text show';
        result.style.cssText = 'display:block!important;color:#f4e4bc!important;font-size:13px!important;font-weight:600!important;text-shadow:0 0 10px #d4af37!important;margin-top:4px!important;';
        if (offer.url && slotRight) {
          slotRight.insertBefore(createClaimButton(offer.url), slotRight.firstChild);
        }
      }
      playSound(winSound);
    } else {
      reels.forEach(function(r) { r.classList.remove('win'); });
      var mixed = icons.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 3);
      if (mixed[0] === mixed[1] && mixed[1] === mixed[2]) mixed[2] = icons.find(function(i) { return i !== mixed[0]; });
      reels.forEach(function(r, i) {
        r.innerHTML = '<img src="' + getIconUrl(mixed[i]) + '" alt="">';
      });
      
      showTeaser();
      result.textContent = 'Try Again!';
      result.className = 'tmw-result slot-result lose-text show';
      result.style.cssText = 'display:block!important;color:rgba(255,255,255,0.6)!important;font-size:14px!important;font-weight:600!important;margin-top:4px!important;';
    }

    btn.disabled = false;
    btn.textContent = 'Spin Again';
  }

  function spin() {
    loadSounds();
    hideTeaser();
    
    btn.disabled = true;
    result.textContent = '';
    result.style.cssText = '';
    reels.forEach(function(r) { r.classList.remove('win'); });

    var oldClaim = container.querySelector('.tmw-claim-bonus');
    if (oldClaim) oldClaim.remove();

    reels.forEach(function(r) { r.classList.add('spinning'); });
    playSound(spinSound);

    var elapsed = 0;
    if (spinInterval) clearInterval(spinInterval);
    spinInterval = setInterval(function() {
      setRandomIcons();
      elapsed += 110;
      if (elapsed >= 1400) {
        clearInterval(spinInterval);
        spinInterval = null;
        showResult();
      }
    }, 110);
  }

  function init() {
    container = document.querySelector('.tmw-slot-machine');
    if (!container) return;

    btn = container.querySelector('.tmw-slot-btn');
    reels = container.querySelectorAll('.reel');
    result = container.querySelector('.tmw-result');
    placeholder = container.querySelector('.tmw-slot-placeholder');
    teaserText = container.querySelector('.teaser-text');
    teaserSub = container.querySelector('.teaser-sub');

    if (!btn || reels.length === 0 || !result) return;

    soundEnabled = container.getAttribute('data-sound-default') === 'on';

    updateSoundUI();
    setRandomIcons();
    showTeaser();

    btn.addEventListener('click', spin);
    
    container.querySelectorAll('.sound-toggle').forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        toggleSound();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
