# ChronicAI - O Seu Companheiro de Saúde

O **ChronicAI** é uma aplicação Next.js moderna concebida para ajudar a gerir condições de saúde crónicas (como Diabetes, Hipertensão e Colesterol) de forma autónoma e informada.

Este projeto faz parte da iniciativa:
**"ChronicAI – Integrating Self-Care and Artificial Intelligence in Chronic Disease Management"**
**ChronicAI-GI2-CESPU-2025**

## Colaboração Institucional
Este projeto resulta de uma colaboração estratégica entre:
- **Digital Health & Technology (DiTech)**: Unidade de investigação integrada no **GI2- Gabinete para a Investigação & a Inovação** da **CESPU - Cooperativa de Ensino Superior Politécnico e Universitário**.
- **Intelligent Systems Associate Laboratory (LASI)**: Do **Centro Algoritmi** da **Universidade do Minho**.

## Segurança e Armazenamento de Dados

A aplicação utiliza a infraestrutura **Firebase** para garantir a máxima segurança dos dados:

- **Autenticação e Palavras-passe:** Geridas pelo **Firebase Authentication**. As palavras-passe são encriptadas e geridas pela Google, não sendo acessíveis em texto limpo nem guardadas na base de dados da aplicação.
- **Perfis e Registos Clínicos:** Guardados no **Cloud Firestore**. Os dados são protegidos por **Security Rules** que garantem que apenas o próprio utilizador (ou investigadores autorizados com justificativa) podem aceder ou editar informações sensíveis.
- **Auditoria:** Todas as alterações feitas por investigadores em perfis de pacientes são registadas num log de auditoria imutável.

## Funcionalidades Principais

- **Painel de Controlo (Dashboard):** Resumo visual dos sinais vitais e progresso de atividade física semanal com gráficos dinâmicos.
- **Assistente de Saúde com IA:** Chatbot empático que fornece conselhos personalizados baseados no perfil clínico do utilizador e dados estatísticos.
- **Registo Diário Simples:** Interface intuitiva com botões grandes e menus para registar pressão arterial (sistólica/diastólica), peso e atividade.
- **Questionário de Perfil Abrangente:** Recolha detalhada de dados biométricos, hábitos de estilo de vida e medicação habitual.
- **Segurança de Emergência:** A IA identifica sintomas de urgência e guia o utilizador para o 112 ou SNS 24.
- **Sistema Multi-Papel:** Diferenciação entre Pacientes (pXX), Investigadores (rXX) e Administrador.

## Contacto
Para questões relacionadas com o projeto ou suporte:
**Email:** chronicai.cespu@gmail.com

## Aviso Médico
O ChronicAI fornece apenas informações informativas e conselhos de bem-estar. Não substitui o diagnóstico ou tratamento por um profissional de saúde. Em caso de emergência, contacte sempre o 112 ou o SNS 24 (808 24 24 24).

---
© 2026 ChronicAI | DiTech | CESPU & Centro Algoritmi | UMinho. Todos os direitos reservados.
