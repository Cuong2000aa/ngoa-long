/* global window, NLDatabase */
/**
 * NL Combat Engine v3 — bám cơ chế Ngọa Long 2011
 * - Lưới 3+2 (front bảo vệ back)
 * - Sĩ khí: start 50 | +25 đánh | +15 bị đánh | >=100 → Chiến pháp → reset 0
 * - Khắc cận chiến: Kỵ>Bộ>Thương>Kỵ ; Cung/Mưu đánh xa
 * - Battle Log JSON theo từng action để Client render
 */
(function (global) {
  function uid(prefix) {
    return (prefix || "u") + "_" + Math.random().toString(36).slice(2, 8);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }

  function cfg() {
    var f = NLDatabase && NLDatabase.formulas && NLDatabase.formulas();
    return {
      combat: (f && f.combat) || {},
      morale: (f && f.morale) || {
        start: 50,
        max: 100,
        gainOnAttack: 25,
        gainOnHit: 15,
        skillThreshold: 100,
        resetAfterSkill: 0,
      },
    };
  }

  function troopInfo(troopId) {
    if (!NLDatabase) return null;
    return NLDatabase.getTroop(troopId);
  }

  /** Hệ số khắc chế — tam giác cận chiến */
  function counterMultiplier(atkTroop, defTroop) {
    var C = cfg().combat;
    var counterMul = C.counterMul != null ? C.counterMul : 1.25;
    var weakMul = C.weakMul != null ? C.weakMul : 0.8;
    var a = troopInfo(atkTroop);
    var d = troopInfo(defTroop);
    if (!a || !d) return 1;
    // Ranged không vào vòng khắc cứng
    if (a.range === "ranged" || d.range === "ranged") return 1;
    if (a.beats === defTroop) return counterMul;
    if (d.beats === atkTroop) return weakMul;
    return 1;
  }

  function getFormation(formationId) {
    var raw = NLDatabase && NLDatabase.raw && NLDatabase.raw();
    var formations = raw && raw.formations;
    if (!formations || !formations.list) return null;
    var fid = formationId || formations.defaultId || "crane_wing";
    return formations.list[fid] || formations.list[formations.defaultId] || null;
  }

  /**
   * Trận pháp: teamBonus (chỉ số chính khác nhau mỗi trận) × slotMods (tinh chỉnh ô).
   * Trả về hệ số áp vào vuLuc / tongLinh / triLuc / hp / speed + formAtk/formDef (tương thích cũ).
   */
  function formationMods(formationId, slot) {
    var form = getFormation(formationId);
    var out = {
      atk: 1,
      def: 1,
      vuLuc: 1,
      tongLinh: 1,
      triLuc: 1,
      hp: 1,
      speed: 1,
      focus: null,
      formationId: formationId || null,
    };
    if (!form) return out;
    var tb = form.teamBonus || {};
    out.vuLuc = tb.vuLuc != null ? tb.vuLuc : 1;
    out.tongLinh = tb.tongLinh != null ? tb.tongLinh : 1;
    out.triLuc = tb.triLuc != null ? tb.triLuc : 1;
    out.hp = tb.hp != null ? tb.hp : 1;
    out.speed = tb.speed != null ? tb.speed : 1;
    out.focus = form.focus || null;
    var m = form.slotMods
      ? form.slotMods[String(slot)] || form.slotMods[slot]
      : null;
    var slotAtk = (m && m.atk) || 1;
    var slotDef = (m && m.def) || 1;
    // formAtk/formDef = team vuLuc/tongLinh × slot (damage path cũ)
    out.atk = out.vuLuc * slotAtk;
    out.def = out.tongLinh * slotDef;
    out.vuLuc *= slotAtk;
    out.tongLinh *= slotDef;
    return out;
  }

  /** Ô trên lưới 3×3 của trận pháp (col 0..2, row 0=trước). */
  function layoutCell(formationId, slot) {
    var form = getFormation(formationId);
    if (form && form.layout && form.layout.length) {
      for (var i = 0; i < form.layout.length; i++) {
        if (form.layout[i].slot === slot || i === slot) {
          return {
            col: form.layout[i].col != null ? form.layout[i].col : 1,
            row: form.layout[i].row != null ? form.layout[i].row : (slot <= 2 ? 0 : 2),
          };
        }
      }
    }
    // fallback lưới cũ 3+2
    var fallback = [
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
      { col: 1, row: 2 },
      { col: 2, row: 2 },
    ];
    return fallback[slot] || fallback[0];
  }

  /** Hàng trước = layout.row === 0 theo trận pháp (Ngọa Long 3×3). */
  function isFront(slot, formationId) {
    var cell = layoutCell(formationId, slot);
    return cell.row === 0;
  }

  function normalizeUnit(raw, side, slot, formationId) {
    var g = raw;
    if (raw.generalId && raw.vuLuc == null && NLDatabase) {
      g = NLDatabase.scaleGeneral(raw.generalId, raw.level || 1) || raw;
    }
    var tongLinh = g.tongLinh != null ? g.tongLinh : Math.round((g.def || 50) * 0.9);
    var vuLuc = g.vuLuc != null ? g.vuLuc : Math.round(g.atk || 50);
    var triLuc = g.triLuc != null ? g.triLuc : Math.round((g.atk || 50) * 0.6);
    var hp = g.hp != null ? g.hp : g.maxHp || 2000;
    // Cộng bonus cường hóa (+4% mỗi cấp enhance) nếu có
    var enhMul = 1 + (g.enhance || 0) * 0.04;
    if (enhMul > 1) {
      tongLinh = Math.round(tongLinh * enhMul);
      vuLuc = Math.round(vuLuc * enhMul);
      triLuc = Math.round(triLuc * enhMul);
      hp = Math.round(hp * enhMul);
    }
    var s = slot != null ? slot : g.slot != null ? g.slot : 0;
    s = clamp(s, 0, 4);
    var moraleCfg = cfg().morale;
    var mods = formationMods(formationId, s);

    // Áp teamBonus + slot vào chỉ số gốc (mỗi trận pháp tăng 1 chỉ số chính)
    vuLuc = Math.round(vuLuc * (mods.vuLuc || 1));
    tongLinh = Math.round(tongLinh * (mods.tongLinh || 1));
    triLuc = Math.round(triLuc * (mods.triLuc || 1));
    hp = Math.round(hp * (mods.hp || 1));
    var maxHpBase = g.maxHp || hp;
    var maxHp = Math.round(maxHpBase * (mods.hp || 1));
    if (hp > maxHp) hp = maxHp;

    var troopTier =
      g.troopTier != null
        ? g.troopTier
        : NLDatabase && NLDatabase.troopTierForLevel
        ? NLDatabase.troopTierForLevel(g.level || 1)
        : 1;
    var activeTroop = g.activeTroop || g.troop || "infantry";
    var troop2 = g.troop2 || null;
    var troopTierName = g.troopTierName || null;
    if (!troopTierName && NLDatabase && NLDatabase.getTroop) {
      var tr = NLDatabase.getTroop(activeTroop);
      if (tr && tr.tierNames && tr.tierNames[troopTier - 1]) {
        troopTierName = tr.tierNames[troopTier - 1];
      }
    }
    return {
      uid: g.uid || uid(side === "player" ? "h" : "e"),
      generalId: g.id || g.generalId || g.key || "unknown",
      name: g.name || "?",
      side: side,
      slot: s,
      troop: activeTroop,
      troopPrimary: g.troopPrimary || g.troop || activeTroop,
      troop2: troop2,
      troopSwitched: false,
      horseId: g.horseId || null,
      troopTier: troopTier,
      troopTierName: troopTierName,
      quality: g.quality || "white",
      level: g.level || 1,
      tongLinh: tongLinh,
      vuLuc: vuLuc,
      triLuc: triLuc,
      hp: hp,
      maxHp: maxHp,
      morale: moraleCfg.start != null ? moraleCfg.start : 50,
      maxMorale: moraleCfg.max != null ? moraleCfg.max : 100,
      skillId: (function () {
        if (NLDatabase && NLDatabase.resolveSkillId) {
          return NLDatabase.resolveSkillId({
            id: g.id || g.generalId,
            skillId: g.skillBaseId || g.skillId,
            quality: g.quality || "white",
            skillsByQuality: g.skillsByQuality,
          });
        }
        return g.skillId || "basic_strike";
      })(),
      // Chỉ số đã nhân teamBonus ở trên → formAtk/formDef = 1 để không nhân đôi trong calcHit
      formAtk: 1,
      formDef: 1,
      formSpeed: mods.speed || 1,
      formFocus: mods.focus || null,
      formationId: mods.formationId || formationId || null,
      buffs: [],
      stunned: 0,
      silenced: 0,
      alive: true,
    };
  }

  function living(units, side) {
    return units.filter(function (u) {
      return u.alive && u.hp > 0 && (!side || u.side === side);
    });
  }

  function frontAlive(units, side) {
    return living(units, side).filter(function (u) {
      return isFront(u.slot, u.formationId);
    });
  }

  function backAlive(units, side) {
    return living(units, side).filter(function (u) {
      return !isFront(u.slot, u.formationId);
    });
  }

  /** Mục tiêu đánh thường: bắt buộc hàng trước nếu còn sống */
  function pickNormalTarget(attacker, defenders) {
    var foes = living(defenders);
    if (!foes.length) return null;
    var atkInfo = troopInfo(attacker.troop);
    var ranged = atkInfo && atkInfo.range === "ranged";
    var front = frontAlive(defenders, foes[0].side);
    // Cận chiến / mặc định: chỉ đánh được hàng trước nếu còn
    if (!ranged && front.length) {
      return front[Math.floor(Math.random() * front.length)];
    }
    // Ranged: ưu tiên front 70%, có thể bắn back 30% nếu có
    if (ranged) {
      var back = backAlive(defenders, foes[0].side);
      if (back.length && Math.random() < 0.35) {
        return back[Math.floor(Math.random() * back.length)];
      }
      if (front.length) return front[Math.floor(Math.random() * front.length)];
      return foes[Math.floor(Math.random() * foes.length)];
    }
    return foes[Math.floor(Math.random() * foes.length)];
  }

  function resolveSkillTargets(actor, pattern, enemies, allies) {
    var foes = living(enemies);
    var friends = living(allies);
    if (!pattern || pattern === "single") {
      var t = pickNormalTarget(actor, enemies);
      return t ? [t] : [];
    }
    if (pattern === "self") return [actor];
    if (pattern === "ally_all") return friends.slice();
    if (pattern === "all") return foes.slice();
    if (pattern === "front_row") {
      var fr = frontAlive(enemies, foes[0] && foes[0].side);
      return fr.length ? fr : foes.slice(0, 1);
    }
    if (pattern === "row") {
      var one = pickNormalTarget(actor, enemies);
      if (!one) return [];
      var oneRow = layoutCell(one.formationId, one.slot);
      return foes.filter(function (u) {
        var c = layoutCell(u.formationId, u.slot);
        return c && oneRow && c.row === oneRow.row;
      });
    }
    if (pattern === "column") {
      var focus = pickNormalTarget(actor, enemies);
      if (!focus) return [];
      var focusCell = layoutCell(focus.formationId, focus.slot);
      return foes.filter(function (u) {
        var c = layoutCell(u.formationId, u.slot);
        return c && focusCell && c.col === focusCell.col;
      });
    }
    return [];
  }

  /**
   * Mục tiêu phụ theo mô tả «hàng sau / hàng trước» khi pattern chính đã chọn.
   * Trả về unit chưa nằm trong primary (giảm dame riêng ở caller).
   */
  function resolveSecondaryTargets(actor, skill, primary, enemies) {
    var desc = ((skill && skill.desc) || "").toLowerCase();
    var foes = living(enemies);
    var primaryIds = {};
    (primary || []).forEach(function (u) {
      if (u && u.uid) primaryIds[u.uid] = true;
    });
    var extra = [];
    function pickBack() {
      var backs = backAlive(enemies, foes[0] && foes[0].side).filter(function (u) {
        return !primaryIds[u.uid];
      });
      if (!backs.length) return null;
      return backs[Math.floor(Math.random() * backs.length)];
    }
    function pickFront() {
      var fronts = frontAlive(enemies, foes[0] && foes[0].side).filter(function (u) {
        return !primaryIds[u.uid];
      });
      if (!fronts.length) return null;
      return fronts[Math.floor(Math.random() * fronts.length)];
    }
    // «khiến 1 kẻ địch hàng sau» / «hàng trước» — phổ biến wiki C.Pháp
    if (/hàng\s*sau/.test(desc)) {
      var b = pickBack();
      if (b) extra.push(b);
    }
    if (/hàng\s*trước/.test(desc) && (skill.pattern === "column" || skill.pattern === "single")) {
      var fr = pickFront();
      if (fr && !primaryIds[fr.uid]) extra.push(fr);
    }
    return extra;
  }

  function speedOf(u, weights) {
    var w = weights || { vuLuc: 0.55, tongLinh: 0.25, triLuc: 0.2 };
    var base =
      u.vuLuc * (w.vuLuc || 0.55) +
      u.tongLinh * (w.tongLinh || 0.25) +
      u.triLuc * (w.triLuc || 0.2);
    return base * (u.formSpeed != null ? u.formSpeed : 1);
  }

  /** Thứ tự ra đòn: tốc độ ↓, rồi slot ↑ (trước → sau) */
  function turnOrder(units, combatCfg) {
    var w = combatCfg.speedWeights || {};
    return living(units).slice().sort(function (a, b) {
      var sa = speedOf(a, w);
      var sb = speedOf(b, w);
      if (Math.abs(sa - sb) > 0.01) return sb - sa;
      return a.slot - b.slot;
    });
  }

  /** combatProfiles từ status-effects.json — hệ số wiki_buff/debuff */
  function combatProfiles() {
    var se =
      (typeof NLDatabase !== "undefined" && NLDatabase.statusEffects && NLDatabase.statusEffects()) ||
      (global.NL_DB && global.NL_DB.statusEffects) ||
      null;
    return (se && se.combatProfiles) || {};
  }

  function wikiProfile(buff) {
    if (!buff) return null;
    var profiles = combatProfiles();
    var id = buff.id;
    if (id && profiles[id]) return profiles[id];
    // fallback theo label slug đơn giản
    if (buff.label && profiles[buff.label]) return profiles[buff.label];
    return null;
  }

  function buffMul(unit, key) {
    var m = 1;
    (unit.buffs || []).forEach(function (b) {
      if (b.type === key) m += b.value || 0;
      // wiki_buff cộng atk/def theo combatProfiles × stacks
      if (b.type === "wiki_buff" || b.type === "wiki_debuff") {
        var p = wikiProfile(b);
        if (!p) return;
        var stacks = b.stacks || 1;
        if (key === "atk_up" && p.atkMul) m += p.atkMul * stacks;
        if (key === "def_up" && p.defMul) m += p.defMul * stacks;
      }
    });
    return m;
  }

  function wikiDownMul(unit, key) {
    // key: atkDown | defDown — trả về hệ số nhân (1 - tổng)
    var cut = 0;
    (unit.buffs || []).forEach(function (b) {
      if (b.type !== "wiki_buff" && b.type !== "wiki_debuff") return;
      var p = wikiProfile(b);
      if (!p) return;
      if (key === "atkDown" && p.atkDown) cut += p.atkDown;
      if (key === "defDown" && p.defDown) cut += p.defDown;
    });
    return Math.max(0.4, 1 - cut);
  }

  function tickStatus(unit) {
    unit.buffs = (unit.buffs || []).filter(function (b) {
      if (b.duration == null) return true;
      b.duration -= 1;
      return b.duration > 0;
    });
    if (unit.stunned > 0) unit.stunned -= 1;
    if (unit.silenced > 0) unit.silenced -= 1;
  }

  function calcHit(attacker, defender, damageType, power, opts) {
    opts = opts || {};
    var C = cfg().combat;
    var counter = counterMultiplier(attacker.troop, defender.troop);
    var atkStat = damageType === "strategy" ? attacker.triLuc : attacker.vuLuc;
    atkStat *= attacker.formAtk || 1;
    atkStat *= buffMul(attacker, "atk_up");
    atkStat *= wikiDownMul(attacker, "atkDown");
    (attacker.buffs || []).forEach(function (b) {
      if (b.type === "atk_down") atkStat *= 1 - (b.value || 0);
    });
    // lifesteal đánh dấu trên opts — calcHit không trừ máu ở đây
    var lifeSteal = 0;
    (attacker.buffs || []).forEach(function (b) {
      if (b.type !== "wiki_buff") return;
      var p = wikiProfile(b);
      if (p && p.lifesteal) lifeSteal += p.lifesteal;
    });

    var defense = defender.tongLinh * (defender.formDef || 1);
    defense *= buffMul(defender, "def_up");
    defense *= wikiDownMul(defender, "defDown");
    (defender.buffs || []).forEach(function (b) {
      if (b.type === "def_down") defense *= 1 - (b.value || 0);
    });

    var defInfo = troopInfo(defender.troop);
    if (defInfo && defInfo.range === "ranged" && defInfo.armorCoef) {
      defense *= defInfo.armorCoef;
    }

    var coef = damageType === "strategy" ? C.stratCoef != null ? C.stratCoef : 1 : C.physCoef != null ? C.physCoef : 1;
    var raw = atkStat * (power || 1) * coef * counter - defense;
    var minD = C.minDamage != null ? C.minDamage : 25;
    raw *= rnd(C.damageRandomMin != null ? C.damageRandomMin : 0.95, C.damageRandomMax != null ? C.damageRandomMax : 1.05);

    var missChance = clamp(
      (C.missBase != null ? C.missBase : 0.05) + defender.tongLinh * 0.0003 - attacker.vuLuc * 0.00012,
      (C.missClamp && C.missClamp[0]) || 0.02,
      (C.missClamp && C.missClamp[1]) || 0.18
    );
    var missed = !opts.noMiss && Math.random() < missChance;

    var critChance = clamp(
      (C.critBase != null ? C.critBase : 0.08) + (opts.critBonus || 0) + attacker.vuLuc * 0.0002,
      (C.critClamp && C.critClamp[0]) || 0.05,
      (C.critClamp && C.critClamp[1]) || 0.4
    );
    var crit = !missed && Math.random() < critChance;
    if (crit) raw *= C.critMul != null ? C.critMul : 1.5;

    var dmg = missed ? 0 : Math.max(minD, Math.round(raw));
    return {
      damage: dmg,
      missed: missed,
      crit: crit,
      counter: counter,
      lifesteal: lifeSteal > 0 && !missed ? lifeSteal : 0,
    };
  }

  /** Wiki: https://ngoalong.vnggames.com/ngoa-long-wiki/hieu-ung — ưu tiên NL_DB.statusEffects */
  var STATUS_META_FALLBACK = {
    stun: { id: "stun", label: "Hỗn loạn", short: "Loạn", kind: "control" },
    silence: { id: "silence", label: "Ám tế", short: "Ám", kind: "debuff" },
    poison: { id: "poison", label: "Trúng độc", short: "Độc", kind: "debuff" },
    burn: { id: "burn", label: "Thiêu đốt", short: "Thiêu", kind: "debuff" },
    atk_up: { id: "atk_up", label: "Anh dũng", short: "Dũng", kind: "buff" },
    atk_down: { id: "atk_down", label: "Giảm công", short: "Yếu", kind: "debuff" },
    def_up: { id: "def_up", label: "Kiên thủ", short: "Thủ", kind: "buff" },
    def_down: { id: "def_down", label: "Phá thủ", short: "Phá", kind: "debuff" },
  };

  function statusMetaMap() {
    var se =
      (typeof NLDatabase !== "undefined" && NLDatabase.statusEffects && NLDatabase.statusEffects()) ||
      (global.NL_DB && global.NL_DB.statusEffects) ||
      null;
    if (se && se.effects) {
      var out = {};
      Object.keys(se.effects).forEach(function (k) {
        var e = se.effects[k];
        out[k] = {
          id: e.id || k,
          label: e.label || e.wiki || k,
          short: e.short || (e.label || k).slice(0, 4),
          kind: e.kind || "debuff",
          icon: e.iconLocal || e.icon || null,
        };
      });
      // Catalog wiki — map id / tên → icon local
      (se.wikiCatalog || []).forEach(function (c) {
        if (!c || !c.id) return;
        if (!out[c.id]) {
          out[c.id] = {
            id: c.id,
            label: c.name || c.id,
            short: (c.name || c.id).slice(0, 4),
            kind: c.kind || "buff",
            icon: c.iconLocal || c.icon || null,
          };
        } else if (!out[c.id].icon && (c.iconLocal || c.icon)) {
          out[c.id].icon = c.iconLocal || c.icon;
        }
      });
      return out;
    }
    return STATUS_META_FALLBACK;
  }

  function resolveStatusIcon(metaOrId, label) {
    var STATUS_META = statusMetaMap();
    var se =
      (typeof NLDatabase !== "undefined" && NLDatabase.statusEffects && NLDatabase.statusEffects()) ||
      (global.NL_DB && global.NL_DB.statusEffects) ||
      null;
    if (metaOrId && typeof metaOrId === "object" && metaOrId.icon) return metaOrId.icon;
    var id = typeof metaOrId === "string" ? metaOrId : metaOrId && metaOrId.id;
    if (id && STATUS_META[id] && STATUS_META[id].icon) return STATUS_META[id].icon;
    if (!se || !se.wikiCatalog) return null;
    var key = String(label || id || "").toLowerCase();
    for (var i = 0; i < se.wikiCatalog.length; i++) {
      var c = se.wikiCatalog[i];
      if (
        (c.id && c.id === id) ||
        (c.name && String(c.name).toLowerCase() === key) ||
        (c.name && key && String(c.name).toLowerCase().indexOf(key) === 0)
      ) {
        return c.iconLocal || c.icon || null;
      }
    }
    return null;
  }

  function collectStatuses(unit) {
    var STATUS_META = statusMetaMap();
    var out = [];
    if (!unit) return out;
    if (unit.stunned > 0) {
      var st = STATUS_META.stun;
      if (st) out.push(Object.assign({}, st, { icon: st.icon || resolveStatusIcon(st) }));
    }
    if (unit.silenced > 0) {
      var si = STATUS_META.silence;
      if (si) out.push(Object.assign({}, si, { icon: si.icon || resolveStatusIcon(si) }));
    }
    (unit.buffs || []).forEach(function (b) {
      var key = b.type === "dot" ? b.dotType || "poison" : b.type;
      // wiki_buff / wiki_debuff — giữ đúng tên từ mô tả chiêu
      if (key === "wiki_buff" || key === "wiki_debuff") {
        var wid = b.id || key;
        if (!out.some(function (x) { return x.id === wid; })) {
          out.push({
            id: wid,
            label: b.label || wid,
            short: (b.label || wid).slice(0, 4),
            kind: b.kind || (key === "wiki_debuff" ? "debuff" : "buff"),
            icon: resolveStatusIcon(wid, b.label),
          });
        }
        return;
      }
      var meta = STATUS_META[key];
      if (meta) {
        // Ưu tiên label wiki từ skill desc (vd Thiết Bích thay vì Kiên thủ)
        var entry = {
          id: meta.id,
          label: b.label || meta.label,
          short: b.label ? String(b.label).slice(0, 4) : meta.short || meta.label,
          kind: meta.kind,
          icon: meta.icon || resolveStatusIcon(meta, b.label || meta.label),
        };
        if (!out.some(function (x) { return x.id === entry.id && x.label === entry.label; })) {
          out.push(entry);
        }
      }
    });
    return out;
  }

  function pushStatuses(uiEvents, unit) {
    if (!uiEvents || !unit) return;
    uiEvents.push({
      type: "status",
      uid: unit.uid,
      statuses: collectStatuses(unit).map(function (s) {
        return {
          id: s.id,
          label: s.short || s.label,
          kind: s.kind,
          icon: s.icon || null,
        };
      }),
    });
  }

  function pushBuff(who, type, value, duration, extra) {
    if (!who) return;
    var b = { type: type, value: value, duration: duration };
    if (extra) {
      if (extra.label) b.label = extra.label;
      if (extra.id) b.id = extra.id;
      if (extra.kind) b.kind = extra.kind;
      if (extra.dotType) b.dotType = extra.dotType;
    }
    who.buffs.push(b);
  }

  function applyEffects(actor, targets, effects, uiEvents) {
    if (!effects) return;
    var touched = {};
    effects.forEach(function (eff) {
      var list =
        eff.target === "self"
          ? [actor]
          : targets && targets.length
            ? targets
            : [actor];
      list.forEach(function (t) {
        if (!t) return;
        if (!t.alive && eff.type !== "heal_pct" && eff.type !== "morale_boost") return;
        if (eff.chance != null && Math.random() > eff.chance) return;
        var extra =
          eff.label || eff.id || eff.kind
            ? { label: eff.label, id: eff.id, kind: eff.kind }
            : null;
        if (eff.type === "stun") t.stunned = Math.max(t.stunned, eff.duration || 1);
        else if (eff.type === "silence") t.silenced = Math.max(t.silenced, eff.duration || 1);
        else if (eff.type === "burn" || eff.type === "poison") {
          pushBuff(t, "dot", eff.value || 0.08, eff.duration || 2, {
            label: eff.label,
            kind: "debuff",
            dotType: eff.type,
          });
        } else if (eff.type === "def_down" || eff.type === "atk_down" || eff.type === "atk_up" || eff.type === "def_up") {
          var who = eff.self ? actor : t;
          pushBuff(who, eff.type, eff.value || 0.1, eff.duration || 2, extra);
          touched[who.uid] = who;
        } else if (eff.type === "self_def_up") {
          pushBuff(actor, "def_up", eff.value || 0.2, eff.duration || 2, extra || { label: "Kiên Thủ" });
          touched[actor.uid] = actor;
        } else if (eff.type === "tonglinh_up") {
          var tgt = eff.self ? actor : t;
          pushBuff(tgt, "def_up", eff.value || 0.1, eff.duration || 2, extra);
          touched[tgt.uid] = tgt;
        } else if (eff.type === "wiki_buff" || eff.type === "wiki_debuff") {
          var wTarget = eff.target === "self" ? actor : t;
          var wKind = eff.kind || (eff.type === "wiki_debuff" ? "debuff" : "buff");
          var wid = eff.id || eff.type;
          // Stack cùng id: refresh duration + cộng dồn nhẹ (tối đa 3)
          var stacked = false;
          (wTarget.buffs || []).forEach(function (b) {
            if (b.id === wid && (b.type === "wiki_buff" || b.type === "wiki_debuff")) {
              b.duration = Math.max(b.duration || 0, eff.duration || 2);
              b.stacks = Math.min(3, (b.stacks || 1) + 1);
              stacked = true;
            }
          });
          if (!stacked) {
            pushBuff(wTarget, eff.type, 0, eff.duration || 2, {
              label: eff.label,
              id: wid,
              kind: wKind,
            });
            var last = wTarget.buffs[wTarget.buffs.length - 1];
            if (last) last.stacks = 1;
          }
          // control profile → stun
          var wp = wikiProfile({ id: wid, label: eff.label });
          if ((wKind === "control" || (wp && wp.stun)) && wTarget) {
            wTarget.stunned = Math.max(wTarget.stunned || 0, eff.duration || 1);
          }
          touched[wTarget.uid] = wTarget;
        } else if (eff.type === "heal_pct") {
          var heal = Math.round(t.maxHp * (eff.value || 0.1));
          t.hp = Math.min(t.maxHp, t.hp + heal);
        } else if (eff.type === "morale_boost") {
          t.morale = clamp(t.morale + (eff.value || 20), 0, t.maxMorale);
        }
        touched[t.uid] = t;
      });
    });
    if (uiEvents) {
      Object.keys(touched).forEach(function (uid) {
        pushStatuses(uiEvents, touched[uid]);
      });
    }
  }

  function processDots(unit) {
    var notes = [];
    (unit.buffs || []).forEach(function (b) {
      if (b.type !== "dot" || !unit.alive) return;
      var dmg = Math.max(1, Math.round(unit.maxHp * (b.value || 0.08)));
      unit.hp = Math.max(0, unit.hp - dmg);
      notes.push({ damage: dmg, kind: b.dotType });
      if (unit.hp <= 0) unit.alive = false;
    });
    return notes;
  }

  function addMorale(unit, amount) {
    unit.morale = clamp(unit.morale + amount, 0, unit.maxMorale);
  }

  /**
   * @param {Array} playerRaw
   * @param {Array} enemyRaw
   * @param {{ title?: string, playerFormation?: string, enemyFormation?: string }} opts
   */
  function runBattle(playerRaw, enemyRaw, opts) {
    opts = opts || {};
    var moraleCfg = cfg().morale;
    var combatCfg = cfg().combat;
    var maxRounds = combatCfg.maxRounds || 40;
    var pForm = opts.playerFormation || "crane_wing";
    var eForm = opts.enemyFormation || "square";

    var allies = playerRaw.map(function (g, i) {
      return normalizeUnit(g, "player", g.slot != null ? g.slot : i, pForm);
    });
    var foes = enemyRaw.map(function (g, i) {
      return normalizeUnit(g, "enemy", g.slot != null ? g.slot : i, eForm);
    });

    var battleLog = [];
    var uiEvents = [];

    uiEvents.push({
      type: "battle_start",
      title: opts.title || "Chiến đấu",
      allies: snapshot(allies),
      foes: snapshot(foes),
      playerFormation: pForm,
      enemyFormation: eForm,
    });

    var round = 0;
    while (round < maxRounds) {
      round++;
      if (!living(allies).length || !living(foes).length) break;
      uiEvents.push({ type: "round", round: round });

      var order = turnOrder(allies.concat(foes), combatCfg);

      for (var oi = 0; oi < order.length; oi++) {
        var actor = order[oi];
        if (!actor.alive) continue;
        if (!living(allies).length || !living(foes).length) break;

        processDots(actor);
        if (!actor.alive) {
          uiEvents.push({ type: "death", uid: actor.uid, name: actor.name });
          continue;
        }

        if (actor.stunned > 0) {
          uiEvents.push({ type: "skip", uid: actor.uid, reason: "stun" });
          tickStatus(actor);
          continue;
        }

        var myAllies = actor.side === "player" ? allies : foes;
        var myEnemies = actor.side === "player" ? foes : allies;

        var moraleBefore = actor.morale;
        var skill = NLDatabase ? NLDatabase.getSkill(actor.skillId) : null;
        var threshold = moraleCfg.skillThreshold != null ? moraleCfg.skillThreshold : 100;
        var useSkill = skill && actor.morale >= threshold && actor.silenced <= 0;

        var entry = {
          round: round,
          actor_id: actor.uid,
          actor_name: actor.name,
          actor_side: actor.side,
          actor_slot: actor.slot,
          action_type: useSkill ? "SKILL" : "NORMAL_ATTACK",
          skill_name: useSkill ? skill.name : null,
          skill_id: useSkill ? skill.id : null,
          morale_before: moraleBefore,
          morale_after: moraleBefore,
          targets: [],
        };

        uiEvents.push({ type: "turn", uid: actor.uid, name: actor.name, side: actor.side });

        if (useSkill) {
          var targets = resolveSkillTargets(actor, skill.pattern, myEnemies, myAllies);
          if (skill.pattern === "ally_all" || skill.pattern === "self") {
            targets = resolveSkillTargets(actor, skill.pattern, myEnemies, myAllies);
          }

          var skillHits = Math.max(1, skill.hits | 0 || 1);
          var skillFx = skill.fx || {};
          var skillFlash =
            (global.NLSkillDesign && global.NLSkillDesign.resolveFxKey
              ? global.NLSkillDesign.resolveFxKey(skillFx)
              : skillFx.flash) || "gold";
          uiEvents.push({
            type: "skill",
            uid: actor.uid,
            skillId: skill.id,
            name: skill.name,
            text: skillFx.text || skill.name,
            flash: skillFlash,
            motif: skillFx.motif || null,
            pattern: skill.pattern || "single",
            damageType: skill.damageType || "physical",
            hits: skillHits,
            quality: actor.quality || null,
            targets: targets.map(function (t) { return t.uid; }),
          });
          uiEvents.push({
            type: "float",
            uid: actor.uid,
            text: (skill.fx && skill.fx.text) || skill.name,
            kind: "skill",
          });

          var power = skill.power != null ? skill.power : 1;
          // Power theo phẩm — endgame wiki % vẫn clamp nhưng cam/đỏ/vàng mạnh hơn rõ
          var qBoost =
            actor.quality === "gold"
              ? 1.18
              : actor.quality === "red"
                ? 1.14
                : actor.quality === "orange"
                  ? 1.1
                  : actor.quality === "purple"
                    ? 1.06
                    : 1;
          power *= qBoost;
          var secondary =
            power > 0 && skill.pattern !== "ally_all" && skill.pattern !== "self"
              ? resolveSecondaryTargets(actor, skill, targets, myEnemies)
              : [];
          if (secondary.length) {
            // Gộp uid phụ vào skill event để VFX cũng chiếu
            var allFxTargets = targets.concat(secondary);
            // patch last skill ui event targets
            for (var ui = uiEvents.length - 1; ui >= 0; ui--) {
              if (uiEvents[ui].type === "skill" && uiEvents[ui].uid === actor.uid) {
                uiEvents[ui].targets = allFxTargets.map(function (t) {
                  return t.uid;
                });
                break;
              }
            }
          }
          if (power > 0 && skill.pattern !== "ally_all" && skill.pattern !== "self") {
            for (var hi = 0; hi < skillHits; hi++) {
              if (hi > 0) {
                uiEvents.push({
                  type: "skill_wave",
                  uid: actor.uid,
                  wave: hi + 1,
                  flash: skillFlash,
                  motif: skillFx.motif || null,
                  pattern: skill.pattern || "single",
                  quality: actor.quality || null,
                  targets: targets.concat(secondary).map(function (t) { return t.uid; }),
                });
              }
              targets.forEach(function (t) {
                if (!t.alive) return;
                var hit = calcHit(actor, t, skill.damageType || "physical", power, {
                  critBonus: skill.critBonus || 0,
                });
                pushTargetResult(entry, actor, t, hit, uiEvents, moraleCfg);
              });
              // Đòn phụ (hàng sau/trước) — ~65% power, chỉ nhịp đầu
              if (hi === 0) {
                secondary.forEach(function (t) {
                  if (!t.alive) return;
                  var hitSec = calcHit(actor, t, skill.damageType || "physical", power * 0.65, {
                    critBonus: (skill.critBonus || 0) * 0.5,
                  });
                  pushTargetResult(entry, actor, t, hitSec, uiEvents, moraleCfg);
                });
              }
            }
          }

          // heal / buff skills
          if (skill.pattern === "ally_all" || skill.pattern === "self") {
            applyEffects(actor, targets, skill.effects, uiEvents);
            targets.forEach(function (t) {
              entry.targets.push({
                target_id: t.uid,
                target_name: t.name,
                damage_dealt: 0,
                is_crit: false,
                is_miss: false,
                target_hp_left: t.hp,
                is_defeated: !t.alive,
                support: true,
              });
              uiEvents.push({ type: "hp", uid: t.uid, hp: t.hp, maxHp: t.maxHp });
            });
          } else if (skill.effects) {
            // Debuff địch trước; morale_boost self áp sau reset sĩ khí
            applyEffects(
              actor,
              targets,
              skill.effects.filter(function (e) {
                return !(e.type === "morale_boost" && e.target === "self");
              }),
              uiEvents
            );
          }

          actor.morale = moraleCfg.resetAfterSkill != null ? moraleCfg.resetAfterSkill : 0;
          if (skill.effects) {
            applyEffects(
              actor,
              targets,
              skill.effects.filter(function (e) {
                return e.type === "morale_boost" && e.target === "self";
              }),
              uiEvents
            );
          }
          entry.morale_after = actor.morale;
          addMorale(actor, 0);
          uiEvents.push({ type: "morale", uid: actor.uid, value: actor.morale, max: actor.maxMorale });
        } else {
          // NORMAL ATTACK
          var target = pickNormalTarget(actor, myEnemies);
          if (target) {
            var hit2 = calcHit(actor, target, "physical", combatCfg.skillNormalPower != null ? combatCfg.skillNormalPower : 1, {});
            pushTargetResult(entry, actor, target, hit2, uiEvents, moraleCfg);
          }
          addMorale(actor, moraleCfg.gainOnAttack != null ? moraleCfg.gainOnAttack : 25);
          entry.morale_after = actor.morale;
          uiEvents.push({ type: "morale", uid: actor.uid, value: actor.morale, max: actor.maxMorale });
        }

        battleLog.push(entry);
        tickStatus(actor);
        pushStatuses(uiEvents, actor);
      }
    }

    var win = living(foes).length === 0 && living(allies).length > 0;
    uiEvents.push({ type: "battle_end", win: win, rounds: round });

    return {
      win: win,
      rounds: round,
      battleLog: battleLog,
      events: uiEvents,
      allies: allies,
      foes: foes,
      playerFormation: pForm,
      enemyFormation: eForm,
    };
  }

  function pushTargetResult(entry, actor, target, hit, uiEvents, moraleCfg) {
    if (hit.missed) {
      entry.targets.push({
        target_id: target.uid,
        target_name: target.name,
        damage_dealt: 0,
        is_crit: false,
        is_miss: true,
        target_hp_left: target.hp,
        is_defeated: false,
        counter_mul: hit.counter,
      });
      uiEvents.push({ type: "float", uid: target.uid, text: "MISS", kind: "miss" });
      uiEvents.push({
        type: "attack",
        from: actor.uid,
        to: target.uid,
        damage: 0,
        missed: true,
        crit: false,
      });
      return;
    }

    target.hp = Math.max(0, target.hp - hit.damage);
    if (target.hp <= 0) target.alive = false;

    // Hấp huyết / dục huyết từ wiki_buff
    if (hit.lifesteal && actor && actor.alive && hit.damage > 0) {
      var healed = Math.max(1, Math.round(hit.damage * hit.lifesteal));
      actor.hp = Math.min(actor.maxHp, actor.hp + healed);
      uiEvents.push({
        type: "float",
        uid: actor.uid,
        text: "+" + healed,
        kind: "heal",
      });
      uiEvents.push({ type: "hp", uid: actor.uid, hp: actor.hp, maxHp: actor.maxHp });
    }

    // Bị đánh → + sĩ khí
    addMorale(target, moraleCfg.gainOnHit != null ? moraleCfg.gainOnHit : 15);

    entry.targets.push({
      target_id: target.uid,
      target_name: target.name,
      damage_dealt: hit.damage,
      is_crit: !!hit.crit,
      is_miss: false,
      target_hp_left: target.hp,
      is_defeated: !target.alive,
      counter_mul: hit.counter,
    });

    uiEvents.push({
      type: "attack",
      from: actor.uid,
      to: target.uid,
      damage: hit.damage,
      missed: false,
      crit: hit.crit,
    });
    uiEvents.push({
      type: "float",
      uid: target.uid,
      text: (hit.crit ? "CRIT " : "") + hit.damage,
      kind: hit.crit ? "crit" : "dmg",
    });
    uiEvents.push({ type: "hp", uid: target.uid, hp: target.hp, maxHp: target.maxHp });
    uiEvents.push({ type: "morale", uid: target.uid, value: target.morale, max: target.maxMorale });
    if (!target.alive) {
      uiEvents.push({ type: "death", uid: target.uid, name: target.name });
    }
  }

  function snapshot(units) {
    return units.map(function (u) {
      return {
        uid: u.uid,
        generalId: u.generalId,
        name: u.name,
        side: u.side,
        slot: u.slot,
        troop: u.troop,
        troopPrimary: u.troopPrimary,
        troop2: u.troop2,
        horseId: u.horseId,
        troopTier: u.troopTier,
        troopTierName: u.troopTierName,
        quality: u.quality,
        level: u.level,
        tongLinh: u.tongLinh,
        vuLuc: u.vuLuc,
        triLuc: u.triLuc,
        hp: u.hp,
        maxHp: u.maxHp,
        morale: u.morale,
        maxMorale: u.maxMorale,
        skillId: u.skillId,
        alive: u.alive,
      };
    });
  }

  function enemiesFromStage(stage) {
    if (!NLDatabase) return [];
    return NLDatabase.buildStageEnemies(stage);
  }

  // Patch troopMultiplier trên NLDatabase cho đồng bộ
  function installDbPatch() {
    if (!NLDatabase) return;
    NLDatabase.troopMultiplier = counterMultiplier;
  }
  installDbPatch();

  global.NLCombat = {
    runBattle: runBattle,
    normalizeUnit: normalizeUnit,
    enemiesFromStage: enemiesFromStage,
    counterMultiplier: counterMultiplier,
    pickNormalTarget: pickNormalTarget,
    VERSION: 3,
  };
})(window);
