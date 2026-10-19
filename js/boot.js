/* global window, document */
/**
 * Màn hình loading full-screen: giữ overlay đến khi logic + module thành sẵn sàng.
 * Asset phụ (folk/scape/…) dùng soft timeout — không treo nếu fail.
 */
(function () {
  var overlay = document.getElementById("nl-loading");
  var fill = document.getElementById("nl-loading-fill");
  var pctEl = document.getElementById("nl-loading-pct");
  var labelEl = document.getElementById("nl-loading-label");
  var holds = Object.create(null);
  var progress = 0;
  var hideTimer = 0;

  function setProgress(p, label) {
    progress = Math.max(progress, Math.min(100, Math.round(p)));
    if (fill) fill.style.width = progress + "%";
    if (pctEl) pctEl.textContent = progress + "%";
    if (label != null && labelEl) labelEl.textContent = label;
  }

  function syncOverlay() {
    var busy = false;
    for (var k in holds) {
      if (holds[k]) {
        busy = true;
        break;
      }
    }
    if (!overlay) return;
    if (busy) {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = 0;
      }
      document.documentElement.classList.add("is-booting");
      overlay.hidden = false;
      overlay.classList.remove("is-done");
      overlay.setAttribute("aria-busy", "true");
    } else {
      overlay.classList.add("is-done");
      overlay.setAttribute("aria-busy", "false");
      hideTimer = setTimeout(function () {
        overlay.hidden = true;
        document.documentElement.classList.remove("is-booting");
        hideTimer = 0;
      }, 480);
    }
  }

  function hold(id, label) {
    holds[id] = true;
    if (label) setProgress(progress, label);
    syncOverlay();
  }

  function release(id) {
    delete holds[id];
    syncOverlay();
  }

  function soft(promise, ms) {
    if (!promise || typeof promise.then !== "function") {
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve();
      }
      promise.then(finish, finish);
      setTimeout(finish, ms || 8000);
    });
  }

  function waitFor(check, ms) {
    return new Promise(function (resolve) {
      var t0 = Date.now();
      function tick() {
        try {
          if (check()) {
            resolve(true);
            return;
          }
        } catch (_) {}
        if (Date.now() - t0 >= (ms || 15000)) {
          resolve(false);
          return;
        }
        setTimeout(tick, 40);
      }
      tick();
    });
  }

  function waitCityModule() {
    if (typeof window.NLCity !== "undefined") return Promise.resolve();
    return new Promise(function (resolve) {
      var done = false;
      function finish(ok) {
        if (done) return;
        done = true;
        if (!ok) {
          console.warn("[NLBoot] Module Thành Chính chưa sẵn sàng — mở UI (3D có thể thiếu).");
        }
        resolve();
      }
      window.addEventListener(
        "nl-city-ready",
        function () {
          finish(true);
        },
        { once: true }
      );
      // Soft timeout ngắn hơn — tránh kẹt 70% lâu nếu ES module lỗi
      setTimeout(function () {
        finish(typeof window.NLCity !== "undefined");
      }, 8000);
    });
  }

  function waitFonts() {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    return soft(document.fonts.ready, 4000);
  }

  hold("core", "Khởi tạo…");
  setProgress(5, "Khởi tạo…");

  (async function gateCore() {
    // Nhường lượt để các script sync phía sau (NLGame, app) kịp gắn window
    await Promise.resolve();
    setProgress(20, "Nạp logic…");
    await waitFor(function () {
      return typeof window.NLGame !== "undefined" && typeof window.NLUI !== "undefined";
    }, 15000);

    setProgress(45, "Font chữ…");
    await waitFonts();

    setProgress(70, "Module Thành Chính…");
    await waitCityModule();

    setProgress(100, "Sẵn sàng");
    await soft(Promise.resolve(), 180);
    release("core");
  })().catch(function (err) {
    console.error("[NLBoot] gate lỗi, mở UI", err);
    setProgress(100, "Sẵn sàng");
    release("core");
  });

  window.NLBoot = {
    setProgress: setProgress,
    hold: hold,
    release: release,
    soft: soft,
    /** Hiện lại overlay khi vào Thành Chính / tải scene nặng */
    beginCity: function (label) {
      progress = Math.min(progress, 55);
      hold("city", label || "Đang dựng Thành Chính…");
      setProgress(55, label || "Đang dựng Thành Chính…");
    },
    endCity: function () {
      setProgress(100, "Hoàn tất");
      release("city");
    },
  };
})();
