<?php
$settings = get_option('tmw_slot_machine_settings', []);
$win_rate = $settings['win_rate'] ?? 20;
$sound_default = $settings['sound'] ?? 'off';
$accent_color = $settings['accent_color'] ?? '#ff003c';
$offers = $settings['offers'] ?? [];
$offers_json = esc_attr(wp_json_encode($offers));
$headline_default = defined('TMW_SLOT_MACHINE_DEFAULT_HEADLINE') ? TMW_SLOT_MACHINE_DEFAULT_HEADLINE : 'Spin Now & Reveal Your Secret Bonus 👀';
$trigger_headline = get_option('tmw_slot_trigger_headline', $headline_default);
if (!is_string($trigger_headline) || $trigger_headline === '') {
    $trigger_headline = $headline_default;
}
$surprise_image = 'assets/img/surprice-trans.png';
$surprise_sizes = [120, 150, 180];
$surprise_png_srcset = tmw_slot_machine_build_srcset($surprise_image, $surprise_sizes, 'png');
$surprise_webp_srcset = tmw_slot_machine_build_srcset($surprise_image, $surprise_sizes, 'webp', true);
$surprise_src = TMW_SLOT_MACHINE_URL . ltrim($surprise_image, '/');
$surprise_sizes_attr = '(max-width: 480px) 120px, (max-width: 768px) 150px, 180px';
?>
<div class="tmw-slot-machine" data-win-rate="<?php echo esc_attr($win_rate); ?>" data-sound-default="<?php echo esc_attr($sound_default); ?>" data-offers="<?php echo $offers_json; ?>" style="--tmw-accent-color: <?php echo esc_attr($accent_color); ?>;">
  <div class="slot-headline"><?php echo esc_html($trigger_headline); ?></div>
  <div class="slot-body slot-container">
    <div class="slot-left">
      <button id="tmw-slot-btn" class="slot-btn spin" type="button">Spin Now</button>
      <div class="slot-sound">
        <button id="soundToggle" class="sound-toggle" aria-label="Sound On">🔊 Sound On</button>
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
        <picture>
          <?php if (!empty($surprise_webp_srcset)) : ?>
            <source type="image/webp" srcset="<?php echo esc_attr($surprise_webp_srcset); ?>" sizes="<?php echo esc_attr($surprise_sizes_attr); ?>">
          <?php endif; ?>
          <img class="tmw-surprise-img" src="<?php echo esc_url($surprise_src); ?>" srcset="<?php echo esc_attr($surprise_png_srcset); ?>" sizes="<?php echo esc_attr($surprise_sizes_attr); ?>" alt="Surprise bonus" loading="lazy" decoding="async">
        </picture>
      </div>
      <div class="tmw-result slot-result"></div>
    </div>
  </div>
</div>
