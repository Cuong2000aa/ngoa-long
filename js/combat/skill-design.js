/* global window */
/**
 * Skill Design System — học theo patrickdugan/JRPG battle-animation
 *
 * Pattern:
 *  - Mỗi chiêu = profile { delivery, essence, movement, emission, durations }
 *  - Timeline phases: windup → cast → emission → impact → recovery
 *  - Presentation tách khỏi combat engine (engine vẫn authoritative)
 *
 * Refs:
 *  - https://github.com/patrickdugan/JRPG (battle-animation.mjs)
 *  - https://github.com/PeshoVurtoleta/lite-fx (particle presets)
 *  - https://github.com/reifier-k/nachi (effect recipes S/M/L)
 */
(function (global) {
  var PHASE_ORDER = [
    "windup",
    "cast",
    "emission",
    "impact",
    "recovery",
  ];

  /** Delivery = cách ra đòn (màu / silhouette chính) */
  var DELIVERY = {
    cut: { color: "#ff6b5a", glyph: "Chém", scale: "S" },
    pierce: { color: "#ffe484", glyph: "Đâm", scale: "S" },
    crush: { color: "#c9a070", glyph: "Đập", scale: "S" },
    arcane: { color: "#b57aff", glyph: "Thuật", scale: "M" },
    buff: { color: "#86efac", glyph: "Trợ", scale: "M" },
    ultimate: { color: "#fb923c", glyph: "Tuyệt", scale: "L" },
  };

  /** Essence = nguyên tố / khí (particle palette) */
  var ESSENCE = {
    ember: { colors: ["#fff7c2", "#fb923c", "#dc2626"], particle: "fire" },
    frost: { colors: ["#e0f2fe", "#38bdf8", "#0284c7"], particle: "frost" },
    storm: { colors: ["#fef9c3", "#a78bfa", "#7c3aed"], particle: "sparks" },
    radiance: { colors: ["#fffbeb", "#fde68a", "#e8c547"], particle: "magic" },
    umbral: { colors: ["#e9d5ff", "#a78bfa", "#5b21b6"], particle: "magic" },
    wind: { colors: ["#d1fae5", "#6ee7b7", "#059669"], particle: "wind" },
    poison: { colors: ["#ecfccb", "#a3e635", "#65a30d"], particle: "poison" },
    iron: { colors: ["#e2e8f0", "#94a3b8", "#475569"], particle: "sparks" },
    bagua: { colors: ["#fef08a", "#67e8f9", "#c084fc"], particle: "bagua" },
    beast: { colors: ["#fef3c7", "#fbbf24", "#ea580c"], particle: "sparks" },
  };

  /** Motif có recipe/sheet riêng — thắng flash generic */
  var MOTIF_DEDICATED_FLASH = {
    tiger: "tiger",
    wolf: "wolf",
    whirlwind: "whirlwind",
    dragon: "dragon",
    snake: "snake",
    poison: "green_poison",
    fire: "fire_rain",
    thunder: "thunder",
    water: "blue_water",
    bagua: "bagua",
    shield: "shield",
    charge: "charge",
    rush: "rush",
    pierce: "steel",
  };
  var MOTIF_FALLBACK_FLASH = {
    tiger: "tiger",
    wolf: "wolf",
    whirlwind: "whirlwind",
    dragon: "dragon",
    snake: "snake",
    poison: "green_poison",
    fire: "fire_rain",
    thunder: "thunder",
    water: "blue_water",
    bagua: "bagua",
    shield: "shield",
    heal: "gold_soft",
    buff: "gold_soft",
    shadow: "purple",
    arcane: "blue",
    slash: "steel",
    pierce: "steel",
    charge: "charge",
    rush: "rush",
  };
  var MOTIF_TO_FLASH = MOTIF_FALLBACK_FLASH;

  function resolveFxKey(flashOrFx, motif) {
    var flash = flashOrFx;
    var m = motif;
    if (flashOrFx && typeof flashOrFx === "object") {
      flash = flashOrFx.flash;
      m = flashOrFx.motif || motif;
    }
    if (m && MOTIF_DEDICATED_FLASH[m]) return MOTIF_DEDICATED_FLASH[m];
    if (flash) return flash;
    if (m && MOTIF_FALLBACK_FLASH[m]) return MOTIF_FALLBACK_FLASH[m];
    return "gold";
  }

  function profile(cfg) {
    return {
      id: cfg.id,
      delivery: cfg.delivery || "arcane",
      essence: cfg.essence || "radiance",
      movement: cfg.movement || "plant", // plant | lunge | thrust
      emission: cfg.emission || "burst", // none | burst | trail | projectile | rain | ring
      visual: cfg.visual || "default",
      scale: cfg.scale || (DELIVERY[cfg.delivery] && DELIVERY[cfg.delivery].scale) || "M",
      durations: {
        windupMs: (cfg.durations && cfg.durations.windupMs) || 160,
        castMs: (cfg.durations && cfg.durations.castMs) || 200,
        // ≥ charge+flight (~120–200 + 400–700) để impact không cắt đạn bay
        emissionMs: (cfg.durations && cfg.durations.emissionMs) || 640,
        impactMs: (cfg.durations && cfg.durations.impactMs) || 200,
        recoveryMs: (cfg.durations && cfg.durations.recoveryMs) || 180,
      },
    };
  }

  /**
   * Map flash string từ skills.json → presentation profile
   * (giữ tương thích data cũ, enrich bằng design vocabulary)
   */
  var BY_FLASH = {
    white: profile({ id: "manh_kich", delivery: "cut", essence: "iron", movement: "lunge", emission: "burst", visual: "slash", scale: "S",
      durations: { windupMs: 120, castMs: 80, emissionMs: 0, impactMs: 180, recoveryMs: 160 } }),
    blue: profile({ id: "ky_muu", delivery: "arcane", essence: "frost", movement: "plant", emission: "ring", visual: "sigil" }),
    gold_red: profile({ id: "vu_thanh", delivery: "cut", essence: "radiance", movement: "lunge", emission: "burst", visual: "slash", scale: "M",
      durations: { windupMs: 140, castMs: 100, emissionMs: 120, impactMs: 220, recoveryMs: 200 } }),
    brown: profile({ id: "gam_thet", delivery: "crush", essence: "iron", movement: "plant", emission: "burst", visual: "shockwave", scale: "M" }),
    /** Kỵ xung kích — ngựa tông skill (Kỵ Liệp / Kỵ Kích). Scale L ≠ đánh thường S. */
    charge: profile({
      id: "ky_xung",
      delivery: "crush",
      essence: "iron",
      movement: "lunge",
      emission: "burst",
      visual: "shockwave",
      scale: "L",
      durations: { windupMs: 140, castMs: 100, emissionMs: 280, impactMs: 360, recoveryMs: 220 },
    }),
    /** Đột kích bộ/thương — xông đâm (Chu Thương Đột Kích), không phải ngựa */
    rush: profile({
      id: "dot_kich",
      delivery: "pierce",
      essence: "iron",
      movement: "thrust",
      emission: "trail",
      visual: "pierce",
      scale: "M",
      durations: { windupMs: 90, castMs: 70, emissionMs: 560, impactMs: 260, recoveryMs: 180 },
    }),
    /** Thiết Bích / hộ thể — khiên vàng */
    shield: profile({
      id: "thiet_bich",
      delivery: "buff",
      essence: "radiance",
      movement: "plant",
      emission: "ring",
      visual: "heal",
      scale: "M",
      durations: { windupMs: 120, castMs: 160, emissionMs: 520, impactMs: 200, recoveryMs: 180 },
    }),
    white_blue: profile({ id: "long_dam", delivery: "pierce", essence: "frost", movement: "thrust", emission: "trail", visual: "pierce" }),
    cyan: profile({ id: "khong_thanh", delivery: "arcane", essence: "frost", movement: "plant", emission: "ring", visual: "sigil" }),
    orange: profile({ id: "ho_khi", delivery: "crush", essence: "ember", movement: "lunge", emission: "burst", visual: "slash" }),
    tiger: profile({
      id: "ho_khieu",
      delivery: "crush",
      essence: "beast",
      movement: "plant",
      emission: "ring",
      visual: "roar",
      scale: "L",
      // flight ~1.1s như Hỏa Long
      durations: { windupMs: 140, castMs: 120, emissionMs: 1500, impactMs: 280, recoveryMs: 180 },
    }),
    red_fire: profile({ id: "hoa_cong", delivery: "arcane", essence: "ember", movement: "plant", emission: "rain", visual: "fireball", scale: "M" }),
    purple: profile({ id: "an_muu", delivery: "arcane", essence: "umbral", movement: "plant", emission: "burst", visual: "sigil" }),
    yellow: profile({ id: "bach_bo", delivery: "pierce", essence: "radiance", movement: "plant", emission: "projectile", visual: "arrow" }),
    silver: profile({ id: "thiet_ky", delivery: "pierce", essence: "iron", movement: "lunge", emission: "trail", visual: "pierce" }),
    iron: profile({ id: "co_chien", delivery: "crush", essence: "iron", movement: "lunge", emission: "burst", visual: "shockwave" }),
    teal: profile({ id: "dong_ngo", delivery: "arcane", essence: "frost", movement: "plant", emission: "ring", visual: "sigil" }),
    green_poison: profile({
      id: "doc_muu", delivery: "arcane", essence: "poison", movement: "plant", emission: "burst", visual: "poison",
      durations: { windupMs: 130, castMs: 100, emissionMs: 1500, impactMs: 260, recoveryMs: 160 },
    }),
    poison: profile({
      id: "doc_muu", delivery: "arcane", essence: "poison", movement: "plant", emission: "burst", visual: "poison",
      durations: { windupMs: 130, castMs: 100, emissionMs: 1500, impactMs: 260, recoveryMs: 160 },
    }),
    snake: profile({
      id: "doc_xa", delivery: "arcane", essence: "poison", movement: "plant", emission: "trail", visual: "poison", scale: "M",
      durations: { windupMs: 130, castMs: 100, emissionMs: 1500, impactMs: 260, recoveryMs: 160 },
    }),
    dragon: profile({
      id: "hoa_long", delivery: "ultimate", essence: "ember", movement: "plant", emission: "burst", visual: "meteor", scale: "L",
      // charge ~220 + flight ~1.1–1.2s (scale L) — đủ nhìn rồng lưỡn xuất→đụng
      durations: { windupMs: 140, castMs: 120, emissionMs: 1500, impactMs: 320, recoveryMs: 200 },
    }),
    violet: profile({ id: "phung_so", delivery: "arcane", essence: "umbral", movement: "plant", emission: "trail", visual: "sigil" }),
    fire_green: profile({ id: "lua_luc", delivery: "arcane", essence: "poison", movement: "plant", emission: "rain", visual: "fireball" }),
    dark_red: profile({ id: "phan_cot", delivery: "cut", essence: "umbral", movement: "lunge", emission: "burst", visual: "slash" }),
    gold_soft: profile({ id: "nhan_duc", delivery: "buff", essence: "radiance", movement: "plant", emission: "ring", visual: "heal" }),
    yellow_cult: profile({ id: "hoang_thien", delivery: "arcane", essence: "radiance", movement: "plant", emission: "ring", visual: "sigil", scale: "L" }),
    red: profile({ id: "ho_lao", delivery: "crush", essence: "ember", movement: "lunge", emission: "burst", visual: "slash" }),
    crimson: profile({ id: "phong_hau", delivery: "cut", essence: "ember", movement: "lunge", emission: "burst", visual: "slash", scale: "M" }),
    steel: profile({
      id: "basic_strike",
      delivery: "cut",
      essence: "iron",
      movement: "lunge",
      emission: "trail",
      visual: "slash",
      scale: "M",
      durations: { windupMs: 100, castMs: 80, emissionMs: 620, impactMs: 220, recoveryMs: 160 },
    }),
    blue_water: profile({
      id: "thuy_chien", delivery: "arcane", essence: "frost", movement: "plant", emission: "burst", visual: "wave",
      durations: { windupMs: 140, castMs: 120, emissionMs: 1500, impactMs: 280, recoveryMs: 160 },
    }),
    chain: profile({ id: "lien_hoan", delivery: "pierce", essence: "iron", movement: "thrust", emission: "trail", visual: "chain" }),
    bagua: profile({
      id: "bagua_zhen", delivery: "ultimate", essence: "bagua", movement: "plant", emission: "ring", visual: "bagua", scale: "L",
      durations: { windupMs: 200, castMs: 160, emissionMs: 1500, impactMs: 320, recoveryMs: 220 },
    }),
    fire_rain: profile({
      id: "thien_hoa", delivery: "ultimate", essence: "ember", movement: "plant", emission: "rain", visual: "meteor", scale: "L",
      durations: { windupMs: 220, castMs: 220, emissionMs: 680, impactMs: 320, recoveryMs: 240 },
    }),
    gold_pierce: profile({
      id: "long_nu", delivery: "pierce", essence: "radiance", movement: "thrust", emission: "projectile", visual: "pierce", scale: "L",
      durations: { windupMs: 160, castMs: 120, emissionMs: 580, impactMs: 220, recoveryMs: 180 },
    }),
    wind: profile({
      id: "phong_van", delivery: "arcane", essence: "wind", movement: "plant", emission: "burst", visual: "wind", scale: "M",
      durations: { windupMs: 130, castMs: 100, emissionMs: 1500, impactMs: 260, recoveryMs: 150 },
    }),
    whirlwind: profile({
      id: "dong_xoay", delivery: "arcane", essence: "wind", movement: "plant", emission: "burst", visual: "wind", scale: "M",
      durations: { windupMs: 130, castMs: 100, emissionMs: 1500, impactMs: 260, recoveryMs: 150 },
    }),
    wolf: profile({
      id: "lang_tuyen", delivery: "cut", essence: "umbral", movement: "lunge", emission: "trail", visual: "slash", scale: "L",
      durations: { windupMs: 140, castMs: 120, emissionMs: 1500, impactMs: 280, recoveryMs: 180 },
    }),
    thunder: profile({
      id: "sam_set", delivery: "arcane", essence: "storm", movement: "plant", emission: "burst", visual: "thunder", scale: "L",
      // flight ~1.1s như Hỏa Long
      durations: { windupMs: 140, castMs: 120, emissionMs: 1500, impactMs: 280, recoveryMs: 160 },
    }),
    gold: profile({ id: "default_gold", delivery: "arcane", essence: "radiance", movement: "plant", emission: "burst", visual: "default" }),
  };

  function resolve(flash) {
    var key = typeof flash === "string" ? flash : resolveFxKey(flash);
    return BY_FLASH[key] || BY_FLASH.gold;
  }

  function totalMs(p) {
    var d = p.durations;
    return d.windupMs + d.castMs + d.emissionMs + d.impactMs + d.recoveryMs;
  }

  /**
   * Build a playable timeline: list of { phase, atMs, durationMs }
   */
  function buildTimeline(flashOrProfile) {
    var p = typeof flashOrProfile === "string" ? resolve(flashOrProfile) : flashOrProfile;
    var d = p.durations;
    var t = 0;
    var steps = [];
    var phases = [
      ["windup", d.windupMs],
      ["cast", d.castMs],
      ["emission", d.emissionMs],
      ["impact", d.impactMs],
      ["recovery", d.recoveryMs],
    ];
    for (var i = 0; i < phases.length; i++) {
      if (phases[i][1] <= 0) continue;
      steps.push({ phase: phases[i][0], atMs: t, durationMs: phases[i][1], profile: p });
      t += phases[i][1];
    }
    return { profile: p, steps: steps, totalMs: t };
  }

  /**
   * Play timeline — gọi onPhase(phase, profile, step) tại mỗi mốc
   */
  function playTimeline(flashOrProfile, onPhase, onDone) {
    var tl = buildTimeline(flashOrProfile);
    var timers = [];
    tl.steps.forEach(function (step) {
      timers.push(
        setTimeout(function () {
          if (onPhase) onPhase(step.phase, tl.profile, step);
        }, step.atMs)
      );
    });
    timers.push(
      setTimeout(function () {
        if (onDone) onDone(tl.profile);
      }, tl.totalMs)
    );
    return {
      cancel: function () {
        timers.forEach(clearTimeout);
      },
      timeline: tl,
    };
  }

  global.NLSkillDesign = {
    PHASE_ORDER: PHASE_ORDER,
    DELIVERY: DELIVERY,
    ESSENCE: ESSENCE,
    BY_FLASH: BY_FLASH,
    MOTIF_TO_FLASH: MOTIF_TO_FLASH,
    MOTIF_DEDICATED_FLASH: MOTIF_DEDICATED_FLASH,
    MOTIF_FALLBACK_FLASH: MOTIF_FALLBACK_FLASH,
    resolveFxKey: resolveFxKey,
    resolve: resolve,
    totalMs: totalMs,
    buildTimeline: buildTimeline,
    playTimeline: playTimeline,
    profile: profile,
  };
})(window);
