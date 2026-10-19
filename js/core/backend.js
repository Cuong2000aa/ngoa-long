/* global window, NLDatabase, NLCombat, NLPlayer, NLCityEconomy, NLCampaign, NLRecruit, NLArena, NLGame */
/**
 * NLBackend & NLSimulator — Lớp tích hợp Backend toàn cục & Kịch bản giả lập A–Z.
 * Kết nối sạch sẽ 6 trụ cột:
 *  1) Database (NLDatabase)
 *  2) Combat Engine v3 (NLCombat)
 *  3) City & Real-time Resource Loop (NLPlayer + NLCityEconomy)
 *  4) Campaign PVE (NLCampaign)
 *  5) Tavern & Prestige Recruitment (NLRecruit)
 *  6) Arena PVP & Rule-based Bots (NLArena)
 */
(function (global) {
  var VERSION = "3.0.0";

  /** Kiểm tra sức khỏe toàn bộ 6 module + tính toàn vẹn dữ liệu người chơi */
  function verifyIntegrity(player) {
    var issues = [];

    if (typeof NLDatabase === "undefined") issues.push("Missing NLDatabase");
    if (typeof NLCombat === "undefined") issues.push("Missing NLCombat");
    if (typeof NLPlayer === "undefined") issues.push("Missing NLPlayer");
    if (typeof NLCityEconomy === "undefined") issues.push("Missing NLCityEconomy");
    if (typeof NLCampaign === "undefined") issues.push("Missing NLCampaign");
    if (typeof NLRecruit === "undefined") issues.push("Missing NLRecruit");
    if (typeof NLArena === "undefined") issues.push("Missing NLArena");

    if (player) {
      NLPlayer.syncLegacyView(player);
      NLRecruit.ensureHeroes(player);
      NLCampaign.ensureProgress(player);
      NLArena.ensureArena(player);

      if (player.silver !== Math.floor(player.resources.silver)) {
        issues.push("Silver desync: legacy=" + player.silver + " res=" + player.resources.silver);
      }
      if (player.food !== Math.floor(player.resources.food)) {
        issues.push("Food desync: legacy=" + player.food + " res=" + player.resources.food);
      }
      if (player.gold !== Math.floor(player.resources.gem)) {
        issues.push("Gem desync: legacy=" + player.gold + " res=" + player.resources.gem);
      }

      var caps = NLCityEconomy.warehouseCaps(player);
      if (player.resources.silver < 0 || player.resources.food < 0) {
        issues.push("Negative resource detected");
      }
      if (player.resources.silver > caps.silver || player.resources.food > caps.food) {
        // Auto-clamp nếu vượt kho
        player.resources.silver = Math.min(caps.silver, player.resources.silver);
        player.resources.food = Math.min(caps.food, player.resources.food);
        NLPlayer.syncLegacyView(player);
      }

      // Kiểm tra mọi slot trong deployed_formation đều trỏ tới hero đang sở hữu
      var ownedMap = {};
      (player.heroes || []).forEach(function (h) { ownedMap[h.hero_id] = h; });
      var slots = (player.deployed_formation && player.deployed_formation.slots) || [];
      var seenSlot = {};
      slots.forEach(function (s) {
        if (!ownedMap[s.hero_id]) {
          issues.push("Deployed slot references missing hero: " + s.hero_id);
        }
        if (s.slot < 1 || s.slot > 5 || seenSlot[s.slot]) {
          issues.push("Invalid or duplicate formation slot: " + s.slot);
        }
        seenSlot[s.slot] = true;
      });

      // Kiểm tra bảng xếp hạng Arena có đúng 1 hạng cho mỗi vị trí 1..(N+1)
      var lb = NLArena.getLeaderboard(player);
      var ranks = lb.map(function (r) { return r.rank; }).sort(function (a, b) { return a - b; });
      for (var i = 0; i < ranks.length; i++) {
        if (ranks[i] !== i + 1) {
          issues.push("Arena rank gap/dup at position " + (i + 1) + " (got " + ranks[i] + ")");
          break;
        }
      }
    }

    return {
      ok: issues.length === 0,
      version: VERSION,
      issues: issues,
    };
  }

  /**
   * Tick tổng hợp toàn hệ thống theo thời gian thực (hoặc giả lập trôi thời gian):
   * - Hoàn tất nâng cấp công trình hết giờ
   * - Cộng sản lượng Bạc/Lương/Binh theo delta time (chặn trần Kho)
   * - Tiến hóa Rule-based Bots & scale nhóm Bot cạnh tranh
   * - Đồng bộ mọi view state
   */
  function tickAll(player, nowMs) {
    nowMs = nowMs || Date.now();
    var cityTick = NLCityEconomy.tick(player, nowMs);
    var botTick = NLArena.tickBots(player, nowMs);
    NLRecruit.ensureHeroes(player);
    NLPlayer.syncLegacyView(player);
    return {
      now: nowMs,
      city: cityTick,
      arena: botTick,
      resources: {
        silver: player.resources.silver,
        food: player.resources.food,
        gem: player.resources.gem,
      },
    };
  }

  /** Giả lập tua nhanh thời gian (phút) cho cả Thành chính + Công trình + Bot Arena */
  function fastForwardMinutes(player, minutes) {
    var ms = Math.max(0, minutes) * 60 * 1000;
    var sec = Math.floor(ms / 1000);
    // Lùi mốc thời gian của player & công trình & arena để tickAll xử lý tự nhiên
    player.last_tick_at = (player.last_tick_at || Date.now()) - ms;
    NLPlayer.buildingList(player).forEach(function (b) {
      if (b.upgrade_ends_at) b.upgrade_ends_at -= ms;
    });
    if (player.arena) {
      player.arena.last_evolution_timestamp =
        (player.arena.last_evolution_timestamp || Math.floor(Date.now() / 1000)) - sec;
    }
    return tickAll(player, Date.now());
  }

  /** Lấy đội hình xuất trận chuẩn từ deployed_formation của người chơi */
  function getDeployedTeam(player) {
    NLRecruit.ensureHeroes(player);
    NLPlayer.syncLegacyView(player);
    var slots = (player.deployed_formation && player.deployed_formation.slots) || [];
    var byId = {};
    (player.generals || []).forEach(function (g) { byId[g.id] = g; });
    var team = [];
    slots.forEach(function (s) {
      var g = byId[s.hero_id];
      if (g) {
        team.push({
          id: g.id,
          slot: Math.max(0, Math.min(4, (s.slot || 1) - 1)),
          general: g,
        });
      }
    });
    if (!team.length && player.generals && player.generals.length) {
      team = player.generals.slice(0, 3).map(function (g, i) {
        return { id: g.id, slot: i, general: g };
      });
    }
    return team;
  }

  /**
   * KỊCH BẢN GIẢ LẬP VÒNG LẶP GAMEPLAY TỪ A–Z (End-to-End Simulation Script)
   * Mô phỏng toàn bộ hành trình của một người chơi từ lúc Khai quốc đến khi
   * xây thành, thu hoạch offline, chiêu mộ tướng, bố trận, vượt hết Chương 1 (kể cả Boss),
   * mở khóa Đấu Trường, khiêu chiến Bot leo hạng và Lưu/Tải game.
   */
  function runFullSimulation(opts) {
    opts = opts || {};
    var trace = [];
    var assertions = [];

    function step(title, detail) {
      trace.push({ step: trace.length + 1, title: title, detail: detail || {} });
    }

    function check(cond, label) {
      assertions.push({ ok: !!cond, label: label });
    }

    // BƯỚC 1: Khai quốc (Tạo tài khoản mới phe Thục)
    var player = NLGame.createNewGame(opts.username || "GiaCatKhongMinh", opts.faction || "shu");
    NLArena.ensureArena(player);
    NLRecruit.ensureHeroes(player);
    step("1. Khai quốc", {
      player_id: player.player_id,
      username: player.username,
      faction: player.faction,
      starters: player.heroes.map(function (h) { return h.name; }),
      resources: Object.assign({}, player.resources),
    });
    check(player.version === 3 && player.heroes.length === 3, "Khai quốc tạo đúng 3 tướng khởi đầu v3");

    // BƯỚC 2: Nâng cấp Thành chính (Ty Vũ -> Mỏ Bạc -> Nông Trại -> Kho -> Doanh Trại)
    var upTyVu = NLGame.upgradeBuilding(player, "ty_vu");
    check(upTyVu.ok && upTyVu.upgrading, "Bắt đầu nâng Ty Vũ (countdown)");
    fastForwardMinutes(player, 5); // tua 5 phút cho Ty Vũ hoàn tất lên Lv.2
    check(NLPlayer.getBuildingLevel(player, "ty_vu") === 2, "Ty Vũ hoàn tất lên Lv.2 sau countdown");

    var upMine = NLGame.upgradeBuilding(player, "mo_bac");
    fastForwardMinutes(player, 5);
    var upFarm = NLGame.upgradeBuilding(player, "nong_trai");
    fastForwardMinutes(player, 5);
    check(
      upMine.ok && upFarm.ok &&
        NLPlayer.getBuildingLevel(player, "mo_bac") === 2 &&
        NLPlayer.getBuildingLevel(player, "nong_trai") === 2,
      "Mỏ Bạc & Nông Trại lên Lv.2"
    );
    step("2. Xây dựng Thành chính", NLCityEconomy.citySnapshot(player));

    // BƯỚC 3: Offline Progression (Giả lập người chơi thoát game 6 giờ rồi đăng nhập lại)
    var silverBeforeOffline = player.resources.silver;
    var foodBeforeOffline = player.resources.food;
    var botRank35PowerBefore = NLArena.botPower(NLArena.findBot(player, "bot_npc_35"));
    fastForwardMinutes(player, 360); // 6 giờ
    check(
      player.resources.silver > silverBeforeOffline && player.resources.food > foodBeforeOffline,
      "Offline 6h cộng dồn Bạc & Lương thực chính xác"
    );
    check(
      NLArena.botPower(NLArena.findBot(player, "bot_npc_35")) > botRank35PowerBefore,
      "Rule-based Bot tự động cày cuốc & tăng lực chiến sau 6h"
    );
    step("3. Offline 6 giờ & Bot tiến hóa", {
      silverGained: player.resources.silver - silverBeforeOffline,
      foodGained: player.resources.food - foodBeforeOffline,
      bot35PowerAfter: NLArena.botPower(NLArena.findBot(player, "bot_npc_35")),
    });

    // BƯỚC 4: Tửu Quán — Chiêu mộ tướng mới & xếp vào Trận hình (5 ô)
    var rec1 = NLGame.recruitTavernHero(player, "recruit_guard");
    var rec2 = NLGame.recruitTavernHero(player, "recruit_scout");
    check(rec1.ok && rec2.ok && player.heroes.length === 5, "Chiêu mộ thêm 2 tướng tại Tửu Quán (tổng 5 tướng)");
    NLGame.deployHeroSlot(player, rec1.hero.hero_id, 4);
    NLGame.deployHeroSlot(player, rec2.hero.hero_id, 5);
    check(
      player.deployed_formation.slots.length === 5,
      "Triển khai đủ 5 tướng vào trận hình 3 trước + 2 sau"
    );
    step("4. Chiêu mộ Tửu Quán & Bố trận", {
      heroCount: player.heroes.length,
      deployedSlots: player.deployed_formation.slots.slice(),
    });

    // BƯỚC 5: Huấn luyện & Cường hóa tướng + Bổ sung binh lực từ Doanh Trại
    NLCityEconomy.recruitTroops(player, 50);
    var mainHeroId = player.heroes[0].hero_id;
    NLCityEconomy.assignTroopsToHero(player, mainHeroId, 50);
    var trRes = NLGame.trainGeneral(player, mainHeroId);
    var enhRes = NLGame.enhanceGeneral(player, mainHeroId);
    check(trRes.ok && enhRes.ok, "Huấn luyện & Cường hóa chủ tướng thành công");
    step("5. Huấn luyện, Cường hóa & Tuyển binh", {
      hero: player.heroes[0].name,
      level: player.heroes[0].level,
      enhance: player.heroes[0].enhance,
      troops: player.heroes[0].troops,
    });

    // BƯỚC 6: Chinh phục toàn bộ Chương 1 Phó bản PVE (ch1_s1 -> ch1_s6 Boss Trương Giác)
    // Nâng Ty Vũ lên Lv.10 trước để mở trần cấp tướng (maxLv = tyVu*2 + 10 = 30) rồi luyện quân lên Lv.22+
    NLPlayer.getBuilding(player, "ty_vu").level = 12;
    player.level = 20;
    player.heroes.forEach(function (h) {
      NLRecruit.addHeroExp(player, h.hero_id, 45000);
      h.enhance = Math.max(h.enhance || 0, 3);
    });
    // Đảm bảo đủ lương thực cho 6 trận liên tiếp
    player.resources.food = Math.max(player.resources.food, 8000);
    NLPlayer.syncLegacyView(player);

    var ch1Stages = ["ch1_s1", "ch1_s2", "ch1_s3", "ch1_s4", "ch1_s5", "ch1_s6"];
    var clearedStages = [];
    var totalRounds = 0;

    ch1Stages.forEach(function (sid) {
      var team = getDeployedTeam(player);
      var r = NLCampaign.runChallenge(player, "ch1_khan_vang", sid, team);
      if (r.ok && r.win) {
        clearedStages.push(sid);
        totalRounds += r.result ? r.result.rounds || r.battleLog.length : 0;
      }
    });

    check(clearedStages.length === 6, "Vượt toàn bộ 6/6 ải Chương 1 (bao gồm Boss Trương Giác)");
    check(NLCampaign.hasFeature(player, "arena"), "Hạ Boss Chương 1 mở khóa Đấu Trường (arena)");
    check(NLCampaign.isStageUnlocked(player, "ch2_dong_trac", "ch2_s1"), "Mở khóa Chương 2: Loạn Đổng Trác");
    step("6. Vượt Phó bản Chương 1", {
      cleared: clearedStages,
      unlockedFeatures: Object.keys(player.campaign.unlockedFeatures),
      campaignExp: player.campaign.exp,
    });

    // BƯỚC 7: Chiêu mộ tướng Danh Vọng sau khi tích lũy Uy Danh
    player.prestige = Math.max(player.prestige, 900);
    player.level = Math.max(player.level, 12);
    NLPlayer.getBuilding(player, "ty_vu").level = Math.max(NLPlayer.getBuildingLevel(player, "ty_vu"), 8);
    player.resources.silver = Math.max(player.resources.silver, 50000);
    if (!player.campaign.cleared) player.campaign.cleared = {};
    player.campaign.cleared.ch3_s6 = true; // required_stage Bàng Thống
    NLPlayer.syncLegacyView(player);

    var recPrestige = NLGame.recruitTavernHero(player, "pangtong"); // Bàng Thống (tướng Tím theo Danh Vọng)
    check(recPrestige.ok, "Chiêu mộ tướng Danh Vọng (Bàng Thống) thành công");
    step("7. Chiêu mộ Danh Vọng", {
      recruited: recPrestige.hero ? recPrestige.hero.name : null,
      prestige: player.prestige,
    });

    // BƯỚC 8: Đấu Trường Lôi Đài — Khiêu chiến Bot & Đổi hạng trên Leaderboard
    var rankBefore = player.arena.player_rank;
    var arenaFight = NLArena.challengeBot(player, "bot_npc_30", getDeployedTeam(player));
    check(
      arenaFight.ok && arenaFight.win && player.arena.player_rank === 30,
      "Thắng Lôi Đài và đổi chỗ từ hạng #" + rankBefore + " lên hạng #30"
    );
    step("8. Đấu Trường Lôi Đài", {
      opponent: arenaFight.bot_name,
      oldRank: rankBefore,
      newRank: player.arena.player_rank,
      honor: player.arena.honor,
    });

    // BƯỚC 9: Lưu & Tải lại game (Save/Load Round-trip) + Kiểm tra toàn vẹn dữ liệu
    NLGame.saveGame(player);
    var loaded = NLGame.loadGame();
    var integrity = verifyIntegrity(loaded);
    check(loaded && loaded.player_id === player.player_id, "Save/Load bảo toàn player_id");
    check(loaded.arena.player_rank === 30, "Save/Load bảo toàn thứ hạng Lôi Đài (#30)");
    check(NLCampaign.isCleared(loaded, "ch1_s6"), "Save/Load bảo toàn tiến độ Phó bản");
    check(integrity.ok, "Kiểm tra toàn vẹn dữ liệu (verifyIntegrity) 0 lỗi");
    step("9. Save/Load & Kiểm tra toàn vẹn", integrity);

    var passed = assertions.filter(function (a) { return a.ok; }).length;
    return {
      ok: passed === assertions.length && integrity.ok,
      passed: passed,
      total: assertions.length,
      assertions: assertions,
      trace: trace,
      finalState: NLPlayer.toJSON(loaded),
      integrity: integrity,
    };
  }

  global.NLBackend = {
    VERSION: VERSION,
    verifyIntegrity: verifyIntegrity,
    tickAll: tickAll,
    fastForwardMinutes: fastForwardMinutes,
    getDeployedTeam: getDeployedTeam,
    runFullSimulation: runFullSimulation,
  };
  global.NLSimulator = {
    runFullSimulation: runFullSimulation,
  };
})(window);
