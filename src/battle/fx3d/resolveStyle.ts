/**
 * Cổng duy nhất: flash/motif/pattern → Fx3dStyle + HonPackId.
 * playSkillFx3d và catalog QA đều đi qua đây — không map motif rải rác.
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
  | "barrier";

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

/** Map flash/motif/pattern → style 3D (mọi chiêu đi qua đây). */
export function resolveFx3dStyle(opts: {
  flash?: string | null;
  motif?: string | null;
  pattern?: string | null;
  support?: boolean;
  isShield?: boolean;
  isCharge?: boolean;
  isRush?: boolean;
}): Fx3dStyle {
  const flash = String(opts.flash || "").toLowerCase();
  const motif = String(opts.motif || "").toLowerCase();
  const pat = String(opts.pattern || "single").toLowerCase();
  if (opts.isShield || flash === "shield" || motif === "shield") return "barrier";
  if (opts.support || motif === "heal" || motif === "buff" || pat === "ally_all" || pat === "self") {
    if (flash === "shield") return "barrier";
    return "bless";
  }
  if (opts.isCharge || flash === "charge" || flash === "brown" || motif === "charge") return "charge";
  if (opts.isRush || flash === "rush" || motif === "rush") return "rush";
  if (flash === "dragon" || motif === "dragon") return "breath";
  if (flash === "tiger" || motif === "tiger" || flash === "wolf" || motif === "wolf") return "roar";
  // Linh hồn người / pháp trận — map sớm trước beam generic
  if (flash === "violet_spirit" || motif === "spirit") return "beam";
  if (flash === "jade_gold" || flash === "bagua" || motif === "bagua") return "beam";
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
  if (
    flash === "thunder" ||
    flash === "storm" ||
    flash === "electric_blue" ||
    flash === "purple" ||
    flash === "violet" ||
    flash === "bagua" ||
    flash === "blue" ||
    motif === "arcane" ||
    motif === "thunder" ||
    motif === "bagua"
  )
    return "beam";
  if (motif === "pierce" || flash === "gold_pierce") return "rush";
  return "slash";
}

/** Map style 3D → pack hồn (null = không dùng spirit sequence). */
export function honPackForStyle(style: Fx3dStyle, flash?: string, skillId?: string | null): HonPackId | null {
  const f = (flash || "").toLowerCase();
  const id = String(skillId || "").toLowerCase();
  // Pháp trận Bát Quái (đa màu) — ưu tiên trước beam generic
  if (
    f === "bagua" ||
    f === "jade_gold" ||
    /bagua|bat_tran|ky_mon|am_duong|huyen_phap|huyen_thuat|kinh_dien_luan|thien_dia_van_tuong|than_uy_pha_tran|thuong_tran|tien_co_chien_tran/.test(
      id
    )
  )
    return "hon_bagua";
  // Linh hồn người (không long/rồng)
  if (
    (f === "violet_spirit" ||
      /truy_hon|toa_hon|tran_hon|de_hon|thu_hon|doat_phach|thien_menh|hieu_lenh|bach_hong|hong_hoang|hong_lien|hong_viem|xich_vu/.test(
        id
      )) &&
    !/long|rong/.test(id)
  )
    return "hon_hon";
  if (style === "breath") return "hon_rong";
  if (style === "poison") return "hon_xa";
  if (style === "tide") return "hon_thuy";
  if (style === "whirl") return "hon_phong";
  if (style === "roar") return f === "wolf" || /lang_|_soi|soi_|wolf/.test(id) ? "hon_soi" : "hon_ho";
  // Lôi: flash electric_blue (wiki) + thunder/storm
  if (
    style === "beam" &&
    (f === "thunder" ||
      f === "storm" ||
      f === "electric_blue" ||
      /sam_set|than_loi|bao_loi|kinh_loi|thien_loi|loi_/.test(id))
  )
    return "hon_loi";
  return null;
}
