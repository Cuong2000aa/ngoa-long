/* global window, NLGame, NLUIParts, NLCityEconomy, NLCampaign, NLArena, NLDatabase */
(function (U) {
  "use strict";
  var G = NLGame;

  var fmt = U.fmt;
  var toast = U.toast;
  var openPanel = U.openPanel;
  var closePanel = U.closePanel;
  var panelHead = U.panelHead;
  var statPills = U.statPills;
  var formSlotCard = U.formSlotCard;
  var formPoolChip = U.formPoolChip;
  var troopTierOf = U.troopTierOf;
  var troopSprite = U.troopSprite;
  var generalArt = U.generalArt;
  var troopChar = U.troopChar;
  var troopShort = U.troopShort;
  var shortFlag = U.shortFlag;
  var troopTierLabel = U.troopTierLabel;
  var formatSlotMod = U.formatSlotMod;
  var disposeFormPreview = U.disposeFormPreview;

  function campaignReportRewardHtml(rep) {
    if (!rep) return "";
    var html = "";
    var sec = rep.rewardSections || {};
    if (sec.rewards && sec.rewards.length) {
      html +=
        '<p class="meta" style="color:#fde68a;margin:0 0 0.2rem"><b>Thưởng:</b> ' +
        sec.rewards.join(" · ") +
        "</p>";
    }
    if (sec.generals && sec.generals.length) {
      html +=
        '<p class="meta" style="color:#86efac;margin:0 0 0.2rem"><b>Thu phục:</b> ' +
        sec.generals.join(", ") +
        "</p>";
    }
    if (sec.items && sec.items.length) {
      html +=
        '<p class="meta" style="color:#fcd34d;margin:0 0 0.2rem"><b>Nhặt:</b> ' +
        sec.items.join(", ") +
        "</p>";
    }
    if (sec.unlockedStage && sec.unlockedStage.name) {
      html +=
        '<p class="meta" style="color:#a5f3fc;margin:0 0 0.2rem"><b>Mở ải:</b> ' +
        sec.unlockedStage.name +
        "</p>";
    }
    if (sec.unlockedFeatures && sec.unlockedFeatures.length) {
      html +=
        '<p class="meta" style="color:#c4b5fd;margin:0 0 0.2rem"><b>Mở tính năng:</b> ' +
        sec.unlockedFeatures
          .map(function (f) {
            return f.name || f.id;
          })
          .join(", ") +
        "</p>";
    }
    var lines = rep.rewardLines;
    if (!html && lines && lines.length) {
      html = lines
        .map(function (line) {
          return '<p class="meta" style="color:#fde68a;margin:0 0 0.25rem">' + line + "</p>";
        })
        .join("");
    }
    if (!html) {
      var summary = rep.rewardSummary;
      if (summary && typeof summary === "object" && summary.text) summary = summary.text;
      if (summary) {
        html = '<p class="meta" style="color:#fde68a;margin:0 0 0.4rem">' + summary + "</p>";
      }
    }
    return html;
  }

  function showCampaignBriefing(prep, narrative, onProceed) {
    var layer = document.getElementById("brief-overlay");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "brief-overlay";
      layer.className = "brief-overlay";
      layer.innerHTML =
        '<div class="brief-backdrop"></div><div class="brief-sheet ornate">' +
        '<button type="button" class="brief-close" aria-label="Đóng">×</button>' +
        '<div id="brief-body"></div></div>';
      document.body.appendChild(layer);
      layer.querySelector(".brief-backdrop").addEventListener("click", function () {
        layer.hidden = true;
      });
      layer.querySelector(".brief-close").addEventListener("click", function () {
        layer.hidden = true;
      });
    }
    var body = layer.querySelector("#brief-body");
    var st = prep.stage;
    var ch = prep.chapter;
    var enemyHtml = "";
    var enemies = [];
    try {
      if (typeof NLCampaign === "undefined") throw new Error("no campaign");
      enemies = NLCampaign.buildEnemies(st).map(function (u) {
        return (u.name || "Địch") + " Lv" + (u.level || 1);
      });
    } catch (e0) {
      enemies = [];
    }
    if (enemies.length) {
      enemyHtml =
        '<p class="meta" style="margin:0.35rem 0"><b>Địch:</b> ' + enemies.join(" · ") + "</p>";
    }
    var rw = st.rewards || {};
    var rewardPreview =
      "−" +
      (prep.staminaCost || st.stamina_cost || 0) +
      " lương · +" +
      (rw.silver || 0) +
      " bạc" +
      (rw.exp ? " · +" + rw.exp + " EXP" : "");
    body.innerHTML =
      '<div class="nl-panel-head" style="border:none;padding:0;margin:0 0 0.5rem">' +
      '<div class="nl-panel-ico" aria-hidden="true">Ải</div><div><h2 style="margin:0">' +
      (st.name || "Phó bản") +
      '</h2><p class="nl-panel-sub">' +
      (ch && ch.name ? ch.name : "") +
      "</p></div></div>" +
      '<p class="lead brief-text">' +
      (narrative.briefing || narrative.mission || narrative.story || "Chuẩn bị xuất quân.") +
      "</p>" +
      enemyHtml +
      '<p class="meta"><b>Chi phí / thưởng:</b> ' +
      rewardPreview +
      "</p>" +
      '<div class="row-btns" style="margin-top:0.75rem">' +
      '<button type="button" class="btn-game" id="brief-cancel">Quay lại</button>' +
      '<button type="button" class="btn-game primary" id="brief-go">Xuất quân</button>' +
      "</div>";
    layer.hidden = false;
    body.querySelector("#brief-cancel").onclick = function () {
      layer.hidden = true;
    };
    body.querySelector("#brief-go").onclick = function () {
      layer.hidden = true;
      if (onProceed) onProceed();
    };
  }

  function renderCampaign(state, handlers) {
    if (typeof NLDatabase === "undefined") {
      openPanel(panelHead("Bản", "Phó Bản", "Database chưa load."));
      return;
    }
    var snap =
      typeof NLCampaign !== "undefined"
        ? NLCampaign.mapSnapshot(state)
        : null;
    var camp = NLDatabase.campaign();
    var html =
      panelHead("Bản", "Phó Bản — Chính tuyến", camp.name || "Chiến dịch") +
      (snap
        ? statPills([
            { label: "Lương", value: fmt(snap.food) },
            { label: "Danh vọng", value: fmt(snap.prestige || 0) },
            {
              label: "Quan hàm",
              value: snap.prestige_rank ? snap.prestige_rank.title : "—",
            },
            { label: "Clear", value: String(snap.cleared_count) },
          ])
        : "");

    if (snap && snap.prestige_rank) {
      html +=
        '<p class="meta">Quan hàm «' +
        snap.prestige_rank.title +
        "» — kho tướng +" +
        (snap.prestige_rank.heroSlotsBonus || 0) +
        " chỗ (cộng Ty Vũ). Thắng ải / thế giới / lôi đài tăng Danh vọng.</p>";
    }

    if (snap && snap.unlockedFeatures && snap.unlockedFeatures.length) {
      html +=
        '<p class="meta">Đã mở: ' +
        snap.unlockedFeatures
          .map(function (f) {
            return typeof NLCampaign !== "undefined" ? NLCampaign.featureLabel(f) : f;
          })
          .join(" · ") +
        "</p>";
    }

    var lastReportHtml = "";
    if (renderCampaign._lastReport) {
      var rep = renderCampaign._lastReport;
      var logLines = (rep.logs || [])
        .map(function (line) {
          return '<div class="c-log-line">' + formatBattleLogLine(line) + "</div>";
        })
        .join("");
      lastReportHtml =
        '<div class="progress-block" id="campaign-last-battle-report" style="border-color:#e8c547;background:rgba(40,24,10,0.85)">' +
        "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem'>" +
        "<strong>Chiến Báo: " +
        rep.stageName +
        " — <span style='color:" +
        (rep.win ? "#86efac" : "#fca5a5") +
        "'>" +
        (rep.win ? "CHIẾN THẮNG" : "THẤT BẠI") +
        "</span></strong>" +
        "<span class='lvl'>" +
        rep.rounds +
        " hiệp</span></div>" +
        campaignReportRewardHtml(rep) +
        (rep.epilogue
          ? '<p class="meta" style="color:#a5f3fc;margin:0 0 0.35rem;font-style:italic">' +
            rep.epilogue +
            "</p>"
          : "") +
        (rep.hasItems && handlers && handlers.openEquip
          ? '<div class="row-btns" style="margin:0 0 0.35rem">' +
            '<button type="button" class="btn-game primary" data-campaign-open-equip>Mở Trang bị</button>' +
            "</div>"
          : "") +
        (rep.hasRecruit && handlers && handlers.openGeneralsOwned
          ? '<div class="row-btns" style="margin:0 0 0.35rem">' +
            '<button type="button" class="btn-game" data-campaign-open-generals>Xem tướng mới</button>' +
            "</div>"
          : "") +
        '<div class="combat-log" style="max-height:180px">' +
        logLines +
        "</div></div>";
    }

    var chapters = snap ? snap.chapters : null;
    if (chapters) {
      html += lastReportHtml;
      chapters.forEach(function (ch) {
        html +=
          '<div class="progress-block"><strong>' +
          ch.chapter_name +
          "</strong>" +
          (ch.unlocked ? "" : ' <span class="lvl">Khoá</span>') +
          '<p class="meta">' +
          (ch.summary || "") +
          "</p>";
        ch.stages.forEach(function (st) {
          var badge = st.cleared ? " [Xong]" : st.unlocked ? "" : " [Khoá]";
          var costLine =
            '<span class="meta">−' +
            st.stamina_cost +
            " lương · +" +
            ((st.rewards && st.rewards.silver) || 0) +
            " bạc" +
            (st.first_clear_prestige && !st.cleared
              ? " · lần đầu +" + st.first_clear_prestige + " danh vọng"
              : "") +
            "</span>";
          var storyLine = "";
          if (st.mission) {
            storyLine =
              '<div class="meta" style="opacity:0.9;margin-top:0.15rem">' + st.mission + "</div>";
          } else if (st.briefing) {
            storyLine =
              '<div class="meta" style="opacity:0.75;margin-top:0.15rem">Mệnh lệnh trước trận — bấm Đánh / Bày trận</div>';
          } else if (st.story) {
            storyLine =
              '<div class="meta" style="opacity:0.9;margin-top:0.15rem">' + st.story + "</div>";
          }
          var enemyLine = "";
          if (st.unlocked && st.enemy_preview && st.enemy_preview.length) {
            enemyLine =
              '<div class="meta" style="margin-top:0.1rem;opacity:0.85">Địch: ' +
              st.enemy_preview
                .map(function (u) {
                  return (u.name || "Địch") + " Lv" + (u.level || 1);
                })
                .join(" · ") +
              (st.enemy_formation_name ? " · " + st.enemy_formation_name : "") +
              "</div>";
          }
          var grantLine = "";
          if (!st.cleared && st.first_clear_general) {
            var gName = st.first_clear_general;
            if (typeof NLDatabase !== "undefined") {
              var gg = NLDatabase.getGeneral(st.first_clear_general);
              if (gg) gName = gg.name;
            }
            grantLine =
              '<div class="meta" style="color:#fde68a;margin-top:0.1rem">Lần đầu thu phục: ' +
              gName +
              "</div>";
          } else if (!st.cleared && st.first_clear_hint) {
            grantLine =
              '<div class="meta" style="margin-top:0.1rem">' + st.first_clear_hint + "</div>";
          }
          var btn;
          if (!st.unlocked) {
            btn = '<button type="button" class="btn-game" disabled>Chưa mở</button>';
          } else if (!st.can_fight) {
            btn = '<button type="button" class="btn-game" disabled>Thiếu lương</button>';
          } else {
            btn =
              '<button type="button" class="btn-game primary" data-stage-quick="' +
              ch.chapter_id +
              "|" +
              st.stage_id +
              '">Đánh</button>' +
              '<button type="button" class="btn-game" style="padding:0.35rem 0.55rem;font-size:0.75rem" data-stage="' +
              ch.chapter_id +
              "|" +
              st.stage_id +
              '" title="Bày trận trước khi đánh">Bày trận</button>';
          }
          html +=
            '<div class="nl-stage-row">' +
            '<div class="nl-stage-info">' +
            st.index +
            ". " +
            st.name +
            ' <span class="lvl">' +
            st.type +
            "</span>" +
            badge +
            "<br/>" +
            costLine +
            storyLine +
            enemyLine +
            grantLine +
            '</div><div class="nl-stage-actions">' +
            btn +
            "</div></div>";
        });
        html += "</div>";
      });
    } else {
      html += "<p class='lead'>NLCampaign chưa load.</p>";
    }

    openPanel(html);
    document.querySelectorAll("#panel-body [data-stage-quick]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var parts = btn.getAttribute("data-stage-quick").split("|");
        if (handlers.fightStageQuick) handlers.fightStageQuick(parts[0], parts[1]);
        else handlers.fightStage(parts[0], parts[1]);
      });
    });
    document.querySelectorAll("#panel-body [data-stage]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var parts = btn.getAttribute("data-stage").split("|");
        handlers.fightStage(parts[0], parts[1]);
      });
    });
    document.querySelectorAll("#panel-body [data-campaign-open-equip]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.openEquip) handlers.openEquip();
      });
    });
    document.querySelectorAll("#panel-body [data-campaign-open-generals]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.openGeneralsOwned) handlers.openGeneralsOwned();
      });
    });
  }

  function setLastCampaignReport(report) {
    renderCampaign._lastReport = report;
  }


  U.showCampaignBriefing = showCampaignBriefing;
  U.renderCampaign = renderCampaign;
  U.setLastCampaignReport = setLastCampaignReport;
})(window.NLUIParts = window.NLUIParts || {});
