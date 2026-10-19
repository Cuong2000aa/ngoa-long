/* global window, NLDatabase, NLCombat, NLPlayer, NLCityEconomy */
/**
 * NLCampaign — Phó bản / Vượt ải PVE (progression + stamina + thưởng).
 */
(function (global) {
  function formulas() {
    return (NLDatabase && NLDatabase.formulas() && NLDatabase.formulas().campaign) || {};
  }

  function campDb() {
    return NLDatabase.campaign();
  }

  function progressionDb() {
    var raw = NLDatabase.raw && NLDatabase.raw();
    return (raw && raw.progression) || {};
  }

  function stageLink(stageId) {
    var links = progressionDb().stageLinks || {};
    return links[stageId] || null;
  }

  function ensureProgress(player) {
    if (!player.campaign) player.campaign = {};
    var c = player.campaign;
    if (!c.cleared) c.cleared = {};
    if (!c.unlockedFeatures) c.unlockedFeatures = { campaign: true };
    if (c.exp == null) c.exp = 0;
    if (!c.current) c.current = { chapterId: null, stageId: null };
    return c;
  }

  function resolveChapter(chapterId) {
    if (!chapterId) return null;
    var ch = NLDatabase.getChapter(chapterId);
    if (ch) return ch;
    var list = campDb().chapters || [];
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c.id === chapterId) return c;
      if (c.aliases && c.aliases.indexOf(chapterId) >= 0) return c;
    }
    return null;
  }

  function resolveStage(chapterId, stageId) {
    var ch = resolveChapter(chapterId);
    if (!ch) return null;
    for (var i = 0; i < ch.stages.length; i++) {
      var s = ch.stages[i];
      if (s.id === stageId) return { chapter: ch, stage: s };
      if (s.aliases && s.aliases.indexOf(stageId) >= 0) return { chapter: ch, stage: s };
    }
    // tìm theo stageId toàn cục
    if (!chapterId) {
      var chapters = campDb().chapters || [];
      for (var ci = 0; ci < chapters.length; ci++) {
        var hit = resolveStage(chapters[ci].id, stageId);
        if (hit) return hit;
      }
    }
    return null;
  }

  function staminaCost(stage) {
    if (!stage) return 0;
    if (stage.staminaCost != null) return stage.staminaCost;
    if (stage.stamina_cost != null) return stage.stamina_cost;
    var by = formulas().staminaByType || {};
    return by[stage.type] || by.normal || 80;
  }

  function enemyFormationId(stage) {
    if (!stage) return formulas().defaultEnemyFormation || "square";
    return stage.enemyFormationId || stage.enemy_formation || formulas().defaultEnemyFormation || "square";
  }

  function loseFoodRatio() {
    var d = campDb().defaults;
    if (d && d.loseFoodRatio != null) return d.loseFoodRatio;
    if (formulas().loseFoodRatio != null) return formulas().loseFoodRatio;
    return 0.5;
  }

  function isCleared(player, stageId) {
    var p = ensureProgress(player);
    return !!(p.cleared && p.cleared[stageId]);
  }

  function prevStage(chapter, stage) {
    var idx = chapter.stages.indexOf(stage);
    if (idx < 0) {
      for (var i = 0; i < chapter.stages.length; i++) {
        if (chapter.stages[i].id === stage.id) { idx = i; break; }
      }
    }
    if (idx <= 0) return null;
    return chapter.stages[idx - 1];
  }

  function nextStage(chapter, stage) {
    var idx = -1;
    for (var i = 0; i < chapter.stages.length; i++) {
      if (chapter.stages[i].id === stage.id) { idx = i; break; }
    }
    if (idx < 0 || idx >= chapter.stages.length - 1) return null;
    return chapter.stages[idx + 1];
  }

  function chapterUnlocked(player, chapter) {
    if (!chapter.unlockRequire) return true;
    var req = chapter.unlockRequire;
    return isCleared(player, req.stageId);
  }

  /** Ải mở khi: chương mở + (ải đầu chương hoặc ải trước đã clear) */
  function isStageUnlocked(player, chapterId, stageId) {
    var hit = resolveStage(chapterId, stageId);
    if (!hit) return false;
    if (!chapterUnlocked(player, hit.chapter)) return false;
    var prev = prevStage(hit.chapter, hit.stage);
    if (!prev) return true;
    return isCleared(player, prev.id);
  }

  function getFood(player) {
    if (player.resources && player.resources.food != null) return player.resources.food;
    return player.food || 0;
  }

  function setFood(player, value) {
    value = Math.max(0, Math.floor(value));
    if (player.resources) player.resources.food = value;
    player.food = value;
  }

  function addSilver(player, amount) {
    amount = Math.floor(amount || 0);
    if (!amount) return;
    if (player.resources) player.resources.silver = (player.resources.silver || 0) + amount;
    player.silver = (player.silver || 0) + amount;
    if (typeof NLCityEconomy !== "undefined") {
      var caps = NLCityEconomy.warehouseCaps(player);
      if (player.resources) {
        player.resources.silver = Math.min(caps.silver, player.resources.silver);
        player.silver = Math.floor(player.resources.silver);
      }
    }
  }

  function addGem(player, amount) {
    amount = Math.floor(amount || 0);
    if (!amount) return;
    if (player.resources) player.resources.gem = (player.resources.gem || 0) + amount;
    player.gold = (player.gold || 0) + amount;
  }

  function canChallenge(player, chapterId, stageId) {
    var hit = resolveStage(chapterId, stageId);
    if (!hit) return { ok: false, reason: "Không tìm thấy ải." };
    if (!isStageUnlocked(player, hit.chapter.id, hit.stage.id)) {
      return { ok: false, reason: "Ải chưa mở khóa. Hãy thắng ải trước." };
    }
    var cost = staminaCost(hit.stage);
    var food = getFood(player);
    if (food < cost) {
      return {
        ok: false,
        reason: "Không đủ Lương thực (cần " + cost + ", đang có " + Math.floor(food) + ").",
        staminaCost: cost,
        food: food,
      };
    }
    return {
      ok: true,
      chapter: hit.chapter,
      stage: hit.stage,
      staminaCost: cost,
      enemyFormationId: enemyFormationId(hit.stage),
    };
  }

  /** Build địch từ stage (+ formation id) */
  function buildEnemies(stage) {
    if (typeof NLCombat !== "undefined" && NLCombat.enemiesFromStage) {
      return NLCombat.enemiesFromStage(stage);
    }
    return NLDatabase.buildStageEnemies(stage);
  }

  /**
   * Chuẩn bị khiêu chiến: kiểm tra food + unlock, trả enemy team để Combat Engine chạy.
   * Không trừ lương ở bước này — trừ khi settleResult.
   */
  function prepareChallenge(player, chapterId, stageId) {
    var check = canChallenge(player, chapterId, stageId);
    if (!check.ok) return check;
    var enemies = buildEnemies(check.stage);
    if (!enemies.length) return { ok: false, reason: "Ải chưa có đội hình địch." };
    return {
      ok: true,
      chapter: check.chapter,
      stage: check.stage,
      staminaCost: check.staminaCost,
      enemyFormationId: check.enemyFormationId,
      enemies: enemies,
      title: "Ch." + check.chapter.index + " · " + check.stage.name,
    };
  }

  /**
   * Chạy trận PVE (headless) — dùng khi selftest / bỏ qua UI formation.
   * teamSlots: [{id, slot, general?}] hoặc units đã có slot.
   */
  function runChallenge(player, chapterId, stageId, teamSlots, opts) {
    opts = opts || {};
    var prep = prepareChallenge(player, chapterId, stageId);
    if (!prep.ok) return prep;

    var team = (teamSlots || []).map(function (s, i) {
      var g = s.general || s;
      if (s.id && player.generals) {
        var found = player.generals.find(function (x) { return x.id === s.id; });
        if (found) g = Object.assign({}, found);
      }
      var u = Object.assign({}, g);
      u.slot = s.slot != null ? s.slot : (u.slot != null ? u.slot : i);
      if (u.vuLuc == null && u.atk != null) u.vuLuc = u.atk;
      if (u.tongLinh == null && u.def != null) u.tongLinh = u.def;
      if (u.triLuc == null) u.triLuc = Math.round((u.vuLuc || 50) * 0.65);
      if (!u.skillId) u.skillId = "basic_strike";
      return u;
    }).filter(Boolean);

    if (!team.length && player.generals && player.generals.length) {
      team = player.generals.slice(0, 5).map(function (g, i) {
        var u = Object.assign({}, g);
        u.slot = i;
        if (u.vuLuc == null) u.vuLuc = u.atk;
        if (u.tongLinh == null) u.tongLinh = u.def;
        if (u.triLuc == null) u.triLuc = Math.round((u.vuLuc || 50) * 0.65);
        if (!u.skillId) u.skillId = "basic_strike";
        return u;
      });
    }

    if (!team.length) return { ok: false, reason: "Chưa có đội hình xuất trận." };

    var formId =
      (player.deployed_formation && player.deployed_formation.formation_id) ||
      player.formationId ||
      "crane_wing";

    var result = NLCombat.runBattle(team, prep.enemies, {
      title: prep.title,
      playerFormation: formId,
      enemyFormation: prep.enemyFormationId,
    });

    var settled = settleResult(player, prep.chapter, prep.stage, result.win, {
      battleLog: result.battleLog,
      result: result,
    });

    return Object.assign({ ok: true, prep: prep }, settled, {
      battleLog: result.battleLog,
      result: result,
    });
  }

  function featureLabel(id) {
    var labels = formulas().featureLabels || {};
    return labels[id] || id;
  }

  /**
   * Kết toán thắng/thua:
   * - Thắng: trừ full stamina, cộng thưởng, clear ải, mở ải sau / feature boss
   * - Thua: trừ loseFoodRatio * stamina (mặc định 50%), không clear
   */
  function settleResult(player, chapter, stage, win, meta) {
    meta = meta || {};
    ensureProgress(player);
    var cost = staminaCost(stage);
    var foodBefore = getFood(player);
    var rewards = [];
    var unlockedStage = null;
    var unlockedFeatures = [];
    var drop = null;
    var firstClear = false;

    if (win) {
      setFood(player, foodBefore - cost);
      var r = stage.rewards || {};
      if (r.silver) {
        addSilver(player, r.silver);
        rewards.push({ type: "silver", amount: r.silver });
      }
      // thưởng food từ ải (nếu có) — cộng sau khi trừ stamina
      if (r.food) {
        setFood(player, getFood(player) + r.food);
        rewards.push({ type: "food", amount: r.food });
      }
      if (r.gold || r.gem) {
        var g = r.gold || r.gem;
        addGem(player, g);
        rewards.push({ type: "gem", amount: g });
      }
      if (r.exp) {
        player.campaign.exp = (player.campaign.exp || 0) + r.exp;
        player.prestige = (player.prestige || 0) + Math.floor(r.exp / 5);
        player.level = Math.max(player.level || 1, 1 + Math.floor((player.campaign.exp || 0) / 500));
        // cộng EXP cho các tướng đang DEPLOYED
        if (typeof NLRecruit !== "undefined" && player.heroes) {
          player.heroes.forEach(function (h) {
            if (h.status === "DEPLOYED" || h.deployed_slot) {
              NLRecruit.addHeroExp(player, h.hero_id, r.exp);
            }
          });
        }
        rewards.push({ type: "exp", amount: r.exp });
      }

      firstClear = !isCleared(player, stage.id);
      player.campaign.cleared[stage.id] = true;
      player.campaign.current = { chapterId: chapter.id, stageId: stage.id };

      if (typeof NLDatabase !== "undefined" && r.dropTable) {
        drop = NLDatabase.rollDrop(r.dropTable, r.dropChance);
        if (drop) {
          player.inventory = player.inventory || [];
          player.inventory.push({ itemId: drop.id, at: Date.now(), from: stage.id });
          rewards.push({ type: "item", itemId: drop.id, name: drop.name });
        }
      }

      if (firstClear && r.firstClearBonus) {
        var b = r.firstClearBonus;
        if (b.silver) {
          addSilver(player, b.silver);
          rewards.push({ type: "silver", amount: b.silver, firstClear: true });
        }
        if (b.food) {
          setFood(player, getFood(player) + b.food);
          rewards.push({ type: "food", amount: b.food, firstClear: true });
        }
        if (b.itemId && typeof NLDatabase !== "undefined") {
          var it = NLDatabase.getItem(b.itemId);
          player.inventory = player.inventory || [];
          player.inventory.push({ itemId: b.itemId, at: Date.now(), from: stage.id, firstClear: true });
          rewards.push({ type: "item", itemId: b.itemId, name: it ? it.name : b.itemId, firstClear: true });
        }
      }

      // Tiến trình: danh vọng + thu phục tướng theo phe (progression.stageLinks)
      if (firstClear) {
        var link = stageLink(stage.id);
        var fc = link && link.firstClear;
        if (fc) {
          if (fc.prestige) {
            player.prestige = (player.prestige || 0) + fc.prestige;
            rewards.push({ type: "prestige", amount: fc.prestige, firstClear: true });
          }
          if (fc.hint) {
            rewards.push({ type: "hint", text: fc.hint, firstClear: true });
          }
          var gid = null;
          if (fc.grantByFaction) {
            var fac = player.faction || "shu";
            gid = fc.grantByFaction[fac] || fc.grantByFaction.shu || null;
          } else if (fc.grantGeneralId) {
            gid = fc.grantGeneralId;
          }
          if (gid && typeof NLRecruit !== "undefined" && NLRecruit.grantHero) {
            var granted = NLRecruit.grantHero(player, gid, {
              obtain: "campaign",
              from: stage.id,
              fromName: stage.name,
              logPrefix: "Thu phục ải",
            });
            if (granted && granted.ok && granted.hero) {
              rewards.push({
                type: "general",
                generalId: gid,
                name: granted.hero.name,
                firstClear: true,
              });
            } else if (granted && granted.full) {
              rewards.push({
                type: "general_pending",
                generalId: gid,
                reason: granted.reason,
                firstClear: true,
              });
            }
          }
        }
      }

      // mở ải tiếp
      var nxt = nextStage(chapter, stage);
      if (nxt) {
        unlockedStage = { chapterId: chapter.id, stageId: nxt.id, name: nxt.name };
      } else {
        // hết chương → tìm chương tiếp
        var chapters = campDb().chapters || [];
        for (var i = 0; i < chapters.length; i++) {
          if (chapters[i].id === chapter.id && chapters[i + 1]) {
            var nch = chapters[i + 1];
            unlockedStage = {
              chapterId: nch.id,
              stageId: nch.stages[0].id,
              name: nch.name + " · " + nch.stages[0].name,
            };
            break;
          }
        }
      }

      // Boss unlock features
      if (stage.unlockFeatures && stage.unlockFeatures.length) {
        stage.unlockFeatures.forEach(function (fid) {
          if (!player.campaign.unlockedFeatures[fid]) {
            player.campaign.unlockedFeatures[fid] = true;
            unlockedFeatures.push({ id: fid, name: featureLabel(fid) });
          }
        });
      }

      if (player.log) {
        player.log.unshift({
          msg:
            "Thắng ải " + stage.name + ": +" + (r.silver || 0) + " bạc" +
            (r.exp ? ", +" + r.exp + " EXP" : "") +
            (drop ? ", " + drop.name : ""),
          type: "gold",
          t: Date.now(),
        });
      }
    } else {
      var lost = Math.floor(cost * loseFoodRatio());
      setFood(player, foodBefore - lost);
      if (player.log) {
        player.log.unshift({
          msg: "Thua ải " + stage.name + (lost ? " (−" + lost + " lương)" : "") + ".",
          type: "bad",
          t: Date.now(),
        });
      }
      rewards.push({ type: "food_lost", amount: lost });
    }

    if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(player);

    return {
      win: !!win,
      firstClear: firstClear,
      staminaCost: cost,
      foodSpent: win ? cost : Math.floor(cost * loseFoodRatio()),
      rewards: rewards,
      drop: drop,
      unlockedStage: unlockedStage,
      unlockedFeatures: unlockedFeatures,
      battleLog: meta.battleLog || null,
      stage: stage,
      chapter: chapter,
    };
  }

  /** Snapshot map cho UI */
  function mapSnapshot(player) {
    ensureProgress(player);
    var food = getFood(player);
    var chapters = (campDb().chapters || []).map(function (ch) {
      var chOpen = chapterUnlocked(player, ch);
      return {
        chapter_id: ch.id,
        chapter_name: "Chương " + ch.index + ": " + ch.name,
        aliases: ch.aliases || [],
        unlocked: chOpen,
        summary: ch.summary,
        stages: ch.stages.map(function (st) {
          var unlocked = chOpen && isStageUnlocked(player, ch.id, st.id);
          var cleared = isCleared(player, st.id);
          var cost = staminaCost(st);
          var link = stageLink(st.id);
          var fac = player.faction || "shu";
          var grantId =
            link && link.firstClear && link.firstClear.grantByFaction
              ? link.firstClear.grantByFaction[fac] || null
              : link && link.firstClear
                ? link.firstClear.grantGeneralId || null
                : null;
          return {
            stage_id: st.id,
            name: st.name,
            type: st.type,
            index: st.index,
            stamina_cost: cost,
            enemy_formation_id: st.enemy_formation_id || enemyFormationId(st),
            enemyFormationId: enemyFormationId(st),
            unlocked: unlocked,
            cleared: cleared,
            can_fight: unlocked && food >= cost,
            rewards: st.rewards || {},
            unlockFeatures: st.unlockFeatures || [],
            story: link ? link.story || null : null,
            mission: link ? link.mission || null : null,
            first_clear_prestige: link && link.firstClear ? link.firstClear.prestige || 0 : 0,
            first_clear_general: grantId,
            first_clear_hint: link && link.firstClear ? link.firstClear.hint || null : null,
          };
        }),
      };
    });
    var rank =
      typeof NLRecruit !== "undefined" && NLRecruit.prestigeRank
        ? NLRecruit.prestigeRank(player)
        : null;
    return {
      food: Math.floor(food),
      campaign_exp: player.campaign.exp || 0,
      prestige: player.prestige || 0,
      prestige_rank: rank,
      cleared_count: Object.keys(player.campaign.cleared).length,
      unlockedFeatures: Object.keys(player.campaign.unlockedFeatures || {}).filter(function (k) {
        return player.campaign.unlockedFeatures[k];
      }),
      chapters: chapters,
    };
  }

  /** Export dạng JSON mẫu user (1 chương) */
  function exportChapterSample(chapterId) {
    var ch = resolveChapter(chapterId) || (campDb().chapters || [])[0];
    if (!ch) return null;
    return {
      chapter_id: (ch.aliases && ch.aliases[0]) || ch.id,
      chapter_name: "Chương " + ch.index + ": " + ch.name,
      stages: ch.stages.map(function (st) {
        return {
          stage_id: (st.aliases && st.aliases[0]) || st.id,
          name: st.name,
          stamina_cost: staminaCost(st),
          enemy_formation_id: st.enemy_formation_id || ("ef_" + st.id),
          rewards: {
            silver: (st.rewards && st.rewards.silver) || 0,
            exp: (st.rewards && st.rewards.exp) || 0,
          },
        };
      }),
    };
  }

  function hasFeature(player, featureId) {
    ensureProgress(player);
    return !!player.campaign.unlockedFeatures[featureId];
  }

  global.NLCampaign = {
    ensureProgress: ensureProgress,
    resolveChapter: resolveChapter,
    resolveStage: resolveStage,
    staminaCost: staminaCost,
    enemyFormationId: enemyFormationId,
    isCleared: isCleared,
    isStageUnlocked: isStageUnlocked,
    chapterUnlocked: chapterUnlocked,
    canChallenge: canChallenge,
    prepareChallenge: prepareChallenge,
    runChallenge: runChallenge,
    settleResult: settleResult,
    mapSnapshot: mapSnapshot,
    exportChapterSample: exportChapterSample,
    hasFeature: hasFeature,
    buildEnemies: buildEnemies,
    nextStage: nextStage,
    featureLabel: featureLabel,
  };
})(window);
