<?php
$settings = get_option('tmw_slot_machine_settings', []);
$win_rate = $settings['win_rate'] ?? 20;
$sound_default = $settings['sound'] ?? 'on';
$accent_color = $settings['accent_color'] ?? '#ff003c';
$offers = $settings['offers'] ?? [];
$offers_json = esc_attr(wp_json_encode($offers));
$headline_default = defined('TMW_SLOT_MACHINE_DEFAULT_HEADLINE') ? TMW_SLOT_MACHINE_DEFAULT_HEADLINE : 'Spin Now & Reveal Your Secret Bonus 👀';
$trigger_headline = get_option('tmw_slot_trigger_headline', $headline_default);
if (!is_string($trigger_headline) || $trigger_headline === '') {
    $trigger_headline = $headline_default;
}
$tmw_slot_machine_debug = function_exists('tmw_slot_machine_is_debug') && tmw_slot_machine_is_debug();
$tmw_slot_machine_audit_attrs = '';
if ($tmw_slot_machine_debug && isset($tmw_slot_machine_audit_token)) {
    $tmw_slot_machine_audit_attrs = sprintf(
        ' data-tmw-slot-audit-token="%s" data-tmw-slot-audit-post="%s"',
        esc_attr($tmw_slot_machine_audit_token),
        esc_attr($tmw_slot_machine_audit_post_id ?? '')
    );
}
?>
<div class="tmw-slot-machine tmw-slot-machine--lux" data-win-rate="<?php echo esc_attr($win_rate); ?>" data-sound-default="<?php echo esc_attr($sound_default); ?>" data-offers="<?php echo $offers_json; ?>"<?php echo $tmw_slot_machine_audit_attrs; ?> style="--tmw-accent-color: <?php echo esc_attr($accent_color); ?>;">
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
