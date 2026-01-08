const tmwSlotConfig = typeof tmwSlot !== 'undefined' && tmwSlot ? tmwSlot : {};
const DEFAULT_ICONS = ['bonus.png', 'peeks.png', 'deal.png', 'roses.png', 'value.png'];
const OFFER_ICON_ORDER = ['bonus.png', 'peeks.png', 'deal.png', 'roses.png', 'value.png'];
const normalizeBase = base => (base ? String(base).trim().replace(/\/+$/, '') : '');
const resolveAssetsBaseUrl = () => (tmwSlotConfig.assetsUrl ? normalizeBase(tmwSlotConfig.assetsUrl) : tmwSlotConfig.url ? `${normalizeBase(tmwSlotConfig.url)}/assets` : '');
const getIconPool = () => (Array.isArray(tmwSlotConfig.icons) && tmwSlotConfig.icons.length ? tmwSlotConfig.icons.filter(Boolean) : DEFAULT_ICONS.slice());
const getWinRate = container => {
  const configured = Number(tmwSlotConfig.winRate);
  if (Number.isFinite(configured)) return Math.min(100, Math.max(0, configured));
  const fromData = Number(container?.dataset?.winRate);
  if (Number.isFinite(fromData)) return Math.min(100, Math.max(0, fromData));
  return 50;
};
const buildAssetUrl = (base, path) => (base ? `${base}/${path}` : `assets/${path}`);
const getIconUrls = (base, icon) => {
  if (!icon) return { webp: '', png: '' };
  const iconName = String(icon).trim();
  if (/^(?:https?:)?\/\//i.test(iconName) || iconName.startsWith('data:')) {
    return { webp: iconName, png: iconName };
  }
  const normalized = iconName.replace(/^\/+/, '').replace(/^img\//, '');
  return { webp: buildAssetUrl(base, `img/${normalized.replace(/\.png$/i, '.webp')}`), png: buildAssetUrl(base, `img/${normalized.replace(/\.webp$/i, '.png')}`) };
};
const createPicture = ({ webp, png, alt, width, height, className }) => {
  const picture = document.createElement('picture');
  if (className) picture.className = className;
  let source = null;
  if (webp) {
    source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = webp;
    picture.appendChild(source);
  }
  const img = document.createElement('img');
  img.src = png;
  img.alt = alt || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.width = width;
  img.height = height;
  img.draggable = false;
  picture.appendChild(img);
  return { picture, img, source };
};
const loadOffers = container => {
  if (Array.isArray(tmwSlotConfig.offers)) return tmwSlotConfig.offers;
  try { const parsed = JSON.parse(container.dataset.offers || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};

document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.tmw-slot-machine');
  if (!containers.length) return;
  const assetsBase = resolveAssetsBaseUrl();
  const iconPool = getIconPool();
  containers.forEach(container => {
    const slotBtn = container.querySelector('#tmw-slot-btn');
    const soundToggle = container.querySelector('#soundToggle');
    const reels = Array.from(container.querySelectorAll('.reel'));
    const result = container.querySelector('.tmw-result');
    const right = container.querySelector('.slot-right');
    const placeholder = container.querySelector('.tmw-slot-placeholder');
    const headline = container.querySelector('.slot-headline');
    if (!slotBtn || !soundToggle || !reels.length || !result) return;
    if (headline && typeof tmwSlotConfig.headline === 'string' && tmwSlotConfig.headline.trim()) headline.textContent = tmwSlotConfig.headline.trim();
    const offers = loadOffers(container);
    let spinning = false;
    let soundEnabled = (container.dataset.soundDefault || 'off') === 'on';
    try { const stored = localStorage.getItem('tmwSound'); if (stored === 'on' || stored === 'off') soundEnabled = stored === 'on'; } catch { /* ignore */ }
    const winSound = new Audio(buildAssetUrl(assetsBase, 'sounds/win.mp3'));
    winSound.preload = 'auto';
    winSound.volume = 0.9;
    const updateSoundLabel = () => {
      soundToggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Enable Sound';
      soundToggle.setAttribute('aria-label', soundEnabled ? 'Sound On' : 'Enable Sound');
      soundToggle.classList.toggle('active', soundEnabled);
    };
    const persistSound = () => { try { localStorage.setItem('tmwSound', soundEnabled ? 'on' : 'off'); } catch { /* ignore */ } };
    const playWinSound = () => {
      if (!soundEnabled) return;
      winSound.currentTime = 0;
      const promise = winSound.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    };
    const ensureReelVisual = reel => {
      let picture = reel.querySelector('picture');
      let img = reel.querySelector('img');
      let source = reel.querySelector('source');
      if (!picture || !img) {
        reel.textContent = '';
        const created = createPicture({ webp: '', png: '', alt: '', width: 80, height: 80 });
        picture = created.picture; img = created.img; source = created.source; reel.appendChild(picture);
      }
      return { img, source };
    };
    const setReelIcon = (reel, icon) => {
      const { webp, png } = getIconUrls(assetsBase, icon);
      const { img, source } = ensureReelVisual(reel);
      if (webp) {
        if (source) {
          source.srcset = webp;
        } else {
          const nextSource = document.createElement('source');
          nextSource.type = 'image/webp';
          nextSource.srcset = webp;
          img.parentElement?.insertBefore(nextSource, img);
        }
      } else if (source) {
        source.remove();
      }
      img.src = png;
      const baseName = String(icon || '').split('/').pop() || '';
      img.alt = baseName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
    };
    const setRandomIcons = () => {
      const pool = iconPool.slice();
      for (let i = pool.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      reels.forEach((reel, index) => setReelIcon(reel, pool[index % pool.length]));
    };
    const renderClaim = (url, label) => {
      if (!right) return;
      right.querySelectorAll('.tmw-claim-bonus').forEach(node => node.remove());
      if (!url) return;
      const link = document.createElement('a');
      link.className = 'tmw-claim-bonus';
      link.href = url; link.target = '_blank'; link.rel = 'nofollow noopener';
      link.textContent = label || tmwSlotConfig.claimLabel || 'Claim Your Bonus';
      right.insertBefore(link, right.firstChild);
    };
    const showResult = ({ isWin, icon }) => {
      result.classList.remove('win-text', 'show'); result.innerHTML = '';
      slotBtn.classList.remove('spin', 'reset');
      if (!isWin) {
        result.textContent = 'Try Again!'; result.classList.add('show'); renderClaim('');
        slotBtn.textContent = 'Spin Again'; slotBtn.classList.add('reset'); slotBtn.dataset.mode = 'reset';
        return;
      }
      const offerIndex = OFFER_ICON_ORDER.indexOf(icon);
      const offer = offerIndex >= 0 ? offers[offerIndex] : null;
      const title = offer?.title ? String(offer.title).trim() : '';
      const url = offer?.url ? String(offer.url).trim() : '';
      const messageWrap = document.createElement('div');
      messageWrap.className = 'tmw-win-message';
      messageWrap.textContent = title ? `🎉 ${title}!` : '🎉 Bonus!';
      result.appendChild(messageWrap); result.classList.add('win-text', 'show');
      renderClaim(url, tmwSlotConfig.claimLabel);
      slotBtn.textContent = 'Spin Again'; slotBtn.classList.add('reset'); slotBtn.dataset.mode = 'reset';
      playWinSound();
    };
    const showSurprise = () => {
      if (!placeholder || placeholder.querySelector('.tmw-surprise-img')) return;
      const { webp, png } = getIconUrls(assetsBase, 'surprise-trans.png');
      const created = createPicture({ webp, png, alt: 'Surprise Bonus', width: 120, height: 120, className: 'tmw-surprise-img' });
      placeholder.appendChild(created.picture);
    };
    const hideSurprise = () => { const surprise = placeholder?.querySelector('.tmw-surprise-img'); if (surprise) surprise.remove(); };
    const spin = () => {
      if (spinning) return; spinning = true; hideSurprise();
      result.classList.remove('win-text', 'show'); result.textContent = ''; renderClaim('');
      slotBtn.disabled = true; slotBtn.classList.add('is-busy'); slotBtn.classList.remove('reset'); slotBtn.classList.add('spin');
      const pool = iconPool.length ? iconPool : DEFAULT_ICONS;
      const intervalId = setInterval(() => { reels.forEach(reel => setReelIcon(reel, pool[Math.floor(Math.random() * pool.length)])); }, 110);
      setTimeout(() => {
        clearInterval(intervalId);
        const isWin = Math.random() * 100 < getWinRate(container);
        if (isWin) {
          const winIcon = OFFER_ICON_ORDER[Math.floor(Math.random() * OFFER_ICON_ORDER.length)];
          reels.forEach(reel => setReelIcon(reel, winIcon)); showResult({ isWin: true, icon: winIcon });
        } else {
          const finalIcons = reels.map(() => pool[Math.floor(Math.random() * pool.length)]);
          if (finalIcons.every(icon => icon === finalIcons[0]) && pool.length > 1) {
            const alt = pool.find(icon => icon !== finalIcons[0]); finalIcons[finalIcons.length - 1] = alt || finalIcons[0];
          }
          reels.forEach((reel, index) => setReelIcon(reel, finalIcons[index])); showResult({ isWin: false, icon: finalIcons[0] });
        }
        slotBtn.disabled = false; slotBtn.classList.remove('is-busy'); spinning = false;
      }, 1400);
    };
    slotBtn.textContent = 'Spin Now'; slotBtn.dataset.mode = 'spin'; slotBtn.classList.add('spin');
    updateSoundLabel();
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (!soundEnabled) { winSound.pause(); winSound.currentTime = 0; }
      updateSoundLabel(); persistSound();
    });
    slotBtn.addEventListener('click', spin);
    setRandomIcons(); showSurprise();
  });
});
