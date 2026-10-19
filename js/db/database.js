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
    ];
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

  function getItem(id) {
    return db().items.list.find(function (i) { return i.id === id; }) || null;
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

  /** Scale dùng hệ số từ formulas.json nếu có */
  function scaleGeneral(generalId, level, overrides) {
    var g = typeof generalId === "string" ? getGeneral(generalId) : generalId;
    if (!g) return null;
    var q = getQuality(g.quality);
    var f = formulas();
    var lvCap = q ? q.maxLevel : 120;
    var lv = Math.max(1, Math.min(level || 1, lvCap));
    var gr = q ? q.growth : { tongLinh: 1, vuLuc: 1, triLuc: 1 };
    var per = (f && f.level && f.level.statPerLevel) || 0.04;
    var hpPer = (f && f.level && f.level.hpPerLevel) || 0.045;
    var factor = function (stat) {
      return 1 + (lv - 1) * per * (gr[stat] || 1);
    };
    var base = g.base;
    var activeTroop = (overrides && overrides.activeTroop) || g.troop;
    var troop = getTroop(activeTroop || g.troop);
    var bias = (troop && troop.statBias) || {};
    var tier = troopTierForLevel(lv);
    var tMod = troopTierMod(tier);
    var tierNames = (troop && troop.tierNames) || null;
    var out = {
      id: g.id,
      name: g.name,
      faction: g.faction,
      quality: g.quality,
      troop: activeTroop || g.troop,
      troopPrimary: g.troop,
      troop2: g.troop2 || null,
      troopTier: tier,
      troopTierName:
        (tierNames && tierNames[tier - 1]) ||
        (tMod && tMod.label) ||
        ("Bậc " + tier),
      skillId: resolveSkillId(g, (overrides && overrides.quality) || g.quality),
      skillBaseId: g.skillId,
      qualityWiki: (q && q.wikiName) || null,
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
    };
    out.maxHp = out.hp;
    // Bonus ngựa (nếu đeo)
    if (out.horseId && typeof getItem === "function") {
      var horse = getItem(out.horseId);
      if (horse && horse.bonuses) {
        Object.keys(horse.bonuses).forEach(function (k) {
          if (typeof out[k] === "number") out[k] = Math.round(out[k] + horse.bonuses[k]);
        });
      }
    }
    if (overrides) {
      Object.keys(overrides).forEach(function (k) {
        if (k === "activeTroop") return;
        out[k] = overrides[k];
      });
    }
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
    getTroop: getTroop,
    troopTierForLevel: troopTierForLevel,
    troopTierMod: troopTierMod,
    getItem: getItem,
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
