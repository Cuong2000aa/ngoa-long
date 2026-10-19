/* global window, NLDatabase, NLPlayer, NLCityEconomy */
/**
 * NLRecruit — Tửu Quán + Danh Vọng + Kho tướng (Owned Heroes) + Bố trận.
 */
(function (global) {
  function recruitDb() {
    return NLDatabase.raw().recruit || {};
  }

  function entries() {
    return recruitDb().list || [];
  }

  function findEntry(idOrHero) {
    var list = entries();
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (
        e.recruit_id === idOrHero ||
        e.hero_id === idOrHero ||
        e.hero_alias === idOrHero
      ) {
        return e;
      }
    }
    return null;
  }

  function tyVuLevel(player) {
    if (typeof NLPlayer !== "undefined") {
      return Math.max(1, NLPlayer.getBuildingLevel(player, "ty_vu") || 1);
    }
    return (player.buildings && player.buildings.hall) || 1;
  }

  function playerLevel(player) {
    return Math.max(player.level || 1, tyVuLevel(player));
  }

  function prestige(player) {
    return player.prestige || 0;
  }

  function getSilver(player) {
    if (player.resources && player.resources.silver != null) return player.resources.silver;
    return player.silver || 0;
  }

  function spendSilver(player, amount) {
    amount = Math.floor(amount || 0);
    if (player.resources) {
      player.resources.silver = Math.max(0, (player.resources.silver || 0) - amount);
      player.silver = Math.floor(player.resources.silver);
    } else {
      player.silver = Math.max(0, (player.silver || 0) - amount);
    }
  }

  function progressionDb() {
    return (NLDatabase.raw() && NLDatabase.raw().progression) || {};
  }

  function prestigeRank(player) {
    var ranks = progressionDb().prestigeRanks || [];
    var p = prestige(player);
    var cur = ranks[0] || { rank: 1, prestige: 0, title: "Bạch Đinh", heroSlotsBonus: 0 };
    for (var i = 0; i < ranks.length; i++) {
      if (p >= (ranks[i].prestige || 0)) cur = ranks[i];
    }
    return cur;
  }

  function maxHeroCapacity(player) {
    var db = recruitDb();
    var base = db.maxHeroSlotsBase || 8;
    var per = db.maxHeroSlotsPerTyVu || 1;
    var fromTy = base + Math.max(0, tyVuLevel(player) - 1) * per;
    var fromPres = prestigeRank(player).heroSlotsBonus || 0;
    return fromTy + fromPres;
  }

  function stageLabel(stageId) {
    if (!stageId || typeof NLDatabase === "undefined") return stageId;
    var camp = NLDatabase.raw().campaign;
    if (!camp || !camp.chapters) return stageId;
    for (var i = 0; i < camp.chapters.length; i++) {
      var ch = camp.chapters[i];
      var stages = ch.stages || [];
      for (var j = 0; j < stages.length; j++) {
        if (stages[j].id === stageId) {
          return ch.name + " · " + stages[j].name;
        }
      }
    }
    return stageId;
  }

  function ensureHeroes(player) {
    if (!Array.isArray(player.heroes)) player.heroes = [];
    var deployedMap = {};
    if (player.deployed_formation && Array.isArray(player.deployed_formation.slots)) {
      player.deployed_formation.slots.forEach(function (s) {
        if (s.hero_id) deployedMap[s.hero_id] = s.slot;
      });
    }
    player.heroes.forEach(function (h) {
      if (h.exp == null) h.exp = 0;
      if (h.level == null) h.level = 1;
      if (h.enhance == null) h.enhance = 0;
      if (h.troops == null) h.troops = 100;
      var slot = deployedMap[h.hero_id] || null;
      h.deployed_slot = slot;
      h.status = slot ? "DEPLOYED" : "STANDBY";
    });
    return player.heroes;
  }

  function ownsGeneral(player, generalId) {
    ensureHeroes(player);
    var entry = findEntry(generalId);
    var gid = entry ? entry.hero_id : generalId;
    return player.heroes.some(function (h) {
      return h.general_id === gid || h.hero_id === gid || h.hero_alias === generalId;
    });
  }

  function stageCleared(player, stageId) {
    if (!stageId) return true;
    return !!(player.campaign && player.campaign.cleared && player.campaign.cleared[stageId]);
  }

  /**
   * Trạng thái chiêu mộ của 1 entry:
   * - OWNED: đã sở hữu
   * - AVAILABLE: đủ danh vọng + cấp + Ty Vũ + ải yêu cầu
   * - LOCKED: chưa đủ điều kiện
   */
  function isRecruitBlockedGeneral(tpl) {
    if (!tpl) return true;
    if (tpl.npcOnly) return true;
    var tags = tpl.tags || [];
    return tags.indexOf("generic") >= 0;
  }

  function evaluateEntry(player, entry) {
    if (!entry) return null;
    var tpl = NLDatabase.getGeneral(entry.hero_id);
    // Lính thường / NPC: không vào Tửu Quán, không chiêu mộ
    if (isRecruitBlockedGeneral(tpl)) return null;

    var owned = ownsGeneral(player, entry.hero_id);
    var pLv = playerLevel(player);
    var tvLv = tyVuLevel(player);
    var pres = prestige(player);
    var stOk = stageCleared(player, entry.required_stage);

    var reqLv = entry.required_player_level || 1;
    var reqTv = entry.required_ty_vu_level || 1;
    var reqPres = entry.required_prestige || 0;

    var reasons = [];
    if (pres < reqPres) reasons.push("Cần " + reqPres + " Danh vọng (đang có " + pres + ")");
    if (pLv < reqLv) reasons.push("Cần cấp " + reqLv);
    if (tvLv < reqTv) reasons.push("Cần Ty Vũ Lv." + reqTv);
    if (!stOk) reasons.push("Cần vượt ải «" + stageLabel(entry.required_stage) + "»");

    // recruit_advanced: tướng cam/đỏ cần unlock feature (boss ch1)
    var q = entry.quality || "";
    var needsAdvanced = q === "orange" || q === "red";
    if (needsAdvanced && typeof NLCampaign !== "undefined" && !NLCampaign.hasFeature(player, "recruit_advanced")) {
      reasons.push("Cần mở «Chiêu mộ tướng cao cấp» (hạ Boss Chương 1)");
    }

    var status = owned ? "OWNED" : reasons.length === 0 ? "AVAILABLE" : "LOCKED";

    return {
      recruit_id: entry.recruit_id,
      hero_id: entry.hero_id,
      hero_alias: entry.hero_alias,
      name: entry.name,
      faction: entry.faction,
      quality: entry.quality,
      troop: entry.troop,
      source: entry.source || "tavern",
      cost_silver: entry.cost_silver,
      required_prestige: reqPres,
      required_player_level: reqLv,
      required_ty_vu_level: reqTv,
      required_stage: entry.required_stage || null,
      status: status,
      lock_reasons: reasons,
      can_afford: getSilver(player) >= entry.cost_silver,
      base: tpl ? tpl.base : null,
      skillId: tpl ? NLDatabase.resolveSkillId(tpl, entry.quality || tpl.quality) : "basic_strike",
      portraitUrl:
        tpl && NLDatabase.generalPortraitUrl ? NLDatabase.generalPortraitUrl(tpl) : null,
      troop2: tpl ? tpl.troop2 || null : null,
    };
  }

  /** Danh sách chiêu mộ (lọc theo source/faction/status tùy chọn) */
  function listRecruitable(player, filter) {
    filter = filter || {};
    ensureHeroes(player);
    return entries()
      .map(function (e) { return evaluateEntry(player, e); })
      .filter(function (item) {
        if (!item) return false;
        if (filter.source && item.source !== filter.source) return false;
        if (filter.faction && item.faction !== filter.faction && item.faction !== "other") return false;
        if (filter.status && item.status !== filter.status) return false;
        if (filter.unlockedOnly && item.status === "LOCKED") return false;
        return true;
      });
  }

  function createHeroInstance(generalId, level) {
    var scaled = NLDatabase.scaleGeneral(generalId, level || 1);
    if (!scaled) return null;
    var entry = findEntry(generalId);
    return {
      hero_id: scaled.id + "_" + Math.random().toString(36).slice(2, 6),
      hero_alias: entry ? entry.hero_alias : null,
      general_id: scaled.id,
      name: scaled.name,
      faction: scaled.faction,
      troop: scaled.troop,
      troop2: scaled.troop2 || null,
      quality: scaled.quality,
      skillId: scaled.skillId,
      tongLinh: scaled.tongLinh,
      vuLuc: scaled.vuLuc,
      triLuc: scaled.triLuc,
      hp: scaled.hp,
      maxHp: scaled.maxHp,
      level: scaled.level || 1,
      exp: 0,
      enhance: 0,
      troops: 100,
      status: "STANDBY",
      deployed_slot: null,
    };
  }

  /**
   * Thưởng tướng miễn phí (first-clear phó bản / sự kiện) — bỏ qua bạc & điều kiện tửu quán.
   */
  function grantHero(player, generalId, meta) {
    meta = meta || {};
    ensureHeroes(player);
    if (!generalId) return { ok: false, reason: "Thiếu generalId." };
    var tpl = NLDatabase.getGeneral(generalId);
    if (!tpl) return { ok: false, reason: "Không tìm thấy tướng " + generalId };
    if (isRecruitBlockedGeneral(tpl)) {
      return {
        ok: false,
        reason: "Chỉ thu phục được tướng tinh anh — lính thường không chiêu mộ được.",
        npcOnly: true,
      };
    }
    if (ownsGeneral(player, generalId)) {
      return { ok: false, reason: "already_owned", skipped: true };
    }
    var cap = maxHeroCapacity(player);
    if (player.heroes.length >= cap) {
      return {
        ok: false,
        reason: "Kho tướng đã đầy (" + player.heroes.length + "/" + cap + ").",
        full: true,
      };
    }
    var hero = createHeroInstance(generalId, meta.level || 1);
    if (!hero) return { ok: false, reason: "Không tìm thấy tướng " + generalId };
    hero.obtain = meta.obtain || "campaign";
    hero.obtainFrom = meta.from || null;
    player.heroes.push(hero);

    var slots = (player.deployed_formation && player.deployed_formation.slots) || [];
    if (slots.length < 5) {
      var used = {};
      slots.forEach(function (s) { used[s.slot] = true; });
      for (var s = 1; s <= 5; s++) {
        if (!used[s]) {
          deployHero(player, hero.hero_id, s);
          break;
        }
      }
    }

    ensureHeroes(player);
    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(player);
    if (player.log) {
      player.log.unshift({
        msg: (meta.logPrefix || "Thu phục") + ": " + hero.name + (meta.fromName ? " («" + meta.fromName + "»)" : "") + ".",
        type: "gold",
        t: Date.now(),
      });
    }
    return { ok: true, hero: hero };
  }

  /**
   * Chiêu mộ tướng từ Tửu Quán / Danh Vọng.
   * idOrHero: recruit_id ("rec_001") | hero_id ("guanyu") | hero_alias ("h_001")
   */
  function recruitHero(player, idOrHero) {
    ensureHeroes(player);
    var entry = findEntry(idOrHero);
    if (!entry) return { ok: false, reason: "Không tìm thấy tướng trong danh sách chiêu mộ." };

    var ev = evaluateEntry(player, entry);
    if (!ev) {
      return {
        ok: false,
        reason: "Chỉ chiêu mộ được tướng tinh anh — lính thường không vào Tửu Quán.",
        npcOnly: true,
      };
    }
    if (ev.status === "OWNED") {
      return { ok: false, reason: "Bạn đã sở hữu " + entry.name + ".", status: "OWNED" };
    }
    if (ev.status === "LOCKED") {
      return {
        ok: false,
        reason: ev.lock_reasons.join(" · ") || "Chưa đủ điều kiện chiêu mộ.",
        status: "LOCKED",
        lock_reasons: ev.lock_reasons,
      };
    }

    var cap = maxHeroCapacity(player);
    if (player.heroes.length >= cap) {
      return {
        ok: false,
        reason: "Kho tướng đã đầy (" + player.heroes.length + "/" + cap + "). Nâng Ty Vũ hoặc sa thải tướng.",
      };
    }

    if (getSilver(player) < entry.cost_silver) {
      return {
        ok: false,
        reason: "Không đủ Bạc (cần " + entry.cost_silver + ").",
        cost_silver: entry.cost_silver,
      };
    }

    spendSilver(player, entry.cost_silver);
    var hero = createHeroInstance(entry.hero_id, 1);
    player.heroes.push(hero);

    // Nếu đội hình chưa đủ 5 người, tự động xếp vào ô trống đầu tiên
    var slots = (player.deployed_formation && player.deployed_formation.slots) || [];
    if (slots.length < 5) {
      var used = {};
      slots.forEach(function (s) { used[s.slot] = true; });
      for (var s = 1; s <= 5; s++) {
        if (!used[s]) {
          deployHero(player, hero.hero_id, s);
          break;
        }
      }
    }

    ensureHeroes(player);
    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(player);

    if (player.log) {
      player.log.unshift({
        msg: "Chiêu mộ thành công: " + hero.name + " (−" + entry.cost_silver + " bạc).",
        type: "gold",
        t: Date.now(),
      });
    }

    return {
      ok: true,
      hero: hero,
      cost_silver: entry.cost_silver,
      entry: evaluateEntry(player, entry),
    };
  }

  function findOwnedHero(player, heroId) {
    ensureHeroes(player);
    for (var i = 0; i < player.heroes.length; i++) {
      var h = player.heroes[i];
      if (
        h.hero_id === heroId ||
        h.general_id === heroId ||
        h.hero_alias === heroId
      ) {
        return h;
      }
    }
    return null;
  }

  /** Gán tướng vào ô trận hình (1..5), hoặc slot=null/0 để cho về kho (STANDBY) */
  function deployHero(player, heroId, slot) {
    var hero = findOwnedHero(player, heroId);
    if (!hero) return { ok: false, reason: "Không tìm thấy tướng trong kho." };
    if (!player.deployed_formation) {
      player.deployed_formation = { formation_id: "crane_wing", slots: [] };
    }
    var form = player.deployed_formation;
    form.slots = (form.slots || []).filter(function (s) {
      return s.hero_id !== hero.hero_id;
    });

    if (slot != null && slot >= 1 && slot <= 5) {
      slot = Math.floor(slot);
      // Gỡ tướng đang đứng ô đó (về standby)
      form.slots = form.slots.filter(function (s) { return s.slot !== slot; });
      if (form.slots.length >= 5) {
        return { ok: false, reason: "Trận hình tối đa 5 tướng." };
      }
      form.slots.push({ slot: slot, hero_id: hero.hero_id });
    }

    ensureHeroes(player);
    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(player);
    return {
      ok: true,
      hero_id: hero.hero_id,
      status: hero.status,
      deployed_slot: hero.deployed_slot,
      deployed_formation: form,
    };
  }

  function unassignHero(player, heroId) {
    return deployHero(player, heroId, null);
  }

  /** Sa thải tướng (không cho sa thải tướng cuối cùng) */
  function dismissHero(player, heroId) {
    ensureHeroes(player);
    if (player.heroes.length <= 1) {
      return { ok: false, reason: "Phải giữ ít nhất 1 tướng." };
    }
    var hero = findOwnedHero(player, heroId);
    if (!hero) return { ok: false, reason: "Không tìm thấy tướng." };
    unassignHero(player, hero.hero_id);
    player.heroes = player.heroes.filter(function (h) { return h.hero_id !== hero.hero_id; });
    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(player);
    return { ok: true, dismissed: hero.name };
  }

  /** Cộng EXP cho tướng → tự lên cấp nếu đủ ngưỡng */
  function expNeeded(level) {
    return 100 + (level - 1) * 60;
  }

  function addHeroExp(player, heroId, amount) {
    var hero = findOwnedHero(player, heroId);
    if (!hero) return { ok: false, reason: "Không tìm thấy tướng." };
    amount = Math.max(0, Math.floor(amount || 0));
    hero.exp = (hero.exp || 0) + amount;
    var maxLv = tyVuLevel(player) * 2 + 10;
    var leveled = 0;
    while (hero.level < maxLv && hero.exp >= expNeeded(hero.level)) {
      hero.exp -= expNeeded(hero.level);
      hero.level += 1;
      leveled++;
      var scaled = NLDatabase.scaleGeneral(hero.general_id, hero.level);
      if (scaled) {
        hero.tongLinh = scaled.tongLinh;
        hero.vuLuc = scaled.vuLuc;
        hero.triLuc = scaled.triLuc;
        hero.maxHp = scaled.maxHp;
        hero.hp = scaled.maxHp;
      } else {
        hero.tongLinh = Math.round(hero.tongLinh * 1.04);
        hero.vuLuc = Math.round(hero.vuLuc * 1.04);
        hero.triLuc = Math.round(hero.triLuc * 1.04);
        hero.maxHp = Math.round(hero.maxHp * 1.045);
        hero.hp = hero.maxHp;
      }
    }
    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(player);
    return { ok: true, hero: hero, leveled: leveled };
  }

  /** Export đúng JSON schema mẫu trong đề bài */
  function toSampleSchema(player, idOrHero) {
    var entry = findEntry(idOrHero) || entries()[0];
    var ev = evaluateEntry(player, entry);
    return {
      recruit_id: ev.recruit_id,
      hero_id: ev.hero_alias || ev.hero_id,
      name: ev.name,
      cost_silver: ev.cost_silver,
      required_prestige: ev.required_prestige,
      required_player_level: ev.required_player_level,
      status: ev.status,
    };
  }

  function tavernSnapshot(player) {
    ensureHeroes(player);
    var all = listRecruitable(player);
    var rank = prestigeRank(player);
    return {
      silver: Math.floor(getSilver(player)),
      prestige: prestige(player),
      prestige_rank: rank,
      player_level: playerLevel(player),
      ty_vu_level: tyVuLevel(player),
      hero_count: player.heroes.length,
      hero_capacity: maxHeroCapacity(player),
      owned_heroes: player.heroes,
      deployed_formation: player.deployed_formation,
      available: all.filter(function (x) { return x.status === "AVAILABLE"; }),
      locked: all.filter(function (x) { return x.status === "LOCKED"; }),
      owned: all.filter(function (x) { return x.status === "OWNED"; }),
      all: all,
    };
  }

  global.NLRecruit = {
    entries: entries,
    findEntry: findEntry,
    evaluateEntry: evaluateEntry,
    listRecruitable: listRecruitable,
    recruitHero: recruitHero,
    grantHero: grantHero,
    ownsGeneral: ownsGeneral,
    findOwnedHero: findOwnedHero,
    deployHero: deployHero,
    unassignHero: unassignHero,
    dismissHero: dismissHero,
    addHeroExp: addHeroExp,
    expNeeded: expNeeded,
    maxHeroCapacity: maxHeroCapacity,
    prestigeRank: prestigeRank,
    stageLabel: stageLabel,
    ensureHeroes: ensureHeroes,
    toSampleSchema: toSampleSchema,
    tavernSnapshot: tavernSnapshot,
  };
})(window);
