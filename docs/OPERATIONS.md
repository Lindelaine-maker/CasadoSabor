# Operação, testes e manutenção

## Comandos úteis

Na pasta `server`:

| Comando | Finalidade |
|---|---|
| `npm ci` | Instala dependências conforme lockfile |
| `npx prisma validate` | Valida schema Prisma |
| `npx prisma generate` | Gera o Prisma Client |
| `npx prisma migrate dev` | Cria/aplica migrações em desenvolvimento |
| `npx prisma migrate deploy` | Aplica migrações pendentes em ambiente de deploy |
| `npm run seed` | Insere dados demonstrativos |
| `npm test` | Executa testes automatizados da API |
| `npm run test:db` | Executa teste CRUD com PostgreSQL |
| `npm run dev` | Inicia API em modo desenvolvimento |
| `npm start` | Inicia API |

Na pasta `client`:

| Comando | Finalidade |
|---|---|
| `npm ci` | Instala dependências |
| `npm run build` | Gera build de produção |
| `npm run dev` | Inicia servidor Vite de desenvolvimento |
| `npm run preview` | Serve localmente o build |

## Pipeline CI

O workflow `.github/workflows/ci.yml` é executado em push para `main` e branches `entrega/**`, pull requests para `main` e execução manual. Usa Node.js 22 e PostgreSQL 16 e executa:

1. Instalação limpa das dependências da API.
2. Validação e geração Prisma, migrações e seed.
3. Verificação de sintaxe JavaScript.
4. Testes automatizados da API.
5. Teste CRUD contra PostgreSQL.
6. Instalação e build do front-end.
7. Auditoria de dependências de produção e publicação do relatório como artefato.

Um CI verde confirma as etapas automatizadas no ambiente do workflow. Não comprova, isoladamente, o estado dos serviços Render, a configuração de segredos, a persistência após reinício ou o funcionamento de integrações externas.

## Checklist de verificação após deploy

- [ ] O site público abre.
- [ ] Categorias e pratos são carregados.
- [ ] O login administrativo funciona.
- [ ] Criar e editar categoria.
- [ ] Criar e editar prato.
- [ ] Excluir prato.
- [ ] Confirmar bloqueio ao excluir categoria com pratos (HTTP 409).
- [ ] Confirmar o destino do link WhatsApp com o responsável pelo estabelecimento.
- [ ] `/api/health` responde com status `ok`.
- [ ] Conferir variáveis de ambiente no painel Render sem expor seus valores.
- [ ] Confirmar persistência após reinicialização usando registro de teste e procedimento seguro.

## Banco e dados

- As migrações estão em `server/prisma/migrations`.
- O schema atual define Category e Dish.
- A exclusão de categoria com pratos é restringida pela relação no banco e pela regra da API.
- O seed cria categorias demonstrativas e insere pratos de exemplo ausentes.
- Seed não substitui backup. Não execute operações destrutivas para testar persistência.

Antes de mudanças de schema ou migração:
1. Identifique impacto e compatibilidade.
2. Faça backup conforme recursos disponíveis no provedor.
3. Teste migração e rollback em ambiente não produtivo.
4. Aplique em janela controlada e monitore logs.

## Segurança

- Nunca commite `.env`, credenciais, tokens ou connection strings.
- Use credenciais administrativas únicas e fortes.
- Mantenha `JWT_SECRET` aleatório, privado e com pelo menos 32 caracteres.
- Restrinja `CLIENT_URL` às origens legítimas.
- Não compartilhe logs contendo dados sensíveis.
- Atualize dependências em alterações separadas, rodando CI após cada atualização.
- Prisma 7 é uma atualização principal em relação ao Prisma 6; não aplicar atualização automática sem revisar migrações, configuração e compatibilidade.

## Estado conhecido na preparação desta documentação

- O cardápio público foi informado como abrindo normalmente.
- O endpoint de saúde retornou `{"status":"ok","service":"Casa do Sabor API"}`.
- O usuário confirmou que o login administrativo está funcionando.
- O último CI registrado durante a revisão foi o #107, com conclusão Success, no commit `143aa1969cbceb7ef582a675084052f08becf7fd`.
- A confirmação de persistência após reinício no Render e a conferência do número de WhatsApp devem ser registradas somente depois de testes operacionais específicos.

Este estado é um registro da revisão de documentação; consulte GitHub Actions e Render para o estado atual.
