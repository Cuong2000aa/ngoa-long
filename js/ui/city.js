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
        updateCityNextTip(state, handlers, rates);
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
      btn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var h = handlers || renderCityDock._handlers;
        if (h && h.upgrade) h.upgrade(btn.getAttribute("data-dock-up"));
      });
    });
    dockList.querySelectorAll(".dock-item[data-building]").forEach(function (row) {
      row.style.cursor = "pointer";
      row.addEventListener("click", function () {
        var h = handlers || renderCityDock._handlers;
        var bid = row.getAttribute("data-building");
        if (h && h.openBuilding) h.openBuilding(bid);
        else renderBuildingDetail(state, bid, h || {});
      });
    });
    renderCityDockCta(state, handlers || renderCityDock._handlers);
  }

  function findNextCampaignStage(state) {
    if (typeof NLCampaign === "undefined") return null;
    var snap = NLCampaign.mapSnapshot(state);
    if (!snap || !snap.chapters) return null;
    for (var ci = 0; ci < snap.chapters.length; ci++) {
      var ch = snap.chapters[ci];
      if (!ch.unlocked) continue;
      for (var si = 0; si < ch.stages.length; si++) {
        var st = ch.stages[si];
        if (st.unlocked && !st.cleared) return { chapterId: ch.chapter_id, stage: st };
      }
    }
    return null;
  }

  function computeCityNextStep(state) {
    var next = findNextCampaignStage(state);
    if (next && next.stage.can_fight) {
      return {
        text: "Tiếp theo: ải " + next.stage.index + " · " + next.stage.name,
        panel: "tower",
        label: "Mở Phó Bản",
      };
    }
    if (next && !next.stage.can_fight) {
      return {
        text: "Thiếu lương cho ải " + next.stage.name + " — nâng Nông Trại hoặc chờ sản xuất",
        panel: null,
        label: null,
      };
    }
    var deployed = (state.generals || []).filter(function (g) {
      return g.deployed_slot >= 1 && g.deployed_slot <= 5;
    }).length;
    if ((state.generals || []).length && deployed < 1) {
      return {
        text: "Chưa xếp tướng ra trận — mở Nhân vật, chọn Ô 1–5",
        panel: "generals",
        label: "Nhân vật",
        tavern: false,
      };
    }
    if (typeof NLRecruit !== "undefined" && NLRecruit.tavernSnapshot) {
      var snap = NLRecruit.tavernSnapshot(state);
      var afford = (snap.available || []).find(function (e) {
        return e.can_afford;
      });
      if (afford) {
        return {
          text: "Có thể chiêu mộ " + afford.name + " (Nhân vật → Tửu Quán)",
          panel: "generals",
          label: "Chiêu mộ",
          tavern: true,
        };
      }
    }
    var needsEquip = (state.generals || []).some(function (g) {
      var eq = g.equip || {};
      return !eq.weapon && !eq.armor && !g.horseId;
    });
    if (needsEquip && (state.inventory || []).length) {
      return {
        text: "Có đồ trong kho — đeo trang bị trước khi đánh ải",
        panel: "equip",
        label: "Trang bị",
      };
    }
    return {
      text: "Nâng cấp Mỏ Bạc / Nông Trại để tăng sản xuất · Click công trình trên bản đồ",
      panel: null,
      label: null,
    };
  }

  function updateCityNextTip(state, handlers, rates) {
    // Tip first-visit dùng #nl-tip — không ghi đè khi đang hiện hint / không mở dock
    var tip = document.getElementById("nl-tip");
    if (!tip || tip.classList.contains("is-show")) return;
    var dock = document.getElementById("city-hud-dock");
    if (!dock || !dock.classList.contains("is-open")) return;
    var step = computeCityNextStep(state);
    tip._cityStep = step;
    tip._cityHandlers = handlers;
  }

  function openCityDock() {
    var dock = document.getElementById("city-hud-dock");
    var scrim = document.getElementById("city-dock-scrim");
    var stage = document.querySelector(".game-stage");
    if (dock) {
      dock.classList.add("is-open");
      dock.setAttribute("aria-hidden", "false");
    }
    if (scrim) scrim.hidden = false;
    if (stage) stage.classList.add("is-dock-open");
  }

  function closeCityDock() {
    var dock = document.getElementById("city-hud-dock");
    var scrim = document.getElementById("city-dock-scrim");
    var stage = document.querySelector(".game-stage");
    if (dock) {
      dock.classList.remove("is-open");
      dock.setAttribute("aria-hidden", "true");
    }
    if (scrim) scrim.hidden = true;
    if (stage) stage.classList.remove("is-dock-open");
  }

  function toggleCityDock() {
    var dock = document.getElementById("city-hud-dock");
    if (dock && dock.classList.contains("is-open")) closeCityDock();
    else openCityDock();
  }

  function isCityDockOpen() {
    var dock = document.getElementById("city-hud-dock");
    return !!(dock && dock.classList.contains("is-open"));
  }

  function renderCityDockCta(state, handlers) {
    var box = document.getElementById("city-dock-cta");
    if (!box) return;
    var step = computeCityNextStep(state);
    if (!step.label || !step.panel) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.hidden = false;
    box.innerHTML =
      '<p class="meta" style="margin:0 0 0.35rem">' +
      step.text +
      '</p><button type="button" class="btn-game primary" data-city-cta="' +
      step.panel +
      '"' +
      (step.tavern ? ' data-city-tavern="1"' : "") +
      ">" +
      step.label +
      "</button>";
    box.querySelectorAll("[data-city-cta]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.getAttribute("data-city-cta");
        var tavern = btn.getAttribute("data-city-tavern") === "1";
        if (handlers && handlers._openPanel) {
          handlers._openPanel(panel, { tavern: tavern });
        } else if (tavern && handlers && handlers.openGeneralsTavern) {
          handlers.openGeneralsTavern();
        } else if (handlers && panel === "equip" && handlers.openEquip) {
          handlers.openEquip();
        } else if (handlers && panel === "tower" && handlers.openCampaign) {
          handlers.openCampaign();
        }
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

  function renderCityPanel(state, handlers) {
    var list = G.getBuildingList(state);
    var snap = G.citySnapshot ? G.citySnapshot(state) : null;
    var troopLine = snap
      ? '<p class="meta">Doanh Trại: ' + snap.troops_pool + "/" + snap.troops_max +
        " binh · Ty Vũ Lv." + snap.ty_vu_level + "</p>"
      : "";
    var html =
      panelHead("Quốc", "Quốc Chính", "Nâng cấp có thời gian chờ · Kho giới hạn dung tích · Ty Vũ khóa trần cấp.") +
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

  /** Mốc mở hệ theo cấp Thành chính / Ty Vũ (rút từ wiki VNG + Fandom). */
  var CITY_UNLOCK_MILESTONES = [
    { lv: 2, text: "Cửa hiệu — Kho / Mua / Cường hóa trang bị" },
    { lv: 8, text: "Thế giới — bản đồ liên thành" },
    { lv: 9, text: "Phủ sách lược — Khoa kỹ" },
    { lv: 13, text: "Chợ — đổi lúa ↔ bạc" },
    { lv: 14, text: "Doanh trại — chiêu binh" },
    { lv: 15, text: "Tháp thí luyện" },
    { lv: 20, text: "Khu vực — thuộc địa" },
    { lv: 21, text: "Xưởng / Tiền trang" },
    { lv: 28, text: "Tướng đài" },
    { lv: 31, text: "Dinh phủ — Tri kỷ / Quý tử" },
    { lv: 40, text: "Chợ & Quan ấn (mốc thành chủ)" },
    { lv: 60, text: "Tuần tra · Đấu trường" },
    { lv: 100, text: "Tửu quán mở rộng · Săn bắt" },
    { lv: 110, text: "Tháp thí luyện (mốc chính)" },
  ];

  function buildingActionKey(b) {
    var id = (b && (b.building_id || b.id)) || "";
    if (id === "ty_vu" || id === "hall") return "hall";
    if (id === "kho" || id === "wall" || id === "nha_kho") return "warehouse";
    if (id === "san_tap" || id === "academy" || id === "tuong_quan") return "train";
    if (id === "doanh_trai" || id === "barracks") return "barracks";
    if (id === "mo_bac" || id === "mine") return "mine";
    if (id === "nong_trai" || id === "farm") return "farm";
    if (id === "quan_vien") return "hospital";
    return "generic";
  }

  function renderBuildingDetail(state, buildingId, handlers) {
    var list = G.getBuildingList(state);
    var b = list.find(function (x) {
      return x.id === buildingId || x.building_id === buildingId;
    });
    if (!b) return;
    renderBuildingDetail._lastId = b.id || b.building_id || buildingId;

    var key = buildingActionKey(b);
    var snap = G.citySnapshot ? G.citySnapshot(state) : null;
    var rates =
      typeof NLCityEconomy !== "undefined" && NLCityEconomy.productionPerMinute
        ? NLCityEconomy.productionPerMinute(state)
        : null;

    var actionHtml = "";
    if (key === "hall") {
      var unlockRows = CITY_UNLOCK_MILESTONES.map(function (m) {
        var open = (b.level || 1) >= m.lv;
        return (
          '<div class="unlock-row' +
          (open ? " is-open" : "") +
          '"><span class="unlock-lv">Lv.' +
          m.lv +
          '</span><span>' +
          m.text +
          '</span><span class="unlock-st">' +
          (open ? "Đã mở" : "Chưa") +
          "</span></div>"
        );
      }).join("");
      actionHtml =
        '<div class="bldg-actions">' +
        "<h4>Chức năng Thành chính</h4>" +
        '<p class="meta">Trần cấp mọi công trình = Lv.' +
        (b.level || 1) +
        ". Nâng Ty Vũ để mở hệ (wiki).</p>" +
        '<div class="unlock-list">' +
        unlockRows +
        "</div>" +
        '<div class="row-btns">' +
        '<button type="button" class="btn-game" data-bldg-go="city">Quốc Chính</button>' +
        '<button type="button" class="btn-game" data-bldg-go="world">Thế Giới</button>' +
        "</div></div>";
    } else if (key === "warehouse") {
      actionHtml =
        '<div class="bldg-actions">' +
        "<h4>Kho</h4>" +
        '<p class="meta">' +
        (b.effectText || "Sức chứa bạc / lương.") +
        " · Kho đồ tướng mở ở Trang bị (wiki: Cửa hiệu → Kho).</p>" +
        '<div class="row-btns">' +
        '<button type="button" class="btn-game primary" data-bldg-go="equip">Mở Kho / Trang bị</button>' +
        "</div></div>";
    } else if (key === "train") {
      actionHtml =
        '<div class="bldg-actions">' +
        "<h4>Thao trường · Huấn luyện</h4>" +
        '<p class="meta">' +
        (b.effectText || "Giảm phí huấn luyện.") +
        " · Wiki: Võ tướng · Huấn luyện · Chiêu mộ · Trận.</p>" +
        '<div class="row-btns">' +
        '<button type="button" class="btn-game primary" data-bldg-go="generals">Nhân vật</button>' +
        '<button type="button" class="btn-game" data-bldg-go="generals-luyen">Huấn luyện</button>' +
        '<button type="button" class="btn-game" data-bldg-go="generals-recruit">Chiêu mộ</button>' +
        "</div></div>";
    } else if (key === "barracks") {
      var troopLine = snap
        ? "Doanh binh: " + snap.troops_pool + "/" + snap.troops_max
        : b.effectText || "";
      actionHtml =
        '<div class="bldg-actions">' +
        "<h4>Doanh trại</h4>" +
        '<p class="meta">' +
        troopLine +
        " · Chiêu binh / trần binh lực (wiki).</p>" +
        '<div class="row-btns">' +
        '<button type="button" class="btn-game primary" data-bldg-go="generals-tran">Xếp trận</button>' +
        "</div></div>";
    } else if (key === "mine" || key === "farm") {
      var rateLine =
        rates && key === "mine"
          ? "+" + (rates.silver || 0) + " bạc/phút"
          : rates
          ? "+" + (rates.food || 0) + " lương/phút"
          : b.effectText || "";
      actionHtml =
        '<div class="bldg-actions">' +
        "<h4>" +
        (key === "mine" ? "Mỏ bạc" : "Nông trại") +
        "</h4>" +
        '<p class="meta">Sản xuất: ' +
        rateLine +
        ". Tài nguyên cộng theo thời gian (nút +1h trên HUD).</p></div>";
    } else if (key === "hospital") {
      actionHtml =
        '<div class="bldg-actions">' +
        "<h4>Quân viện</h4>" +
        '<p class="meta">' +
        (b.effectText || "+% HP xuất trận.") +
        "</p></div>";
    }

    var statusHtml = b.upgrading
      ? '<p class="cost" style="color:#c9a227;margin:0.75rem 0">Đang nâng cấp: <b id="up-cd">' +
        b.countdown +
        "</b></p>" +
        '<button type="button" class="btn-game" disabled>Chờ hoàn tất</button>'
      : '<p class="cost" style="margin:0.75rem 0">Nâng cấp: ' +
        fmt(b.cost.food) +
        " lương · " +
        fmt(b.cost.silver) +
        " bạc" +
        (b.timeSec
          ? " · chờ " +
            (typeof NLCityEconomy !== "undefined"
              ? NLCityEconomy.formatCountdown(b.timeSec)
              : b.timeSec + "s")
          : "") +
        "</p>" +
        '<button type="button" class="btn-game primary" id="btn-up-one">Nâng cấp</button>';

    var html =
      panelHead("Xây", b.name, "Lv." + b.level + " · chạm chức năng bên dưới") +
      '<p class="meta">' +
      (b.desc || "") +
      "</p>" +
      "<p>" +
      (b.effectText || "") +
      "</p>" +
      actionHtml +
      '<div class="bldg-upgrade">' +
      "<h4>Nâng cấp công trình</h4>" +
      statusHtml +
      "</div>";
    openPanel(html);

    var btn = document.getElementById("btn-up-one");
    if (btn) {
      btn.addEventListener("click", function () {
        handlers.upgrade(b.id || buildingId);
      });
    }
    document.querySelectorAll("#panel-body [data-bldg-go]").forEach(function (el) {
      el.addEventListener("click", function () {
        var go = el.getAttribute("data-bldg-go");
        if (go === "equip" && handlers.openEquip) handlers.openEquip();
        else if (go === "generals" && handlers.openGeneralsOwned) handlers.openGeneralsOwned();
        else if (go === "generals-luyen") {
          if (U.renderGenerals) U.renderGenerals._sub = "luyen";
          if (handlers.openGeneralsOwned) handlers.openGeneralsOwned();
        } else if (go === "generals-recruit") {
          if (handlers.openGeneralsTavern) handlers.openGeneralsTavern();
        } else if (go === "generals-tran") {
          if (U.renderGenerals) U.renderGenerals._sub = "tran";
          if (handlers.openGeneralsOwned) handlers.openGeneralsOwned();
        } else if (handlers._openPanel && (go === "city" || go === "world")) {
          handlers._openPanel(go);
        }
      });
    });
  }

  /** Khối «Lính đang dùng» — bám layout Ngọa Long gốc (portrait lính + loại + mô tả). */

  U.renderResources = renderResources;
  U.renderCityDock = renderCityDock;
  U.openCityDock = openCityDock;
  U.closeCityDock = closeCityDock;
  U.toggleCityDock = toggleCityDock;
  U.isCityDockOpen = isCityDockOpen;
  U.renderCityPanel = renderCityPanel;
  U.renderBuildingDetail = renderBuildingDetail;
})(window.NLUIParts = window.NLUIParts || {});
