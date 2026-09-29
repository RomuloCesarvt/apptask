import React from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import ActionableChat from '@/components/ActionableChat';

export default function DashboardPage() {
  return (
    <div className="flex w-full h-full">
      {/* A área do Kanban pega o máximo de espaço possível */}
      <KanbanBoard />
      
      {/* O Chat fica na lateral direita, sempre visível (Actionable Chat) */}
      <ActionableChat />
    </div>
  );
}
