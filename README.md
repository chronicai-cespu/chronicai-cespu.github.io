# ChronicAI - O Seu Companheiro de Saúde (versão gratuita)

O **ChronicAI** é uma aplicação web concebida para ajudar a gerir condições de saúde crónicas (como Diabetes, Hipertensão e Colesterol) de forma autónoma e informada.

Este projeto faz parte da iniciativa:
**"ChronicAI – Integrating Self-Care and Artificial Intelligence in Chronic Disease Management"**
**ChronicAI-GI2-CESPU-2025**

Esta versão corre **inteiramente no plano gratuito do Firebase (Spark), sem conta de faturação**.

## Arquitetura

| Componente | Serviço | Plano |
|---|---|---|
| Alojamento | Firebase Hosting (site estático gerado pelo Next.js em `out/`) | Spark (gratuito) |
| Contas e palavras-passe | Firebase Authentication (e-mail/palavra-passe) | Spark (gratuito) |
| Perfis, registos clínicos, auditoria, contactos | Cloud Firestore | Spark (gratuito) |
| Assistente de IA | Firebase AI Logic → Gemini Developer API (`gemini-2.5-flash`) | Nível gratuito |
| Publicação | GitHub Actions (a cada `push` no `main`) | Gratuito |

Não existe servidor: a app é um conjunto de ficheiros estáticos que falam diretamente com o Firebase.
A segurança dos dados é garantida pelas regras em `firestore.rules`.

### Coleções do Firestore

- `users/{uid}` — perfil do utilizador (papel, código pXX/rXX, dados de saúde). Sem palavras-passe.
- `login_codes/{código}` — liga o código de acesso (ex.: `p01`) ao e-mail, para o login por código.
- `counters/{p|r}` — contadores para gerar os códigos sequenciais.
- `clinical_records/{id}` — registos clínicos (pressão arterial, peso, atividade).
- `audit_logs/{id}` — log de auditoria imutável.
- `contact_messages/{id}` — mensagens do formulário de contacto (só o administrador lê).

### Papéis

- **Paciente** — regista-se livremente.
- **Investigador** — regista-se como pendente; o administrador aprova-o mudando o papel para *Investigador* em `/admin`.
- **Administrador** — atribuído manualmente na consola (ver passo 5 abaixo).

## Configuração (uma única vez)

Tudo na [consola do Firebase](https://console.firebase.google.com/), projeto `studio-8989371642-d7cae`.

1. **Firestore** → *Criar base de dados* → modo de produção → localização `eur3 (europe-west)`.
2. **Authentication** → *Começar* → *Método de início de sessão* → ativar **E-mail/palavra-passe**.
3. **AI Logic** → *Começar* → escolher **Gemini Developer API**. A chave é criada e gerida pelo Firebase (não fica no código).
4. **Publicação automática:**
   - *Definições do projeto* → *Contas de serviço* → **Gerar nova chave privada** (descarrega um ficheiro JSON).
   - No GitHub: *Settings → Secrets and variables → Actions → New repository secret*, nome **`FIREBASE_SERVICE_ACCOUNT`**, valor = conteúdo completo do ficheiro JSON. Apague o ficheiro do computador a seguir.
   - Em *Actions*, execute o workflow **Deploy para Firebase Hosting** (ou faça um `push` para o `main`); o workflow chama-se **Deploy da app**. A app fica em https://studio-8989371642-d7cae.web.app e as regras do Firestore são publicadas ao mesmo tempo.
5. **Primeiro administrador:** registe uma conta em `/register`. Depois, em *Firestore* → coleção `users`, abra o documento dessa conta e altere o campo `role` para `admin`.
6. Confirme em `/setup` que o Firestore, a sessão e a IA respondem.

### Proteção da quota da IA

O App Check deixou de estar disponível sem faturação: o reCAPTCHA clássico foi descontinuado e o
substituto (Google Cloud Fraud Defense) exige um projeto com conta de faturação. A app suporta-o
(variável `RECAPTCHA_SITE_KEY`) caso um dia o projeto passe a ter faturação.

Sem faturação não há risco de custos: se a quota gratuita da IA se esgotar, o assistente pára até ao dia seguinte.
Proteção leve e gratuita: restringir a chave de API do navegador aos domínios da app
(Google Cloud → *APIs e serviços → Credenciais → Browser key → Referenciadores HTTP*):
`https://studio-8989371642-d7cae.web.app/*`, `https://studio-8989371642-d7cae.firebaseapp.com/*`,
`https://chronicai-cespu.github.io/*` e `http://localhost:9002/*`.

## Endereço no GitHub Pages (opcional)

A mesma app pode ser publicada em `https://chronicai-cespu.github.io`, além do Firebase Hosting:

1. Tornar o repositório público e mudar-lhe o nome para `chronicai-cespu.github.io` (*Settings → General*).
2. *Settings → Pages → Source*: **GitHub Actions**.
3. Firebase → *Authentication → Configurações → Domínios autorizados*: adicionar `chronicai-cespu.github.io`.
4. Correr o workflow **Deploy da app**.

## Desenvolvimento local

```bash
npm install
npm run dev        # http://localhost:9002
npm run build      # gera o site estático em out/
```

## Limites do plano gratuito

- Firestore: 50 000 leituras e 20 000 escritas por dia, 1 GiB de dados.
- Hosting: 10 GB de armazenamento, 360 MB de transferência por dia.
- Gemini Developer API (nível gratuito): limites por minuto e por dia; os pedidos do nível gratuito podem ser usados pela Google para melhorar os produtos. Não envie dados identificáveis desnecessários nas perguntas à IA.

Se um limite for atingido, o serviço pára até ao dia seguinte — nunca há cobrança, porque o projeto não tem faturação.

## Colaboração Institucional
- **Digital Health & Technology (DiTech)**: Unidade de investigação integrada no **GI2- Gabinete para a Investigação & a Inovação** da **CESPU - Cooperativa de Ensino Superior Politécnico e Universitário**.
- **Intelligent Systems Associate Laboratory (LASI)**: Do **Centro Algoritmi** da **Universidade do Minho**.

## Contacto
**Email:** chronicai.cespu@gmail.com

## Aviso Médico
O ChronicAI fornece apenas informações informativas e conselhos de bem-estar. Não substitui o diagnóstico ou tratamento por um profissional de saúde. Em caso de emergência, contacte sempre o 112 ou o SNS 24 (808 24 24 24).

---
© 2026 ChronicAI | DiTech | CESPU & Centro Algoritmi | UMinho. Todos os direitos reservados.
