/* global window */
(function (global) {
  const FACTIONS = {
    wei: { id: "wei", name: "Ngụy", bonus: { silver: 1.15, food: 1, gold: 1 } },
    shu: { id: "shu", name: "Thục", bonus: { silver: 1, food: 1.15, gold: 1 } },
    wu: { id: "wu", name: "Ngô", bonus: { silver: 1, food: 1, gold: 1.15 } },
  };

  const TROOPS = {
    infantry: { id: "infantry", name: "Bộ binh", beats: "cavalry" },
    cavalry: { id: "cavalry", name: "Kỵ binh", beats: "archer" },
    archer: { id: "archer", name: "Cung thủ", beats: "infantry" },
  };

  const BUILDINGS = [
    {
      id: "hall",
      name: "Chính điện",
      desc: "Nâng cấp mở khóa giới hạn công trình khác.",
      baseCost: { food: 80, silver: 120 },
      effect: (lv) => `Giới hạn cấp công trình: ${lv + 2}`,
    },
    {
      id: "farm",
      name: "Nông trường",
      desc: "Sản xuất lương thực mỗi giờ.",
      baseCost: { food: 40, silver: 60 },
      effect: (lv) => `+${20 + lv * 18} lương/giờ`,
    },
    {
      id: "mine",
      name: "Mỏ bạc",
      desc: "Sản xuất bạc mỗi giờ.",
      baseCost: { food: 50, silver: 40 },
      effect: (lv) => `+${15 + lv * 14} bạc/giờ`,
    },
    {
      id: "barracks",
      name: "Doanh trại",
      desc: "Tăng sức mạnh binh lực khi chiến đấu.",
      baseCost: { food: 70, silver: 90 },
      effect: (lv) => `+${lv * 4}% sát thương đội`,
    },
    {
      id: "wall",
      name: "Thành tường",
      desc: "Giảm sát thương nhận khi phòng thủ.",
      baseCost: { food: 60, silver: 100 },
      effect: (lv) => `Giảm ${lv * 3}% sát thương nhận`,
    },
    {
      id: "academy",
      name: "Thái học",
      desc: "Giảm chi phí cường hóa tướng.",
      baseCost: { food: 90, silver: 110 },
      effect: (lv) => `Giảm ${Math.min(40, lv * 4)}% phí cường hóa`,
    },
  ];

  const GENERAL_POOL = [
    { key: "zhangfei", name: "Trương Phi", troop: "infantry", atk: 88, def: 72, hp: 110, skill: "Nộ Hống", skillPow: 1.25 },
    { key: "guanyu", name: "Quan Vũ", troop: "cavalry", atk: 92, def: 78, hp: 105, skill: "Thanh Long", skillPow: 1.3 },
    { key: "zhaoyun", name: "Triệu Vân", troop: "cavalry", atk: 90, def: 80, hp: 100, skill: "Long Đảm", skillPow: 1.28 },
    { key: "zhugeliang", name: "Gia Cát Lượng", troop: "archer", atk: 70, def: 85, hp: 90, skill: "Không Thành", skillPow: 1.35 },
    { key: "simayi", name: "Tư Mã Ý", troop: "archer", atk: 78, def: 88, hp: 95, skill: "Ẩn Mưu", skillPow: 1.32 },
    { key: "caocao", name: "Tào Tháo", troop: "cavalry", atk: 85, def: 82, hp: 108, skill: "Gian Hùng", skillPow: 1.3 },
    { key: "xuchu", name: "Hứa Chử", troop: "infantry", atk: 95, def: 70, hp: 120, skill: "Hổ Si", skillPow: 1.22 },
    { key: "dianwei", name: "Điển Vi", troop: "infantry", atk: 93, def: 75, hp: 115, skill: "Cổ Chiến", skillPow: 1.24 },
    { key: "zhouyu", name: "Chu Du", troop: "archer", atk: 82, def: 76, hp: 92, skill: "Hỏa Công", skillPow: 1.33 },
    { key: "luxun", name: "Lục Tốn", troop: "archer", atk: 80, def: 84, hp: 94, skill: "Lửa Lục", skillPow: 1.3 },
    { key: "sunquan", name: "Tôn Quyền", troop: "infantry", atk: 76, def: 86, hp: 100, skill: "Đông Ngô", skillPow: 1.26 },
    { key: "huangzhong", name: "Hoàng Trung", troop: "archer", atk: 91, def: 68, hp: 88, skill: "Bách Bộ", skillPow: 1.34 },
    { key: "machao", name: "Mã Siêu", troop: "cavalry", atk: 94, def: 74, hp: 98, skill: "Tây Lương", skillPow: 1.29 },
    { key: "weiyan", name: "Nguỵ Diên", troop: "infantry", atk: 86, def: 70, hp: 102, skill: "Phản Cốt", skillPow: 1.2 },
    { key: "pangtong", name: "Bàng Thống", troop: "archer", atk: 74, def: 80, hp: 86, skill: "Phụng Sồ", skillPow: 1.31 },
    { key: "jiaxu", name: "Giả Hủ", troop: "archer", atk: 72, def: 90, hp: 88, skill: "Độc Mưu", skillPow: 1.36 },
  ];

  const STARTERS = {
    wei: ["caocao", "xuchu", "simayi"],
    shu: ["guanyu", "zhangfei", "zhugeliang"],
    wu: ["zhouyu", "sunquan", "luxun"],
  };

  const TERRITORIES = [
    { id: "luoyang", name: "Lạc Dương", power: 1.0 },
    { id: "changan", name: "Trường An", power: 1.1 },
    { id: "xuchang", name: "Hứa Xương", power: 1.15 },
    { id: "ye", name: "Nghiệp Thành", power: 1.2 },
    { id: "chengdu", name: "Thành Đô", power: 1.25 },
    { id: "hanzhong", name: "Hán Trung", power: 1.3 },
    { id: "jingzhou", name: "Kinh Châu", power: 1.35 },
    { id: "xiangyang", name: "Tương Dương", power: 1.4 },
    { id: "jianye", name: "Kiến Nghiệp", power: 1.45 },
    { id: "chaisang", name: "Sài Tang", power: 1.5 },
    { id: "hefei", name: "Hợp Phì", power: 1.55 },
    { id: "wancheng", name: "Uyển Thành", power: 1.6 },
  ];

  const AI_NAMES = [
    "Viên Thiệu", "Lữ Bố", "Đổng Trác", "Công Tôn Toản", "Lưu Biểu",
    "Trương Lỗ", "Hàn Toại", "Mã Đằng", "Viên Thuật", "Khổng Dung", "Đào Khiêm",
  ];

  const SAVE_KEY = "ngoa-long-offline-v1";
  const MAX_TOWER = 40;
  const MAX_ARENA_DAY = 3;

  function buildingCost(b, level) {
    const mul = Math.pow(1.55, level);
    return {
      food: Math.floor(b.baseCost.food * mul),
      silver: Math.floor(b.baseCost.silver * mul),
    };
  }

  function createGeneralFromKey(key, extras) {
    extras = extras || {};
    const base = GENERAL_POOL.find((g) => g.key === key);
    if (!base) throw new Error("Unknown general " + key);
    return {
      id: extras.id || key + "_" + Math.random().toString(36).slice(2, 8),
      key: base.key,
      name: base.name,
      troop: base.troop,
      atk: base.atk,
      def: base.def,
      hp: base.hp,
      maxHp: base.hp,
      skill: base.skill,
      skillPow: base.skillPow,
      level: extras.level || 1,
      enhance: extras.enhance || 0,
      soul: !!extras.soul,
    };
  }

  function scaleGeneral(g, powerMul) {
    const m = powerMul || 1;
    return {
      ...g,
      id: g.id || "ai_" + g.key + "_" + Math.random().toString(36).slice(2, 6),
      atk: Math.round(g.atk * m),
      def: Math.round(g.def * m),
      hp: Math.round(g.hp * m),
      maxHp: Math.round((g.maxHp || g.hp) * m),
    };
  }

  global.NLData = {
    FACTIONS, TROOPS, BUILDINGS, GENERAL_POOL, STARTERS, TERRITORIES, AI_NAMES,
    SAVE_KEY, MAX_TOWER, MAX_ARENA_DAY,
    buildingCost, createGeneralFromKey, scaleGeneral,
  };
})(window);
