/* global window, NLGame, NLUIParts */
(function (U) {
  "use strict";
  var G = NLGame;
  function fmt(n) {
    return Math.floor(n).toLocaleString("vi-VN");
  }

  /** Icon wiki theo bậc — không dùng SVG procedural / NPC. */
  function troopTierOf(g) {
    if (g && g.troopTier != null) return g.troopTier | 0;
    var lv = (g && g.level) || 1;
    if (typeof NLDatabase !== "undefined" && NLDatabase.troopTierForLevel) {
      return NLDatabase.troopTierForLevel(lv) | 0;
    }
    return 1;
  }

  function troopSprite(troop, tier) {
    var n = Math.max(1, Math.min(6, (tier == null ? 1 : tier) | 0));
    var key = troop || "infantry";
    return "assets/units/battle/wiki-" + key + "-t" + n + ".png";
  }

  /** Portrait wiki CDN → fallback sprite binh chủng */
  function generalArt(g) {
    if (g && g.portraitUrl) return g.portraitUrl;
    if (g && typeof NLDatabase !== "undefined" && NLDatabase.generalPortraitUrl) {
      var u = NLDatabase.generalPortraitUrl(g.key || g.generalId || g.id);
      if (u) return u;
    }
    return troopSprite(g && g.troop, troopTierOf(g));
  }

  function troopChar(troop) {
    var map = { cavalry: "Kỵ", infantry: "Bộ", spear: "Thương", archer: "Cung", strategist: "Mưu" };
    return map[troop] || "Tướng";
  }

  function troopShort(troop) {
    var map = { cavalry: "Kỵ", infantry: "Bộ", spear: "Thương", archer: "Cung", strategist: "Mưu" };
    return map[troop] || troop || "";
  }

  function shortFlag(name) {
    if (!name) return "Binh";
    return String(name).replace(/\s+/g, "").slice(0, 2);
  }

  /** Ô bày trận: sprite binh chủng 3D-style SVG (không dùng portrait AI) */
  function troopTierLabel(g) {
    var tier =
      g.troopTier != null
        ? g.troopTier
        : typeof NLDatabase !== "undefined" && NLDatabase.troopTierForLevel
        ? NLDatabase.troopTierForLevel(g.level || 1)
        : 1;
    if (g.troopTierName) return g.troopTierName;
    var tr =
      typeof NLDatabase !== "undefined" && NLDatabase.getTroop
        ? NLDatabase.getTroop(g.troop || "infantry")
        : null;
    if (tr && tr.tierNames && tr.tierNames[tier - 1]) return tr.tierNames[tier - 1];
    return "Bậc " + tier;
  }

  function formatSlotMod(mod) {
    if (!mod) return "";
    var bits = [];
    if (mod.atk != null && mod.atk !== 1) {
      bits.push("ATK " + (mod.atk >= 1 ? "+" : "") + Math.round((mod.atk - 1) * 100) + "%");
    }
    if (mod.def != null && mod.def !== 1) {
      bits.push("DEF " + (mod.def >= 1 ? "+" : "") + Math.round((mod.def - 1) * 100) + "%");
    }
    return bits.join(" · ");
  }

  function formSlotCard(g, slotIndex, activeTroopMap, opts) {
    opts = opts || {};
    var pickCls = opts.swapPick ? " swap-pick" : "";
    var modTxt = formatSlotMod(opts.slotMod);
    var modCls =
      opts.slotMod &&
      ((opts.slotMod.atk != null && opts.slotMod.atk < 1) ||
        (opts.slotMod.def != null && opts.slotMod.def < 1))
        ? " down"
        : "";
    var modHtml = modTxt
      ? '<span class="form-slot-mod' + modCls + '">' + modTxt + "</span>"
      : "";
    if (!g) {
      return (
        '<div class="slot empty' +
        pickCls +
        '" data-slot="' +
        slotIndex +
        '" title="Chạm để xếp / đổi chỗ">' +
        '<div class="f-empty-ico" aria-hidden="true">＋</div>' +
        '<span class="f-empty-num">Ô ' +
        (slotIndex + 1) +
        "</span>" +
        modHtml +
        "</div>"
      );
    }
    var active =
      (activeTroopMap && activeTroopMap[g.id]) || g.activeTroop || g.troop || "infantry";
    var troop = active;
    var tier = troopTierOf(g);
    var tierLbl = troopTierLabel(Object.assign({}, g, { troop: troop }));
    var dualBtn = "";
    if (g.troop2) {
      dualBtn =
        '<button type="button" class="f-dual-btn" data-dual="' +
        g.id +
        '" title="Đổi binh chủng">' +
        troopChar(g.troop || "infantry") +
        "⇄" +
        troopChar(g.troop2) +
        " · " +
        troopChar(troop) +
        "</button>";
    }
    return (
      '<div class="slot filled troop-' +
      troop +
      pickCls +
      '" data-slot="' +
      slotIndex +
      '" title="Chạm chọn để đổi chỗ · chạm lại để gỡ">' +
      '<div class="f-flag">' +
      shortFlag(g.name) +
      "</div>" +
      '<div class="f-art">' +
      '<img class="f-sprite solo" src="' +
      troopSprite(troop, tier) +
      '" alt="" draggable="false" />' +
      '<span class="f-troop-badge">' +
      troopChar(troop) +
      "</span>" +
      "</div>" +
      '<div class="f-plate">' +
      "<strong>" +
      g.name +
      "</strong>" +
      dualBtn +
      '<span class="slot-troop">' +
      tierLbl +
      " · Lv." +
      (g.level || 1) +
      "</span>" +
      modHtml +
      "</div>" +
      "</div>"
    );
  }

  function formPoolChip(g, selected) {
    var troop = g.troop || "infantry";
    var tier = troopTierOf(g);
    return (
      '<button type="button" class="chip form-chip' +
      (selected ? " on" : "") +
      " troop-" +
      troop +
      '" data-gid="' +
      g.id +
      '">' +
      '<span class="form-chip-art">' +
      '<img class="form-chip-sprite solo" src="' +
      troopSprite(troop, tier) +
      '" alt="" draggable="false" />' +
      "</span>" +
      '<span class="form-chip-meta">' +
      "<b>" +
      g.name +
      "</b>" +
      "<small>" +
      troopTierLabel(g) +
      " · Lv." +
      (g.level || 1) +
      "</small>" +
      "</span>" +
      (selected ? '<span class="form-chip-check" aria-hidden="true">✓</span>' : "") +
      "</button>"
    );
  }

  var BUILDING_SPRITES = {
    hall: "assets/city/buildings/cn/hall-temple-cn.png",
    ty_vu: "assets/city/buildings/cn/hall-temple-cn.png",
    farm: "assets/city/buildings/cn/teahouse-cn.png",
    nong_trai: "assets/city/buildings/cn/teahouse-cn.png",
    academy: "assets/city/buildings/cn/warehouse-cn.png",
    kho: "assets/city/buildings/cn/warehouse-cn.png",
    nha_kho: "assets/city/buildings/cn/warehouse-cn.png",
    barracks: "assets/city/buildings/cn/pagoda-cn.png",
    doanh_trai: "assets/city/buildings/cn/pagoda-cn.png",
    mine: "assets/city/buildings/cn/shrine-cn.png",
    mo_bac: "assets/city/buildings/cn/shrine-cn.png",
  };

  function panelHead(ico, title, sub) {
    var seal = ico || "Sách";
    if (seal.length > 2) seal = seal.charAt(0);
    return (
      '<div class="nl-panel-head">' +
      '<div class="nl-panel-ico" aria-hidden="true">' +
      seal +
      "</div>" +
      "<div>" +
      "<h2>" +
      title +
      "</h2>" +
      (sub ? '<p class="nl-panel-sub">' + sub + "</p>" : "") +
      "</div></div>"
    );
  }

  function statPills(items) {
    return (
      '<div class="nl-stat-row">' +
      items
        .map(function (it) {
          return (
            '<span class="nl-stat-pill">' +
            it.label +
            ": <b>" +
            it.value +
            "</b></span>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function toast(msg, type) {
    var el = document.getElementById("nl-toast");
    if (!el) return;
    el.hidden = false;
    el.className = "nl-toast" + (type ? " " + type : "");
    el.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, 2200);
  }

  var _lastSilver = null;
  var _lastFood = null;

  function openPanel(html) {
    var sheet = document.getElementById("panel-sheet");
    var body = document.getElementById("panel-body");
    var layer = document.getElementById("panel-layer");
    if (body) body.innerHTML = html;
    if (layer) layer.hidden = false;
    if (sheet) {
      sheet.style.animation = "none";
      void sheet.offsetWidth;
      sheet.style.animation = "";
    }
  }

  function closePanel() {
    var layer = document.getElementById("panel-layer");
    if (layer) layer.hidden = true;
  }

  function disposeFormPreview() {
    var host = document.getElementById("form-preview-3d");
    if (host && host._br) {
      try {
        host._br.dispose();
      } catch (e) {}
      host._br = null;
    }
    // Giữ badge tên trận — mount 3D chỉ clear .battle-gl-host
    var badge = document.getElementById("form-preview-badge");
    if (badge) badge.hidden = true;
  }

  /** Chuỗi đọc được từ entry battleLog (object) hoặc string sẵn. */
  function formatBattleLogLine(entry) {
    if (entry == null) return "";
    if (typeof entry === "string") return entry;
    var act =
      entry.action_type === "SKILL" && entry.skill_name
        ? entry.skill_name
        : "Tấn công";
    var parts = (entry.targets || []).map(function (t) {
      if (!t) return "";
      if (t.is_miss) return (t.target_name || "?") + " né";
      if (t.support) return (t.target_name || "?") + " hỗ trợ";
      var dmg = t.damage_dealt || 0;
      return (
        (t.target_name || "?") +
        " −" +
        dmg +
        (t.is_crit ? " chí mạng" : "") +
        (t.is_defeated ? " (hạ)" : "")
      );
    }).filter(Boolean);
    return (
      "H" +
      (entry.round != null ? entry.round : "?") +
      " · " +
      (entry.actor_name || "?") +
      " · " +
      act +
      (parts.length ? " → " + parts.join(", ") : "")
    );
  }


  U.fmt = fmt;
  U.troopTierOf = troopTierOf;
  U.troopSprite = troopSprite;
  U.generalArt = generalArt;
  U.troopChar = troopChar;
  U.troopShort = troopShort;
  U.shortFlag = shortFlag;
  U.troopTierLabel = troopTierLabel;
  U.formatSlotMod = formatSlotMod;
  U.formSlotCard = formSlotCard;
  U.formPoolChip = formPoolChip;
  U.panelHead = panelHead;
  U.statPills = statPills;
  U.toast = toast;
  U.openPanel = openPanel;
  U.closePanel = closePanel;
  U.disposeFormPreview = disposeFormPreview;
  U.formatBattleLogLine = formatBattleLogLine;
})(window.NLUIParts = window.NLUIParts || {});
