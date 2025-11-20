## Objetivo
- Entregar um APK/AAB instalável que roda sem precisar do computador ligado.

## Pré‑requisito crítico (backend acessível)
- O app hoje aponta para `http://192.168.100.74:3000/api` (rede local). Quando o PC desliga, o backend fica indisponível.
- Ação: publicar o backend em um domínio público (HTTPS) e atualizar o `BASE_URL` do mobile para esse domínio.
- Opções de deploy: Railway, Render, Fly.io ou VPS; configurar CORS para o domínio do app.

## Caminho rápido (APK de teste)
- Atualizar `BASE_URL` no mobile para o novo domínio público.
- Rodar build na nuvem (perfil `preview`) para gerar um APK instalável.
- Entregar link do APK, instalar no celular ativando “Apps de fontes desconhecidas”.

## Produção (AAB para Play Store)
- Usar perfil `production` para gerar AAB com assinatura.
- Preparar listing no Play Console e subir o AAB.
- Garantir `https` no `BASE_URL`, políticas de rede e ícones/splash adequados.

## Passos técnicos
1) Deploy do backend
- Subir `backend` para um serviço público com `https` e banco acessível.
- Configurar CORS aceitando o app.

2) Atualizar mobile
- Trocar `BASE_URL` para o novo domínio.
- Manter `usesCleartextTraffic` desativado em produção (usar apenas `https`).

3) Build EAS
- APK: `eas build -p android --profile preview`.
- AAB: `eas build -p android --profile production`.
- Baixar artefatos da build e validar login/fluxos no celular.

4) Instalação e validação
- Instalar APK no Android, testar login, listagens e navegação.
- Coletar logs de erro em caso de falhas de rede.

## Entregáveis
- APK para instalação direta no celular.
- AAB pronto para publicação (opcional).
- Domínio público do backend e `BASE_URL` atualizado.

## O que farei após sua confirmação
- Publicar o backend (ou usar o seu host se já tiver).
- Atualizar `BASE_URL` no mobile.
- Executar EAS build (`preview` e/ou `production`).
- Entregar o link do APK/AAB e instruções de instalação/publicação.