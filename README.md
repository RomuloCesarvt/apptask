# TaskFlow Pro

Aplicacao Next.js com Supabase Auth para login por email/senha, Google e Microsoft.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
```

Para habilitar as configurações de perfil, aplique as migrações de `supabase/migrations`, incluindo `202610010001_profile_settings.sql`, no projeto Supabase. Ela adiciona `avatar_url`, permite que cada usuário atualize somente seu perfil e cria o bucket público `tf-avatars` com limite de 2 MB e tipos JPG/GIF/PNG. As fotos são públicas; upload e exclusão ficam restritos à pasta do próprio usuário. A seleção da foto é uma prévia local até clicar em **Salvar alterações**. A aparência continua sendo aplicada imediatamente e persistida no navegador.

In Supabase Auth, configure the redirect URLs for local and production:

```text
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

Google login uses the Supabase `google` provider. Microsoft login uses the Supabase `azure` provider and needs to be enabled in the Supabase dashboard.

## Deploy on Vercel

Link the local folder to the existing Vercel project, pull production env vars, and deploy:

```bash
vercel link
vercel pull --environment=production
npm run build
vercel --prod
```
