# Bounce Animation Audit

- **Goal:** Determine why slot reels still appear to bounce after the bounce animation was supposedly removed.
- **Date:** 2025-10-08T14:52:04Z

## Findings

1. The active JavaScript file is `assets/js/slot-machine.js`. It no longer contains any references to `startBounceAnimation`, `startBounceFlash`, or `.bounce` class manipulation. The spin-completion flow calls `startResultFlash()` immediately after removing the `spin` class from each reel, ensuring the flash-only phase runs without referencing any bounce helpers. 【F:assets/js/slot-machine.js†L1-L165】
2. The CSS still applies `transition: transform 0.3s;` to each `.reel`. When the `spin` animation is removed, the computed transform eases back to its resting state across that transition. This lingering transform transition is what produces the visible post-spin "bounce" effect even though all explicit bounce logic has been deleted. 【F:assets/css/slot-machine.css†L28-L49】

## Root Cause

- The residual `transition: transform 0.3s;` on `.reel` continues to animate the transform value as the spin animation ends, creating an unintended bounce.

## Recommendation

- Remove or scope the transform transition to a different property (or disable it after spin) so the reels snap back instantly. For example, drop the `transition` line or replace it with something like `transition: box-shadow 0.3s;`.

# Mixed Theme Audit (Luxury + Legacy Styles)

- **Goal:** Determine why the frontend shows a hybrid of old + luxury visuals and document exact causes.
- **Date:** 2025-10-08T15:06:31Z

## Findings

1. The plugin enqueues the core CSS/JS with a static version string (`1.1.6g`). This prevents cache busting when the files change, allowing stale (legacy) assets to stay cached and mix with the new Luxury CSS/JS. The hardcoded version appears in both the CSS and JS `wp_register_*` calls. 【F:tmw-slot-machine.php†L44-L83】
2. The template uses a generic `slot-container` class alongside the Luxury markup. This is prone to collisions with theme CSS that also targets `.slot-container`, letting non-Luxury layout rules override the intended styling. 【F:templates/slot-machine-display.php†L23-L30】
3. The template includes duplicate IDs (`tmw-slot-btn`, `soundToggle`) which are invalid when multiple slot machines are rendered or DOM changes occur. The JavaScript then queries by `document.getElementById(...)`, so it can bind to the wrong instance and leave the other instance with incorrect UI states, causing inconsistent visuals/behavior. 【F:templates/slot-machine-display.php†L25-L28】【F:assets/js/slot-machine.js†L164-L174】

## Root Causes

- Static asset versions lock browsers/CDNs into stale CSS/JS, letting old styles persist alongside Luxury assets. 【F:tmw-slot-machine.php†L44-L83】
- Generic class names and duplicate IDs allow theme CSS and JavaScript to collide across instances, yielding mixed layout/behavior. 【F:templates/slot-machine-display.php†L23-L44】【F:assets/js/slot-machine.js†L164-L174】

## Recommendations (No Code Changes Applied)

- Replace static version strings with filemtime-based cache busting (or version constant fallbacks) to force updated Luxury assets to load. 【F:tmw-slot-machine.php†L44-L83】
- Remove the `slot-container` class and add a Luxury marker class to increase selector specificity against theme CSS. 【F:templates/slot-machine-display.php†L23-L30】
- Replace duplicate IDs with instance-scoped classes and update JavaScript to query within the container instead of global IDs. 【F:templates/slot-machine-display.php†L25-L44】【F:assets/js/slot-machine.js†L164-L174】
