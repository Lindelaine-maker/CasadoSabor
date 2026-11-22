# Referência da API

**Base URL local:** `http://localhost:3333/api`  
**Base URL publicada:** `https://casa-do-sabor-api-qc80.onrender.com/api`

As respostas são JSON, salvo operações de exclusão bem-sucedidas, que retornam HTTP 204 sem corpo.

## Autenticação

### POST /auth/login

Autentica o administrador.

**Corpo**
```json
{
  "username": "usuario-administrativo",
  "password": "senha-configurada-no-servidor"
}
```

**Sucesso — HTTP 200**
```json
{
  "token": "<jwt>",
  "expiresIn": 28800
}
```

O token deve ser enviado nas rotas protegidas:

```http
Authorization: Bearer <jwt>
```

Credenciais ausentes ou segredo JWT com menos de 32 caracteres causam HTTP 503. Credenciais inválidas causam HTTP 401. Payload inválido causa HTTP 400. O limite de login é de 10 tentativas por janela de 15 minutos.

## Saúde

### GET /health

Retorna o estado básico do processo da API.

**HTTP 200**
```json
{
  "status": "ok",
  "service": "Casa do Sabor API"
}
```

Esse endpoint verifica a resposta da aplicação; não substitui uma verificação completa de integridade do banco.

## Categorias

| Método | Rota | Acesso | Resultado |
|---|---|---|---|
| GET | `/categories` | Público | Lista categorias em ordem alfabética e contagem de pratos |
| POST | `/categories` | Admin | Cria categoria |
| GET | `/categories/:id` | Público | Consulta categoria com pratos |
| PUT | `/categories/:id` | Admin | Atualiza categoria |
| DELETE | `/categories/:id` | Admin | Exclui categoria sem pratos |
| GET | `/categories/:categoryId/dishes` | Público | Lista pratos da categoria |
| POST | `/categories/:categoryId/dishes` | Admin | Cria prato na categoria |

**Criar/editar categoria**
```json
{ "name": "Pratos feitos" }
```

O nome é aparado (trim), obrigatório, de 2 a 60 caracteres e único. Nome duplicado resulta em HTTP 409.

## Pratos

| Método | Rota | Acesso | Resultado |
|---|---|---|---|
| PUT | `/dishes/:id` | Admin | Atualiza prato |
| DELETE | `/dishes/:id` | Admin | Exclui prato |

**Criar/editar prato**
```json
{
  "name": "Frango grelhado",
  "description": "Acompanhamentos da casa",
  "price": 22.90,
  "available": true
}
```

A criação é feita por `POST /categories/:categoryId/dishes`. O nome tem de 2 a 80 caracteres; descrição é opcional e tem até 240 caracteres; preço deve ser numérico, finito e maior que zero; `available` é booleano e, se omitido, assume `true`.

## Códigos HTTP relevantes

| Código | Significado |
|---|---|
| 200 | Consulta, atualização ou login concluído |
| 201 | Registro criado |
| 204 | Exclusão concluída |
| 400 | JSON ou dados inválidos |
| 401 | Credencial/token inválido ou ausente |
| 404 | Rota ou registro não encontrado |
| 409 | Conflito de unicidade ou regra de exclusão |
| 413 | Corpo da requisição excede 20 KB |
| 429 | Limite de requisições excedido |
| 500 | Erro interno não tratado |
| 503 | Login administrativo sem configuração |

Erros da API retornam objeto JSON com a propriedade `message`. Erros de validação Zod também podem incluir `errors`, com campo e mensagem.

## Exemplo de chamada autenticada

```bash
curl -X POST "http://localhost:3333/api/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"name":"Lanches"}'
```

Use credenciais e tokens de teste apenas em ambiente controlado. Não os inclua em commits, documentação pública ou logs.
