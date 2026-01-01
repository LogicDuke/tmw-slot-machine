(function () {
  'use strict';

  // --- Configuration -------------------------------------------------------
  const DEFAULT_ASSETS_URL = '/wp-content/plugins/tmw-slot-machine/assets';
  const DEFAULT_ICONS = [
    'bonus.png',
    'peeks.png',
    'deal.png',
    'roses.png',
    'value.png'
  ];
  const SPIN_DURATION_MS = 1400;
  const SPIN_FRAME_MS = 120;

  // Pull runtime configuration from the global tmwSlot object.
  const config = typeof window !== 'undefined' && window.tmwSlot ? window.tmwSlot : {};
  const assetsBaseUrl = (config.assetsUrl || DEFAULT_ASSETS_URL).replace(/\/$/, '');
  const winRate = Number.isFinite(Number(config.winRate))
    ? Math.min(100, Math.max(0, Number(config.winRate)))
    : 20;
  const offers = Array.isArray(config.offers) ? config.offers : [];
  const headlineText = typeof config.headline === 'string' ? config.headline.trim() : '';

  // --- Icon helpers --------------------------------------------------------
  const iconUrlCache = new Map();

  const getIconPool = () => {
    if (Array.isArray(config.icons) && config.icons.length) {
      return config.icons.filter(Boolean);
    }
    return DEFAULT_ICONS.slice();
  };

  const getIconUrl = icon => {
    if (!icon) {
      return '';
    }

    if (iconUrlCache.has(icon)) {
      return iconUrlCache.get(icon);
    }

    const iconString = String(icon).trim();
    if (!iconString) {
      return '';
    }

    let url = '';
    if (/^(?:https?:)?\/\//i.test(iconString) || iconString.startsWith('data:')) {
      url = iconString;
    } else {
      const normalized = iconString.replace(/^\/+/, '').replace(/^img\//, '');
      url = `${assetsBaseUrl}/img/${normalized}`;
    }

    iconUrlCache.set(icon, url);
    return url;
  };

  // Preload icons for a smooth first spin.
  const preloadIcons = () => {
    getIconPool().forEach(icon => {
      const url = getIconUrl(icon);
      if (!url) {
        return;
      }
      const img = new Image();
      img.src = url;
    });
  };

  // --- Reel rendering helpers ----------------------------------------------
  const ensureReelImage = reel => {
    if (!reel) {
      return null;
    }
    let img = reel.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      img.draggable = false;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.display = 'block';
      img.style.pointerEvents = 'none';
      reel.innerHTML = '';
      reel.appendChild(img);
    }
    return img;
  };

  const setIconOnReel = (reel, icon) => {
    if (!reel) {
      return;
    }
    const url = getIconUrl(icon);
    if (!url) {
      return;
    }
    const img = ensureReelImage(reel);
    if (img) {
      img.src = url;
      const baseName = url.split('/').pop() || '';
      img.alt = baseName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
    }
    reel.style.backgroundImage = 'none';
    reel.style.backgroundSize = 'contain';
    reel.style.backgroundRepeat = 'no-repeat';
    reel.style.backgroundPosition = 'center';
  };

  const setRandomIconsOnReels = (reels, iconPool) => {
    const pool = iconPool.length ? iconPool : getIconPool();
    if (!reels.length || !pool.length) {
      return;
    }
    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    reels.forEach((reel, index) => {
      setIconOnReel(reel, shuffled[index % shuffled.length]);
    });
  };

  // --- DOM cache -----------------------------------------------------------
  const buildDomCache = container => {
    const button = container.querySelector('#tmw-slot-btn, .slot-btn');
    const reels = Array.from(container.querySelectorAll('.reel'));
    const result = container.querySelector('.slot-result, .tmw-result');
    const rightPanel = container.querySelector('.slot-right');
    const soundToggle = container.querySelector('#soundToggle, .sound-toggle, .tmw-sound-toggle');

    if (result && !result.classList.contains('slot-result')) {
      result.classList.add('slot-result');
    }

    // Prevent accidental interaction with reels.
    reels.forEach(reel => {
      reel.style.pointerEvents = 'none';
    });

    return {
      container,
      button,
      reels,
      result,
      rightPanel,
      soundToggle
    };
  };

  // --- Spin engine ---------------------------------------------------------
  const SpinEngine = {
    init(dom) {
      if (!dom || !dom.container || !dom.reels.length || !dom.result || !dom.button) {
        return;
      }

      this.dom = dom;
      this.hasSpun = false;
      this.isSpinning = false;
      this.iconPool = getIconPool();
      this.soundEnabled = false;
      this.winSound = new Audio(`${assetsBaseUrl}/sounds/win.mp3`);
      this.winSound.preload = 'auto';
      this.winSound.volume = 0.9;

      this.applyHeadline();
      this.setupSoundToggle();
      this.setButtonState();
      setRandomIconsOnReels(this.dom.reels, this.iconPool);

      this.dom.button.addEventListener('click', () => this.startSpin());
    },

    applyHeadline() {
      if (!headlineText) {
        return;
      }
      const { container } = this.dom;
      let headlineEl = container.querySelector('.slot-headline');
      if (!headlineEl) {
        headlineEl = document.createElement('div');
        headlineEl.className = 'slot-headline';
        const reelsWrapper = container.querySelector('.slot-reels, .tmw-reels');
        if (reelsWrapper) {
          container.insertBefore(headlineEl, reelsWrapper);
        } else {
          container.insertBefore(headlineEl, container.firstChild);
        }
      }
      headlineEl.textContent = headlineText;
    },

    setupSoundToggle() {
      if (!this.dom.soundToggle) {
        return;
      }
      this.updateSoundLabel();
      this.dom.soundToggle.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        if (!this.soundEnabled) {
          this.stopWinSound();
        }
        this.updateSoundLabel();
      });
    },

    updateSoundLabel() {
      if (!this.dom.soundToggle) {
        return;
      }
      const label = this.soundEnabled ? '🔊 Sound On' : '🔇 Enable Sound';
      this.dom.soundToggle.textContent = label;
      this.dom.soundToggle.setAttribute('aria-label', label);
      this.dom.soundToggle.classList.toggle('active', this.soundEnabled);
    },

    setButtonState() {
      if (!this.dom.button) {
        return;
      }
      this.dom.button.textContent = this.hasSpun ? 'Spin Again' : 'Spin Now';
      this.dom.button.disabled = false;
      this.dom.button.classList.remove('is-busy');
      if (!this.dom.button.hasAttribute('type')) {
        this.dom.button.setAttribute('type', 'button');
      }
    },

    clearResult() {
      if (!this.dom.result) {
        return;
      }
      this.dom.result.classList.remove('show', 'win-text', 'revealed');
      this.dom.result.textContent = '';
      this.dom.result.innerHTML = '';
    },

    renderClaimButton(url, label) {
      const { rightPanel } = this.dom;
      if (!rightPanel) {
        return;
      }

      rightPanel.querySelectorAll('.tmw-claim-bonus').forEach(node => node.remove());

      const trimmed = typeof url === 'string' ? url.trim() : '';
      if (!trimmed) {
        return;
      }

      const claim = document.createElement('a');
      claim.className = 'tmw-claim-bonus';
      claim.href = trimmed;
      claim.target = '_blank';
      claim.rel = 'nofollow noopener';
      claim.textContent = label || 'Claim Your Bonus';
      rightPanel.insertBefore(claim, rightPanel.firstChild);
    },

    showWin(icon) {
      const { result } = this.dom;
      if (!result) {
        return;
      }

      const offerIndex = DEFAULT_ICONS.indexOf(icon);
      const offer = offers[offerIndex];
      const title = offer && offer.title ? String(offer.title).trim() : '';
      const url = offer && offer.url ? String(offer.url).trim() : '';
      const message = title ? `🎉 ${title}!` : '🎉 Bonus!';

      result.innerHTML = '';
      result.classList.add('slot-result', 'win-text', 'show');
      const messageEl = document.createElement('div');
      messageEl.className = 'tmw-win-message';
      messageEl.textContent = message;
      result.appendChild(messageEl);

      this.renderClaimButton(url, title ? 'Claim Your Bonus' : 'Claim Your Bonus');
      this.animateWinReveal();
      this.hasSpun = true;
      this.setButtonState();
      this.playWinSound();
    },

    showLoss() {
      const { result } = this.dom;
      if (!result) {
        return;
      }
      result.textContent = 'Try Again!';
      result.classList.add('show');
      result.classList.remove('win-text', 'revealed');
      this.hasSpun = true;
      this.setButtonState();
    },

    animateWinReveal() {
      const { result } = this.dom;
      if (!result) {
        return;
      }
      result.classList.remove('revealed');
      void result.offsetWidth;
      requestAnimationFrame(() => {
        result.classList.add('revealed');
      });
    },

    stopWinSound() {
      try {
        this.winSound.pause();
        this.winSound.currentTime = 0;
      } catch (error) {
        // no-op
      }
    },

    playWinSound() {
      if (!this.soundEnabled) {
        return;
      }
      this.stopWinSound();
      const playPromise = this.winSound.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    },

    // Start a spin and update reels at a steady cadence.
    startSpin() {
      if (this.isSpinning) {
        return;
      }
      if (!this.dom.button) {
        return;
      }

      this.isSpinning = true;
      this.dom.button.disabled = true;
      this.dom.button.classList.add('is-busy');
      this.clearResult();
      this.renderClaimButton('');

      const reels = this.dom.reels;
      const iconPool = this.iconPool.length ? this.iconPool : getIconPool();
      const spinStart = performance.now();
      const spinInterval = window.setInterval(() => {
        const now = performance.now();
        if (now - spinStart >= SPIN_DURATION_MS) {
          window.clearInterval(spinInterval);
          this.finishSpin(iconPool);
          return;
        }
        reels.forEach(reel => {
          const icon = iconPool[Math.floor(Math.random() * iconPool.length)];
          setIconOnReel(reel, icon);
        });
      }, SPIN_FRAME_MS);
    },

    finishSpin(iconPool) {
      const reels = this.dom.reels;
      const isWin = Math.random() * 100 < winRate;

      if (isWin) {
        const winningIcon = iconPool[Math.floor(Math.random() * iconPool.length)];
        reels.forEach(reel => setIconOnReel(reel, winningIcon));
        this.showWin(winningIcon);
      } else {
        setRandomIconsOnReels(reels, iconPool);
        this.showLoss();
      }

      this.dom.button.disabled = false;
      this.dom.button.classList.remove('is-busy');
      this.isSpinning = false;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.tmw-slot-machine');
    if (!containers.length) {
      return;
    }

    preloadIcons();

    containers.forEach(container => {
      const dom = buildDomCache(container);
      const engine = Object.create(SpinEngine);
      engine.init(dom);
    });
  });
})();
