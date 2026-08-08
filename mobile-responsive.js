(() => {
  const style = document.createElement('style');
  style.textContent = `
    /* Mobile-first refinements: one clear reading path, generous touch targets. */
    @media (max-width:680px){
      body{min-width:0;background:radial-gradient(circle at 100% 0,#5147bd2b,transparent 34%),var(--bg)}
      .app{display:flex!important;flex-direction:column;gap:12px;padding:12px;padding-bottom:calc(16px + env(safe-area-inset-bottom))}
      .card{border-radius:16px;box-shadow:0 10px 28px #0003}
      .status-sidebar{order:0;padding:14px!important}
      .status-sidebar .brand{padding:2px 5px 12px;font-size:17px}.status-sidebar .brand small{display:none}
      .status-sidebar .sidebar-kicker{padding:4px 5px 9px}
      .sidebar-status{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px!important}
      .status-card{min-height:54px!important;padding:10px!important;border-radius:12px!important}
      .status-card .name{font-size:11px!important}.status-card strong{font-size:18px!important}
      .status-sidebar .sidebar-foot{display:none}
      .status-sidebar .theme-selector{margin:12px 0 0!important}
      main{order:1;gap:12px}.top{padding:16px!important;align-items:flex-start!important;gap:12px!important;flex-wrap:wrap}.top h1{font-size:19px!important;line-height:1.35}.top .primary#add{width:100%;height:50px;margin:0!important;border-radius:13px;font-size:14px}
      .backup-controls{order:3;width:100%;display:grid!important;grid-template-columns:1fr 1fr;gap:8px!important}.backup-button{height:38px!important}
      .calendar-panel{padding:12px!important;border-radius:16px}.calendar-header{align-items:flex-start;flex-wrap:wrap;gap:7px!important}.calendar-heading{width:100%;margin:0!important}.calendar-heading h2{font-size:17px!important}.calendar-today{margin-right:auto}.calendar-control{width:34px!important;height:34px!important}
      .calendar-weekdays span{padding:6px 3px!important;font-size:8px!important;text-align:center!important}.calendar-day{height:58px!important;padding:3px!important}.calendar-date{height:15px!important;font-size:9px!important}.calendar-day.today .calendar-date span{width:17px!important;height:17px!important}.calendar-event{margin-top:2px!important;padding:3px!important;border-left-width:2px!important;font-size:8px!important}.calendar-more{font-size:8px!important}.calendar-legend{overflow-x:auto;white-space:nowrap;gap:10px!important;margin-top:9px!important;padding-bottom:1px}
      .list-panel{padding:14px!important}.head{margin-bottom:11px}.record{grid-template-columns:34px minmax(0,1fr) auto!important;gap:8px!important;padding:11px!important;border-radius:12px}.record .avatar{width:34px!important;height:34px!important}.record strong{font-size:11px!important}.record span{font-size:9px!important}.record .badge{font-size:9px!important;padding:5px 6px!important}.company-logo{display:none!important}
      .detail{order:2;max-height:none!important;padding:16px!important;position:static!important}.detail h2{font-size:20px!important;margin-top:13px!important}.detail .meta{grid-template-columns:1fr!important;gap:8px!important;margin:16px 0!important}.detail .links{gap:14px!important}.qa-card{border-radius:12px!important}
      dialog{width:calc(100vw - 20px);max-height:calc(100dvh - 20px);border-radius:17px}.modal-head{padding:16px!important}.modal-head h2{font-size:16px!important}form{display:flex!important;flex-direction:column;gap:12px!important;padding:16px!important}.field{gap:6px}.lookup{flex-direction:column;gap:8px}.lookup .button{width:100%;min-height:42px}.actions{display:grid!important;grid-template-columns:1fr 1fr;gap:9px!important;margin-top:4px}.actions .button,.actions .cancel{min-height:44px}.actions .cancel{border:1px solid var(--line);border-radius:11px}.qa-field textarea{min-height:180px!important}.import-row{flex-wrap:wrap}.toast{width:calc(100vw - 32px);text-align:center}
    }
    @media (max-width:380px){.calendar-day{height:52px!important}.calendar-event{font-size:7px!important}.calendar-legend{font-size:8px!important}.status-card .name{font-size:10px!important}.status-card strong{font-size:16px!important}}
  `;
  document.head.append(style);
})();
