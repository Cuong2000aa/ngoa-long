/* global window, NLData, NLBattle, NLPlayer, NLCityEconomy, NLDatabase, NLCombat */
/**
 * NLGame — vòng lặp game + cầu nối Player v3 / City Economy.
 */
(function (global) {
  var D = NLData;
  var B = NLBattle;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pick(arr, n) {
    return shuffle(arr).slice(0, n);
  }

  function pushLog(state, msg, type) {
    state.log = state.log || [];
    state.log.unshift({ msg: msg, type: type || "", t: Date.now() });
    if (state.log.length > 40) state.log.length = 40;
  }

  function syncResDown(state) {
    if (!state.resources) state.resources = { silver: 0, food: 0, gem: 0 };
    state.resources.silver = state.silver;
    state.resources.food = state.food;
    state.resources.gem = state.gold;
  }

  function syncResUp(state) {
    if (!state.resources) return;
    state.silver = Math.floor(state.resources.silver);
    state.food = Math.floor(state.resources.food);
    state.gold = Math.floor(state.resources.gem);
  }

  function ensureWorld(state, playerName) {
    if (state.world && state.world.length) return;
    var names = shuffle(D.AI_NAMES);
    state.world = D.TERRITORIES.map(function (t, i) {
      return {
        id: t.id,
        name: t.name,
        power: t.power,
        owner: i === 0 ? "player" : "ai",
        lord: i === 0 ? playerName : names[i % names.length],
      };
    });
  }

  function productionPerHour(state) {
    if (typeof NLCityEconomy !== "undefined") {
      var rates = NLCityEconomy.productionPerMinute(state);
      return { food: rates.food * 60, silver: rates.silver * 60, gold: 0 };
    }
    var f = D.FACTIONS[state.faction] || { bonus: { food: 1, silver: 1 } };
    var farm = (state.buildings && state.buildings.farm) || 0;
    var mine = (state.buildings && state.buildings.mine) || 0;
    return {
      food: Math.floor((20 + farm * 18) * f.bonus.food),
      silver: Math.floor((15 + mine * 14) * f.bonus.silver),
      gold: 0,
    };
  }

  /** Tick tài nguyên + hoàn tất nâng cấp (delta thời gian thực) */
  function applyElapsed(state, now) {
    now = now || Date.now();
    if (typeof NLArena !== "undefined") {
      NLArena.tickBots(state, now);
    }
    if (typeof NLCityEconomy !== "undefined" && state.resources) {
      NLCityEconomy.tick(state, now);
      syncResUp(state);
      // tiến giờ ảo nhẹ theo delta (hiển thị Ngày)
      var hours = Math.min(48, (now - (state._clockAt || state.last_tick_at || now)) / 3600000);
      if (hours > 0.01) {
        state.hour = (state.hour || 0) + hours;
        state.day = Math.floor(state.hour / 24) + 1;
        state._clockAt = now;
        if (!state._arenaDay) state._arenaDay = state.day;
        if (state.day !== state._arenaDay) {
          state.arenaLeft = D.MAX_ARENA_DAY;
          state._arenaDay = state.day;
        }
      }
      return state;
    }
    // fallback legacy
    var last = state.lastTick || now;
    var h = Math.min(48, (now - last) / 3600000);
    if (h < 0.001) {
      state.lastTick = now;
      return state;
    }
    var prod = productionPerHour(state);
    state.food += prod.food * h;
    state.silver += prod.silver * h;
    state.hour += h;
    state.day = Math.floor(state.hour / 24) + 1;
    if (!state._arenaDay) state._arenaDay = state.day;
    if (state.day !== state._arenaDay) {
      state.arenaLeft = D.MAX_ARENA_DAY;
      state._arenaDay = state.day;
    }
    state.lastTick = now;
    return state;
  }

  function createNewGame(playerName, factionId) {
    var faction = D.FACTIONS[factionId] ? factionId : "shu";
    var state;
    if (typeof NLPlayer !== "undefined") {
      state = NLPlayer.createPlayer(playerName, faction);
    } else {
      var starters;
      if (typeof NLDatabase !== "undefined") {
        starters = NLDatabase.startersForFaction(faction).map(function (u) {
          return {
            id: u.id + "_" + Math.random().toString(36).slice(2, 6),
            key: u.id,
            generalId: u.id,
            name: u.name,
            troop: u.troop,
            quality: u.quality,
            skillId: u.skillId,
            tongLinh: u.tongLinh,
            vuLuc: u.vuLuc,
            triLuc: u.triLuc,
            atk: u.vuLuc,
            def: u.tongLinh,
            hp: u.hp,
            maxHp: u.maxHp,
            level: 1,
            enhance: 0,
            troops: 100,
          };
        });
      } else {
        starters = D.STARTERS[faction].map(function (k) {
          return D.createGeneralFromKey(k);
        });
      }
      var now = Date.now();
      state = {
        version: 2,
        playerName: (playerName || "Thành Chủ").slice(0, 16),
        faction: faction,
        food: 4000,
        silver: 5000,
        gold: 50,
        prestige: 0,
        souls: 0,
        hour: 0,
        day: 1,
        lastTick: now,
        buildings: { hall: 1, farm: 1, mine: 1, barracks: 1, wall: 1, academy: 0 },
        generals: starters,
        towerFloor: 1,
        arenaLeft: D.MAX_ARENA_DAY,
        _arenaDay: 1,
        campaign: { cleared: {} },
        inventory: [],
        log: [{ msg: "Khai quốc thành công. Thiên hạ đang chờ Ngài.", type: "", t: now }],
      };
    }
    ensureWorld(state, state.playerName || playerName);
    state.towerFloor = state.towerFloor || 1;
    state._arenaDay = state.day || 1;
    state._clockAt = Date.now();
    return state;
  }

  function saveGame(state) {
    applyElapsed(state);
    if (typeof NLPlayer !== "undefined" && state.version >= 3) {
      syncResDown(state);
      NLPlayer.save(state);
      return;
    }
    localStorage.setItem(D.SAVE_KEY, JSON.stringify(state));
  }

  function loadGame() {
    try {
      if (typeof NLPlayer !== "undefined" && NLPlayer.hasSave()) {
        var p = NLPlayer.load();
        if (p) {
          ensureWorld(p, p.playerName);
          applyElapsed(p);
          return p;
        }
      }
      var raw = localStorage.getItem(D.SAVE_KEY);
      if (!raw) return null;
      var state = JSON.parse(raw);
      if (typeof NLPlayer !== "undefined") {
        state = NLPlayer.migrate(state);
        ensureWorld(state, state.playerName);
      }
      applyElapsed(state);
      return state;
    } catch (e) {
      return null;
    }
  }

  function hasSave() {
    if (typeof NLPlayer !== "undefined" && NLPlayer.hasSave()) return true;
    return !!localStorage.getItem(D.SAVE_KEY);
  }

  function canAfford(state, cost) {
    return state.food >= (cost.food || 0) &&
      state.silver >= (cost.silver || 0) &&
      state.gold >= (cost.gold || 0);
  }

  function pay(state, cost) {
    state.food -= cost.food || 0;
    state.silver -= cost.silver || 0;
    state.gold -= cost.gold || 0;
    syncResDown(state);
  }

  /**
   * Nâng cấp công trình — dùng countdown timer (NLCityEconomy).
   * buildingId có thể là alias legacy (hall/farm/…) hoặc id chuẩn (ty_vu/…).
   */
  function upgradeBuilding(state, buildingId) {
    applyElapsed(state);
    if (typeof NLCityEconomy !== "undefined" && state.resources) {
      var r = NLCityEconomy.startUpgrade(state, buildingId);
      syncResUp(state);
      if (r.ok) {
        var def = NLPlayer.buildingDef(r.building_id);
        pushLog(
          state,
          "Bắt đầu nâng " + (def ? def.name : r.building_id) +
            " (còn " + NLCityEconomy.formatCountdown(r.timeSec) + ").",
          "good"
        );
        return { ok: true, msg: r.msg, upgrading: true, remainingSec: r.timeSec };
      }
      return { ok: false, msg: r.reason || "Không thể nâng cấp." };
    }
    // fallback tức thì
    var b = D.BUILDINGS.find(function (x) { return x.id === buildingId; });
    if (!b) return { ok: false, msg: "Không có công trình." };
    var lv = state.buildings[buildingId] || 0;
    var hall = state.buildings.hall || 1;
    if (buildingId !== "hall" && lv >= hall) {
      return { ok: false, msg: "Cần nâng Ty Vũ. Giới hạn cấp: " + hall + "." };
    }
    var cost = D.buildingCost(b, lv);
    if (!canAfford(state, cost)) return { ok: false, msg: "Không đủ tài nguyên." };
    pay(state, cost);
    state.buildings[buildingId] = lv + 1;
    pushLog(state, "Nâng " + b.name + " lên cấp " + (lv + 1) + ".", "good");
    return { ok: true };
  }

  function enhanceGeneral(state, genId) {
    applyElapsed(state);
    var g = state.generals.find(function (x) { return x.id === genId; });
    if (!g) return { ok: false, msg: "Không tìm thấy tướng." };
    if (g.enhance >= 10) return { ok: false, msg: "Cường hóa tối đa +10." };
    // equip_enhance_plus: cường hóa từ +6 trở lên cần unlock (boss ch2)
    if (
      g.enhance >= 5 &&
      typeof NLCampaign !== "undefined" &&
      !NLCampaign.hasFeature(state, "equip_enhance_plus")
    ) {
      return {
        ok: false,
        msg: "Cường hóa +6 trở lên cần «Cường hóa trang bị+» (hạ Boss Chương 2).",
      };
    }
    var academy = (state.buildings && state.buildings.academy) || 0;
    var discount = Math.min(0.4, academy * 0.04);
    var base = 80 + g.enhance * 55 + g.level * 20;
    var cost = {
      silver: Math.floor(base * (1 - discount)),
      food: Math.floor(base * 0.4 * (1 - discount)),
    };
    if (!canAfford(state, cost)) return { ok: false, msg: "Không đủ tài nguyên." };
    pay(state, cost);
    g.enhance += 1;
    if (state.heroes) {
      state.heroes.forEach(function (h) {
        if (h.hero_id === g.id) h.enhance = g.enhance;
      });
    }
    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(state);
    pushLog(state, "Cường hóa " + g.name + " → +" + g.enhance + ".", "good");
    return { ok: true };
  }

  function trainGeneral(state, genId) {
    applyElapsed(state);
    var g = state.generals.find(function (x) { return x.id === genId; });
    if (!g) return { ok: false, msg: "Không tìm thấy tướng." };
    var maxLv = typeof NLPlayer !== "undefined"
      ? Math.max(20, NLPlayer.getBuildingLevel(state, "ty_vu") * 2 + 10)
      : 20;
    if (g.level >= maxLv) return { ok: false, msg: "Đã đạt cấp tối đa (" + maxLv + ")." };
    var cost = { food: 40 + g.level * 25, silver: 50 + g.level * 30 };
    if (!canAfford(state, cost)) return { ok: false, msg: "Không đủ tài nguyên." };
    pay(state, cost);
    var nextLv = g.level + 1;
    var scaled =
      typeof NLDatabase !== "undefined"
        ? NLDatabase.scaleGeneral(g.key || g.generalId, nextLv, {
            quality: g.quality,
          })
        : null;
    if (state.heroes) {
      state.heroes.forEach(function (h) {
        if (h.hero_id === g.id) {
          h.level = nextLv;
          if (scaled) {
            h.tongLinh = scaled.tongLinh;
            h.vuLuc = scaled.vuLuc;
            h.triLuc = scaled.triLuc;
            h.maxHp = scaled.maxHp;
            h.hp = scaled.maxHp;
            h.skillId = scaled.skillId;
            h.quality = scaled.quality || h.quality;
          } else {
            h.tongLinh = Math.round((h.tongLinh || g.def) * 1.04);
            h.vuLuc = Math.round((h.vuLuc || g.atk) * 1.04);
            h.triLuc = Math.round((h.triLuc || 50) * 1.04);
            h.maxHp = Math.round((h.maxHp || g.maxHp) * 1.045);
            h.hp = h.maxHp;
          }
        }
      });
    }
    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(state);
    pushLog(state, g.name + " lên cấp " + nextLv + ".", "good");
    return { ok: true };
  }

  /** Đổi loại binh active (chỉ trong danh sách wiki của tướng). */
  function setHeroActiveTroop(state, heroId, troopId) {
    var h = (state.heroes || []).find(function (x) {
      return x.hero_id === heroId;
    });
    if (!h) return { ok: false, msg: "Không tìm thấy tướng." };
    var want =
      typeof NLDatabase !== "undefined" && NLDatabase.normalizeTroopId
        ? NLDatabase.normalizeTroopId(troopId)
        : troopId;
    if (!want) return { ok: false, msg: "Loại binh không hợp lệ." };
    var opts =
      typeof NLDatabase !== "undefined" && NLDatabase.getGeneralTroopOptions
        ? NLDatabase.getGeneralTroopOptions(h.general_id || h)
        : [h.troop, h.troop2].filter(Boolean);
    if (opts.indexOf(want) < 0) {
      return { ok: false, msg: "Tướng này không có thẻ binh «" + want + "» (wiki)." };
    }
    h.activeTroop = want;
    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(state);
    return { ok: true, activeTroop: h.activeTroop };
  }

  /** Đổi binh chủng chính/phụ (troop ↔ troop2), lưu trên hero. */
  function switchHeroActiveTroop(state, heroId) {
    var h = (state.heroes || []).find(function (x) {
      return x.hero_id === heroId;
    });
    if (!h) return { ok: false, msg: "Không tìm thấy tướng." };
    var opts =
      typeof NLDatabase !== "undefined" && NLDatabase.getGeneralTroopOptions
        ? NLDatabase.getGeneralTroopOptions(h.general_id || h)
        : [h.troop, h.troop2].filter(Boolean);
    if (opts.length < 2) return { ok: false, msg: "Tướng này chỉ có 1 loại binh (wiki)." };
    var cur = h.activeTroop || h.troop;
    var idx = opts.indexOf(cur);
    var next = opts[(idx < 0 ? 0 : idx + 1) % opts.length];
    return setHeroActiveTroop(state, heroId, next);
  }

  /**
   * Giác ngộ phẩm (wiki): white→…→gold theo awakenByQuality + inventory nguyên liệu.
   */
  function awakenGeneral(state, genId) {
    applyElapsed(state);
    if (typeof NLDatabase === "undefined") return { ok: false, msg: "Database chưa sẵn sàng." };
    var g = state.generals.find(function (x) {
      return x.id === genId;
    });
    if (!g) return { ok: false, msg: "Không tìm thấy tướng." };
    var tpl = NLDatabase.getGeneral(g.key || g.generalId);
    if (!tpl) return { ok: false, msg: "Không có mẫu tướng wiki." };
    var info = NLDatabase.awakenInfo(tpl, g.quality);
    if (!info) return { ok: false, msg: "Đã max phẩm hoặc chưa có dữ liệu giác ngộ." };

    var costs = info.cost || [];
    // Kiểm tra kho (inventory: {itemId, qty} hoặc {id, count})
    function invQty(itemId) {
      var n = 0;
      (state.inventory || []).forEach(function (it) {
        var id = it.itemId || it.id;
        if (id === itemId) n += it.qty != null ? it.qty : it.count != null ? it.count : 1;
      });
      return n;
    }
    var missing = [];
    costs.forEach(function (c) {
      var need = c.qty || 0;
      var have = invQty(c.itemId);
      if (have < need) missing.push((c.name || c.itemId) + " " + have + "/" + need);
    });
    if (missing.length) {
      return { ok: false, msg: "Thiếu nguyên liệu: " + missing.join(", ") };
    }
    // Trừ kho
    costs.forEach(function (c) {
      var left = c.qty || 0;
      (state.inventory || []).forEach(function (it) {
        if (left <= 0) return;
        var id = it.itemId || it.id;
        if (id !== c.itemId) return;
        var have = it.qty != null ? it.qty : it.count != null ? it.count : 1;
        var use = Math.min(have, left);
        if (it.qty != null) it.qty -= use;
        else if (it.count != null) it.count -= use;
        left -= use;
      });
    });
    state.inventory = (state.inventory || []).filter(function (it) {
      var q = it.qty != null ? it.qty : it.count != null ? it.count : 1;
      return q > 0;
    });

    var scaled = NLDatabase.scaleGeneral(tpl.id, g.level || 1, { quality: info.to });
    if (state.heroes) {
      state.heroes.forEach(function (h) {
        if (h.hero_id !== g.id) return;
        h.quality = info.to;
        if (scaled) {
          h.tongLinh = scaled.tongLinh;
          h.vuLuc = scaled.vuLuc;
          h.triLuc = scaled.triLuc;
          h.maxHp = scaled.maxHp;
          h.hp = scaled.maxHp;
          h.skillId = scaled.skillId;
        }
      });
    }
    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(state);
    var qTo = NLDatabase.getQuality(info.to);
    pushLog(
      state,
      g.name + " giác ngộ → " + (qTo ? qTo.name : info.to) + (info.access ? " (" + info.access + ")" : "") + ".",
      "good"
    );
    return { ok: true, quality: info.to };
  }

  function recruitSoulGeneral(state) {
    applyElapsed(state);
    if (state.souls < 3) return { ok: false, msg: "Cần 3 hồn tướng." };
    var owned = {};
    state.generals.forEach(function (g) { owned[g.key] = true; });
    var candidates = D.GENERAL_POOL.filter(function (g) { return !owned[g.key]; });
    var pool = candidates.length ? candidates : D.GENERAL_POOL;
    var pickOne = pool[Math.floor(Math.random() * pool.length)];
    state.souls -= 3;
    var g = D.createGeneralFromKey(pickOne.key, { soul: true, level: 2 });
    g.soul = true;
    g.troops = g.troops || 100;
    state.generals.push(g);
    if (state.heroes) {
      state.heroes.push({
        hero_id: g.id,
        general_id: g.key,
        name: g.name,
        troop: g.troop,
        quality: g.quality || "white",
        skillId: g.skillId || "basic_strike",
        tongLinh: g.def,
        vuLuc: g.atk,
        triLuc: Math.round(g.atk * 0.6),
        hp: g.hp,
        maxHp: g.maxHp,
        level: g.level,
        enhance: 0,
        troops: 100,
      });
    }
    pushLog(state, "Chiêu mộ hồn tướng: " + g.name + "!", "gold");
    return { ok: true, general: g };
  }

  function recruitTavernHero(state, idOrHero) {
    applyElapsed(state);
    if (typeof NLRecruit === "undefined") {
      return { ok: false, msg: "NLRecruit chưa load." };
    }
    var r = NLRecruit.recruitHero(state, idOrHero);
    syncResUp(state);
    if (r.ok) {
      return { ok: true, msg: "Chiêu mộ " + r.hero.name + "!", hero: r.hero, general: r.hero };
    }
    return { ok: false, msg: r.reason || "Không thể chiêu mộ." };
  }

  function deployHeroSlot(state, heroId, slot) {
    if (typeof NLRecruit === "undefined") return { ok: false, msg: "NLRecruit chưa load." };
    var r = NLRecruit.deployHero(state, heroId, slot);
    return { ok: r.ok, msg: r.ok ? "Đã cập nhật trận hình" : r.reason };
  }

  function dismissHero(state, heroId) {
    if (typeof NLRecruit === "undefined") return { ok: false, msg: "NLRecruit chưa load." };
    var r = NLRecruit.dismissHero(state, heroId);
    return { ok: r.ok, msg: r.ok ? "Đã sa thải " + r.dismissed : r.reason };
  }

  function playerBattleBonus(state) {
    var barracks = state.buildings.barracks || 0;
    return { dmg: 1 + barracks * 0.04, def: 1 };
  }

  function buildEnemyTeam(power, count) {
    count = count || 3;
    var keys = pick(D.GENERAL_POOL.map(function (g) { return g.key; }), count);
    return keys.map(function (k) {
      return D.scaleGeneral(D.createGeneralFromKey(k), power);
    });
  }

  function fightWithTeam(state, teamSlots, enemyTeam, opts) {
    applyElapsed(state);
    opts = opts || {};
    var team = (teamSlots || []).map(function (s) {
      var g = s.general || state.generals.find(function (x) { return x.id === s.id; });
      if (!g) return null;
      var unit = Object.assign({}, g);
      unit.slot = s.slot != null ? s.slot : 0;
      if (unit.vuLuc == null && unit.atk != null) unit.vuLuc = unit.atk;
      if (unit.tongLinh == null && unit.def != null) unit.tongLinh = unit.def;
      if (unit.triLuc == null) unit.triLuc = Math.round((unit.vuLuc || 50) * 0.65);
      if (!unit.skillId && typeof NLDatabase !== "undefined") {
        var tpl = NLDatabase.getGeneral(unit.key || unit.generalId || unit.id);
        if (tpl) {
          unit.skillId = tpl.skillId;
          unit.troop = unit.troop || tpl.troop;
          unit.troop2 = unit.troop2 || tpl.troop2 || null;
          unit.quality = unit.quality || tpl.quality;
        }
      }
      if (!unit.skillId) unit.skillId = "basic_strike";
      // Dual troop: activeTroop từ bày trận (mặc định troop chính)
      unit.troopPrimary = unit.troopPrimary || unit.troop;
      if (s.activeTroop) unit.activeTroop = s.activeTroop;
      unit.troop = unit.activeTroop || unit.troop;
      // Trang bị wiki — cộng chỉ số trước khi vào combat engine
      if (typeof NLDatabase !== "undefined" && NLDatabase.applyEquipBonuses) {
        var eqMap = NLDatabase.resolveEquipMap(unit);
        if (eqMap.horse) unit.horseId = eqMap.horse;
        NLDatabase.applyEquipBonuses(unit, eqMap);
        if (unit.hp != null) unit.maxHp = unit.hp;
      } else if (unit.horseId && typeof NLDatabase !== "undefined") {
        var horse = NLDatabase.getItem(unit.horseId);
        if (horse && horse.bonuses) {
          Object.keys(horse.bonuses).forEach(function (k) {
            if (typeof unit[k] === "number") unit[k] = Math.round(unit[k] + horse.bonuses[k]);
          });
        }
      }
      return unit;
    }).filter(Boolean);

    if (!team.length) return { ok: false, msg: "Chưa chọn tướng." };

    // lưu formation đã deploy (ghi đè sạch danh sách slots hiện tại)
    if (state.deployed_formation) {
      state.deployed_formation.slots = team.slice(0, 5).map(function (u, i) {
        var slot1 = (u.slot != null ? u.slot : i) + 1;
        return { slot: slot1, hero_id: u.id };
      });
      if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(state);
    }

    if (typeof NLCombat !== "undefined") {
      var enemies = (enemyTeam || []).map(function (e, i) {
        var u = Object.assign({}, e);
        if (u.slot == null) u.slot = i;
        if (u.vuLuc == null && u.atk != null) u.vuLuc = u.atk;
        if (u.tongLinh == null && u.def != null) u.tongLinh = u.def;
        if (u.triLuc == null) u.triLuc = Math.round((u.vuLuc || 50) * 0.6);
        if (!u.skillId) u.skillId = "basic_strike";
        return u;
      });
      var formId =
        (state.deployed_formation && state.deployed_formation.formation_id) ||
        state.formationId ||
        opts.playerFormation ||
        "crane_wing";
      var result = NLCombat.runBattle(team, enemies, {
        title: opts.title || "Chiến đấu",
        playerFormation: formId,
        enemyFormation: opts.enemyFormation || opts.enemyFormationId || "square",
      });
      return { ok: true, win: result.win, result: result, battleLog: result.battleLog, team: team };
    }

    var legacy = B.resolveBattle(team, enemyTeam, { playerBonus: playerBattleBonus(state) });
    return { ok: true, win: legacy.win, log: legacy.log, team: team };
  }

  /**
   * Kết toán ải PVE qua NLCampaign (trừ lương + thưởng + unlock).
   * Giữ tên applyStageRewards để tương thích app.js cũ.
   */
  function applyStageRewards(state, stage, win, chapter) {
    if (typeof NLCampaign !== "undefined" && stage) {
      var ch = chapter;
      if (!ch && typeof NLDatabase !== "undefined") {
        var chapters = NLDatabase.campaign().chapters || [];
        for (var i = 0; i < chapters.length; i++) {
          if (chapters[i].stages.some(function (s) { return s.id === stage.id; })) {
            ch = chapters[i];
            break;
          }
        }
      }
      if (ch) {
        var settled = NLCampaign.settleResult(state, ch, stage, win !== false, {});
        syncResUp(state);
        return settled;
      }
    }
    // fallback legacy (chỉ thắng)
    if (!stage || !stage.rewards) return null;
    var r = stage.rewards;
    state.silver += r.silver || 0;
    state.food += r.food || 0;
    if (r.gold) state.gold += r.gold;
    syncResDown(state);
    state.prestige += Math.floor((r.exp || 0) / 5);
    state.campaign = state.campaign || { cleared: {} };
    var first = !state.campaign.cleared[stage.id];
    state.campaign.cleared[stage.id] = true;
    pushLog(state, "Thưởng ải: +" + (r.silver || 0) + " bạc", "gold");
    return { drop: null, first: first, win: true };
  }

  function prepareStageChallenge(state, chapterId, stageId) {
    if (typeof NLCampaign === "undefined") {
      var stage = NLDatabase.getStage(chapterId, stageId);
      if (!stage) return { ok: false, reason: "Không tìm thấy ải." };
      return {
        ok: true,
        stage: stage,
        chapter: NLDatabase.getChapter(chapterId),
        enemies: NLCombat.enemiesFromStage(stage),
        staminaCost: 0,
        enemyFormationId: "square",
        title: stage.name,
      };
    }
    return NLCampaign.prepareChallenge(state, chapterId, stageId);
  }

  function onTerritoryWin(state, territoryId) {
    var t = state.world.find(function (x) { return x.id === territoryId; });
    if (!t) return;
    t.owner = "player";
    t.lord = state.playerName;
    var food = Math.floor(80 * t.power);
    var silver = Math.floor(100 * t.power);
    state.food += food;
    state.silver += silver;
    syncResDown(state);
    state.prestige += Math.floor(15 * t.power);
    pushLog(state, "Thôn tính " + t.name + "! +" + food + " lương, +" + silver + " bạc.", "good");
  }

  function onTowerWin(state) {
    var floor = state.towerFloor;
    state.souls += 1;
    state.food += 30 + floor * 5;
    state.silver += 40 + floor * 6;
    if (floor % 5 === 0) state.gold += 3;
    syncResDown(state);
    if (state.towerFloor < D.MAX_TOWER) state.towerFloor += 1;
    pushLog(state, "Phá tầng " + floor + " tháp thí luyện. +1 hồn tướng.", "gold");
  }

  function onArenaWin(state, botId) {
    if (typeof NLArena !== "undefined") {
      var s = NLArena.settleChallenge(state, botId, true, {});
      syncResUp(state);
      return s;
    }
    state.arenaLeft = Math.max(0, state.arenaLeft - 1);
    state.gold += 5 + Math.floor(Math.random() * 4);
    state.silver += 120;
    syncResDown(state);
    state.prestige += 10;
    pushLog(state, "Quán quân lôi đài! Nhận vàng & bạc.", "gold");
    return { win: true };
  }

  function onArenaLose(state, botId) {
    if (typeof NLArena !== "undefined") {
      var s = NLArena.settleChallenge(state, botId, false, {});
      syncResUp(state);
      return s;
    }
    state.arenaLeft = Math.max(0, state.arenaLeft - 1);
    state.silver += 30;
    syncResDown(state);
    pushLog(state, "Thua lôi đài. Nhận ít bạc an ủi.", "bad");
    return { win: false };
  }

  function tickHour(state) {
    applyElapsed(state);
    // giả lập +1 giờ sản xuất (cheat/debug nút +)
    if (typeof NLArena !== "undefined" && state.arena) {
      state.arena.last_evolution_timestamp =
        (state.arena.last_evolution_timestamp || Math.floor(Date.now() / 1000)) - 3600;
      NLArena.tickBots(state, Date.now());
    }
    if (typeof NLCityEconomy !== "undefined" && state.resources) {
      var gain = NLCityEconomy.applyProduction(state, 3600000);
      state.last_tick_at = Date.now();
      syncResUp(state);
      state.hour = (state.hour || 0) + 1;
      state.day = Math.floor(state.hour / 24) + 1;
      pushLog(
        state,
        "+1 giờ · +" + Math.floor(gain.food) + " lương · +" + Math.floor(gain.silver) + " bạc"
      );
      return;
    }
    var prod = productionPerHour(state);
    state.food += prod.food;
    state.silver += prod.silver;
    state.hour += 1;
    state.day = Math.floor(state.hour / 24) + 1;
    if (state.day !== state._arenaDay) {
      state.arenaLeft = D.MAX_ARENA_DAY;
      state._arenaDay = state.day;
    }
    state.lastTick = Date.now();
    pushLog(state, "+1 giờ · +" + prod.food + " lương · +" + prod.silver + " bạc");
  }

  function effectText(def, lv) {
    if (!def || !def.effect) return "";
    var e = def.effect;
    var L = Math.max(1, lv || 1);
    if (e.type === "hall_cap") return "Trần cấp nhà khác = Lv." + L;
    if (e.type === "silver_per_min") return "+" + (e.base + (L - 1) * e.perLevel) + " bạc/phút";
    if (e.type === "food_per_min") return "+" + (e.base + (L - 1) * e.perLevel) + " lương/phút";
    if (e.type === "troops") {
      return "Binh max " + (e.maxBase + (L - 1) * e.maxPerLevel) +
        " · hồi +" + (e.regenPerMinBase + (L - 1) * e.regenPerMinPerLevel) + "/phút";
    }
    if (e.type === "warehouse") {
      return "Kho " + (e.silverBase + (L - 1) * e.silverPerLevel) + " bạc / " +
        (e.foodBase + (L - 1) * e.foodPerLevel) + " lương";
    }
    if (e.perLevel != null) return "+" + (e.perLevel * L) + "% hiệu ứng";
    return def.desc || "";
  }

  function getBuildingList(state) {
    applyElapsed(state);
    if (typeof NLDatabase !== "undefined" && typeof NLCityEconomy !== "undefined") {
      var core = NLDatabase.raw().buildings.coreIds || [];
      var list = NLDatabase.raw().buildings.list.filter(function (b) {
        return core.indexOf(b.id) >= 0 || ["san_tap"].indexOf(b.id) >= 0;
      });
      // map hiển thị: thêm alias legacy id để city-render click khớp
      var display = [];
      list.forEach(function (def) {
        var b = NLPlayer.getBuilding(state, def.id);
        var lv = b ? b.level : 0;
        var quote = NLCityEconomy.upgradeQuote(def.id, lv);
        var rem = NLCityEconomy.upgradeRemainingSec(state, def.id);
        var legacyId = null;
        if (def.id === "ty_vu") legacyId = "hall";
        else if (def.id === "nong_trai") legacyId = "farm";
        else if (def.id === "mo_bac") legacyId = "mine";
        else if (def.id === "doanh_trai") legacyId = "barracks";
        else if (def.id === "kho") legacyId = "wall";
        else if (def.id === "san_tap") legacyId = "academy";

        display.push({
          id: legacyId || def.id,
          building_id: def.id,
          name: def.name,
          desc: def.desc,
          level: lv,
          cost: {
            silver: quote && quote.ok ? quote.costSilver : 0,
            food: quote && quote.ok ? quote.costFood : 0,
          },
          timeSec: quote && quote.ok ? quote.timeSec : 0,
          upgrading: rem > 0,
          remainingSec: rem,
          countdown: rem > 0 ? NLCityEconomy.formatCountdown(rem) : null,
          effectText: effectText(def, lv),
        });
      });
      return display;
    }
    return D.BUILDINGS.map(function (b) {
      var lv = state.buildings[b.id] || 0;
      return {
        id: b.id,
        name: b.name,
        desc: b.desc,
        level: lv,
        cost: D.buildingCost(b, lv),
        effectText: b.effect(lv || 1),
      };
    });
  }

  function enemyForTerritory(state, territoryId) {
    var t = state.world.find(function (x) { return x.id === territoryId; });
    if (!t || t.owner === "player") return null;
    var count = Math.min(5, 2 + Math.floor(t.power));
    return {
      territory: t,
      team: buildEnemyTeam(t.power * 0.95, count),
      title: "Công " + t.name + " · " + t.lord,
    };
  }

  function enemyForTower(state) {
    var floor = state.towerFloor;
    var power = 0.7 + floor * 0.08;
    var count = Math.min(5, 2 + Math.floor(floor / 8));
    return {
      team: buildEnemyTeam(power, count),
      title: "Tháp thí luyện · Tầng " + floor + "/" + D.MAX_TOWER,
      floor: floor,
    };
  }

  function enemyForArena(state, botId) {
    if (typeof NLArena !== "undefined") {
      var prep = NLArena.prepareChallenge(state, botId);
      if (!prep.ok) return null;
      return {
        team: prep.enemies,
        title: prep.title,
        bot: prep.bot,
        botId: prep.bot.bot_id,
        enemyFormation: prep.enemyFormationId,
      };
    }
    var p = B.teamPower(state.generals) / Math.max(1, state.generals.length);
    var power = Math.max(0.9, p / 220 + Math.random() * 0.25);
    return {
      team: buildEnemyTeam(power, Math.min(5, 3 + Math.floor(Math.random() * 2))),
      title: "Lôi đài Tam Quốc",
    };
  }

  function citySnapshot(state) {
    if (typeof NLCityEconomy !== "undefined") return NLCityEconomy.citySnapshot(state);
    return null;
  }

  /**
   * DEV/cheat: max Ty Vũ + tài nguyên + mọi tướng (phẩm cao nhất wiki, Lv max phẩm, +10).
   */
  function debugMaxAllHeroes(state) {
    if (!state) return { ok: false, msg: "Chưa có save." };
    applyElapsed(state);

    // Trần cấp cao
    if (typeof NLPlayer !== "undefined") {
      var hall = NLPlayer.getBuilding(state, "ty_vu") || NLPlayer.ensureBuilding(state, "ty_vu");
      if (hall) {
        hall.level = Math.max(hall.level || 1, 180);
        hall.upgrade_ends_at = null;
      }
      ["mo_bac", "nong_trai", "doanh_trai", "kho", "san_tap"].forEach(function (id) {
        var b = NLPlayer.getBuilding(state, id) || NLPlayer.ensureBuilding(state, id);
        if (b) {
          b.level = Math.max(b.level || 1, 100);
          b.upgrade_ends_at = null;
        }
      });
    }

    state.silver = Math.max(state.silver || 0, 99999999);
    state.food = Math.max(state.food || 0, 99999999);
    if (state.gold != null) state.gold = Math.max(state.gold || 0, 999999);
    state.prestige = Math.max(state.prestige || 0, 50000);

    var n = 0;
    (state.heroes || []).forEach(function (h) {
      var tpl =
        typeof NLDatabase !== "undefined"
          ? NLDatabase.getGeneral(h.general_id)
          : null;
      var order =
        typeof NLDatabase !== "undefined" && NLDatabase.qualityOrder
          ? NLDatabase.qualityOrder()
          : ["white", "green", "blue", "purple", "orange", "red", "gold"];
      var maxQ = (tpl && (tpl.wikiMaxQuality || tpl.quality)) || "gold";
      var qi = order.indexOf(maxQ);
      if (qi < 0) qi = order.length - 1;
      // Chọn phẩm cao nhất trong order không vượt wikiMax
      var qUse = order[qi];
      var qMeta =
        typeof NLDatabase !== "undefined" ? NLDatabase.getQuality(qUse) : null;
      var lvCap = qMeta && qMeta.maxLevel ? qMeta.maxLevel : 120;
      var trainCap =
        typeof NLPlayer !== "undefined"
          ? Math.max(20, NLPlayer.getBuildingLevel(state, "ty_vu") * 2 + 10)
          : lvCap;
      var lv = Math.min(lvCap, trainCap, 180);

      h.quality = qUse;
      h.level = lv;
      h.enhance = 10;
      h.exp = 0;
      var scaled =
        typeof NLDatabase !== "undefined"
          ? NLDatabase.scaleGeneral(h.general_id, lv, { quality: qUse })
          : null;
      if (scaled) {
        h.tongLinh = scaled.tongLinh;
        h.vuLuc = scaled.vuLuc;
        h.triLuc = scaled.triLuc;
        h.maxHp = scaled.maxHp;
        h.hp = scaled.maxHp;
        h.skillId = scaled.skillId;
        if (scaled.troop) h.troop = scaled.troop;
        if (scaled.troop2) h.troop2 = scaled.troop2;
      }
      n++;
    });

    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(state);
    pushLog(state, "DEV: max " + n + " tướng + Ty Vũ Lv.180.", "good");
    return { ok: true, count: n };
  }

  global.NLGame = {
    FACTIONS: D.FACTIONS,
    TROOPS: D.TROOPS,
    MAX_TOWER: D.MAX_TOWER,
    MAX_ARENA_DAY: D.MAX_ARENA_DAY,
    productionPerHour: productionPerHour,
    applyElapsed: applyElapsed,
    createNewGame: createNewGame,
    saveGame: saveGame,
    loadGame: loadGame,
    hasSave: hasSave,
    upgradeBuilding: upgradeBuilding,
    enhanceGeneral: enhanceGeneral,
    trainGeneral: trainGeneral,
    switchHeroActiveTroop: switchHeroActiveTroop,
    setHeroActiveTroop: setHeroActiveTroop,
    awakenGeneral: awakenGeneral,
    recruitSoulGeneral: recruitSoulGeneral,
    recruitTavernHero: recruitTavernHero,
    deployHeroSlot: deployHeroSlot,
    dismissHero: dismissHero,
    fightWithTeam: fightWithTeam,
    applyStageRewards: applyStageRewards,
    prepareStageChallenge: prepareStageChallenge,
    onTerritoryWin: onTerritoryWin,
    onTowerWin: onTowerWin,
    onArenaWin: onArenaWin,
    onArenaLose: onArenaLose,
    tickHour: tickHour,
    pushLog: pushLog,
    getBuildingList: getBuildingList,
    enemyForTerritory: enemyForTerritory,
    enemyForTower: enemyForTower,
    enemyForArena: enemyForArena,
    citySnapshot: citySnapshot,
    debugMaxAllHeroes: debugMaxAllHeroes,
  };
})(window);
