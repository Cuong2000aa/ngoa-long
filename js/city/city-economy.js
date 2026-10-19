/* global window, NLDatabase, NLPlayer */
/**
 * City Economy — sản xuất real-time / offline + nâng cấp có countdown.
 * API: NLCityEconomy (tránh đụng NLCity.CityRenderer).
 */
(function (global) {
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function buildingDef(id) {
    return NLPlayer.buildingDef(id);
  }

  function getLevel(player, buildingId) {
    return NLPlayer.getBuildingLevel(player, buildingId);
  }

  function effect(def) {
    return (def && def.effect) || {};
  }

  /** Giới hạn kho theo cấp Kho */
  function warehouseCaps(player) {
    var def = buildingDef("kho");
    var lv = Math.max(1, getLevel(player, "kho"));
    var e = effect(def);
    if (e.type !== "warehouse") {
      return { silver: 20000 + (lv - 1) * 8000, food: 20000 + (lv - 1) * 8000 };
    }
    return {
      silver: Math.floor(e.silverBase + (lv - 1) * e.silverPerLevel),
      food: Math.floor(e.foodBase + (lv - 1) * e.foodPerLevel),
    };
  }

  /** Sản lượng / phút */
  function productionPerMinute(player) {
    function rate(id) {
      var def = buildingDef(id);
      var lv = getLevel(player, id);
      if (!def || lv <= 0) return 0;
      var e = effect(def);
      if (e.type === "silver_per_min" || e.type === "food_per_min") {
        return Math.floor(e.base + (lv - 1) * e.perLevel);
      }
      return 0;
    }
    return { silver: rate("mo_bac"), food: rate("nong_trai") };
  }

  /** Giới hạn binh Doanh Trại */
  function troopsCap(player) {
    var def = buildingDef("doanh_trai");
    var lv = Math.max(1, getLevel(player, "doanh_trai"));
    var e = effect(def);
    if (e.type !== "troops") return 500 + (lv - 1) * 200;
    return Math.floor(e.maxBase + (lv - 1) * e.maxPerLevel);
  }

  function troopsRegenPerMin(player) {
    var def = buildingDef("doanh_trai");
    var lv = getLevel(player, "doanh_trai");
    var e = effect(def);
    if (e.type !== "troops" || lv <= 0) return 0;
    return (e.regenPerMinBase || 0) + (lv - 1) * (e.regenPerMinPerLevel || 0);
  }

  /** Chi phí bạc (ưu tiên) + food phụ; thời gian nâng */
  function upgradeQuote(buildingId, currentLevel) {
    var def = buildingDef(buildingId);
    if (!def) return null;
    var lv = currentLevel || 0;
    var next = lv + 1;
    if (def.maxLevel && next > def.maxLevel) {
      return { ok: false, reason: "Đã đạt cấp tối đa." };
    }
    var base = def.baseCost || {};
    var growth = def.costGrowth || 1.52;
    var costSilver = Math.floor((base.silver || 0) * Math.pow(growth, lv));
    var costFood = Math.floor((base.food || 0) * Math.pow(growth, lv));
    var timeSec = Math.floor(
      (def.upgradeBaseSec || 30) * Math.pow(def.upgradeGrowth || 1.35, lv)
    );
    return {
      ok: true,
      buildingId: def.id,
      from: lv,
      to: next,
      costSilver: costSilver,
      costFood: costFood,
      timeSec: timeSec,
    };
  }

  function canUpgrade(player, buildingId) {
    var id = NLPlayer.normalizeBuildingId(buildingId);
    var b = NLPlayer.getBuilding(player, id);
    if (!b) return { ok: false, reason: "Không tìm thấy công trình." };
    if (b.upgrade_ends_at) {
      return {
        ok: false,
        reason: "Đang nâng cấp.",
        remainingSec: Math.max(0, Math.ceil((b.upgrade_ends_at - Date.now()) / 1000)),
      };
    }
    var q = upgradeQuote(id, b.level);
    if (!q || !q.ok) return q || { ok: false, reason: "Không thể nâng cấp." };

    var tyVuLv = getLevel(player, "ty_vu");
    if (id !== "ty_vu" && q.to > tyVuLv) {
      return {
        ok: false,
        reason: "Cần nâng Ty Vũ trước (giới hạn cấp " + tyVuLv + ").",
        needTyVu: true,
      };
    }
    if (player.resources.silver < q.costSilver) {
      return { ok: false, reason: "Không đủ Bạc (cần " + q.costSilver + ").", costSilver: q.costSilver };
    }
    if (player.resources.food < q.costFood) {
      return { ok: false, reason: "Không đủ Lương thực (cần " + q.costFood + ").", costFood: q.costFood };
    }
    return Object.assign({ ok: true }, q);
  }

  function startUpgrade(player, buildingId) {
    var check = canUpgrade(player, buildingId);
    if (!check.ok) return check;
    var b = NLPlayer.ensureBuilding(player, check.buildingId);
    player.resources.silver -= check.costSilver;
    player.resources.food -= check.costFood;
    b.upgrade_ends_at = Date.now() + check.timeSec * 1000;
    NLPlayer.syncLegacyView(player);
    return {
      ok: true,
      building_id: b.building_id,
      level: b.level,
      upgrade_ends_at: b.upgrade_ends_at,
      costSilver: check.costSilver,
      costFood: check.costFood,
      timeSec: check.timeSec,
      msg: "Đã bắt đầu nâng cấp (" + formatCountdown(check.timeSec) + ").",
    };
  }

  function resolveUpgrades(player, now) {
    now = now || Date.now();
    var done = [];
    NLPlayer.buildingList(player).forEach(function (b) {
      if (b.upgrade_ends_at && b.upgrade_ends_at <= now) {
        b.level += 1;
        b.upgrade_ends_at = null;
        done.push({ building_id: b.building_id, level: b.level });
        if (player.log) {
          var def = buildingDef(b.building_id);
          player.log.unshift({
            msg: (def ? def.name : b.building_id) + " lên cấp " + b.level + ".",
            type: "ok",
            t: now,
          });
        }
      }
    });
    if (done.length) {
      player.troops_max = troopsCap(player);
      if ((player.troops_pool || 0) > player.troops_max) player.troops_pool = player.troops_max;
      player.level = Math.max(player.level || 1, getLevel(player, "ty_vu"));
    }
    return done;
  }

  function applyProduction(player, deltaMs) {
    var formulas = (NLDatabase && NLDatabase.formulas()) || {};
    var capHours = (formulas.economy && formulas.economy.offlineCapHours) || 48;
    var maxMs = capHours * 3600 * 1000;
    var ms = clamp(deltaMs, 0, maxMs);
    if (ms <= 0) return { silver: 0, food: 0, ms: 0 };

    var rates = productionPerMinute(player);
    var minutes = ms / 60000;
    var gainSilver = rates.silver * minutes;
    var gainFood = rates.food * minutes;

    var caps = warehouseCaps(player);
    var beforeS = player.resources.silver;
    var beforeF = player.resources.food;

    player.resources.silver = Math.min(caps.silver, beforeS + gainSilver);
    player.resources.food = Math.min(caps.food, beforeF + gainFood);

    var regen = troopsRegenPerMin(player) * minutes;
    player.troops_max = troopsCap(player);
    player.troops_pool = Math.min(player.troops_max, (player.troops_pool || 0) + regen);

    return {
      silver: player.resources.silver - beforeS,
      food: player.resources.food - beforeF,
      ms: ms,
      capped: player.resources.silver >= caps.silver || player.resources.food >= caps.food,
      rates: rates,
      caps: caps,
    };
  }

  function tick(player, now) {
    now = now || Date.now();
    resolveUpgrades(player, now);
    var last = player.last_tick_at || now;
    var result = applyProduction(player, now - last);
    player.last_tick_at = now;
    player.resources.silver = Math.floor(player.resources.silver);
    player.resources.food = Math.floor(player.resources.food);
    player.resources.gem = Math.floor(player.resources.gem);
    NLPlayer.syncLegacyView(player);
    return result;
  }

  function recruitTroops(player, amount) {
    amount = Math.floor(amount || 0);
    if (amount <= 0) return { ok: false, reason: "Số lượng không hợp lệ." };
    player.troops_max = troopsCap(player);
    var room = player.troops_max - (player.troops_pool || 0);
    if (room <= 0) return { ok: false, reason: "Doanh Trại đã đầy." };
    amount = Math.min(amount, room);
    var costSilver = amount * 2;
    var costFood = amount;
    if (player.resources.silver < costSilver || player.resources.food < costFood) {
      return { ok: false, reason: "Không đủ Bạc/Lương thực." };
    }
    player.resources.silver -= costSilver;
    player.resources.food -= costFood;
    player.troops_pool = (player.troops_pool || 0) + amount;
    NLPlayer.syncLegacyView(player);
    return { ok: true, amount: amount, costSilver: costSilver, costFood: costFood };
  }

  function assignTroopsToHero(player, heroId, amount) {
    var hero = null;
    (player.heroes || []).forEach(function (h) {
      if (h.hero_id === heroId) hero = h;
    });
    if (!hero) return { ok: false, reason: "Không tìm thấy tướng." };
    amount = Math.floor(amount || 0);
    if (amount <= 0 || (player.troops_pool || 0) < amount) {
      return { ok: false, reason: "Không đủ binh trong Doanh Trại." };
    }
    player.troops_pool -= amount;
    hero.troops = (hero.troops || 0) + amount;
    NLPlayer.syncLegacyView(player);
    return { ok: true, hero_id: heroId, troops: hero.troops };
  }

  function setDeployedSlot(player, slot, heroId) {
    slot = Math.floor(slot);
    if (slot < 1 || slot > 5) return { ok: false, reason: "Ô không hợp lệ (1–5)." };
    var form = player.deployed_formation || { formation_id: "crane_wing", slots: [] };
    form.slots = form.slots.filter(function (s) {
      return s.slot !== slot && (!heroId || s.hero_id !== heroId);
    });
    if (heroId) form.slots.push({ slot: slot, hero_id: heroId });
    player.deployed_formation = form;
    NLPlayer.syncLegacyView(player);
    return { ok: true, deployed_formation: form };
  }

  function setFormationId(player, formationId) {
    if (!player.deployed_formation) player.deployed_formation = { formation_id: formationId, slots: [] };
    player.deployed_formation.formation_id = formationId;
    return { ok: true };
  }

  function upgradeRemainingSec(player, buildingId) {
    var b = NLPlayer.getBuilding(player, buildingId);
    if (!b || !b.upgrade_ends_at) return 0;
    return Math.max(0, Math.ceil((b.upgrade_ends_at - Date.now()) / 1000));
  }

  function formatCountdown(sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    if (h > 0) return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    return m + ":" + String(s).padStart(2, "0");
  }

  function citySnapshot(player) {
    tick(player);
    var rates = productionPerMinute(player);
    var caps = warehouseCaps(player);
    var buildings = NLPlayer.buildingList(player).map(function (b) {
      var def = buildingDef(b.building_id);
      var rem = upgradeRemainingSec(player, b.building_id);
      var quote = upgradeQuote(b.building_id, b.level);
      return {
        building_id: b.building_id,
        name: def ? def.name : b.building_id,
        level: b.level,
        upgrading: !!b.upgrade_ends_at,
        remaining_sec: rem,
        countdown: rem > 0 ? formatCountdown(rem) : null,
        next_cost_silver: quote && quote.ok ? quote.costSilver : null,
        next_cost_food: quote && quote.ok ? quote.costFood : null,
        next_time_sec: quote && quote.ok ? quote.timeSec : null,
      };
    });
    return {
      resources: {
        silver: player.resources.silver,
        food: player.resources.food,
        gem: player.resources.gem,
        silver_cap: caps.silver,
        food_cap: caps.food,
      },
      production_per_min: rates,
      troops_pool: Math.floor(player.troops_pool || 0),
      troops_max: troopsCap(player),
      ty_vu_level: getLevel(player, "ty_vu"),
      buildings: buildings,
      deployed_formation: player.deployed_formation,
    };
  }

  global.NLCityEconomy = {
    warehouseCaps: warehouseCaps,
    productionPerMinute: productionPerMinute,
    troopsCap: troopsCap,
    troopsRegenPerMin: troopsRegenPerMin,
    upgradeQuote: upgradeQuote,
    canUpgrade: canUpgrade,
    startUpgrade: startUpgrade,
    resolveUpgrades: resolveUpgrades,
    applyProduction: applyProduction,
    tick: tick,
    recruitTroops: recruitTroops,
    assignTroopsToHero: assignTroopsToHero,
    setDeployedSlot: setDeployedSlot,
    setFormationId: setFormationId,
    upgradeRemainingSec: upgradeRemainingSec,
    formatCountdown: formatCountdown,
    citySnapshot: citySnapshot,
  };
})(window);
