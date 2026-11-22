# Instalação e publicação

## Pré-requisitos

- Node.js 22 ou superior e npm.
- PostgreSQL.
- Acesso ao repositório GitHub e ao painel Render para publicação.

## Ambiente local

### API

1. Copie `server/.env.example` para `server/.env`.
2. Configure `DATABASE_URL`, `PORT`, `CLIENT_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `JWT_SECRET`.
3. Use um segredo JWT aleatório com no mínimo 32 caracteres.
4. Execute:

```bash
cd server
npm ci
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

### Front-end

1. Copie `client/.env.example` para `client/.env`.
2. Configure `VITE_API_URL=http://localhost:3333/api`.
3. Execute:

```bash
cd client
npm ci
npm run dev
```

## Render Blueprint

O arquivo `render.yaml` descreve três recursos: banco PostgreSQL, serviço web da API e site estático.

### Banco PostgreSQL

O Blueprint define o banco `casa-do-sabor-db`, plano free, região Singapore, database `casa_do_sabor_db`. Confirme no painel Render o estado, plano, região, limites e política de retenção vigentes antes de depender dele em produção.

### API

- Serviço: `casa-do-sabor-api`
- Root directory: `server`
- Build: `npm ci && npx prisma generate && npx prisma migrate deploy && npm run seed`
- Start: `npm start`
- Health check: `/api/health`

Variáveis:
- `DATABASE_URL`: connection string vinculada ao banco Render pelo Blueprint.
- `CLIENT_URL`: origem pública do front-end.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`: preencher como segredos/variáveis privadas no painel.

### Front-end

- Serviço: `casa-do-sabor-web`
- Root directory: `client`
- Build: `npm ci && npm run build`
- Publish directory: `dist`
- `VITE_API_URL`: URL pública da API acrescida de `/api`.
- Rewrite SPA: `/*` para `/index.html`.

## Procedimento seguro de publicação

1. Revise alterações e rode os testes localmente.
2. Faça commit e push para a branch configurada.
3. Aguarde o workflow CI terminar com sucesso.
4. Confirme que o Render concluiu os deploys dos serviços.
5. Verifique `/api/health`.
6. Abra o cardápio e valide carregamento de categorias/pratos.
7. Faça login e teste operações administrativas com registros de teste.
8. Verifique os logs dos serviços e a conectividade com o banco.

O build da API executa migrações e o seed. Planeje alterações de schema com backup e compatibilidade entre versões da aplicação.

## URLs publicadas

- Cardápio: https://casa-do-sabor-web.onrender.com
- API: https://casa-do-sabor-api-qc80.onrender.com
- Saúde: https://casa-do-sabor-api-qc80.onrender.com/api/health

## Rollback

Se um deploy causar falha, interrompa novas alterações, consulte os logs e identifique o último deploy estável no Render. Reverter o código não reverte automaticamente alterações destrutivas no banco. Restauração de banco deve seguir o procedimento de backup/restore disponível no plano e serviço efetivamente contratados.
