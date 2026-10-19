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
      btn.addEventListener("click", function () {
        var h = handlers || renderCityDock._handlers;
        if (h && h.upgrade) h.upgrade(btn.getAttribute("data-dock-up"));
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
        text: "Chưa xếp tướng ra trận — mở Tửu Quán → Võ Tướng, chọn Ô 1–5",
        panel: "generals",
        label: "Tửu Quán",
        tavern: true,
      };
    }
    if (typeof NLRecruit !== "undefined" && NLRecruit.tavernSnapshot) {
      var snap = NLRecruit.tavernSnapshot(state);
      var afford = (snap.available || []).find(function (e) {
        return e.can_afford;
      });
      if (afford) {
        return {
          text: "Có thể chiêu mộ " + afford.name + " tại Tửu Quán",
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
    var tip = document.getElementById("nl-tip");
    if (!tip) return;
    var step = computeCityNextStep(state);
    var rateBit =
      rates && rates.silver != null
        ? "+" + rates.silver + " bạc/ph · +" + rates.food + " lương/ph · "
        : "";
    tip.textContent = rateBit + step.text;
    tip._cityStep = step;
    tip._cityHandlers = handlers;
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
      panelHead("Xây", b.name, "Cấp hiện tại: Lv." + b.level) +
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
        "Rượu",
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
            var qLabel = g.qualityName || g.quality || "";
            var awakenBtn = g.canAwaken
              ? '<button type="button" class="btn-game primary" data-awaken="' +
                g.id +
                '" title="' +
                (g.awakenCost || [])
                  .map(function (c) {
                    return (c.name || c.itemId) + "×" + (c.qty || 0);
                  })
                  .join(", ") +
                '">Giác ngộ</button>'
              : "";
            return (
              '<article class="gcard">' +
              '<div class="gcard-portrait">' +
              '<img class="gcard-art" src="' +
              generalArt(g) +
              '" alt="" draggable="false" onerror="this.onerror=null;this.src=\'' +
              troopSprite(g.troop, troopTierOf(g)) +
              '\'" />' +
              "<div>" +
              '<span class="troop ' +
              g.troop +
              '">' +
              (troop ? troop.name : g.troop) +
              (g.troop2 ? " / " + troopShort(g.troop2) : "") +
              " · " +
              qLabel +
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
              (g.skill
                ? '<p class="meta" style="margin:0.15rem 0 0">Chiêu: <b>' + g.skill + "</b></p>"
                : "") +
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
              '<button type="button" class="btn-game" data-equip-g="' +
              g.id +
              '">Trang bị</button>' +
              '<button type="button" class="btn-game" data-train="' +
              g.id +
              '">Huấn luyện</button>' +
              '<button type="button" class="btn-game" data-enh="' +
              g.id +
              '">Cường hóa</button>' +
              awakenBtn +
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
    document.querySelectorAll("#panel-body [data-awaken]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.awaken) handlers.awaken(btn.getAttribute("data-awaken"));
      });
    });
    document.querySelectorAll("#panel-body [data-enh]").forEach(function (btn) {
      btn.addEventListener("click", function () { handlers.enhance(btn.getAttribute("data-enh")); });
    });
    document.querySelectorAll("#panel-body [data-equip-g]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (handlers.openEquipGeneral) handlers.openEquipGeneral(btn.getAttribute("data-equip-g"));
        else if (handlers.openEquip) handlers.openEquip();
      });
    });
  }

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
        var opts = Object.keys(pool)
          .filter(function (id) {
            return pool[id] > 0 || id === curId;
          })
          .map(function (id) {
            var m = NLDatabase.getItem(id);
            if (!m) return "";
            var left = pool[id] || 0;
            var sel = id === curId ? " selected" : "";
            var bonus = formatItemBonuses(m);
            return (
              '<option value="' +
              m.id +
              '"' +
              sel +
              ">" +
              m.name +
              (m.qualityWiki ? " · " + m.qualityWiki : "") +
              (bonus ? " — " + bonus : "") +
              (id !== curId && left > 1 ? " ×" + left : "") +
              "</option>"
            );
          })
          .join("");

        html +=
          '<div class="equip-slot" data-slot="' +
          slot +
          '">' +
          itemIconHtml(cur) +
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
          '<select class="equip-slot-sel" data-gid="' +
          g.id +
          '" data-slot="' +
          slot +
          '">' +
          '<option value="">(Tháo)</option>' +
          opts +
          "</select></div></div>";
      });

      html += "</div></div>";
    });
    html += "</div>";
    html +=
      '<p class="meta">Đồ khởi đầu trong kho. Cường hóa tướng (+1…+10) trong mục Võ Tướng.</p>';
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
    host.querySelectorAll(".equip-slot-sel").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var gid = sel.getAttribute("data-gid");
        var slot = sel.getAttribute("data-slot");
        var itemId = sel.value || null;
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
        renderEquip(state);
      });
    });
  }

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
    showCampaignBriefing: showCampaignBriefing,
    showFormation: showFormation,
  };
})(window);
