/* global window */
/**
 * Combat VFX runtime
 * - Particle SoA nhẹ (học LiteFX / lite-soa-particle-engine)
 * - Timeline skill (học JRPG battle-animation phases)
 * - DOM overlays cho slash / banner / bagua
 */
(function (global) {
  var MAX_P = 3600;

  /** Sprite FX sheets (CC0 — assets/CREDITS.md) */
  var FX_SHEETS = {
    arcane: [
      "assets/fx/arcane/Arcane_Effect_1.png",
      "assets/fx/arcane/Arcane_Effect_2.png",
      "assets/fx/arcane/Arcane_Effect_3.png",
      "assets/fx/arcane/Arcane_Effect_4.png",
      "assets/fx/arcane/Arcane_Effect_5.png",
      "assets/fx/arcane/Arcane_Effect_6.png",
      "assets/fx/arcane/Arcane_Effect_7.png",
    ],
    light: [
      "assets/fx/pure/files_pure_01.png",
      "assets/fx/pure/files_pure_02.png",
      "assets/fx/pure/files_pure_03.png",
      "assets/fx/particles/flare_01.png",
      "assets/fx/particles/star_01.png",
    ],
    earth: [
      "assets/fx/earth/1_Earth-Impact_01.png",
      "assets/fx/earth/1_Earth-Impact_02.png",
      "assets/fx/earth/1_Earth-Impact_03.png",
      "assets/fx/earth/1_Earth-Impact_04.png",
      "assets/fx/earth/1_Earth-Impact_05.png",
    ],
  };

  var FX_FLARES = {
    fire: "assets/fx/particles/flame_03.png",
    magic: "assets/fx/particles/magic_02.png",
    sparks: "assets/fx/particles/spark_02.png",
    flare: "assets/fx/particles/flare_01.png",
    star: "assets/fx/particles/star_01.png",
    scorch: "assets/fx/particles/scorch_01.png",
  };

  function essenceSheet(essenceId) {
    if (essenceId === "ember" || essenceId === "iron") return "earth";
    if (essenceId === "frost" || essenceId === "radiance" || essenceId === "wind") return "light";
    return "arcane";
  }

  function playSpriteSheet(layer, x, y, frames, opts) {
    opts = opts || {};
    if (!frames || !frames.length || !layer) return null;
    var img = el("img", "vfx-sheet" + (opts.scale === "L" ? " scale-L" : ""));
    img.alt = "";
    img.draggable = false;
    img.src = frames[0];
    img.style.left = x + "px";
    img.style.top = y + "px";
    layer.appendChild(img);
    var i = 0;
    var frameMs = opts.frameMs || 55;
    var timer = setInterval(function () {
      i++;
      if (i >= frames.length) {
        clearInterval(timer);
        if (img.parentNode) img.parentNode.removeChild(img);
        return;
      }
      img.src = frames[i];
    }, frameMs);
    setTimeout(function () {
      clearInterval(timer);
      if (img.parentNode) img.parentNode.removeChild(img);
    }, frameMs * frames.length + 80);
    return img;
  }

  function spawnFlare(layer, x, y, kind) {
    var src = FX_FLARES[kind] || FX_FLARES.flare;
    var img = el("img", "vfx-flare");
    img.src = src;
    img.alt = "";
    img.style.left = x + "px";
    img.style.top = y + "px";
    return spawn(layer, img, 720);
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function spawn(layer, node, ms) {
    if (!layer || !node) return null;
    layer.appendChild(node);
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, ms || 700);
    return node;
  }

  function cardCenter(card, root) {
    if (!card || !root) return { x: root ? root.clientWidth / 2 : 0, y: root ? root.clientHeight * 0.4 : 0 };
    var r = card.getBoundingClientRect();
    var pr = root.getBoundingClientRect();
    return {
      x: r.left - pr.left + r.width / 2,
      y: r.top - pr.top + r.height * 0.38,
    };
  }

  /* ========== Canvas particle engine (SoA) ========== */
  function ParticleLayer(host) {
    this.host = host;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "vfx-canvas";
    this.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:14;";
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.x = new Float32Array(MAX_P);
    this.y = new Float32Array(MAX_P);
    this.vx = new Float32Array(MAX_P);
    this.vy = new Float32Array(MAX_P);
    this.life = new Float32Array(MAX_P);
    this.maxLife = new Float32Array(MAX_P);
    this.size = new Float32Array(MAX_P);
    this.r = new Uint8Array(MAX_P);
    this.g = new Uint8Array(MAX_P);
    this.b = new Uint8Array(MAX_P);
    this.alive = 0;
    this._raf = 0;
    this._last = 0;
    this._running = false;
    this.resize();
  }

  ParticleLayer.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = this.host.clientWidth || 1;
    var h = this.host.clientHeight || 1;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w;
    this.h = h;
  };

  ParticleLayer.prototype.emit = function (x, y, vx, vy, life, size, color) {
    var i = this.alive;
    if (i >= MAX_P) i = (i % MAX_P);
    else this.alive++;
    this.x[i] = x;
    this.y[i] = y;
    this.vx[i] = vx;
    this.vy[i] = vy;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.size[i] = size;
    this.r[i] = color[0];
    this.g[i] = color[1];
    this.b[i] = color[2];
  };

  ParticleLayer.prototype.burst = function (x, y, preset, count) {
    count = count || 40;
    var colors = preset.rgb || [[255, 220, 120]];
    var speed = preset.speed || 180;
    var life = preset.life || 0.7;
    var size = preset.size || 4;
    var gravity = preset.gravity || 0;
    this._gravity = gravity;
    for (var i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2;
      var s = speed * (0.35 + Math.random() * 0.9);
      var c = colors[(Math.random() * colors.length) | 0];
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s - (preset.up || 0), life * (0.5 + Math.random() * 0.7), size * (0.5 + Math.random()), c);
    }
    this.start();
  };

  ParticleLayer.prototype.rain = function (preset, count) {
    count = count || 28;
    var colors = preset.rgb || [[255, 120, 40]];
    for (var i = 0; i < count; i++) {
      var x = Math.random() * this.w;
      var y = -10 - Math.random() * 80;
      var c = colors[(Math.random() * colors.length) | 0];
      this.emit(x, y, (Math.random() - 0.5) * 40, 220 + Math.random() * 180, 0.9 + Math.random() * 0.5, 3 + Math.random() * 4, c);
    }
    this._gravity = 120;
    this.start();
  };

  ParticleLayer.prototype.ring = function (x, y, preset, count) {
    count = count || 36;
    var colors = preset.rgb || [[200, 180, 255]];
    var rad = preset.radius || 20;
    for (var i = 0; i < count; i++) {
      var a = (i / count) * Math.PI * 2;
      var c = colors[i % colors.length];
      this.emit(x + Math.cos(a) * rad, y + Math.sin(a) * rad, Math.cos(a) * 90, Math.sin(a) * 90, 0.65, 3.5, c);
    }
    this._gravity = -30;
    this.start();
  };

  ParticleLayer.prototype.start = function () {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    var self = this;
    function tick(now) {
      var dt = Math.min(0.033, (now - self._last) / 1000);
      self._last = now;
      self.step(dt);
      self.draw();
      if (self.alive > 0) self._raf = requestAnimationFrame(tick);
      else {
        self._running = false;
        self.ctx.clearRect(0, 0, self.w, self.h);
      }
    }
    this._raf = requestAnimationFrame(tick);
  };

  ParticleLayer.prototype.step = function (dt) {
    var g = this._gravity || 0;
    var write = 0;
    for (var i = 0; i < this.alive; i++) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) continue;
      this.vy[i] += g * dt;
      this.vx[i] *= 0.98;
      this.vy[i] *= 0.98;
      this.x[i] += this.vx[i] * dt;
      this.y[i] += this.vy[i] * dt;
      if (write !== i) {
        this.x[write] = this.x[i];
        this.y[write] = this.y[i];
        this.vx[write] = this.vx[i];
        this.vy[write] = this.vy[i];
        this.life[write] = this.life[i];
        this.maxLife[write] = this.maxLife[i];
        this.size[write] = this.size[i];
        this.r[write] = this.r[i];
        this.g[write] = this.g[i];
        this.b[write] = this.b[i];
      }
      write++;
    }
    this.alive = write;
  };

  ParticleLayer.prototype.draw = function () {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < this.alive; i++) {
      var a = Math.max(0, this.life[i] / this.maxLife[i]);
      var s = this.size[i] * (0.6 + a * 0.8);
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + this.r[i] + "," + this.g[i] + "," + this.b[i] + "," + a.toFixed(3) + ")";
      ctx.arc(this.x[i], this.y[i], s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  };

  ParticleLayer.prototype.destroy = function () {
    cancelAnimationFrame(this._raf);
    if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
  };

  /* ========== Presets (LiteFX-style recipes) ========== */
  function hexToRgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function presetFromEssence(essenceId) {
    var Design = global.NLSkillDesign;
    var ess = (Design && Design.ESSENCE[essenceId]) || { colors: ["#ffe484", "#fb923c"] };
    var rgb = ess.colors.map(hexToRgb);
    var kind = ess.particle || "magic";
    var base = { rgb: rgb, speed: 160, life: 0.75, size: 4, gravity: 40, up: 40 };
    if (kind === "fire") return Object.assign({}, base, { speed: 200, gravity: 60, up: 80, size: 5 });
    if (kind === "frost") return Object.assign({}, base, { speed: 120, gravity: -20, up: 20, size: 3.5 });
    if (kind === "sparks") return Object.assign({}, base, { speed: 280, gravity: 90, life: 0.45, size: 2.5 });
    if (kind === "wind") return Object.assign({}, base, { speed: 260, gravity: -10, up: 10, size: 3 });
    if (kind === "poison") return Object.assign({}, base, { speed: 90, gravity: -40, up: 60, life: 1.1, size: 5 });
    if (kind === "bagua") return Object.assign({}, base, { speed: 140, gravity: -25, radius: 28, size: 4 });
    return base;
  }

  /* ========== Runtime ========== */
  var _particles = null;

  function ensureParticles(layer) {
    if (_particles && _particles.host === layer) {
      _particles.resize();
      return _particles;
    }
    if (_particles) _particles.destroy();
    _particles = new ParticleLayer(layer);
    return _particles;
  }

  function atCard(layer, card, root, cls, html, ms) {
    var node = el("div", cls, html || "");
    var c = cardCenter(card, root);
    node.style.left = c.x + "px";
    node.style.top = c.y + "px";
    return spawn(layer, node, ms);
  }

  function slash(layer, card, root, fromEnemy) {
    return atCard(layer, card, root, "vfx-slash" + (fromEnemy ? " from-enemy" : ""), "", 520);
  }

  function impact(layer, card, root, kind) {
    atCard(layer, card, root, "vfx-impact" + (kind === "crit" ? " crit" : ""), "", 480);
    var p = ensureParticles(layer);
    var c = cardCenter(card, root);
    var preset = kind === "crit"
      ? { rgb: [[255, 240, 180], [255, 100, 40], [255, 40, 20]], speed: 320, life: 0.65, size: 4.2, gravity: 90, up: 80 }
      : { rgb: [[255, 220, 140], [255, 120, 60]], speed: 220, life: 0.5, size: 3.2, gravity: 70, up: 50 };
    p.burst(c.x, c.y, preset, kind === "crit" ? 120 : 64);
    spawnFlare(layer, c.x, c.y, kind === "crit" ? "star" : "flare");
    playSpriteSheet(layer, c.x, c.y, FX_SHEETS.earth, {
      frameMs: kind === "crit" ? 45 : 55,
      scale: kind === "crit" ? "L" : "M",
    });
  }

  function lunge(card, towardEnemy) {
    if (!card) return;
    card.classList.remove("vfx-lunge-fwd", "vfx-lunge-back");
    void card.offsetWidth;
    card.classList.add(towardEnemy ? "vfx-lunge-fwd" : "vfx-lunge-back");
    setTimeout(function () {
      card.classList.remove("vfx-lunge-fwd", "vfx-lunge-back");
    }, 380);
  }

  function screenShake(root) {
    if (!root) return;
    root.classList.remove("vfx-shake");
    void root.offsetWidth;
    root.classList.add("vfx-shake");
    setTimeout(function () {
      root.classList.remove("vfx-shake");
    }, 320);
  }

  function showBanner(layer, text, profile) {
    var delivery = (global.NLSkillDesign && global.NLSkillDesign.DELIVERY[profile.delivery]) || {};
    var banner = el(
      "div",
      "c-skill-banner skd-" + profile.essence + " skd-del-" + profile.delivery + " skd-scale-" + profile.scale,
      '<span class="skd-glyph">' +
        (delivery.glyph || "術") +
        '</span><span class="skd-text">' +
        (text || "CHIẾN PHÁP") +
        "</span>"
    );
    spawn(layer, banner, Math.max(700, profile.durations.castMs + profile.durations.emissionMs));
  }

  function showVeil(layer, profile) {
    var veil = el("div", "c-screen-flash skd-" + profile.essence);
    spawn(layer, veil, 420);
  }

  function runEmission(layer, root, profile, sourceCard, targetCards) {
    var p = ensureParticles(layer);
    var preset = presetFromEssence(profile.essence);
    var origin = cardCenter(sourceCard, root);
    var center = { x: root.clientWidth / 2, y: root.clientHeight * 0.42 };
    var sheetKey = essenceSheet(profile.essence);
    var sheet = FX_SHEETS[sheetKey] || FX_SHEETS.arcane;
    var big = profile.scale === "L";

    if (profile.emission === "rain" || profile.visual === "meteor") {
      p.rain(preset, big ? 96 : 56);
      playSpriteSheet(layer, center.x, center.y * 0.85, sheet, { frameMs: 50, scale: profile.scale });
      spawnFlare(layer, center.x, center.y, "fire");
    } else if (profile.emission === "ring" || profile.visual === "bagua" || profile.visual === "heal" || profile.visual === "sigil") {
      p.ring(center.x, center.y, preset, big ? 96 : 56);
      playSpriteSheet(layer, center.x, center.y, FX_SHEETS.light, { frameMs: 50, scale: profile.scale });
      if (profile.visual === "bagua") {
        var bagua = el("div", "c-bagua-ring skd-bagua", "☯");
        spawn(layer, bagua, 1100);
      }
      if (profile.visual === "sigil" || profile.visual === "heal") {
        var sigil = el("div", "vfx-sigil skd-" + profile.essence, profile.visual === "heal" ? "✚" : "☯");
        sigil.style.left = center.x + "px";
        sigil.style.top = center.y + "px";
        spawn(layer, sigil, 900);
      }
      spawnFlare(layer, center.x, center.y, "magic");
    } else if (profile.emission === "trail" || profile.visual === "wind" || profile.visual === "chain") {
      var wind = el("div", "c-wind-sweep skd-" + profile.essence);
      spawn(layer, wind, 700);
      p.burst(center.x, center.y, preset, big ? 90 : 55);
      playSpriteSheet(layer, center.x, center.y, FX_SHEETS.light, { frameMs: 48, scale: profile.scale });
    } else if (profile.emission === "projectile" || profile.visual === "pierce" || profile.visual === "arrow") {
      var beam = el("div", "c-pierce-beam skd-" + profile.essence);
      spawn(layer, beam, 550);
      p.burst(origin.x, origin.y, Object.assign({}, preset, { speed: 420, up: 0 }), big ? 70 : 40);
      playSpriteSheet(layer, origin.x + 80, origin.y, FX_SHEETS.arcane, { frameMs: 45, scale: profile.scale });
      spawnFlare(layer, origin.x, origin.y, "sparks");
    } else if (profile.visual === "thunder") {
      var bolt = el("div", "c-thunder-bolt");
      spawn(layer, bolt, 500);
      p.burst(center.x, center.y * 0.7, preset, big ? 110 : 70);
      playSpriteSheet(layer, center.x, center.y * 0.75, FX_SHEETS.arcane, { frameMs: 40, scale: "L" });
      spawnFlare(layer, center.x, center.y * 0.7, "star");
    } else {
      var tx = targetCards && targetCards[0] ? cardCenter(targetCards[0], root) : origin;
      p.burst(tx.x, tx.y, preset, big ? 110 : 70);
      playSpriteSheet(layer, tx.x, tx.y, sheet, { frameMs: 48, scale: profile.scale });
      spawnFlare(layer, tx.x, tx.y, profile.essence === "ember" ? "fire" : "flare");
      if (profile.visual === "slash") {
        slash(layer, targetCards && targetCards[0], root, false);
      }
      if (profile.visual === "shockwave") {
        var wave = el("div", "vfx-shockwave skd-" + profile.essence);
        wave.style.left = (targetCards && targetCards[0] ? cardCenter(targetCards[0], root).x : center.x) + "px";
        wave.style.top = (targetCards && targetCards[0] ? cardCenter(targetCards[0], root).y : center.y) + "px";
        spawn(layer, wave, 600);
      }
    }
  }

  /**
   * Play full skill theo timeline design
   * opts: { layer, root, sourceCard, targetCards, text, flash }
   */
  function playSkill(opts) {
    opts = opts || {};
    var Design = global.NLSkillDesign;
    if (!Design) {
      skillBurst(opts.layer, opts.flash);
      return { cancel: function () {} };
    }
    var profile = Design.resolve(opts.flash || "gold");
    var layer = opts.layer;
    var root = opts.root || layer;

    return Design.playTimeline(profile, function (phase, p) {
      if (phase === "windup") {
        if (opts.sourceCard) {
          opts.sourceCard.classList.add("skill-glow", "skd-windup");
          if (p.movement === "lunge" || p.movement === "thrust") {
            lunge(opts.sourceCard, opts.sourceCard.dataset.side !== "enemy");
          }
        }
      }
      if (phase === "cast") {
        showBanner(layer, opts.text, p);
        showVeil(layer, p);
      }
      if (phase === "emission") {
        runEmission(layer, root, p, opts.sourceCard, opts.targetCards);
      }
      if (phase === "impact") {
        (opts.targetCards || []).forEach(function (card) {
          if (!card) return;
          card.classList.add("hit");
          impact(layer, card, root, p.scale === "L" ? "crit" : "hit");
          setTimeout(function () {
            card.classList.remove("hit");
          }, 280);
        });
        if (p.scale === "L") screenShake(root);
      }
      if (phase === "recovery") {
        if (opts.sourceCard) {
          opts.sourceCard.classList.remove("skill-glow", "skd-windup");
        }
      }
    });
  }

  function skillBurst(layer, flash) {
    if (!layer) return;
    var Design = global.NLSkillDesign;
    var profile = Design ? Design.resolve(flash) : { essence: "radiance", delivery: "arcane", scale: "M", durations: { castMs: 200, emissionMs: 400 } };
    showBanner(layer, null, profile);
    var p = ensureParticles(layer);
    var preset = presetFromEssence(profile.essence);
    var cx = layer.clientWidth / 2;
    var cy = layer.clientHeight * 0.42;
    p.burst(cx, cy, preset, 90);
    playSpriteSheet(layer, cx, cy, FX_SHEETS[essenceSheet(profile.essence)] || FX_SHEETS.arcane, {
      frameMs: 48,
      scale: profile.scale,
    });
    spawnFlare(layer, cx, cy, "magic");
  }

  global.NLCombatVfx = {
    slash: slash,
    impact: impact,
    lunge: lunge,
    skillBurst: skillBurst,
    screenShake: screenShake,
    playSkill: playSkill,
    ensureParticles: ensureParticles,
    playSpriteSheet: playSpriteSheet,
  };
})(window);
