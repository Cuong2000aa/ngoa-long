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

  function listFormations() {
    var raw =
      typeof NLDatabase !== "undefined" && NLDatabase.raw
        ? NLDatabase.raw()
        : typeof NL_DB !== "undefined"
        ? NL_DB
        : null;
    var forms = raw && raw.formations;
    if (!forms || !forms.list) return [];
    return Object.keys(forms.list).map(function (k) {
      return forms.list[k];
    });
  }

  function formationFocusPct(form) {
    if (!form || !form.teamBonus || !form.focus) return "";
    var v = form.teamBonus[form.focus];
    if (v == null || v === 1) return "";
    var pct = Math.round((v - 1) * 100);
    return (pct >= 0 ? "+" : "") + pct + "%";
  }

  var BONUS_LABELS = {
    vuLuc: "Vũ lực",
    tongLinh: "Thống lĩnh",
    triLuc: "Trí lực",
    hp: "HP",
    speed: "Tốc",
  };

  /**
   * Bày trận 3+2 + chọn trận pháp.
   * onConfirm(teamSlots, { formationId })
   * opts: { formationId, enemyTeam, enemyFormation, title }
   */
  function showFormation(generals, onConfirm, opts) {
    opts = opts || {};
    var overlay = document.getElementById("form-overlay");
    var modal = overlay && overlay.querySelector(".form-modal");
    var list = generals || [];
    var slots = [null, null, null, null, null];
    var activeTroopMap = {};
    var swapFrom = -1;
    var formations = listFormations();
    var selectedFormId =
      opts.formationId ||
      (formations[0] && formations[0].id) ||
      "crane_wing";
    var enemyTeam = opts.enemyTeam || opts.enemies || null;
    var enemyFormId = opts.enemyFormation || opts.enemyFormationId || null;
    // Enrich troop2 từ DB nếu thiếu
    list.forEach(function (g) {
      if (!g.troop2 && typeof NLDatabase !== "undefined") {
        var tpl = NLDatabase.getGeneral(g.key || g.generalId || g.id);
        if (tpl && tpl.troop2) g.troop2 = tpl.troop2;
      }
      activeTroopMap[g.id] = g.activeTroop || g.troop || "infantry";
    });
    // Nạp sẵn các tướng đang DEPLOYED vào đúng ô 1..5
    list.forEach(function (g) {
      if (g.deployed_slot >= 1 && g.deployed_slot <= 5 && !slots[g.deployed_slot - 1]) {
        slots[g.deployed_slot - 1] = g;
      }
    });
    if (!slots.some(Boolean)) {
      list.slice(0, 3).forEach(function (g, i) {
        slots[i] = g;
      });
    }
    var poolEl = document.getElementById("form-pool");
    var gridEl = document.getElementById("form-grid");
    var formPickEl = document.getElementById("form-pick");
    var formHintEl = document.getElementById("form-pick-hint");
    var bonusEl = document.getElementById("form-bonus-bar");
    var swapHintEl = document.getElementById("form-swap-hint");
    var missionSub = document.getElementById("form-mission-sub");
    var scoutEl = document.getElementById("form-scout");
    var scoutGrid = document.getElementById("form-scout-grid");
    var scoutFormEl = document.getElementById("form-scout-form");
    var scoutHintEl = document.getElementById("form-scout-hint");
    var previewBadge = document.getElementById("form-preview-badge");
    var previewTimer = null;
    var hasScout = !!(enemyTeam && enemyTeam.length);
    if (modal) modal.classList.toggle("has-scout", hasScout);
    if (missionSub) {
      missionSub.textContent = opts.title
        ? "Ải: " + opts.title + " · Chọn trận pháp & xếp 5 tướng"
        : "Chọn trận pháp · Lưới 3×3 · 5 tướng theo hình trận";
    }

    function selectedForm() {
      for (var i = 0; i < formations.length; i++) {
        if (formations[i].id === selectedFormId) return formations[i];
      }
      return formations[0] || null;
    }

    function findFormById(fid) {
      for (var i = 0; i < formations.length; i++) {
        if (formations[i].id === fid) return formations[i];
      }
      return null;
    }

    /** Map slotIndex → {col,row} theo trận đang chọn */
    function formLayoutCells(form) {
      var cur = form || selectedForm();
      if (cur && cur.layout && cur.layout.length >= 5) {
        return cur.layout.slice(0, 5).map(function (c) {
          return { col: c.col | 0, row: c.row | 0, label: c.label || ("Ô " + ((c.slot | 0) + 1)) };
        });
      }
      return [
        { col: 0, row: 0, label: "Ô 1" },
        { col: 2, row: 0, label: "Ô 2" },
        { col: 0, row: 2, label: "Ô 3" },
        { col: 1, row: 2, label: "Ô 4" },
        { col: 2, row: 2, label: "Ô 5" },
      ];
    }

    function paintBonusBar() {
      if (!bonusEl) return;
      var cur = selectedForm();
      var tb = (cur && cur.teamBonus) || {};
      var keys = ["vuLuc", "tongLinh", "triLuc", "hp", "speed"];
      bonusEl.innerHTML = keys
        .map(function (k) {
          var v = tb[k];
          if (v == null) return "";
          var pct = Math.round((v - 1) * 100);
          var cls = "form-bonus-chip";
          if (cur && cur.focus === k) cls += " focus";
          if (pct < 0) cls += " down";
          return (
            '<span class="' +
            cls +
            '">' +
            (BONUS_LABELS[k] || k) +
            " <b>" +
            (pct >= 0 ? "+" : "") +
            pct +
            "%</b></span>"
          );
        })
        .join("");
    }

    function paintScout() {
      if (!scoutEl) return;
      if (!hasScout) {
        scoutEl.hidden = true;
        return;
      }
      scoutEl.hidden = false;
      var eForm = findFormById(enemyFormId) || findFormById("square");
      if (scoutFormEl) {
        scoutFormEl.textContent = eForm
          ? "Trận: " + eForm.name + (eForm.focusLabel ? " · " + eForm.focusLabel : "")
          : enemyFormId || "Đội hình địch";
      }
      if (scoutHintEl) {
        var cur = selectedForm();
        var tip = eForm && eForm.desc ? eForm.desc : "Xem trước vị trí địch trước khi xuất trận.";
        if (cur && eForm) tip = counterTip(cur, eForm);
        scoutHintEl.textContent = tip;
      }
      var layout = formLayoutCells(eForm);
      var bySlot = {};
      (enemyTeam || []).forEach(function (u, i) {
        var si = u.slot != null ? u.slot | 0 : i;
        bySlot[si] = u;
      });
      var cellSlot = {};
      layout.forEach(function (c, si) {
        cellSlot[c.row + "," + c.col] = si;
      });
      var html = "";
      for (var r = 0; r < 3; r++) {
        html += '<div class="form-scout-row">';
        for (var c = 0; c < 3; c++) {
          var key = r + "," + c;
          if (cellSlot[key] == null) {
            html += '<div class="form-scout-cell" aria-hidden="true"></div>';
          } else {
            var si = cellSlot[key];
            var u = bySlot[si];
            if (!u) {
              html += '<div class="form-scout-cell"></div>';
            } else {
              var tr = u.troop || (u.general && u.general.troop) || "infantry";
              var nm = u.name || (u.general && u.general.name) || "Địch";
              var tier = u.troopTier != null ? u.troopTier : troopTierOf(u.general || u);
              html +=
                '<div class="form-scout-cell on" title="' +
                nm +
                '"><img src="' +
                troopSprite(tr, tier) +
                '" alt="" /><b>' +
                shortFlag(nm) +
                "</b></div>";
            }
          }
        }
        html += "</div>";
      }
      if (scoutGrid) scoutGrid.innerHTML = html;
    }

    function kindLabel(f) {
      if (!f || !f.kind) return "";
      if (f.kind === "atk") return "Công";
      if (f.kind === "def") return "Thủ";
      if (f.kind === "special") return "Đặc";
      return "";
    }

    function counterTip(myForm, enemyForm) {
      if (!myForm || !enemyForm) return "";
      var mine = myForm.counters || [];
      var theirs = enemyForm.counters || [];
      if (mine.indexOf(enemyForm.id) >= 0) {
        return "✓ Trận ta khắc " + enemyForm.name + " — lợi thế.";
      }
      if (theirs.indexOf(myForm.id) >= 0) {
        return "⚠ Địch (" + enemyForm.name + ") khắc trận ta — nên đổi trận.";
      }
      var sug = (enemyForm.counteredBy || [])
        .map(function (id) {
          return findFormById(id);
        })
        .filter(Boolean)
        .slice(0, 2)
        .map(function (f) {
          return f.name;
        });
      if (sug.length) {
        return "Địch " + enemyForm.name + " · gợi ý: " + sug.join(" / ");
      }
      return "Địch: " + enemyForm.name + (enemyForm.focusLabel ? " (" + enemyForm.focusLabel + ")" : "");
    }

    function paintFormPick() {
      if (!formPickEl) return;
      formPickEl.innerHTML = formations
        .map(function (f) {
          var on = f.id === selectedFormId ? " on" : "";
          var pct = formationFocusPct(f);
          var shape = f.shapeLabel || f.shape || "";
          var kl = kindLabel(f);
          var kindCls = f.kind ? " kind-" + f.kind : "";
          var advantage = "";
          if (enemyFormId && f.counters && f.counters.indexOf(enemyFormId) >= 0) {
            advantage = " tip-win";
          } else if (enemyFormId) {
            var ef = findFormById(enemyFormId);
            if (ef && ef.counters && ef.counters.indexOf(f.id) >= 0) advantage = " tip-lose";
          }
          return (
            '<button type="button" class="form-pick-btn' +
            on +
            kindCls +
            advantage +
            '" data-fid="' +
            f.id +
            '" title="' +
            (f.desc || "") +
            '">' +
            (kl ? '<span class="form-kind-tag">' + kl + "</span>" : "") +
            "<b>" +
            f.name +
            (f.shape ? " · " + f.shape : "") +
            "</b>" +
            "<small>" +
            (shape ? shape + " · " : "") +
            (f.focusLabel || "") +
            (pct ? " " + pct : "") +
            "</small>" +
            "</button>"
          );
        })
        .join("");
      var cur = selectedForm();
      if (formHintEl) {
        var tip = cur
          ? cur.name +
            (cur.shapeLabel ? " («" + cur.shapeLabel + "») — " : " — ") +
            (cur.desc || "")
          : "";
        var eForm = findFormById(enemyFormId);
        if (cur && eForm) tip += " · " + counterTip(cur, eForm);
        formHintEl.textContent = tip;
      }
      paintBonusBar();
      formPickEl.querySelectorAll("[data-fid]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          selectedFormId = btn.getAttribute("data-fid");
          swapFrom = -1;
          paintFormPick();
          paint();
        });
      });
    }

    function paintPreview3d() {
      var host = document.getElementById("form-preview-3d");
      if (!host || !window.NLCity || !window.NLCity.BattleRenderer) return;
      var cur = selectedForm();
      if (previewBadge) {
        if (cur) {
          previewBadge.hidden = false;
          previewBadge.textContent =
            cur.name + (cur.focusLabel ? " · " + cur.focusLabel : "");
        } else {
          previewBadge.hidden = true;
        }
      }
      var allies = [];
      for (var i = 0; i < 5; i++) {
        if (!slots[i]) continue;
        var g = slots[i];
        allies.push({
          uid: "f" + i,
          name: g.name,
          slot: i,
          side: "ally",
          troop: activeTroopMap[g.id] || g.troop || "infantry",
          troopTier: g.troopTier,
          level: g.level || 1,
          faction: g.faction,
          horseId: g.horseId || null,
        });
      }
      if (!allies.length) {
        if (host._br) {
          try { host._br.dispose(); } catch (e2) {}
          host._br = null;
        }
        var glEmpty = host.querySelector(".battle-gl-host");
        if (glEmpty) glEmpty.innerHTML = "";
        return;
      }
      if (host._br) {
        try { host._br.dispose(); } catch (e) {}
        host._br = null;
      }
      var foes = [];
      if (hasScout) {
        (enemyTeam || []).slice(0, 5).forEach(function (u, i) {
          var si = u.slot != null ? u.slot | 0 : i;
          foes.push({
            uid: "e" + si,
            name: u.name || (u.general && u.general.name) || "Địch",
            slot: si,
            side: "enemy",
            troop: u.troop || (u.general && u.general.troop) || "infantry",
            troopTier: u.troopTier != null ? u.troopTier : 1,
            level: u.level || (u.general && u.general.level) || 1,
            faction: u.faction || "wei",
          });
        });
      }
      var br = new window.NLCity.BattleRenderer();
      host._br = br;
      br.mount(host, { preview: true }).then(function () {
        var badge = document.getElementById("form-preview-badge");
        if (badge && !host.contains(badge)) host.appendChild(badge);
        br.spawn(allies, foes, (list[0] && list[0].faction) || "shu", {
          allyFormation: selectedFormId || "crane_wing",
          enemyFormation: enemyFormId || "square",
        });
      });
    }

    function onSlotClick(si) {
      if (swapFrom < 0) {
        if (!slots[si]) return;
        swapFrom = si;
        paint();
        return;
      }
      if (swapFrom === si) {
        // Chạm lại ô đang chọn → gỡ tướng
        slots[si] = null;
        swapFrom = -1;
        paint();
        return;
      }
      var tmp = slots[si];
      slots[si] = slots[swapFrom];
      slots[swapFrom] = tmp;
      swapFrom = -1;
      paint();
    }

    function paint() {
      var cur = selectedForm();
      var layout = formLayoutCells(cur);
      var mods = (cur && cur.slotMods) || {};
      var cellSlot = {}; // "row,col" → slotIndex
      layout.forEach(function (c, si) {
        cellSlot[c.row + "," + c.col] = si;
      });
      if (swapHintEl) {
        swapHintEl.classList.toggle("on", swapFrom >= 0);
        swapHintEl.textContent =
          swapFrom >= 0
            ? "Đang chọn ô " + (swapFrom + 1) + " — chạm ô khác để đổi, chạm lại để gỡ"
            : "Chạm ô đầy → chạm ô khác để đổi chỗ";
      }
      var rowNames = ["Trước", "Giữa", "Sau"];
      var html = "";
      for (var r = 0; r < 3; r++) {
        html +=
          '<div class="form-grid-row" data-row="' +
          r +
          '"><span class="form-grid-row-lab">' +
          rowNames[r] +
          "</span>";
        for (var c = 0; c < 3; c++) {
          var key = r + "," + c;
          if (cellSlot[key] == null) {
            html += '<div class="slot ghost" aria-hidden="true"></div>';
          } else {
            var si = cellSlot[key];
            html += formSlotCard(slots[si], si, activeTroopMap, {
              swapPick: swapFrom === si,
              slotMod: mods[String(si)] || mods[si] || null,
            });
          }
        }
        html += "</div>";
      }
      if (gridEl) gridEl.innerHTML = html;

      poolEl.innerHTML = list
        .map(function (g) {
          var on = slots.some(function (s) { return s && s.id === g.id; });
          return formPoolChip(g, on);
        })
        .join("");

      overlay.querySelectorAll("#form-grid [data-slot]").forEach(function (node) {
        node.addEventListener("click", function (ev) {
          if (ev.target && ev.target.closest && ev.target.closest("[data-dual]")) return;
          onSlotClick(+node.getAttribute("data-slot"));
        });
      });
      overlay.querySelectorAll("[data-dual]").forEach(function (btn) {
        btn.addEventListener("click", function (ev) {
          ev.stopPropagation();
          var id = btn.getAttribute("data-dual");
          var g = list.find(function (x) { return x.id === id; });
          if (!g || !g.troop2) return;
          var curT = activeTroopMap[id] || g.troop;
          activeTroopMap[id] = curT === g.troop ? g.troop2 : g.troop;
          paint();
        });
      });
      poolEl.querySelectorAll("[data-gid]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-gid");
          var g = list.find(function (x) { return x.id === id; });
          if (!g) return;
          swapFrom = -1;
          var idx = -1;
          for (var i = 0; i < 5; i++) {
            if (slots[i] && slots[i].id === id) {
              idx = i;
              break;
            }
          }
          if (idx >= 0) {
            slots[idx] = null;
          } else {
            var empty = -1;
            for (var j = 0; j < 5; j++) {
              if (!slots[j]) {
                empty = j;
                break;
              }
            }
            if (empty >= 0) slots[empty] = g;
          }
          paint();
        });
      });
      paintScout();
      clearTimeout(previewTimer);
      // Debounce dài hơn — tránh remount WebGL liên tục khi xếp/đổi chỗ
      previewTimer = setTimeout(paintPreview3d, 220);
    }

    paintFormPick();
    paint();
    overlay.hidden = false;
    if (window.NLCity && window.NLCity.city && window.NLCity.city.pause) {
      window.NLCity.city.pause();
    }
    document.getElementById("btn-form-cancel").onclick = function () {
      overlay.hidden = true;
      if (modal) modal.classList.remove("has-scout");
      disposeFormPreview();
      if (window.NLCity && window.NLCity.city && window.NLCity.city.resume) {
        window.NLCity.city.resume();
      }
    };
    document.getElementById("btn-form-fight").onclick = function () {
      var team = [];
      for (var i = 0; i < 5; i++) {
        if (slots[i]) {
          team.push({
            id: slots[i].id,
            slot: i,
            general: slots[i],
            activeTroop: activeTroopMap[slots[i].id] || slots[i].troop,
          });
        }
      }
      if (!team.length) return;
      overlay.hidden = true;
      if (modal) modal.classList.remove("has-scout");
      disposeFormPreview();
      // Giữ city pause — combat.open sẽ pause tiếp / close mới resume
      onConfirm(team, { formationId: selectedFormId });
    };
  }


  U.showFormation = showFormation;
})(window.NLUIParts = window.NLUIParts || {});
