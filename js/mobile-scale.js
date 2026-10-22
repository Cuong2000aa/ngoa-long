/* global window, document */
/**
 * Auto-scale mobile web — letterbox fit vào khung thiết kế.
 * Desktop rộng: fluid 100% (không scale).
 * Mobile: luôn dùng khung LANDSCAPE (game SRPG), không đổi portrait khi xoay
 * (đổi design khi xoay dễ crash WebGL / văng layout → reload về màn start).
 */
(function () {
  var DESIGN = { w: 1280, h: 720 };
  /** Dưới ngưỡng này → bật scale (tablet nhỏ / điện thoại) */
  var FLUID_MIN_W = 1024;
  var FLUID_MIN_H = 640;

  var root = null;
  var raf = 0;
  var orientTimer = 0;
  var lastKey = "";

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
    if (vv && vv.width > 2 && vv.height > 2) {
      return { w: vv.width, h: vv.height };
    }
    return {
      w: Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1),
      h: Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1),
    };
  }

  function apply() {
    var el = ensureRoot();
    if (!el) return;

    var vp = viewportSize();
    // Xoay / chrome ẩn hiện: bỏ qua frame kích thước rỗng (tránh WebGL setSize 0)
    if (vp.w < 8 || vp.h < 8) return;

    var design = DESIGN;
    var useFluid = vp.w >= FLUID_MIN_W && vp.h >= FLUID_MIN_H;
    var key =
      (useFluid ? "F" : "S") +
      "|" +
      Math.round(vp.w) +
      "x" +
      Math.round(vp.h);

    document.documentElement.style.setProperty("--nl-vp-w", vp.w + "px");
    document.documentElement.style.setProperty("--nl-vp-h", vp.h + "px");

    if (useFluid) {
      if (lastKey === key) return;
      lastKey = key;
      el.classList.add("is-fluid");
      el.classList.remove("is-scaled");
      el.style.width = "";
      el.style.height = "";
      el.style.transform = "";
      document.documentElement.style.setProperty("--nl-scale", "1");
      document.documentElement.style.setProperty("--nl-design-w", "100%");
      document.documentElement.style.setProperty("--nl-design-h", "100%");
      document.documentElement.classList.remove("nl-mobile-scaled");
      emitResize();
      return;
    }

    var sx = vp.w / design.w;
    var sy = vp.h / design.h;
    var s = Math.min(sx, sy);
    if (s > 1) s = 1;
    if (s < 0.35) s = 0.35;

    var ox = (vp.w - design.w * s) / 2;
    var oy = (vp.h - design.h * s) / 2;
    var scaleKey = key + "|" + s.toFixed(4) + "|" + Math.round(ox) + "|" + Math.round(oy);
    if (lastKey === scaleKey) return;
    lastKey = scaleKey;

    el.classList.remove("is-fluid");
    el.classList.add("is-scaled");
    el.style.width = design.w + "px";
    el.style.height = design.h + "px";
    el.style.transform = "translate(" + ox + "px," + oy + "px) scale(" + s + ")";

    document.documentElement.style.setProperty("--nl-scale", String(s));
    document.documentElement.style.setProperty("--nl-design-w", design.w + "px");
    document.documentElement.style.setProperty("--nl-design-h", design.h + "px");
    document.documentElement.classList.add("nl-mobile-scaled");
    emitResize();
  }

  function emitResize() {
    try {
      window.dispatchEvent(new Event("resize"));
    } catch (_) {
      /* ignore */
    }
  }

  function schedule() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = 0;
      try {
        apply();
      } catch (err) {
        console.warn("[NLMobileScale] apply lỗi", err);
      }
    });
  }

  function scheduleOrient() {
    if (orientTimer) clearTimeout(orientTimer);
    // iOS/Android đổi orientation: đợi layout ổn rồi mới scale (tránh frame 0×0)
    orientTimer = setTimeout(function () {
      orientTimer = 0;
      lastKey = ""; // force re-apply
      schedule();
      setTimeout(schedule, 280);
    }, 180);
  }

  function boot() {
    ensureRoot();
    apply();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", scheduleOrient, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", schedule, { passive: true });
      // Không listen scroll — trên mobile chrome ẩn/hiện gây storm resize → dễ crash GL
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
