# Futebol App — Documentação Única (Backend + Mobile)

Este repositório contém um backend em Express/Prisma/MySQL e um aplicativo mobile em Expo/React Native. Abaixo está a documentação única e clara para instalar, configurar e usar o sistema, incluindo exemplos de `curl` para todas as rotas principais e imagens do app.

## Arquitetura
- Backend Express com Prisma e MySQL, expõe APIs sob `http://<host>:3000/api`.
- App Mobile Expo/React Native consome as APIs.
- CORS configurado no backend para desenvolvimento aberto e origens específicas em produção.

Referências:
- Prefixo de rotas: `backend/src/server.js:17`
- Porta de execução: `backend/src/server.js:19-21`
- Rotas HTTP: `backend/src/routes/routes.js:23-58`
- Modelos Prisma: `backend/prisma/schema.prisma:11-60`
- Base URL Mobile: `mobile/src/services/api.ts:5-7`

## Pré‑requisitos
- Node.js LTS e npm
- MySQL acessível (local ou remoto)
- Expo CLI e Android Studio/Emulador (para rodar o app)

## Instalação e Execução
### Backend
```bash
cd backend
npm install
# Configure o arquivo .env (veja seção Variáveis)
npx prisma generate
npx prisma migrate deploy
npm run dev
# Servidor em http://localhost:3000 (APIs em http://localhost:3000/api)
```

### Mobile
```bash
cd mobile
npm install
# Escolha o ambiente:
npm run use:localhost   # usa mobile/.env.localhost (API local)
# ou
npm run use:device      # usa mobile/.env.device (domínio externo)

npm run start           # abre o Expo dev server
npm run android         # compila/instala no emulador/dispositivo Android
```

## Variáveis de Ambiente
### Backend (`backend/.env`)
Use `backend/.env.production:3-21` como referência:
- `DATABASE_URL`: string de conexão MySQL
- `JWT_SECRET`: segredo do JWT
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- `APP_RESET_URL`: URL da página que consumirá `?token=` para reset de senha
- `RESET_TOKEN_EXP_MINUTES`: validade do token de reset

Nunca versionar segredos. Mantenha `.env` fora do controle de versão.

### Mobile (`mobile/.env*`)
- `API_URL`: base das APIs; lida em `mobile/src/services/api.ts:5-7`
- Alternativas: `expoConfig.extra.apiBaseUrl` ou fallback local.

Para trocar rápido:
```bash
npm run use:localhost  # mobile/.env.localhost
npm run use:device     # mobile/.env.device
```

## Modelos de Dados (Prisma)
- `Admin`: `id,name,email,password,resetToken,resetTokenExpiresAt,createdAt` (`backend/prisma/schema.prisma:11-19`)
- `Jogador`: `id,nome,telefone,tipo,valorBase,pagamentos` (`backend/prisma/schema.prisma:23-30`)
- `Pagamento`: `id,jogadorId,valor,mes,ano,dia,pago,createdAt,updatedAt` (`backend/prisma/schema.prisma:32-44`)
- `Despesa`: `id,descricao,valor,mes,ano,createdAt` (`backend/prisma/schema.prisma:53-60`)

Tipos: `TipoJogador = MENSALISTA | AVULSO` (`backend/prisma/schema.prisma:47-50`).

## Autenticação
- `POST /admin/login` retorna `token` (JWT) (`backend/src/controllers/adminController.js:61-67`).
- Endpoints que exigem token: alterar senha do admin (`/admin/alterar-senha`).
- No mobile, chamadas autenticadas adicionam `Authorization: Bearer <token>` (`mobile/src/services/api.ts:45-52`).

## Endpoints e Exemplos `curl`
Base: `http://localhost:3000/api`

<!-- routes:auto:start -->
### Rotas (geradas automaticamente)
- POST /admin/alterar-senha
- POST /admin/login
- POST /admin/registrar
- POST /churrasco/despesa
- DELETE /churrasco/despesa/:id
- PUT /churrasco/despesa/:id
- GET /churrasco/resumo
- GET /jogadores
- POST /jogadores
- DELETE /jogadores/:id
- PUT /jogadores/:id
- GET /pagamentos
- PUT /pagamentos
- POST /pagamentos/:id
- PUT /pagamentos/:id
- DELETE /pagamentos/:jogadorId/mes/:mes/dia/:dia
<!-- routes:auto:end -->


### Admin
Registrar
```bash
curl -X POST http://localhost:3000/api/admin/registrar \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@exemplo.com","password":"SenhaForte123"}'
```

Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","password":"SenhaForte123"}'
```
Resposta: `{ "mensagem": "...", "token": "..." }`

Esqueci a senha
```bash
curl -X POST http://localhost:3000/api/admin/esqueci-senha \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com"}'
```

Alterar senha (requer token)
```bash
TOKEN="<jwt>"
curl -X POST http://localhost:3000/api/admin/alterar-senha \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"SenhaForte123","newPassword":"NovaSenha456"}'
```

Resetar senha (via token enviado por e‑mail)
```bash
curl -X POST http://localhost:3000/api/admin/resetar-senha \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-email>","newPassword":"NovaSenha456"}'
```

### Jogadores
Criar
```bash
curl -X POST http://localhost:3000/api/jogadores \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","telefone":"(11)99999-0000","tipo":"MENSALISTA"}'
```

Listar
```bash
curl http://localhost:3000/api/jogadores
```

Atualizar
```bash
curl -X PUT http://localhost:3000/api/jogadores/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","tipo":"AVULSO"}'
```

Deletar
```bash
curl -X DELETE http://localhost:3000/api/jogadores/1
```

### Pagamentos
Listar todos
```bash
curl http://localhost:3000/api/pagamentos
```

Acrescentar pagamento (soma valor ao mês atual e avalia quitação)
```bash
curl -X PUT http://localhost:3000/api/pagamentos \
  -H "Content-Type: application/json" \
  -d '{"jogadorId":1,"valor":40}'
```
Regras de quitação: mensalista `>= 40`, avulso `>= 60` (`backend/src/controllers/pagamentoController.js:65-68`).

Atualizar um pagamento específico (valor e/ou status `pago`)
```bash
curl -X PUT http://localhost:3000/api/pagamentos/123 \
  -H "Content-Type: application/json" \
  -d '{"valor":20,"pago":true}'
```
Quando `pago=true`, a data é atualizada para o dia atual (`backend/src/controllers/pagamentoController.js:171-177`).

Registrar pagamento inicial (valor 0)
```bash
# OBS: a rota é POST /pagamentos/:id, mas o controller espera body com jogadorId
curl -X POST http://localhost:3000/api/pagamentos/0 \
  -H "Content-Type: application/json" \
  -d '{"jogadorId":1}'
```

Deletar pagamentos de um jogador por mês (e opcionalmente dia/valor)
```bash
curl -X DELETE http://localhost:3000/api/pagamentos/1/mes/11/dia/15
# Query opcional "valor" via body: backend aceita valor em req.body e filtra (`backend/src/controllers/pagamentoController.js:118-131`).
```

### Churrasco
Resumo do mês atual
```bash
curl http://localhost:3000/api/churrasco/resumo 
```

Registrar despesa
```bash
curl -X POST http://localhost:3000/api/churrasco/despesa \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Carne","valor":200}'
```

Atualizar despesa
```bash
curl -X PUT http://localhost:3000/api/churrasco/despesa/5 \
  -H "Content-Type: application/json" \
  -d '{"valor":250}'
```

Deletar despesa
```bash
curl -X DELETE http://localhost:3000/api/churrasco/despesa/5
```

## App Mobile
- Base das requisições definida em `mobile/src/services/api.ts:5-7`.
- Telas principais em `mobile/src/screens/*`.
- Tela de pagamentos traz busca, registro e relatório por mês com memoização: `mobile/src/screens/PagamentosScreen.tsx:73-96`.
- Edição de pagamento chama `PUT /pagamentos/:id` e alterna `pago`: `mobile/src/screens/PagamentosScreen.tsx:239-299`.

## Scripts Úteis
### Backend (`backend/package.json:6-9`)
- `npm run dev`: desenvolvimento com nodemon
- `npm run start`: produção

### Mobile (`mobile/package.json:5-12`)
- `npm run start`: Expo dev server
- `npm run android`: compilar/instalar Android
- `npm run use:localhost`: copiar `.env.localhost` para `.env`
- `npm run use:device`: copiar `.env.device` para `.env`

## CORS e Rede
- Desenvolvimento: aceita qualquer origem (`backend/src/server.js:8-14`).
- Produção: origens permitidas configuradas; ajuste conforme seu domínio.
- Porta fixa `3000`; atualize `API_URL` no mobile se mudar.

## Imagens do App
As imagens abaixo são ilustrativas; substitua por screenshots reais conforme necessário.

![Ícone do App](mobile/assets/icon.png)

![Splash](mobile/assets/splash-icon.png)

## Solução de Problemas
- Erros de conexão: verifique `API_URL` no mobile e se o backend está na mesma rede (para dispositivo físico, use IP da máquina).
- JWT inválido: renove via login; confirme `JWT_SECRET` igual entre ambientes.
- SMTP: teste credenciais e portas; verifique `APP_RESET_URL` apontando para sua página de reset.

## Boas Práticas
- Nunca versionar `.env` com segredos.
- Manter controllers coesos e serviços no mobile tipados (`mobile/src/services/api.ts`).
- Usar `updatedAt` do Prisma para auditoria em `Pagamento` (`backend/prisma/schema prisma:41`).

-Para rodar em  outra rede WIFI comando: npm run web:lan