<?php
$sound_default = $settings['sound'] ?? 'off';
$button_text = $settings['button_text'] ?? 'SPIN NOW';
$win_rate = $settings['win_rate'] ?? 50;
$offer_titles = $settings['offer_titles'] ?? '';
$offer_urls = $settings['offer_urls'] ?? '';
$offers = [];

if (!empty($offer_titles)) {
    $titles = array_map('trim', explode("\n", $offer_titles));
    $urls = array_map('trim', explode("\n", $offer_urls));

    foreach ($titles as $index => $title) {
        if (!empty($title) && isset($urls[$index]) && !empty($urls[$index])) {
            $offers[] = [
                'title' => $title,
                'url' => $urls[$index]
            ];
        }
    }
}

$offers_json = json_encode($offers);
?>

<div class="tmw-slot-machine" data-sound-default="<?php echo esc_attr($sound_default); ?>">
  <div class="tmw-slot-header">
    <div class="slot-title">The Playmate Bonus</div>
    <button class="sound-toggle tmw-slot-sound-toggle">🔊 Sound On</button>
  </div>
  <div class="slot-main">
    <div class="slot-left">
      <div class="slot-reels">
        <div class="reel">Bonus</div>
        <div class="reel">Peeks</div>
        <div class="reel">Deal</div>
      </div>
      <div class="tmw-slot-placeholder">
        <div class="teaser-text">Your Bonus Awaits</div>
        <div class="teaser-sub">Spin to reveal</div>
      </div>
    </div>
    <div class="slot-right">
      <div class="tmw-result slot-result"></div>
      <button class="tmw-slot-btn">Spin Now</button>
    </div>
  </div>
</div>

<script>
  window.tmwSlot = {
    winRate: <?php echo intval($win_rate); ?>,
    offers: <?php echo $offers_json; ?>,
    assetsUrl: "<?php echo plugin_dir_url(__FILE__) . '../assets'; ?>"
  };
</script>
