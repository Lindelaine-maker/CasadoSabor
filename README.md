# Casa do Sabor — Cardápio Digital

Projeto acadêmico — N695 Desenvolvimento de Plataformas Web — Cenário 3.

## Stack
- Front-end: React + Vite
- API: Node.js + Express
- Persistência: PostgreSQL + Prisma ORM
- Validação: Zod
- Segurança: Helmet, CORS configurável, validação Zod, limitação de requisições e autenticação administrativa JWT

## Requisitos
Node.js 20+ e PostgreSQL.

## Executar localmente
1. Crie um banco PostgreSQL.
2. Copie `server/.env.example` para `server/.env` e configure `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `JWT_SECRET` (segredo aleatório com pelo menos 32 caracteres). Nunca publique o arquivo `.env`.
3. No terminal:
   ```bash
   cd server
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
   ```
4. Em outro terminal:
   ```bash
   cd client
   npm install
   cp .env.example .env
   npm run dev
   ```
5. Abra o endereço informado pelo Vite (normalmente http://localhost:5173).

A API inicia em http://localhost:3333 e disponibiliza `GET /api/health`. O cardápio pode ser consultado publicamente; para criar, editar ou excluir categorias e pratos, entre em **Acesso administrativo** na interface usando `ADMIN_USERNAME` e `ADMIN_PASSWORD` configurados no servidor. O login é feito em `POST /api/auth/login`, retorna um token JWT com validade de 8 horas e limita tentativas de autenticação.

## Endpoints
- `POST /api/auth/login` (autenticação administrativa)
- `GET/POST /api/categories`
- `GET/PUT/DELETE /api/categories/:id`
- `GET/POST /api/categories/:categoryId/dishes`
- `GET/PUT/DELETE /api/dishes/:id`

A exclusão de categoria com pratos é bloqueada (HTTP 409). Nomes de categorias são únicos e preços devem ser maiores que zero.

## Publicação
- Banco: crie PostgreSQL gerenciado (por exemplo, Neon) e configure `DATABASE_URL`.
- API: publique a pasta `server` em um serviço Node (por exemplo, Render), com `npm install && npx prisma generate && npx prisma migrate deploy` no build e `npm start` no start. Configure `DATABASE_URL`, `CLIENT_URL`, `PORT`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `JWT_SECRET` (mínimo de 32 caracteres).
- Front-end: publique a pasta `client` como site estático (por exemplo, Netlify), com `npm run build`, diretório `dist` e variável `VITE_API_URL` apontando para a URL da API + `/api`.
- Antes da entrega, substitua os links de exemplo no relatório pelos endereços reais e faça testes na versão publicada.

## Evidências acadêmicas
O relatório PDF está na pasta principal. Inclua capturas reais das telas e de requisições/respostas após executar e publicar o projeto. Complete nome, matrícula, turma e links antes do envio.
