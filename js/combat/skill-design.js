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
    cut: { color: "#ff6b5a", glyph: "斬", scale: "S" },
    pierce: { color: "#ffe484", glyph: "貫", scale: "S" },
    crush: { color: "#c9a070", glyph: "碎", scale: "S" },
    arcane: { color: "#b57aff", glyph: "術", scale: "M" },
    buff: { color: "#86efac", glyph: "援", scale: "M" },
    ultimate: { color: "#fb923c", glyph: "絕", scale: "L" },
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
  };

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
        emissionMs: (cfg.durations && cfg.durations.emissionMs) || 360,
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
    white_blue: profile({ id: "long_dam", delivery: "pierce", essence: "frost", movement: "thrust", emission: "trail", visual: "pierce" }),
    cyan: profile({ id: "khong_thanh", delivery: "arcane", essence: "frost", movement: "plant", emission: "ring", visual: "sigil" }),
    orange: profile({ id: "ho_khi", delivery: "crush", essence: "ember", movement: "lunge", emission: "burst", visual: "slash" }),
    red_fire: profile({ id: "hoa_cong", delivery: "arcane", essence: "ember", movement: "plant", emission: "rain", visual: "fireball", scale: "M" }),
    purple: profile({ id: "an_muu", delivery: "arcane", essence: "umbral", movement: "plant", emission: "burst", visual: "sigil" }),
    yellow: profile({ id: "bach_bo", delivery: "pierce", essence: "radiance", movement: "plant", emission: "projectile", visual: "arrow" }),
    silver: profile({ id: "thiet_ky", delivery: "pierce", essence: "iron", movement: "lunge", emission: "trail", visual: "pierce" }),
    iron: profile({ id: "co_chien", delivery: "crush", essence: "iron", movement: "lunge", emission: "burst", visual: "shockwave" }),
    teal: profile({ id: "dong_ngo", delivery: "arcane", essence: "frost", movement: "plant", emission: "ring", visual: "sigil" }),
    green_poison: profile({ id: "doc_muu", delivery: "arcane", essence: "poison", movement: "plant", emission: "burst", visual: "poison" }),
    poison: profile({ id: "doc_muu", delivery: "arcane", essence: "poison", movement: "plant", emission: "burst", visual: "poison" }),
    snake: profile({
      id: "doc_xa", delivery: "arcane", essence: "poison", movement: "plant", emission: "trail", visual: "poison", scale: "M",
      durations: { windupMs: 160, castMs: 140, emissionMs: 360, impactMs: 220, recoveryMs: 180 },
    }),
    dragon: profile({
      id: "hoa_long", delivery: "ultimate", essence: "ember", movement: "plant", emission: "burst", visual: "meteor", scale: "L",
      durations: { windupMs: 200, castMs: 180, emissionMs: 480, impactMs: 280, recoveryMs: 220 },
    }),
    violet: profile({ id: "phung_so", delivery: "arcane", essence: "umbral", movement: "plant", emission: "trail", visual: "sigil" }),
    fire_green: profile({ id: "lua_luc", delivery: "arcane", essence: "poison", movement: "plant", emission: "rain", visual: "fireball" }),
    dark_red: profile({ id: "phan_cot", delivery: "cut", essence: "umbral", movement: "lunge", emission: "burst", visual: "slash" }),
    gold_soft: profile({ id: "nhan_duc", delivery: "buff", essence: "radiance", movement: "plant", emission: "ring", visual: "heal" }),
    yellow_cult: profile({ id: "hoang_thien", delivery: "arcane", essence: "radiance", movement: "plant", emission: "ring", visual: "sigil", scale: "L" }),
    red: profile({ id: "ho_lao", delivery: "crush", essence: "ember", movement: "lunge", emission: "burst", visual: "slash" }),
    crimson: profile({ id: "phong_hau", delivery: "cut", essence: "ember", movement: "lunge", emission: "burst", visual: "slash", scale: "M" }),
    steel: profile({ id: "tieu_dao", delivery: "pierce", essence: "iron", movement: "thrust", emission: "trail", visual: "pierce" }),
    blue_water: profile({ id: "thuy_chien", delivery: "arcane", essence: "frost", movement: "plant", emission: "burst", visual: "wave" }),
    chain: profile({ id: "lien_hoan", delivery: "pierce", essence: "iron", movement: "thrust", emission: "trail", visual: "chain" }),
    bagua: profile({
      id: "bagua_zhen", delivery: "ultimate", essence: "bagua", movement: "plant", emission: "ring", visual: "bagua", scale: "L",
      durations: { windupMs: 220, castMs: 280, emissionMs: 520, impactMs: 280, recoveryMs: 240 },
    }),
    fire_rain: profile({
      id: "thien_hoa", delivery: "ultimate", essence: "ember", movement: "plant", emission: "rain", visual: "meteor", scale: "L",
      durations: { windupMs: 200, castMs: 200, emissionMs: 600, impactMs: 280, recoveryMs: 220 },
    }),
    gold_pierce: profile({
      id: "long_nu", delivery: "pierce", essence: "radiance", movement: "thrust", emission: "projectile", visual: "pierce", scale: "L",
      durations: { windupMs: 160, castMs: 120, emissionMs: 280, impactMs: 220, recoveryMs: 180 },
    }),
    wind: profile({
      id: "phong_van", delivery: "arcane", essence: "wind", movement: "plant", emission: "burst", visual: "wind", scale: "M",
      durations: { windupMs: 140, castMs: 120, emissionMs: 420, impactMs: 200, recoveryMs: 180 },
    }),
    whirlwind: profile({
      id: "dong_xoay", delivery: "arcane", essence: "wind", movement: "plant", emission: "burst", visual: "wind", scale: "M",
      durations: { windupMs: 120, castMs: 100, emissionMs: 480, impactMs: 220, recoveryMs: 160 },
    }),
    wolf: profile({
      id: "lang_tuyen", delivery: "cut", essence: "umbral", movement: "lunge", emission: "trail", visual: "slash", scale: "L",
      durations: { windupMs: 160, castMs: 120, emissionMs: 360, impactMs: 240, recoveryMs: 200 },
    }),
    thunder: profile({
      id: "sam_set", delivery: "arcane", essence: "storm", movement: "plant", emission: "burst", visual: "thunder", scale: "L",
      durations: { windupMs: 140, castMs: 100, emissionMs: 200, impactMs: 280, recoveryMs: 160 },
    }),
    gold: profile({ id: "default_gold", delivery: "arcane", essence: "radiance", movement: "plant", emission: "burst", visual: "default" }),
  };

  function resolve(flash) {
    return BY_FLASH[flash] || BY_FLASH.gold;
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
    resolve: resolve,
    totalMs: totalMs,
    buildTimeline: buildTimeline,
    playTimeline: playTimeline,
    profile: profile,
  };
})(window);
