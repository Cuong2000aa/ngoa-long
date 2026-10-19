/* global window */
/**
 * Combat UI — lưới 3+2, thanh sĩ khí, chữ nổi, playback events
 */
(function (global) {
  var SPEED_MS = 420;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function qualityClass(q) {
    return "q-" + (q || "white");
  }

  function troopLabel(t) {
    var map = { cavalry: "Kỵ", infantry: "Bộ", spear: "Thương", archer: "Cung", strategist: "Mưu" };
    return map[t] || t;
  }

  function troopChar(t) {
    var map = { cavalry: "Kỵ", infantry: "Bộ", spear: "Thương", archer: "Cung", strategist: "Mưu" };
    return map[t] || "Tướng";
  }

  function troopSprite(t, tier) {
    // Art wiki theo BẬC — cấp 1 ≠ Hổ Báo; Hổ Báo Kỵ = cavalry t5+
    var n = tier == null ? 1 : Math.max(1, Math.min(6, tier | 0));
    var key = t || "infantry";
    return "assets/units/battle/wiki-" + key + "-t" + n + ".png";
  }

  function shortFlag(name) {
    if (!name) return "Binh";
    return String(name).replace(/\s+/g, "").slice(0, 2);
  }

  function formationDb() {
    try {
      var raw =
        (global.NLDatabase && global.NLDatabase.raw && global.NLDatabase.raw()) ||
        global.NL_DB ||
        null;
      return (raw && raw.formations && raw.formations.list) || null;
    } catch (e) {
      return null;
    }
  }

  function formationDisplayName(fid) {
    if (!fid) return "";
    var list = formationDb();
    var form = list && list[fid];
    return (form && form.name) || "";
  }

  /** Tip khắc chế trận pháp (wiki Khoa kỹ) lúc mở trận */
  function formationCounterTip(playerFid, enemyFid) {
    var list = formationDb();
    if (!list) return "";
    var mine = list[playerFid];
    var foe = list[enemyFid];
    if (!mine || !foe) return "";
    var mineName = mine.name || playerFid;
    var foeName = foe.name || enemyFid;
    if (mine.counters && mine.counters.indexOf(enemyFid) >= 0) {
      return "⚔ Trận <b>" + mineName + "</b> khắc <b>" + foeName + "</b> — lợi thế!";
    }
    if (foe.counters && foe.counters.indexOf(playerFid) >= 0) {
      return "⚠ Địch <b>" + foeName + "</b> khắc trận <b>" + mineName + "</b> của ta.";
    }
    return (
      "Trận ta: <b>" +
      mineName +
      "</b>" +
      (mine.focusLabel ? " (" + mine.focusLabel + ")" : "") +
      " · Địch: <b>" +
      foeName +
      "</b>" +
      (foe.focusLabel ? " (" + foe.focusLabel + ")" : "")
    );
  }

  function CombatView() {
    this.root = document.getElementById("combat-overlay");
    this.titleEl = document.getElementById("combat-title");
    this.enemyGrid = document.getElementById("combat-enemy");
    this.playerGrid = document.getElementById("combat-player");
    this.fieldEl = document.querySelector("#combat-overlay .combat-field");
    this.stageEl = document.querySelector("#combat-overlay .combat-stage");
    this.logEl = document.getElementById("combat-log");
    this.fxLayer = document.getElementById("combat-fx");
    this.btnClose = document.getElementById("btn-combat-close");
    this.btnSkip = document.getElementById("btn-combat-skip");
    this.resultEl = document.getElementById("combat-result");
    this.roundBadge = document.getElementById("combat-round-badge");
    this.cards = {};
    this._playing = false;
    this._battle3d = null;
    this._battleReady = null;

    var logToggle = document.getElementById("btn-combat-log-toggle");
    if (logToggle && this.logEl) {
      logToggle.onclick = function () {
        this.logEl.hidden = !this.logEl.hidden;
      }.bind(this);
    }
  }

  CombatView.prototype.open = function (meta) {
    this._meta = meta || null;
    if (!this.root) return;
    this.root.hidden = false;
    // Pause Thành Chính — tránh 2 WebGL cùng render (nguyên nhân FPS thấp)
    if (global.NLCity && global.NLCity.city && global.NLCity.city.pause) {
      global.NLCity.city.pause();
    }
    if (this.resultEl) this.resultEl.hidden = true;
    if (this.btnClose) this.btnClose.hidden = true;
    if (this.logEl) {
      this.logEl.innerHTML = "";
      this.logEl.hidden = true;
    }
    if (this.fxLayer) this.fxLayer.innerHTML = "";
    if (this.roundBadge) this.roundBadge.textContent = "Hiệp 1";
    this.ensureBattle3d();
  };

  CombatView.prototype.close = function () {
    this.root.hidden = true;
    this._playing = false;
    if (this.root) this.root.classList.remove("mode-3d");
    if (this._battle3d) {
      this._battle3d.dispose();
      this._battle3d = null;
      this._battleReady = null;
    }
    if (global.NLCity && global.NLCity.city && global.NLCity.city.resume) {
      global.NLCity.city.resume();
    }
  };

  CombatView.prototype.buildCard = function (u) {
    var isEnemy = u.side === "enemy";
    var troop = u.troop || "infantry";
    var card = el(
      "div",
      "c-card plate-only " +
        qualityClass(u.quality) +
        (isEnemy ? " enemy" : " ally") +
        " troop-" +
        troop
    );
    card.dataset.uid = u.uid;
    card.dataset.side = isEnemy ? "enemy" : "ally";
    var mPct = u.maxMorale ? Math.round((u.morale / u.maxMorale) * 100) : 50;
    var hpPct = u.maxHp ? Math.round((u.hp / u.maxHp) * 100) : 100;
    var tier = u.troopTier != null ? u.troopTier : 1;
    card.innerHTML =
      '<div class="c-roster">' +
      '<div class="c-face"><img src="' +
      troopSprite(troop, tier) +
      '" alt="" draggable="false" />' +
      '<span class="c-troop-badge">' +
      troopChar(troop) +
      "</span></div>" +
      '<div class="c-plate">' +
      '<div class="c-name">' +
      u.name +
      "</div>" +
      '<div class="c-meta">' +
      (u.troopTierName || troopLabel(troop)) +
      " · Lv." +
      (u.level || 1) +
      "</div>" +
      '<div class="c-hp" title="Sinh lực"><i style="width:' +
      hpPct +
      '%"></i></div>' +
      '<div class="c-morale" title="Sĩ khí"><i style="width:' +
      mPct +
      '%"></i></div>' +
      '<div class="c-status-icons" aria-hidden="true"></div>' +
      "</div></div>";
    if (mPct >= 100) card.classList.add("ready");
    return card;
  };

  /** Icon hiệu ứng wiki cạnh thanh máu (góc panel) */
  CombatView.prototype.paintStatusIcons = function (uid, statuses) {
    var card = this.cards[uid];
    if (!card) return;
    var row = card.querySelector(".c-status-icons");
    if (!row) return;
    var list = (statuses || []).slice(0, 5);
    row.innerHTML = list
      .map(function (s) {
        var tip = s.label || s.id || "";
        var cls = "c-st c-st-" + (s.kind || "buff");
        if (s.icon) {
          return (
            '<img class="' +
            cls +
            '" src="' +
            s.icon +
            '" alt="' +
            tip +
            '" title="' +
            tip +
            '" />'
          );
        }
        return '<span class="' + cls + ' c-st-text" title="' + tip + '">' + tip.slice(0, 2) + "</span>";
      })
      .join("");
  };

  CombatView.prototype.ensureBattle3d = function () {
    var self = this;
    if (this._battle3d) return Promise.resolve(this._battle3d);
    var BR = global.NLCity && global.NLCity.BattleRenderer;
    // Mount lên combat-stage = full màn (canvas dưới HUD)
    var mountHost = this.stageEl || this.fieldEl;
    if (!BR || !mountHost) return Promise.resolve(null);
    var battle = new BR();
    this._battleReady = battle.mount(mountHost).then(function () {
      self._battle3d = battle;
      if (self.root) self.root.classList.add("mode-3d");
      // Resize lại sau khi layout mode-3d áp dụng
      requestAnimationFrame(function () {
        try {
          window.dispatchEvent(new Event("resize"));
        } catch (e) { /* ignore */ }
      });
      return battle;
    }).catch(function (err) {
      console.warn("[combat] BattleRenderer lỗi, giữ HUD 2D", err);
      return null;
    });
    return this._battleReady;
  };

  CombatView.prototype.renderGrids = function (allies, foes) {
    var self = this;
    this.cards = {};
    this.enemyGrid.innerHTML = "";
    this.playerGrid.innerHTML = "";

    function place(container, units, isEnemy) {
      var slots = [null, null, null, null, null];
      units.forEach(function (u) {
        var s = clampSlot(u.slot);
        slots[s] = u;
      });
      // mode-3d: danh sách dọc gọn (HUD dock) — bỏ ô trống
      if (self.root && self.root.classList.contains("mode-3d")) {
        var col = el("div", "c-row hud-dock");
        var order = isEnemy ? [3, 4, 0, 1, 2] : [0, 1, 2, 3, 4];
        order.forEach(function (i) {
          if (!slots[i]) return;
          var cell = el("div", "c-slot");
          var card = self.buildCard(slots[i]);
          self.cards[slots[i].uid] = card;
          cell.appendChild(card);
          col.appendChild(cell);
        });
        container.appendChild(col);
        return;
      }
      // Lưới 3 cột: hàng sau ô trống | Sau-Giữa(3) | Sau-Dưới(4) — thẳng cột với trước
      var front = el("div", "c-row front");
      var back = el("div", "c-row back");
      [0, 1, 2].forEach(function (i) {
        var cell = el("div", "c-slot");
        if (slots[i]) {
          var card = self.buildCard(slots[i]);
          self.cards[slots[i].uid] = card;
          cell.appendChild(card);
        } else cell.classList.add("empty");
        front.appendChild(cell);
      });
      [null, 3, 4].forEach(function (i) {
        var cell = el("div", "c-slot");
        if (i == null) {
          cell.classList.add("empty", "spacer");
        } else if (slots[i]) {
          var cardB = self.buildCard(slots[i]);
          self.cards[slots[i].uid] = cardB;
          cell.appendChild(cardB);
        } else cell.classList.add("empty");
        back.appendChild(cell);
      });
      if (isEnemy) {
        container.appendChild(back);
        container.appendChild(front);
      } else {
        container.appendChild(front);
        container.appendChild(back);
      }
    }

    place(this.enemyGrid, foes, true);
    place(this.playerGrid, allies, false);
  };

  function clampSlot(s) {
    s = s == null ? 0 : s;
    return Math.max(0, Math.min(4, s));
  }

  CombatView.prototype.updateHp = function (uid, hp, maxHp) {
    var card = this.cards[uid];
    if (this._battle3d) this._battle3d.setHp(uid, hp, maxHp);
    if (!card) return;
    var pct = Math.max(0, (hp / maxHp) * 100);
    var bar = card.querySelector(".c-hp > i");
    if (bar) bar.style.width = pct + "%";
    if (hp <= 0) card.classList.add("dead");
  };

  CombatView.prototype.updateMorale = function (uid, value, max) {
    var card = this.cards[uid];
    if (!card) return;
    var pct = Math.max(0, (value / max) * 100);
    var bar = card.querySelector(".c-morale > i");
    if (bar) bar.style.width = pct + "%";
    if (pct >= 100) card.classList.add("ready");
    else card.classList.remove("ready");
  };

  CombatView.prototype.floatText = function (uid, text, kind) {
    var card = this.cards[uid];
    var layer = this.fxLayer;
    var node = el("div", "c-float " + (kind || "dmg"), text);
    var pos = this._battle3d && this._battle3d.screenPos(uid);
    if (pos) {
      // screenPos tương đối host mount (combat-stage khi mode-3d)
      var host = this.stageEl || this.fieldEl;
      var field = host.getBoundingClientRect();
      var pr = this.root.getBoundingClientRect();
      node.style.left = field.left - pr.left + pos.x + "px";
      node.style.top = field.top - pr.top + pos.y - 12 + "px";
    } else if (card) {
      var r = card.getBoundingClientRect();
      var pr2 = this.root.getBoundingClientRect();
      node.style.left = r.left - pr2.left + r.width / 2 + "px";
      node.style.top = r.top - pr2.top + r.height * 0.2 + "px";
    } else {
      node.style.left = "50%";
      node.style.top = "40%";
    }
    layer.appendChild(node);
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 900);
  };

  CombatView.prototype.flashCard = function (uid, cls) {
    var card = this.cards[uid];
    if (!card) return;
    card.classList.add(cls || "hit");
    setTimeout(function () {
      card.classList.remove(cls || "hit");
    }, 280);
  };

  CombatView.prototype.log = function (msg) {
    if (!this.logEl) return;
    var line = el("div", "c-log-line", msg);
    this.logEl.appendChild(line);
    this.logEl.scrollTop = this.logEl.scrollHeight;
  };

  CombatView.prototype.play = function (result, onDone, meta) {
    var self = this;
    this._playing = true;
    this._skip = false;
    this._onDone = onDone;
    this._result = result;
    if (meta) this._meta = meta;

    // Bật mode-3d sớm để HUD dock layout đúng trước khi render thẻ
    if (global.NLCity && global.NLCity.BattleRenderer && this.root) {
      this.root.classList.add("mode-3d");
    }

    var start = result.events[0];
    if (start && start.type === "battle_start") {
      this.titleEl.textContent = start.title || "Chiến đấu";
      this.renderGrids(start.allies, start.foes);
      var allyName = document.getElementById("combat-ally-name");
      var foeName = document.getElementById("combat-enemy-name");
      if (allyName) {
        var a0 = start.allies && start.allies[0];
        allyName.textContent = (a0 && a0.name) || "Phe ta";
      }
      var allySub = document.getElementById("combat-ally-sub");
      if (allySub) {
        var aFormName = formationDisplayName(start.playerFormation);
        var a0b = start.allies && start.allies[0];
        allySub.textContent = aFormName
          ? "Trận " + aFormName
          : a0b && a0b.level
          ? "Lv." + a0b.level + " · Đạo quân"
          : "Đạo quân";
      }
      if (foeName) {
        foeName.textContent =
          (start.foes && start.foes[0] && start.foes[0].name) || "Địch";
      }
      var foeSub = document.getElementById("combat-enemy-sub");
      if (foeSub) {
        var eFormName = formationDisplayName(start.enemyFormation);
        foeSub.textContent = eFormName
          ? "Trận " + eFormName + (start.title ? " · " + start.title : "")
          : start.title || "Phó bản";
      }
      // Tip khắc chế trận pháp (wiki Khoa kỹ)
      var tip = formationCounterTip(start.playerFormation, start.enemyFormation);
      if (tip) {
        this.log(tip);
        if (this.fxLayer) {
          var banner = el("div", "c-form-tip", tip.replace(/<[^>]+>/g, ""));
          this.fxLayer.appendChild(banner);
          setTimeout(function () {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
          }, 2200);
        }
      }
    }

    var idx = 0;
    var events = result.events;

    function finish() {
      self._playing = false;
      var rounds = result.rounds || 1;
      var i;
      for (i = events.length - 1; i >= 0; i--) {
        if (events[i].type === "battle_end" && events[i].rounds) {
          rounds = events[i].rounds;
          break;
        }
      }
      var meta = self._meta || {};
      var tipWin =
        meta.context === "campaign"
          ? "Bấm <b>Quà</b> — xem chiến báo & thưởng Phó Bản."
          : "Bấm <b>Quà</b> để nhận kết quả trận.";
      var tipLose = meta.loseTip || "Thử đổi trận pháp, huấn luyện tướng hoặc đeo trang bị.";
      var stageLine =
        meta.stageName && meta.context === "campaign"
          ? '<div class="c-result-stage">' + meta.stageName + "</div>"
          : "";
      self.resultEl.hidden = false;
      self.resultEl.innerHTML =
        '<div class="c-result-title">' +
        (result.win ? "CHIẾN THẮNG" : "THẤT BẠI") +
        "</div>" +
        stageLine +
        '<div class="c-result-sub">' +
        rounds +
        " hiệp</div>" +
        '<div class="c-result-tip">' +
        (result.win ? tipWin : tipLose) +
        "</div>";
      self.resultEl.className = "combat-result " + (result.win ? "win" : "lose");
      self.btnClose.hidden = false;
      self.btnClose.onclick = function () {
        self.close();
        if (onDone) onDone(result);
      };
    }

    function step() {
      if (!self._playing) return;
      if (self._skip) {
        while (idx < events.length) {
          var rem = events[idx++];
          if (rem.type === "hp") self.updateHp(rem.uid, rem.hp, rem.maxHp);
          else if (rem.type === "morale") self.updateMorale(rem.uid, rem.value, rem.max);
          else if (rem.type === "death") {
            self.log("<b>" + rem.name + "</b> trận vong.");
            if (self.cards[rem.uid]) self.cards[rem.uid].classList.add("dead");
            if (self._battle3d) self._battle3d.setDead(rem.uid);
          } else if (
            rem.type === "round" ||
            rem.type === "skill" ||
            rem.type === "attack" ||
            rem.type === "skip" ||
            rem.type === "battle_end"
          ) {
            self.applyEvent(rem);
          }
        }
        finish();
        return;
      }
      if (idx >= events.length) {
        finish();
        return;
      }
      var ev = events[idx++];
      self.applyEvent(ev);
      var delay = SPEED_MS;
      if (ev.type === "battle_start" || ev.type === "round") delay = 200;
      if (ev.type === "skill") {
        delay = 780;
        if (global.NLSkillDesign) {
          var fxKey =
            (global.NLSkillDesign.resolveFxKey &&
              global.NLSkillDesign.resolveFxKey(ev.flash, ev.motif)) ||
            ev.flash ||
            "gold";
          delay = Math.max(720, global.NLSkillDesign.totalMs(global.NLSkillDesign.resolve(fxKey)) + 80);
        } else if (ev.flash === "bagua" || ev.flash === "fire_rain" || ev.flash === "tiger") delay = 980;
        else if (ev.flash === "thunder") delay = 720;
      }
      if (ev.type === "float") delay = 80;
      if (ev.type === "hp" || ev.type === "morale") delay = 40;
      setTimeout(step, delay);
    }

    if (this.btnSkip) {
      this.btnSkip.onclick = function () {
        self._skip = true;
      };
    }

    function begin() {
      if (start && start.type === "battle_start" && self._battle3d) {
        var mapEl = document.getElementById("iso-town-map");
        var faction =
          (mapEl && mapEl.getAttribute("data-faction")) ||
          (start.allies && start.allies[0] && start.allies[0].faction) ||
          "shu";
        var allies3d = (start.allies || []).map(function (u) {
          return Object.assign({}, u, {
            hp: u.hp != null ? u.hp : u.maxHp || 1,
            maxHp: u.maxHp || u.hp || 1,
            troopTier: u.troopTier != null ? u.troopTier : 1,
          });
        });
        var foes3d = (start.foes || []).map(function (u) {
          return Object.assign({}, u, {
            hp: u.hp != null ? u.hp : u.maxHp || 1,
            maxHp: u.maxHp || u.hp || 1,
            troopTier: u.troopTier != null ? u.troopTier : 1,
          });
        });
        self._battle3d.spawn(allies3d, foes3d, faction, {
          allyFormation: start.playerFormation || "crane_wing",
          enemyFormation: start.enemyFormation || "square",
        });
      }
      step();
    }

    this.ensureBattle3d().then(begin);
  };

  CombatView.prototype.playSkillFx = function (ev) {
    var flash =
      (global.NLSkillDesign && global.NLSkillDesign.resolveFxKey
        ? global.NLSkillDesign.resolveFxKey(ev.flash, ev.motif)
        : ev.flash) || "gold";
    var layer = this.fxLayer || this.root;
    if (!layer) return;

    var targets = (ev.targets || [])
      .map(function (tid) {
        return this.cards[tid];
      }.bind(this))
      .filter(Boolean);

    // Trận 3D: aura đã chạy trên BattleRenderer — chỉ banner chữ, không sigil/veil giữa sân
    // (tránh vòng trắng “✚/☯” + lớp mờ đè máu/unit).
    if (this._battle3d) {
      if (this._skillPlay && this._skillPlay.cancel) this._skillPlay.cancel();
      var profile =
        global.NLSkillDesign && global.NLSkillDesign.resolve
          ? global.NLSkillDesign.resolve(flash)
          : { essence: "radiance", delivery: "buff", scale: "M", durations: { castMs: 200, emissionMs: 400 } };
      if (global.NLCombatVfx && global.NLCombatVfx.showBanner) {
        global.NLCombatVfx.showBanner(layer, ev.text || ev.name || "CHIẾN PHÁP", profile);
      } else {
        var b = el("div", "c-skill-banner skd-" + (profile.essence || "radiance"), ev.text || ev.name || "CHIẾN PHÁP");
        layer.appendChild(b);
        setTimeout(function () {
          if (b.parentNode) b.parentNode.removeChild(b);
        }, 900);
      }
      return;
    }

    // Timeline-driven skill VFX 2D (preview / fallback không 3D)
    if (global.NLCombatVfx && global.NLCombatVfx.playSkill) {
      if (this._skillPlay && this._skillPlay.cancel) this._skillPlay.cancel();
      this._skillPlay = global.NLCombatVfx.playSkill({
        layer: layer,
        root: this.root,
        sourceCard: this.cards[ev.uid],
        targetCards: targets,
        text: ev.text || ev.name || "CHIẾN PHÁP",
        flash: flash,
        motif: ev.motif || null,
      });
      return;
    }

    // Fallback tối giản
    var banner = el("div", "c-skill-banner fx-" + flash, ev.text || ev.name || "CHIẾN PHÁP");
    layer.appendChild(banner);
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 900);
  };

  CombatView.prototype.applyEvent = function (ev) {
    switch (ev.type) {
      case "round":
        if (this.roundBadge) this.roundBadge.textContent = "Hiệp " + ev.round;
        this.log("— Hiệp " + ev.round + " —");
        break;
      case "turn":
        this.flashCard(ev.uid, "act");
        break;
      case "skill":
        this.flashCard(ev.uid, "skill-cast");
        if (this._battle3d) {
          var skillTargets = (ev.targets || []).map(function (t) {
            return typeof t === "string" ? t : t && (t.uid || t.target_id || t);
          }).filter(Boolean);
          var skillFxKey =
            (global.NLSkillDesign && global.NLSkillDesign.resolveFxKey
              ? global.NLSkillDesign.resolveFxKey(ev.flash, ev.motif)
              : ev.flash) || "gold";
          this._battle3d.skillFlash(ev.uid, skillFxKey, skillTargets);
        }
        this.playSkillFx(ev);
        this.log(
          "<b>[CHIẾN PHÁP] " +
            (ev.text || ev.name) +
            "</b>" +
            (ev.hits > 1 ? " ×" + ev.hits : "") +
            (ev.quality ? " <span style='opacity:.7'>(" + ev.quality + ")</span>" : "")
        );
        break;
      case "skill_wave":
        if (this._battle3d && this._battle3d.skillFlash) {
          var waveTargets = (ev.targets || []).map(function (t) {
            return typeof t === "string" ? t : t && (t.uid || t.target_id || t);
          }).filter(Boolean);
          var waveFxKey =
            (global.NLSkillDesign && global.NLSkillDesign.resolveFxKey
              ? global.NLSkillDesign.resolveFxKey(ev.flash, ev.motif)
              : ev.flash) || "gold";
          // Wave 2+: chỉ impact — không cast aura lại (tránh beam×2 + aura chồng)
          this._battle3d.skillFlash(ev.uid, waveFxKey, waveTargets, { wave: true });
        }
        break;
      case "attack":
        this.flashCard(ev.from, "act");
        if (this._battle3d) this._battle3d.attack(ev.from, ev.to, !!ev.missed);
        if (global.NLCombatVfx && !this._battle3d) {
          var fromCard = this.cards[ev.from];
          var toCard = this.cards[ev.to];
          var fromEnemy = fromCard && fromCard.dataset.side === "enemy";
          global.NLCombatVfx.lunge(fromCard, !fromEnemy);
          if (!ev.missed) {
            global.NLCombatVfx.slash(this.fxLayer, toCard, this.root, fromEnemy);
            global.NLCombatVfx.impact(this.fxLayer, toCard, this.root, ev.crit ? "crit" : "hit");
            if (ev.crit) global.NLCombatVfx.screenShake(this.root);
          }
        } else if (ev.crit && global.NLCombatVfx) {
          global.NLCombatVfx.screenShake(this.root);
        }
        if (!ev.missed) this.flashCard(ev.to, "hit");
        if (ev.text) {
          this.log(ev.text + (ev.crit ? " <b style='color:#ff6b2d'>(Chí mạng!)</b>" : ""));
        } else if (ev.crit) {
          this.log("Chí mạng!");
        }
        break;
      case "float":
        this.floatText(ev.uid, ev.text, ev.kind);
        break;
      case "hp":
        this.updateHp(ev.uid, ev.hp, ev.maxHp);
        if (this._battle3d) this._battle3d.setHp(ev.uid, ev.hp, ev.maxHp);
        break;
      case "morale":
        this.updateMorale(ev.uid, ev.value, ev.max);
        if (this._battle3d && this._battle3d.setMorale) {
          this._battle3d.setMorale(ev.uid, ev.value, ev.max);
        }
        break;
      case "death":
        this.log(ev.name + " trận vong.");
        if (this.cards[ev.uid]) this.cards[ev.uid].classList.add("dead");
        if (this._battle3d) this._battle3d.setDead(ev.uid);
        break;
      case "status":
        if (this._battle3d && this._battle3d.setStatuses) {
          this._battle3d.setStatuses(ev.uid, ev.statuses || []);
        }
        this.paintStatusIcons(ev.uid, ev.statuses || []);
        if (ev.statuses && ev.statuses.length) {
          var names = ev.statuses
            .map(function (s) {
              return s.label || s.id;
            })
            .join("·");
          this.floatText(ev.uid, names, ev.statuses[0].kind === "buff" ? "heal" : "debuff");
        }
        break;
      case "skip":
        this.log("Bị hỗn loạn — bỏ lượt.");
        break;
      case "battle_end":
        this.log(
          ev.win
            ? "Chiến thắng sau " + (ev.rounds || 1) + " hiệp!"
            : "Thất bại sau " + (ev.rounds || 1) + " hiệp."
        );
        break;
      default:
        break;
    }
  };

  var view = null;

  function playBattle(result, onDone, meta) {
    if (!view) view = new CombatView();
    view.open(meta);
    view.play(result, onDone, meta);
  }

  function closeBattle() {
    if (view) view.close();
  }

  global.NLCombatUI = {
    playBattle: playBattle,
    close: closeBattle,
    getView: function () {
      return view;
    },
  };
})(window);
