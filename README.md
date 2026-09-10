<div align="center">

🎓 Universidade Synter

Plataforma interna de acesso a conteúdos, treinamentos e materiais da Synter

React + Vite • Supabase Auth • React Router • Cloudflare Turnstile

</div>

📌 Sobre o projeto

A Universidade Synter é uma aplicação web criada para centralizar conteúdos e materiais da empresa em um ambiente organizado, protegido por autenticação e com acesso restrito a usuários autenticados.

O projeto já possui fluxo de autenticação, recuperação de senha, controle de sessão, proteção de rotas, dashboard, perfil do usuário em modal e uma área inicial de manuais de produtos.

✨ Funcionalidades já implementadas

🔐 Autenticação

Login com e-mail e senha

Cadastro de novos usuários

Confirmação de senha no cadastro

Confirmação de e-mail pelo Supabase

Recuperação de senha por e-mail

Tela para definição de uma nova senha

Persistência e monitoramento da sessão

Logout

Redirecionamento automático após autenticação

🛡️ Segurança

Autenticação gerenciada pelo Supabase Auth

Senha mínima configurada no Supabase

Cloudflare Turnstile integrado ao fluxo de autenticação

Token do CAPTCHA enviado ao Supabase

Rate Limits mantidos no Supabase

Confirmação de e-mail obrigatória

Sessões gerenciadas pelo Supabase

Rotas privadas protegidas com ProtectedRoute

Rotas públicas controladas com PublicRoute

Mensagens genéricas na recuperação de senha para evitar exposição de contas cadastradas

Chaves privadas não ficam no frontend

Variáveis VITE_* tratadas como públicas

Nenhuma permissão de administrador é definida pelo React

[!IMPORTANT]
O frontend nunca deve ser considerado a camada final de segurança.
Quando o projeto começar a armazenar dados internos no banco, as tabelas deverão utilizar Row Level Security (RLS) e políticas de acesso no Supabase.

🧭 Fluxo de autenticação

Usuário acessa o sistema
        ↓
      Login
        ↓
Supabase valida credenciais
        ↓
Cloudflare Turnstile
        ↓
Sessão autenticada
        ↓
     Dashboard

Usuário não autenticado

/dashboard
    ↓
ProtectedRoute
    ↓
/login

Usuário já autenticado

/login
   ↓
PublicRoute
   ↓
/dashboard

🖥️ Dashboard

O Dashboard é a área principal da Universidade Synter.

Atualmente ele possui:

Identificação do usuário autenticado

Botão de perfil

Modal de perfil com fundo desfocado

Nome do usuário

E-mail do usuário

Botão para sair da conta

Cards de navegação

Layout responsivo em desenvolvimento

Categorias disponíveis no Dashboard

📖 Manual de Produtos

▶️ Vídeos de Instalação

🎓 Treinamentos Técnicos

💰 Tabela de Preços

📑 Fichas Técnicas

🖼️ Imagens de Produtos

📊 Treinamento Comercial

📣 Materiais de Marketing

📱 Aplicativo Synter

❓ Perguntas Frequentes

🔧 Assistência Técnica

📢 Novidades Synter

👤 Perfil do usuário

O perfil não abre uma nova página.

Ele funciona como um modal sobre a tela atual, mantendo o usuário exatamente no ponto em que estava.

Comportamento

Clique no perfil
      ↓
Fundo desfocado
      ↓
Modal "Meu Perfil"
      ↓
Nome + E-mail
      ↓
Sair da Conta

O modal também pode ser fechado sem alterar a rota atual.

📚 Área de Manuais

A rota:

/manuals

é uma rota protegida.

Somente usuários autenticados podem acessá-la.

A página está sendo organizada em três grupos principais:

Produtos Digitais

Exemplos já preparados no projeto:

Venus S3 Pro

Vega Face ID

Syrius S3 Pro

Syrius S3 Max

Syrius S2 Pro Neo

Lyra Pro

Eris S2 Face ID

Controladora S2 QR

Controladora S2 Pro

Controladora S2 Face ID

Produtos Mecânicos

A área já contém diversos produtos mecânicos cadastrados visualmente nos cards.

Ferragens

A estrutura de ferragens já está sendo montada com imagens no padrão:

f1.png
f2.png
f3.png
...
f28.png

e imports como:

import F1 from "../assets/f1.png"
import F2 from "../assets/f2.png"

🧱 Estrutura atual do projeto

Universidade_Synter/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── CardsDashboard.jsx
│   │   ├── Footer.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicRoute.jsx
│   │   ├── Register.jsx
│   │   ├── UpdatePassword.jsx
│   │   └── UserProfileButton.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   └── Dashboard.jsx
│   │
│   ├── routes/
│   │   └── Manuals.jsx
│   │
│   ├── services/
│   │   └── supabaseClient.js
│   │
│   ├── styles/
│   │   ├── CardsDashboard.css
│   │   ├── Dashboard.css
│   │   ├── Footer.css
│   │   ├── ForgotPassword.css
│   │   ├── Header.css
│   │   ├── Hero.css
│   │   ├── Login.css
│   │   ├── Profile.css
│   │   ├── Register.css
│   │   ├── UpdatePassword.css
│   │   └── UserProfileButton.css
│   │
│   ├── utils/
│   │   └── validators.js
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env
├── .gitignore
├── package.json
├── vite.config.js
└── README.md

🚦 Rotas atuais

Rota

Acesso

Função

/

Público controlado

Login inicial

/login

Público controlado

Login

/register

Público controlado

Cadastro

/forgot-password

Público controlado

Recuperação de senha

/update-password

Fluxo de recuperação

Definição da nova senha

/dashboard

🔒 Protegido

Dashboard principal

/manuals

🔒 Protegido

Manuais de produtos

🔒 ProtectedRoute

O ProtectedRoute impede que páginas internas sejam exibidas quando não existe um usuário autenticado.

Exemplo:

<Route
    path="/dashboard"
    element={
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    }
/>

O mesmo padrão é utilizado nas demais páginas internas:

<Route
    path="/manuals"
    element={
        <ProtectedRoute>
            <Manuals />
        </ProtectedRoute>
    }
/>

🚪 PublicRoute

O PublicRoute evita que um usuário já autenticado volte para telas como:

/login
/register

Quando existe uma sessão válida, o usuário é direcionado novamente para:

/dashboard

🌐 AuthContext

O AuthContext centraliza o estado de autenticação da aplicação.

Atualmente ele controla:

user
session
loading
logout

e acompanha alterações da autenticação através do Supabase.

Isso permite que qualquer componente autorizado utilize:

const { user } = useAuth()

ou:

const { logout } = useAuth()

✅ Validações

O projeto possui:

src/utils/validators.js

responsável por validações reutilizáveis.

Entre elas:

Formato do e-mail

Normalização do e-mail

Validação mínima da senha

Validação de dados antes do envio ao Supabase

As validações do React melhoram a experiência do usuário, mas não substituem regras configuradas no backend.

☁️ Supabase

A conexão é centralizada em:

src/services/supabaseClient.js

Exemplo de configuração:

import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL

const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase =
    createClient(supabaseUrl, supabaseKey)

🔑 Variáveis de ambiente

Crie um arquivo:

.env

na raiz do projeto.

Exemplo:

VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co

VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA

VITE_TURNSTILE_SITE_KEY=SUA_SITE_KEY

⚠️ Nunca coloque no frontend

SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SECRET_KEY
TURNSTILE_SECRET_KEY

Essas informações são privadas e não devem ser expostas em aplicações React.

🙈 .gitignore

O .env deve permanecer fora do GitHub.

Exemplo:

node_modules/
dist/
.env
.env.*
!.env.example

É recomendado criar futuramente um:

.env.example

somente com os nomes das variáveis:

VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_TURNSTILE_SITE_KEY=

⚙️ Instalação

Clone o repositório:

git clone https://github.com/Fiorim1/Universidade-Synter.git

Entre na pasta:

cd Universidade-Synter

Instale as dependências:

npm install

Configure o .env.

Depois execute:

npm run dev

O Vite disponibilizará o projeto localmente.

Normalmente:

http://localhost:5173

🧰 Tecnologias utilizadas

Tecnologia

Uso

React

Construção da interface

Vite

Ambiente de desenvolvimento e build

React Router DOM

Sistema de rotas

Supabase

Autenticação, sessões e futuro banco de dados

Cloudflare Turnstile

Proteção CAPTCHA

Context API

Estado global de autenticação

CSS

Interface e identidade visual

🎨 Identidade visual

A Universidade Synter segue uma interface baseada na identidade visual da Synter:

Fundo escuro

Elementos brancos

Bordas minimalistas

Cards com ícones

Interface limpa e corporativa

Destaques pontuais em magenta

Fonte Inter

🛡️ Princípios de segurança do projeto

Este projeto segue algumas regras importantes:

1. O frontend não define permissões

Nunca utilizar como segurança real:

role = "admin"

definido pelo próprio React.

Papéis administrativos deverão ser controlados no backend.

2. Nenhum segredo no VITE_

Tudo que começa com:

VITE_

pode ser acessado pelo navegador.

3. RLS antes de dados internos

Antes de liberar leitura ou gravação de dados reais no Dashboard, serão criadas políticas de:

Row Level Security

no Supabase.

4. Rotas não substituem autorização

ProtectedRoute protege a experiência da interface.

O banco deverá continuar validando acesso independentemente do React.

5. HTTPS em produção

A versão publicada deverá utilizar HTTPS.

🚧 Próximas etapas

O projeto ainda está em desenvolvimento.

Próximas evoluções previstas:

Finalizar página de Manuais

Vincular PDFs reais aos cards

Criar páginas para Vídeos de Instalação

Criar Treinamentos Técnicos

Criar área de Fichas Técnicas

Criar galeria de Imagens de Produtos

Criar área de Materiais de Marketing

Criar Perguntas Frequentes

Criar área de Assistência Técnica

Criar área de Novidades Synter

Implementar RLS nas tabelas

Criar sistema seguro de perfis e permissões

Criar perfil administrativo pelo backend

Melhorar responsividade

Implementar tratamento global de erros

Criar loading profissional das rotas

Preparar aplicação para produção

Configurar domínio e HTTPS

📦 Git

Fluxo básico utilizado durante o desenvolvimento:

git add .
git commit -m "Descrição da alteração"
git push

Quando houver alterações remotas:

git pull --rebase origin main
git push

📍 Status atual

🟢 Autenticação ............... Implementada
🟢 Cadastro ................... Implementado
🟢 CAPTCHA .................... Implementado
🟢 Recuperação de senha ....... Implementada
🟢 Sessão ..................... Implementada
🟢 Proteção de rotas .......... Implementada
🟢 Perfil em modal ............ Implementado
🟢 Dashboard .................. Em desenvolvimento
🟡 Manuais .................... Em desenvolvimento
🟡 Conteúdos internos ......... Em desenvolvimento
🟡 RLS ........................ Próxima etapa

<div align="center">

Synter

Soluções inteligentes e eficientes para o seu negócio.

Universidade Synter • Projeto em desenvolvimento

</div>