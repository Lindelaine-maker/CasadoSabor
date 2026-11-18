# Casa do Sabor — Cardápio Digital

Projeto acadêmico — N695 Desenvolvimento de Plataformas Web — Cenário 3.

## Stack
- Front-end: React + Vite
- API: Node.js + Express
- Persistência: PostgreSQL + Prisma ORM
- Validação: Zod
- Segurança: Helmet, CORS configurável, validação Zod, limitação de requisições e autenticação administrativa JWT

## Requisitos
Node.js 22+ e PostgreSQL.

## Executar localmente
1. Crie um banco PostgreSQL.
2. Copie `server/.env.example` para `server/.env` e configure `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `JWT_SECRET` (segredo aleatório com pelo menos 32 caracteres). Nunca publique o arquivo `.env`.
3. No terminal:
   ```bash
   cd server
   npm ci
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   npm test
   npm run test:db
   npm run dev
   ```
4. Em outro terminal:
   ```bash
   cd client
   npm ci
   cp .env.example .env
   npm run dev
   ```
5. Abra o endereço informado pelo Vite (normalmente http://localhost:5173).

A API inicia em http://localhost:3333 e disponibiliza `GET /api/health`. O cardápio pode ser consultado publicamente; para criar, editar ou excluir categorias e pratos, entre em **Acesso administrativo** na interface usando `ADMIN_USERNAME` e `ADMIN_PASSWORD` configurados no servidor. O login é feito em `POST /api/auth/login`, retorna um token JWT com validade de 8 horas e limita tentativas de autenticação.

## Testes
- `npm test`: testes automatizados da autenticação administrativa.
- `npm run test:db`: teste de integração CRUD com PostgreSQL; exige `DATABASE_URL` configurada e banco acessível.
- O GitHub Actions executa validação do Prisma, migrações, seed, testes, build do front-end e auditoria de dependências.

## Endpoints
- `POST /api/auth/login` (autenticação administrativa)
- `GET/POST /api/categories`
- `GET/PUT/DELETE /api/categories/:id`
- `GET/POST /api/categories/:categoryId/dishes`
- `GET/PUT/DELETE /api/dishes/:id`

A exclusão de categoria com pratos é bloqueada (HTTP 409). Nomes de categorias são únicos e preços devem ser maiores que zero.

## Publicação
### Banco de dados
Crie um PostgreSQL gerenciado e configure a variável `DATABASE_URL` no serviço da API. Use a URL de conexão fornecida pelo provedor e habilite SSL conforme exigido por ele.

### API
- Diretório raiz do serviço: `server`.
- Comando de build: `npm ci && npx prisma generate && npx prisma migrate deploy`.
- Comando de inicialização: `npm start`.
- Variáveis obrigatórias: `DATABASE_URL`, `CLIENT_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `JWT_SECRET`.
- `PORT` pode ser definido pelo provedor; a aplicação usa a porta disponibilizada no ambiente ou 3333.
- Gere `JWT_SECRET` aleatório com pelo menos 32 caracteres. Não reutilize exemplos e não coloque segredos no GitHub.

Após a primeira publicação da API, teste `GET /api/health`. Execute `npm run seed` uma única vez se quiser carregar os dados demonstrativos do cardápio; esse comando usa upsert para categorias e evita duplicar pratos já existentes.

### Front-end
- Diretório raiz do serviço estático: `client`.
- Comando de build: `npm ci && npm run build`.
- Diretório de publicação: `dist`.
- Variável de build: `VITE_API_URL`, definida como a URL pública da API seguida de `/api`.

Configure `CLIENT_URL` na API com o domínio público do front-end. Se houver mais de uma origem autorizada, separe-as por vírgula.

Antes da entrega, substitua os links de exemplo no relatório pelos endereços reais e faça testes na versão publicada.

## Evidências acadêmicas
O relatório PDF está na pasta principal. Inclua capturas reais das telas e de requisições/respostas após executar e publicar o projeto. Complete nome, matrícula, turma e links antes do envio.
