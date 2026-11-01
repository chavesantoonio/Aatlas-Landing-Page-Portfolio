# Check-up de segurança: portfólio Antonio Chaves / Aatlas Company

Data: 31/10/2026. Método: skill própria `checkup-de-seguranca:auditoria` (OWASP Top 10:2025, ASVS 5.0, módulos de conformidade da Aatlas).
Escopo autorizado: domínio da própria Aatlas, `aatlascompany.com.br` (site principal e pasta `/portfolio`), e o código em `site/`. Testes no servidor real somente de leitura.

> A auditoria reduz risco, mas não garante ausência de incidentes ou processos. Não substitui parecer jurídico nem pentest profissional. Os textos legais do site (privacidade, termos) são modelos e precisam de revisão de advogado.

---

## Resumo executivo

**Situação geral: boa. O portfólio pode ser publicado.** Não há nenhum risco crítico ou alto em aberto.

O portfólio é um site estático. Não tem login, banco de dados nem formulário que envie dados para um servidor. O questionário de contato monta a mensagem no próprio navegador e só a envia quando a pessoa escolhe o WhatsApp ou o Instagram. Isso elimina a maior parte dos riscos de um site com cadastro.

Durante a auditoria foram corrigidos sete pontos:

1. **Rastreamento só com permissão.** O Google Tag Manager só carrega depois que o visitante aceita os cookies. Recusar e aceitar têm o mesmo destaque, e a escolha pode ser mudada no rodapé.
2. **Política de privacidade.** Agora explica cookies, medição de anúncios, envio de dados para fora do Brasil e quem é o encarregado de dados, com contato.
3. **Configuração que travaria o subdomínio `lp`.** A configuração anterior forçaria HTTPS em todos os subdomínios por um ano, e o `lp` ficaria inacessível para quem visitasse o portfólio.
4. **Contraste do botão laranja,** para atender a acessibilidade exigida por lei.
5. **Navegação por teclado dentro das janelas** do questionário e do preview.
6. **Cookie de idioma** passou a ser marcado como seguro.
7. **Recursos de navegação que davam erro 404.**

Ficam abertos, sem impedir a publicação:

- **O site principal não envia cabeçalhos de segurança.** O bloco pronto está em `raiz-do-dominio/htaccess-cabecalhos.txt`. Prazo sugerido: 7 dias.
- **O subdomínio `lp.aatlascompany.com.br` está com o certificado quebrado e a pasta vazia.** Remova o subdomínio ou instale o SSL. Prazo sugerido: 7 dias.
- **Proteção do e-mail contra falsificação (DMARC) em modo só de observação.** Prazo sugerido: 30 dias.
- **Pontos jurídicos que dependem de documentos da Aatlas:**
  - CNPJ e endereço no rodapé;
  - comprovação dos resultados divulgados;
  - autorização para usar logos e prints de clientes e as marcas Bradesco, CAIXA e TIM.

**Exposição a sanções, se a coleta de dados fosse irregular:** a LGPD prevê advertência e multa de até 2% do faturamento no Brasil, limitada a R$ 50 milhões por infração, entre outras sanções (art. 52). Com o consentimento implementado e a política atualizada, esse risco fica baixo.

**Próximos passos:**
1. Colar os cabeçalhos no `.htaccess` do site principal.
2. Resolver o subdomínio `lp`.
3. Ativar o 2FA em hospedagem, domínio, Google e Meta.
4. Guardar as provas dos resultados divulgados.
5. Pedir a um advogado que revise a política de privacidade e os termos.

---

## Etapa 0: escopo e nível

| Campo | Valor |
|---|---|
| URL de produção | https://aatlascompany.com.br/portfolio/ (pasta), site principal em https://aatlascompany.com.br/ |
| Stack | Next.js 16 com exportação estática, hospedagem Hostinger (LiteSpeed). Sem banco, sem API própria |
| Acesso usado | Código local completo, URL publicada (somente leitura), DNS público |
| Tipo | Portfólio institucional com questionário de contato (WhatsApp/Instagram) e Google Tag Manager |
| Dados | Nenhum dado chega a servidor da Aatlas pelo site. Cookies de medição (GA4, Google Ads, Meta) só com consentimento |
| Vende online | Não. A contratação acontece por conversa e proposta |
| Público | Brasil e exterior (Paraguai, EUA, México, Espanha, Portugal): LGPD e, para Espanha e Portugal, GDPR |
| UF / município | Paraná / Curitiba |
| **Nível** | **N2 Captação** (tem tag manager com pixels e um questionário que qualifica o contato) |

## Etapa 1: reconhecimento

- **Páginas:** 11 rotas em 4 idiomas (`/en`, `/es`, `/pt-pt`, `/pt-br`), 44 páginas estáticas, mais `404.html`, `sitemap.xml`, `llms.txt` e `gtm.json`. Não há `/admin`, `/api` nem rotas ocultas.
- **Entradas do atacante:**
  - parâmetro `?etapa=` (validado: só aceita 1, 2, 3 ou instagram);
  - campo "nome" do questionário (vai codificado na URL do WhatsApp, nunca é exibido como HTML);
  - `gtm.json` (o ID é validado pelo formato `GTM-XXXX`).
- **Scripts de terceiros:** Google Tag Manager, só após o consentimento. Dentro dele ficam GA4, Google Ads e Meta Pixel; os dois últimos estão pausados até receberem os IDs.
- **Iframes:** o preview dos sites de clientes usa iframe com `sandbox`, e as origens são diferentes da do portfólio.
- **Pior cenário plausível:**
  - alteração dos arquivos no servidor por quem tiver acesso à conta da Hostinger;
  - troca do container do GTM por alguém com acesso a ele.

  Os dois dependem de proteger as contas (Módulo 8).

## Etapa 2: varredura automática (evidências)

| Verificação | Resultado |
|---|---|
| Segredos no build (`sk_live_`, `service_role`, `AKIA`, `ghp_`, JWT, `postgres://`, `Bearer`) | Nenhum encontrado em `site/out` |
| Source maps (`.map`) | 0 arquivos no build; `/assets/index-*.js.map` do site principal responde 404 |
| `.env` e `.git` no projeto | Inexistentes. No servidor, `/.env`, `/.env.local`, `/.git/HEAD` e `/.htaccess` respondem 403 |
| Variáveis públicas sensíveis (`NEXT_PUBLIC_*SECRET/KEY/TOKEN`) | Nenhuma |
| Padrões inseguros (fallback de segredo, CORS `*`, MD5/SHA-1, `eval`) | Nenhum |
| `dangerouslySetInnerHTML` | 2 usos, ambos sem entrada do usuário: JSON-LD com `<` escapado (`components/Site.tsx:46`) e script fixo de idioma (`app/[lang]/layout.tsx:44`) |
| `npm audit --omit=dev` | 0 vulnerabilidades em produção |
| `npm audit` completo | Alerta moderado no `minimatch`, dentro do ESLint (ferramenta de desenvolvimento, não vai para o site) |
| HTTP para HTTPS | `http://aatlascompany.com.br/` responde 301 para `https://` |
| TLS | TLS 1.3, Let's Encrypt válido até 05/12/2026; TLS 1.0 e 1.1 recusados |
| Cabeçalhos do site principal | Só `Content-Security-Policy: upgrade-insecure-requests`. Faltam os demais (achado M1) |
| DNS de e-mail | SPF `v=spf1 include:_spf.mail.hostinger.com ~all`; DKIM `hostingermail-a/b/c`; DMARC `p=none`; sem CAA |
| Lighthouse (mobile, rede limitada) | Acessibilidade, boas práticas e SEO 100 em todas as páginas testadas; desempenho 93 a 98 |

## Etapa 3: testes manuais

- **Questionário:**
  - payload `<img src=x onerror=alert(1)>` no nome: vira texto dentro da mensagem do WhatsApp (codificado em `encodeURIComponent`) e nunca é renderizado como HTML;
  - campo limitado a 60 caracteres;
  - `?etapa=3` sem as respostas anteriores volta para a etapa permitida.
- **Consentimento** (teste automatizado no navegador, desktop e mobile):
  - nenhum script do Google carrega antes de aceitar;
  - ao recusar, o GTM nunca carrega;
  - ao aceitar, carrega depois que a página termina de carregar;
  - o link do rodapé reabre a escolha.
- **Erros:** página inexistente devolve a `404.html` própria, sem detalhe técnico.
- **Login, upload, webhook, pagamento, IA:** não existem neste site.

---

## Achados

### Corrigidos durante a auditoria

```
[MÉDIO] HSTS com includeSubDomains derrubaria subdomínios sem SSL (OWASP A02:2025, item 21)
Local:     site/scripts/build-static.mjs (.htaccess gerado) e site/next.config.ts
Caminho:   visitante abre /portfolio -> recebe HSTS includeSubDomains por 1 ano -> navegador passa a exigir HTTPS em lp.aatlascompany.com.br
Impacto:   lp.aatlascompany.com.br (sem certificado válido) ficaria inacessível para esses visitantes por 1 ano
Evidência: SSL de lp. falha com "tlsv1 alert internal error"; cabeçalho anterior "max-age=31536000; includeSubDomains"
Correção:  Strict-Transport-Security "max-age=31536000" (sem includeSubDomains)
Confiança: Confirmado      Status: conforme (corrigido)
```

```
[MÉDIO] Rastreamento sem consentimento prévio (Módulo 2; LGPD, Lei 13.709/2018, art. 7º, I e art. 8º)
Local:     site/components/Tracking.tsx
Evidência: implementado Consent Mode v2 com padrão "negado"; GTM injetado só após "Aceitar"; teste automatizado confirma 0 scripts do Google antes do aceite e após "Recusar"
Correção:  banner com aceitar e recusar com o mesmo peso, registro da escolha com data (localStorage ac-consent / ac-consent-at), link "Preferências de cookies" no rodapé
Confiança: Confirmado      Status: conforme
```

```
[MÉDIO] Política de privacidade sem cookies de medição, transferência internacional e encarregado (LGPD art. 9º, I a V; art. 41, § 1º)
Local:     site/lib/dict/*.ts (legal.privacy), páginas /[lang]/privacy/
Evidência: texto anterior dizia "sem rastreadores"; agora há a seção "Cookies e medição", a base legal (consentimento), o envio para o Google e a Meta fora do Brasil e "Encarregado pelo tratamento de dados: Antonio Chaves, contato@aatlascompany.com.br"
Confiança: Confirmado      Status: conforme (revisão por advogado pendente)
```

```
[MÉDIO] Contraste insuficiente no botão principal (Módulo 4; LBI, Lei 13.146/2015, art. 63; WCAG 2.1 AA 1.4.3)
Local:     site/app/globals.css (.hbtn-p)
Evidência: branco sobre #E85002 = 3,76:1 (mínimo 4,5:1 para texto de 17px). Lighthouse a11y 96
Correção:  fundo #CC4600 = 4,73:1. Lighthouse a11y 100
Confiança: Confirmado      Status: conforme
```

```
[BAIXO] Foco do teclado escapava das janelas modais (Módulo 4; WCAG 2.1 2.4.3)
Local:     site/components/Talk.tsx, site/components/SitePreview.tsx
Correção:  site/lib/focus-trap.ts mantém Tab e Shift+Tab dentro da janela; Esc fecha; foco volta ao botão que abriu
Confiança: Confirmado      Status: conforme
```

```
[BAIXO] Cookie "lang" sem Secure (item 22)
Local:     site/components/LangSwitch.tsx
Correção:  lang=...;path=/;max-age=31536000;samesite=lax;secure. HttpOnly não se aplica: o cookie é gravado pelo navegador e não guarda dado pessoal
Confiança: Confirmado      Status: conforme
```

```
[INFORMATIVO] Prefetch de navegação dava 404 (desempenho, não segurança)
Local:     arquivos __next.*.txt da exportação estática
Correção:  build-static.mjs grava os arquivos com o nome que o navegador pede. Lighthouse boas práticas 96 -> 100
Status:    conforme
```

### Em aberto

```
[MÉDIO] Site principal sem cabeçalhos de segurança (OWASP A02:2025, item 21)
Local:     https://aatlascompany.com.br/ (public_html/.htaccess)
Evidência: curl -I mostra só "Content-Security-Policy: upgrade-insecure-requests"; faltam X-Content-Type-Options, X-Frame-Options/frame-ancestors, Referrer-Policy, Permissions-Policy e HSTS
Impacto:   clickjacking da página principal e interpretação incorreta de tipos de arquivo; sem exploração direta de dados
Correção:  colar o bloco de raiz-do-dominio/htaccess-cabecalhos.txt no final de public_html/.htaccess
Confiança: Confirmado      Status: não conforme
Responsável e prazo: Antonio Chaves, 7 dias
```

```
[MÉDIO] Subdomínio lp.aatlascompany.com.br com SSL quebrado e pasta vazia (item 25)
Local:     DNS A lp -> 82.25.73.236; https://lp.aatlascompany.com.br falha no TLS; http responde 403
Impacto:   imagem de site abandonado e alerta de segurança para quem acessar. Não há risco de tomada do subdomínio (aponta para o próprio servidor)
Correção:  remover o subdomínio no hPanel ou reinstalar o SSL e apontá-lo para uma pasta com conteúdo
Confiança: Confirmado      Status: não conforme
Responsável e prazo: Antonio Chaves, 7 dias
```

```
[MÉDIO] CSP sem script-src (OWASP A02/A05:2025, item 21)
Local:     .htaccess do portfólio
Caminho:   não há entrada que gere HTML a partir de dado do usuário. O risco depende de outra falha
Motivo do aceite: a exportação estática do Next usa scripts inline e o GTM carrega origens que mudam conforme as tags. Um script-src restrito quebraria a medição sem proteger contra algo alcançável hoje
Correção futura: quando as tags estiverem estáveis, listar as origens (googletagmanager.com, google-analytics.com, googleadservices.com, connect.facebook.net) em script-src e connect-src
Confiança: Provável      Status: aceito com justificativa
Responsável e prazo: Antonio Chaves, rever em 90 dias
```

```
[BAIXO] DMARC em p=none e sem registro CAA (itens 25 e 26)
Evidência: _dmarc TXT "v=DMARC1; p=none"; CAA ausente
Correção:  DMARC com relatório (rua=mailto:contato@aatlascompany.com.br) por 30 dias e depois p=quarantine; CAA 0 issue "letsencrypt.org"
Status:    não conforme      Prazo: 30 dias
```

```
[BAIXO] Sem controle de versão (Módulo 6A: "sem Git e sem rollback")
Evidência: a pasta do projeto não é repositório Git
Mitigação feita: backup-codigo-fonte-2026-10-31.zip (código sem node_modules) como ponto de retorno
Correção:  versionar em repositório privado no GitHub com a conta da Aatlas
Status:    parcialmente conforme      Prazo: 30 dias
```

```
[BAIXO] Sem monitoramento de disponibilidade e de expiração do certificado (item 19)
Correção:  UptimeRobot (gratuito) em https://aatlascompany.com.br/portfolio/pt-br/ com alerta por e-mail; o certificado Let's Encrypt renova a cada 90 dias (atual vence em 05/12/2026)
Status:    não conforme      Prazo: 30 dias
```

```
[INFORMATIVO] Dependência de desenvolvimento com alerta (item 17)
Evidência: minimatch < 11.0.1 (GHSA-g3hv-75wg-m249) via eslint; não vai para produção
Correção:  atualizar quando o eslint-config-next publicar versão compatível
```

### Precisa verificar (dependem de documentos ou acessos da Aatlas)

| Item | O que verificar | Base |
|---|---|---|
| Identificação do fornecedor | Razão social, CNPJ e endereço em destaque no rodapé. Aplicação obrigatória a confirmar com advogado, porque o site oferece serviços mas a contratação não é concluída nele | Decreto 7.962/2013, art. 2º, I e II |
| Resultados divulgados | +300% de leads, R$ 40 mil, +10k visitas, +20k seguidores, aparições na mídia. Guardar prints e relatórios que provem cada número | CDC, Lei 8.078/1990, art. 36, parágrafo único, e art. 38; art. 37, § 1º |
| Marcas de terceiros | Logos de clientes no carrossel; Bradesco, CAIXA Aqui e TIM ("pessoas que trabalham ou trabalharam nessas empresas confiam no nosso trabalho"). Ter autorização escrita ou retirar | Módulo 5; CDC art. 37, § 1º |
| Selos Google Partner e Meta Business Partner | Status informado como ativo. Guardar prints dos painéis com data | CDC art. 37 e 38 (Módulo 7) |
| Prints dos sites de clientes | Autorização de uso como portfólio | Lei 9.610/1998 (Módulo 5); conferir no acervo antes de citar artigo |
| Contas e 2FA | 2FA em Hostinger, registro.br, Google (GTM, GA4, Ads), Meta Business; sem ex-colaboradores; senhas em cofre | Módulo 8; itens 3, 10, 18 e 25 |
| Registros de acesso | Confirmar que a Hostinger guarda logs de acesso por 6 meses | Marco Civil, Lei 12.965/2014, art. 15 |
| Plano de incidente | Responsável e modelo de comunicação definidos; prazos da Res. CD/ANPD 15/2024 (fora do acervo) | LGPD art. 46; Módulo 3 |
| Leis do Paraná e de Curitiba | Pesquisa por conteúdo no acervo indisponível nesta sessão | Conferir em legislacao.pr.gov.br e leismunicipais.com.br (Curitiba) |

---

## Checklist técnico completo (Módulo 6)

| # | Item | Status | Evidência ou motivo |
|---|---|---|---|
| 1 | HTTPS, redirecionamento, sem conteúdo misto | Conforme | 301 http→https; `upgrade-insecure-requests`; todos os recursos com https ou caminho relativo |
| 2 | Hash de senha | Não aplicável | Sem login |
| 3 | MFA em contas administrativas | Não verificado | Sem acesso aos painéis (ver "Precisa verificar") |
| 4 | Rate limit | Não aplicável | Sem endpoint que receba dados; o questionário não envia nada a servidor |
| 5 | Validação no servidor | Não aplicável | Sem servidor de aplicação; entradas validadas no cliente (`?etapa`, ID do GTM, limite de 60 caracteres) |
| 6 | Sanitização contra XSS | Conforme | Nome nunca vira HTML; JSON-LD com `<` escapado |
| 7 | SQL injection | Não aplicável | Sem banco |
| 8 | Migrations | Não aplicável | Sem banco |
| 9 | Plano de rollback | Parcial | Backup do código e do zip anterior; falta Git (achado) |
| 10 | Controle de acesso às ferramentas | Não verificado | Hostinger, GTM, GA4: conferir membros |
| 11 | Sessão e logout | Não aplicável | Sem login |
| 12 | Segredos fora do front | Conforme | Varredura do build sem resultados |
| 13 | CORS restrito | Conforme | Nenhum cabeçalho Access-Control-Allow-Origin servido |
| 14 | Logs de segurança | Não aplicável | Sem ações autenticadas; logs de acesso ficam na hospedagem |
| 15 | Backups fora do servidor | Parcial | Código e build guardados no computador e no OneDrive; conferir backup automático da Hostinger |
| 16 | TLS 1.2+ | Conforme | TLS 1.3; 1.0 e 1.1 recusados |
| 17 | Dependências | Conforme | 0 vulnerabilidades em produção |
| 18 | Menor privilégio | Não verificado | Sem chaves no site; conferir papéis no GTM e na Meta |
| 19 | Monitoramento | Não conforme | Achado de risco baixo |
| 20 | Plano de desastre | Não verificado | Restaurar = subir o `portfolio-hostinger.zip` de novo; documentar responsável |
| 21 | Cabeçalhos | Conforme no portfólio / não conforme no site principal | Portfólio: CSP (frame-ancestors, base-uri, object-src, form-action), HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP |
| 22 | Cookies Secure e SameSite | Conforme | `lang` com Secure e SameSite=Lax; os cookies do GA e da Meta só existem após o consentimento |
| 23 | Arquivos sensíveis | Conforme | `.env`, `.git`, `.htaccess` 403; sem source maps; `Options -Indexes` |
| 24 | Erros fecham sem detalhe | Conforme | `404.html` própria, sem stack trace |
| 25 | Domínio (2FA, transferência, subdomínios) | Não conforme / não verificado | Subdomínio `lp` sem SSL; registrador não verificado |
| 26 | SPF, DKIM, DMARC | Parcial | SPF e DKIM ok; DMARC `p=none` |
| 27 | Anti-bot em formulário | Não aplicável | Formulário não envia para servidor |
| 28 | Webhooks assinados | Não aplicável | Sem webhooks |
| 29 | CSRF | Não aplicável | Sem ações autenticadas |
| 30 | Upload | Não aplicável | Sem upload |
| 31 | SSRF | Não aplicável | Sem busca de URL no servidor |
| 32 | Pagamento | Não aplicável | Sem pagamento |
| 33 | Scripts de terceiros | Conforme com ressalva | Só o GTM, após consentimento. SRI não se aplica a script dinâmico do GTM. Acesso ao container deve ter 2FA |
| 34 | Padrões inseguros por padrão | Conforme | Sem ID válido no `gtm.json`, nada carrega (falha fechada) |
| 35 | Ambientes separados | Não aplicável | Sem chaves nem banco por ambiente |

**Módulo 6A (código gerado por IA):** sem chaves, sem banco, sem Server Actions nem rotas de API (o export estático não publica nenhuma). Dependências conferidas no registro npm (next, react, motion, framer-motion, next-themes, dotted-map). Falta Git (achado). A política e os termos foram gerados com IA: revisão de advogado obrigatória.
**Módulo 6B (IA):** não aplicável. O site não chama modelo de IA; o `llms.txt` é só um texto estático para assistentes lerem.

## Conformidade (Módulos 1 a 5, 7 e 8)

- **Módulo 1 (documentos legais):**
  - conforme: política (art. 9º), encarregado (art. 41, § 1º) e termos de uso;
  - precisa verificar: identificação do fornecedor;
  - não aplicável: reembolso e arrependimento, porque não há venda online.
- **Módulo 2 (cookies):** conforme.
  - banner com aceitar e recusar com o mesmo peso;
  - nada pré-marcado;
  - nada dispara antes do consentimento (testado);
  - registro da escolha com data;
  - Consent Mode v2;
  - transferência internacional declarada;
  - Meta Pixel listado na política.
- **Módulo 3 (LGPD na coleta):**
  - minimização: só nome, serviço e prazo, e o nome não vai para a medição;
  - sem dado sensível;
  - sem público infantil, então o ECA Digital não se aplica;
  - o plano de incidente precisa ser documentado.
- **Módulo 4 (acessibilidade):** conforme.
  - símbolo de acessibilidade fixo em todas as páginas (LBI art. 63, § 1º);
  - link "pular para o conteúdo";
  - foco visível e trava de foco nas janelas;
  - contraste corrigido;
  - Lighthouse 100.
- **Módulo 5 (conteúdo):** precisa verificar provas, marcas e autorizações (tabela acima). Não há depoimentos nem avaliações no site.
- **Módulo 7:**
  - preços não são exibidos: proposta sob consulta, sem promessa de preço;
  - selos e domínio: precisa verificar.
- **Módulo 8:** não verificado (contas, 2FA, cofre de senhas, documento de entrega).

## Trava de publicação

**Decisão: PUBLICA.** Não há achado crítico ou alto aberto. Os achados médios e baixos estão no backlog com prazo.

---

## Fontes

- Lei nº 13.709 de 14/08/2018 (LGPD) | arts. 7º, I; 8º; 9º, I a V; 41, § 1º; 46; 52 | `federal/leis-ordinarias/2018/lei-13709-2018-08-14.md` | https://normas.leg.br/?urn=urn:lex:br:federal:lei:2018-08-14;13709 | compilada (texto vigente), não revogada
- Lei nº 13.146 de 06/07/2015 (LBI) | art. 63, caput e § 1º | `federal/leis-ordinarias/2015/lei-13146-2015-07-06.md` | https://normas.leg.br/?urn=urn:lex:br:federal:lei:2015-07-06;13146 | compilada, não revogada
- Lei nº 8.078 de 11/09/1990 (CDC) | arts. 36, parágrafo único; 37, § 1º; 38 | `federal/leis-ordinarias/1990/lei-8078-1990-09-11.md` | https://normas.leg.br/?urn=urn:lex:br:federal:lei:1990-09-11;8078 | compilada, não revogada
- Decreto nº 7.962 de 15/03/2013 | art. 2º, I e II | `federal/decretos/2013/dec-7962-2013-03-15.md` | https://normas.leg.br/?urn=urn:lex:br:federal:decreto:2013-03-15;7962 | original, não revogado
- Lei nº 12.965 de 23/04/2014 (Marco Civil da Internet) | art. 15 | `federal/leis-ordinarias/2014/lei-12965-2014-04-23.md` | https://normas.leg.br/?urn=urn:lex:br:federal:lei:2014-04-23;12965 | compilada, não revogada
- Resolução CD/ANPD 15/2024 (comunicação de incidente) | fora do acervo | conferir em gov.br/anpd e no Diário Oficial
- WCAG 2.1 | critérios 1.4.3 e 2.4.3 | fora do acervo | w3.org

Artigos lidos no acervo ctresb/leis em 31/10/2026. O acervo não substitui o Diário Oficial.

## Pontos a conferir

- **Decreto 7.962/2013:** está no acervo na versão original. Conferir no Planalto se houve alteração e, com advogado, se o art. 2º se aplica a um site que oferece serviços sem concluir a contratação nele.
- **ANPD:** a Lei 15.352/2026 mudou o nome para Agência Nacional de Proteção de Dados. O texto compilado da LGPD no acervo ainda mostra "Autoridade".
- **GDPR:** para visitantes da Espanha e de Portugal, o regulamento europeu é a referência (fora do acervo brasileiro). O consentimento prévio implementado atende ao padrão europeu, mas a revisão jurídica deve confirmar.
- **Paraná e Curitiba:** não foi possível pesquisar por conteúdo no acervo nesta sessão. Conferir leis estaduais e municipais sobre consumidor e sites.
- **Marco Civil, art. 15:** confirmar o enquadramento da Aatlas como provedor de aplicação e a política de logs da Hostinger.
- **Próxima auditoria:** parcial (Módulos 6 e 6A) a cada mudança grande; completa em 10/2027; dependências todo mês.
