# Guia de configuração

Passo a passo para subir o Bolão da Copa do zero: banco de dados, autenticação e deploy.

---

## 1. Banco de dados — Supabase (PostgreSQL)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New project**, escolha um nome e defina uma senha forte para o banco
3. Aguarde o projeto ser provisionado (~1 min)
4. Vá em **Settings → Database → Connection string → URI**
5. Copie a URI e substitua `[YOUR-PASSWORD]` pela senha que você definiu

```
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.REFERENCIA.supabase.co:5432/postgres"
```

> **Dica:** guarde essa senha em local seguro — você vai precisar dela no Vercel também.

---

## 2. NextAuth — chave secreta

Gere uma chave aleatória segura no terminal:

```bash
openssl rand -base64 32
```

Cole o resultado como `AUTH_SECRET`. Para desenvolvimento local, `AUTH_URL` é sempre `http://localhost:3000`.

```
AUTH_SECRET="chave_gerada_aqui"
AUTH_URL="http://localhost:3000"
```

---

## 3. Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto (ou selecione um existente)
3. Vá em **APIs e Serviços → Credenciais → Criar credenciais → ID do cliente OAuth**
4. Tipo de aplicativo: **Aplicativo da Web**
5. Preencha os campos:

   | Campo | Valor (desenvolvimento) |
   |---|---|
   | Origens JS autorizadas | `http://localhost:3000` |
   | URIs de redirecionamento | `http://localhost:3000/api/auth/callback/google` |

6. Copie o **Client ID** e o **Client Secret**

```
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

> Em produção, adicione também a URL do Vercel nas origens e URIs (passo 5).

---

## 4. Arquivo .env.local

Copie o arquivo de exemplo e preencha com os valores acima:

```bash
cp .env.example .env.local
```

O arquivo final deve ficar assim:

```env
DATABASE_URL="postgresql://postgres:SENHA@db.REF.supabase.co:5432/postgres"
AUTH_SECRET="chave_gerada_com_openssl"
AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="seu_client_id"
GOOGLE_CLIENT_SECRET="seu_client_secret"
```

---

## 5. Banco de dados — aplicar schema

```bash
npm run db:push      # cria as tabelas no Supabase
npm run db:seed      # opcional: popula com dados iniciais
```

---

## 6. Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). O login com Google já deve funcionar.

Para promover um usuário a admin, execute no SQL Editor do Supabase:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

---

## 7. Deploy no Vercel

### 7.1 Instalar a CLI do Vercel (opcional, mas facilita)

```bash
npm i -g vercel
vercel login
```

### 7.2 Conectar o repositório

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository** e selecione `bolao-copa`
3. Mantenha as configurações padrão (o Vercel detecta Next.js automaticamente)

### 7.3 Adicionar variáveis de ambiente

Antes de clicar em **Deploy**, expanda **Environment Variables** e adicione:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | URL do Supabase (igual ao `.env.local`) |
| `AUTH_SECRET` | Mesma chave gerada com `openssl` |
| `AUTH_URL` | `https://SEU-PROJETO.vercel.app` (use a URL que o Vercel vai gerar) |
| `GOOGLE_CLIENT_ID` | Mesmo do `.env.local` |
| `GOOGLE_CLIENT_SECRET` | Mesmo do `.env.local` |

> **Dica:** se ainda não sabe a URL final, use qualquer valor em `AUTH_URL` agora e corrija no passo 7.5.

### 7.4 Fazer o deploy

Clique em **Deploy** e aguarde (~2 min). O Vercel vai:
- Rodar `npm run build` (que inclui `prisma generate`)
- Publicar em `https://SEU-PROJETO.vercel.app`

### 7.5 Corrigir a URL após o primeiro deploy

Após o deploy, copie a URL gerada (ex: `https://bolao-copa-xyz.vercel.app`) e:

1. **Vercel → Settings → Environment Variables** → edite `AUTH_URL` com a URL real
2. **Google Cloud Console → Credenciais → seu OAuth client** → adicione:
   - Origens JS autorizadas: `https://bolao-copa-xyz.vercel.app`
   - URIs de redirecionamento: `https://bolao-copa-xyz.vercel.app/api/auth/callback/google`
3. No Vercel, clique em **Deployments → Redeploy** para as variáveis entrarem em vigor

### 7.6 Aplicar o schema no banco de produção

Após o deploy, execute localmente apontando para o banco de produção:

```bash
npm run db:push
```

O `DATABASE_URL` do `.env.local` já aponta para o Supabase de produção, então o schema é aplicado diretamente.

### 7.7 Promover admin em produção

No [SQL Editor do Supabase](https://supabase.com/dashboard), rode:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

O usuário precisa ter feito login ao menos uma vez para existir na tabela.

---

## Resumo das variáveis

| Variável | Onde obter |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → URI |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` (dev) ou URL do Vercel (prod) |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credenciais |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credenciais |
