import { BattleRenderer } from "./battle/BattleRenderer";
import { SITES } from "./city/buildings";
import { CityRenderer } from "./city/CityRenderer";
import { tierOf } from "./city/tiers";

window.NLCity = {
  CityRenderer,
  BattleRenderer,
  BUILDING_LAYOUT: SITES,
  visualTier: tierOf,
};
window.dispatchEvent(new Event("nl-city-ready"));
