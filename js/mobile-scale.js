/* global window, document */
/**
 * Auto-scale mobile web — letterbox fit vào khung thiết kế.
 * Desktop rộng: fluid 100% (không scale).
 * Mobile / viewport hẹp: khóa design size + transform scale.
 */
(function () {
  var DESIGN_LANDSCAPE = { w: 1280, h: 720 };
  var DESIGN_PORTRAIT = { w: 390, h: 780 };
  /** Dưới ngưỡng này → bật scale (tablet nhỏ / điện thoại) */
  var FLUID_MIN_W = 1024;
  var FLUID_MIN_H = 640;

  var root = null;
  var raf = 0;

  function ensureRoot() {
    if (root && root.isConnected) return root;
    var app = document.getElementById("app");
    if (!app) return null;
    root = document.getElementById("nl-scale-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "nl-scale-root";
      app.parentNode.insertBefore(root, app);
      root.appendChild(app);
    } else if (app.parentNode !== root) {
      root.appendChild(app);
    }
    return root;
  }

  function viewportSize() {
    var vv = window.visualViewport;
    if (vv && vv.width > 0 && vv.height > 0) {
      return { w: vv.width, h: vv.height };
    }
    return {
      w: window.innerWidth || document.documentElement.clientWidth || 1,
      h: window.innerHeight || document.documentElement.clientHeight || 1,
    };
  }

  function apply() {
    var el = ensureRoot();
    if (!el) return;

    var vp = viewportSize();
    var portrait = vp.h >= vp.w;
    var design = portrait ? DESIGN_PORTRAIT : DESIGN_LANDSCAPE;
    var useFluid = vp.w >= FLUID_MIN_W && vp.h >= FLUID_MIN_H;

    document.documentElement.style.setProperty("--nl-vp-w", vp.w + "px");
    document.documentElement.style.setProperty("--nl-vp-h", vp.h + "px");

    if (useFluid) {
      el.classList.add("is-fluid");
      el.classList.remove("is-scaled");
      el.style.width = "";
      el.style.height = "";
      el.style.transform = "";
      document.documentElement.style.setProperty("--nl-scale", "1");
      document.documentElement.style.setProperty("--nl-design-w", "100%");
      document.documentElement.style.setProperty("--nl-design-h", "100%");
      document.documentElement.classList.remove("nl-mobile-scaled");
      return;
    }

    var sx = vp.w / design.w;
    var sy = vp.h / design.h;
    var s = Math.min(sx, sy);
    // Không phóng to quá 1 trên tablet đứng; cho phép thu nhỏ sâu trên máy hẹp
    if (s > 1) s = 1;
    if (s < 0.35) s = 0.35;

    var ox = (vp.w - design.w * s) / 2;
    var oy = (vp.h - design.h * s) / 2;

    el.classList.remove("is-fluid");
    el.classList.add("is-scaled");
    el.style.width = design.w + "px";
    el.style.height = design.h + "px";
    el.style.transform = "translate(" + ox + "px," + oy + "px) scale(" + s + ")";

    document.documentElement.style.setProperty("--nl-scale", String(s));
    document.documentElement.style.setProperty("--nl-design-w", design.w + "px");
    document.documentElement.style.setProperty("--nl-design-h", design.h + "px");
    document.documentElement.classList.add("nl-mobile-scaled");
  }

  function schedule() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = 0;
      apply();
      // Báo Three.js / layout listeners
      try {
        window.dispatchEvent(new Event("resize"));
      } catch (_) {
        /* ignore */
      }
    });
  }

  function boot() {
    ensureRoot();
    apply();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", function () {
      setTimeout(schedule, 120);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", schedule, { passive: true });
      window.visualViewport.addEventListener("scroll", schedule, { passive: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.NLMobileScale = {
    refresh: schedule,
    apply: apply,
  };
})();
