/* global window, NLDatabase */
/**
 * Player State v3 — Thành chính + tài nguyên + trận hình triển khai.
 */
(function (global) {
  var SAVE_KEY = "ngoa-long-offline-v3";
  var LEGACY_KEY = "ngoa-long-offline-v1";

  function uid(prefix) {
    return (prefix || "p") + "_" + Math.random().toString(36).slice(2, 9);
  }

  function buildingDef(id) {
    if (!NLDatabase) return null;
    var list = NLDatabase.raw().buildings.list;
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (b.id === id) return b;
      if (b.aliases && b.aliases.indexOf(id) >= 0) return b;
    }
    return null;
  }

  function normalizeBuildingId(id) {
    var def = buildingDef(id);
    return def ? def.id : id;
  }

  /** Alias UI cũ (city-render / data.js) → id chuẩn */
  var LEGACY_BUILDING_MAP = {
    hall: "ty_vu",
    farm: "nong_trai",
    mine: "mo_bac",
    barracks: "doanh_trai",
    wall: "kho",
    academy: "san_tap",
    b_tyvu: "ty_vu",
    b_mobac: "mo_bac",
    b_nongtrai: "nong_trai",
    b_doanhtrai: "doanh_trai",
    b_kho: "kho",
  };

  function defaultBuildingList() {
    var start =
      (NLDatabase && NLDatabase.formulas().city && NLDatabase.formulas().city.starting.buildings) || {
        ty_vu: 1,
        mo_bac: 1,
        nong_trai: 1,
        doanh_trai: 1,
        kho: 1,
      };
    return Object.keys(start).map(function (id) {
      return { building_id: id, level: start[id], upgrade_ends_at: null };
    });
  }

  /** Bộ đồ trắng khởi đầu (wiki) — 2 bộ để đeo 2 tướng. */
  var STARTER_EQUIP_IDS = [
    "wiki_eq_1", // Thiết Kiếm
    "wiki_eq_34", // Bố Giáp
    "wiki_eq_67", // Hoàng Phiêu
    "wiki_eq_123", // Kinh Thi
    "wiki_eq_95", // Choàng Gấm
    "wiki_eq_151", // Mộc Thuẫn
    "wiki_eq_179", // Hương Nang
    "wiki_eq_6", // Bách Thương
    "wiki_eq_35", // Bách Thú Y
    "wiki_eq_69", // Đại Uyển
    "wiki_eq_125", // Điển Luận
    "wiki_eq_100", // Báo Văn
    "wiki_eq_155", // Bạch Thuẫn
    "wiki_eq_182", // Đồng Tước
  ];

  function seedStarterEquip() {
    var now = Date.now();
    return STARTER_EQUIP_IDS.map(function (id) {
      return { itemId: id, at: now, from: "starter" };
    });
  }

  /** Ghi trang bị vào heroes (source of truth) — generals chỉ là view. */
  function setHeroEquip(player, heroId, slot, itemId) {
    if (!player || !heroId || !slot) return false;
    var hero = null;
    (player.heroes || []).forEach(function (h) {
      if (h.hero_id === heroId) hero = h;
    });
    if (!hero) return false;
    if (!hero.equip) hero.equip = {};
    if (itemId) hero.equip[slot] = itemId;
    else delete hero.equip[slot];
    if (slot === "horse") hero.horseId = itemId || null;
    else if (hero.equip.horse) hero.horseId = hero.equip.horse;
    syncLegacyView(player);
    return true;
  }

  function ensureInventorySeed(player) {
    if (!player) return;
    if (!Array.isArray(player.inventory) || !player.inventory.length) {
      player.inventory = seedStarterEquip();
    }
  }

  function buildingList(player) {
    if (!player) return [];
    if (Array.isArray(player._buildingList)) return player._buildingList;
    if (Array.isArray(player.buildings)) {
      player._buildingList = player.buildings;
      return player._buildingList;
    }
    player._buildingList = [];
    return player._buildingList;
  }

  function getBuilding(player, buildingId) {
    var id = normalizeBuildingId(LEGACY_BUILDING_MAP[buildingId] || buildingId);
    var list = buildingList(player);
    for (var i = 0; i < list.length; i++) {
      if (list[i].building_id === id) return list[i];
    }
    return null;
  }

  function ensureBuilding(player, buildingId) {
    var id = normalizeBuildingId(LEGACY_BUILDING_MAP[buildingId] || buildingId);
    var b = getBuilding(player, id);
    if (b) return b;
    b = { building_id: id, level: 0, upgrade_ends_at: null };
    buildingList(player).push(b);
    return b;
  }

  function getBuildingLevel(player, buildingId) {
    var b = getBuilding(player, buildingId);
    return b ? b.level : 0;
  }

  function createPlayer(username, factionId) {
    var faction = factionId || "shu";
    var cityStart =
      (NLDatabase && NLDatabase.formulas().city && NLDatabase.formulas().city.starting) || {};
    var heroes = [];
    if (NLDatabase) {
      heroes = NLDatabase.startersForFaction(faction).map(function (u, i) {
        return {
          hero_id: u.id + "_" + Math.random().toString(36).slice(2, 6),
          general_id: u.id,
          name: u.name,
          troop: u.troop,
          quality: u.quality,
          skillId: u.skillId,
          tongLinh: u.tongLinh,
          vuLuc: u.vuLuc,
          triLuc: u.triLuc,
          hp: u.hp,
          maxHp: u.maxHp,
          level: 1,
          exp: 0,
          enhance: 0,
          troops: 100,
          status: i < 3 ? "DEPLOYED" : "STANDBY",
          deployed_slot: i < 3 ? i + 1 : null,
          horseId: null,
          equip: {},
        };
      });
    }

    var formationId =
      (NLDatabase && NLDatabase.formulas().economy && NLDatabase.formulas().economy.defaultFormationId) ||
      "crane_wing";

    var slots = heroes.slice(0, 3).map(function (h, i) {
      return { slot: i + 1, hero_id: h.hero_id };
    });

    var now = Date.now();
    var player = {
      version: 3,
      player_id: uid("p"),
      username: (username || "Thành Chủ").slice(0, 16),
      level: 1,
      faction: faction,
      resources: {
        silver: cityStart.silver != null ? cityStart.silver : 5000,
        food: cityStart.food != null ? cityStart.food : 4000,
        gem: cityStart.gem != null ? cityStart.gem : 50,
      },
      _buildingList: defaultBuildingList(),
      buildings: null,
      troops_pool: 500,
      troops_max: 500,
      deployed_formation: {
        formation_id: formationId,
        slots: slots,
      },
      heroes: heroes,
      campaign: {
        cleared: {},
        exp: 0,
        unlockedFeatures: { campaign: true },
        current: { chapterId: null, stageId: null },
      },
      inventory: seedStarterEquip(),
      world: null,
      towerFloor: 1,
      arenaLeft: 3,
      day: 1,
      hour: 0,
      last_tick_at: now,
      prestige: 0,
      souls: 0,
      log: [{ msg: "Khai quốc thành công. Thiên hạ đang chờ Ngài.", type: "", t: now }],
    };
    return syncLegacyView(player);
  }

  /**
   * Đồng bộ field legacy để city-render / UI / combat cũ đọc được.
   * - buildings = object { hall, farm, mine, ... } cho CityRenderer
   * - _buildingList = array chuẩn v3
   * - silver/food/gold mirror resources
   * - generals mirror heroes
   */
  function syncLegacyView(player) {
    if (!player) return player;
    if (!player.resources) {
      player.resources = { silver: 0, food: 0, gem: 0 };
    }
    ensureInventorySeed(player);
    var list = buildingList(player);

    player.playerName = player.username;
    player.player_id = player.player_id || uid("p");
    player.silver = Math.floor(player.resources.silver);
    player.food = Math.floor(player.resources.food);
    player.gold = Math.floor(player.resources.gem);
    player.lastTick = player.last_tick_at;

    var map = {};
    list.forEach(function (b) {
      map[b.building_id] = b.level;
    });
    // aliases cho city-render (hall/farm/mine/barracks/wall/academy)
    map.hall = map.ty_vu || 0;
    map.farm = map.nong_trai || 0;
    map.mine = map.mo_bac || 0;
    map.barracks = map.doanh_trai || 0;
    map.wall = map.kho || 0;
    map.academy = map.san_tap || 0;

    player.buildings = map;
    player._buildingList = list;

    var deployedMap = {};
    if (player.deployed_formation && Array.isArray(player.deployed_formation.slots)) {
      player.deployed_formation.slots.forEach(function (s) {
        if (s.hero_id) deployedMap[s.hero_id] = s.slot;
      });
    }

    player.generals = (player.heroes || []).map(function (h) {
      if (h.exp == null) h.exp = 0;
      if (!h.equip) h.equip = {};
      // Đồng bộ horseId legacy ↔ equip.horse
      if (h.equip.horse && !h.horseId) h.horseId = h.equip.horse;
      if (h.horseId && !h.equip.horse) h.equip.horse = h.horseId;
      var slot = deployedMap[h.hero_id] || null;
      h.deployed_slot = slot;
      h.status = slot ? "DEPLOYED" : "STANDBY";
      var tpl =
        typeof NLDatabase !== "undefined" ? NLDatabase.getGeneral(h.general_id) : null;
      if (tpl && !h.troop2 && tpl.troop2) h.troop2 = tpl.troop2;
      // Đồng bộ chiêu theo phẩm wiki (skillsByQuality)
      if (tpl && typeof NLDatabase !== "undefined" && NLDatabase.resolveSkillId) {
        h.skillId = NLDatabase.resolveSkillId(tpl, h.quality || tpl.quality);
      }
      var sk = typeof NLDatabase !== "undefined" ? NLDatabase.getSkill(h.skillId) : null;
      var qMeta =
        typeof NLDatabase !== "undefined" ? NLDatabase.getQuality(h.quality) : null;
      var portrait =
        typeof NLDatabase !== "undefined" && NLDatabase.generalPortraitUrl
          ? NLDatabase.generalPortraitUrl(tpl || h.general_id)
          : null;
      var awaken =
        tpl && typeof NLDatabase !== "undefined" && NLDatabase.awakenInfo
          ? NLDatabase.awakenInfo(tpl, h.quality)
          : null;
      var equip = Object.assign({}, h.equip);
      return {
        id: h.hero_id,
        key: h.general_id,
        generalId: h.general_id,
        name: h.name,
        faction: h.faction || (tpl && tpl.faction) || null,
        troop: h.troop,
        troop2: h.troop2 || (tpl && tpl.troop2) || null,
        activeTroop: h.activeTroop || h.troop || null,
        horseId: h.horseId || equip.horse || null,
        equip: equip,
        quality: h.quality,
        qualityName: qMeta ? qMeta.name : h.quality,
        skillId: h.skillId,
        skill: sk ? sk.name : h.skillId,
        portraitUrl: portrait,
        canAwaken: !!awaken,
        awakenTo: awaken ? awaken.to : null,
        awakenCost: awaken ? awaken.cost : null,
        tongLinh: h.tongLinh,
        vuLuc: h.vuLuc,
        triLuc: h.triLuc,
        atk: h.vuLuc,
        def: h.tongLinh,
        hp: h.hp,
        maxHp: h.maxHp,
        level: h.level,
        exp: h.exp || 0,
        enhance: h.enhance || 0,
        troops: h.troops,
        status: h.status,
        deployed_slot: h.deployed_slot,
      };
    });

    if (player.deployed_formation) {
      player.formationId = player.deployed_formation.formation_id;
    }
    return player;
  }

  /** Serialize cho save — buildings dạng array theo spec */
  function serialize(player) {
    syncLegacyView(player);
    var copy = JSON.parse(JSON.stringify(player));
    copy.buildings = buildingList(player).map(function (b) {
      return {
        building_id: b.building_id,
        level: b.level,
        upgrade_ends_at: b.upgrade_ends_at,
      };
    });
    delete copy._buildingList;
    delete copy.generals;
    delete copy.silver;
    delete copy.food;
    delete copy.gold;
    delete copy.lastTick;
    delete copy.playerName;
    delete copy.buildingsMap;
    delete copy.formationId;
    return copy;
  }

  function migrate(raw) {
    if (!raw) return null;

    // v3 already
    if (raw.version >= 3 && raw.resources) {
      var p3 = raw;
      if (Array.isArray(raw.buildings)) {
        p3._buildingList = raw.buildings.map(function (b) {
          return {
            building_id: normalizeBuildingId(b.building_id || b.id),
            level: b.level || 0,
            upgrade_ends_at: b.upgrade_ends_at || null,
          };
        });
      } else if (raw._buildingList) {
        p3._buildingList = raw._buildingList;
      } else {
        p3._buildingList = defaultBuildingList();
      }
      p3.buildings = null;
      if (!p3.heroes && p3.generals) {
        p3.heroes = p3.generals.map(function (g) {
          return {
            hero_id: g.id,
            general_id: g.key || g.generalId || g.id,
            name: g.name,
            troop: g.troop,
            quality: g.quality || "white",
            skillId: g.skillId || "basic_strike",
            tongLinh: g.tongLinh != null ? g.tongLinh : g.def,
            vuLuc: g.vuLuc != null ? g.vuLuc : g.atk,
            triLuc: g.triLuc != null ? g.triLuc : Math.round((g.atk || 50) * 0.6),
            hp: g.hp,
            maxHp: g.maxHp || g.hp,
            level: g.level || 1,
            enhance: g.enhance || 0,
            troops: g.troops || 100,
            horseId: g.horseId || null,
            equip: g.equip || {},
          };
        });
      }
      (p3.heroes || []).forEach(function (h) {
        if (!h.equip) h.equip = {};
      });
      ensureInventorySeed(p3);
      return syncLegacyView(p3);
    }

    // legacy flat
    var p = createPlayer(raw.playerName || raw.username || "Thành Chủ", raw.faction || "shu");
    p.resources.silver = Math.floor(raw.silver != null ? raw.silver : p.resources.silver);
    p.resources.food = Math.floor(raw.food != null ? raw.food : p.resources.food);
    p.resources.gem = Math.floor(raw.gold != null ? raw.gold : p.resources.gem);
    p.last_tick_at = raw.lastTick || Date.now();
    p.campaign = raw.campaign || { cleared: {} };
    p.inventory = raw.inventory || [];
    p.world = raw.world || null;
    p.towerFloor = raw.towerFloor || 1;
    p.arenaLeft = raw.arenaLeft != null ? raw.arenaLeft : 3;
    p.day = raw.day || 1;
    p.hour = raw.hour || 0;
    p.prestige = raw.prestige || 0;
    p.souls = raw.souls || 0;
    p.log = Array.isArray(raw.log)
      ? raw.log.map(function (l) {
          return typeof l === "string" ? { msg: l, type: "", t: Date.now() } : l;
        })
      : p.log;

    if (raw.buildings && !Array.isArray(raw.buildings)) {
      Object.keys(raw.buildings).forEach(function (k) {
        var nid = LEGACY_BUILDING_MAP[k] || k;
        var b = ensureBuilding(p, nid);
        b.level = Math.max(b.level, raw.buildings[k] || 0);
      });
    }

    if (raw.generals && raw.generals.length) {
      p.heroes = raw.generals.map(function (g) {
        return {
          hero_id: g.id,
          general_id: g.key || g.generalId || g.id,
          name: g.name,
          troop: g.troop,
          quality: g.quality || "white",
          skillId: g.skillId || "basic_strike",
          tongLinh: g.tongLinh != null ? g.tongLinh : g.def,
          vuLuc: g.vuLuc != null ? g.vuLuc : g.atk,
          triLuc: g.triLuc != null ? g.triLuc : Math.round((g.atk || 50) * 0.6),
          hp: g.hp,
          maxHp: g.maxHp || g.hp,
          level: g.level || 1,
          enhance: g.enhance || 0,
          troops: g.troops || 100,
          horseId: g.horseId || null,
          equip: g.equip || {},
        };
      });
      p.deployed_formation.slots = p.heroes.slice(0, 3).map(function (h, i) {
        return { slot: i + 1, hero_id: h.hero_id };
      });
    }
    ensureInventorySeed(p);
    return syncLegacyView(p);
  }

  function save(player) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(serialize(player)));
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        var legacy = localStorage.getItem(LEGACY_KEY);
        if (!legacy) return null;
        var migrated = migrate(JSON.parse(legacy));
        save(migrated);
        return migrated;
      }
      return migrate(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  function hasSave() {
    return !!(localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_KEY));
  }

  function toJSON(player) {
    syncLegacyView(player);
    return {
      player_id: player.player_id,
      username: player.username,
      level: player.level,
      resources: {
        silver: Math.floor(player.resources.silver),
        food: Math.floor(player.resources.food),
        gem: Math.floor(player.resources.gem),
      },
      buildings: buildingList(player).map(function (b) {
        return {
          building_id: b.building_id,
          level: b.level,
          upgrade_ends_at: b.upgrade_ends_at,
        };
      }),
      deployed_formation: player.deployed_formation,
    };
  }

  global.NLPlayer = {
    SAVE_KEY: SAVE_KEY,
    createPlayer: createPlayer,
    migrate: migrate,
    save: save,
    load: load,
    hasSave: hasSave,
    syncLegacyView: syncLegacyView,
    serialize: serialize,
    setHeroEquip: setHeroEquip,
    seedStarterEquip: seedStarterEquip,
    buildingList: buildingList,
    getBuilding: getBuilding,
    ensureBuilding: ensureBuilding,
    getBuildingLevel: getBuildingLevel,
    normalizeBuildingId: normalizeBuildingId,
    buildingDef: buildingDef,
    LEGACY_BUILDING_MAP: LEGACY_BUILDING_MAP,
    toJSON: toJSON,
  };
})(window);
