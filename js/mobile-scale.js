/* global window, document */
/**
 * Mobile layout — KHÔNG CSS-transform scale khung 1280×720.
 * Scale làm #app vẫn 1280px → WebGL setSize(1280×dpr) trên máy hẹp = OOM / crash khi xoay.
 * Giờ luôn fluid 100% viewport; chỉ debounce orientation → 1 lần resize sau khi ổn.
 */
(function () {
  var root = null;
  var raf = 0;
  var orientTimer = 0;
  var lastEmit = 0;

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

  /** Luôn fluid — không transform scale. */
  function applyFluid() {
    var el = ensureRoot();
    if (!el) return;
    var vp = viewportSize();
    if (vp.w < 8 || vp.h < 8) return;

    el.classList.add("is-fluid");
    el.classList.remove("is-scaled");
    el.style.width = "";
    el.style.height = "";
    el.style.transform = "";

    document.documentElement.style.setProperty("--nl-vp-w", vp.w + "px");
    document.documentElement.style.setProperty("--nl-vp-h", vp.h + "px");
    document.documentElement.style.setProperty("--nl-scale", "1");
    document.documentElement.style.setProperty("--nl-design-w", "100%");
    document.documentElement.style.setProperty("--nl-design-h", "100%");
    document.documentElement.classList.remove("nl-mobile-scaled");
  }

  function emitResize() {
    var now = Date.now();
    if (now - lastEmit < 120) return;
    lastEmit = now;
    try {
      window.dispatchEvent(new Event("resize"));
    } catch (_) {
      /* ignore */
    }
  }

  function schedule(emit) {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = 0;
      try {
        applyFluid();
        if (emit) emitResize();
      } catch (err) {
        console.warn("[NLMobileScale]", err);
      }
    });
  }

  function onOrient() {
    // Báo city/battle tạm nghỉ trước khi layout đảo
    try {
      window.dispatchEvent(new CustomEvent("nl-orientation-begin"));
    } catch (_) {}
    if (orientTimer) clearTimeout(orientTimer);
    orientTimer = setTimeout(function () {
      orientTimer = 0;
      schedule(true);
      setTimeout(function () {
        schedule(true);
        try {
          window.dispatchEvent(new CustomEvent("nl-orientation-end"));
        } catch (_) {}
      }, 320);
    }, 220);
  }

  function boot() {
    ensureRoot();
    applyFluid();
    // Chỉ orientation — không storm từ visualViewport/resize (browser tự fire resize)
    window.addEventListener("orientationchange", onOrient, { passive: true });
    try {
      var mql = window.matchMedia("(orientation: portrait)");
      if (mql && mql.addEventListener) {
        mql.addEventListener("change", onOrient, { passive: true });
      } else if (mql && mql.addListener) {
        mql.addListener(onOrient);
      }
    } catch (_) {}
    // resize: chỉ sync CSS vars, không synthetic Event (tránh vòng lặp)
    window.addEventListener(
      "resize",
      function () {
        schedule(false);
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.NLMobileScale = {
    refresh: function () {
      schedule(true);
    },
    apply: applyFluid,
  };
})();
