const fs = require('fs');

// 1. APPEND CSS OVERRIDES
const cssFile = 'src/app/dashboard/workspace.css';
let css = fs.readFileSync(cssFile, 'utf8');

const overrides = `
/* --- OVERRIDES BASEADOS NA IMAGEM (CLICKUP EXACT MATCH) --- */
.global-rail { background: #000000 !important; width: 68px !important; padding-top: 15px !important; }
.global-rail button { color: #a3a3a3 !important; position: relative; }
.global-rail button.active { background: transparent !important; color: #ffffff !important; }
.global-rail button.active::before { content: ''; position: absolute; left: -5px; top: 15%; bottom: 15%; width: 4px; background: linear-gradient(to bottom, #ff0b55, #7b68ee); border-radius: 0 4px 4px 0; }
.badge-pink { background: #e11d48; color: white; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 10px; position: absolute; top: 2px; right: 5px; box-shadow: 0 0 0 2px #000; }
.badge-inline { background: #e11d48; color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; margin-left: auto; }
.global-topbar { justify-content: space-between; padding: 0 20px !important; }
.global-search { margin: 0 auto !important; width: 400px !important; border-radius: 20px !important; background: #ffffff !important; border: 1px solid #e4e6e9 !important; padding: 6px 16px !important; color: #8c9096 !important; font-weight: 400 !important; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); }
.inbox-tabs { display: flex; border-bottom: 1px solid #e4e6e9; background: #fff; }
.inbox-tab { display: flex; flex-direction: column; align-items: flex-start; padding: 16px 20px; background: transparent; border: none; border-bottom: 3px solid transparent; color: #7a818c; }
.inbox-tab strong { font-size: 14px; color: #202225; display: flex; align-items: center; gap: 8px; font-weight: 600; }
.inbox-tab small { font-size: 11px; margin-top: 4px; color: #a1a5ab; }
.inbox-tab.active { border-bottom-color: #000000; color: #000000; }
.inbox-tab.active strong { color: #000000; }
.inbox-row { display: flex; align-items: center; padding: 12px 24px; border-bottom: 1px solid #f0f1f3; background: #ffffff; cursor: pointer; width: 100%; transition: background 0.1s; }
.inbox-row:hover { background: #f8f9fb; }
.inbox-circle { width: 13px; height: 13px; border-radius: 50%; border: 2px solid #3b82f6; margin-right: 15px; flex-shrink: 0; background: transparent; }
.inbox-circle.purple { border-color: #8b5cf6; }
.inbox-circle.yellow { border-color: #eab308; }
.inbox-circle.red { border-color: #ef4444; }
.inbox-title { width: 220px; text-align: left; font-size: 13px; color: #4b5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
.inbox-avatar { width: 20px; height: 20px; border-radius: 50%; background: #cbd5e1; margin-right: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; font-weight: bold; }
.inbox-action { flex: 1; text-align: left; font-size: 13px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.inbox-action strong { color: #111827; font-weight: 500; }
.inbox-meta { display: flex; align-items: center; gap: 15px; font-size: 12px; color: #9ca3af; }
.comment-bubble { border: 1px solid #e5e7eb; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #6b7280; }
.topbar-right-icons { display: flex; gap: 12px; align-items: center; color: #6b7280; }
`;
if (!css.includes('.inbox-row')) {
  fs.writeFileSync(cssFile, css + '\n' + overrides);
}

// 2. UPDATE WORKSPACEAPP (TOPBAR & SIDEBAR BADGES)
const appFile = 'src/components/WorkspaceApp.tsx';
let app = fs.readFileSync(appFile, 'utf8');

// Modify the rail
app = app.replace('<button className={section === \'home\' ? \'active\' : \'\'}', '<button className={section === \'home\' ? \'active\' : \'\'} style={{position: \'relative\'}}');
if (!app.includes('badge-pink')) {
  app = app.replace('<Home size={20} />', '<Home size={22} /><span className="badge-pink">26</span>');
}

// Modify Topbar
app = app.replace(
  '<div className="global-topbar"><span>{workspace?.name || \'TaskFlow\'}</span><button className="global-search"',
  '<div className="global-topbar"><span style={{fontWeight: "600", color: "#111827"}}>{workspace?.name || \'Moura Leite\'}</span><button className="global-search"'
);
app = app.replace(
  'Pesquisar no workspace</button><span className="avatar small"',
  'Pesquisar Ctrl K</button><div className="topbar-right-icons"><CheckCheck size={18} /><CalendarDays size={18} /><MessageSquare size={18} /><span className="avatar small"'
);

// Sidebar items translation
app = app.replace('Visao geral', 'Caixa de entrada');

fs.writeFileSync(appFile, app);

console.log('UI tweaked');
