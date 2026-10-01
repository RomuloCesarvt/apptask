"use client";
import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Camera } from 'lucide-react';
import Image from 'next/image';
import Dialog from './Dialog';
import { supabase } from '@/lib/supabase';
import { errorText } from '@/lib/taskflow';

export default function SettingsDialog({
  user,
  theme,
  onThemeChange,
  onClose,
  onNameUpdate
}: {
  user: { id: string; name: string; avatarUrl: string | null };
  theme: string;
  onThemeChange: (t: string) => void;
  onClose: () => void;
  onNameUpdate: (name: string, avatarUrl: string | null) => void;
}) {
  const [name, setName] = useState(user.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.avatarUrl);
  const fileInput = useRef<HTMLInputElement>(null);
  const saving = useRef(false);
  const previewUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  const selectPhoto = (file?: File) => {
    if (!file) return;
    setError('');
    if (!['image/jpeg', 'image/gif', 'image/png'].includes(file.type) || !/\.(jpe?g|gif|png)$/i.test(file.name)) {
      setError('Escolha uma imagem JPG, GIF ou PNG.');
      return;
    }
    if (file.size === 0 || file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter conteúdo e no máximo 2 MB.');
      return;
    }
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(file);
    setPreview(previewUrl.current);
    setPhoto(file);
  };

  const saveProfile = async () => {
    if (saving.current) return;
    const displayName = name.trim();
    setError('');
    if (!displayName || displayName.length > 160) {
      setError('Informe um nome entre 1 e 160 caracteres.');
      return;
    }
    saving.current = true;
    setLoading(true);
    let uploadedPath: string | null = null;
    let profileSaved = false;
    try {
      let avatarUrl = user.avatarUrl;
      if (photo) {
        const extension = { 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/png': 'png' }[photo.type];
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from('tf-avatars').upload(path, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPath = path;
        avatarUrl = supabase.storage.from('tf-avatars').getPublicUrl(path).data.publicUrl;
      }
      const { data, error: saveError } = await supabase.from('tf_profiles')
        .update({ display_name: displayName, avatar_url: avatarUrl }).eq('id', user.id)
        .select('display_name,avatar_url').single();
      if (saveError) throw saveError;
      profileSaved = true;
      onNameUpdate(data.display_name, data.avatar_url);
      onClose();
    } catch (e) {
      setError(errorText(e));
      if (uploadedPath && !profileSaved) {
        try {
          const { error: cleanupError } = await supabase.storage.from('tf-avatars').remove([uploadedPath]);
          if (cleanupError) console.error('Falha ao limpar foto não salva:', cleanupError);
        } catch (cleanupError) { console.error('Falha ao limpar foto não salva:', cleanupError); }
      }
    } finally {
      saving.current = false;
      setLoading(false);
    }
  };

  return (
    <Dialog onClose={() => { if (!saving.current) onClose(); }} title="Configurações">
      <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {error && <p role="alert" style={{ color: '#b91c1c', fontSize: '13px' }}>{error}</p>}
        <input ref={fileInput} type="file" accept=".jpg,.jpeg,.gif,.png,image/jpeg,image/gif,image/png" aria-label="Selecionar foto do perfil" hidden disabled={loading} onChange={e => { selectPhoto(e.target.files?.[0]); e.target.value = ''; }} />
        {/* Perfil */}
        <section>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', marginBottom: '12px' }}>Meu Perfil</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', position: 'relative', overflow: 'hidden' }}>
              {preview ? <Image src={preview} alt="Foto do perfil" width={64} height={64} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} />}
              <button type="button" aria-label="Alterar foto do perfil" disabled={loading} onClick={() => fileInput.current?.click()} style={{ border: 0, padding: 0, position: 'absolute', bottom: 0, left: 0, right: 0, height: '20px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={12} color="#fff" />
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <button type="button" disabled={loading} onClick={() => fileInput.current?.click()} style={{ padding: '6px 12px', fontSize: '12px', background: '#fff', border: '1px solid #e4e6e9', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                Alterar foto
              </button>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>JPG, GIF ou PNG. Max 2MB.</div>
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>
            Nome completo
            <input 
              type="text" 
              disabled={loading}
              maxLength={160}
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
          <button disabled={loading} onClick={onClose} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e4e6e9', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#4b5563' }}>
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
