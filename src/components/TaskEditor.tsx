"use client";
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Star, Maximize2, X, Play, Image as ImageIcon, Mic, Paperclip, Sparkles, Flag, ChevronDown, CheckSquare, AlignLeft, CornerDownRight, MessageSquare, Send } from 'lucide-react';
import { errorText, type Task, type TaskDraft, type Message, type Comment, type Member } from '@/lib/taskflow';

export default function TaskEditor({ task, source, parent, tasks, comments, members, onClose, onSave, onArchive, onComment, onSubtask, onOpen }: any) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  const [draft, setDraft] = useState<TaskDraft>({
    title: task?.title || source?.content.slice(0, 240) || '',
    description: task?.description || source?.content || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    assignee_id: task?.assignee_id || null,
    due_date: task?.due_date || null,
    parent_id: task?.parent_id || parent?.id || null
  });

  const [comment, setComment] = useState('');
  
  return (
    <dialog ref={dialogRef} className="task-modal" onCancel={onClose} style={{
      width: '95vw', maxWidth: '1400px', height: '90vh', padding: 0, border: 'none', borderRadius: '8px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', background: '#fff'
    }}>
      {/* HEADER BREADCRUMB */}
      <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e4e6e9'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280', fontWeight: '500'}}>
          <div style={{background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'}}>P</div> PRODUTOS / 
          <span style={{color: '#a855f7'}}><FolderIcon size={12} /> PRO - ITU (ITU)</span> /
          <span style={{color: '#10b981'}}><CheckSquare size={12} /> ITU - Altavista Itu</span>
          <span style={{color: '#d1d5db', cursor: 'pointer'}}>+</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#6b7280'}}>
          <span>Criada em 29 set</span>
          <span style={{color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500'}}><Sparkles size={14}/> Brain²</span>
          <span>Compartilhar</span>
          <span style={{letterSpacing: '1px'}}>...</span>
          <Star size={16} />
          <Maximize2 size={16} />
          <X size={18} onClick={onClose} style={{cursor: 'pointer', color: '#111827'}} />
        </div>
      </div>

      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        {/* LEFT COLUMN - DETAILS */}
        <div style={{flex: 2, overflowY: 'auto', padding: '30px 40px', borderRight: '1px solid #e4e6e9'}}>
          {/* Subtask Context */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280', marginBottom: '16px'}}>
            <div style={{border: '1px solid #e4e6e9', padding: '4px 8px', borderRadius: '16px', display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer'}}>
              <div style={{width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #a3a3a3'}}></div> Tarefa <ChevronDown size={12} />
            </div>
            Subtarefa de <CheckSquare size={14} color="#3b82f6" fill="#3b82f6" /> Video Sala 3
          </div>

          {/* Title Area */}
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px'}}>
            <div style={{marginTop: '4px', border: '2px solid #a3a3a3', borderRadius: '50%', width: '16px', height: '16px', flexShrink: 0}}></div>
            <input 
              value={draft.title} 
              onChange={e => setDraft({...draft, title: e.target.value})} 
              style={{fontSize: '28px', fontWeight: '600', color: '#111827', border: 'none', outline: 'none', width: '100%', padding: 0}} 
              placeholder="Nome da tarefa"
            />
          </div>

          {/* AI Banner */}
          <div style={{background: 'linear-gradient(90deg, #fafafa 0%, #f4f5f7 100%)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px'}}>
            <Sparkles size={16} color="#ec4899" />
            <span style={{fontSize: '13px', color: '#4b5563'}}>Peça ao Brain² um <strong>apresentação, documento</strong> ou <strong>protótipo</strong></span>
          </div>

          {/* Attributes Grid */}
          <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', marginBottom: '40px', fontSize: '13px'}}>
            <div style={{color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px'}}><div style={{border: '1px solid #6b7280', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#6b7280'}}></div></div> Status</div>
            <div>
              <span style={{background: '#eab308', color: '#fff', fontWeight: '700', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', letterSpacing: '0.5px', cursor: 'pointer'}}>
                PENDENTE <Play fill="#fff" size={8} />
              </span>
              <CheckSquare size={16} color="#d1d5db" style={{marginLeft: '8px', verticalAlign: 'middle', cursor: 'pointer'}} />
            </div>

            <div style={{color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px'}}><UserIcon size={14} /> Responsáveis</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#111827'}}>
              <div style={{background: '#10b981', color: '#fff', fontSize: '10px', fontWeight: 'bold', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>MD</div>
              Michelle de Sales Dornelas
            </div>

            <div style={{color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px'}}><CalendarIcon size={14} /> Datas</div>
            <div style={{color: '#6b7280', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <span style={{cursor: 'pointer'}}><CalendarIcon size={12} /> Início</span> → <span style={{color: '#111827', cursor: 'pointer'}}><CalendarIcon size={12} color="#6b7280" /> sex</span>
            </div>

            <div style={{color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px'}}><Play size={14} /> Mais</div>
            <div style={{display: 'flex', gap: '12px', color: '#9ca3af', cursor: 'pointer'}}>
              <Flag size={14} /> <Paperclip size={14} />
            </div>
          </div>

          {/* Description */}
          <div style={{borderBottom: '1px solid #e4e6e9', paddingBottom: '30px', marginBottom: '30px'}}>
            <textarea 
              placeholder="Adicione uma descrição ou escreva com IA"
              value={draft.description}
              onChange={e => setDraft({...draft, description: e.target.value})}
              style={{width: '100%', minHeight: '100px', border: 'none', outline: 'none', resize: 'none', fontSize: '14px', color: '#4b5563', fontFamily: 'inherit'}}
            />
          </div>

          {/* Custom Fields (Campos) */}
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontWeight: '500', marginBottom: '20px', cursor: 'pointer'}}>
              <ChevronDown size={16} /> Campos
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', fontSize: '13px', marginLeft: '24px'}}>
              {[
                {name: 'Etapa', value: null},
                {name: 'Fornecedor', value: null},
                {name: 'Líder', value: 'Bárbara'},
                {name: 'Praça', value: 'ITU (ITU)'},
                {name: 'Produto', value: 'ITU - "TERRAS DE ITÚ"'},
                {name: 'Data de Lançamento', value: null, isDate: true},
                {name: 'Data Ideal', value: null, isDate: true},
                {name: 'Dias', value: null, isHash: true},
                {name: 'Diferença', value: null, isHash: true}
              ].map((field, i) => (
                <div key={i} style={{display: 'contents'}}>
                  <div style={{color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {field.isDate ? <CalendarIcon size={14} color="#9ca3af" /> : field.isHash ? <span style={{color: '#9ca3af', fontSize: '14px', fontWeight: 'bold'}}>#</span> : <AlignLeft size={14} color="#9ca3af" />}
                    {!field.isDate && !field.isHash && <Star size={14} fill="#eab308" color="#eab308" />} 
                    {field.name}
                  </div>
                  <div>
                    {field.value ? 
                      <span style={{background: '#8b5cf6', color: '#fff', fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer'}}>
                        {field.value} <ChevronDown size={12} />
                      </span>
                    : <span style={{color: '#d1d5db'}}>—</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{color: '#6b7280', fontSize: '12px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '24px', cursor: 'pointer'}}>
               <ChevronDown size={14} /> Ocultar 2 campos vazios
            </div>
          </div>
          
          <div style={{marginTop: '40px', display: 'flex', gap: '10px'}}>
             <button onClick={onClose} style={{padding: '8px 16px', background: '#f4f5f7', color: '#4b5563', border: '1px solid #e4e6e9', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'}}>Cancelar</button>
             <button onClick={() => onSave(draft)} style={{padding: '8px 16px', background: '#7b68ee', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'}}>Salvar Alterações</button>
          </div>
        </div>

        {/* RIGHT COLUMN - ACTIVITY */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', background: '#fafbfc'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e4e6e9'}}>
            <h3 style={{fontSize: '14px', fontWeight: '600', margin: 0, color: '#111827'}}>Activity</h3>
            <div style={{display: 'flex', gap: '16px', color: '#6b7280'}}>
              <Search size={16} style={{cursor: 'pointer'}} /> 
              <div style={{position: 'relative', cursor: 'pointer'}}><Bell size={16} /><span style={{position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', background: '#8b5cf6', borderRadius: '50%'}}></span></div> 
              <Settings size={16} style={{cursor: 'pointer'}} />
            </div>
          </div>

          <div style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
            <div style={{fontSize: '11px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', marginBottom: '24px'}}>
              <div style={{display: 'flex', gap: '8px'}}><div style={{width: '4px', height: '4px', background: '#d1d5db', borderRadius: '50%', marginTop: '6px'}}></div> Barbara Vizotto criou esta tarefa</div>
              <span>há 3 horas</span>
            </div>
            
            <div style={{fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer'}}>
              <ChevronDown size={14} /> Mostrar mais
            </div>

            {/* Mocked ClickUp Comment */}
            <div style={{background: '#fff', border: '1px solid #e4e6e9', borderLeft: '2px solid #8b5cf6', borderRadius: '6px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                <img src="https://i.pravatar.cc/150?u=1" style={{width: '24px', height: '24px', borderRadius: '50%'}} />
                <strong style={{fontSize: '13px', color: '#111827'}}>Barbara Vizotto</strong>
                <span style={{fontSize: '11px', color: '#9ca3af'}}>há 2 horas</span>
              </div>
              <p style={{fontSize: '13px', color: '#4b5563', lineHeight: '1.5', margin: 0}}>
                <span style={{color: '#8b5cf6', background: '#f0ebff', padding: '0 4px', borderRadius: '2px'}}>@Michelle de Sales Dornelas</span> pautar o e-mail marketing para disparo desse material. <span style={{color: '#8b5cf6', background: '#f0ebff', padding: '0 4px', borderRadius: '2px'}}>@Rômulo César</span> PSC
              </p>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px'}}>
                <div style={{display: 'flex', gap: '12px', color: '#9ca3af', cursor: 'pointer'}}><SmileIcon size={14} /> <MessageSquare size={14} /></div>
                <span style={{fontSize: '12px', color: '#6b7280', cursor: 'pointer', fontWeight: '500'}}>Responder</span>
              </div>
            </div>

            {/* Real Comments */}
            {comments.filter(c => c.task_id === task?.id).map(c => (
              <div key={c.id} style={{background: '#fff', border: '1px solid #e4e6e9', borderRadius: '6px', padding: '16px', marginBottom: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                  <div style={{width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'}}>
                    {members.find(m => m.user_id === c.author_id)?.tf_profiles.display_name.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <strong style={{fontSize: '13px', color: '#111827'}}>{members.find(m => m.user_id === c.author_id)?.tf_profiles.display_name || 'Membro'}</strong>
                  <span style={{fontSize: '11px', color: '#9ca3af'}}>{new Date(c.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p style={{fontSize: '13px', color: '#4b5563', margin: 0}}>{c.content}</p>
              </div>
            ))}
          </div>

          {/* Comment Composer */}
          <div style={{padding: '20px', borderTop: '1px solid #e4e6e9', background: '#fff'}}>
            <div style={{border: '1px solid #e4e6e9', borderRadius: '8px', padding: '12px', transition: 'border-color 0.2s'}} onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#e4e6e9'}>
              <textarea 
                value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Escreva um comentário..."
                style={{width: '100%', minHeight: '60px', border: 'none', outline: 'none', resize: 'none', fontSize: '13px', color: '#111827', marginBottom: '12px', fontFamily: 'inherit'}}
              />
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: '#9ca3af', cursor: 'pointer'}}>
                  <Plus size={16} />
                  <span style={{display: 'flex', alignItems: 'center', gap: '4px', background: '#f4f5f7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#4b5563', fontWeight: '500'}}>
                    Comentário <ChevronDown size={12} />
                  </span>
                  <Sparkles size={16} color="#8b5cf6" />
                  <span style={{color: '#8b5cf6', fontWeight: 'bold', fontSize: '16px'}}>@</span>
                  <Paperclip size={16} />
                  <span style={{letterSpacing: '2px', paddingBottom: '4px'}}>...</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <Mic size={16} color="#9ca3af" style={{cursor: 'pointer'}} />
                  <button onClick={() => { if(comment.trim()) { onComment(comment.trim()); setComment(''); } }} style={{background: comment.trim() ? '#8b5cf6' : '#f4f5f7', border: 'none', width: '32px', height: '32px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: comment.trim() ? '#fff' : '#d1d5db', transition: 'all 0.2s'}}>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </dialog>
  );
}

// Simple Icon mocks
function FolderIcon({size}:any) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>; }
function UserIcon({size}:any) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>; }
function CalendarIcon({size, color="currentColor"}:any) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>; }
function SmileIcon({size}:any) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>; }
