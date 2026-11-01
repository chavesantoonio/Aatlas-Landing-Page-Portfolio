# Tracking do portfólio (Google Tag Manager)

O site já envia todos os eventos para o `dataLayer`. Falta só ligar o seu container do GTM.

## 1. Criar e importar o container

1. Em tagmanager.google.com, crie um container **Web** para `aatlascompany.com.br` e anote o ID (`GTM-XXXXXXX`).
2. Vá em **Administrador → Importar container**. Escolha `gtm-container.json`, workspace **Existente** e opção **Mesclar → Substituir**.
3. Em **Variáveis**, preencha as constantes:
   - `GA4 Measurement ID`: ID do fluxo do GA4 (`G-…`).
   - `Google Ads Conversion ID` e `Google Ads Lead Label`: da ação de conversão "Lead" no Google Ads.
   - `Meta Pixel ID`: do Gerenciador de Eventos da Meta.
4. Despause as tags **Google Ads - Lead**, **Meta Pixel - PageView** e **Meta Pixel - Lead** depois de preencher os IDs.
5. Use **Visualizar** para testar e depois **Enviar → Publicar**.
6. No GA4, marque `generate_lead` como **evento principal** (conversão).

## 2. Ligar o container no site, sem refazer a build

No gerenciador de arquivos da Hostinger, edite `public_html/portfolio/gtm.json`:

```json
{ "gtm_id": "GTM-XXXXXXX" }
```

Pronto. Com o ID preenchido, o site mostra o aviso de cookies e só carrega o GTM depois que o visitante aceita. Com o arquivo vazio, nada é carregado e nenhum aviso aparece.

## Eventos enviados

| Evento | Quando | Parâmetros |
|---|---|---|
| `page_view` | Cada página e cada etapa do questionário (`?etapa=1`, `2`, `3`, `instagram`) | `page_location`, `page_path`, `page_title`, `language`, `virtual_page` |
| `form_start` | Abriu o questionário (qualquer botão de WhatsApp) | `form_id`, `form_location` (seção da página) |
| `form_step` | Mostrou uma etapa | `form_id`, `step_number` |
| `form_step_answer` | Respondeu uma etapa | `service` (website, system, paid_traffic, question) ou `timeline` (this_week, this_month, 1_3_months, researching) |
| `generate_lead` | Enviou para WhatsApp ou Instagram | `method`, `service`, `timeline`, `event_id` (deduplicação com a API de Conversões), `utm_*`, `gclid`, `fbclid` (primeiro toque da visita) |
| `contact` | Clicou no e-mail ou em WhatsApp direto | `method` |
| `social_click` | Instagram ou LinkedIn | `network`, `link_url` |
| `select_content` | Abriu um case | `content_type=case`, `item_id` (slug) |
| `preview_open` | Abriu o preview de um site de cliente | `project`, `device` |
| `language_change` | Trocou o idioma | `language_from`, `language_to` |
| `consent_update` | Aceitou ou recusou os cookies | `consent` |

O nome digitado no questionário **nunca** vai para o dataLayer.

## Desempenho

O GTM só é baixado depois que a página termina de carregar e o navegador fica ocioso, e só para quem aceitou os cookies. A primeira pintura e o Lighthouse não são afetados.

## Regerar o container

`python tracking/make-container.py` (depois de mudar os eventos no código).
