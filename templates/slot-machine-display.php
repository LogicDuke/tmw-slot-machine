<?php
$settings = get_option('tmw_slot_machine_settings', []);
$win_rate = $settings['win_rate'] ?? 20;
$sound_default = 'off';
$offers = $settings['offers'] ?? [];
$offers_json = esc_attr(wp_json_encode($offers));
$headline_default = defined('TMW_SLOT_MACHINE_DEFAULT_HEADLINE') ? TMW_SLOT_MACHINE_DEFAULT_HEADLINE : 'Spin Now & Reveal Your Secret Bonus 👀';
$trigger_headline = get_option('tmw_slot_trigger_headline', $headline_default);
if (!is_string($trigger_headline) || $trigger_headline === '') {
    $trigger_headline = $headline_default;
}
?>
<div class="tmw-slot-machine tmw-slot-machine--lux" data-win-rate="<?php echo esc_attr($win_rate); ?>" data-sound-default="<?php echo esc_attr($sound_default); ?>" data-offers="<?php echo $offers_json; ?>">
  
  <div class="slot-headline"><?php echo esc_html($trigger_headline); ?></div>
  
  <div class="slot-body">
    
    <div class="slot-left">
      <button class="slot-btn tmw-slot-btn spin" type="button">Spin Now</button>
      <div class="slot-sound">
        <button class="sound-toggle tmw-slot-sound-toggle" aria-label="Sound Off">🔇 Sound Off</button>
      </div>
    </div>

    <div class="slot-center">
      <div class="tmw-reels slot-reels">
        <div class="reel"></div>
        <div class="reel"></div>
        <div class="reel"></div>
      </div>
    </div>

    <div class="slot-right">
      <div class="tmw-slot-placeholder">
        <span class="teaser-text">Your Bonus Awaits</span>
        <span class="teaser-sub">Spin to reveal</span>
      </div>
      <div class="tmw-result slot-result"></div>
    </div>
    
    <div class="mobile-sound">
      <button class="sound-toggle tmw-slot-sound-toggle" aria-label="Sound Off">🔇 Sound Off</button>
    </div>
  </div>
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');

/* ===== CONTAINER ===== */
.tmw-slot-machine.tmw-slot-machine--lux {
  position: relative;
  height: 130px;
  padding: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%);
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(212,175,55,0.4), 0 0 0 3px rgba(212,175,55,0.15), 0 20px 40px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
  font-family: 'Montserrat', sans-serif;
  border: 2px solid rgba(212,175,55,0.5);
}

/* ===== HEADLINE ===== */
.tmw-slot-machine.tmw-slot-machine--lux .slot-headline {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Playfair Display', serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #f4e4bc;
  white-space: nowrap;
  z-index: 10;
}

/* ===== BODY - DESKTOP: horizontal layout ===== */
.tmw-slot-machine.tmw-slot-machine--lux .slot-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 28px;
  position: relative;
  z-index: 5;
}

/* ===== LEFT SECTION (Button + Sound) ===== */
.tmw-slot-machine.tmw-slot-machine--lux .slot-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* ===== SPIN BUTTON ===== */
.tmw-slot-machine.tmw-slot-machine--lux .slot-btn {
  position: relative;
  min-width: 140px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #0f0f0f;
  cursor: pointer;
  background: linear-gradient(180deg, #f4e4bc 0%, #d4af37 50%, #a68b2c 100%);
  box-shadow: 0 4px 15px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.1);
  overflow: hidden;
  animation: tmw-btn-pulse 2s ease-in-out infinite;
}

.tmw-slot-machine.tmw-slot-machine--lux .slot-btn:disabled {
  background: linear-gradient(180deg, #555 0%, #3a3a3a 50%, #2a2a2a 100%);
  color: #888;
  box-shadow: none;
  cursor: not-allowed;
  animation: none;
}

/* ===== SOUND TOGGLE ===== */
.tmw-slot-machine.tmw-slot-machine--lux .slot-sound {
  display: flex;
}

.tmw-slot-machine.tmw-slot-machine--lux .sound-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 0;
  border: none;
  background: transparent;
  font-family: 'Montserrat', sans-serif;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: rgba(212,175,55,0.5);
  cursor: pointer;
}

.tmw-slot-machine.tmw-slot-machine--lux .sound-toggle.active {
  color: #d4af37;
}

/* ===== CENTER SECTION (Reels) - DESKTOP: absolute center ===== */
.tmw-slot-machine.tmw-slot-machine--lux .slot-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.tmw-slot-machine.tmw-slot-machine--lux .slot-reels {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 6px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(212,175,55,0.1);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
}

.tmw-slot-machine.tmw-slot-machine--lux .reel {
  width: 54px;
  height: 54px;
  border-radius: 4px;
  background: linear-gradient(180deg, #1f1f1f 0%, #141414 100%);
  border: 1px solid rgba(212,175,55,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.4);
  overflow: hidden;
}

.tmw-slot-machine.tmw-slot-machine--lux .reel.win {
  border-color: #d4af37;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.4), 0 0 12px rgba(212,175,55,0.25);
}

.tmw-slot-machine.tmw-slot-machine--lux .reel img {
  width: 78%;
  height: 78%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

/* ===== RIGHT SECTION (Teaser + Result) ===== */
.tmw-slot-machine.tmw-slot-machine--lux .slot-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  min-width: 150px;
}

.tmw-slot-machine.tmw-slot-machine--lux .tmw-slot-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
}

.tmw-slot-machine.tmw-slot-machine--lux .teaser-text {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 600;
  color: #f4e4bc;
  text-shadow: 0 0 10px #d4af37, 0 0 20px #d4af37, 0 0 30px rgba(212,175,55,0.5);
  animation: tmw-teaser-glow 2s ease-in-out infinite;
}

.tmw-slot-machine.tmw-slot-machine--lux .teaser-sub {
  font-family: 'Montserrat', sans-serif;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(212,175,55,0.5);
}

.tmw-slot-machine.tmw-slot-machine--lux .slot-result {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: rgba(255,255,255,0.4);
  max-width: 150px;
  line-height: 1.3;
}

.tmw-slot-machine.tmw-slot-machine--lux .slot-result.win-text {
  color: #f4e4bc;
  animation: tmw-text-flash 1s ease-in-out infinite;
}

.tmw-slot-machine.tmw-slot-machine--lux .slot-result.lose-text {
  color: rgba(255,255,255,0.6);
}

/* ===== CLAIM BONUS BUTTON ===== */
.tmw-slot-machine.tmw-slot-machine--lux .tmw-claim-bonus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-decoration: none;
  color: #0f0f0f;
  background: linear-gradient(180deg, #f4e4bc 0%, #d4af37 50%, #a68b2c 100%);
  box-shadow: 0 4px 15px rgba(212,175,55,0.35);
}

/* ===== MOBILE SOUND (hidden on desktop) ===== */
.tmw-slot-machine.tmw-slot-machine--lux .mobile-sound {
  display: none;
}

/* ===== ANIMATIONS ===== */
@keyframes tmw-btn-pulse {
  0%, 100% { box-shadow: 0 4px 15px rgba(212,175,55,0.3), 0 0 0 0 rgba(212,175,55,0), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.1); }
  50% { box-shadow: 0 4px 20px rgba(212,175,55,0.5), 0 0 25px 2px rgba(212,175,55,0.25), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.1); }
}

@keyframes tmw-teaser-glow {
  0%, 100% { opacity: 0.8; text-shadow: 0 0 10px #d4af37, 0 0 20px #d4af37, 0 0 30px rgba(212,175,55,0.5); }
  50% { opacity: 1; text-shadow: 0 0 15px #d4af37, 0 0 30px #d4af37, 0 0 45px rgba(212,175,55,0.7); }
}

@keyframes tmw-text-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes tmw-reel-spin {
  0% { border-color: rgba(212,175,55,0.15); }
  50% { border-color: rgba(212,175,55,0.35); }
  100% { border-color: rgba(212,175,55,0.15); }
}

.tmw-slot-machine.tmw-slot-machine--lux .reel.spinning {
  animation: tmw-reel-spin 0.1s linear infinite;
}

/* =========================================================
   MOBILE RESPONSIVE - Works because NO inline styles!
   ========================================================= */
@media (max-width: 650px) {
  .tmw-slot-machine.tmw-slot-machine--lux {
    height: auto;
    min-height: 320px;
    padding: 45px 20px 20px;
  }
  
  .tmw-slot-machine.tmw-slot-machine--lux .slot-headline {
    font-size: 11px;
    top: 14px;
  }
  
  .tmw-slot-machine.tmw-slot-machine--lux .slot-body {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 15px;
    height: auto;
    padding: 0;
  }
  
  /* Reels at TOP */
  .tmw-slot-machine.tmw-slot-machine--lux .slot-center {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    order: 1;
  }
  
  .tmw-slot-machine.tmw-slot-machine--lux .reel {
    width: 60px;
    height: 60px;
  }
  
  /* Button in MIDDLE */
  .tmw-slot-machine.tmw-slot-machine--lux .slot-left {
    order: 2;
    width: 100%;
  }
  
  .tmw-slot-machine.tmw-slot-machine--lux .slot-left .slot-btn {
    width: 200px;
    min-width: 200px;
  }
  
  .tmw-slot-machine.tmw-slot-machine--lux .slot-left .slot-sound {
    display: none;
  }
  
  /* Teaser/Result at BOTTOM */
  .tmw-slot-machine.tmw-slot-machine--lux .slot-right {
    order: 3;
    width: 100%;
    min-width: auto;
  }
  
  .tmw-slot-machine.tmw-slot-machine--lux .teaser-text {
    font-size: 15px;
  }
  
  .tmw-slot-machine.tmw-slot-machine--lux .slot-result {
    font-size: 14px;
    max-width: 100%;
  }
  
  .tmw-slot-machine.tmw-slot-machine--lux .tmw-claim-bonus {
    width: 200px;
    min-width: 200px;
  }
  
  /* Sound toggle at VERY BOTTOM */
  .tmw-slot-machine.tmw-slot-machine--lux .mobile-sound {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 5px;
    order: 4;
  }
  
  .tmw-slot-machine.tmw-slot-machine--lux .mobile-sound .sound-toggle {
    font-size: 11px;
    padding: 4px 0;
  }
}
</style>
