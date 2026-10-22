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

  function renderWorld(state, handlers) {
    var html =
      panelHead("Đồ", "Thế giới", "Công thành AI để thôn tính lãnh địa.") +
      '<div class="row-btns" style="margin:0 0 0.6rem">' +
      '<button type="button" class="btn-game" id="btn-open-tower">Tháp thí luyện (Tầng ' +
      (state.towerFloor || 1) +
      ")</button>" +
      "</div>" +
      '<div class="world-map">' +
      state.world.map(function (t) {
        var mine = t.owner === "player";
        return (
          '<button type="button" class="territory ' + (mine ? "mine" : "ai") + '" data-tid="' + t.id + '"' +
          (mine ? " disabled" : "") + ">" +
          '<span class="t-name">' + t.name + "</span>" +
          '<span class="t-meta">' + (mine ? "Của bạn" : "AI · " + t.lord) +
          "<br/>×" + t.power.toFixed(2) + "</span></button>"
        );
      }).join("") +
      "</div>";
    openPanel(html);
    var towerBtn = document.getElementById("btn-open-tower");
    if (towerBtn) {
      towerBtn.addEventListener("click", function () {
        renderTower(state, handlers);
      });
    }
    document.querySelectorAll("#panel-body [data-tid]").forEach(function (btn) {
      if (btn.disabled) return;
      btn.addEventListener("click", function () {
        handlers.attackTerritory(btn.getAttribute("data-tid"));
      });
    });
  }

  function renderTower(state, handlers) {
    var pct = ((state.towerFloor - 1) / G.MAX_TOWER) * 100;
    var html =
      panelHead("Tháp", "Tháp thí luyện", "40 tầng · thắng nhận hồn tướng") +
      statPills([
        { label: "Tầng", value: state.towerFloor + "/" + G.MAX_TOWER },
        { label: "Hồn tướng", value: fmt(state.souls || 0) },
      ]) +
      '<div class="progress-block"><strong>Tầng ' + state.towerFloor + "/" + G.MAX_TOWER + "</strong>" +
      '<div class="floor-bar"><i style="width:' + pct + '%"></i></div>' +
      '<button type="button" class="btn-game primary" id="btn-tower">Chinh phục</button></div>';
    openPanel(html);
    var btnTower = document.getElementById("btn-tower");
    if (btnTower && handlers && handlers.climbTower) {
      btnTower.addEventListener("click", handlers.climbTower);
    }
  }

  function renderArena(state, handlers) {
    var rows = typeof NLArena !== "undefined" ? NLArena.getLeaderboard(state) : [];
    var ar = state.arena || {};
    var pRank = ar.player_rank || "-";
    var honor = ar.honor || 0;

    var html =
      panelHead("Đài", "Lôi Đài Tam Quốc", "Đánh thắng đối thủ xếp trên để đổi hạng.") +
      statPills([
        { label: "Hạng", value: "#" + pRank },
        { label: "Vinh quang", value: fmt(honor) },
        { label: "Lượt", value: String(state.arenaLeft) },
        { label: "Ngày", value: String(state.day) },
      ]) +
      '<div class="progress-block" style="max-height:60vh;overflow:auto">';

    rows.forEach(function (r) {
      var badgeColor =
        r.tier === "STRONG"
          ? "#fca5a5"
          : r.tier === "MEDIUM"
          ? "#fde68a"
          : r.tier === "PLAYER"
          ? "#86efac"
          : "#cbd5e1";
      var btn = r.isPlayer
        ? '<span class="lvl" style="color:#86efac">BẠN</span>'
        : '<button type="button" class="btn-game primary" data-bot="' +
          r.bot_id +
          '"' +
          (state.arenaLeft <= 0 ? " disabled" : "") +
          ">Khiêu chiến</button>";
      html +=
        '<div class="nl-rank-row' +
        (r.isPlayer ? " is-you" : "") +
        '">' +
        '<span class="nl-rank-num">#' +
        r.rank +
        "</span>" +
        "<span style='flex:1;font-size:0.85rem'>" +
        r.name +
        ' <span class="lvl" style="color:' +
        badgeColor +
        '">' +
        r.tier +
        " · Lv." +
        r.level +
        "</span>" +
        '<span class="meta" style="margin-left:0.5rem">LC ' +
        fmt(r.power) +
        "</span></span>" +
        btn +
        "</div>";
    });

    html += "</div>";
    openPanel(html);

    document.querySelectorAll("#panel-body [data-bot]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handlers.enterArena(btn.getAttribute("data-bot"));
      });
    });
  }


  U.renderWorld = renderWorld;
  U.renderTower = renderTower;
  U.renderArena = renderArena;
})(window.NLUIParts = window.NLUIParts || {});
