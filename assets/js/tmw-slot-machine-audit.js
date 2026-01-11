(function () {
  if (typeof document === 'undefined') {
    return;
  }

  var LOG_PREFIX = '[TMW-SLOT-MACHINE-AUDIT]';

  function describeElement(el) {
    if (!el || !el.tagName) {
      return 'unknown';
    }
    var desc = el.tagName.toLowerCase();
    if (el.id) {
      desc += '#' + el.id;
    }
    if (el.className && typeof el.className === 'string') {
      var classes = el.className.trim().split(/\s+/).filter(Boolean);
      if (classes.length) {
        desc += '.' + classes.join('.');
      }
    }
    return desc;
  }

  function buildParentPath(el, depth) {
    var path = [];
    var current = el;
    var steps = depth || 6;
    while (current && steps > 0) {
      path.push(describeElement(current));
      current = current.parentElement;
      steps -= 1;
    }
    return path.join(' <- ');
  }

  function logSlotDetails(slot) {
    if (!slot) {
      return;
    }
    var styles = window.getComputedStyle(slot);
    var rect = slot.getBoundingClientRect();
    var offsetParent = slot.offsetParent;

    console.log(LOG_PREFIX, 'slot element found', slot);
    console.log(LOG_PREFIX, 'parent path', buildParentPath(slot, 6));
    console.log(LOG_PREFIX, 'computed styles', {
      position: styles.position,
      top: styles.top,
      left: styles.left,
      transform: styles.transform,
      marginTop: styles.marginTop,
      zIndex: styles.zIndex
    });
    console.log(LOG_PREFIX, 'bounding rect', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right
    });
    console.log(LOG_PREFIX, 'offsetParent', offsetParent ? describeElement(offsetParent) : 'none');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var slot = document.querySelector('[data-tmw-slot-audit-token]') || document.querySelector('.tmw-slot-machine');
    if (!slot) {
      console.log(LOG_PREFIX, 'slot element not found');
      return;
    }

    logSlotDetails(slot);

    var previousParent = slot.parentNode;
    var observer = new MutationObserver(function () {
      if (!slot.parentNode) {
        return;
      }
      if (slot.parentNode !== previousParent) {
        console.log(
          LOG_PREFIX,
          'MOVED',
          'from',
          previousParent ? describeElement(previousParent) : 'none',
          'to',
          describeElement(slot.parentNode)
        );
        previousParent = slot.parentNode;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
