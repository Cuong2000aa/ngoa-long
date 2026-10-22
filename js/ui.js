/* global window, NLUIParts */
(function (global) {
  var U = global.NLUIParts || {};
  global.NLUI = {
    toast: U.toast,
    renderResources: U.renderResources,
    renderCityDock: U.renderCityDock,
    openCityDock: U.openCityDock,
    closeCityDock: U.closeCityDock,
    toggleCityDock: U.toggleCityDock,
    isCityDockOpen: U.isCityDockOpen,
    closePanel: U.closePanel,
    openPanel: U.openPanel,
    disposeFormPreview: U.disposeFormPreview,
    formatBattleLogLine: U.formatBattleLogLine,
    renderCityPanel: U.renderCityPanel,
    renderBuildingDetail: U.renderBuildingDetail,
    renderGenerals: U.renderGenerals,
    renderGeneralDetail: U.renderGeneralDetail,
    refreshGeneralsView: U.refreshGeneralsView,
    renderWorld: U.renderWorld,
    renderTower: U.renderTower,
    renderArena: U.renderArena,
    renderEquip: U.renderEquip,
    renderCampaign: U.renderCampaign,
    setLastCampaignReport: U.setLastCampaignReport,
    showCampaignBriefing: U.showCampaignBriefing,
    showFormation: U.showFormation,
  };
})(window);
