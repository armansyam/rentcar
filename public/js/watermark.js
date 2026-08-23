/**
 * AMS Signature & Dynamic Version Watermark
 * Non-blocking, light-weight, with auto GitHub update indicator
 */
(function () {
  if (typeof window === 'undefined') return;

  function initWatermark() {
    if (document.getElementById('ams-watermark-container')) return;

    const container = document.createElement('div');
    container.id = 'ams-watermark-container';
    container.style.position = 'fixed';
    container.style.bottom = '16px';
    container.style.right = '16px';
    container.style.zIndex = '99999';
    container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    container.style.fontSize = '12px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';
    container.style.backgroundColor = 'rgba(11, 31, 51, 0.85)';
    container.style.backdropFilter = 'blur(8px)';
    container.style.color = '#FFFFFF';
    container.style.padding = '6px 12px';
    container.style.borderRadius = '9999px';
    container.style.boxShadow = '0 4px 14px rgba(0,0,0,0.18)';
    container.style.border = '1px solid rgba(255,255,255,0.15)';
    container.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    container.style.cursor = 'pointer';

    // Badge styling for mobile responsive bottom bar awareness
    if (window.innerWidth < 768) {
      container.style.bottom = '74px'; // above bottom navigation
      container.style.right = '12px';
      container.style.transform = 'scale(0.9)';
      container.style.transformOrigin = 'bottom right';
    }

    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-weight:700;letter-spacing:0.5px;color:#38BDF8;">AMS</span>
        <span style="opacity:0.6;">•</span>
        <span id="ams-version-text" style="color:#E2E8F0;font-size:11px;">v1.0.0</span>
        <span id="ams-status-dot" style="width:6px;height:6px;border-radius:50%;background-color:#22C55E;display:inline-block;"></span>
      </div>
    `;

    container.addEventListener('click', function () {
      window.open('https://github.com/armansyam', '_blank');
    });

    document.body.appendChild(container);

    // Fetch dynamic version
    fetch('/api/public/version')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.release) {
          const versionEl = document.getElementById('ams-version-text');
          if (versionEl) versionEl.textContent = data.release;
        }
        if (data && data.updateAvailable) {
          const dot = document.getElementById('ams-status-dot');
          if (dot) dot.style.backgroundColor = '#F59E0B';
        }
      })
      .catch(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWatermark);
  } else {
    initWatermark();
  }
})();
