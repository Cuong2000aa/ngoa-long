/* global window, NL_DB */
/**
 * NLDatabase — API đọc Database JSON (offline qua nl-db.bundle.js).
 * Source of truth: /data/*.json — regenerate bundle khi sửa JSON.
 */
(function (global) {
  function db() {
    if (!global.NL_DB) throw new Error("NL_DB chưa load. Cần js/db/nl-db.bundle.js");
    return global.NL_DB;
  }

  function getGeneral(id) {
    return db().generals.list.find(function (g) { return g.id === id; }) || null;
  }

  function getSkill(id) {
    return db().skills.skills[id] || null;
  }

  function getQuality(id) {
    return db().qualities.tiers[id] || null;
  }

  /** Thứ tự phẩm — dùng chọn chiêu theo bậc (wiki Thường→…→Thần Hoàng) */
  function qualityOrder() {
    return (db().qualities && db().qualities.order) || [
      "white",
      "green",
      "blue",
      "purple",
      "orange",
      "red",
      "gold",
    ];
  }

  /** Phẩm kế tiếp (giác ngộ). null = đã max. */
  function nextQuality(qualityId) {
    var order = qualityOrder();
    var i = order.indexOf(qualityId || "white");
    if (i < 0 || i >= order.length - 1) return null;
    return order[i + 1];
  }

  /**
   * Cost giác ngộ từ phẩm hiện tại → phẩm kế (wiki awakenByQuality[from]).
   * Trả về { from, to, cost[{itemId,qty,name}], access } hoặc null.
   */
  function awakenInfo(generalOrId, fromQuality) {
    var g = typeof generalOrId === "string" ? getGeneral(generalOrId) : generalOrId;
    if (!g || !g.awakenByQuality) return null;
    var from = fromQuality || g.quality || "white";
    var to = nextQuality(from);
    if (!to) return null;
    // Không vượt wikiMaxQuality
    var order = qualityOrder();
    var maxQ = g.wikiMaxQuality || g.quality;
    if (order.indexOf(to) > order.indexOf(maxQ)) return null;
    var row = g.awakenByQuality[from];
    if (!row) return null;
    return {
      from: from,
      to: to,
      cost: row.cost || [],
      access: row.access || "",
    };
  }

  /** URL portrait wiki CDN (icons/{hash}) — fallback troop sprite nếu thiếu. */
  function generalPortraitUrl(generalOrId) {
    var g = typeof generalOrId === "string" ? getGeneral(generalOrId) : generalOrId;
    if (!g) return null;
    if (g.portraitUrl) return g.portraitUrl;
    if (g.portrait) {
      var CDN =
        "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/";
      if (/^https?:\/\//i.test(g.portrait)) return g.portrait;
      return CDN + g.portrait;
    }
    return null;
  }

  /**
   * Chiêu theo phẩm chất tướng (wiki vo-tuong tabs).
   * Ưu tiên: skillsByQuality → qualityLadders[skillId] → skillId gốc.
   */
  function resolveSkillId(generalOrId, qualityOverride) {
    var g = typeof generalOrId === "string" ? getGeneral(generalOrId) : generalOrId;
    if (!g) return "basic_strike";
    var q = qualityOverride || g.quality || "white";
    var order = qualityOrder();
    var idx = order.indexOf(q);
    if (idx < 0) idx = 0;

    if (g.skillsByQuality) {
      for (var i = idx; i >= 0; i--) {
        var sid = g.skillsByQuality[order[i]];
        if (sid && getSkill(sid)) return sid;
      }
    }

    var baseId = g.skillId || "basic_strike";
    var ladders = (db().skills && db().skills.qualityLadders) || {};
    var ladder = ladders[baseId];
    if (ladder) {
      for (var j = idx; j >= 0; j--) {
        var lid = ladder[order[j]];
        if (lid && getSkill(lid)) return lid;
      }
    }
    return baseId;
  }

  function getSkillForGeneral(generalOrId, qualityOverride) {
    return getSkill(resolveSkillId(generalOrId, qualityOverride));
  }

  function getTroop(id) {
    return db().troops.types[id] || null;
  }

  /** Map tên binh wiki (CN / VI / id) → troop id game. */
  var WIKI_UNIT_TO_TROOP = {
    "枪兵": "spear",
    "骑兵": "cavalry",
    "步兵": "infantry",
    "弓兵": "archer",
    "谋士": "strategist",
    "文官": "strategist",
    spear: "spear",
    cavalry: "cavalry",
    infantry: "infantry",
    archer: "archer",
    strategist: "strategist",
    Thương: "spear",
    "Thương binh": "spear",
    Kỵ: "cavalry",
    "Kỵ binh": "cavalry",
    Bộ: "infantry",
    "Bộ binh": "infantry",
    Cung: "archer",
    "Cung binh": "archer",
    "Quan văn": "strategist",
    Mưu: "strategist",
  };

  function normalizeTroopId(raw) {
    if (!raw) return null;
    if (getTroop(raw)) return raw;
    return WIKI_UNIT_TO_TROOP[raw] || WIKI_UNIT_TO_TROOP[String(raw).trim()] || null;
  }

  /**
   * Các loại binh theo wiki (units → troop + troop2).
   * Chỉ 1 loại → không đổi được; có troop2 mới hiện nhiều thẻ.
   */
  function getGeneralTroopOptions(generalOrId) {
    var g = typeof generalOrId === "string" ? getGeneral(generalOrId) : generalOrId;
    if (!g) return ["infantry"];
    var out = [];
    function add(raw) {
      var t = normalizeTroopId(raw);
      if (t && out.indexOf(t) < 0) out.push(t);
    }
    add(g.troop);
    add(g.troop2);
    add(g.troopPrimary);
    (g.wikiUnits || []).forEach(add);
    if (g.key || g.generalId || g.id) {
      var tpl = getGeneral(g.key || g.generalId || g.id);
      if (tpl && tpl !== g) {
        add(tpl.troop);
        add(tpl.troop2);
        (tpl.wikiUnits || []).forEach(add);
      }
    }
    return out.length ? out : ["infantry"];
  }

  function getGeneralWikiTroops(generalOrId) {
    return getGeneralTroopOptions(generalOrId);
  }

  function getItem(id) {
    if (!id) return null;
    return db().items.list.find(function (i) { return i.id === id; }) || null;
  }

  /** Đường icon wiki (relative từ gốc game). */
  function itemIconUrl(itemOrId) {
    var item = typeof itemOrId === "string" ? getItem(itemOrId) : itemOrId;
    if (!item) return null;
    if (item.icon) return item.icon;
    return null;
  }

  /** Slot trang bị wiki — thứ tự UI */
  var EQUIP_SLOTS = ["weapon", "armor", "horse", "book", "cloak", "shield", "troop"];

  var SLOT_LABELS = {
    weapon: "Vũ khí",
    armor: "Giáp",
    horse: "Ngựa",
    book: "Sách",
    cloak: "Choàng",
    shield: "Thuẫn",
    troop: "Dẫn binh",
  };

  var RARITY_COLORS = {
    white: "#e8e8e8",
    green: "#3ab683",
    blue: "#33ccff",
    purple: "#a750ff",
    orange: "#f0803c",
    red: "#e73f5e",
  };

  /**
   * Gộp equip object + horseId legacy → map slot→itemId.
   * equip: { weapon, armor, horse, book, cloak, shield, troop }
   */
  function resolveEquipMap(src) {
    var map = {};
    if (!src) return map;
    var eq = src.equip || {};
    EQUIP_SLOTS.forEach(function (slot) {
      if (eq[slot]) map[slot] = eq[slot];
    });
    // Legacy: horseId riêng
    if (src.horseId && !map.horse) map.horse = src.horseId;
    return map;
  }

  /** Cộng bonuses từ mọi món đang đeo vào object chỉ số (vuLuc/tongLinh/triLuc/hp/speed). */
  function applyEquipBonuses(stats, equipMap) {
    if (!stats || !equipMap) return stats;
    Object.keys(equipMap).forEach(function (slot) {
      var item = getItem(equipMap[slot]);
      if (!item || !item.bonuses) return;
      Object.keys(item.bonuses).forEach(function (k) {
        if (typeof stats[k] === "number") {
          stats[k] = Math.round(stats[k] + (item.bonuses[k] || 0));
        }
      });
    });
    return stats;
  }

  function getBuilding(id) {
    return db().buildings.list.find(function (b) { return b.id === id; }) || null;
  }

  function getChapter(chapterId) {
    return db().campaign.chapters.find(function (c) { return c.id === chapterId; }) || null;
  }

  function getStage(chapterId, stageId) {
    var ch = getChapter(chapterId);
    if (!ch) return null;
    return ch.stages.find(function (s) { return s.id === stageId; }) || null;
  }

  /** Hệ số khắc chế — tam giác cận chiến (NL v3) */
  function troopMultiplier(attackerTroop, defenderTroop) {
    var troops = db().troops;
    var counterMul = troops.counterMul != null ? troops.counterMul : 1.25;
    var weakMul = troops.weakMul != null ? troops.weakMul : 0.8;
    var neutral = troops.neutralMul != null ? troops.neutralMul : 1;
    var a = getTroop(attackerTroop);
    var d = getTroop(defenderTroop);
    if (!a || !d) return neutral;
    if (a.range === "ranged" || d.range === "ranged") return neutral;
    if (a.beats === defenderTroop) return counterMul;
    if (d.beats === attackerTroop) return weakMul;
    return neutral;
  }

  /** Build đội địch từ stage.enemies */
  function buildStageEnemies(stage) {
    if (!stage || !stage.enemies) return [];
    return stage.enemies.map(function (e) {
      var unit = scaleGeneral(e.generalId, e.level);
      if (!unit) return null;
      unit.slot = e.slot;
      unit.isEnemy = true;
      return unit;
    }).filter(Boolean);
  }

  function startersForFaction(factionId) {
    var map = db().generals.startersByFaction || {};
    return (map[factionId] || map.shu || []).map(function (id) {
      return scaleGeneral(id, 1);
    });
  }

  function rollDrop(dropTableId, chance) {
    if (Math.random() > (chance == null ? 1 : chance)) return null;
    var table = db().items.dropTables[dropTableId];
    if (!table || !table.length) return null;
    var total = table.reduce(function (s, r) { return s + (r.weight || 0); }, 0);
    var r = Math.random() * total;
    var acc = 0;
    for (var i = 0; i < table.length; i++) {
      acc += table[i].weight || 0;
      if (r <= acc) {
        return table[i].itemId ? getItem(table[i].itemId) : null;
      }
    }
    return null;
  }

  function buildingAssetKey(buildingId, level) {
    var bands = db().buildings.levelBands;
    var suffix = "lv1";
    for (var i = 0; i < bands.length; i++) {
      if (level >= bands[i].min && level <= bands[i].max) {
        suffix = bands[i].assetSuffix;
        break;
      }
    }
    return buildingId + "_" + suffix;
  }

  function listPlayableGenerals() {
    return db().generals.list.filter(function (g) { return !g.npcOnly; });
  }

  function getFaction(id) {
    return (db().factions && db().factions.list[id]) || null;
  }

  function formulas() {
    return db().formulas || null;
  }

  function recruitPools() {
    return (db().recruit && db().recruit.pools) || {};
  }

  /** Bậc binh chủng theo level (troops.tierByLevel). */
  function troopTierForLevel(level) {
    var rows = (db().troops && db().troops.tierByLevel) || [];
    var lv = level || 1;
    for (var i = 0; i < rows.length; i++) {
      if (lv <= (rows[i].maxLevel || 999)) return rows[i].tier || 1;
    }
    return 1;
  }

  function troopTierMod(tier) {
    var mods = (db().troops && db().troops.tierMods) || {};
    return mods[String(tier)] || mods["1"] || { atk: 1, def: 1, label: "Sơ cấp" };
  }

  /** Level tối thiểu để đạt bậc binh chủng (tier 1 = Lv.1). */
  function troopTierUnlockLevel(tier) {
    var rows = (db().troops && db().troops.tierByLevel) || [];
    var t = Math.max(1, Math.min(6, (tier | 0) || 1));
    if (t <= 1) return 1;
    for (var i = 0; i < rows.length; i++) {
      if ((rows[i].tier || 1) === t - 1) {
        return (rows[i].maxLevel || 0) + 1;
      }
    }
    return 1;
  }

  /** Tên/mô tả bậc theo wiki (wikiTiers) + hệ số tierMods. */
  function getTroopWikiTier(troopId, tier) {
    var troop = getTroop(troopId);
    if (!troop) return null;
    var t = Math.max(1, Math.min(6, (tier | 0) || 1));
    var wiki = (troop.wikiTiers && troop.wikiTiers[String(t)]) || null;
    var mod = troopTierMod(t);
    return {
      tier: t,
      name:
        (wiki && wiki.name) ||
        (troop.tierNames && troop.tierNames[t - 1]) ||
        (troop.wikiTierNames && troop.wikiTierNames[t - 1]) ||
        ("Bậc " + t),
      desc: (wiki && wiki.desc) || "",
      atk: mod.atk != null ? mod.atk : 1,
      def: mod.def != null ? mod.def : 1,
      label: mod.label || ("Bậc " + t),
      unlockLevel: troopTierUnlockLevel(t),
      statBias: (wiki && wiki.statBias) || null,
    };
  }

  /** Scale dùng hệ số từ formulas.json nếu có */
  function scaleGeneral(generalId, level, overrides) {
    var g = typeof generalId === "string" ? getGeneral(generalId) : generalId;
    if (!g) return null;
    var f = formulas();
    // Phẩm hiệu lực: override runtime (giác ngộ) → chất tướng trên template wiki
    var qUse = (overrides && overrides.quality) || g.quality || "white";
    var qMeta = getQuality(qUse) || getQuality(g.quality);
    var lvCap = qMeta ? qMeta.maxLevel : 120;
    var lv = Math.max(1, Math.min(level || 1, lvCap));
    var gr =
      (g.growthRatesByQuality && g.growthRatesByQuality[qUse]) ||
      g.growthRates ||
      (qMeta ? qMeta.growth : { tongLinh: 1, vuLuc: 1, triLuc: 1 });
    var per = (f && f.level && f.level.statPerLevel) || 0.04;
    var hpPer = (f && f.level && f.level.hpPerLevel) || 0.045;
    var factor = function (stat) {
      return 1 + (lv - 1) * per * (gr[stat] || 1);
    };
    var base =
      (g.statsByQuality && g.statsByQuality[qUse]) ||
      g.base;
    var activeTroop = (overrides && overrides.activeTroop) || g.troop;
    var troop = getTroop(activeTroop || g.troop);
    var bias = (troop && troop.statBias) || {};
    var tier = troopTierForLevel(lv);
    var tMod = troopTierMod(tier);
    var tierNames = (troop && troop.tierNames) || null;
    var skillIdResolved = resolveSkillId(g, qUse);
    var out = {
      id: g.id,
      name: g.name,
      faction: g.faction,
      quality: qUse,
      troop: activeTroop || g.troop,
      troopPrimary: g.troop,
      troop2: g.troop2 || null,
      troopTier: tier,
      troopTierName:
        (tierNames && tierNames[tier - 1]) ||
        (tMod && tMod.label) ||
        ("Bậc " + tier),
      skillId: skillIdResolved,
      skillBaseId: g.skillId,
      portraitUrl: g.portraitUrl || null,
      wikiHeroId: g.wikiHeroId || null,
      qualityWiki: (qMeta && qMeta.wikiName) || null,
      level: lv,
      tongLinh: Math.round(base.tongLinh * factor("tongLinh") * (bias.tongLinh || 1) * (tMod.def || 1)),
      vuLuc: Math.round(base.vuLuc * factor("vuLuc") * (bias.vuLuc || 1) * (tMod.atk || 1)),
      triLuc: Math.round(base.triLuc * factor("triLuc") * (bias.triLuc || 1) * (tMod.atk || 1)),
      hp: Math.round(
        base.hp *
          (1 + (lv - 1) * hpPer * ((gr.tongLinh + gr.vuLuc) / 2)) *
          (tMod.def || 1)
      ),
      maxHp: 0,
      morale: 0,
      maxMorale: (db().formation && db().formation.morale && db().formation.morale.max) || 100,
      horseId: (overrides && overrides.horseId) || g.horseId || null,
      equip: (overrides && overrides.equip) || g.equip || null,
    };
    if (overrides) {
      Object.keys(overrides).forEach(function (k) {
        if (k === "activeTroop") return;
        // Không ghi đè chỉ số đã scale — trang bị cộng sau
        if (k === "vuLuc" || k === "tongLinh" || k === "triLuc" || k === "hp" || k === "maxHp") return;
        out[k] = overrides[k];
      });
    }
    // Bonus toàn bộ trang bị wiki (+ horseId legacy)
    var equipMap = resolveEquipMap({
      equip: out.equip,
      horseId: out.horseId,
    });
    if (equipMap.horse) out.horseId = equipMap.horse;
    applyEquipBonuses(out, equipMap);
    out.maxHp = out.hp;
    return out;
  }

  global.NLDatabase = {
    raw: db,
    getGeneral: getGeneral,
    getSkill: getSkill,
    getQuality: getQuality,
    resolveSkillId: resolveSkillId,
    getSkillForGeneral: getSkillForGeneral,
    qualityOrder: qualityOrder,
    nextQuality: nextQuality,
    awakenInfo: awakenInfo,
    generalPortraitUrl: generalPortraitUrl,
    getTroop: getTroop,
    normalizeTroopId: normalizeTroopId,
    getGeneralTroopOptions: getGeneralTroopOptions,
    getGeneralWikiTroops: getGeneralWikiTroops,
    troopTierForLevel: troopTierForLevel,
    troopTierMod: troopTierMod,
    troopTierUnlockLevel: troopTierUnlockLevel,
    getTroopWikiTier: getTroopWikiTier,
    getItem: getItem,
    itemIconUrl: itemIconUrl,
    EQUIP_SLOTS: EQUIP_SLOTS,
    SLOT_LABELS: SLOT_LABELS,
    RARITY_COLORS: RARITY_COLORS,
    resolveEquipMap: resolveEquipMap,
    applyEquipBonuses: applyEquipBonuses,
    getBuilding: getBuilding,
    getChapter: getChapter,
    getStage: getStage,
    getFaction: getFaction,
    troopMultiplier: troopMultiplier,
    scaleGeneral: scaleGeneral,
    buildStageEnemies: buildStageEnemies,
    startersForFaction: startersForFaction,
    rollDrop: rollDrop,
    buildingAssetKey: buildingAssetKey,
    listPlayableGenerals: listPlayableGenerals,
    formulas: formulas,
    recruitPools: recruitPools,
    formation: function () { return db().formation; },
    campaign: function () { return db().campaign; },
    qualities: function () { return db().qualities; },
    troops: function () { return db().troops; },
    factions: function () { return db().factions; },
    recruit: function () { return db().recruit; },
    formations: function () { return db().formations; },
    statusEffects: function () { return db().statusEffects || null; },
    getStatusEffect: function (id) {
      var se = db().statusEffects;
      if (!se) return null;
      if (se.effects && se.effects[id]) return se.effects[id];
      var cat = se.wikiCatalog || [];
      for (var i = 0; i < cat.length; i++) {
        if (cat[i].id === id || cat[i].name === id) return cat[i];
      }
      return null;
    },
    wikiEffectByName: function (name) {
      var se = db().statusEffects;
      if (!se || !se.wikiCatalog || !name) return null;
      var key = String(name).toLowerCase();
      for (var i = 0; i < se.wikiCatalog.length; i++) {
        if (String(se.wikiCatalog[i].name || "").toLowerCase() === key) return se.wikiCatalog[i];
      }
      return null;
    },
    version: function () { return (db().meta && db().meta.version) || "0"; },
  };
})(window);
