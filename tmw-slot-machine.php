<?php
/*
Plugin Name: TMW Slot Machine
Description: Interactive slot bonus banner for Top-Models.Webcam
Version: 1.4.8
Author: The Milisofia Ltd
*/

if (!defined('ABSPATH')) {
    exit;
}

define('TMW_SLOT_MACHINE_PATH', plugin_dir_path(__FILE__));
define('TMW_SLOT_MACHINE_URL', plugin_dir_url(__FILE__));

if (!defined('TMW_SLOT_MACHINE_DEFAULT_HEADLINE')) {
    define('TMW_SLOT_MACHINE_DEFAULT_HEADLINE', 'Spin Now & Reveal Your Secret Bonus 👀');
}

// Verify that all neon icon files exist
add_action('init', function() {
    $icons = ['bonus.png', 'peeks.png', 'deal.png', 'roses.png', 'value.png'];
    $missing = [];
    foreach ($icons as $icon) {
        $path = TMW_SLOT_MACHINE_PATH . 'assets/img/' . $icon;
        if (!file_exists($path)) {
            $missing[] = $icon;
        }
    }
    if (!empty($missing)) {
        error_log('[TMW Slot Machine] Missing icons: ' . implode(', ', $missing));
    }
});

function tmw_slot_machine_asset_version($relative_path) {
    $path = TMW_SLOT_MACHINE_PATH . ltrim($relative_path, '/');
    return file_exists($path) ? filemtime($path) : false;
}

function tmw_slot_machine_is_debug() {
    return (defined('TMW_SLOT_MACHINE_DEBUG') && TMW_SLOT_MACHINE_DEBUG)
        || (defined('TMW_DEBUG') && TMW_DEBUG)
        || (defined('WP_DEBUG') && WP_DEBUG);
}

add_action('wp_enqueue_scripts', function () {
    if (is_admin()) {
        return;
    }

    $base = plugins_url('assets/', __FILE__);
    $debug = tmw_slot_machine_is_debug();

    // CSS (canonical)
    wp_register_style(
        'tmw-slot-css',
        $base . 'css/slot-machine.css',
        [],
        '1.1.6g'
    );

    // JS (footer, after DOM, avoids early race with AO)
    wp_register_script(
        'tmw-slot-js',
        $base . 'js/slot-machine.js',
        [],
        '1.1.6g',
        true
    );

    if ($debug) {
        wp_register_style(
            'tmw-slot-audit-css',
            $base . 'css/tmw-slot-machine-audit.css',
            [],
            tmw_slot_machine_asset_version('assets/css/tmw-slot-machine-audit.css') ?: '1.0.0'
        );

        wp_register_script(
            'tmw-slot-audit-js',
            $base . 'js/tmw-slot-machine-audit.js',
            [],
            tmw_slot_machine_asset_version('assets/js/tmw-slot-machine-audit.js') ?: '1.0.0',
            true
        );
    }
}, 99);

function tmw_slot_machine_enqueue_assets() {
    static $localized = false;

    if (tmw_slot_machine_is_debug()) {
        error_log('[TMW-SLOT] enqueue_assets called');
    }

    wp_enqueue_style('tmw-slot-css');
    wp_enqueue_script('tmw-slot-js');

    if (tmw_slot_machine_is_debug()) {
        wp_enqueue_style('tmw-slot-audit-css');
        wp_enqueue_script('tmw-slot-audit-js');
    }

    if ($localized) {
        return;
    }

    $settings        = get_option('tmw_slot_machine_settings', []);
    $win_probability = isset($settings['win_rate']) ? (int) $settings['win_rate'] : 50;
    $win_probability = max(0, min(100, $win_probability));

    $offers = get_option('tmw_slot_machine_offers', []);
    if (empty($offers) && !empty($settings['offers'])) {
        $offers = $settings['offers'];
    }

    // Filter to only include enabled offers
    if (is_array($offers)) {
        $offers = array_filter($offers, function($offer) {
            return !isset($offer['enabled']) || $offer['enabled'] === true;
        });
        $offers = array_values($offers); // Re-index array
    }

    $headline = get_option('tmw_slot_trigger_headline', TMW_SLOT_MACHINE_DEFAULT_HEADLINE);
    if (!is_string($headline) || $headline === '') {
        $headline = TMW_SLOT_MACHINE_DEFAULT_HEADLINE;
    }

    wp_localize_script('tmw-slot-js', 'tmwSlot', [
        'url'       => plugins_url('', __FILE__),
        'assetsUrl' => plugins_url('assets', __FILE__),
        'winRate'   => $win_probability,
        'offers'    => is_array($offers) ? array_values($offers) : [],
        'headline'  => wp_strip_all_tags($headline),
    ]);

    $localized = true;
}

// Register shortcode
add_shortcode('tmw_slot_machine', 'tmw_slot_machine_display');
function tmw_slot_machine_display() {
    tmw_slot_machine_enqueue_assets();
    $debug = tmw_slot_machine_is_debug();
    $post_id = get_the_ID();
    if (!$post_id && isset($GLOBALS['post']->ID)) {
        $post_id = (int) $GLOBALS['post']->ID;
    }
    $tmw_slot_machine_audit_token = $debug && function_exists('wp_generate_uuid4')
        ? wp_generate_uuid4()
        : ($debug ? uniqid('tmw-slot-', true) : '');
    $tmw_slot_machine_audit_post_id = $post_id ? (string) $post_id : '';

    ob_start();
    include TMW_SLOT_MACHINE_PATH . 'templates/slot-machine-display.php';
    $out = ob_get_clean();

    if ($debug) {
        $in_the_content = false;
        $current_filter = function_exists('current_filter') ? current_filter() : '';
        $filters = [];
        if (isset($GLOBALS['wp_current_filter'])) {
            $filters = (array) $GLOBALS['wp_current_filter'];
            $in_the_content = in_array('the_content', $filters, true);
        }
        $filters_joined = implode(' > ', array_map('strval', $filters));
        $queried_object = get_queried_object();
        $queried_summary = '';
        if (is_object($queried_object)) {
            $queried_summary = get_class($queried_object);
            if (isset($queried_object->ID)) {
                $queried_summary .= '#'.$queried_object->ID;
            } elseif (isset($queried_object->term_id)) {
                $queried_summary .= '#'.$queried_object->term_id;
            }
        } elseif ($queried_object !== null) {
            $queried_summary = (string) $queried_object;
        }
        if ($queried_summary === '') {
            $queried_summary = 'none';
        }

        $backtrace = function_exists('wp_debug_backtrace_summary')
            ? wp_debug_backtrace_summary(null, 0, false)
            : wp_json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 8));
        if (is_array($backtrace)) {
            $backtrace = implode(' | ', array_map('strval', $backtrace));
        }
        $backtrace = is_string($backtrace) && $backtrace !== '' ? $backtrace : 'none';

        $out_length = strlen($out);
        $out_hash = substr(md5($out), 0, 8);

        error_log(
            sprintf(
                '[TMW-SLOT-MACHINE-AUDIT] shortcode_run post_id=%s singular_model=%s queried=%s in_the_content=%s current_filter=%s filters=%s bt=%s out_len=%d out_hash=%s',
                $tmw_slot_machine_audit_post_id !== '' ? $tmw_slot_machine_audit_post_id : 'unknown',
                is_singular('model') ? 'true' : 'false',
                $queried_summary,
                $in_the_content ? 'true' : 'false',
                $current_filter !== '' ? $current_filter : 'none',
                $filters_joined !== '' ? $filters_joined : 'none',
                $backtrace,
                $out_length,
                $out_hash
            )
        );

        $out = sprintf(
            "<!-- TMW_SLOT_MACHINE_AUDIT START token=%s post_id=%s -->\n%s\n<!-- TMW_SLOT_MACHINE_AUDIT END token=%s -->",
            esc_html($tmw_slot_machine_audit_token),
            esc_html($tmw_slot_machine_audit_post_id),
            $out,
            esc_html($tmw_slot_machine_audit_token)
        );
    }

    return $out;
}

// Admin menu
add_action('admin_menu', function() {
    add_options_page('TMW Slot Machine', 'TMW Slot Machine', 'manage_options', 'tmw-slot-machine', 'tmw_slot_machine_admin_page');
});

add_action('admin_init', function() {
    register_setting(
        'tmw_slot_machine_group',
        'tmw_slot_trigger_headline',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => TMW_SLOT_MACHINE_DEFAULT_HEADLINE,
        ]
    );
});

function tmw_slot_machine_admin_page() {
    include TMW_SLOT_MACHINE_PATH . 'admin/settings-page.php';
}

// Activation hook
register_activation_hook(__FILE__, function() {
    $default_settings = [
        'win_rate'     => 20,
        'sound'        => 'off',
        'accent_color' => '#ff003c',
        'offers'       => [
            ['title' => '70% OFF Welcome Bonus', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u', 'enabled' => true],
            ['title' => '10 Free Peeks', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u', 'enabled' => true],
            ['title' => 'Hot Deal: Private Shows', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u', 'enabled' => true],
            ['title' => '15% OFF Million Roses', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u', 'enabled' => true],
            ['title' => 'Best Value – From 0.01 Credits', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u', 'enabled' => true],
        ],
    ];

    $existing = get_option('tmw_slot_machine_settings');

    if (!$existing) {
        update_option('tmw_slot_machine_settings', $default_settings);
    } else {
        update_option('tmw_slot_machine_settings', wp_parse_args($existing, $default_settings));
    }

    if (get_option('tmw_slot_trigger_headline', false) === false) {
        update_option('tmw_slot_trigger_headline', TMW_SLOT_MACHINE_DEFAULT_HEADLINE);
    }
});
