/* global window, NLDatabase, NLCombat, NLPlayer, NLCityEconomy */
/**
 * NLArena — Đấu Trường Lôi Đài + Rule-based NPC Bots (tiến hóa theo thời gian & scaling theo người chơi).
 * Không dùng AI/API ngoài — thuần công thức & quy tắc cứng offline.
 */
(function (global) {
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function arenaDb() {
    return (NLDatabase && NLDatabase.raw().arena) || {};
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function nowSec(nowMs) {
    return Math.floor((nowMs || Date.now()) / 1000);
  }

  function tyVuLevel(player) {
    if (typeof NLPlayer !== "undefined") {
      return Math.max(1, NLPlayer.getBuildingLevel(player, "ty_vu") || 1);
    }
    return (player.buildings && player.buildings.hall) || 1;
  }

  /** Lực chiến ước lượng của 1 đội (dùng để so sánh & scaling) */
  function estimateUnitPower(u) {
    var tl = u.tongLinh != null ? u.tongLinh : u.def || 50;
    var vl = u.vuLuc != null ? u.vuLuc : u.atk || 50;
    var tr = u.triLuc != null ? u.triLuc : 50;
    var hp = u.maxHp || u.hp || 1000;
    return Math.round((tl + vl + tr) * 4 + hp * 0.25);
  }

  function playerPower(player) {
    var gens = player.generals || player.heroes || [];
    if (!gens.length) return 500;
    var sorted = gens.slice().sort(function (a, b) {
      return estimateUnitPower(b) - estimateUnitPower(a);
    });
    return sorted.slice(0, 5).reduce(function (s, g) {
      return s + estimateUnitPower(g);
    }, 0);
  }

  function botPower(bot) {
    var units = buildBotTeam(bot);
    return units.reduce(function (s, u) {
      return s + estimateUnitPower(u);
    }, 0);
  }

  /** Khởi tạo trạng thái Arena trong Player nếu chưa có */
  function ensureArena(player, nowMs) {
    var db = arenaDb();
    var ts = nowSec(nowMs);
    if (!player.arena || !Array.isArray(player.arena.bots) || !player.arena.bots.length) {
      var bots = clone(db.bots || []).map(function (b) {
        b.last_updated_timestamp = ts;
        b.stat_multiplier = b.stat_multiplier || 1.0;
        return b;
      });
      player.arena = {
        player_rank: db.playerInitialRank || bots.length + 1,
        honor: player.honor || 0,
        wins: 0,
        losses: 0,
        last_evolution_timestamp: ts,
        bots: bots,
      };
    }
    if (player.arenaLeft == null) {
      player.arenaLeft = db.dailyChallenges || 5;
    }
    return player.arena;
  }

  function getBotTyVu(bot) {
    var b = (bot.buildings || [])[0];
    if (!b) {
      b = { building_id: "b_tyvu", level: bot.level || 1 };
      bot.buildings = [b];
    }
    return b;
  }

  /**
   * 1) CƠ CHẾ BOT TIẾN HÓA THEO THỜI GIAN (Time-based Progression Ticks):
   * New_Stat = Base_Stat * (1 + Growth_Rate * Hours_Passed)
   * + tự nâng Ty Vũ, tướng, trang bị, bạc.
   */
  function evolveBotByHours(bot, hoursPassed, evoCfg) {
    if (hoursPassed <= 0) return false;
    var tiers = (evoCfg && evoCfg.tiers) || {};
    var tCfg = tiers[bot.tier] || tiers.WEAK || {
      statGrowthPerHour: 0.004,
      levelHours: 12,
      silverPerHour: 1200,
      maxLevel: 40,
    };
    var maxCap = Math.min(evoCfg.maxTyVuLevel || 180, tCfg.maxLevel || 60);

    // Công thức tăng trưởng cố định: New_Stat = Base_Stat * (1 + Growth_Rate * Hours_Passed)
    var rate = tCfg.statGrowthPerHour || 0.005;
    var factor = 1 + rate * hoursPassed;
    bot.stat_multiplier = Math.round(((bot.stat_multiplier || 1) * factor) * 1000) / 1000;

    // Tăng cấp Ty Vũ & tướng theo số giờ cày
    var lvGain = Math.floor(hoursPassed / (tCfg.levelHours || 10));
    var tyvu = getBotTyVu(bot);
    if (lvGain > 0 && tyvu.level < maxCap) {
      var nextLv = Math.min(maxCap, tyvu.level + lvGain);
      tyvu.level = nextLv;
      bot.level = nextLv;
      ((bot.deployed_formation && bot.deployed_formation.slots) || []).forEach(function (s) {
        s.hero_level = Math.min(maxCap, (s.hero_level || 1) + lvGain);
        s.equip_level = Math.min(maxCap, (s.equip_level || 1) + lvGain);
      });
    }

    // Tích lũy Bạc
    if (!bot.resources) bot.resources = { silver: 0 };
    bot.resources.silver = Math.floor(
      (bot.resources.silver || 0) + (tCfg.silverPerHour || 1000) * hoursPassed
    );

    return true;
  }

  /** Quét toàn bộ danh sách Bot theo Delta Time */
  function tickBots(player, nowMs) {
    nowMs = nowMs || Date.now();
    var ar = ensureArena(player, nowMs);
    var db = arenaDb();
    var evo = db.evolution || {};
    var nowS = nowSec(nowMs);
    var lastS = ar.last_evolution_timestamp || nowS;
    var elapsedHours = (nowS - lastS) / 3600;
    var minTick = evo.tickIntervalHours || 1;
    var maxHours = evo.maxCatchupHours || 72;

    var evolvedCount = 0;
    if (elapsedHours >= minTick) {
      var hours = clamp(elapsedHours, 0, maxHours);
      ar.bots.forEach(function (bot) {
        if (evolveBotByHours(bot, hours, evo)) {
          bot.last_updated_timestamp = nowS;
          evolvedCount++;
        }
      });
      ar.last_evolution_timestamp = nowS;
    }

    // Luôn kiểm tra scaling nhóm bot cạnh tranh quanh hạng người chơi
    scaleCompetitiveBots(player);

    return {
      evolvedCount: evolvedCount,
      elapsedHours: elapsedHours,
    };
  }

  /**
   * 2) CƠ CHẾ BOT SCALING THEO NGƯỜI CHƠI:
   * Nhóm bot lân cận thứ hạng người chơi tự điều chỉnh để không quá dễ / quá khó.
   */
  function scaleCompetitiveBots(player) {
    var ar = ensureArena(player);
    var cfg = arenaDb().scaling || {};
    var win = cfg.neighborWindow || 4;
    var minR = cfg.minRatioToPlayer || 0.78;
    var maxR = cfg.maxRatioToPlayer || 1.35;

    var pRank = ar.player_rank;
    var pLv = Math.max(player.level || 1, tyVuLevel(player));
    var pPow = playerPower(player);

    ar.bots.forEach(function (bot) {
      var dist = Math.abs(bot.rank - pRank);
      if (dist === 0 || dist > win) return;

      // Bot xếp trên người chơi (rank nhỏ hơn) nên nhỉnh hơn chút; xếp dưới thì thấp hơn chút
      var targetLv = bot.rank < pRank
        ? Math.max(bot.level, Math.round(pLv * 0.9 + (pRank - bot.rank)))
        : Math.max(1, Math.min(bot.level, Math.round(pLv * 1.05)));

      if (targetLv > bot.level && pLv >= 5) {
        var tyvu = getBotTyVu(bot);
        bot.level = targetLv;
        tyvu.level = targetLv;
        ((bot.deployed_formation && bot.deployed_formation.slots) || []).forEach(function (s) {
          s.hero_level = Math.max(s.hero_level || 1, targetLv);
          s.equip_level = Math.max(s.equip_level || 1, Math.max(1, targetLv - 1));
        });
      }

      var bPow = botPower(bot);
      if (bPow > 0 && pPow > 0) {
        var ratio = bPow / pPow;
        if (ratio < minR && bot.rank < pRank) {
          var boost = clamp(minR / ratio, 1.0, 2.5);
          bot.stat_multiplier = Math.round(((bot.stat_multiplier || 1) * boost) * 1000) / 1000;
        } else if (ratio > maxR * 1.6 && dist <= 2 && pLv <= 5) {
          // giữ đầu game vừa tầm ở vài hạng sát cạnh
          bot.stat_multiplier = Math.round(((bot.stat_multiplier || 1) * 0.85) * 1000) / 1000;
        }
      }
    });
  }

  /** Tạo đội hình chiến đấu thực tế từ dữ liệu Bot */
  function buildBotTeam(bot) {
    if (!bot || !bot.deployed_formation) return [];
    var mult = bot.stat_multiplier || 1.0;
    var slots = bot.deployed_formation.slots || [];
    return slots.map(function (s, idx) {
      var gid = s.hero_id || "recruit_guard";
      if (gid.indexOf("h_") === 0) gid = gid.slice(2);
      var lv = s.hero_level || bot.level || 1;
      var eqLv = s.equip_level || 1;
      var unit = NLDatabase.scaleGeneral(gid, lv) || NLDatabase.scaleGeneral("recruit_guard", lv);
      if (!unit) return null;

      // Cộng hiệu ứng trang bị + multiplier tiến hóa:
      // New_Stat = Base_Stat * (1 + Growth_Rate * Hours_Passed) * equipFactor
      var eqFactor = 1 + eqLv * 0.015;
      var totalMul = mult * eqFactor;

      unit.tongLinh = Math.round(unit.tongLinh * totalMul);
      unit.vuLuc = Math.round(unit.vuLuc * totalMul);
      unit.triLuc = Math.round(unit.triLuc * totalMul);
      unit.maxHp = Math.round(unit.maxHp * totalMul);
      unit.hp = unit.maxHp;
      unit.slot = clamp((s.slot || idx + 1) - 1, 0, 4);
      unit.isEnemy = true;
      unit.equipLevel = eqLv;
      return unit;
    }).filter(Boolean);
  }

  function findBot(player, botIdOrRank) {
    var ar = ensureArena(player);
    for (var i = 0; i < ar.bots.length; i++) {
      var b = ar.bots[i];
      if (b.bot_id === botIdOrRank || b.rank === botIdOrRank) return b;
    }
    return null;
  }

  /** Bảng xếp hạng (gồm cả Player + 35 Bots, sắp theo rank tăng dần) */
  function getLeaderboard(player) {
    tickBots(player);
    var ar = ensureArena(player);
    var rows = ar.bots.map(function (b) {
      return {
        isPlayer: false,
        bot_id: b.bot_id,
        name: b.name,
        rank: b.rank,
        tier: b.tier,
        level: b.level,
        power: botPower(b),
        silver: b.resources ? b.resources.silver : 0,
        formation_id: b.deployed_formation ? b.deployed_formation.formation_id : "square",
      };
    });
    rows.push({
      isPlayer: true,
      bot_id: null,
      player_id: player.player_id,
      name: (player.username || player.playerName || "Thành Chủ") + " (Bạn)",
      rank: ar.player_rank,
      tier: "PLAYER",
      level: Math.max(player.level || 1, tyVuLevel(player)),
      power: playerPower(player),
      silver: player.resources ? player.resources.silver : player.silver || 0,
      formation_id:
        (player.deployed_formation && player.deployed_formation.formation_id) || "crane_wing",
    });
    rows.sort(function (a, b) { return a.rank - b.rank; });
    return rows;
  }

  /** Chuẩn bị khiêu chiến 1 Bot */
  function prepareChallenge(player, botId) {
    tickBots(player);
    var ar = ensureArena(player);
    if ((player.arenaLeft || 0) <= 0) {
      return { ok: false, reason: "Đã hết lượt Lôi Đài hôm nay." };
    }
    var bot = findBot(player, botId);
    if (!bot) {
      // Nếu không truyền botId → chọn bot ngay phía trên người chơi (hoặc gần nhất)
      var targetRank = Math.max(1, ar.player_rank - 1);
      bot = findBot(player, targetRank) || ar.bots[ar.bots.length - 1];
    }
    if (!bot) return { ok: false, reason: "Không tìm thấy đối thủ Bot." };

    var enemies = buildBotTeam(bot);
    return {
      ok: true,
      bot: bot,
      enemies: enemies,
      enemyFormationId:
        (bot.deployed_formation && bot.deployed_formation.formation_id) || "square",
      title: "Lôi Đài · Hạng #" + bot.rank + " " + bot.name,
    };
  }

  /**
   * Kết toán trận Lôi Đài:
   * - Nếu thắng & đối thủ có hạng cao hơn (rank nhỏ hơn): đổi chỗ rank!
   * - Cộng Bạc, Danh vọng, Điểm vinh quang (honor).
   */
  function settleChallenge(player, botId, win, meta) {
    meta = meta || {};
    var ar = ensureArena(player);
    var bot = findBot(player, botId);
    var rwCfg = arenaDb().rewards || {};

    player.arenaLeft = Math.max(0, (player.arenaLeft || 1) - 1);

    var oldPlayerRank = ar.player_rank;
    var oldBotRank = bot ? bot.rank : oldPlayerRank;
    var rankSwapped = false;
    var silverGain = 0;
    var honorGain = 0;
    var prestigeGain = 0;
    var gemGain = 0;

    if (win) {
      ar.wins = (ar.wins || 0) + 1;
      var tierIdx = bot && bot.tier === "STRONG" ? 3 : bot && bot.tier === "MEDIUM" ? 2 : 1;
      silverGain = (rwCfg.winBaseSilver || 300) + tierIdx * (rwCfg.winSilverPerTier || 150);
      honorGain = rwCfg.winHonor || 25;
      prestigeGain = rwCfg.winPrestige || 20;

      // Đổi chỗ hạng nếu đánh thắng đối thủ xếp trên
      if (bot && bot.rank < ar.player_rank) {
        var newRank = bot.rank;
        bot.rank = oldPlayerRank;
        ar.player_rank = newRank;
        rankSwapped = true;
        if (newRank <= 10) {
          gemGain = rwCfg.rankBonusTop10Gem || 5;
        }
      }
    } else {
      ar.losses = (ar.losses || 0) + 1;
      silverGain = rwCfg.loseSilver || 60;
      honorGain = rwCfg.loseHonor || 5;
    }

    if (player.resources) {
      player.resources.silver = (player.resources.silver || 0) + silverGain;
      player.resources.gem = (player.resources.gem || 0) + gemGain;
      if (typeof NLCityEconomy !== "undefined") {
        var caps = NLCityEconomy.warehouseCaps(player);
        player.resources.silver = Math.min(caps.silver, player.resources.silver);
      }
    }
    player.silver = player.resources ? Math.floor(player.resources.silver) : (player.silver || 0) + silverGain;
    player.gold = player.resources ? Math.floor(player.resources.gem) : (player.gold || 0) + gemGain;
    player.prestige = (player.prestige || 0) + prestigeGain;
    ar.honor = (ar.honor || 0) + honorGain;
    player.honor = ar.honor;

    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(player);

    if (player.log) {
      player.log.unshift({
        msg: win
          ? "Thắng Lôi Đài vs " + (bot ? bot.name : "Bot") +
            (rankSwapped ? " (lên Hạng #" + ar.player_rank + "!)" : "") +
            " +" + silverGain + " bạc, +" + honorGain + " vinh quang."
          : "Thua Lôi Đài vs " + (bot ? bot.name : "Bot") + " (+" + silverGain + " bạc an ủi).",
        type: win ? "gold" : "bad",
        t: Date.now(),
      });
    }

    return {
      win: !!win,
      bot_id: bot ? bot.bot_id : null,
      bot_name: bot ? bot.name : null,
      old_rank: oldPlayerRank,
      new_rank: ar.player_rank,
      bot_new_rank: bot ? bot.rank : oldBotRank,
      rank_swapped: rankSwapped,
      rewards: {
        silver: silverGain,
        honor: honorGain,
        prestige: prestigeGain,
        gem: gemGain,
      },
      battleLog: meta.battleLog || null,
    };
  }

  /** Chạy trực tiếp 1 trận khiêu chiến Bot (dùng cho test / auto) */
  function challengeBot(player, botId, teamSlots) {
    var prep = prepareChallenge(player, botId);
    if (!prep.ok) return prep;

    var team = (teamSlots || []).map(function (s, i) {
      var g = s.general || s;
      var u = Object.assign({}, g);
      u.slot = s.slot != null ? s.slot : (u.slot != null ? u.slot : i);
      if (u.vuLuc == null && u.atk != null) u.vuLuc = u.atk;
      if (u.tongLinh == null && u.def != null) u.tongLinh = u.def;
      if (u.triLuc == null) u.triLuc = Math.round((u.vuLuc || 50) * 0.65);
      if (!u.skillId) u.skillId = "basic_strike";
      return u;
    });

    if (!team.length) {
      team = (player.generals || []).slice(0, 5).map(function (g, i) {
        var u = Object.assign({}, g);
        u.slot = i;
        if (u.vuLuc == null) u.vuLuc = u.atk;
        if (u.tongLinh == null) u.tongLinh = u.def;
        if (u.triLuc == null) u.triLuc = Math.round((u.vuLuc || 50) * 0.65);
        if (!u.skillId) u.skillId = "basic_strike";
        return u;
      });
    }

    var pForm =
      (player.deployed_formation && player.deployed_formation.formation_id) ||
      player.formationId ||
      "crane_wing";

    var battle = NLCombat.runBattle(team, prep.enemies, {
      title: prep.title,
      playerFormation: pForm,
      enemyFormation: prep.enemyFormationId,
    });

    var settled = settleChallenge(player, prep.bot.bot_id, battle.win, {
      battleLog: battle.battleLog,
    });

    return Object.assign({ ok: true, result: battle }, settled);
  }

  /** Xuất đúng JSON schema mẫu của đề bài cho 1 Bot */
  function toBotSampleSchema(bot) {
    if (!bot) return null;
    return {
      bot_id: bot.bot_id,
      name: bot.name,
      rank: bot.rank,
      tier: bot.tier,
      level: bot.level,
      resources: {
        silver: bot.resources ? bot.resources.silver : 0,
      },
      buildings: (bot.buildings || []).map(function (b) {
        return { building_id: b.building_id || "b_tyvu", level: b.level };
      }),
      deployed_formation: {
        formation_id:
          (bot.deployed_formation && (bot.deployed_formation.formation_alias || bot.deployed_formation.formation_id)) ||
          "f_hacdieu",
        slots: ((bot.deployed_formation && bot.deployed_formation.slots) || []).map(function (s) {
          return {
            slot: s.slot,
            hero_id: s.hero_alias || ("h_" + s.hero_id),
            hero_level: s.hero_level,
            equip_level: s.equip_level,
          };
        }),
      },
      last_updated_timestamp: bot.last_updated_timestamp,
    };
  }

  global.NLArena = {
    ensureArena: ensureArena,
    tickBots: tickBots,
    evolveBotByHours: evolveBotByHours,
    scaleCompetitiveBots: scaleCompetitiveBots,
    buildBotTeam: buildBotTeam,
    findBot: findBot,
    getLeaderboard: getLeaderboard,
    prepareChallenge: prepareChallenge,
    settleChallenge: settleChallenge,
    challengeBot: challengeBot,
    playerPower: playerPower,
    botPower: botPower,
    toBotSampleSchema: toBotSampleSchema,
  };
})(window);
