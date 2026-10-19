/* global NLGame, NLUI, NLCity */
(function () {
  var G = NLGame;
  var UI = NLUI;
  var state = null;
  var selectedFaction = "shu";
  var autosaveStarted = false;
  var city = null;

  function summarizeCampaignRewards(settled, win) {
    if (!settled) return "";
    if (!win) return "Tiêu hao: −" + (settled.foodSpent || 0) + " Lương thực";
    var parts = [];
    var silver = 0;
    var exp = 0;
    var prestige = 0;
    var generals = [];
    (settled.rewards || []).forEach(function (r) {
      if (r.type === "silver") silver += r.amount || 0;
      else if (r.type === "exp") exp += r.amount || 0;
      else if (r.type === "prestige") prestige += r.amount || 0;
      else if (r.type === "general" && r.name) generals.push(r.name);
      else if (r.type === "hint" && r.text) parts.push(r.text);
    });
    if (settled.rewardsGained) {
      silver += settled.rewardsGained.silver || 0;
      exp += settled.rewardsGained.exp || 0;
      prestige += settled.rewardsGained.prestige || 0;
    }
    if (silver) parts.unshift("+" + silver + " Bạc");
    if (exp) parts.push("+" + exp + " EXP");
    if (prestige) parts.push("+" + prestige + " Danh vọng");
    if (generals.length) parts.push("Thu phục " + generals.join(", "));
    return parts.length ? "Thưởng: " + parts.join(" · ") : "";
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
          UI.renderCityPanel(state, makeHandlers());
        }
      },
      train: function (id) {
        var r = G.trainGeneral(state, id);
        UI.toast(r.ok ? "Huấn luyện xong" : r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        UI.renderGenerals(state, makeHandlers());
      },
      enhance: function (id) {
        var r = G.enhanceGeneral(state, id);
        UI.toast(r.ok ? "Cường hóa thành công" : r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        UI.renderGenerals(state, makeHandlers());
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
        UI.toast(r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        UI.renderGenerals(state, makeHandlers());
      },
      deploySlot: function (heroId, slot) {
        var r = G.deployHeroSlot(state, heroId, slot);
        UI.toast(r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
        UI.renderGenerals(state, makeHandlers());
      },
      dismissHero: function (heroId) {
        var r = G.dismissHero(state, heroId);
        UI.toast(r.msg, r.ok ? "good" : "bad");
        G.saveGame(state);
        refresh();
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
        // Lấy đội hình đã ra trận (hoặc 3 tướng đầu tiên)
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
          var rewardSummary = summarizeCampaignRewards(settled, fought.win);
          if (UI.setLastCampaignReport && fought.result) {
            UI.setLastCampaignReport({
              stageName: prep.stage.name,
              win: fought.win,
              rounds: fought.result.rounds || 1,
              logs: fought.result.battleLog || fought.result.logs || fought.battleLog || [],
              rewardSummary: rewardSummary,
            });
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
        // Đóng panel trước combat để Escape không đóng nhầm panel dưới lớp trận
        UI.closePanel();
        if (fought.result && typeof NLCombatUI !== "undefined") {
          NLCombatUI.playBattle(fought.result, finalize);
        } else {
          finalize();
        }
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
            var rewardSummary = summarizeCampaignRewards(settled, win);
            if (UI.setLastCampaignReport && battleResult) {
              UI.setLastCampaignReport({
                stageName: prep.stage.name,
                win: win,
                rounds: battleResult.rounds || 1,
                logs: battleResult.battleLog || battleResult.logs || [],
                rewardSummary: rewardSummary,
              });
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
          }
        );
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
      document.querySelectorAll(".nav-item").forEach(function (n) {
        n.classList.toggle("active", n.getAttribute("data-panel") === "city-home");
      });
      refresh();
      return;
    }
    if (panel === "city") UI.renderCityPanel(state, h);
    else if (panel === "generals") UI.renderGenerals(state, h);
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

  function startAttack(getEnemy, onResult) {
    var info = getEnemy();
    if (!info) {
      UI.toast("Không thể xuất quân", "bad");
      return;
    }
    UI.showFormation(state.generals, function (teamSlots) {
      var fought = G.fightWithTeam(state, teamSlots, info.team, {
        title: info.title,
        enemyFormation: info.enemyFormation,
        playerFormation: info.playerFormation,
      });
      if (!fought.ok) {
        UI.toast(fought.msg, "bad");
        return;
      }
      function done() {
        onResult(fought.win, info, fought.result);
        G.saveGame(state);
        refresh();
      }
      if (fought.result && typeof NLCombatUI !== "undefined") {
        NLCombatUI.playBattle(fought.result, done);
      } else {
        UI.toast(fought.win ? "Thắng!" : "Thua!", fought.win ? "good" : "bad");
        done();
      }
    });
  }

  function enterGame(s) {
    state = s;
    document.getElementById("screen-start").classList.remove("active");
    document.getElementById("screen-game").classList.add("active");

    var labels = document.getElementById("building-labels");
    function mountCity() {
      if (city) return;
      if (window.NLBoot) NLBoot.beginCity("Đang dựng Thành Chính…");
      city = new NLCity.CityRenderer(null, labels);
      city.onBuildingClick = function (id) {
        UI.renderBuildingDetail(state, id, makeHandlers());
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

  cont.addEventListener("click", function () {
    var s = G.loadGame();
    if (!s) { alert("Không đọc được save."); return; }
    enterGame(s);
  });

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
    openNav(item.getAttribute("data-panel"));
  });

  document.querySelectorAll(".qbtn[data-panel], .side-btn[data-panel]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!state) return;
      openNav(btn.getAttribute("data-panel"));
    });
  });

  document.getElementById("panel-close").addEventListener("click", UI.closePanel);
  document.getElementById("panel-backdrop").addEventListener("click", UI.closePanel);

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var combat = document.getElementById("combat-overlay");
    var form = document.getElementById("form-overlay");
    var panel = document.getElementById("panel-layer");
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
})();
