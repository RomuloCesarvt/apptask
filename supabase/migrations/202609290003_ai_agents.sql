-- Tabela de Superagentes Customizados
CREATE TABLE tf_ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES tf_workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Monitoramento de Créditos/Usos
CREATE TABLE tf_ai_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES tf_workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES tf_ai_agents(id) ON DELETE SET NULL,
    tokens_used INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tf_ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tf_ai_usages ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Leitura de agentes da própria equipe" ON tf_ai_agents FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM tf_workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Leitura de uso da equipe" ON tf_ai_usages FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM tf_workspace_members WHERE user_id = auth.uid()));

-- Inserir alguns agentes padrões como Seed inicial (Opcional, mas útil para testes)
-- Observação: Esses inserts não ocorrerão na migração porque precisamos de um workspace_id, o que faremos via API, 
-- MAS podemos criar uma Trigger para inserir esses agentes automaticamente ao criar um novo Workspace.

CREATE OR REPLACE FUNCTION tf_seed_default_agents()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO tf_ai_agents (workspace_id, name, system_prompt)
    VALUES 
        (NEW.id, 'Curadoria Cal', 'Você é o Cal, um agente especializado em curadoria de conteúdo e refino de informações.'),
        (NEW.id, 'Pauta Parker', 'Você é o Parker, um agente especializado em geração de pautas estruturadas para reuniões e projetos.');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_created_seed_agents
    AFTER INSERT ON tf_workspaces
    FOR EACH ROW EXECUTE FUNCTION tf_seed_default_agents();
