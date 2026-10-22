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

  function equipSlotLabels() {
    return (
      (typeof NLDatabase !== "undefined" && NLDatabase.SLOT_LABELS) || {
        weapon: "Vũ khí",
        armor: "Giáp",
        horse: "Ngựa",
        book: "Sách",
        cloak: "Choàng",
        shield: "Thuẫn",
        troop: "Dẫn binh",
      }
    );
  }

  function equipSlots() {
    return (
      (typeof NLDatabase !== "undefined" && NLDatabase.EQUIP_SLOTS) || [
        "weapon",
        "armor",
        "horse",
        "book",
        "cloak",
        "shield",
        "troop",
      ]
    );
  }

  function rarityColor(rarity) {
    var map =
      (typeof NLDatabase !== "undefined" && NLDatabase.RARITY_COLORS) || {};
    return map[rarity] || "#c4a574";
  }

  function formatItemBonuses(item) {
    if (!item) return "";
    if (item.statsWiki && item.statsWiki.length) {
      return item.statsWiki
        .map(function (s) {
          return s.label + " " + s.base + (s.growth ? "(+" + s.growth + ")" : "");
        })
        .join(" · ");
    }
    if (!item.bonuses) return "";
    var labels = { vuLuc: "Vũ", tongLinh: "Thống", triLuc: "Trí", hp: "HP", speed: "Tốc" };
    return Object.keys(item.bonuses)
      .map(function (k) {
        return (labels[k] || k) + " +" + item.bonuses[k];
      })
      .join(" · ");
  }

  function itemIconHtml(item, cls) {
    if (!item) {
      return '<span class="eq-icon eq-icon--empty' + (cls ? " " + cls : "") + '"></span>';
    }
    var url =
      typeof NLDatabase !== "undefined" && NLDatabase.itemIconUrl
        ? NLDatabase.itemIconUrl(item)
        : item.icon;
    var color = rarityColor(item.rarity);
    if (url) {
      return (
        '<img class="eq-icon' +
        (cls ? " " + cls : "") +
        '" src="' +
        url +
        '" alt="" style="border-color:' +
        color +
        '" loading="lazy"/>'
      );
    }
    return (
      '<span class="eq-icon eq-icon--empty' +
      (cls ? " " + cls : "") +
      '" style="border-color:' +
      color +
      '"></span>'
    );
  }

  /** Đếm món trong kho / đang đeo (trừ tướng hiện tại). */
  function equipInventoryPool(state, slot, exceptGid) {
    var counts = {};
    (state.inventory || []).forEach(function (it) {
      var id = it.itemId || it.id;
      if (!id) return;
      var meta = typeof NLDatabase !== "undefined" ? NLDatabase.getItem(id) : null;
      if (!meta || meta.slot !== slot) return;
      var q = it.qty != null ? it.qty : it.count != null ? it.count : 1;
      counts[id] = (counts[id] || 0) + q;
    });
    (state.generals || []).forEach(function (g) {
      if (g.id === exceptGid) return;
      var eq = g.equip || {};
      var worn = eq[slot] || (slot === "horse" ? g.horseId : null);
      if (worn && counts[worn] != null) counts[worn] = Math.max(0, counts[worn] - 1);
    });
    return counts;
  }

  function renderEquip(state) {
    var slots = equipSlots();
    var labels = equipSlotLabels();
    var gens = state.generals || [];
    var invCount = (state.inventory || []).length;
    var html =
      panelHead(
        "Đồ",
        "Trang bị",
        "7 ô wiki — vũ khí · giáp · ngựa · sách · choàng · thuẫn · dẫn binh. Chỉ số cộng vào trận."
      ) +
      statPills([
        { label: "Uy danh", value: fmt(state.prestige) },
        { label: "Kho đồ", value: String(invCount) },
        { label: "Tướng", value: String(gens.length) },
      ]);

    html += '<div class="equip-list">';
    gens.forEach(function (g) {
      var troop = g.troop || "infantry";
      var eq = g.equip || {};
      var bonusPreview = { vuLuc: 0, tongLinh: 0, triLuc: 0, hp: 0, speed: 0 };
      slots.forEach(function (slot) {
        var iid = eq[slot] || (slot === "horse" ? g.horseId : null);
        var it = iid && typeof NLDatabase !== "undefined" ? NLDatabase.getItem(iid) : null;
        if (it && it.bonuses) {
          Object.keys(it.bonuses).forEach(function (k) {
            if (bonusPreview[k] != null) bonusPreview[k] += it.bonuses[k] || 0;
          });
        }
      });
      var bonusBits = [];
      if (bonusPreview.vuLuc) bonusBits.push("Vũ +" + bonusPreview.vuLuc);
      if (bonusPreview.tongLinh) bonusBits.push("Thống +" + bonusPreview.tongLinh);
      if (bonusPreview.triLuc) bonusBits.push("Trí +" + bonusPreview.triLuc);
      if (bonusPreview.hp) bonusBits.push("HP +" + bonusPreview.hp);
      if (bonusPreview.speed) bonusBits.push("Tốc +" + bonusPreview.speed);

      html +=
        '<div class="equip-card" data-gid="' +
        g.id +
        '">' +
        '<div class="equip-card-head">' +
        '<img class="equip-portrait" src="' +
        generalArt(g) +
        '" alt=""/>' +
        "<div>" +
        "<strong>" +
        g.name +
        "</strong> <small>" +
        troopChar(troop) +
        (g.troop2 ? " / " + troopChar(g.troop2) : "") +
        " · Lv." +
        (g.level || 1) +
        "</small>" +
        '<div class="equip-bonus-sum">' +
        (bonusBits.length ? bonusBits.join(" · ") : "Chưa đeo đồ") +
        "</div>" +
        "</div></div>" +
        '<div class="equip-slots">';

      slots.forEach(function (slot) {
        var curId = eq[slot] || (slot === "horse" ? g.horseId : null) || "";
        var cur =
          curId && typeof NLDatabase !== "undefined" ? NLDatabase.getItem(curId) : null;
        var pool = equipInventoryPool(state, slot, g.id);
        var pickKey = g.id + "|" + slot;
        var open = renderEquip._openPicker === pickKey;
        var choices = Object.keys(pool).filter(function (id) {
          return pool[id] > 0 || id === curId;
        });

        var pickerHtml = "";
        if (open) {
          var cards =
            '<button type="button" class="equip-pick' +
            (!curId ? " is-on" : "") +
            '" data-equip-pick="' +
            g.id +
            "|" +
            slot +
            '|" title="Tháo">' +
            '<span class="eq-icon eq-icon--empty"></span>' +
            "<strong>Tháo</strong><small>Để trống ô</small></button>";
          choices.forEach(function (id) {
            var m = NLDatabase.getItem(id);
            if (!m) return;
            var left = pool[id] || 0;
            var bonus = formatItemBonuses(m);
            var on = id === curId;
            cards +=
              '<button type="button" class="equip-pick' +
              (on ? " is-on" : "") +
              '" data-equip-pick="' +
              g.id +
              "|" +
              slot +
              "|" +
              m.id +
              '" data-preview-icon="' +
              (m.icon ||
                (typeof NLDatabase !== "undefined" && NLDatabase.itemIconUrl
                  ? NLDatabase.itemIconUrl(m) || ""
                  : "") ||
                "") +
              '">' +
              itemIconHtml(m) +
              "<strong style=\"color:" +
              rarityColor(m.rarity) +
              '">' +
              m.name +
              "</strong>" +
              "<small>" +
              (m.qualityWiki ? m.qualityWiki + " · " : "") +
              (bonus || "—") +
              (id !== curId && left > 1 ? " · ×" + left : "") +
              "</small></button>";
          });
          if (!choices.length) {
            cards +=
              '<p class="meta" style="grid-column:1/-1;margin:0">Không có món phù hợp trong kho.</p>';
          }
          pickerHtml =
            '<div class="equip-picker" data-picker-for="' +
            pickKey +
            '">' +
            '<div class="equip-picker-head"><span>Chọn ' +
            (labels[slot] || slot) +
            '</span><button type="button" class="btn-game" data-equip-close="' +
            pickKey +
            '">Đóng</button></div>' +
            '<div class="equip-picker-grid">' +
            cards +
            "</div></div>";
        }

        html +=
          '<div class="equip-slot' +
          (open ? " is-picking" : "") +
          '" data-slot="' +
          slot +
          '">' +
          '<span class="equip-slot-icon" data-slot-icon="' +
          pickKey +
          '">' +
          itemIconHtml(cur) +
          "</span>" +
          '<div class="equip-slot-meta">' +
          '<span class="equip-slot-label">' +
          (labels[slot] || slot) +
          "</span>" +
          '<span class="equip-slot-name" style="color:' +
          (cur ? rarityColor(cur.rarity) : "#8a7a60") +
          '">' +
          (cur ? cur.name : "— trống —") +
          "</span>" +
          (cur
            ? '<span class="equip-slot-stats">' + formatItemBonuses(cur) + "</span>"
            : "") +
          '<button type="button" class="btn-game equip-slot-open' +
          (open ? " primary" : "") +
          '" data-equip-open="' +
          pickKey +
          '">' +
          (open ? "Đang chọn…" : cur ? "Đổi" : "Chọn") +
          "</button>" +
          "</div>" +
          pickerHtml +
          "</div>";
      });

      html += "</div></div>";
    });
    html += "</div>";
    html +=
      '<p class="meta">Chạm Chọn/Đổi để xem hình + tên trước khi đeo. Cường hóa tướng trong mục Nhân vật.</p>';
    openPanel(html);

    var host = document.getElementById("panel-body") || document.querySelector(".panel-body");
    if (!host) return;
    var focusGid = renderEquip._focusGid;
    if (focusGid) {
      var card = host.querySelector('.equip-card[data-gid="' + focusGid + '"]');
      if (card) {
        card.classList.add("equip-card-focus");
        card.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      renderEquip._focusGid = null;
    }

    function applyEquip(gid, slot, itemId) {
      var g = gens.find(function (x) {
        return x.id === gid;
      });
      if (!g) return;
      if (typeof NLPlayer !== "undefined" && NLPlayer.setHeroEquip) {
        NLPlayer.setHeroEquip(state, gid, slot, itemId);
      } else {
        if (!g.equip) g.equip = {};
        if (itemId) g.equip[slot] = itemId;
        else delete g.equip[slot];
        if (slot === "horse") g.horseId = itemId;
      }
      if (G && G.saveGame) G.saveGame(state);
      var meta =
        itemId && typeof NLDatabase !== "undefined" ? NLDatabase.getItem(itemId) : null;
      toast(
        meta
          ? g.name + " đeo " + meta.name
          : "Đã tháo " + (labels[slot] || slot) + " của " + g.name,
        "good"
      );
      renderEquip._openPicker = null;
      renderEquip(state);
    }

    host.querySelectorAll("[data-equip-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-equip-open");
        renderEquip._openPicker = renderEquip._openPicker === key ? null : key;
        renderEquip(state);
      });
    });
    host.querySelectorAll("[data-equip-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        renderEquip._openPicker = null;
        renderEquip(state);
      });
    });
    host.querySelectorAll("[data-equip-pick]").forEach(function (btn) {
      btn.addEventListener("mouseenter", function () {
        var p = (btn.getAttribute("data-equip-pick") || "").split("|");
        var iconHost = host.querySelector('[data-slot-icon="' + p[0] + "|" + p[1] + '"]');
        if (!iconHost) return;
        if (!p[2]) {
          iconHost.innerHTML = '<span class="eq-icon eq-icon--empty"></span>';
          return;
        }
        var m = typeof NLDatabase !== "undefined" ? NLDatabase.getItem(p[2]) : null;
        iconHost.innerHTML = itemIconHtml(m);
      });
      btn.addEventListener("click", function () {
        var p = (btn.getAttribute("data-equip-pick") || "").split("|");
        applyEquip(p[0], p[1], p[2] || null);
      });
    });
  }


  U.renderEquip = renderEquip;
})(window.NLUIParts = window.NLUIParts || {});
