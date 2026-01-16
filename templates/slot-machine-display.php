<?php
$settings = get_option('tmw_slot_machine_settings', []);
$win_rate = $settings['win_rate'] ?? 20;
$sound_default = 'off'; // Always start with sound OFF
$offers = $settings['offers'] ?? [];
$offers_json = esc_attr(wp_json_encode($offers));
$headline_default = defined('TMW_SLOT_MACHINE_DEFAULT_HEADLINE') ? TMW_SLOT_MACHINE_DEFAULT_HEADLINE : 'Spin Now & Reveal Your Secret Bonus 👀';
$trigger_headline = get_option('tmw_slot_trigger_headline', $headline_default);
if (!is_string($trigger_headline) || $trigger_headline === '') {
    $trigger_headline = $headline_default;
}
?>
<div class="tmw-slot-machine tmw-slot-machine--lux" data-win-rate="<?php echo esc_attr($win_rate); ?>" data-sound-default="<?php echo esc_attr($sound_default); ?>" data-offers="<?php echo $offers_json; ?>" style="position:relative!important;padding:0!important;border-radius:8px!important;background:linear-gradient(135deg,#1a1a1a 0%,#0d0d0d 50%,#1a1a1a 100%)!important;overflow:hidden!important;box-shadow:0 0 0 1px rgba(212,175,55,0.4),0 0 0 3px rgba(212,175,55,0.15),0 20px 40px -15px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.05)!important;font-family:Montserrat,sans-serif!important;border:2px solid rgba(212,175,55,0.5)!important;">
  
  <div class="slot-headline" style="position:absolute!important;top:12px!important;left:50%!important;transform:translateX(-50%)!important;font-family:'Playfair Display',serif!important;font-size:13px!important;font-weight:600!important;letter-spacing:0.5px!important;color:#f4e4bc!important;white-space:nowrap!important;z-index:10!important;"><?php echo esc_html($trigger_headline); ?></div>
  
  <div class="slot-body" style="display:flex!important;align-items:center!important;justify-content:space-between!important;height:100%!important;padding:0 28px!important;position:relative!important;z-index:5!important;">
    
    <div class="slot-left" style="display:flex!important;flex-direction:column!important;align-items:center!important;gap:6px!important;flex-shrink:0!important;">
      <button class="slot-btn tmw-slot-btn spin" type="button" style="position:relative!important;min-width:140px!important;height:44px!important;padding:0 24px!important;border:none!important;border-radius:4px!important;font-family:Montserrat,sans-serif!important;font-size:12px!important;font-weight:700!important;letter-spacing:2px!important;text-transform:uppercase!important;color:#0f0f0f!important;cursor:pointer!important;background:linear-gradient(180deg,#f4e4bc 0%,#d4af37 50%,#a68b2c 100%)!important;box-shadow:0 4px 15px rgba(212,175,55,0.3),inset 0 1px 0 rgba(255,255,255,0.4),inset 0 -1px 0 rgba(0,0,0,0.1)!important;overflow:hidden!important;">Spin Now</button>
      <div class="slot-sound" style="display:flex!important;">
        <button class="sound-toggle tmw-slot-sound-toggle" aria-label="Sound Off" style="display:flex!important;align-items:center!important;justify-content:center!important;padding:2px 0!important;border:none!important;border-radius:0!important;background:transparent!important;font-family:Montserrat,sans-serif!important;font-size:9px!important;font-weight:500!important;letter-spacing:0.5px!important;color:rgba(212,175,55,0.5)!important;cursor:pointer!important;">🔇 Sound Off</button>
      </div>
    </div>

    <div class="slot-center" style="position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:5!important;">
      <div class="tmw-reels slot-reels" style="display:flex!important;gap:8px!important;padding:10px 14px!important;border-radius:6px!important;background:rgba(0,0,0,0.4)!important;border:1px solid rgba(212,175,55,0.1)!important;box-shadow:inset 0 2px 8px rgba(0,0,0,0.3)!important;">
        <div class="reel" style="width:54px!important;height:54px!important;border-radius:4px!important;background:linear-gradient(180deg,#1f1f1f 0%,#141414 100%)!important;border:1px solid rgba(212,175,55,0.15)!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:inset 0 2px 6px rgba(0,0,0,0.4)!important;overflow:hidden!important;"></div>
        <div class="reel" style="width:54px!important;height:54px!important;border-radius:4px!important;background:linear-gradient(180deg,#1f1f1f 0%,#141414 100%)!important;border:1px solid rgba(212,175,55,0.15)!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:inset 0 2px 6px rgba(0,0,0,0.4)!important;overflow:hidden!important;"></div>
        <div class="reel" style="width:54px!important;height:54px!important;border-radius:4px!important;background:linear-gradient(180deg,#1f1f1f 0%,#141414 100%)!important;border:1px solid rgba(212,175,55,0.15)!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:inset 0 2px 6px rgba(0,0,0,0.4)!important;overflow:hidden!important;"></div>
      </div>
    </div>

    <div class="slot-right" style="display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:6px!important;flex-shrink:0!important;min-width:150px!important;">
      <div class="tmw-slot-placeholder" style="display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;text-align:center!important;">
        <span class="teaser-text" style="font-family:'Playfair Display',serif!important;font-size:14px!important;font-weight:600!important;color:#f4e4bc!important;text-shadow:0 0 10px #d4af37,0 0 20px #d4af37,0 0 30px rgba(212,175,55,0.5)!important;">Your Bonus Awaits</span>
        <span class="teaser-sub" style="font-family:Montserrat,sans-serif!important;font-size:9px!important;font-weight:500!important;letter-spacing:1px!important;text-transform:uppercase!important;color:rgba(212,175,55,0.5)!important;">Spin to reveal</span>
      </div>
      <div class="tmw-result slot-result" style="font-family:Montserrat,sans-serif!important;font-size:14px!important;font-weight:600!important;text-align:center!important;color:rgba(255,255,255,0.4)!important;max-width:150px!important;line-height:1.3!important;"></div>
    </div>
    
    <div class="mobile-sound" style="display:none!important;">
      <button class="sound-toggle tmw-slot-sound-toggle" aria-label="Sound Off" style="display:flex!important;align-items:center!important;justify-content:center!important;padding:4px 0!important;border:none!important;border-radius:0!important;background:transparent!important;font-family:Montserrat,sans-serif!important;font-size:11px!important;font-weight:500!important;letter-spacing:0.5px!important;color:rgba(212,175,55,0.5)!important;cursor:pointer!important;">🔇 Sound Off</button>
    </div>
  </div>
</div>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');

/* Default desktop height */
.tmw-slot-machine.tmw-slot-machine--lux {
  height: 130px !important;
  max-height: 130px !important;
  min-height: auto !important;
}

@keyframes tmw-btn-pulse{0%,100%{box-shadow:0 4px 15px rgba(212,175,55,0.3),0 0 0 0 rgba(212,175,55,0),inset 0 1px 0 rgba(255,255,255,0.4),inset 0 -1px 0 rgba(0,0,0,0.1)}50%{box-shadow:0 4px 20px rgba(212,175,55,0.5),0 0 25px 2px rgba(212,175,55,0.25),inset 0 1px 0 rgba(255,255,255,0.4),inset 0 -1px 0 rgba(0,0,0,0.1)}}
@keyframes tmw-teaser-glow{0%,100%{opacity:0.8;text-shadow:0 0 10px #d4af37,0 0 20px #d4af37,0 0 30px rgba(212,175,55,0.5)}50%{opacity:1;text-shadow:0 0 15px #d4af37,0 0 30px #d4af37,0 0 45px rgba(212,175,55,0.7)}}
@keyframes tmw-text-flash{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes tmw-reel-spin{0%{border-color:rgba(212,175,55,0.15)}50%{border-color:rgba(212,175,55,0.35)}100%{border-color:rgba(212,175,55,0.15)}}

.tmw-slot-machine.tmw-slot-machine--lux .slot-btn{animation:tmw-btn-pulse 2s ease-in-out infinite!important}
.tmw-slot-machine.tmw-slot-machine--lux .slot-btn:disabled{animation:none!important}
.tmw-slot-machine.tmw-slot-machine--lux .teaser-text{animation:tmw-teaser-glow 2s ease-in-out infinite!important}
.tmw-slot-machine.tmw-slot-machine--lux .reel.spinning{animation:tmw-reel-spin 0.1s linear infinite!important}
.tmw-slot-machine.tmw-slot-machine--lux .slot-result.win-text,
.tmw-slot-machine.tmw-slot-machine--lux .tmw-result.win-text{color:#f4e4bc!important;animation:tmw-text-flash 1s ease-in-out infinite!important}
.tmw-slot-machine.tmw-slot-machine--lux .slot-result.lose-text,
.tmw-slot-machine.tmw-slot-machine--lux .tmw-result.lose-text{color:rgba(255,255,255,0.6)!important;animation:tmw-text-flash 1s ease-in-out infinite!important}
.tmw-slot-machine.tmw-slot-machine--lux .reel.win{border-color:#d4af37!important;box-shadow:inset 0 2px 6px rgba(0,0,0,0.4),0 0 12px rgba(212,175,55,0.25)!important}
.tmw-slot-machine.tmw-slot-machine--lux .reel img{width:78%!important;height:78%!important;object-fit:contain!important;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))!important}
.tmw-slot-machine.tmw-slot-machine--lux .tmw-claim-bonus{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:140px!important;height:40px!important;padding:0 20px!important;border:none!important;border-radius:4px!important;font-family:Montserrat,sans-serif!important;font-size:10px!important;font-weight:700!important;letter-spacing:1.5px!important;text-transform:uppercase!important;text-decoration:none!important;color:#0f0f0f!important;background:linear-gradient(180deg,#f4e4bc 0%,#d4af37 50%,#a68b2c 100%)!important;box-shadow:0 4px 15px rgba(212,175,55,0.35)!important}

/* MOBILE RESPONSIVE - Now works because height is NOT in inline styles */
@media(max-width:650px){
  .tmw-slot-machine.tmw-slot-machine--lux {
    height: auto !important;
    min-height: 280px !important;
    max-height: none !important;
    padding: 40px 20px 20px !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .slot-body {
    flex-direction: column !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 0 !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .slot-center {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    transform: none !important;
    order: 1 !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .slot-left {
    order: 2 !important;
    width: 100% !important;
    flex-direction: column !important;
    align-items: center !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .slot-left .slot-btn {
    width: 220px !important;
    min-width: 220px !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .slot-left .slot-sound {
    display: none !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .slot-right {
    order: 3 !important;
    width: 100% !important;
    flex-direction: column !important;
    align-items: center !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .slot-right .tmw-claim-bonus {
    width: 220px !important;
    min-width: 220px !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .slot-right .slot-result {
    font-size: 15px !important;
    max-width: 100% !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .mobile-sound {
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
    margin-top: 8px !important;
    order: 10 !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .slot-headline {
    font-size: 12px !important;
    top: 14px !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .teaser-text {
    font-size: 16px !important;
  }
  .tmw-slot-machine.tmw-slot-machine--lux .reel {
    width: 58px !important;
    height: 58px !important;
  }
}
</style>
