# ChronicAI - O Seu Companheiro de Saúde

O **ChronicAI** é uma aplicação Next.js moderna concebida para ajudar seniores a gerir as suas condições de saúde crónicas (como Diabetes, Hipertensão e Colesterol) de forma autónoma e informada.

## Funcionalidades Principais

- **Painel de Controlo (Dashboard):** Resumo visual dos sinais vitais e progresso de atividade física semanal com gráficos dinâmicos.
- **Assistente de Saúde com IA:** Chatbot empático que fornece conselhos personalizados baseados no perfil clínico do utilizador e dados estatísticos.
- **Registo Diário Simples:** Interface intuitiva com botões grandes e menus para registar pressão arterial (sistólica/diastólica), peso e atividade.
- **Questionário de Perfil Abrangente:** Recolha detalhada de dados biométricos, hábitos de estilo de vida e medicação habitual.
- **Segurança de Emergência:** A IA identifica sintomas de urgência e guia o utilizador para o 112 ou SNS 24.

## Como Começar (Desenvolvimento Local)

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   Crie um ficheiro `.env` com as suas chaves do Firebase e a chave de API do Google Gemini.

3. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Executar o Genkit (IA):**
   ```bash
   npm run genkit:dev
   ```

## Tecnologias Utilizadas

- **Frontend:** Next.js 15, React, Tailwind CSS.
- **Componentes:** ShadCN UI, Lucide Icons, Recharts.
- **IA:** Google Gemini via Genkit.
- **Backend:** Configurado para Firebase App Hosting.

## Aviso Médico

O ChronicAI fornece apenas informações informativas e conselhos de bem-estar. Não substitui o diagnóstico ou tratamento por um profissional de saúde. Em caso de emergência, contacte sempre o 112 ou o SNS 24 (808 24 24 24).

---
© 2026 ChronicAI Health. Todos os direitos reservados.