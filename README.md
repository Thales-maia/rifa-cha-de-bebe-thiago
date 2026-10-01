# Rifa Chá de Bebê do Thiago — V3 animada

## O que foi renovado na V3
- interface premium e responsiva;
- hero com destaque do prêmio;
- seleção de números em grade;
- barra de checkout fixa;
- checkout em etapas;
- QR Code Pix dinâmico;
- Pix copia e cola;
- confirmação automática via webhook;
- estatísticas públicas;
- seção explicando o funcionamento;
- visual pensado para compartilhamento pelo WhatsApp.

## Backend
`backend/main.py` usa FastAPI + Firestore + Asaas.

Copie `backend/.env.example` para `.env` e configure:
- `ASAAS_URL=https://api-sandbox.asaas.com/v3` para testes;
- `ASAAS_API_KEY`;
- `ASAAS_WEBHOOK_TOKEN`;
- `FIREBASE_PROJECT_ID`;
- `ALLOWED_ORIGINS`.

Instale:
`pip install -r backend/requirements.txt`

Execute:
`uvicorn main:app --host 0.0.0.0 --port 8000`

Configure no Asaas o webhook:
`https://SEU_BACKEND/api/webhooks/asaas`

O frontend usa `API_BASE=""` quando frontend e backend estão no mesmo domínio. Se estiverem separados, altere no começo de `app.js`.

## Segurança
A API Key do Asaas fica somente no backend. O Firestore não deve aceitar gravações diretamente do navegador; o backend é a camada que cria reservas e processa o webhook.

## Observação legal
Antes de cobrar por participação ou divulgar a rifa, verifique as regras brasileiras aplicáveis a rifas/sorteios e eventual necessidade de autorização.

### Animações V3
- entrada suave dos blocos;
- cartão do prêmio flutuante;
- microinterações nos números;
- barra de seleção com destaque;
- QR Code com efeito de foco;
- partículas/confetes na confirmação do Pix;
- elementos decorativos flutuantes;
- contador regressivo para o sorteio;
- suporte a `prefers-reduced-motion`.


### Tema visual V4
A versão V4 usa o tema Safari em tons creme, verde e madeira, mantendo as animações e a estrutura de participação/Pix da V3.
