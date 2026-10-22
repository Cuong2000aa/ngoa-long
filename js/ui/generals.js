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

  function renderLinhDangDung(options, activeTroop, heroId, level) {
    if (!options || !options.length) return "";
    var multi = options.length > 1;
    var lv = level || 1;
    var tier =
      typeof NLDatabase !== "undefined" && NLDatabase.troopTierForLevel
        ? NLDatabase.troopTierForLevel(lv)
        : 1;
    var cards = options
      .map(function (tid) {
        var meta =
          typeof NLDatabase !== "undefined" ? NLDatabase.getTroop(tid) : null;
        var info =
          typeof NLDatabase !== "undefined" && NLDatabase.getTroopWikiTier
            ? NLDatabase.getTroopWikiTier(tid, tier)
            : null;
        var on = tid === activeTroop;
        var unitName = (info && info.name) || (meta && meta.name) || tid;
        return (
          '<button type="button" class="linh-card' +
          (on ? " is-on" : "") +
          '"' +
          (multi ? ' data-set-troop="' + heroId + "|" + tid + '"' : " disabled") +
          ' title="' +
          unitName +
          '">' +
          '<img src="' +
          troopSprite(tid, tier) +
          '" alt="" draggable="false" />' +
          "<strong>" +
          unitName +
          "</strong>" +
          "<small>" +
          (meta ? meta.name : troopChar(tid)) +
          "</small>" +
          "</button>"
        );
      })
      .join("");

    var activeMeta =
      typeof NLDatabase !== "undefined" ? NLDatabase.getTroop(activeTroop) : null;
    var activeInfo =
      typeof NLDatabase !== "undefined" && NLDatabase.getTroopWikiTier
        ? NLDatabase.getTroopWikiTier(activeTroop, tier)
        : null;
    var activeName =
      (activeInfo && activeInfo.name) ||
      (activeMeta && activeMeta.name) ||
      activeTroop;
    var grade =
      activeInfo
        ? "ATK ×" + activeInfo.atk + " · DEF ×" + activeInfo.def
        : "";

    return (
      '<div class="linh-panel">' +
      "<h4>Lính đang dùng</h4>" +
      '<div class="linh-row">' +
      '<div class="linh-cards">' +
      cards +
      "</div>" +
      '<div class="linh-info">' +
      '<p class="linh-type">Loại binh: <b class="troop ' +
      activeTroop +
      '">' +
      (activeMeta ? activeMeta.name : troopChar(activeTroop)) +
      "</b></p>" +
      "<strong>" +
      activeName +
      "</strong>" +
      (grade ? '<p class="meta">' + grade + "</p>" : "") +
      (activeInfo && activeInfo.desc
        ? '<p class="meta">[Bậc ' +
          tier +
          "] " +
          activeInfo.desc +
          "</p>"
        : "") +
      (multi
        ? '<p class="meta">Chạm portrait lính để đổi loại (wiki).</p>'
        : '<p class="meta">Wiki chỉ gắn 1 loại binh.</p>') +
      "</div></div></div>"
    );
  }

  function renderTroopLadder(troopId, level, currentTier) {
    if (typeof NLDatabase === "undefined" || !NLDatabase.getTroopWikiTier) return "";
    var rows = "";
    for (var t = 1; t <= 6; t++) {
      var info = NLDatabase.getTroopWikiTier(troopId, t);
      if (!info) continue;
      var unlocked = (level || 1) >= info.unlockLevel;
      var isCur = t === currentTier;
      var cls =
        "troop-tier-row" +
        (isCur ? " is-current" : "") +
        (unlocked ? " is-open" : " is-locked");
      var status = isCur
        ? "Đang dùng"
        : unlocked
        ? "Đã mở"
        : "Cần Lv." + info.unlockLevel;
      rows +=
        '<div class="' +
        cls +
        '">' +
        '<div class="troop-tier-art">' +
        '<img src="' +
        troopSprite(troopId, t) +
        '" alt="" draggable="false" />' +
        '<span class="troop-tier-num">T' +
        t +
        "</span></div>" +
        '<div class="troop-tier-meta">' +
        "<strong>" +
        info.name +
        "</strong>" +
        '<span class="troop-tier-status">' +
        status +
        "</span>" +
        (info.desc ? '<p class="meta">' + info.desc + "</p>" : "") +
        '<p class="meta">ATK ×' +
        info.atk +
        " · DEF ×" +
        info.def +
        (info.unlockLevel > 1 ? " · mở Lv." + info.unlockLevel : "") +
        "</p></div></div>";
    }
    return '<div class="troop-ladder">' + rows + "</div>";
  }

  function generalDetailInnerHtml(state, g) {
    var troopOpts =
      typeof NLDatabase !== "undefined" && NLDatabase.getGeneralTroopOptions
        ? NLDatabase.getGeneralTroopOptions(g.key || g.generalId || g)
        : [g.troop, g.troop2].filter(Boolean);
    if (!troopOpts.length) troopOpts = [g.troop || "infantry"];

    var activeTroop = g.activeTroop || g.troop || troopOpts[0] || "infantry";
    if (troopOpts.indexOf(activeTroop) < 0) activeTroop = troopOpts[0];

    var scaled =
      typeof NLDatabase !== "undefined" && NLDatabase.scaleGeneral
        ? NLDatabase.scaleGeneral(g.key || g.generalId, g.level || 1, {
            quality: g.quality,
            activeTroop: activeTroop,
            horseId: g.horseId,
            equip: g.equip,
          })
        : null;
    var troopId = (scaled && scaled.troop) || activeTroop;
    var tier = (scaled && scaled.troopTier) || troopTierOf(g);
    var tierName =
      (scaled && scaled.troopTierName) ||
      troopTierLabel(Object.assign({}, g, { troop: troopId }));
    var qMeta =
      typeof NLDatabase !== "undefined" ? NLDatabase.getQuality(g.quality) : null;
    var skill =
      typeof NLDatabase !== "undefined"
        ? NLDatabase.getSkillForGeneral
          ? NLDatabase.getSkillForGeneral(g.key || g.generalId, g.quality)
          : NLDatabase.getSkill(g.skillId)
        : null;

    var hp = scaled ? scaled.hp : g.hp;
    var vu = scaled ? scaled.vuLuc : g.vuLuc || g.atk;
    var tl = scaled ? scaled.tongLinh : g.tongLinh || g.def;
    var tri = scaled ? scaled.triLuc : g.triLuc;

    var nextTier = Math.min(6, tier + 1);
    var nextUnlock =
      typeof NLDatabase !== "undefined" && NLDatabase.troopTierUnlockLevel
        ? NLDatabase.troopTierUnlockLevel(nextTier)
        : null;
    var trainHint =
      tier >= 6
        ? "Đã đạt bậc tối đa."
        : "Huấn luyện Lv." + nextUnlock + " → bậc " + nextTier + ".";

    var awakenBtn = g.canAwaken
      ? '<button type="button" class="btn-game primary" data-awaken="' +
        g.id +
        '">Giác ngộ</button>'
      : "";
    var stBadge =
      g.status === "DEPLOYED"
        ? "Ô " + g.deployed_slot
        : "Trong kho";

    var slotBtns = [1, 2, 3, 4, 5]
      .map(function (s) {
        var active = g.deployed_slot === s;
        return (
          '<button type="button" class="btn-game ' +
          (active ? "primary" : "") +
          '" style="padding:0.2rem 0.4rem;font-size:0.72rem" data-slot="' +
          g.id +
          "|" +
          s +
          '">Ô' +
          s +
          "</button>"
        );
      })
      .join("");
    if (g.deployed_slot) {
      slotBtns +=
        '<button type="button" class="btn-game" style="padding:0.2rem 0.4rem;font-size:0.72rem" data-slot="' +
        g.id +
        '|0">Nghỉ</button>';
    }

    return (
      '<div class="gmanage-detail">' +
      '<div class="gmanage-info">' +
      '<div class="gdetail-hero">' +
      '<img class="gdetail-art" src="' +
      generalArt(g) +
      '" alt="" draggable="false" onerror="this.onerror=null;this.src=\'' +
      troopSprite(troopId, tier) +
      '\'" />' +
      '<div class="gdetail-hero-meta">' +
      "<h3>" +
      g.name +
      ' <span class="lvl">Lv.' +
      (g.level || 1) +
      " +" +
      (g.enhance || 0) +
      "</span></h3>" +
      '<p class="meta">' +
      (g.qualityName || g.quality || "") +
      " · " +
      stBadge +
      (qMeta ? " · trần Lv." + (qMeta.maxLevel || "?") : "") +
      "</p>" +
      '<p class="binh-line">Binh: <b class="troop ' +
      troopId +
      '">' +
      binhLineLabel(g) +
      "</b></p>" +
      '<p class="meta">Bậc lính: <b>' +
      tierName +
      "</b></p>" +
      "</div></div>" +
      '<div class="stats gdetail-stats">' +
      "<div><span>C.Huy / TL</span> <b>" +
      tl +
      "</b></div>" +
      "<div><span>Võ / VL</span> <b>" +
      vu +
      "</b></div>" +
      "<div><span>Trí</span> <b>" +
      (tri != null ? tri : "-") +
      "</b></div>" +
      "<div><span>Lính / HP</span> <b>" +
      hp +
      "</b></div></div>" +
      (skill
        ? '<div class="gdetail-skill"><h4>Kỹ: ' +
          skill.name +
          "</h4>" +
          (skill.desc ? '<p class="meta">' + skill.desc + "</p>" : "") +
          "</div>"
        : g.skill
        ? '<div class="gdetail-skill"><h4>Kỹ: ' + g.skill + "</h4></div>"
        : "") +
      '<div class="row-btns" style="margin:0.35rem 0">' +
      slotBtns +
      "</div>" +
      '<div class="row-btns gdetail-actions">' +
      '<button type="button" class="btn-game" data-equip-g="' +
      g.id +
      '">Trang bị</button>' +
      '<button type="button" class="btn-game primary" data-train="' +
      g.id +
      '">Huấn luyện</button>' +
      '<button type="button" class="btn-game" data-enh="' +
      g.id +
      '">Cường hóa</button>' +
      awakenBtn +
      (state.generals.length > 1
        ? '<button type="button" class="btn-game" data-dis="' + g.id + '">Sa thải</button>'
        : "") +
      "</div></div>" +
      '<div class="gmanage-linh">' +
      renderLinhDangDung(troopOpts, troopId, g.id, g.level || 1) +
      '<div class="gdetail-troop">' +
      "<h4>Nâng bậc</h4>" +
      '<p class="meta">' +
      trainHint +
      "</p>" +
      renderTroopLadder(troopId, g.level || 1, tier) +
      "</div></div></div>"
    );
  }

  function bindGeneralManageEvents(state, handlers) {
    document.querySelectorAll("#panel-body [data-pick-g]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        renderGenerals._detailId = btn.getAttribute("data-pick-g");
        renderGenerals(state, handlers);
      });
    });
    document.querySelectorAll("#panel-body [data-train]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handlers.train(btn.getAttribute("data-train"));
      });
    });
    document.querySelectorAll("#panel-body [data-enh]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handlers.enhance(btn.getAttribute("data-enh"));
      });
    });
    document.querySelectorAll("#panel-body [data-awaken]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.awaken) handlers.awaken(btn.getAttribute("data-awaken"));
      });
    });
    document.querySelectorAll("#panel-body [data-equip-g]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.openEquipGeneral) handlers.openEquipGeneral(btn.getAttribute("data-equip-g"));
        else if (handlers.openEquip) handlers.openEquip();
      });
    });
    document.querySelectorAll("#panel-body [data-dis]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.dismissHero) handlers.dismissHero(btn.getAttribute("data-dis"));
      });
    });
    document.querySelectorAll("#panel-body [data-slot]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var p = btn.getAttribute("data-slot").split("|");
        var slot = parseInt(p[1], 10);
        if (handlers.deploySlot) handlers.deploySlot(p[0], slot || null);
      });
    });
    document.querySelectorAll("#panel-body [data-set-troop]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var p = (btn.getAttribute("data-set-troop") || "").split("|");
        if (handlers.setActiveTroop) handlers.setActiveTroop(p[0], p[1]);
        else if (handlers.switchActiveTroop) handlers.switchActiveTroop(p[0]);
      });
    });
  }

  function binhLineLabel(g) {
    var opts =
      typeof NLDatabase !== "undefined" && NLDatabase.getGeneralTroopOptions
        ? NLDatabase.getGeneralTroopOptions(g.key || g.generalId || g)
        : [g.troop, g.troop2].filter(Boolean);
    if (!opts.length) opts = [g.troop || "infantry"];
    return opts
      .map(function (tid) {
        var meta = typeof NLDatabase !== "undefined" ? NLDatabase.getTroop(tid) : null;
        return meta ? meta.name : troopChar(tid);
      })
      .join(" · ");
  }

  function generalTrainPaneHtml(state, g) {
    var awakenBtn = g.canAwaken
      ? '<button type="button" class="btn-game primary" data-awaken="' +
        g.id +
        '">Giác ngộ</button>'
      : '<button type="button" class="btn-game" disabled>Chưa giác ngộ được</button>';
    return (
      '<div class="gsub-pane">' +
      "<h4>Huấn luyện</h4>" +
      '<p class="meta">Tăng cấp · cường hóa · giác ngộ phẩm (wiki).</p>' +
      '<div class="stats gdetail-stats">' +
      "<div><span>Cấp</span> <b>Lv." +
      (g.level || 1) +
      "</b></div>" +
      "<div><span>Cường hóa</span> <b>+" +
      (g.enhance || 0) +
      "</b></div>" +
      "<div><span>Phẩm</span> <b>" +
      (g.qualityName || g.quality || "") +
      "</b></div>" +
      "<div><span>Exp</span> <b>" +
      (g.exp || 0) +
      "</b></div></div>" +
      '<div class="row-btns gdetail-actions">' +
      '<button type="button" class="btn-game primary" data-train="' +
      g.id +
      '">Huấn luyện (+1 cấp)</button>' +
      '<button type="button" class="btn-game" data-enh="' +
      g.id +
      '">Cường hóa</button>' +
      awakenBtn +
      "</div></div>"
    );
  }

  function generalTranPaneHtml(state, g) {
    var active = g.activeTroop || g.troop || "infantry";
    var troopMeta =
      typeof NLDatabase !== "undefined" ? NLDatabase.getTroop(active) : null;
    var tierName = troopTierLabel(Object.assign({}, g, { troop: active }));
    var opts =
      typeof NLDatabase !== "undefined" && NLDatabase.getGeneralTroopOptions
        ? NLDatabase.getGeneralTroopOptions(g.key || g.generalId || g)
        : [g.troop, g.troop2].filter(Boolean);
    var slotBtns = [1, 2, 3, 4, 5]
      .map(function (s) {
        var on = g.deployed_slot === s;
        return (
          '<button type="button" class="btn-game ' +
          (on ? "primary" : "") +
          '" data-slot="' +
          g.id +
          "|" +
          s +
          '">Ô ' +
          s +
          "</button>"
        );
      })
      .join("");
    if (g.deployed_slot) {
      slotBtns +=
        '<button type="button" class="btn-game" data-slot="' +
        g.id +
        '|0">Nghỉ</button>';
    }
    return (
      '<div class="gsub-pane">' +
      "<h4>Trận</h4>" +
      '<p class="binh-line">Binh: <b class="troop ' +
      active +
      '">' +
      binhLineLabel(g) +
      "</b></p>" +
      '<p class="meta">Đang dùng: ' +
      (troopMeta ? troopMeta.name : troopChar(active)) +
      " · " +
      tierName +
      (g.deployed_slot ? " · Đã xuất trận Ô " + g.deployed_slot : " · Chưa xuất trận") +
      "</p>" +
      '<div class="row-btns" style="margin:0.45rem 0">' +
      slotBtns +
      "</div>" +
      renderLinhDangDung(opts, active, g.id, g.level || 1) +
      "</div>"
    );
  }

  function generalEquipPaneHtml(state, g) {
    var slots =
      typeof NLDatabase !== "undefined" && NLDatabase.EQUIP_SLOTS
        ? NLDatabase.EQUIP_SLOTS
        : ["weapon", "armor", "horse", "book", "cloak", "shield", "troop"];
    var labels =
      (typeof NLDatabase !== "undefined" && NLDatabase.SLOT_LABELS) || {};
    var eq = g.equip || {};
    var rows = slots
      .map(function (slot) {
        var curId = eq[slot] || (slot === "horse" ? g.horseId : null) || "";
        var cur =
          curId && typeof NLDatabase !== "undefined" ? NLDatabase.getItem(curId) : null;
        return (
          '<div class="equip-slot">' +
          itemIconHtml(cur) +
          '<div class="equip-slot-meta"><span class="equip-slot-label">' +
          (labels[slot] || slot) +
          '</span><span class="equip-slot-name">' +
          (cur ? cur.name : "Trống") +
          "</span></div></div>"
        );
      })
      .join("");
    return (
      '<div class="gsub-pane">' +
      "<h4>Trang bị · " +
      g.name +
      "</h4>" +
      '<div class="equip-slots">' +
      rows +
      "</div>" +
      '<div class="row-btns" style="margin-top:0.5rem">' +
      '<button type="button" class="btn-game primary" data-equip-g="' +
      g.id +
      '">Mở kho trang bị</button>' +
      "</div></div>"
    );
  }

  function tavernBodyHtml(snap) {
    if (!snap) return '<p class="meta">Tửu Quán chưa sẵn sàng.</p>';
    var list = snap.available.concat(snap.locked.slice(0, 18), snap.owned);
    return (
      '<div class="card-grid">' +
      list
        .map(function (e) {
          var q = typeof NLDatabase !== "undefined" ? NLDatabase.getQuality(e.quality) : null;
          var tr = typeof NLDatabase !== "undefined" ? NLDatabase.getTroop(e.troop) : null;
          var statusTag =
            e.status === "OWNED"
              ? '<span class="lvl" style="color:#86efac">OWNED</span>'
              : e.status === "AVAILABLE"
              ? '<span class="lvl" style="color:#fde68a">AVAILABLE</span>'
              : '<span class="lvl" style="color:#fca5a5">LOCKED</span>';
          var reqLine =
            e.status === "LOCKED"
              ? '<p class="meta" style="color:#fca5a5">' + e.lock_reasons.join(" · ") + "</p>"
              : '<p class="meta">Danh vọng YC: ' +
                fmt(e.required_prestige) +
                " · Ty Vũ Lv." +
                e.required_ty_vu_level +
                "</p>";
          var btn =
            e.status === "OWNED"
              ? '<button type="button" class="btn-game" disabled>Đã chiêu mộ</button>'
              : e.status === "LOCKED"
              ? '<button type="button" class="btn-game" disabled>Chưa mở</button>'
              : '<button type="button" class="btn-game primary" data-rec="' +
                e.recruit_id +
                '"' +
                (e.can_afford ? "" : " disabled") +
                ">" +
                (e.can_afford
                  ? "Chiêu mộ (" + fmt(e.cost_silver) + " bạc)"
                  : "Thiếu bạc (" + fmt(e.cost_silver) + ")") +
                "</button>";
          return (
            '<article class="gcard">' +
            '<div class="gcard-portrait">' +
            '<img class="gcard-art" src="' +
            generalArt(e) +
            '" alt="" draggable="false" onerror="this.onerror=null;this.src=\'' +
            troopSprite(e.troop, 1) +
            '\'" />' +
            "<div>" +
            '<span class="troop ' +
            e.troop +
            '">' +
            (tr ? tr.name : e.troop) +
            " · " +
            (q ? q.name : e.quality) +
            "</span>" +
            "<h3>" +
            e.name +
            " " +
            statusTag +
            "</h3></div></div>" +
            (e.base
              ? '<div class="stats"><div><span>TL</span> <b>' +
                e.base.tongLinh +
                "</b></div><div><span>VL</span> <b>" +
                e.base.vuLuc +
                "</b></div><div><span>Trí</span> <b>" +
                e.base.triLuc +
                "</b></div><div><span>HP</span> <b>" +
                e.base.hp +
                "</b></div></div>"
              : "") +
            reqLine +
            btn +
            "</article>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderGeneralDetail(state, genId, handlers) {
    renderGenerals._detailId = genId;
    renderGenerals._sub = "tuong";
    renderGenerals(state, handlers);
  }

  function refreshGeneralsView(state, handlers) {
    renderGenerals(state, handlers);
  }

  function renderGenerals(state, handlers) {
    var snap =
      typeof NLRecruit !== "undefined" ? NLRecruit.tavernSnapshot(state) : null;
    var cap = snap ? snap.hero_capacity : Math.max(5, (state.generals || []).length);
    var count = snap ? snap.hero_count : (state.generals || []).length;

    if (renderGenerals._tab === "tavern") {
      renderGenerals._sub = "chieumo";
      renderGenerals._tab = null;
    } else if (renderGenerals._tab === "owned" && !renderGenerals._sub) {
      renderGenerals._sub = "tuong";
      renderGenerals._tab = null;
    }
    var sub = renderGenerals._sub || "tuong";
    var SUBS = [
      { id: "tuong", label: "Tướng" },
      { id: "luyen", label: "Huấn luyện" },
      { id: "trangbi", label: "Trang bị" },
      { id: "tran", label: "Trận" },
      { id: "chieumo", label: "Chiêu mộ" },
    ];

    var gens = state.generals || [];
    var selId = renderGenerals._detailId;
    var sel = gens.find(function (x) {
      return x.id === selId;
    });
    if (!sel && gens.length && sub !== "chieumo") {
      sel = gens[0];
      renderGenerals._detailId = sel.id;
    }

    var listHtml = gens
      .map(function (g) {
        var on = sel && g.id === sel.id;
        var tag = g.deployed_slot
          ? '<small class="gmanage-deployed">Đã xuất trận</small>'
          : "<small>Lv." + (g.level || 1) + "</small>";
        return (
          '<button type="button" class="gmanage-pick' +
          (on ? " is-on" : "") +
          '" data-pick-g="' +
          g.id +
          '">' +
          '<img src="' +
          generalArt(g) +
          '" alt="" draggable="false" onerror="this.onerror=null;this.src=\'' +
          troopSprite(g.activeTroop || g.troop, troopTierOf(g)) +
          '\'" />' +
          "<span><b>" +
          g.name +
          "</b>" +
          tag +
          "</span></button>"
        );
      })
      .join("");
    var emptySlots = Math.max(0, cap - gens.length);
    for (var ei = 0; ei < emptySlots && ei < 8; ei++) {
      listHtml +=
        '<button type="button" class="gmanage-pick gmanage-pick-empty" data-sub="chieumo" title="Chiêu mộ thêm">' +
        '<span class="gmanage-plus">+</span>' +
        "<span><b>Trống</b><small>Chiêu mộ</small></span></button>";
    }

    var mainHtml = "";
    if (sub === "chieumo") {
      mainHtml = tavernBodyHtml(snap);
    } else if (!sel) {
      mainHtml = '<p class="meta">Chưa có tướng — mở Chiêu mộ.</p>';
    } else if (sub === "luyen") {
      mainHtml = generalTrainPaneHtml(state, sel);
    } else if (sub === "trangbi") {
      mainHtml = generalEquipPaneHtml(state, sel);
    } else if (sub === "tran") {
      mainHtml = generalTranPaneHtml(state, sel);
    } else {
      mainHtml = generalDetailInnerHtml(state, sel);
    }

    var subNav = SUBS.map(function (s) {
      return (
        '<button type="button" class="gmanage-sub' +
        (sub === s.id ? " is-on" : "") +
        '" data-sub="' +
        s.id +
        '">' +
        s.label +
        "</button>"
      );
    }).join("");

    var html =
      panelHead(
        "Tướng",
        "Nhân vật",
        "Tướng · Huấn luyện · Trang bị · Trận · Chiêu mộ"
      ) +
      statPills([
        { label: "Danh vọng", value: fmt(state.prestige || 0) },
        { label: "Bạc", value: fmt(state.silver || 0) },
        { label: "Kho tướng", value: count + "/" + cap },
      ]) +
      '<div class="gmanage gmanage--shell">' +
      '<aside class="gmanage-list">' +
      '<div class="gmanage-list-cap">' +
      count +
      "/" +
      cap +
      "</div>" +
      (listHtml || '<p class="meta">Chưa có tướng.</p>') +
      "</aside>" +
      '<div class="gmanage-main">' +
      mainHtml +
      "</div>" +
      '<nav class="gmanage-subs">' +
      subNav +
      "</nav></div>";

    openPanel(html);

    document.querySelectorAll("#panel-body [data-sub]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        renderGenerals._sub = btn.getAttribute("data-sub");
        renderGenerals(state, handlers);
      });
    });
    document.querySelectorAll("#panel-body [data-rec]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.recruitTavern) handlers.recruitTavern(btn.getAttribute("data-rec"));
      });
    });
    bindGeneralManageEvents(state, handlers);
  }


  U.renderGenerals = renderGenerals;
  U.renderGeneralDetail = renderGeneralDetail;
  U.refreshGeneralsView = refreshGeneralsView;
})(window.NLUIParts = window.NLUIParts || {});
