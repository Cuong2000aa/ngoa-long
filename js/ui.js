/* global window, NLGame */
(function (global) {
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

  function troopChar(troop) {
    var map = { cavalry: "騎", infantry: "步", spear: "槍", archer: "弓", strategist: "謀" };
    return map[troop] || "將";
  }

  function troopShort(troop) {
    var map = { cavalry: "Kỵ", infantry: "Bộ", spear: "Thương", archer: "Cung", strategist: "Mưu" };
    return map[troop] || troop || "";
  }

  function shortFlag(name) {
    if (!name) return "兵";
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

  function formSlotCard(g, slotIndex, activeTroopMap) {
    if (!g) {
      return (
        '<div class="slot empty" data-slot="' +
        slotIndex +
        '">' +
        '<div class="f-empty-ico" aria-hidden="true">＋</div>' +
        '<span class="f-empty-num">Ô ' +
        (slotIndex + 1) +
        "</span>" +
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
      '" data-slot="' +
      slotIndex +
      '" title="Chạm để gỡ">' +
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
    var seal = ico || "卷";
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

  function renderResources(state, handlers) {
    G.applyElapsed(state);
    var curSilver = Math.floor(state.silver || 0);
    var curFood = Math.floor(state.food || 0);
    var silverLabel = fmt(curSilver);
    var foodLabel = fmt(curFood);
    if (typeof NLCityEconomy !== "undefined" && state.resources) {
      var caps = NLCityEconomy.warehouseCaps(state);
      var rates = NLCityEconomy.productionPerMinute(state);
      silverLabel = fmt(curSilver) + " / " + fmt(caps.silver);
      foodLabel = fmt(curFood) + " / " + fmt(caps.food);
      var rateSilverEl = document.getElementById("rate-silver");
      var rateFoodEl = document.getElementById("rate-food");
      if (rateSilverEl) rateSilverEl.textContent = "+" + rates.silver + "/phút";
      if (rateFoodEl) rateFoodEl.textContent = "+" + rates.food + "/phút";
      var tip = document.getElementById("nl-tip");
      if (tip && !tip._locked) {
        tip.textContent =
          "+" + rates.silver + " bạc/phút · +" + rates.food + " lương/phút · Nâng cấp trực tiếp tại bảng Thành Chính";
      }
    }

    // Hiệu ứng nhảy số trực quan khi Bạc / Lương thực tăng
    if (_lastSilver !== null && curSilver > _lastSilver) {
      var chipS = document.getElementById("chip-silver");
      if (chipS) {
        chipS.classList.add("pulse");
        setTimeout(function () { chipS.classList.remove("pulse"); }, 260);
      }
    }
    if (_lastFood !== null && curFood > _lastFood) {
      var chipF = document.getElementById("chip-food");
      if (chipF) {
        chipF.classList.add("pulse");
        setTimeout(function () { chipF.classList.remove("pulse"); }, 260);
      }
    }
    _lastSilver = curSilver;
    _lastFood = curFood;

    document.getElementById("res-gold").textContent = fmt(state.gold);
    document.getElementById("res-silver").textContent = silverLabel;
    document.getElementById("res-food").textContent = foodLabel;
    document.getElementById("avatar-name").textContent = state.playerName || state.username;
    var lv = state.level || Math.max(1, Math.floor((state.prestige || 0) / 20) + 1);
    document.getElementById("avatar-lv").textContent = "Lv." + lv;
    document.getElementById("day-label").textContent = "Ngày " + state.day;

    renderCityDock(state, handlers || renderCityDock._handlers);
  }

  /**
   * Bảng công trình hiển thị trực tiếp tại màn hình Thành Chính:
   * - Ty Vũ (nhà chính khóa trần cấp)
   * - Mỏ Bạc (sản xuất Bạc theo thời gian thực)
   * - Nông Trại (sản xuất Lương thực theo thời gian thực)
   * - Nhà Kho & Doanh Trại
   */
  function renderCityDock(state, handlers) {
    if (handlers) renderCityDock._handlers = handlers;
    var dockList = document.getElementById("city-dock-list");
    var capEl = document.getElementById("dock-tyvu-cap");
    if (!dockList || !state) return;

    var list = G.getBuildingList(state);
    var tyVu = list.find(function (b) { return b.building_id === "ty_vu" || b.id === "hall"; });
    if (capEl && tyVu) {
      capEl.textContent = "Trần cấp: Lv." + tyVu.level;
    }

    // Ưu tiên hiển thị Ty Vũ, Mỏ Bạc, Nông Trại lên đầu theo đúng thiết kế
    var priorityOrder = { ty_vu: 1, mo_bac: 2, nong_trai: 3, kho: 4, nha_kho: 4, doanh_trai: 5 };
    var sorted = list.slice().sort(function (a, b) {
      var pa = priorityOrder[a.building_id] || 99;
      var pb = priorityOrder[b.building_id] || 99;
      return pa - pb;
    });

    dockList.innerHTML = sorted
      .map(function (b) {
        var costStr = b.upgrading
          ? "Đang nâng cấp: <b style='color:#fde68a'>" + b.countdown + "</b>"
          : "Cần: " + fmt(b.cost.silver) + " Bạc · " + fmt(b.cost.food) + " Lương";
        var btnHtml = b.upgrading
          ? '<button type="button" class="btn-game btn-dock-up" disabled>' + b.countdown + "</button>"
          : '<button type="button" class="btn-game primary btn-dock-up" data-dock-up="' +
            b.id +
            '">Nâng cấp</button>';
        var thumb =
          BUILDING_SPRITES[b.building_id] ||
          BUILDING_SPRITES[b.id] ||
          "assets/city/buildings/sprite-hall.png";
        return (
          '<div class="dock-item" data-building="' +
          b.building_id +
          '">' +
          '<img class="dock-thumb" src="' +
          thumb +
          '" alt="" draggable="false" />' +
          '<div class="dock-item-info">' +
          '<div class="dock-item-title">' +
          b.name +
          ' <span class="lvl">Lv.' +
          b.level +
          "</span></div>" +
          '<div class="dock-item-sub">' +
          b.effectText +
          "</div>" +
          '<div class="dock-item-cost">' +
          costStr +
          "</div>" +
          "</div>" +
          btnHtml +
          "</div>"
        );
      })
      .join("");

    dockList.querySelectorAll("[data-dock-up]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var h = handlers || renderCityDock._handlers;
        if (h && h.upgrade) h.upgrade(btn.getAttribute("data-dock-up"));
      });
    });
  }

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

  function renderCityPanel(state, handlers) {
    var list = G.getBuildingList(state);
    var snap = G.citySnapshot ? G.citySnapshot(state) : null;
    var troopLine = snap
      ? '<p class="meta">Doanh Trại: ' + snap.troops_pool + "/" + snap.troops_max +
        " binh · Ty Vũ Lv." + snap.ty_vu_level + "</p>"
      : "";
    var html =
      panelHead("政", "Quốc Chính", "Nâng cấp có thời gian chờ · Kho giới hạn dung tích · Ty Vũ khóa trần cấp.") +
      troopLine +
      '<div class="card-grid">' +
      list.map(function (b) {
        var status = b.upgrading
          ? '<p class="cost" style="color:#c9a227">Đang nâng… ' + b.countdown + "</p>"
          : '<p class="cost">' + fmt(b.cost.food) + " lương · " + fmt(b.cost.silver) + " bạc" +
            (b.timeSec ? " · " + (typeof NLCityEconomy !== "undefined" ? NLCityEconomy.formatCountdown(b.timeSec) : b.timeSec + "s") : "") +
            "</p>";
        var btn = b.upgrading
          ? '<button type="button" class="btn-game" disabled>Chờ hoàn tất</button>'
          : '<button type="button" class="btn-game primary" data-up="' + b.id + '">Nâng cấp</button>';
        var thumb =
          BUILDING_SPRITES[b.building_id] ||
          BUILDING_SPRITES[b.id] ||
          "assets/city/buildings/sprite-hall.png";
        return (
          '<article class="gcard">' +
          '<div class="gcard-portrait">' +
          '<img class="gcard-art" src="' +
          thumb +
          '" alt="" draggable="false" style="image-rendering:pixelated" />' +
          "<div><h3>" +
          b.name +
          ' <span class="lvl">Lv.' +
          b.level +
          "</span></h3></div></div>" +
          '<p class="meta">' +
          b.desc +
          "<br/>" +
          b.effectText +
          "</p>" +
          status +
          btn +
          "</article>"
        );
      }).join("") +
      "</div>";
    openPanel(html);
    document.querySelectorAll("#panel-body [data-up]").forEach(function (btn) {
      btn.addEventListener("click", function () { handlers.upgrade(btn.getAttribute("data-up")); });
    });
  }

  function renderBuildingDetail(state, buildingId, handlers) {
    var list = G.getBuildingList(state);
    var b = list.find(function (x) { return x.id === buildingId || x.building_id === buildingId; });
    if (!b) return;
    var statusHtml = b.upgrading
      ? '<p class="cost" style="color:#c9a227;margin:0.75rem 0">Đang nâng cấp: <b id="up-cd">' +
        b.countdown + "</b></p>" +
        '<button type="button" class="btn-game" disabled>Chờ hoàn tất</button>'
      : '<p class="cost" style="margin:0.75rem 0">Chi phí: ' + fmt(b.cost.food) + " lương · " +
        fmt(b.cost.silver) + " bạc" +
        (b.timeSec ? " · chờ " + (typeof NLCityEconomy !== "undefined" ? NLCityEconomy.formatCountdown(b.timeSec) : b.timeSec + "s") : "") +
        "</p>" +
        '<button type="button" class="btn-game primary" id="btn-up-one">Nâng cấp</button>';
    var html =
      panelHead("建", b.name, "Cấp hiện tại: Lv." + b.level) +
      '<p class="meta">' + b.desc + "</p>" +
      "<p>" + b.effectText + "</p>" +
      statusHtml;
    openPanel(html);
    var btn = document.getElementById("btn-up-one");
    if (btn) {
      btn.addEventListener("click", function () {
        handlers.upgrade(buildingId);
      });
    }
  }

  function renderGenerals(state, handlers) {
    var snap =
      typeof NLRecruit !== "undefined" ? NLRecruit.tavernSnapshot(state) : null;

    var tab = renderGenerals._tab || "owned";
    var header =
      panelHead(
        "酒",
        "Võ Tướng & Tửu Quán",
        "Chiêu mộ · Huấn luyện · Cường hóa · Ra trận 5 ô"
      ) +
      statPills([
        { label: "Danh vọng", value: fmt(state.prestige || 0) },
        { label: "Bạc", value: fmt(state.silver || 0) },
        {
          label: "Kho tướng",
          value: snap
            ? snap.hero_count + "/" + snap.hero_capacity
            : String(state.generals.length),
        },
      ]) +
      '<div class="nl-tabs">' +
      '<button type="button" class="btn-game ' +
      (tab === "owned" ? "primary" : "") +
      '" id="tab-owned">Kho tướng (' +
      state.generals.length +
      ")</button>" +
      '<button type="button" class="btn-game ' +
      (tab === "tavern" ? "primary" : "") +
      '" id="tab-tavern">Tửu Quán' +
      (snap ? " (" + snap.available.length + " mở)" : "") +
      "</button></div>";

    var body = "";
    if (tab === "tavern" && snap) {
      var list = snap.available.concat(snap.locked.slice(0, 18), snap.owned);
      body =
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
                  (e.can_afford ? "Chiêu mộ (" + fmt(e.cost_silver) + " bạc)" : "Thiếu bạc (" + fmt(e.cost_silver) + ")") +
                  "</button>";
            return (
              '<article class="gcard">' +
              '<div class="gcard-portrait">' +
              '<img class="gcard-art" src="' +
              troopSprite(e.troop, 1) +
              '" alt="" draggable="false" />' +
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
              "</h3>" +
              "</div></div>" +
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
        "</div>";
    } else {
      body =
        '<div class="card-grid">' +
        state.generals
          .map(function (g) {
            var troop = G.TROOPS[g.troop] || (typeof NLDatabase !== "undefined" ? NLDatabase.getTroop(g.troop) : null);
            var stBadge =
              g.status === "DEPLOYED"
                ? '<span class="lvl" style="color:#86efac">Ra trận (Ô ' + g.deployed_slot + ")</span>"
                : '<span class="lvl">Trong kho</span>';
            var slotBtns = [1, 2, 3, 4, 5]
              .map(function (s) {
                var active = g.deployed_slot === s;
                return (
                  '<button type="button" class="btn-game ' +
                  (active ? "primary" : "") +
                  '" style="padding:0.2rem 0.45rem;font-size:0.75rem" data-slot="' +
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
                '<button type="button" class="btn-game" style="padding:0.2rem 0.45rem;font-size:0.75rem" data-slot="' +
                g.id +
                '|0">Nghỉ</button>';
            }
            return (
              '<article class="gcard">' +
              '<div class="gcard-portrait">' +
              '<img class="gcard-art" src="' +
              troopSprite(g.troop, troopTierOf(g)) +
              '" alt="" draggable="false" />' +
              "<div>" +
              '<span class="troop ' +
              g.troop +
              '">' +
              (troop ? troop.name : g.troop) +
              "</span>" +
              "<h3>" +
              g.name +
              ' <span class="lvl">Lv.' +
              g.level +
              " +" +
              (g.enhance || 0) +
              "</span> " +
              stBadge +
              "</h3>" +
              "</div></div>" +
              '<div class="stats"><div><span>VL/ATK</span> <b>' +
              g.atk +
              "</b></div>" +
              "<div><span>TL/DEF</span> <b>" +
              g.def +
              "</b></div>" +
              "<div><span>Trí</span> <b>" +
              (g.triLuc || "-") +
              "</b></div>" +
              "<div><span>HP</span> <b>" +
              g.hp +
              "</b></div></div>" +
              '<div class="row-btns" style="margin:0.35rem 0;flex-wrap:wrap">' +
              slotBtns +
              "</div>" +
              '<div class="row-btns">' +
              '<button type="button" class="btn-game" data-train="' +
              g.id +
              '">Huấn luyện</button>' +
              '<button type="button" class="btn-game" data-enh="' +
              g.id +
              '">Cường hóa</button>' +
              (state.generals.length > 1
                ? '<button type="button" class="btn-game" data-dis="' + g.id + '">Sa thải</button>'
                : "") +
              "</div></article>"
            );
          })
          .join("") +
        "</div>";
    }

    openPanel(header + body);

    var tOwned = document.getElementById("tab-owned");
    var tTav = document.getElementById("tab-tavern");
    if (tOwned) {
      tOwned.addEventListener("click", function () {
        renderGenerals._tab = "owned";
        renderGenerals(state, handlers);
      });
    }
    if (tTav) {
      tTav.addEventListener("click", function () {
        renderGenerals._tab = "tavern";
        renderGenerals(state, handlers);
      });
    }
    document.querySelectorAll("#panel-body [data-rec]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.recruitTavern) handlers.recruitTavern(btn.getAttribute("data-rec"));
      });
    });
    document.querySelectorAll("#panel-body [data-slot]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var p = btn.getAttribute("data-slot").split("|");
        var slot = parseInt(p[1], 10);
        if (handlers.deploySlot) handlers.deploySlot(p[0], slot || null);
      });
    });
    document.querySelectorAll("#panel-body [data-dis]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.dismissHero) handlers.dismissHero(btn.getAttribute("data-dis"));
      });
    });
    document.querySelectorAll("#panel-body [data-train]").forEach(function (btn) {
      btn.addEventListener("click", function () { handlers.train(btn.getAttribute("data-train")); });
    });
    document.querySelectorAll("#panel-body [data-enh]").forEach(function (btn) {
      btn.addEventListener("click", function () { handlers.enhance(btn.getAttribute("data-enh")); });
    });
  }

  function renderWorld(state, handlers) {
    var html =
      panelHead("圖", "Thế giới", "Công thành AI để thôn tính lãnh địa.") +
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
      panelHead("塔", "Tháp thí luyện", "40 tầng · thắng nhận hồn tướng") +
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
      panelHead("擂", "Lôi Đài Tam Quốc", "Đánh thắng đối thủ xếp trên để đổi hạng.") +
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

  function renderEquip(state) {
    var inv = state.inventory || [];
    var horses = inv.filter(function (it) {
      var meta =
        typeof NLDatabase !== "undefined" ? NLDatabase.getItem(it.itemId || it.id) : null;
      return meta && meta.slot === "horse";
    });
    var gens = state.generals || [];
    var html =
      panelHead("裝", "Trang bị · Ngựa", "Đeo ngựa cho kỵ binh — tăng Vu lực / Thống lĩnh.") +
      statPills([
        { label: "Uy danh", value: fmt(state.prestige) },
        { label: "Ngựa kho", value: String(horses.length) },
      ]);
    html += '<div class="equip-horse-list">';
    gens.forEach(function (g) {
      var troop = g.troop || "infantry";
      var horseMeta =
        g.horseId && typeof NLDatabase !== "undefined"
          ? NLDatabase.getItem(g.horseId)
          : null;
      html +=
        '<div class="equip-row" data-gid="' +
        g.id +
        '">' +
        "<strong>" +
        g.name +
        "</strong> <small>" +
        troopChar(troop) +
        (g.troop2 ? " / " + troopChar(g.troop2) : "") +
        "</small>" +
        '<div class="equip-horse-now">' +
        (horseMeta ? horseMeta.name : "— chưa đeo ngựa —") +
        "</div>" +
        '<select class="equip-horse-sel" data-gid="' +
        g.id +
        '">' +
        '<option value="">(Tháo ngựa)</option>' +
        horses
          .map(function (it) {
            var m = NLDatabase.getItem(it.itemId || it.id);
            if (!m) return "";
            var sel = g.horseId === m.id ? " selected" : "";
            return (
              '<option value="' +
              m.id +
              '"' +
              sel +
              ">" +
              m.name +
              "</option>"
            );
          })
          .join("") +
        "</select></div>";
    });
    html += "</div>";
    html +=
      '<p class="meta">Cường hóa tướng (+1…+10) trong mục Võ Tướng. +6 trở lên cần unlock Boss Ch.2.</p>';
    openPanel(html);
    var host = document.getElementById("panel-body") || document.querySelector(".panel-body");
    if (host) {
      host.querySelectorAll(".equip-horse-sel").forEach(function (sel) {
        sel.addEventListener("change", function () {
          var gid = sel.getAttribute("data-gid");
          var g = gens.find(function (x) { return x.id === gid; });
          if (!g) return;
          g.horseId = sel.value || null;
          if (typeof NLPlayer !== "undefined") NLPlayer.syncLegacyView(state);
          if (G && G.saveGame) G.saveGame(state);
          toast(g.horseId ? "Đã đeo ngựa cho " + g.name : "Đã tháo ngựa " + g.name, "good");
          renderEquip(state);
        });
      });
    }
  }

  /**
   * Bày trận 3+2. onConfirm([{ id, slot, activeTroop }, ...])
   */
  function showFormation(generals, onConfirm) {
    var overlay = document.getElementById("form-overlay");
    var list = generals || [];
    var slots = [null, null, null, null, null];
    var activeTroopMap = {};
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
    var frontEl = document.getElementById("form-front");
    var backEl = document.getElementById("form-back");
    var previewTimer = null;

    function paintPreview3d() {
      var host = document.getElementById("form-preview-3d");
      if (!host || !window.NLCity || !window.NLCity.BattleRenderer) return;
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
        host.innerHTML = "";
        return;
      }
      if (host._br) {
        try { host._br.dispose(); } catch (e) {}
        host._br = null;
      }
      var br = new window.NLCity.BattleRenderer();
      host._br = br;
      br.mount(host, { preview: true }).then(function () {
        br.spawn(allies, [], (list[0] && list[0].faction) || "shu");
      });
    }

    function paint() {
      frontEl.innerHTML = [0, 1, 2]
        .map(function (i) { return formSlotCard(slots[i], i, activeTroopMap); })
        .join("");
      backEl.innerHTML = [3, 4]
        .map(function (i) { return formSlotCard(slots[i], i, activeTroopMap); })
        .join("");
      poolEl.innerHTML = list
        .map(function (g) {
          var on = slots.some(function (s) { return s && s.id === g.id; });
          return formPoolChip(g, on);
        })
        .join("");

      overlay.querySelectorAll("[data-slot]").forEach(function (node) {
        node.addEventListener("click", function (ev) {
          if (ev.target && ev.target.closest && ev.target.closest("[data-dual]")) return;
          slots[+node.getAttribute("data-slot")] = null;
          paint();
        });
      });
      overlay.querySelectorAll("[data-dual]").forEach(function (btn) {
        btn.addEventListener("click", function (ev) {
          ev.stopPropagation();
          var id = btn.getAttribute("data-dual");
          var g = list.find(function (x) { return x.id === id; });
          if (!g || !g.troop2) return;
          var cur = activeTroopMap[id] || g.troop;
          activeTroopMap[id] = cur === g.troop ? g.troop2 : g.troop;
          paint();
        });
      });
      poolEl.querySelectorAll("[data-gid]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-gid");
          var g = list.find(function (x) { return x.id === id; });
          if (!g) return;
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
      clearTimeout(previewTimer);
      previewTimer = setTimeout(paintPreview3d, 80);
    }

    paint();
    overlay.hidden = false;
    document.getElementById("btn-form-cancel").onclick = function () {
      overlay.hidden = true;
      disposeFormPreview();
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
      disposeFormPreview();
      onConfirm(team);
    };
  }

  function renderCampaign(state, handlers) {
    if (typeof NLDatabase === "undefined") {
      openPanel(panelHead("本", "Phó Bản", "Database chưa load."));
      return;
    }
    var snap =
      typeof NLCampaign !== "undefined"
        ? NLCampaign.mapSnapshot(state)
        : null;
    var camp = NLDatabase.campaign();
    var html =
      panelHead("本", "Phó Bản — Chính tuyến", camp.name || "Chiến dịch") +
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
        (rep.rewardSummary
          ? '<p class="meta" style="color:#fde68a;margin:0 0 0.4rem">' + rep.rewardSummary + "</p>"
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
          if (st.mission || st.story) {
            storyLine =
              '<div class="meta" style="opacity:0.9;margin-top:0.15rem">' +
              (st.mission || st.story) +
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
  }

  function setLastCampaignReport(report) {
    renderCampaign._lastReport = report;
  }

  global.NLUI = {
    toast: toast,
    renderResources: renderResources,
    renderCityDock: renderCityDock,
    closePanel: closePanel,
    openPanel: openPanel,
    disposeFormPreview: disposeFormPreview,
    formatBattleLogLine: formatBattleLogLine,
    renderCityPanel: renderCityPanel,
    renderBuildingDetail: renderBuildingDetail,
    renderGenerals: renderGenerals,
    renderWorld: renderWorld,
    renderTower: renderTower,
    renderArena: renderArena,
    renderEquip: renderEquip,
    renderCampaign: renderCampaign,
    setLastCampaignReport: setLastCampaignReport,
    showFormation: showFormation,
  };
})(window);
