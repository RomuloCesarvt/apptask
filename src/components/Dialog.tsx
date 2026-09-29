"use client";
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Dialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className={`tf-dialog ${wide ? 'wide' : ''}`} aria-label={title} onCancel={onClose}>
    <header><h2>{title}</h2><button type="button" className="icon-button" title="Fechar" aria-label="Fechar" onClick={onClose}><X size={20} /></button></header>
    {children}
  </dialog>;
}
