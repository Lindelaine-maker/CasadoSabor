# Relatório técnico — Casa do Sabor

**Projeto:** Sistema Web de Cardápio Digital  
**Repositório:** https://github.com/Lindelaine-maker/CasadoSabor  
**Cardápio publicado:** https://casa-do-sabor-web.onrender.com  
**API publicada:** https://casa-do-sabor-api-qc80.onrender.com  
**Health check:** https://casa-do-sabor-api-qc80.onrender.com/api/health  
**Data da revisão:** 22/11/2026

## 1. Objetivo

Registrar a avaliação técnica do Casa do Sabor após a implementação, correções de integração, execução da suíte automatizada e validação funcional informada do ambiente publicado. Este documento é voltado à manutenção do software e complementa as instruções de arquitetura, API, implantação e operação.

## 2. Resumo executivo

O Casa do Sabor é uma aplicação web de cardápio digital com consulta pública e gerenciamento administrativo de categorias e pratos. A solução utiliza React/Vite no cliente, API Node.js/Express, PostgreSQL e Prisma.

Na revisão, foram identificados e corrigidos pontos de integração da API, tratamento de erros e cobertura de testes. A integração contínua registrada no repositório executou validação do Prisma, testes de API, teste CRUD com PostgreSQL, build do cliente e auditoria de dependências de produção.

O usuário confirmou que o cardápio abre normalmente, que o endpoint de saúde responde corretamente e que o login administrativo funciona.

## 3. Arquitetura e tecnologias

| Camada | Implementação |
|---|---|
| Interface | React 19 e Vite 6 |
| API | Node.js 22 e Express 5 |
| Banco de dados | PostgreSQL |
| ORM/migrações | Prisma 6 |
| Validação | Zod |
| Autenticação | JWT HS256 |
| Proteção HTTP | Helmet, CORS e express-rate-limit |
| Hospedagem | Render |
| Integração contínua | GitHub Actions |

A aplicação é dividida em cliente web, serviço de API e banco relacional. A interface consome os endpoints REST da API. As operações de escrita exigem autenticação administrativa.

## 4. Funcionalidades e regras de negócio

- Consulta pública das categorias e dos pratos.
- Login administrativo.
- Criação, consulta, edição e exclusão de categorias.
- Criação, consulta, edição e exclusão de pratos.
- Validação dos dados recebidos pela API.
- Restrição de exclusão de categoria que ainda possua pratos associados.
- Contato por link do WhatsApp na interface.

### Integridade dos dados

- Nome de categoria obrigatório, entre 2 e 60 caracteres e único.
- Nome de prato obrigatório, entre 2 e 80 caracteres.
- Descrição opcional, com até 240 caracteres.
- Preço numérico, finito e maior que zero.
- Cada prato pertence a uma categoria.
- A exclusão de categoria com pratos vinculados é bloqueada pela regra da API e pela restrição referencial do banco, retornando conflito HTTP 409.

## 5. Segurança e tratamento de erros

A API utiliza Helmet, CORS configurável, limite de corpo JSON de 20 KB e rate limiting. O login tem limite específico de tentativas. A autenticação utiliza JWT assinado com HS256, expiração de oito horas, issuer e audience. As rotas administrativas exigem token válido com papel de administrador.

O middleware central trata erros de JSON malformado, payload acima do limite, falhas de validação e erros conhecidos do Prisma, incluindo conflitos de unicidade e integridade referencial, registro não encontrado e erros não previstos.

As credenciais administrativas e o segredo JWT são configurados no ambiente do serviço. Não devem ser incluídos no repositório.

## 6. Testes e evidências técnicas

A suíte do servidor inclui testes de autenticação, rotas HTTP, operações de categorias e pratos, validação de dados, restrições de integridade e tratamento de erros. Há também teste CRUD de fumaça executado contra PostgreSQL.

O workflow de CI cobre:
1. Instalação limpa das dependências.
2. Validação do schema e geração do Prisma Client.
3. Aplicação de migrações e seed no banco de teste.
4. Verificação de sintaxe e testes da API.
5. Teste CRUD com PostgreSQL.
6. Build de produção do front-end.
7. Auditoria das dependências de produção.

**Última evidência de CI registrada na revisão anterior:** execução #107, conclusão Success, commit `143aa1969cbceb7ef582a675084052f08becf7fd`.

A revisão documental posterior iniciou a execução #112, commit `d81076918d647fb2927adf3677a804939c4aaeaf`; o estado deve ser conferido em [GitHub Actions](https://github.com/Lindelaine-maker/CasadoSabor/actions).

## 7. Validação do ambiente publicado

Conforme confirmação do usuário durante a validação:

- O cardápio público abre normalmente.
- O endpoint `/api/health` respondeu:
  
  ```json
  {
    "status": "ok",
    "service": "Casa do Sabor API"
  }
  ```

- O login administrativo funciona.

Os testes automatizados de CRUD e integridade foram aprovados no CI. A aprovação desses testes não deve ser confundida com execução manual de cada operação em produção.

## 8. Achados e recomendações

### 8.1 Dependências

A auditoria registrada não apontou vulnerabilidades altas ou críticas nas dependências de produção. Foram observados quatro alertas altos associados ao ecossistema de dependências de desenvolvimento do Prisma 6. A correção sugerida envolve atualização principal para Prisma 7.

**Recomendação:** não executar atualização principal automaticamente. Planejar a migração em branch própria, revisar configuração e migrações, executar testes com PostgreSQL e somente então publicar.

### 8.2 Persistência e operação

A aplicação utiliza PostgreSQL e possui migrações versionadas. O teste CRUD no CI comprova operações contra o banco de teste, mas não substitui um teste de persistência após reinicialização do banco/serviço de produção.

**Recomendação:** realizar teste controlado no Render, usando registro identificável de teste, verificar a permanência após reinicialização e remover o registro de teste ao final, sem executar operações destrutivas.

### 8.3 Configuração de produção

Os valores secretos não são auditáveis pelo código do repositório. Devem ser conferidos no painel Render, sem compartilhar valores: `DATABASE_URL`, `CLIENT_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET` e `VITE_API_URL`.

### 8.4 WhatsApp

O cliente contém um link `wa.me` configurado no código. O número de destino deve ser confirmado pelo responsável pelo estabelecimento antes de considerar a integração comercial validada.

## 9. Conclusão

O projeto possui arquitetura separada entre interface, API e persistência relacional, regras de negócio implementadas, autenticação administrativa, tratamento centralizado de erros e testes automatizados. As correções e a suíte de integração contínua aumentaram a confiabilidade da solução.

O ambiente publicado foi confirmado pelo usuário como acessível, com health check válido e login administrativo funcional. Permanecem como recomendações de operação a confirmação do contato WhatsApp, a conferência das variáveis no painel Render e o teste específico de persistência após reinicialização em produção.

## 10. Documentação complementar

- [README](../README.md)
- [Arquitetura](ARCHITECTURE.md)
- [Referência da API](API.md)
- [Instalação e publicação](DEPLOYMENT.md)
- [Operação e manutenção](OPERATIONS.md)
