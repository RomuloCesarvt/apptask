const fs = require('fs');
const path = require('path');

const cssFile = 'src/app/dashboard/workspace.css';
let css = fs.readFileSync(cssFile, 'utf8');

// Add theme classes to CSS
const themeCSS = `
/* Temas Customizados */
.tf-app.theme-purple { --accent: #7b68ee; --soft: #f0ebff; --rail-bg: #2b3440; }
.tf-app.theme-blue { --accent: #007bff; --soft: #e6f2ff; --rail-bg: #1e3a5f; }
.tf-app.theme-emerald { --accent: #10b981; --soft: #ecfdf5; --rail-bg: #064e3b; }
.tf-app.theme-rose { --accent: #f43f5e; --soft: #fff1f2; --rail-bg: #881337; }
.tf-app.theme-orange { --accent: #f97316; --soft: #fff7ed; --rail-bg: #7c2d12; }
.tf-app.theme-light { --accent: #7b68ee; --soft: #f0ebff; --rail-bg: #f4f5f7; --rail-color: #7a818c; }
.theme-light .global-rail button { color: #7a818c; }
.theme-light .global-rail button:hover { background: #e4e6e9; color: #202225; }
.theme-light .global-rail button.active { background: #d1d5db; color: #202225; }
.theme-light .rail-logo { color: var(--accent); }

.global-rail { background: var(--rail-bg, #2b3440); }
`;

if (!css.includes('.theme-purple')) {
  // Replace static background in global-rail
  css = css.replace('background:#2b3440;', 'background:var(--rail-bg, #2b3440);');
  css += '\n' + themeCSS;
  fs.writeFileSync(cssFile, css);
}

const appFile = 'src/components/WorkspaceApp.tsx';
let app = fs.readFileSync(appFile, 'utf8');

if (!app.includes('const [theme')) {
  app = app.replace('const [mobileNav, setMobileNav] = useState(false);', 'const [mobileNav, setMobileNav] = useState(false);\n  const [theme, setTheme] = useState(\'theme-purple\');');
  
  app = app.replace('<div className="tf-app">', '<div className={`tf-app ${theme}`}>');
  
  const themePickerHTML = `
      <div className="sidebar-section" style={{marginTop: '10px'}}><span>TEMA</span></div>
      <div style={{display: 'flex', gap: '8px', padding: '0 14px 10px', flexWrap: 'wrap'}}>
        <button onClick={() => setTheme('theme-purple')} style={{width: '20px', height: '20px', borderRadius: '50%', background: '#7b68ee', border: 'none', cursor: 'pointer'}} title="Roxo"></button>
        <button onClick={() => setTheme('theme-blue')} style={{width: '20px', height: '20px', borderRadius: '50%', background: '#007bff', border: 'none', cursor: 'pointer'}} title="Azul"></button>
        <button onClick={() => setTheme('theme-emerald')} style={{width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', border: 'none', cursor: 'pointer'}} title="Esmeralda"></button>
        <button onClick={() => setTheme('theme-rose')} style={{width: '20px', height: '20px', borderRadius: '50%', background: '#f43f5e', border: 'none', cursor: 'pointer'}} title="Rosa"></button>
        <button onClick={() => setTheme('theme-light')} style={{width: '20px', height: '20px', borderRadius: '50%', background: '#e5e7eb', border: '2px solid #ccc', cursor: 'pointer'}} title="Claro"></button>
      </div>`;
      
  app = app.replace('<div className="sidebar-section"><span>ESPACOS</span>', themePickerHTML + '\n      <div className="sidebar-section"><span>ESPACOS</span>');
  
  fs.writeFileSync(appFile, app);
}

console.log('Theming applied!');
