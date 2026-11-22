# Casa do Sabor

### Cardápio digital, simples e prático.

O **Casa do Sabor** reúne o cardápio em uma experiência digital: os clientes consultam categorias e pratos e podem entrar em contato para fazer seus pedidos pelo WhatsApp. A equipe administrativa gerencia categorias e produtos em uma área protegida por autenticação.

<p align="center">**Acesse o cardápio:** https://casa-do-sabor-web.onrender.com</p>

## Aplicação publicada

- **Cardápio:** https://casa-do-sabor-web.onrender.com
- **API:** https://casa-do-sabor-api-qc80.onrender.com
- **Verificação da API:** https://casa-do-sabor-api-qc80.onrender.com/api/health

> A disponibilidade dos serviços depende do provedor de hospedagem. Em planos gratuitos, o primeiro acesso após um período sem uso pode levar alguns instantes.

## Tecnologias

- **Front-end:** React 19 e Vite 6
- **API:** Node.js 22 e Express 5
- **Banco de dados:** PostgreSQL
- **ORM e migrações:** Prisma 6
- **Validação:** Zod
- **Segurança:** Helmet, CORS configurável, limitação de requisições e autenticação administrativa com JWT
- **Hospedagem:** Render
- **Integração contínua:** GitHub Actions

## Funcionalidades

- Consulta pública do cardápio por categorias e pratos.
- Login para acesso administrativo.
- Cadastro, edição e exclusão de categorias.
- Cadastro, edição e exclusão de pratos.
- Proteção das rotas administrativas por token JWT.
- Validação dos dados recebidos pela API.
- Integração com WhatsApp para contato e pedidos.

**Regras de negócio:** nomes de categorias são únicos, os preços devem ser maiores que zero e a exclusão de uma categoria que ainda possui pratos é bloqueada pela API (HTTP 409).

## Requisitos para execução local

- Node.js 22 ou superior.
- npm.
- PostgreSQL em execução e um banco criado para o projeto.

## Configuração e execução local

### 1. Configurar a API

No terminal, a partir da pasta raiz do repositório:

**Windows (PowerShell):**

```powershell
Copy-Item server/.env.example server/.env
```

**Linux/macOS:**

```bash
cp server/.env.example server/.env
```

Edite `server/.env` e informe os dados do PostgreSQL e credenciais administrativas próprias:

- `DATABASE_URL`: endereço de conexão do banco PostgreSQL.
- `PORT`: porta da API (localmente, o padrão é `3333`).
- `CLIENT_URL`: endereço do front-end local, normalmente `http://localhost:5173`.
- `ADMIN_USERNAME` e `ADMIN_PASSWORD`: usuário e senha administrativos.
- `JWT_SECRET`: segredo aleatório com pelo menos 32 caracteres.

Não publique o arquivo `.env`, senhas ou segredos no GitHub.

Instale as dependências, gere o cliente Prisma, aplique as migrações, carregue os dados demonstrativos e execute os testes:

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

O teste de integração `npm run test:db` exige que o PostgreSQL esteja acessível e que `DATABASE_URL` esteja configurada.

A API ficará disponível em `http://localhost:3333` e o endpoint de saúde em `http://localhost:3333/api/health`.

### 2. Configurar o front-end

Em outro terminal, a partir da pasta raiz:

**Windows (PowerShell):**

```powershell
Copy-Item client/.env.example client/.env
```

**Linux/macOS:**

```bash
cp client/.env.example client/.env
```

O arquivo `client/.env` deve apontar para a API local:

```env
VITE_API_URL=http://localhost:3333/api
```

Instale as dependências e inicie o Vite:

```bash
cd client
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite (normalmente http://localhost:5173).

## Autenticação administrativa

O acesso administrativo é feito pela própria interface do cardápio. As credenciais são definidas no ambiente da API por meio de `ADMIN_USERNAME` e `ADMIN_PASSWORD`; não há credenciais padrão que devam ser publicadas neste repositório.

A autenticação utiliza `POST /api/auth/login`. Em caso de sucesso, a API retorna um token JWT com validade de 8 horas. As rotas de administração exigem esse token.

## Endpoints principais

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Autenticação administrativa |
| GET / POST | `/api/categories` | Listar e criar categorias |
| GET / PUT / DELETE | `/api/categories/:id` | Consultar, editar e excluir categoria |
| GET / POST | `/api/categories/:categoryId/dishes` | Listar e criar pratos de uma categoria |
| GET / PUT / DELETE | `/api/dishes/:id` | Consultar, editar e excluir prato |
| GET | `/api/health` | Verificar a saúde da API |

## Testes e integração contínua

Na API:

- `npm test`: executa testes automatizados de autenticação, rotas HTTP, validação e tratamento de erros.
- `npm run test:db`: executa um teste CRUD diretamente no PostgreSQL.

O workflow do GitHub Actions, em `.github/workflows/ci.yml`, executa no Node.js 22 a validação e geração do Prisma, migrações e seed, verificação de sintaxe JavaScript, testes da API, teste CRUD com PostgreSQL, build do front-end e auditoria das dependências de produção. As quatro vulnerabilidades altas identificadas no relatório atual estão restritas a dependências de desenvolvimento do Prisma 6; não há vulnerabilidades altas ou críticas nas dependências de produção. A correção automática indicada pelo npm exige migração para Prisma 7 (mudança principal), portanto essa atualização deve ser feita separadamente, com validação de compatibilidade, e não aplicada sem testes.

## Publicação no Render

A configuração de infraestrutura está no arquivo `render.yaml`.

### Banco de dados

O Blueprint define um banco PostgreSQL. A variável `DATABASE_URL` da API é vinculada à connection string desse banco.

### API

- **Root Directory:** `server`
- **Build Command:** `npm ci && npx prisma generate && npx prisma migrate deploy && npm run seed`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`

Variáveis de ambiente necessárias:

- `DATABASE_URL`
- `CLIENT_URL` — domínio público do front-end.
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET` — segredo aleatório forte, com pelo menos 32 caracteres.

O Render fornece a variável `PORT`; a aplicação também possui a porta local padrão `3333`. O comando de build aplica as migrações e executa o seed. O seed utiliza operações idempotentes para carregar os dados demonstrativos.

### Front-end

- **Root Directory:** `client`
- **Build Command:** `npm ci && npm run build`
- **Publish Directory:** `dist`
- **Variável de build:** `VITE_API_URL`, com a URL pública da API terminada em `/api`.

O Render está configurado para redirecionar rotas do front-end para `index.html`, permitindo o funcionamento da aplicação.

Após a publicação, verifique o endpoint `/api/health`, abra o cardápio e teste o fluxo administrativo e as operações de cadastro, edição e exclusão.

## Repositório

https://github.com/Lindelaine-maker/CasadoSabor
