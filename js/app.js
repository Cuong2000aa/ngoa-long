/* global NLGame, NLUI, NLCity */
(function () {
  var G = NLGame;
  var UI = NLUI;
  var state = null;
  var selectedFaction = "shu";
  var autosaveStarted = false;
  var city = null;

  function summarizeCampaignRewards(settled, win) {
    if (!settled) return { text: "", lines: [], sections: {} };
    if (!win) {
      var loseText = "Tiêu hao: −" + (settled.foodSpent || 0) + " Lương thực";
      return { text: loseText, lines: [loseText], sections: { lose: loseText } };
    }
    var silver = 0;
    var food = 0;
    var exp = 0;
    var prestige = 0;
    var gem = 0;
    var generals = [];
    var items = [];
    var hints = [];
    var pending = [];
    (settled.rewards || []).forEach(function (r) {
      if (r.type === "silver") silver += r.amount || 0;
      else if (r.type === "food") food += r.amount || 0;
      else if (r.type === "exp") exp += r.amount || 0;
      else if (r.type === "prestige") prestige += r.amount || 0;
      else if (r.type === "gem") gem += r.amount || 0;
      else if (r.type === "general" && r.name) generals.push(r.name);
      else if (r.type === "item" && r.name) items.push(r.name);
      else if (r.type === "hint" && r.text) hints.push(r.text);
      else if (r.type === "general_pending") {
        pending.push(r.reason || "Kho tướng đầy — chưa nhận tướng");
      }
    });
    if (settled.rewardsGained) {
      silver += settled.rewardsGained.silver || 0;
      exp += settled.rewardsGained.exp || 0;
      prestige += settled.rewardsGained.prestige || 0;
    }
    if (settled.drop && settled.drop.name && items.indexOf(settled.drop.name) < 0) {
      items.push(settled.drop.name);
    }
    var rewardBits = [];
    if (silver) rewardBits.push("+" + silver + " Bạc");
    if (food) rewardBits.push("+" + food + " Lương");
    if (exp) rewardBits.push("+" + exp + " EXP");
    if (prestige) rewardBits.push("+" + prestige + " Danh vọng");
    if (gem) rewardBits.push("+" + gem + " Vàng");
    var lines = [];
    if (rewardBits.length) lines.push("Thưởng: " + rewardBits.join(" · "));
    if (generals.length) lines.push("Thu phục: " + generals.join(", "));
    if (items.length) lines.push("Nhặt: " + items.join(", ") + " — mở Trang bị để đeo");
    if (settled.unlockedStage) lines.push("Mở ải: " + settled.unlockedStage.name);
    (settled.unlockedFeatures || []).forEach(function (f) {
      lines.push("Mở tính năng: " + (f.name || f.id));
    });
    hints.forEach(function (h) {
      lines.push(h);
    });
    pending.forEach(function (p) {
      lines.push(p);
    });
    var text = lines.join(" · ");
    return {
      text: text,
      lines: lines,
      sections: {
        rewards: rewardBits,
        generals: generals,
        items: items,
        unlockedStage: settled.unlockedStage || null,
        unlockedFeatures: settled.unlockedFeatures || [],
        hints: hints,
      },
    };
  }

  function narrativeForStage(stageId) {
    if (typeof NLCampaign !== "undefined" && NLCampaign.stageNarrative) {
      return NLCampaign.stageNarrative(stageId);
    }
    return { story: null, mission: null, briefing: null, epilogue: null };
  }

  function buildCampaignReport(prep, settled, win, battleResult) {
    var sum = summarizeCampaignRewards(settled, win);
    var nar = narrativeForStage(prep.stage && prep.stage.id);
    return {
      stageName: prep.stage.name,
      stageId: prep.stage.id,
      chapterId: prep.chapter && prep.chapter.id,
      win: win,
      firstClear: !!(settled && settled.firstClear),
      rounds: (battleResult && battleResult.rounds) || 1,
      logs: (battleResult && (battleResult.battleLog || battleResult.logs)) || [],
      rewardSummary: sum.text,
      rewardLines: sum.lines,
      rewardSections: sum.sections,
      epilogue: win && settled && settled.firstClear ? nar.epilogue : null,
      briefing: nar.briefing,
      hasItems: !!(sum.sections && sum.sections.items && sum.sections.items.length),
      hasRecruit: !!(sum.sections && sum.sections.generals && sum.sections.generals.length),
      hasUnlock: !!(
        settled &&
        (settled.unlockedStage ||
          (settled.unlockedFeatures && settled.unlockedFeatures.length))
      ),
    };
  }

  function shouldShowStageBriefing(stageId) {
    if (typeof NLCampaign === "undefined" || !NLCampaign.isCleared) return true;
    return !NLCampaign.isCleared(state, stageId);
  }

  function withStageBriefing(prep, run) {
    var nar = narrativeForStage(prep.stage && prep.stage.id);
    var text = nar.briefing || nar.mission;
    if (
      text &&
      shouldShowStageBriefing(prep.stage.id) &&
      UI.showCampaignBriefing
    ) {
      UI.showCampaignBriefing(prep, nar, run);
      return;
    }
    run();
  }

  function runStageQuickFight(prep) {
    var teamSlots = [];
    (state.generals || []).forEach(function (g) {
      if (g.deployed_slot >= 1 && g.deployed_slot <= 5) {
        teamSlots.push({ id: g.id, slot: g.deployed_slot - 1, general: g });
      }
    });
    if (!teamSlots.length) {
      (state.generals || []).slice(0, 3).forEach(function (g, i) {
        teamSlots.push({ id: g.id, slot: i, general: g });
      });
    }
    var fought = G.fightWithTeam(state, teamSlots, prep.enemies, {
      title: prep.title || prep.stage.name,
      enemyFormation: prep.enemyFormationId,
    });
    if (!fought.ok) {
      UI.toast(fought.msg, "bad");
      return;
    }
    function finalize() {
      var settled = G.applyStageRewards(state, prep.stage, fought.win, prep.chapter);
      if (UI.setLastCampaignReport && fought.result) {
        UI.setLastCampaignReport(
          buildCampaignReport(prep, settled, fought.win, fought.result)
        );
      }
      if (fought.win) {
        var msg = "Thắng ải: " + prep.stage.name;
        if (settled && settled.unlockedStage) msg += " · Mở: " + settled.unlockedStage.name;
        UI.toast(msg, "good");
      } else {
        UI.toast("Thất bại tại " + prep.stage.name, "bad");
      }
      G.saveGame(state);
      refresh();
      UI.renderCampaign(state, makeHandlers());
    }
    UI.closePanel();
    var combatMeta = {
      context: "campaign",
      stageName: prep.stage.name,
      loseTip: "Thử Bày trận, huấn luyện tướng hoặc mở Trang bị.",
    };
    if (fought.result && typeof NLCombatUI !== "undefined") {
      NLCombatUI.playBattle(fought.result, finalize, combatMeta);
    } else {
      finalize();
    }
  }

  function makeHandlers() {
    return {
      upgrade: function (id) {
        var r = G.upgradeBuilding(state, id);
        UI.toast(r.ok ? (r.msg || "Đã bắt đầu nâng cấp!") : r.msg, r.ok ? "good" : "bad");
        if (!r.ok) G.pushLog(state, r.msg, "bad");
        G.saveGame(state);
        refresh();
        var panelLayer = document.getElementById("panel-layer");
        if (r.ok && panelLayer && !panelLayer.hidden) {
          var focus = UI.renderBuildingDetail && UI.renderBuildingDetail._lastId;
          if (focus) UI.renderBuildingDetail(state, focus, makeHandlers());
          else UI.renderCityPanel(state, makeHandlers());
        }
      },
      openBuilding: function (id) {
        UI.renderBuildingDetail(state, id, makeHandlers());
      },
      train: function (id) {
        var r = G.trainGeneral(state, id);
        UI.toast(r.ok ? "Huấn luyện xong" : r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        if (UI.refreshGeneralsView) UI.refreshGeneralsView(state, makeHandlers());
        else UI.renderGenerals(state, makeHandlers());
      },
      enhance: function (id) {
        var r = G.enhanceGeneral(state, id);
        UI.toast(r.ok ? "Cường hóa thành công" : r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        if (UI.refreshGeneralsView) UI.refreshGeneralsView(state, makeHandlers());
        else UI.renderGenerals(state, makeHandlers());
      },
      awaken: function (id) {
        var r = G.awakenGeneral(state, id);
        UI.toast(r.ok ? "Giác ngộ thành công" : r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        if (UI.refreshGeneralsView) UI.refreshGeneralsView(state, makeHandlers());
        else UI.renderGenerals(state, makeHandlers());
      },
      switchActiveTroop: function (id) {
        var r = G.switchHeroActiveTroop(state, id);
        var troopName =
          r.ok && typeof NLDatabase !== "undefined" && NLDatabase.getTroop
            ? (NLDatabase.getTroop(r.activeTroop) || {}).name || r.activeTroop
            : r.activeTroop;
        UI.toast(r.ok ? "Đổi loại binh → " + troopName : r.msg, r.ok ? "good" : "bad");
        if (r.ok) {
          G.saveGame(state);
          refresh();
          if (UI.refreshGeneralsView) UI.refreshGeneralsView(state, makeHandlers());
          else UI.renderGenerals(state, makeHandlers());
        }
      },
      setActiveTroop: function (heroId, troopId) {
        var r = G.setHeroActiveTroop
          ? G.setHeroActiveTroop(state, heroId, troopId)
          : G.switchHeroActiveTroop(state, heroId);
        var troopName =
          r.ok && typeof NLDatabase !== "undefined" && NLDatabase.getTroop
            ? (NLDatabase.getTroop(r.activeTroop) || {}).name || r.activeTroop
            : r.activeTroop;
        UI.toast(r.ok ? "Đổi loại binh → " + troopName : r.msg, r.ok ? "good" : "bad");
        if (r.ok) {
          G.saveGame(state);
          refresh();
          if (UI.refreshGeneralsView) UI.refreshGeneralsView(state, makeHandlers());
          else UI.renderGenerals(state, makeHandlers());
        }
      },
      recruitSoul: function () {
        var r = G.recruitSoulGeneral(state);
        UI.toast(r.ok ? "Chiêu mộ: " + r.general.name : r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        UI.renderGenerals(state, makeHandlers());
      },
      recruitTavern: function (id) {
        var r = G.recruitTavernHero(state, id);
        UI.toast(
          r.ok ? r.msg + " · Đeo đồ ở Trang bị, rồi ra Phó Bản." : r.msg,
          r.ok ? "good" : "bad"
        );
        G.saveGame(state);
        refresh();
        if (r.ok) UI.renderGenerals._tab = "owned";
        UI.renderGenerals(state, makeHandlers());
      },
      openEquip: function () {
        UI.renderEquip._focusGid = null;
        openNav("equip");
      },
      openEquipGeneral: function (gid) {
        UI.renderEquip._focusGid = gid || null;
        openNav("equip");
      },
      openCampaign: function () {
        openNav("tower");
      },
      _openPanel: function (panel, opts) {
        if (panel === "generals" || (opts && opts.tavern)) openNav._tavernNext = true;
        openNav(panel === "tower" ? "tower" : panel);
      },
      openGeneralsTavern: function () {
        UI.renderGenerals._sub = "chieumo";
        UI.renderGenerals._tab = null;
        openNav("generals");
      },
      openGeneralsOwned: function () {
        UI.renderGenerals._sub = "tuong";
        UI.renderGenerals._tab = null;
        openNav("generals");
      },
      deploySlot: function (heroId, slot) {
        var r = G.deployHeroSlot(state, heroId, slot);
        UI.toast(r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        if (UI.refreshGeneralsView) UI.refreshGeneralsView(state, makeHandlers());
        else UI.renderGenerals(state, makeHandlers());
      },
      dismissHero: function (heroId) {
        var r = G.dismissHero(state, heroId);
        UI.toast(r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        UI.renderGenerals._detailId = null;
        UI.renderGenerals(state, makeHandlers());
      },
      attackTerritory: function (tid) {
        UI.closePanel();
        startAttack(function () { return G.enemyForTerritory(state, tid); }, function (win, info) {
          if (win) {
            G.onTerritoryWin(state, tid);
            UI.toast("Thôn tính " + info.territory.name + "!", "good");
          } else {
            G.pushLog(state, "Công thất bại.", "bad");
            UI.toast("Công thành thất bại", "bad");
          }
        });
      },
      climbTower: function () {
        UI.closePanel();
        startAttack(function () { return G.enemyForTower(state); }, function (win) {
          if (win) {
            G.onTowerWin(state);
            UI.toast("Phá tầng tháp!", "good");
          } else UI.toast("Thất bại tại tháp", "bad");
        });
      },
      enterArena: function (botId) {
        if (state.arenaLeft <= 0) {
          UI.toast("Hết lượt lôi đài hôm nay", "bad");
          return;
        }
        UI.closePanel();
        startAttack(
          function () { return G.enemyForArena(state, botId); },
          function (win, info) {
            var bid = info && info.botId;
            if (win) {
              var s = G.onArenaWin(state, bid);
              var msg = "Thắng Lôi Đài!";
              if (s && s.rank_swapped) {
                msg += " Lên Hạng #" + s.new_rank + "!";
              }
              UI.toast(msg, "good");
            } else {
              G.onArenaLose(state, bid);
              UI.toast("Thua lôi đài", "bad");
            }
          }
        );
      },
      fightStageQuick: function (chapterId, stageId) {
        if (typeof NLDatabase === "undefined" || typeof NLCombat === "undefined") {
          UI.toast("Combat Engine / DB chưa sẵn sàng", "bad");
          return;
        }
        var prep = G.prepareStageChallenge
          ? G.prepareStageChallenge(state, chapterId, stageId)
          : null;
        if (!prep || !prep.ok) {
          UI.toast((prep && prep.reason) || "Không thể khiêu chiến", "bad");
          return;
        }
        withStageBriefing(prep, function () {
          runStageQuickFight(prep);
        });
      },
      fightStage: function (chapterId, stageId) {
        if (typeof NLDatabase === "undefined" || typeof NLCombat === "undefined") {
          UI.toast("Combat Engine / DB chưa sẵn sàng", "bad");
          return;
        }
        var prep = G.prepareStageChallenge
          ? G.prepareStageChallenge(state, chapterId, stageId)
          : null;
        if (!prep || !prep.ok) {
          UI.toast((prep && prep.reason) || "Không thể khiêu chiến", "bad");
          return;
        }
        withStageBriefing(prep, function () {
          UI.closePanel();
          startAttack(
          function () {
            return {
              team: prep.enemies,
              title: prep.title || prep.stage.name,
              stage: prep.stage,
              chapter: prep.chapter,
              enemyFormation: prep.enemyFormationId,
              staminaCost: prep.staminaCost,
            };
          },
          function (win, info, battleResult) {
            var settled = G.applyStageRewards(
              state,
              info.stage || prep.stage,
              win,
              info.chapter || prep.chapter
            );
            if (UI.setLastCampaignReport && battleResult) {
              UI.setLastCampaignReport(
                buildCampaignReport(prep, settled, win, battleResult)
              );
            }
            if (win) {
              var msg = "Thắng ải: " + prep.stage.name;
              if (settled && settled.unlockedStage) {
                msg += " · Mở: " + settled.unlockedStage.name;
              }
              if (settled && settled.unlockedFeatures && settled.unlockedFeatures.length) {
                msg += " · " + settled.unlockedFeatures.map(function (f) { return f.name; }).join(", ");
              }
              UI.toast(msg, "good");
            } else {
              var lost = settled && settled.foodSpent ? " (−" + settled.foodSpent + " lương)" : "";
              UI.toast("Thất bại tại " + prep.stage.name + lost, "bad");
            }
            G.saveGame(state);
            refresh();
            UI.renderCampaign(state, makeHandlers());
          },
          {
            context: "campaign",
            stageName: prep.stage.name,
            loseTip: "Thử đổi trận pháp, huấn luyện tướng hoặc đeo trang bị.",
          }
        );
        });
      },
    };
  }

  function refresh() {
    if (!state) return;
    UI.renderResources(state, makeHandlers());
    if (city) city.refresh(state);
  }

  function openNav(panel) {
    var h = makeHandlers();
    if (panel === "city-home") {
      UI.closePanel();
      if (UI.closeCityDock) UI.closeCityDock();
      document.querySelectorAll(".nav-item").forEach(function (n) {
        n.classList.toggle("active", n.getAttribute("data-panel") === "city-home");
      });
      var stage = document.querySelector(".game-stage");
      if (stage) {
        stage.classList.add("is-map-focus");
        stage.classList.remove("show-side-rail");
      }
      refresh();
      if (city && city.focusHome) city.focusHome(500);
      return;
    }
    if (UI.closeCityDock) UI.closeCityDock();
    if (panel === "city") UI.renderCityPanel(state, h);
    else if (panel === "generals") {
      if (openNav._tavernNext) {
        UI.renderGenerals._sub = "chieumo";
        openNav._tavernNext = false;
      } else if (!UI.renderGenerals._sub) {
        UI.renderGenerals._sub = "tuong";
      }
      UI.renderGenerals(state, h);
    }
    else if (panel === "world") UI.renderWorld(state, h);
    else if (panel === "tower" || panel === "campaign") UI.renderCampaign(state, h);
    else if (panel === "thap") UI.renderTower(state, h);
    else if (panel === "arena") {
      if (
        typeof NLCampaign !== "undefined" &&
        !NLCampaign.hasFeature(state, "arena") &&
        !(state.campaign && state.campaign.unlockedFeatures && state.campaign.unlockedFeatures.arena)
      ) {
        UI.toast("Lôi đài mở sau khi hạ Boss Chương 1", "bad");
        return;
      }
      UI.renderArena(state, h);
    }
    else if (panel === "equip") UI.renderEquip(state);

    document.querySelectorAll(".nav-item").forEach(function (n) {
      n.classList.toggle("active", n.getAttribute("data-panel") === panel ||
        (panel === "city-home" && n.getAttribute("data-panel") === "city-home"));
    });
  }

  function startAttack(getEnemy, onResult, combatMeta) {
    var info = getEnemy();
    if (!info) {
      UI.toast("Không thể xuất quân", "bad");
      return;
    }
    var curFormId =
      (state.deployed_formation && state.deployed_formation.formation_id) ||
      state.formationId ||
      "crane_wing";
    UI.showFormation(
      state.generals,
      function (teamSlots, formMeta) {
        var pickId =
          (formMeta && formMeta.formationId) ||
          curFormId;
        if (state.deployed_formation) {
          state.deployed_formation.formation_id = pickId;
        }
        state.formationId = pickId;
        if (typeof NLCityEconomy !== "undefined" && NLCityEconomy.setFormationId) {
          NLCityEconomy.setFormationId(state, pickId);
        }
        var fought = G.fightWithTeam(state, teamSlots, info.team, {
          title: info.title,
          enemyFormation: info.enemyFormation || info.enemyFormationId,
          playerFormation: pickId,
        });
        if (!fought.ok) {
          UI.toast(fought.msg, "bad");
          if (NLCity.city && NLCity.city.resume) NLCity.city.resume();
          return;
        }
        function done() {
          onResult(fought.win, info, fought.result);
          G.saveGame(state);
          refresh();
        }
        if (fought.result && typeof NLCombatUI !== "undefined") {
          NLCombatUI.playBattle(fought.result, done, combatMeta || null);
        } else {
          UI.toast(fought.win ? "Thắng!" : "Thua!", fought.win ? "good" : "bad");
          done();
        }
      },
      {
        formationId: curFormId,
        title: info.title || null,
        enemyTeam: info.team || null,
        enemyFormation: info.enemyFormation || info.enemyFormationId || null,
      }
    );
  }

  function enterGame(s) {
    state = s;
    document.getElementById("screen-start").classList.remove("active");
    document.getElementById("screen-game").classList.add("active");
    var stageHome = document.querySelector(".game-stage");
    if (stageHome) {
      stageHome.classList.add("is-map-focus");
      stageHome.classList.remove("show-side-rail");
    }
    if (UI.closeCityDock) UI.closeCityDock();

    var labels = document.getElementById("building-labels");
    function mountCity() {
      if (city) return;
      if (window.NLBoot) NLBoot.beginCity("Đang dựng Thành Chính…");
      city = new NLCity.CityRenderer(null, labels);
      // Expose để combat/form pause Thành Chính khi mở overlay
      NLCity.city = city;
      city.onBuildingClick = function (id) {
        // P0: highlight + panel chi tiết; drawer quản lý mở kèm để nâng cấp nhanh
        if (UI.openCityDock) UI.openCityDock();
        UI.renderBuildingDetail(state, id, makeHandlers());
        if (city && city.focusBuilding) city.focusBuilding(id, 500);
      };
      city.onDeployClick = function () {
        openNav("tower");
      };
      city.bindInput();
      if (state) city.refresh(state);
      var ready = city.whenReady ? city.whenReady() : Promise.resolve();
      ready.then(function () {
        if (window.NLBoot) {
          NLBoot.setProgress(92, "Gắn bản đồ…");
          NLBoot.endCity();
        }
      }, function () {
        if (window.NLBoot) NLBoot.endCity();
      });
      // Tiến độ giả nhẹ trong lúc chờ GLB (asset phụ có soft timeout)
      if (window.NLBoot) {
        var ticks = [62, 72, 82];
        ticks.forEach(function (p, i) {
          setTimeout(function () {
            if (window.NLBoot) NLBoot.setProgress(p, "Đang dựng Thành Chính…");
          }, 400 * (i + 1));
        });
      }
    }
    // NLCity là ES module (src/main.ts), nạp sau script thường
    if (typeof NLCity === "undefined") window.addEventListener("nl-city-ready", mountCity, { once: true });
    else mountCity();
    // đợi layout xong rồi mới resize/render
    requestAnimationFrame(function () {
      refresh();
    });

    if (!autosaveStarted) {
      autosaveStarted = true;
      // Tick 1s: sản xuất real-time + countdown nâng cấp
      setInterval(function () {
        if (!state) return;
        G.applyElapsed(state);
        UI.renderResources(state, makeHandlers());
        if (city) city.refresh(state);
      }, 1000);
      // Autosave 30s
      setInterval(function () {
        if (!state) return;
        G.saveGame(state);
      }, 30000);
    }
  }

  // Start screen
  document.querySelectorAll("#faction-pick .faction").forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectedFaction = btn.dataset.faction;
      document.querySelectorAll("#faction-pick .faction").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  });

  var cont = document.getElementById("btn-continue");
  if (G.hasSave()) cont.hidden = false;

  document.getElementById("btn-new").addEventListener("click", function () {
    var name = document.getElementById("player-name").value.trim() || "Thành Chủ";
    if (G.hasSave() && !confirm("Tạo mới sẽ ghi đè save cũ?")) return;
    var s = G.createNewGame(name, selectedFaction);
    G.saveGame(s);
    enterGame(s);
  });

  var btnNewMax = document.getElementById("btn-new-max");
  if (btnNewMax) {
    btnNewMax.addEventListener("click", function () {
      var name = document.getElementById("player-name").value.trim() || "Thành Chủ";
      if (G.hasSave() && !confirm("Tạo mới MAX sẽ ghi đè save cũ?")) return;
      var s = G.createNewGame(name, selectedFaction);
      var r = G.debugMaxAllHeroes(s);
      G.saveGame(s);
      enterGame(s);
      UI.toast(
        r.ok ? "DEV: max " + r.count + " tướng · Ty Vũ 180 · bạc/lương đầy" : r.msg,
        r.ok ? "good" : "bad"
      );
    });
  }

  cont.addEventListener("click", function (e) {
    var s = G.loadGame();
    if (!s) { alert("Không đọc được save."); return; }
    if (e.shiftKey) {
      G.debugMaxAllHeroes(s);
      G.saveGame(s);
    }
    enterGame(s);
    if (e.shiftKey) UI.toast("DEV: đã max tướng trên save", "good");
  });

  // Trong game: console → NLCheat.maxHeroes() hoặc ?cheat=max
  window.NLCheat = {
    maxHeroes: function () {
      if (!state) {
        UI.toast("Chưa vào game", "bad");
        return;
      }
      var r = G.debugMaxAllHeroes(state);
      G.saveGame(state);
      refresh();
      if (UI.refreshGeneralsView) UI.refreshGeneralsView(state, makeHandlers());
      UI.toast(r.ok ? "Max " + r.count + " tướng" : r.msg, r.ok ? "good" : "bad");
      return r;
    },
  };

  // HUD
  document.getElementById("btn-tick").addEventListener("click", function () {
    if (!state) return;
    G.tickHour(state);
    G.saveGame(state);
    refresh();
    UI.toast("+1 giờ tài nguyên", "good");
  });

  document.getElementById("btn-save").addEventListener("click", function () {
    if (!state) return;
    G.saveGame(state);
    UI.toast("Đã lưu", "good");
  });

  document.getElementById("btn-menu").addEventListener("click", function () {
    if (!state) return;
    G.saveGame(state);
    if (confirm("Thoát về menu? (đã lưu)")) location.reload();
  });

  document.getElementById("btn-day").addEventListener("click", function () {
    if (!state) return;
    G.tickHour(state);
    G.saveGame(state);
    refresh();
  });

  document.getElementById("bottom-nav").addEventListener("click", function (e) {
    var item = e.target.closest(".nav-item");
    if (!item || !state) return;
    var panel = item.getAttribute("data-panel");
    if (panel === "generals") openNav._tavernNext = true;
    openNav(panel);
  });

  document.querySelectorAll(".qbtn[data-panel], .side-btn[data-panel]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!state) return;
      openNav(btn.getAttribute("data-panel"));
    });
  });

  document.getElementById("panel-close").addEventListener("click", UI.closePanel);
  document.getElementById("panel-backdrop").addEventListener("click", UI.closePanel);

  var btnManage = document.getElementById("btn-city-manage");
  if (btnManage) {
    btnManage.addEventListener("click", function () {
      if (!state) return;
      var opening = !(UI.isCityDockOpen && UI.isCityDockOpen());
      if (opening && UI.renderCityDock) UI.renderCityDock(state, makeHandlers());
      if (UI.toggleCityDock) UI.toggleCityDock();
    });
  }
  var btnDockClose = document.getElementById("btn-city-dock-close");
  if (btnDockClose) {
    btnDockClose.addEventListener("click", function () {
      if (UI.closeCityDock) UI.closeCityDock();
    });
  }
  var dockScrim = document.getElementById("city-dock-scrim");
  if (dockScrim) {
    dockScrim.addEventListener("click", function () {
      if (UI.closeCityDock) UI.closeCityDock();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var combat = document.getElementById("combat-overlay");
    var form = document.getElementById("form-overlay");
    var panel = document.getElementById("panel-layer");
    if (UI.isCityDockOpen && UI.isCityDockOpen()) {
      UI.closeCityDock();
      return;
    }
    if (form && !form.hidden) {
      form.hidden = true;
      if (UI.disposeFormPreview) UI.disposeFormPreview();
      return;
    }
    // Combat ưu tiên hơn panel (tránh Escape đóng panel dưới lớp trận)
    if (combat && !combat.hidden) {
      var closeBtn = document.getElementById("btn-combat-close");
      // Chỉ đóng khi trận đã kết thúc (nút hiện); giữa trận bỏ qua để không abort reward
      if (closeBtn && !closeBtn.hidden) closeBtn.click();
      return;
    }
    if (panel && !panel.hidden) {
      UI.closePanel();
    }
  });

  // Smoke harness: ?smoke=1 hoặc sessionStorage.nl_ui_smoke → vào game không hỏi confirm
  var smokeFlag =
    /\bsmoke=1\b/.test(location.search) ||
    (function () {
      try {
        return sessionStorage.getItem("nl_ui_smoke") === "1";
      } catch (e) {
        return false;
      }
    })();
  if (smokeFlag) {
    try {
      try {
        sessionStorage.removeItem("nl_ui_smoke");
      } catch (e2) {}
      var smokeName = "Kiểm Thử";
      var smoke = G.createNewGame(smokeName, "shu");
      G.saveGame(smoke);
      enterGame(smoke);
      document.documentElement.setAttribute("data-smoke", "ready");
    } catch (err) {
      document.documentElement.setAttribute("data-smoke", "error");
      console.error(err);
    }
  }

  if (/\bcheat=max\b/.test(location.search)) {
    setTimeout(function () {
      if (state && window.NLCheat) window.NLCheat.maxHeroes();
    }, 900);
  }
})();
