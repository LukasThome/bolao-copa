# Bolão da Copa

App de bolão para competições de futebol. Os participantes fazem palpites nos placares dos jogos e acumulam pontos conforme os resultados são lançados pelo administrador.

## Funcionalidades

- Autenticação com Google (NextAuth v5)
- Palpite de placar por jogo (bloqueado após o início)
- Cálculo automático de pontos ao lançar resultado
- Ranking com distribuição de prêmios (marmitas) para o pódio
- Painel admin para cadastrar jogos e lançar resultados

## Regras de pontuação

| Acerto | Pontos |
|---|---|
| Placar exato | 10 pts |
| Empate (acertou que empatou) | 5 pts |
| Vencedor correto | 5 pts |
| Errou | 0 pts |

Em caso de empate no ranking, os prêmios das posições são somados e divididos igualmente.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Banco de dados:** PostgreSQL via [Supabase](https://supabase.com)
- **ORM:** Prisma
- **Auth:** NextAuth v5 + Prisma Adapter
- **UI:** Tailwind CSS v4 + Framer Motion
- **Estado global:** Zustand
- **Testes unitários:** Vitest + Testing Library
- **Testes E2E:** Cypress + Cucumber

## Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) (PostgreSQL)
- Credenciais OAuth do Google ([Google Cloud Console](https://console.cloud.google.com))

## Instalação

```bash
# Clone o repositório
git clone https://github.com/LukasThome/bolao-copa.git
cd bolao-copa

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

## Variáveis de ambiente

```env
# Supabase — Settings → Database → Connection string → URI
DATABASE_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres"

# NextAuth — gere com: openssl rand -base64 32
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## Banco de dados

```bash
# Cria/atualiza o schema no banco
npm run db:push

# (Opcional) Popula com dados iniciais
npm run db:seed
```

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Testes

```bash
# Testes unitários
npm test

# Cobertura
npm run test:coverage

# E2E (abre o Cypress)
npm run cypress:open

# E2E headless
npm run cypress:run:e2e
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Linting com ESLint |
| `npm run format` | Formatação com Prettier |
| `npm run typecheck` | Verificação de tipos TypeScript |
| `npm run db:push` | Aplica o schema Prisma no banco |
| `npm run db:seed` | Popula o banco com dados iniciais |

## Estrutura do projeto

```
app/
  (auth)/login/        # Página de login
  (dashboard)/         # Área autenticada
    admin/jogos/       # Painel admin
    palpites/          # Palpites do usuário
  api/                 # Route handlers
components/
  jogos/               # Cards e formulários de jogos
  palpites/            # Formulário de palpite
  ranking/             # Tabela de ranking
lib/
  auth.ts              # Configuração NextAuth
  pontuacao.ts         # Lógica de pontos e prêmios
prisma/
  schema.prisma        # Models: User, Jogo, Palpite
```

## Papéis de usuário

- **USER** — faz palpites e consulta o ranking
- **ADMIN** — cadastra jogos, lança resultados e tem acesso a `/admin`

Para promover um usuário a admin, atualize o campo `role` diretamente no banco:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'seu@email.com';
```
