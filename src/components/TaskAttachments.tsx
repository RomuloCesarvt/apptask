"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Paperclip, Mic, MonitorPlay, Trash2, File as FileIcon, Play, Square, Loader2, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checked, errorText, type Attachment, type Task } from '@/lib/taskflow';

export default function TaskAttachments({ task, userId }: { task: Task; userId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [recordingVideo, setRecordingVideo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);

  const loadAttachments = useCallback(async () => {
    try {
      const data = await checked(supabase.from('tf_attachments').select('*').eq('task_id', task.id).order('created_at', { ascending: false }));
      setAttachments(data);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [task.id]);

  useEffect(() => {
    void loadAttachments();
  }, [loadAttachments]);

  async function handleUpload(file: File) {
    if (uploading) return;
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const fileName = `${task.id}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from('tf-media').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('tf-media').getPublicUrl(fileName);

      const attachment = await checked<Attachment>(supabase.from('tf_attachments').insert({
        task_id: task.id,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        url: urlData.publicUrl
      }).select().single());

      setAttachments(prev => [attachment, ...prev]);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setUploading(false);
    }
  }

  async function deleteAttachment(id: string, url: string) {
    try {
      setAttachments(prev => prev.filter(a => a.id !== id));
      await supabase.from('tf_attachments').delete().eq('id', id);
      const path = url.split('/tf-media/')[1];
      if (path) {
        await supabase.storage.from('tf-media').remove([path]);
      }
    } catch (err) {
      setError(errorText(err));
      void loadAttachments();
    }
  }

  async function startAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        await handleUpload(file);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingAudio(true);
    } catch (err) {
      setError('Acesso ao microfone negado ou indisponível.');
    }
  }

  function stopAudio() {
    mediaRecorderRef.current?.stop();
    setRecordingAudio(false);
  }

  async function startScreen() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      videoChunksRef.current = [];
      recorder.ondataavailable = e => videoChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `screen_${Date.now()}.webm`, { type: 'video/webm' });
        await handleUpload(file);
        stream.getTracks().forEach(t => t.stop());
      };
      
      // If user clicks "Stop sharing" on the browser native UI
      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setRecordingVideo(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingVideo(true);
    } catch (err) {
      setError('Acesso ao compartilhamento de tela negado ou cancelado.');
    }
  }

  function stopScreen() {
    mediaRecorderRef.current?.stop();
    setRecordingVideo(false);
  }

  return (
    <section className="task-subsection" style={{ marginTop: '24px' }}>
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#374151' }}>Anexos e Mídias</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={e => {
            Array.from(e.target.files || []).forEach(f => void handleUpload(f));
            e.target.value = '';
          }} />
          <button type="button" className="icon-button" title="Anexar arquivo" onClick={() => fileInputRef.current?.click()} disabled={uploading}><Paperclip size={15} /></button>
          
          {recordingAudio ? 
            <button type="button" className="icon-button" title="Parar gravação" onClick={stopAudio} style={{ color: '#ef4444' }}><Square size={15} /></button>
            : 
            <button type="button" className="icon-button" title="Gravar áudio" onClick={startAudio} disabled={uploading || recordingVideo}><Mic size={15} /></button>
          }

          {recordingVideo ? 
            <button type="button" className="icon-button" title="Parar gravação de tela" onClick={stopScreen} style={{ color: '#ef4444' }}><Square size={15} /></button>
            : 
            <button type="button" className="icon-button" title="Gravar tela" onClick={startScreen} disabled={uploading || recordingAudio}><MonitorPlay size={15} /></button>
          }
        </div>
      </div>

      {error && <p className="error-text" style={{ marginTop: '8px', fontSize: '12px' }}>{error}</p>}
      
      {uploading && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280', marginTop: '12px' }}><Loader2 size={14} className="spin" /> Enviando arquivo...</div>}
      {recordingAudio && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ef4444', marginTop: '12px', fontWeight: 500 }}><div className="status-dot IN_PROGRESS" style={{ background: '#ef4444' }} /> Gravando áudio...</div>}
      {recordingVideo && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ef4444', marginTop: '12px', fontWeight: 500 }}><div className="status-dot IN_PROGRESS" style={{ background: '#ef4444' }} /> Gravando tela...</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {loading ? <p className="muted-copy">Carregando anexos...</p> : attachments.length === 0 ? <p className="muted-copy" style={{ fontSize: '13px' }}>Nenhum anexo adicionado.</p> : attachments.map(att => (
          <div key={att.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
              {att.mime_type.startsWith('audio/') ? <Mic size={16} color="#6b7280" /> : att.mime_type.startsWith('video/') ? <MonitorPlay size={16} color="#6b7280" /> : <FileIcon size={16} color="#6b7280" />}
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <a href={att.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#111827', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{att.file_name}</a>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>{(att.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(att.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <a href={att.url} target="_blank" download rel="noreferrer" className="icon-button" title="Baixar" style={{ padding: '6px', color: '#4b5563' }}><Download size={14} /></a>
              {(att.author_id === userId) && (
                <button type="button" className="icon-button" title="Excluir" onClick={() => void deleteAttachment(att.id, att.url)} style={{ padding: '6px', color: '#ef4444' }}><Trash2 size={14} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
