"use client";
import { Search, Sparkles, Zap, Activity, Link, Plus, Clock, Users, User, Mic, FileText, ChevronDown } from 'lucide-react';

export default function WorkspaceAI() {
  return (
    <div style={{display: 'flex', height: '100%', width: '100%', background: '#fff', position: 'relative', overflow: 'hidden'}}>
      
      {/* BACKGROUND GRADIENT BLUR */}
      <div style={{
        position: 'absolute', top: '-10%', left: '20%', right: '-10%', height: '50%',
        background: 'radial-gradient(ellipse at top, rgba(255, 182, 193, 0.4) 0%, rgba(135, 206, 235, 0.2) 40%, transparent 70%)',
        filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute', top: '10%', right: '10%', width: '30%', height: '40%',
        background: 'radial-gradient(circle, rgba(255, 223, 186, 0.4) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none'
      }}></div>

      {/* AI SIDEBAR */}
      <aside style={{width: '260px', borderRight: '1px solid #e4e6e9', display: 'flex', flexDirection: 'column', background: '#fff', zIndex: 1, flexShrink: 0}}>
        <div style={{padding: '20px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0}}>IA</h2>
          <div style={{display: 'flex', gap: '8px', color: '#6b7280'}}>
            <div style={{cursor: 'pointer'}}>{'<<'}</div>
            <div style={{border: '1px solid #e4e6e9', borderRadius: '4px', padding: '2px 6px', display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
              <FileText size={14} /> <ChevronDown size={12} style={{marginLeft: '4px'}} />
            </div>
          </div>
        </div>

        <div style={{flex: 1, overflowY: 'auto', padding: '10px 10px 20px'}}>
          
          {/* Main AI Links */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#f4f5f7', borderRadius: '6px', fontSize: '13px', fontWeight: '500', color: '#111827', cursor: 'pointer'}}>
              <Sparkles size={16} color="#8b5cf6" /> Pergunte ou crie
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
              <Zap size={16} /> Habilidades <span style={{background: '#eff6ff', color: '#3b82f6', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '600'}}>Beta</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
              <Activity size={16} /> Análises
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
              <Link size={16} /> Conexões
            </div>
          </div>

          {/* Superagentes */}
          <div style={{marginTop: '24px', padding: '0 12px'}}>
            <div style={{fontSize: '11px', color: '#9ca3af', fontWeight: '500', marginBottom: '12px', textTransform: 'uppercase'}}>Superagentes</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
                 <div style={{background: 'linear-gradient(45deg, #ef4444, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}><Sparkles size={16} /></div>
                 Criar agente
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
                 <Clock size={16} /> Atividade do agente
               </div>
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
                 <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><Users size={16} color="#f97316" /> Todos os agentes</div>
                 <span style={{color: '#9ca3af', fontSize: '12px'}}>2</span>
               </div>
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
                 <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><User size={16} color="#10b981" /> Meus agentes</div>
                 <span style={{color: '#9ca3af', fontSize: '12px'}}>2</span>
               </div>
            </div>
          </div>

          {/* Superagentes recentes */}
          <div style={{marginTop: '24px', padding: '0 12px'}}>
            <div style={{fontSize: '11px', color: '#9ca3af', fontWeight: '500', marginBottom: '12px', textTransform: 'uppercase'}}>Superagentes recentes</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
                 <img src="https://i.pravatar.cc/150?u=cal" style={{width: '20px', height: '20px', borderRadius: '50%'}} />
                 Curadoria Cal
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
                 <img src="https://i.pravatar.cc/150?u=parker" style={{width: '20px', height: '20px', borderRadius: '50%'}} />
                 Pauta Parker
               </div>
            </div>
          </div>
          
        </div>

        {/* Sidebar Footer Stats */}
        <div style={{padding: '16px 20px', borderTop: '1px solid #e4e6e9', display: 'flex', justifyContent: 'space-between'}}>
           <div style={{display: 'flex', flexDirection: 'column'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: '500'}}><div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981'}}></div> 186</div>
             <div style={{fontSize: '10px', color: '#9ca3af'}}>Usos da IA do Brain</div>
           </div>
           <div style={{display: 'flex', flexDirection: 'column'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '12px', fontWeight: '500'}}><div style={{width: '6px', height: '6px', borderRadius: '50%', border: '1px solid #9ca3af'}}></div> 65</div>
             <div style={{fontSize: '10px', color: '#9ca3af'}}>Créditos restantes</div>
           </div>
        </div>
      </aside>

      {/* MAIN AI HUB AREA */}
      <main style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative'}}>
        
        {/* Top Right Memória */}
        <div style={{position: 'absolute', top: '20px', right: '30px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px', cursor: 'pointer'}}>
          <FileText size={16} /> Memória
        </div>

        {/* Logo Center */}
        <div style={{marginTop: '15vh', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{position: 'relative'}}>
            <Sparkles size={48} color="#ec4899" />
            <Sparkles size={48} color="#3b82f6" style={{position: 'absolute', top: 2, left: 2, opacity: 0.5}} />
          </div>
          <h1 style={{fontSize: '48px', fontWeight: '600', margin: 0, background: 'linear-gradient(45deg, #ef4444, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px'}}>
            Brain<sup style={{fontSize: '24px'}}>2</sup>
          </h1>
        </div>

        {/* Prompt Box */}
        <div style={{width: '100%', maxWidth: '800px', padding: '0 20px'}}>
          
          {/* Tabs sticking out */}
          <div style={{display: 'flex', gap: '4px', marginLeft: '20px'}}>
            <div style={{background: '#fff', padding: '10px 20px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', color: '#111827', boxShadow: '0 -2px 10px rgba(0,0,0,0.02)', position: 'relative', zIndex: 2}}>
              <Sparkles size={14} color="#8b5cf6" /> Faça uma pergunta
            </div>
            <div style={{background: 'rgba(255,255,255,0.5)', padding: '10px 20px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280', cursor: 'pointer', position: 'relative', zIndex: 1}}>
              <Users size={14} /> Agentes
            </div>
          </div>

          {/* The Box itself */}
          <div style={{
            background: '#fff', borderRadius: '24px', padding: '2px',
            backgroundClip: 'padding-box', border: 'solid 2px transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(59,130,246,0.3) 100%)',
            backgroundOrigin: 'border-box', position: 'relative', zIndex: 2,
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)'
          }}>
            <div style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px'}}>
              <textarea 
                placeholder="Transforme ideias em ação. Crie tarefas, documentos ou qualquer outra coisa com um prompt."
                style={{width: '100%', minHeight: '80px', border: 'none', outline: 'none', resize: 'none', fontSize: '16px', color: '#111827', background: 'transparent'}}
              />
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <button style={{background: '#f4f5f7', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer'}}>
                    <Plus size={16} />
                  </button>
                  <button style={{background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280', cursor: 'pointer', fontWeight: '500'}}>
                    <Zap size={14} /> Habilidades
                  </button>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563', cursor: 'pointer'}}>
                    <Sparkles size={14} color="#8b5cf6" /> Max <ChevronDown size={12} />
                  </div>
                  <button style={{background: '#f4f5f7', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer'}}>
                    <Mic size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Loaders (Sugestoes) */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '30px'}}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{background: '#fff', border: '1px solid #f0f1f3', borderRadius: '12px', padding: '16px', height: '80px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div style={{background: '#f4f5f7', height: '12px', width: '30%', borderRadius: '6px'}}></div>
                <div style={{background: '#f9fafb', height: '8px', width: '80%', borderRadius: '4px'}}></div>
                <div style={{background: '#f9fafb', height: '8px', width: '60%', borderRadius: '4px'}}></div>
              </div>
            ))}
          </div>

        </div>

      </main>
    </div>
  );
}
