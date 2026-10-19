/* global window, NLData */
(function (global) {
  const TROOPS = NLData.TROOPS;

  function troopMul(attackerTroop, defenderTroop) {
    const a = TROOPS[attackerTroop];
    if (!a) return 1;
    if (a.beats === defenderTroop) return 1.25;
    const d = TROOPS[defenderTroop];
    if (d && d.beats === attackerTroop) return 0.8;
    return 1;
  }

  function effective(g, sideBonus) {
    sideBonus = sideBonus || {};
    const enh = 1 + (g.enhance || 0) * 0.06;
    const lv = 1 + ((g.level || 1) - 1) * 0.08;
    const soul = g.soul ? 1.15 : 1;
    return {
      atk: g.atk * enh * lv * soul * (sideBonus.dmg || 1),
      def: g.def * enh * lv * soul * (sideBonus.def || 1),
      hp: g.hp,
      maxHp: g.maxHp || g.hp,
    };
  }

  function resolveBattle(playerTeam, enemyTeam, opts) {
    opts = opts || {};
    const log = [];
    const pBonus = opts.playerBonus || {};
    const eBonus = opts.enemyBonus || {};

    const allies = playerTeam.map(function (g) {
      return Object.assign({}, g, effective(g, pBonus), { side: "you" });
    });
    const foes = enemyTeam.map(function (g) {
      return Object.assign({}, g, effective(g, eBonus), { side: "foe" });
    });

    log.push("Xuất trận: " + allies.map(function (g) { return g.name; }).join(", "));
    log.push("Địch: " + foes.map(function (g) { return g.name; }).join(", "));

    var round = 0;
    var maxRounds = 40;

    while (round < maxRounds) {
      round++;
      var livingA = allies.filter(function (g) { return g.hp > 0; });
      var livingF = foes.filter(function (g) { return g.hp > 0; });
      if (!livingA.length || !livingF.length) break;

      var order = livingA.concat(livingF).sort(function (a, b) {
        return b.atk * 0.6 + Math.random() * 20 - (a.atk * 0.6 + Math.random() * 20);
      });

      for (var i = 0; i < order.length; i++) {
        var atk = order[i];
        if (atk.hp <= 0) continue;
        var targets = (atk.side === "you" ? foes : allies).filter(function (g) { return g.hp > 0; });
        if (!targets.length) break;
        var def = targets[Math.floor(Math.random() * targets.length)];
        var mul = troopMul(atk.troop, def.troop);
        var skillProc = Math.random() < 0.22;
        var skillMul = skillProc ? (atk.skillPow || 1.2) : 1;
        var raw = atk.atk * mul * skillMul * (0.85 + Math.random() * 0.3);
        var mitigated = Math.max(8, raw - def.def * 0.45);
        def.hp = Math.max(0, def.hp - mitigated);

        var skillTxt = skillProc ? " · " + atk.skill + "!" : "";
        var counter = mul > 1 ? " (khắc)" : mul < 1 ? " (bị khắc)" : "";
        log.push(
          "R" + round + ": " + atk.name + " → " + def.name + counter + skillTxt +
          " −" + Math.round(mitigated) + " HP" + (def.hp <= 0 ? " · trận vong" : "")
        );
      }
    }

    var win = foes.every(function (g) { return g.hp <= 0; }) && allies.some(function (g) { return g.hp > 0; });
    if (win) log.push("WIN|Chiến thắng!");
    else if (allies.every(function (g) { return g.hp <= 0; })) log.push("LOSE|Toàn quân thất bại.");
    else log.push("LOSE|Hết hiệp — thất bại.");

    return { win: win, log: log, rounds: round };
  }

  function teamPower(team) {
    return team.reduce(function (s, g) {
      var enh = 1 + (g.enhance || 0) * 0.06;
      var lv = 1 + ((g.level || 1) - 1) * 0.08;
      var soul = g.soul ? 1.15 : 1;
      return s + (g.atk + g.def + g.hp * 0.5) * enh * lv * soul;
    }, 0);
  }

  global.NLBattle = { resolveBattle: resolveBattle, teamPower: teamPower };
})(window);
