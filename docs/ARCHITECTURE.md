# Arquitetura do Casa do Sabor

## Visão geral

A solução é dividida em duas aplicações implantadas separadamente e um banco PostgreSQL:

1. **Cliente web:** aplicação React compilada pelo Vite e servida como site estático.
2. **API:** serviço Node.js/Express que expõe endpoints REST, valida entradas, aplica autenticação e acessa os dados pelo Prisma.
3. **Banco:** PostgreSQL, com schema e histórico de migrações versionados em `server/prisma`.

O navegador chama a API usando a URL definida em `VITE_API_URL`. A API permite a origem configurada em `CLIENT_URL`.

## Estrutura relevante

```text
.
├── client/                 # Aplicação React + Vite
│   ├── src/
│   └── .env.example
├── server/                 # API Express
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── routes/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── middleware.js
│   │   └── validators.js
│   ├── test/
│   └── .env.example
├── docs/
├── .github/workflows/ci.yml
└── render.yaml
```

## Modelo de dados

### Category

| Campo | Tipo | Regra |
|---|---|---|
| id | String | Chave primária, CUID |
| name | String | Único |
| createdAt / updatedAt | DateTime | Controle de criação/alteração |

Uma categoria possui vários pratos.

### Dish

| Campo | Tipo | Regra |
|---|---|---|
| id | String | Chave primária, CUID |
| name | String | Obrigatório |
| description | String? | Opcional |
| price | Decimal(10,2) | Maior que zero na validação da API |
| available | Boolean | Padrão true |
| categoryId | String | Chave estrangeira obrigatória |
| createdAt / updatedAt | DateTime | Controle de criação/alteração |

A relação utiliza `onDelete: Restrict`: o banco impede remover uma categoria que ainda tenha pratos associados. A API também verifica essa condição e responde HTTP 409.

## Fluxo de autenticação

1. O administrador envia usuário e senha para `POST /api/auth/login`.
2. A API compara as credenciais com `ADMIN_USERNAME` e `ADMIN_PASSWORD`.
3. Se válidas, emite JWT HS256 com papel `admin`, validade de 8 horas, issuer e audience definidos.
4. O cliente envia o token no cabeçalho `Authorization: Bearer <token>` para operações protegidas.
5. O middleware valida assinatura, validade, issuer, audience e papel.

As credenciais e o segredo JWT são variáveis de ambiente e não fazem parte do código versionado.

## Segurança transversal

- Helmet para cabeçalhos HTTP.
- CORS restrito às origens configuradas.
- JSON limitado a 20 KB.
- Rate limit geral da API e limite específico para login.
- Zod para validar payloads.
- Middleware central de 404 e tratamento de erros.
- Consultas e operações de persistência realizadas via Prisma.

## Decisões e limites

- O front-end é estático; a lógica de negócio e o acesso ao banco ficam na API.
- As migrações Prisma são a fonte versionada da estrutura do banco.
- O seed utiliza upsert para categorias de demonstração e evita duplicar pratos de exemplo já existentes; não é um mecanismo de backup.
- Não documentar nem compartilhar valores reais de segredos.
