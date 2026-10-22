/**
 * Cổng duy nhất: flash/motif/pattern → Fx3dStyle + HonPackId.
 * Đồng bộ motif classify: ice / spirit / firebird / thunder / bagua / pierce.
 */

export type Fx3dStyle =
  | "slash"
  | "breath"
  | "roar"
  | "rush"
  | "charge"
  | "beam"
  | "nova"
  | "tide"
  | "poison"
  | "whirl"
  | "shadow"
  | "bless"
  | "barrier"
  | "thunder"
  | "bagua"
  | "pierce"
  /** Băng — frost, không chung arcane/beam */
  | "ice";

export type HonPackId =
  | "hon_rong"
  | "hon_xa"
  | "hon_ho"
  | "hon_soi"
  | "hon_thuy"
  | "hon_loi"
  | "hon_phong"
  | "hon_bagua"
  | "hon_hon";

/**
 * Pack sét dọc (qi_*) dưới `assets/fx/skill/loi/`.
 * Dùng khi hồn đánh địch / chiêu lôi — màu theo skill.
 */
export type ThunderStrikeId =
  | "qi_crimson"
  | "qi_violet"
  | "qi_azure"
  | "qi_gold"
  | "qi_venom"
  | "qi_gale";

/** Flash burst/spark đi kèm màu sét. */
export function thunderStrikeFlash(strike: ThunderStrikeId): string {
  switch (strike) {
    case "qi_crimson":
      return "crimson_flame";
    case "qi_violet":
      return "violet_spirit";
    case "qi_azure":
      return "cyan";
    case "qi_gold":
      return "thunder";
    case "qi_venom":
      return "green_poison";
    case "qi_gale":
      return "whirlwind";
    default:
      return "thunder";
  }
}

/**
 * Map skillId → pack sét màu đúng theme.
 * Hồn fire/hồng → đỏ; thanh long → lam; hồn thuần → tím; độc/phong/vàng lôi → đúng hệ.
 */
export function resolveThunderStrikeId(skillId?: string | null): ThunderStrikeId {
  const id = String(skillId || "").toLowerCase();

  // Độc lôi
  if (/doc_loi/.test(id)) return "qi_venom";
  // Phong lôi
  if (/phong_loi/.test(id)) return "qi_gale";
  // Lôi lửa / hồng / xích
  if (
    /viem_loi|xich_loi|hong_viem|hong_lien|hong_hoang|xich_vu|bach_hong|hoa_long/.test(id)
  )
    return "qi_crimson";
  // Thanh Long Hồn / lam
  if (/thanh_long_hon/.test(id)) return "qi_azure";
  // Hồn tím cổ điển + tử điện / âm lôi
  if (
    /tran_hon|toa_hon|de_hon|truy_hon|thu_hon|doat_phach|tu_dien|am_loi/.test(id)
  )
    return "qi_violet";
  // Lôi điện mặc định (sam_set, thần lôi, bạo lôi…)
  if (
    /sam_set|than_loi|bao_loi|kinh_loi|thien_loi|loi_co|loi_oanh|loi_tien|lac_loi|cuu_thien|cuu_tieu|diet_the/.test(
      id
    ) ||
    /_loi$|^loi_/.test(id)
  )
    return "qi_gold";

  // Hồn đánh địch còn lại → tím
  if (/hon|phach|menh|hieu_lenh/.test(id)) return "qi_violet";
  return "qi_gold";
}

export function thunderStrikeFolder(strike: ThunderStrikeId): string {
  return `skill/loi/${strike}`;
}

/** Chiêu rồng — không để motif fire/ember nuốt thành nova blob. */
function isDragonSkill(skillId?: string | null, fxStyle?: string | null, flash?: string, motif?: string): boolean {
  const id = String(skillId || "").toLowerCase();
  const st = String(fxStyle || "").toLowerCase();
  const f = String(flash || "").toLowerCase();
  const m = String(motif || "").toLowerCase();
  if (m === "dragon" || f === "dragon" || f === "cyan_dragon") return true;
  if (st === "beast_dragon") return true;
  // Hỏa Long / Viêm Long / … — tên long + lửa vẫn breath
  if (/hoa_long|viem_long|xich_long|bach_long|thanh_long|ngan_long|thuong_long|long_dam|long_nu/.test(id))
    return true;
  return false;
}

/** Map flash/motif/pattern → style 3D (mọi chiêu đi qua đây). */
export function resolveFx3dStyle(opts: {
  flash?: string | null;
  motif?: string | null;
  pattern?: string | null;
  support?: boolean;
  isShield?: boolean;
  isCharge?: boolean;
  isRush?: boolean;
  skillId?: string | null;
  /** fx.style từ skills.json (vd beast_dragon) */
  fxStyle?: string | null;
}): Fx3dStyle {
  const flash = String(opts.flash || "").toLowerCase();
  const motif = String(opts.motif || "").toLowerCase();
  const pat = String(opts.pattern || "single").toLowerCase();

  // —— barrier / bless / charge / rush ——
  if (opts.isShield || flash === "shield" || motif === "shield") return "barrier";
  // spirit (hỗ trợ lẫn offensive): caster hiện hồn — không fallback bless vàng generic
  if (motif === "spirit" || flash === "violet_spirit") return "shadow";
  if (opts.support || motif === "heal" || motif === "buff" || pat === "ally_all" || pat === "self") {
    if (flash === "shield") return "barrier";
    return "bless";
  }
  if (opts.isCharge || flash === "charge" || flash === "brown" || motif === "charge") return "charge";
  if (opts.isRush || flash === "rush" || motif === "rush") return "rush";

  // —— Thú / long / phượng ——
  // Hỏa Long: motif fire + ember vẫn breath (qi rồng), không nova
  if (isDragonSkill(opts.skillId, opts.fxStyle, flash, motif)) return "breath";
  if (motif === "firebird" || flash === "crimson_flame") return "nova";
  if (flash === "tiger" || motif === "tiger" || flash === "wolf" || motif === "wolf") return "roar";

  // —— Bucket tách (TRƯỚC beam generic) ——
  if (flash === "jade_gold" || flash === "bagua" || motif === "bagua") return "bagua";
  if (flash === "thunder" || flash === "storm" || flash === "electric_blue" || motif === "thunder")
    return "thunder";
  if (motif === "ice" || flash === "ice_blue" || flash === "ice" || flash === "frost") return "ice";
  if (motif === "pierce" || flash === "gold_pierce") return "pierce";

  if (flash === "whirlwind" || motif === "whirlwind" || flash === "wind") return "whirl";
  if (
    flash === "green_poison" ||
    flash === "poison" ||
    flash === "snake" ||
    flash === "fire_green" ||
    motif === "poison" ||
    motif === "snake"
  )
    return "poison";
  if (flash === "blue_water" || flash === "cyan" || flash === "teal" || flash === "white_blue" || motif === "water")
    return "tide";
  if (flash === "fire_rain" || flash === "fire" || flash === "orange" || flash === "red_fire" || motif === "fire")
    return "nova";
  if (
    flash === "crimson" ||
    flash === "dark_red" ||
    flash === "gold_red" ||
    flash === "red" ||
    motif === "shadow"
  )
    return "shadow";

  if (flash === "purple" || flash === "violet" || flash === "blue" || motif === "arcane") return "beam";

  return "slash";
}

/** Map style 3D → pack hồn (null = không dùng spirit sequence). */
export function honPackForStyle(style: Fx3dStyle, flash?: string, skillId?: string | null): HonPackId | null {
  const f = (flash || "").toLowerCase();
  const id = String(skillId || "").toLowerCase();

  if (style === "bagua") return "hon_bagua";
  if (style === "thunder") return "hon_loi";

  if (
    f === "bagua" ||
    f === "jade_gold" ||
    /bagua|bat_tran|ky_mon|am_duong|huyen_phap|huyen_thuat|kinh_dien_luan|thien_dia_van_tuong|than_uy_pha_tran|thuong_tran|tien_co_chien_tran/.test(
      id
    )
  )
    return "hon_bagua";

  // Linh hồn người / spirit motif (flash violet_spirit luôn hon_hon)
  if (f === "violet_spirit") return "hon_hon";
  if (
    /truy_hon|toa_hon|tran_hon|de_hon|thu_hon|doat_phach|thien_menh|hieu_lenh|bach_hong|hong_hoang|hong_lien|hong_viem|xich_vu|thanh_long_hon/.test(
      id
    )
  )
    return "hon_hon";

  if (style === "breath") return "hon_rong";
  // Skill rồng dù flash ember/fire — luôn hon_rong (không mất silhouette)
  if (
    f === "dragon" ||
    f === "cyan_dragon" ||
    /hoa_long|viem_long|xich_long|bach_long|thanh_long|ngan_long|thuong_long|long_dam|long_nu/.test(id)
  )
    return "hon_rong";
  if (style === "poison") return "hon_xa";
  if (style === "tide" || style === "ice") return "hon_thuy";
  if (style === "whirl") return "hon_phong";
  if (style === "roar") return f === "wolf" || /lang_|_soi|soi_|wolf/.test(id) ? "hon_soi" : "hon_ho";

  if (
    f === "thunder" ||
    f === "storm" ||
    f === "electric_blue" ||
    /sam_set|than_loi|bao_loi|kinh_loi|thien_loi|loi_/.test(id)
  )
    return "hon_loi";

  return null;
}
