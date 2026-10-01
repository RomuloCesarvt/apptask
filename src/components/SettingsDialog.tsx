"use client";
import { useState } from 'react';
import { X, Image as ImageIcon, Camera } from 'lucide-react';
import Dialog from './Dialog';
import { supabase } from '@/lib/supabase';

export default function SettingsDialog({
  user,
  theme,
  onThemeChange,
  onClose,
  onNameUpdate
}: {
  user: { id: string; name: string };
  theme: string;
  onThemeChange: (t: string) => void;
  onClose: () => void;
  onNameUpdate: (name: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    setLoading(true);
    try {
      await supabase.from('tf_profiles').update({ display_name: name }).eq('id', user.id);
      onNameUpdate(name);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onClose={onClose} width="400px">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: 600 }}>Configurações</h2>
        <button onClick={onClose} className="icon-button" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Perfil */}
        <section>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', marginBottom: '12px' }}>Meu Perfil</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', position: 'relative', overflow: 'hidden' }}>
              <ImageIcon size={24} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={12} color="#fff" />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <button style={{ padding: '6px 12px', fontSize: '12px', background: '#fff', border: '1px solid #e4e6e9', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                Alterar foto
              </button>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>JPG, GIF ou PNG. Max 2MB.</div>
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>
            Nome completo
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              style={{ padding: '8px 12px', border: '1px solid #e4e6e9', borderRadius: '6px', fontSize: '14px', outline: 'none' }} 
              onFocus={e => e.target.style.borderColor = '#8b5cf6'}
              onBlur={e => e.target.style.borderColor = '#e4e6e9'}
            />
          </label>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #e4e6e9', margin: '0' }} />

        {/* Tema */}
        <section>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', marginBottom: '12px' }}>Aparência</h3>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
            Personalize as cores do seu TaskFlow. O tema é aplicado em todo o sistema.
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button aria-pressed={theme === 'theme-purple'} onClick={() => onThemeChange('theme-purple')} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#7b68ee', border: theme === 'theme-purple' ? '2px solid #111827' : 'none', cursor: 'pointer', outline: 'none', boxShadow: theme === 'theme-purple' ? '0 0 0 2px #fff inset' : 'none' }} title="Roxo"></button>
            <button aria-pressed={theme === 'theme-blue'} onClick={() => onThemeChange('theme-blue')} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#007bff', border: theme === 'theme-blue' ? '2px solid #111827' : 'none', cursor: 'pointer', outline: 'none', boxShadow: theme === 'theme-blue' ? '0 0 0 2px #fff inset' : 'none' }} title="Azul"></button>
            <button aria-pressed={theme === 'theme-emerald'} onClick={() => onThemeChange('theme-emerald')} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', border: theme === 'theme-emerald' ? '2px solid #111827' : 'none', cursor: 'pointer', outline: 'none', boxShadow: theme === 'theme-emerald' ? '0 0 0 2px #fff inset' : 'none' }} title="Esmeralda"></button>
            <button aria-pressed={theme === 'theme-rose'} onClick={() => onThemeChange('theme-rose')} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f43f5e', border: theme === 'theme-rose' ? '2px solid #111827' : 'none', cursor: 'pointer', outline: 'none', boxShadow: theme === 'theme-rose' ? '0 0 0 2px #fff inset' : 'none' }} title="Rosa"></button>
            <button aria-pressed={theme === 'theme-light'} onClick={() => onThemeChange('theme-light')} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e5e7eb', border: theme === 'theme-light' ? '2px solid #111827' : '1px solid #d1d5db', cursor: 'pointer', outline: 'none', boxShadow: theme === 'theme-light' ? '0 0 0 2px #fff inset' : 'none' }} title="Claro"></button>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e4e6e9', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#4b5563' }}>
            Cancelar
          </button>
          <button onClick={saveProfile} disabled={loading} style={{ padding: '8px 16px', background: '#111827', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, color: '#fff', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>

      </div>
    </Dialog>
  );
}
