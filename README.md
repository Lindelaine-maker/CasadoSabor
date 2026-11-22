# Casa do Sabor

**Cardápio digital para consulta pública e gestão administrativa de categorias e pratos.**

[**Acessar o cardápio**](https://casa-do-sabor-web.onrender.com) · [API](https://casa-do-sabor-api-qc80.onrender.com) · [Saúde da API](https://casa-do-sabor-api-qc80.onrender.com/api/health)

O Casa do Sabor permite que clientes consultem o cardápio e entrem em contato pelo WhatsApp. A equipe administra categorias e pratos por uma interface protegida por autenticação.

> A aplicação está publicada no Render. Serviços em planos gratuitos podem apresentar demora no primeiro acesso após períodos de inatividade.

## Documentação

- [Arquitetura e estrutura](docs/ARCHITECTURE.md)
- [Referência da API](docs/API.md)
- [Instalação e publicação](docs/DEPLOYMENT.md)
- [Operação, testes e manutenção](docs/OPERATIONS.md)
- [Relatório técnico](docs/RELATORIO_TECNICO.md)

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | React 19, Vite 6 |
| API | Node.js 22, Express 5 |
| Persistência | PostgreSQL |
| ORM e migrações | Prisma 6 |
| Validação | Zod |
| Segurança | Helmet, CORS, express-rate-limit, JWT |
| Hospedagem | Render |
| CI | GitHub Actions |

## Funcionalidades

- Consulta pública de categorias e pratos.
- Autenticação administrativa.
- Cadastro, edição e exclusão de categorias.
- Cadastro, edição e exclusão de pratos.
- Rotas administrativas protegidas por JWT.
- Validação de entrada e tratamento padronizado de erros.
- Link de contato/pedido via WhatsApp.

### Regras de negócio

- O nome da categoria é obrigatório, tem entre 2 e 60 caracteres e é único.
- O nome do prato é obrigatório e tem entre 2 e 80 caracteres.
- A descrição do prato é opcional e aceita até 240 caracteres.
- O preço deve ser numérico, finito e maior que zero.
- Um prato pertence a uma categoria.
- Não é permitido excluir uma categoria que ainda tenha pratos vinculados (HTTP 409).

## Requisitos

- Node.js 22 ou superior.
- npm.
- PostgreSQL acessível.
- Git.

## Execução local

### 1. API

Na raiz do repositório, crie o arquivo de ambiente:

**PowerShell**
```powershell
Copy-Item server/.env.example server/.env
```

**Linux/macOS**
```bash
cp server/.env.example server/.env
```

Edite `server/.env`:

- `DATABASE_URL`: URL de conexão PostgreSQL.
- `PORT`: porta HTTP (padrão local: `3333`).
- `CLIENT_URL`: origem do front-end; múltiplas origens podem ser separadas por vírgula.
- `ADMIN_USERNAME` e `ADMIN_PASSWORD`: credenciais administrativas.
- `JWT_SECRET`: segredo aleatório com pelo menos 32 caracteres.

Instale e prepare a API:

```bash
cd server
npm ci
npx prisma generate
npx prisma migrate dev
npm run seed
npm test
npm run test:db
npm run dev
```

O comando `npm run test:db` precisa de um PostgreSQL disponível e configurado em `DATABASE_URL`. A API local inicia, por padrão, em `http://localhost:3333`.

### 2. Front-end

Em outro terminal, crie `client/.env`:

**PowerShell**
```powershell
Copy-Item client/.env.example client/.env
```

**Linux/macOS**
```bash
cp client/.env.example client/.env
```

Confirme que contém:

```env
VITE_API_URL=http://localhost:3333/api
```

Instale e inicie:

```bash
cd client
npm ci
npm run dev
```

Acesse o endereço informado pelo Vite (normalmente `http://localhost:5173`).

## Autenticação

A autenticação é feita por `POST /api/auth/login`. As credenciais são configuradas exclusivamente no ambiente da API. Em caso de sucesso, a API retorna um JWT com validade de 8 horas. As operações administrativas exigem `Authorization: Bearer <token>`.

Não existem credenciais padrão para publicar. Nunca versione arquivos `.env`, senhas, tokens ou segredos.

## Testes e integração contínua

Na pasta `server`:

- `npm test`: testes automatizados de autenticação, rotas HTTP, validação e tratamento de erros.
- `npm run test:db`: teste CRUD de fumaça com PostgreSQL.

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) utiliza Node.js 22 e PostgreSQL 16 para validar o schema Prisma, gerar o cliente, aplicar migrações e seed, verificar sintaxe, executar testes da API, executar o teste CRUD, compilar o front-end e auditar dependências de produção.

Na última validação documental, a execução **CI #114 — Success** foi concluída no commit `6f8dfa2463a3d1fa5037d4013060795666b4794e`. Consulte a aba Actions para o estado atual.

## Publicação

A infraestrutura é descrita em [`render.yaml`](render.yaml). O arquivo define o PostgreSQL, a API e o front-end estático.

- API: raiz `server`; build `npm ci && npx prisma generate && npx prisma migrate deploy && npm run seed`; start `npm start`; health check `/api/health`.
- Front-end: raiz `client`; build `npm ci && npm run build`; publicação de `dist`; variável `VITE_API_URL` apontando para a API com sufixo `/api`.
- Segredos administrativos devem ser cadastrados manualmente no painel do Render.

Consulte [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) antes de publicar ou alterar os serviços.

## Segurança e limitações conhecidas

- A API aplica Helmet, CORS configurável, limite de corpo JSON de 20 KB e rate limiting.
- O login limita tentativas por IP e o JWT utiliza algoritmo HS256, emissor/audiência e expiração.
- A auditoria registrada não apontou vulnerabilidades altas ou críticas nas dependências de produção. Foram observados alertas altos em dependências de desenvolvimento do ecossistema Prisma 6; uma atualização principal para Prisma 7 exige planejamento e testes de migração.
- A persistência após reinício no ambiente Render e a configuração final dos segredos devem ser verificadas operacionalmente no painel/ambiente. Não considerar essas verificações concluídas apenas com o CI.

## Repositório

https://github.com/Lindelaine-maker/CasadoSabor
