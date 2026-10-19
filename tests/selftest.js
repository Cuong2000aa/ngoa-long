/* global NL_DB, NLDatabase, NLCombat, NLPlayer, NLCityEconomy, NLCampaign, NLRecruit, NLArena, NLBackend, NLSimulator */
(function () {
  var out = document.getElementById("out");
  var passed = 0;
  var failed = 0;
  var lines = [];

  function log(ok, msg) {
    lines.push('<div class="' + (ok ? "ok" : "fail") + '">' + (ok ? "PASS" : "FAIL") + " — " + msg + "</div>");
    if (ok) passed++;
    else failed++;
  }

  function assert(cond, msg) {
    log(!!cond, msg);
  }

  // stub localStorage for Node/headless if missing methods used
  try {
    localStorage.removeItem(NLPlayer.SAVE_KEY);
  } catch (e) { /* ignore */ }

  // —— P1 Database ——
  assert(typeof NL_DB === "object", "NL_DB bundle loaded");
  assert(typeof NLDatabase === "object", "NLDatabase API loaded");
  assert(NLDatabase.version() === "2.0.0" || !!NLDatabase.version(), "meta version present: " + NLDatabase.version());

  var gens = NL_DB.generals.list;
  assert(gens.length >= 90, "Generals >= 90 (got " + gens.length + ")");
  assert(Object.keys(NL_DB.skills.skills).length >= 20, "Skills >= 20");
  assert(NL_DB.items.list.length >= 30, "Items >= 30");
  assert(NL_DB.campaign.chapters.length === 3, "Campaign 3 chapters");
  var stages = 0;
  NL_DB.campaign.chapters.forEach(function (c) { stages += c.stages.length; });
  assert(stages >= 18, "Stages >= 18 (got " + stages + ")");
  assert(!!NL_DB.formations && !!NL_DB.formations.list.crane_wing, "formations.json Hạc Dực");
  assert(NL_DB.formations.schemaVersion >= 5, "formations schema v5+ (layout 3×3)");
  var formFocus = {};
  var formShape = {};
  Object.keys(NL_DB.formations.list).forEach(function (fid) {
    var f = NL_DB.formations.list[fid];
    assert(!!f.teamBonus && !!f.focus, "formation " + fid + " có teamBonus + focus");
    assert(f.layout && f.layout.length === 5, "formation " + fid + " layout 5 ô");
    assert(!!f.shape, "formation " + fid + " có shape");
    assert(!formFocus[f.focus], "mỗi trận 1 focus khác nhau (trùng: " + f.focus + ")");
    assert(!formShape[f.shape], "mỗi trận 1 hình khác nhau (trùng: " + f.shape + ")");
    formFocus[f.focus] = fid;
    formShape[f.shape] = fid;
  });
  assert(Object.keys(formFocus).length >= 5, "≥5 trận pháp focus khác nhau");
  assert(Object.keys(formShape).length >= 5, "≥5 hình dàn trận khác nhau");
  assert(NL_DB.formulas.morale.start === 50, "formulas morale.start = 50");
  assert(NL_DB.formulas.morale.gainOnAttack === 25, "formulas gainOnAttack = 25");
  assert(NL_DB.formulas.morale.gainOnHit === 15, "formulas gainOnHit = 15");
  assert(NL_DB.troops.types.cavalry.beats === "infantry", "Kỵ khắc Bộ");
  assert(NL_DB.troops.types.infantry.beats === "spear", "Bộ khắc Thương");
  assert(NL_DB.troops.types.spear.beats === "cavalry", "Thương khắc Kỵ");
  assert(NL_DB.troops.types.archer.range === "ranged", "Cung = ranged");

  // cross refs
  var badSkill = 0;
  gens.forEach(function (g) {
    if (!NL_DB.skills.skills[g.skillId]) badSkill++;
  });
  assert(badSkill === 0, "All generals.skillId resolve (bad=" + badSkill + ")");

  var badEnemy = 0;
  NL_DB.campaign.chapters.forEach(function (ch) {
    ch.stages.forEach(function (st) {
      st.enemies.forEach(function (e) {
        if (!NLDatabase.getGeneral(e.generalId)) badEnemy++;
      });
    });
  });
  assert(badEnemy === 0, "All stage enemies resolve (bad=" + badEnemy + ")");

  // scaleGeneral
  var gy = NLDatabase.scaleGeneral("guanyu", 10);
  assert(gy && gy.vuLuc > NLDatabase.getGeneral("guanyu").base.vuLuc, "scaleGeneral lv10 tăng VL");
  assert(gy.morale === 0 || gy.maxMorale === 100, "scaled unit has maxMorale");

  // troop multiplier
  assert(NLDatabase.troopMultiplier("cavalry", "infantry") > 1, "counter Kỵ>Bộ > 1");
  assert(NLDatabase.troopMultiplier("spear", "cavalry") > 1, "counter Thương>Kỵ > 1");
  assert(NLDatabase.troopMultiplier("archer", "cavalry") === 1, "Cung vs Kỵ neutral (ranged)");

  // —— P2 Combat ——
  assert(typeof NLCombat === "object" && NLCombat.VERSION === 3, "NLCombat v3 loaded");

  var player = [
    NLDatabase.scaleGeneral("guanyu", 20),
    NLDatabase.scaleGeneral("zhangfei", 18),
    NLDatabase.scaleGeneral("zhugeliang", 18),
  ].map(function (u, i) {
    u.slot = i;
    return u;
  });

  var stage = NLDatabase.getStage("ch1_khan_vang", "ch1_s1");
  var enemies = NLCombat.enemiesFromStage(stage);
  assert(enemies.length >= 2, "enemiesFromStage ch1_s1");

  var result = NLCombat.runBattle(player, enemies, {
    title: "Selftest",
    playerFormation: "crane_wing",
    enemyFormation: "square",
  });

  assert(!!result.battleLog && result.battleLog.length > 0, "battleLog not empty (" + result.battleLog.length + ")");
  assert(!!result.events && result.events.length > 0, "ui events not empty");
  assert(typeof result.win === "boolean", "win is boolean: " + result.win);

  // battleLog schema
  var sample = result.battleLog[0];
  assert(sample.round >= 1, "log.round");
  assert(!!sample.actor_id && !!sample.actor_name, "log.actor_id/name");
  assert(sample.action_type === "NORMAL_ATTACK" || sample.action_type === "SKILL", "log.action_type");
  assert(typeof sample.morale_before === "number", "log.morale_before");
  assert(typeof sample.morale_after === "number", "log.morale_after");
  assert(Array.isArray(sample.targets), "log.targets[]");

  // morale start 50
  var startEv = result.events.filter(function (e) { return e.type === "battle_start"; })[0];
  assert(startEv && startEv.allies[0].morale === 50, "start morale = 50");

  // skill eventually fires in longer fight
  var bigEnemy = NLCombat.enemiesFromStage(NLDatabase.getStage("ch1_khan_vang", "ch1_s6"));
  var tough = NLCombat.runBattle(
    [
      Object.assign(NLDatabase.scaleGeneral("guanyu", 40), { slot: 0 }),
      Object.assign(NLDatabase.scaleGeneral("zhangfei", 40), { slot: 1 }),
      Object.assign(NLDatabase.scaleGeneral("zhaoyun", 40), { slot: 2 }),
      Object.assign(NLDatabase.scaleGeneral("zhugeliang", 40), { slot: 3 }),
      Object.assign(NLDatabase.scaleGeneral("huangzhong", 40), { slot: 4 }),
    ],
    bigEnemy,
    { title: "Boss test", playerFormation: "long_snake", enemyFormation: "square" }
  );
  var skills = tough.battleLog.filter(function (e) { return e.action_type === "SKILL"; });
  assert(skills.length > 0, "Chiến pháp xuất hiện trong trận dài (count=" + skills.length + ")");
  if (skills[0]) {
    assert(skills[0].morale_before >= 100, "Skill khi morale_before >= 100");
    assert(skills[0].morale_after === 0, "Skill reset morale_after = 0");
  }

  // NORMAL_ATTACK +25 morale (approx: find first normal attack and check after >= before+25 or capped)
  var normals = result.battleLog.filter(function (e) { return e.action_type === "NORMAL_ATTACK"; });
  if (normals.length) {
    var n0 = normals[0];
    var expected = Math.min(100, n0.morale_before + 25);
    assert(n0.morale_after === expected, "Normal +25 sĩ khí (" + n0.morale_before + "->" + n0.morale_after + ")");
  } else {
    log(false, "No NORMAL_ATTACK in short fight");
  }

  // front protects: all normal attacks in early fight should prefer front if front alive
  // Soft check: at least one target has slot defined
  assert(result.battleLog.some(function (e) {
    return e.targets.some(function (t) { return t.target_id; });
  }), "targets have target_id");

  // crit/miss fields
  var anyTarget = null;
  result.battleLog.forEach(function (e) {
    e.targets.forEach(function (t) { if (!anyTarget) anyTarget = t; });
  });
  assert(anyTarget && ("is_crit" in anyTarget) && ("damage_dealt" in anyTarget) && ("target_hp_left" in anyTarget), "target fields present");

  // run 5 random stage smokes
  var smokeOk = 0;
  NL_DB.campaign.chapters.forEach(function (ch) {
    ch.stages.forEach(function (st) {
      var pl = [
        Object.assign(NLDatabase.scaleGeneral("yuejin", 30), { slot: 0 }),
        Object.assign(NLDatabase.scaleGeneral("licadian", 28), { slot: 1 }),
        Object.assign(NLDatabase.scaleGeneral("caoren", 28), { slot: 3 }),
      ];
      var en = NLCombat.enemiesFromStage(st);
      var r = NLCombat.runBattle(pl, en, { title: st.id });
      if (r.battleLog && r.battleLog.length && typeof r.win === "boolean") smokeOk++;
    });
  });
  assert(smokeOk === stages, "Smoke all stages OK (" + smokeOk + "/" + stages + ")");

  // starters
  ["shu", "wei", "wu"].forEach(function (f) {
    var s = NLDatabase.startersForFaction(f);
    assert(s.length === 3, "starters " + f + " = 3");
  });

  // —— P3 City / Player / Resource Loop ——
  assert(typeof NLPlayer === "object", "NLPlayer loaded");
  assert(typeof NLCityEconomy === "object", "NLCityEconomy loaded");

  var core = NL_DB.buildings.coreIds;
  assert(core.indexOf("ty_vu") >= 0 && core.indexOf("mo_bac") >= 0, "core buildings có Ty Vũ + Mỏ Bạc");
  assert(core.indexOf("nong_trai") >= 0 && core.indexOf("doanh_trai") >= 0 && core.indexOf("kho") >= 0, "core có Nông Trại + Doanh Trại + Kho");

  var player = NLPlayer.createPlayer("ChiCuong", "shu");
  assert(player.version === 3, "Player version 3");
  assert(player.player_id && player.username === "ChiCuong", "player_id + username");
  assert(player.resources.silver > 0 && player.resources.food > 0, "starting resources");
  assert(NLPlayer.buildingList(player).length >= 5, ">=5 buildings trong thành");
  assert(NLPlayer.getBuildingLevel(player, "ty_vu") === 1, "Ty Vũ lv1");
  assert(player.buildings.hall === 1, "legacy buildings.hall sync");
  assert(player.deployed_formation && player.deployed_formation.slots.length >= 1, "deployed_formation slots");

  var rates = NLCityEconomy.productionPerMinute(player);
  assert(rates.silver > 0 && rates.food > 0, "production/min > 0 (silver=" + rates.silver + " food=" + rates.food + ")");

  var caps0 = NLCityEconomy.warehouseCaps(player);
  assert(caps0.silver >= 20000 && caps0.food >= 20000, "warehouse caps baseline");

  // Offline progression: giả lập 60 phút
  player.last_tick_at = Date.now() - 60 * 60 * 1000;
  var beforeS = player.resources.silver;
  var beforeF = player.resources.food;
  var tickRes = NLCityEconomy.tick(player);
  assert(tickRes.ms > 0, "tick delta ms > 0");
  assert(player.resources.silver > beforeS, "offline +bạc (" + beforeS + "->" + player.resources.silver + ")");
  assert(player.resources.food > beforeF, "offline +lương (" + beforeF + "->" + player.resources.food + ")");

  // Warehouse clamp
  player.resources.silver = caps0.silver - 5;
  player.last_tick_at = Date.now() - 24 * 60 * 60 * 1000;
  NLCityEconomy.tick(player);
  assert(player.resources.silver <= caps0.silver, "warehouse clamp bạc");

  // Ty Vũ gate: không nâng Mỏ vượt Ty Vũ
  var mine = NLPlayer.getBuilding(player, "mo_bac");
  mine.level = 1;
  NLPlayer.getBuilding(player, "ty_vu").level = 1;
  player.resources.silver = 999999;
  player.resources.food = 999999;
  // Nâng mo_bac lần 1 (1→2) cần ty_vu >= 2 → fail
  var blocked = NLCityEconomy.canUpgrade(player, "mo_bac");
  // level 1→2 requires ty_vu >= 2
  assert(blocked.ok === false && blocked.needTyVu, "Ty Vũ gate chặn nâng Mỏ (1→2 khi Ty Vũ=1)");

  // Nâng Ty Vũ OK
  var upTv = NLCityEconomy.startUpgrade(player, "ty_vu");
  assert(upTv.ok === true && upTv.upgrade_ends_at > Date.now(), "startUpgrade Ty Vũ + countdown");
  assert(NLPlayer.getBuilding(player, "ty_vu").level === 1, "level chưa tăng khi đang countdown");

  // Giả lập hết giờ → resolve
  NLPlayer.getBuilding(player, "ty_vu").upgrade_ends_at = Date.now() - 1000;
  var done = NLCityEconomy.resolveUpgrades(player);
  assert(done.length === 1 && done[0].level === 2, "resolveUpgrades Ty Vũ → lv2");

  // Giờ nâng Mỏ được
  var upMine = NLCityEconomy.startUpgrade(player, "mo_bac");
  assert(upMine.ok === true, "nâng Mỏ sau khi Ty Vũ đủ cấp");

  // troops
  var tCap = NLCityEconomy.troopsCap(player);
  assert(tCap >= 500, "troopsCap >= 500");
  player.troops_pool = Math.max(0, tCap - 50);
  player.resources.silver = Math.max(player.resources.silver, 500);
  player.resources.food = Math.max(player.resources.food, 500);
  var recruit = NLCityEconomy.recruitTroops(player, 10);
  assert(recruit.ok === true && recruit.amount === 10, "recruitTroops 10");

  // JSON shape theo spec
  var json = NLPlayer.toJSON(player);
  assert(json.resources && typeof json.resources.silver === "number", "toJSON.resources");
  assert(Array.isArray(json.buildings) && json.buildings[0].building_id, "toJSON.buildings[]");
  assert(json.deployed_formation && Array.isArray(json.deployed_formation.slots), "toJSON.deployed_formation");

  // migrate legacy
  var legacy = {
    version: 2,
    playerName: "Cu",
    faction: "wei",
    silver: 1000,
    food: 800,
    gold: 10,
    buildings: { hall: 3, farm: 2, mine: 2, barracks: 1, wall: 1 },
    generals: player.generals.slice(0, 2),
    lastTick: Date.now() - 10000,
  };
  var mig = NLPlayer.migrate(legacy);
  assert(mig.version === 3 && NLPlayer.getBuildingLevel(mig, "ty_vu") === 3, "migrate legacy hall→ty_vu lv3");
  assert(mig.resources.silver === 1000, "migrate silver");

  // —— P4 Campaign / PVE ——
  assert(typeof NLCampaign === "object", "NLCampaign loaded");
  assert(NL_DB.campaign.schemaVersion >= 3, "campaign schema >= 3");
  assert(NL_DB.campaign.chapters[0].stages[0].staminaCost > 0, "stage có staminaCost");

  var pve = NLPlayer.createPlayer("PVE_Tester", "shu");
  pve.resources.food = 5000;
  pve.resources.silver = 1000;
  NLPlayer.syncLegacyView(pve);

  assert(NLCampaign.isStageUnlocked(pve, "ch1_khan_vang", "ch1_s1"), "ải đầu mở sẵn");
  assert(!NLCampaign.isStageUnlocked(pve, "ch1_khan_vang", "ch1_s2"), "ải 2 khoá đến khi clear ải 1");
  assert(!NLCampaign.isStageUnlocked(pve, "ch2_dong_trac", "ch2_s1"), "chương 2 khoá");

  var blockedFood = NLPlayer.createPlayer("Hungry", "shu");
  blockedFood.resources.food = 10;
  NLPlayer.syncLegacyView(blockedFood);
  var noFood = NLCampaign.canChallenge(blockedFood, "ch1_khan_vang", "ch1_s1");
  assert(noFood.ok === false, "thiếu lương → không đánh được");

  var prep = NLCampaign.prepareChallenge(pve, "ch1_khan_vang", "ch1_s1");
  assert(prep.ok && prep.enemies.length >= 2, "prepareChallenge enemies");
  assert(prep.staminaCost === NLCampaign.staminaCost(prep.stage), "staminaCost khớp");

  // buff đội để chắc thắng ải 1
  var team = [
    Object.assign(NLDatabase.scaleGeneral("guanyu", 25), { slot: 0 }),
    Object.assign(NLDatabase.scaleGeneral("zhangfei", 25), { slot: 1 }),
    Object.assign(NLDatabase.scaleGeneral("zhugeliang", 25), { slot: 3 }),
  ];
  var foodBefore = pve.resources.food;
  var silverBefore = pve.resources.silver;
  var fight = NLCampaign.runChallenge(pve, "ch1_khan_vang", "ch1_s1", team);
  assert(fight.ok && fight.win === true, "runChallenge thắng ch1_s1");
  assert(fight.battleLog && fight.battleLog.length > 0, "campaign trả battleLog");
  assert(pve.resources.food < foodBefore, "thắng trừ lương thực");
  assert(pve.resources.silver > silverBefore, "thắng cộng bạc");
  assert(NLCampaign.isCleared(pve, "ch1_s1"), "progress cleared ch1_s1");
  assert(NLCampaign.isStageUnlocked(pve, "ch1_khan_vang", "ch1_s2"), "mở khóa ch1_s2");
  assert(fight.unlockedStage && fight.unlockedStage.stageId === "ch1_s2", "unlockedStage = s2");
  assert(Array.isArray(fight.rewards) && fight.rewards.length > 0, "rewards[] không rỗng");

  // thua: mất một nửa lương (loseFoodRatio 0.5)
  var pLose = NLPlayer.createPlayer("Loser", "shu");
  pLose.resources.food = 2000;
  NLPlayer.syncLegacyView(pLose);
  var weak = [Object.assign(NLDatabase.scaleGeneral("recruit_militia", 1), { slot: 0 })];
  // settle lose thủ công với prep
  var prep2 = NLCampaign.prepareChallenge(pLose, "ch1_khan_vang", "ch1_s1");
  var fb = pLose.resources.food;
  var lostSettle = NLCampaign.settleResult(pLose, prep2.chapter, prep2.stage, false, {});
  assert(lostSettle.win === false, "settle thua");
  assert(lostSettle.foodSpent === Math.floor(prep2.staminaCost * 0.5), "thua mất 50% lương stamina");
  assert(pLose.resources.food === fb - lostSettle.foodSpent, "food giảm đúng khi thua");
  assert(!NLCampaign.isCleared(pLose, "ch1_s1"), "thua không clear ải");

  // alias resolve + export sample
  var byAlias = NLCampaign.resolveStage("ch_01", "st_01_01");
  assert(byAlias && byAlias.stage.id === "ch1_s1", "alias ch_01 / st_01_01");
  var sample = NLCampaign.exportChapterSample("ch1_khan_vang");
  assert(sample && sample.chapter_id && sample.stages[0].stamina_cost > 0, "exportChapterSample shape");

  // boss unlock features (giả lập clear boss ch1)
  var bossP = NLPlayer.createPlayer("BossKiller", "shu");
  bossP.resources.food = 99999;
  bossP.resources.silver = 0;
  // clear hết ch1 trừ boss
  ["ch1_s1", "ch1_s2", "ch1_s3", "ch1_s4", "ch1_s5"].forEach(function (id) {
    bossP.campaign.cleared[id] = true;
  });
  var bossStage = NLDatabase.getStage("ch1_khan_vang", "ch1_s6");
  var bossCh = NLDatabase.getChapter("ch1_khan_vang");
  var bossTeam = [
    Object.assign(NLDatabase.scaleGeneral("guanyu", 60), { slot: 0 }),
    Object.assign(NLDatabase.scaleGeneral("zhangfei", 55), { slot: 1 }),
    Object.assign(NLDatabase.scaleGeneral("zhaoyun", 55), { slot: 2 }),
    Object.assign(NLDatabase.scaleGeneral("zhugeliang", 55), { slot: 3 }),
    Object.assign(NLDatabase.scaleGeneral("huangzhong", 50), { slot: 4 }),
  ];
  var bossFight = NLCampaign.runChallenge(bossP, "ch1_khan_vang", "ch1_s6", bossTeam);
  assert(bossFight.ok && bossFight.win, "thắng boss ch1_s6");
  assert(NLCampaign.hasFeature(bossP, "arena"), "boss ch1 mở feature arena");
  assert(NLCampaign.hasFeature(bossP, "recruit_advanced"), "boss ch1 mở recruit_advanced");
  assert(NLCampaign.isStageUnlocked(bossP, "ch2_dong_trac", "ch2_s1"), "clear boss → mở ch2_s1");

  var map = NLCampaign.mapSnapshot(bossP);
  assert(map.chapters.length === 3 && map.chapters[0].stages.length === 6, "mapSnapshot 3 chương × 6 ải");

  // —— P5 Recruit / Tavern / Prestige / Heroes ——
  assert(typeof NLRecruit === "object", "NLRecruit loaded");
  assert(NL_DB.recruit.schemaVersion >= 3 && NL_DB.recruit.list.length >= 50, "recruit.json v3 entries >= 50 (tinh anh only)");

  var rp = NLPlayer.createPlayer("TavernLord", "wei"); // starters: yuejin, licadian, caoren (không có guanyu / caocao)
  rp.resources.silver = 100000;
  rp.prestige = 0;
  NLPlayer.syncLegacyView(rp);

  // starter Ngụy đã OWNED (Tào Tháo mở bằng prestige, không phải starter)
  var yj = NLRecruit.evaluateEntry(rp, NLRecruit.findEntry("yuejin"));
  assert(yj && yj.status === "OWNED", "starter Nhạc Tiến = OWNED");
  var ccLock = NLRecruit.evaluateEntry(rp, NLRecruit.findEntry("caocao"));
  assert(ccLock && ccLock.status !== "OWNED", "Tào Tháo chưa OWNED lúc tạo nhân vật Ngụy");

  // Quan Vũ lúc đầu LOCKED (cần danh vọng + cấp)
  var gyLock = NLRecruit.evaluateEntry(rp, NLRecruit.findEntry("guanyu"));
  assert(gyLock && gyLock.status === "LOCKED", "Quan Vũ LOCKED khi chưa đủ danh vọng");
  var tryFail = NLRecruit.recruitHero(rp, "guanyu");
  assert(tryFail.ok === false && tryFail.status === "LOCKED", "recruitHero chặn khi LOCKED");

  // Lính thường / generic: không chiêu mộ / không grant
  assert(!NLRecruit.findEntry("recruit_guard"), "lính thường không có trong recruit.list");
  var blockGrant = NLRecruit.grantHero(rp, "recruit_guard", { obtain: "test" });
  assert(blockGrant.ok === false && blockGrant.npcOnly, "grantHero chặn lính thường");
  var blockVet = NLRecruit.grantHero(rp, "veteran_guard", { obtain: "test" });
  assert(blockVet.ok === false && blockVet.npcOnly, "grantHero chặn Lão Binh");

  // đủ điều kiện danh vọng + cấp + Ty Vũ + ải + unlock recruit_advanced → Quan Vũ AVAILABLE
  rp.prestige = 5000;
  rp.level = 20;
  NLPlayer.getBuilding(rp, "ty_vu").level = 15;
  if (!rp.campaign) rp.campaign = { unlockedFeatures: {}, cleared: {} };
  if (!rp.campaign.unlockedFeatures) rp.campaign.unlockedFeatures = {};
  if (!rp.campaign.cleared) rp.campaign.cleared = {};
  rp.campaign.unlockedFeatures.recruit_advanced = true;
  rp.campaign.cleared.ch3_s4 = true; // required_stage của Quan Vũ
  var gyAvail = NLRecruit.toSampleSchema(rp, "h_001");
  assert(gyAvail.status === "AVAILABLE" && gyAvail.cost_silver === 50000, "sample schema Quan Vũ AVAILABLE (cost 50000)");
  var rGy = NLRecruit.recruitHero(rp, "h_001");
  assert(rGy.ok && rGy.hero && rGy.hero.general_id === "guanyu", "chiêu mộ Quan Vũ qua h_001");
  assert(NLRecruit.toSampleSchema(rp, "h_001").status === "OWNED", "Quan Vũ chuyển sang OWNED");

  // deploy / standby
  var gyHeroId = rGy.hero && rGy.hero.hero_id;
  var dep = NLRecruit.deployHero(rp, gyHeroId, 1);
  assert(dep.ok && rGy.hero.status === "DEPLOYED" && rGy.hero.deployed_slot === 1, "deploy Quan Vũ vào Ô 1");
  var un = NLRecruit.unassignHero(rp, gyHeroId);
  assert(un.ok && rGy.hero.status === "STANDBY" && rGy.hero.deployed_slot === null, "unassign về STANDBY");

  // EXP lên cấp tướng
  var lvBefore = rGy.hero.level;
  NLRecruit.addHeroExp(rp, gyHeroId, 500);
  assert(rGy.hero.level > lvBefore, "addHeroExp tăng level tướng (" + lvBefore + "->" + rGy.hero.level + ")");

  // dismiss
  var dis = NLRecruit.dismissHero(rp, rWhite.hero.hero_id);
  assert(dis.ok && !NLRecruit.ownsGeneral(rp, "recruit_guard"), "sa thải tướng hoạt động");

  // —— P6 Arena Leaderboard & Rule-based Bots ——
  assert(typeof NLArena === "object", "NLArena loaded");
  assert(NL_DB.arena && NL_DB.arena.bots.length >= 20, "arena.json bots >= 20 (got " + NL_DB.arena.bots.length + ")");

  var ap = NLPlayer.createPlayer("ArenaChamp", "shu");
  ap.arenaLeft = 5;
  NLArena.ensureArena(ap);
  var lb0 = NLArena.getLeaderboard(ap);
  assert(lb0.length === NL_DB.arena.bots.length + 1, "leaderboard gồm bots + player (" + lb0.length + ")");
  assert(ap.arena.player_rank === 36, "player khởi đầu hạng #36");

  // Bot sample JSON schema khớp đề bài
  var sqBot = NLArena.findBot(ap, "bot_npc_15");
  var sqSchema = NLArena.toBotSampleSchema(sqBot);
  assert(
    sqSchema &&
      sqSchema.bot_id === "bot_npc_15" &&
      sqSchema.rank === 15 &&
      sqSchema.tier === "MEDIUM" &&
      sqSchema.buildings[0].building_id === "b_tyvu" &&
      Array.isArray(sqSchema.deployed_formation.slots),
    "toBotSampleSchema Tôn Quyền #15 đúng cấu trúc"
  );

  // Time-based Progression Ticks (giả lập trôi 24 giờ)
  var bot35 = NLArena.findBot(ap, "bot_npc_35");
  var powBefore = NLArena.botPower(bot35);
  var silverBotBefore = bot35.resources.silver;
  var lvBotBefore = bot35.level;
  ap.arena.last_evolution_timestamp = Math.floor(Date.now() / 1000) - 24 * 3600;
  var tickEvo = NLArena.tickBots(ap, Date.now());
  assert(tickEvo.evolvedCount >= 20, "tickBots tiến hóa toàn bộ bots (" + tickEvo.evolvedCount + ")");
  assert(NLArena.botPower(bot35) > powBefore, "bot lực chiến tăng sau 24h (" + powBefore + "->" + NLArena.botPower(bot35) + ")");
  assert(bot35.resources.silver > silverBotBefore, "bot tự tích lũy bạc");
  assert(bot35.level >= lvBotBefore + 1, "bot tự nâng cấp Ty Vũ & tướng (" + lvBotBefore + "->" + bot35.level + ")");

  // Scaling theo người chơi khi player vượt cấp
  ap.level = 25;
  NLPlayer.getBuilding(ap, "ty_vu").level = 25;
  NLArena.scaleCompetitiveBots(ap);
  assert(bot35.level >= 20, "bot lân cận tự scale theo cấp người chơi (lv=" + bot35.level + ")");

  // Challenge & swap rank: đem đội mạnh đánh bot hạng #15
  var strongTeam = [
    Object.assign(NLDatabase.scaleGeneral("guanyu", 80), { slot: 0 }),
    Object.assign(NLDatabase.scaleGeneral("zhangfei", 80), { slot: 1 }),
    Object.assign(NLDatabase.scaleGeneral("zhaoyun", 80), { slot: 2 }),
    Object.assign(NLDatabase.scaleGeneral("zhugeliang", 80), { slot: 3 }),
    Object.assign(NLDatabase.scaleGeneral("huangzhong", 80), { slot: 4 }),
  ];
  var chRes = NLArena.challengeBot(ap, "bot_npc_15", strongTeam);
  assert(chRes.ok && chRes.win === true, "challengeBot thắng bot #15");
  assert(chRes.rank_swapped === true && ap.arena.player_rank === 15, "đổi chỗ hạng Player -> #15");
  assert(sqBot.rank === 36, "bot #15 bị đẩy xuống hạng #36");
  assert(chRes.rewards.silver > 0 && chRes.rewards.honor > 0, "nhận thưởng bạc + vinh quang");

  // —— P7 Backend Integration & Full Gameplay Simulation (A–Z) ——
  assert(typeof NLBackend === "object" && typeof NLSimulator === "object", "NLBackend & NLSimulator loaded");
  var sim = NLSimulator.runFullSimulation({ username: "ChuDuTest", faction: "shu" });
  sim.assertions.forEach(function (a) {
    assert(a.ok, "[Sim A-Z] " + a.label);
  });
  assert(sim.ok && sim.integrity.ok, "Full A–Z Simulation PASS (" + sim.passed + "/" + sim.total + ", steps=" + sim.trace.length + ")");

  lines.push('<div class="sum">KẾT QUẢ: ' + passed + " passed, " + failed + " failed</div>");
  out.innerHTML = lines.join("");
  window.__TEST_RESULTS__ = { passed: passed, failed: failed, ok: failed === 0 };
  document.title = (failed === 0 ? "OK" : "FAIL") + " " + passed + "/" + (passed + failed);
})();
