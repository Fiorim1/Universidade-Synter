
import { useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/AplicativoSynter.css";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const BASE_URL = import.meta.env.BASE_URL || "/";

const MANUAL_PDF =
  `${BASE_URL}manuais/manual-synter-smart.pdf`;

const VIDEO_URL =
  "https://www.youtube.com/watch?v=2ou4INONgvs";

const VIDEO_EMBED =
  "https://www.youtube-nocookie.com/embed/2ou4INONgvs";

const WHATSAPP_URL =
  "https://wa.me/554991664297?text=" +
  encodeURIComponent(
    "Olá! Preciso de ajuda com o aplicativo Synter Smart."
  );

// ==========================================
// CONTEÚDO DO MANUAL OFICIAL SYNTER SMART
// ==========================================

const GUIAS = [
  {
    id: "cadastro",
    categoria: "primeiros",
    titulo: "Realizar cadastro no aplicativo",
    resumo: "Crie e confirme sua conta Synter Smart.",
    icone: "usuario",
    pagina: "02",
    passos: [
      'Abra o aplicativo Synter Smart.',
      'Na tela inicial, toque em "Crie uma conta".',
      "Preencha as informações solicitadas para realizar o cadastro.",
      "Acesse seu e-mail e localize a mensagem de confirmação.",
      "Confirme o cadastro e entre na sua conta.",
    ],
    observacao:
      "Se não encontrar o e-mail de confirmação na caixa de entrada, verifique a pasta de spam.",
  },
  {
    id: "recuperacao",
    categoria: "primeiros",
    titulo: "Recuperação de senha",
    resumo: "Recupere o acesso à sua conta.",
    icone: "usuario",
    pagina: "02",
    passos: [
      "Abra a tela de acesso do aplicativo Synter Smart.",
      'Toque em "Esqueci minha senha".',
      "Informe o e-mail associado à sua conta.",
      "Acesse o e-mail recebido e utilize o link para criar uma nova senha.",
    ],
    observacao:
      "A recuperação depende do acesso ao e-mail cadastrado na conta.",
  },
  {
    id: "inicio",
    categoria: "primeiros",
    titulo: "Conhecer a tela inicial",
    resumo: "Entenda os menus e as funções principais.",
    icone: "controle",
    pagina: "02",
    passos: [
      "Acesse o aplicativo com sua conta.",
      "Utilize Notificações para consultar os avisos recebidos.",
      "Utilize Cadastro para adicionar novos dispositivos.",
      "Acesse Home para visualizar os dispositivos marcados como favoritos.",
      "Acesse Ambientes para organizar os ambientes cadastrados.",
      "Acesse Dispositivos para visualizar todos os equipamentos adicionados.",
      "Acesse Opções para consultar as configurações da conta.",
    ],
    observacao:
      "As seções exibidas poderão variar de acordo com a versão do aplicativo.",
  },
  {
    id: "dispositivo",
    categoria: "primeiros",
    titulo: "Cadastrar uma fechadura",
    resumo: "Adicione e sincronize seu dispositivo.",
    icone: "fechadura",
    pagina: "03",
    passos: [
      'Toque no ícone "+" no canto superior direito.',
      "Selecione o tipo de dispositivo que deseja cadastrar.",
      "Escolha o modelo correspondente ao seu equipamento.",
      "Certifique-se de que a porta esteja aberta antes de iniciar a sincronização.",
      'Siga as instruções na tela e toque em "Sincronizar".',
      "Após sincronizar, atribua um nome para identificar o dispositivo.",
      "Aguarde a conclusão do cadastro.",
    ],
    observacao:
      "Mantenha o Bluetooth do celular ativado e conceda as permissões solicitadas pelo aplicativo.",
  },
  {
    id: "acionamento",
    categoria: "controle",
    titulo: "Abertura e fechamento",
    resumo: "Utilize a tela de acionamento da fechadura.",
    icone: "controle",
    pagina: "03",
    passos: [
      "Entre no aplicativo Synter Smart.",
      "Selecione o dispositivo previamente cadastrado.",
      "Acesse a tela de acionamento do equipamento.",
      "Utilize o controle de abertura para destravar o dispositivo.",
      "Utilize o controle de fechamento para realizar o travamento.",
      "Consulte os atalhos disponíveis para cadastrar métodos de acesso.",
    ],
    observacao:
      "A disponibilidade dos controles depende do dispositivo e das condições de comunicação.",
  },
  {
    id: "configuracoes",
    categoria: "controle",
    titulo: "Configurações do dispositivo",
    resumo: "Acesse os recursos de cada modelo.",
    icone: "ajustes",
    pagina: "03",
    passos: [
      "Abra o dispositivo cadastrado no aplicativo.",
      "Entre na tela de configurações do equipamento.",
      "Consulte as funções disponíveis para o modelo.",
      "Utilize as opções correspondentes para configurar som, cadastrar acessos ou gerenciar o dispositivo.",
    ],
    observacao:
      "As opções de configuração variam conforme o modelo da fechadura.",
  },
  {
    id: "senha",
    categoria: "acessos",
    titulo: "Cadastrar senha numérica",
    resumo: "Crie senhas de acesso pelo aplicativo.",
    icone: "senha",
    pagina: "04",
    passos: [
      "Abra as configurações do dispositivo.",
      'Selecione "Cadastrar Senha".',
      'Toque no ícone "+" para iniciar o cadastro.',
      "Escolha a modalidade de senha disponível.",
      "Preencha as informações solicitadas e siga as instruções do aplicativo.",
    ],
    observacao:
      "O manual diferencia Senha de Usuário, que requer proximidade do dispositivo durante o cadastro, e Senha Remota, que pode ser gerada sem conexão direta com o equipamento.",
  },
  {
    id: "tag",
    categoria: "acessos",
    titulo: "Cadastrar Tag",
    resumo: "Vincule uma tag de acesso à fechadura.",
    icone: "tag",
    pagina: "04",
    passos: [
      "Abra as configurações do dispositivo.",
      'Selecione "Cadastrar Tag".',
      'Toque no ícone "+" para começar.',
      'Atribua um nome à tag e toque em "Iniciar".',
      "Aproxime a tag do dispositivo conforme indicado.",
      "Aguarde a confirmação de conclusão do cadastro.",
    ],
    observacao:
      "Esse recurso depende da compatibilidade do modelo com tags.",
  },
  {
    id: "digital",
    categoria: "acessos",
    titulo: "Cadastrar impressão digital",
    resumo: "Adicione biometria em modelos compatíveis.",
    icone: "digital",
    pagina: "05",
    passos: [
      "Abra as configurações do dispositivo.",
      'Selecione "Cadastrar Digital".',
      'Toque no ícone "+" para iniciar o cadastro.',
      "Preencha as informações solicitadas no aplicativo.",
      "Siga as orientações apresentadas para realizar o cadastro no dispositivo.",
      "Aguarde a conclusão do procedimento.",
    ],
    observacao:
      "O procedimento depende de a fechadura possuir leitor biométrico. Consulte as telas do manual oficial para acompanhar o cadastro.",
  },
  {
    id: "faceid",
    categoria: "acessos",
    titulo: "Cadastrar Face ID",
    resumo: "Configure o reconhecimento facial.",
    icone: "face",
    pagina: "05",
    passos: [
      "Abra as configurações do dispositivo compatível.",
      'Selecione "Cadastrar Face ID".',
      'Toque no ícone "+" para iniciar.',
      'Escolha "Escanear seu rosto".',
      'Toque em "Iniciar" e siga as instruções exibidas na tela.',
    ],
    observacao:
      "Disponível somente em equipamentos compatíveis com reconhecimento facial.",
  },
  {
    id: "qrcode",
    categoria: "acessos",
    titulo: "Cadastrar QR Code",
    resumo: "Gere e compartilhe um código de acesso.",
    icone: "qr",
    pagina: "06",
    passos: [
      "Abra as configurações do dispositivo.",
      'Selecione "Cadastrar QR Code".',
      'Toque no ícone "+" para iniciar.',
      "Identifique o código que será criado.",
      'Toque em "Gerar QR Code".',
      'Utilize "Compartilhar" para enviar o código ao convidado.',
    ],
    observacao:
      "O recurso deve estar disponível no modelo de dispositivo utilizado.",
  },
  {
    id: "convites",
    categoria: "conexao",
    titulo: "Compartilhamento por convites",
    resumo: "Autorize outras pessoas a acessar a fechadura.",
    icone: "pessoas",
    pagina: "06",
    passos: [
      "Abra as configurações do dispositivo.",
      'Selecione "Convites".',
      'Toque no ícone "+" para criar um convite.',
      'Selecione um contato ou toque em "Novo convite".',
      'Informe os dados do convidado e toque em "Próximo".',
      "Escolha o tipo de convite e as permissões desejadas.",
    ],
    observacao:
      "Convite Temporário: possui início e fim definidos. Convite Recorrente: permite dias e horários específicos. Convite Administrativo: concede acesso completo, incluindo gerenciamento de outros acessos.",
  },
  {
    id: "excluir-dispositivo",
    categoria: "controle",
    titulo: "Excluir dispositivo",
    resumo: "Remova um equipamento do aplicativo.",
    icone: "lixeira",
    pagina: "07",
    passos: [
      "Abra as configurações do dispositivo.",
      'Selecione "Excluir dispositivo".',
      "Leia o aviso apresentado e confirme a exclusão.",
    ],
    observacao:
      "O manual informa que, se você estiver distante do dispositivo, poderá ser necessário realizar um reset físico para concluir o processo.",
  },
  {
    id: "excluir-conta",
    categoria: "controle",
    titulo: "Excluir conta",
    resumo: "Saiba como encerrar sua conta Synter Smart.",
    icone: "lixeira",
    pagina: "07",
    passos: [
      "Abra o menu de opções do aplicativo.",
      'Toque em "Editar".',
      'Selecione "Excluir minha conta".',
      "Leia as informações exibidas e confirme a exclusão.",
    ],
    observacao:
      "A exclusão da conta remove permanentemente os dados, conforme a orientação do manual.",
  },
  {
    id: "gateway",
    categoria: "conexao",
    titulo: "Configurar Gateway Synter",
    resumo: "Adicione um Gateway à rede Wi-Fi.",
    icone: "wifi",
    pagina: "07",
    passos: [
      "Abra a área de adição de dispositivos.",
      'Selecione "Synter Gateways".',
      "Escolha o modelo de Gateway desejado.",
      "Identifique o dispositivo conforme as instruções apresentadas.",
      "Informe a senha da rede Wi-Fi à qual o celular está conectado.",
      "Aguarde a conclusão da adição e configuração do Gateway.",
    ],
    observacao:
      "A rede Wi-Fi deve operar na frequência de 2,4 GHz, conforme o manual.",
  },
  {
    id: "controladora",
    categoria: "conexao",
    titulo: "Cadastrar controladora Face ID",
    resumo: "Adicione uma controladora de acesso compatível.",
    icone: "face",
    pagina: "08",
    passos: [
      'Na adição de dispositivos, selecione "Controladora de Acesso".',
      "Escolha o modelo S2 Face ID.",
      "Forneça as informações solicitadas pelo aplicativo.",
      "Cadastre o usuário administrador na controladora.",
      "Informe os dados de acesso do administrador para concluir a configuração.",
    ],
    observacao:
      "Siga o procedimento específico da controladora de acesso S2 Face ID.",
  },
  {
    id: "usuarios-controladora",
    categoria: "conexao",
    titulo: "Cadastrar usuário na controladora",
    resumo: "Gerencie usuários da controladora Face ID.",
    icone: "pessoas",
    pagina: "08",
    passos: [
      "Abra a tela de acionamento da controladora.",
      "Toque no ícone de usuários.",
      'Toque no ícone "+".',
      "Informe os dados do usuário.",
      "Cadastre uma senha ou uma imagem para reconhecimento facial, conforme o recurso desejado.",
    ],
    observacao:
      "Consulte as orientações do manual oficial para os recursos disponíveis na controladora.",
  },
];

// ==========================================
// CATEGORIAS COMPACTAS DO CELULAR
// ==========================================

const CATEGORIAS = [
  { id: "primeiros", titulo: "Primeiros passos", icone: "usuario" },
  { id: "controle", titulo: "Controle e configurações", icone: "ajustes" },
  { id: "acessos", titulo: "Métodos de acesso", icone: "digital" },
  { id: "conexao", titulo: "Compartilhamento e conexão", icone: "wifi" },
];

// ==========================================
// PESQUISA SEM ACENTOS
// ==========================================

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// ==========================================
// ÍCONES SVG
// ==========================================

function Icone({ tipo, tamanho = 24 }) {
  const props = {
    width: tamanho,
    height: tamanho,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const caminhos = {
    cubo: (
      <>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="M3 7v10l9 5 9-5V7" />
        <path d="M12 12v10" />
      </>
    ),
    usuario: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    fechadura: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M15 12h2M7 7h5M7 11h5" />
        <circle cx="15" cy="16" r="1" />
      </>
    ),
    controle: (
      <>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M10 6h4M10 18h4" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    ajustes: (
      <>
        <path d="M4 7h16M4 17h16M8 4v6M16 14v6" />
        <circle cx="8" cy="7" r="2" />
        <circle cx="16" cy="17" r="2" />
      </>
    ),
    senha: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M8 9h2M14 9h2M8 14h2M14 14h2" />
      </>
    ),
    tag: (
      <>
        <path d="M3 12V4h8l10 10-8 8L3 12Z" />
        <circle cx="8" cy="8" r="1.5" />
      </>
    ),
    digital: (
      <>
        <path d="M6 12V9a6 6 0 0 1 12 0v4" />
        <path d="M9 12V9a3 3 0 0 1 6 0v5" />
        <path d="M12 11v8M6 15c0 3 1 5 3 6M18 16c0 2-1 4-2 5" />
      </>
    ),
    face: (
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
        <circle cx="9" cy="10" r="1" />
        <circle cx="15" cy="10" r="1" />
        <path d="M9 15c2 2 4 2 6 0" />
      </>
    ),
    qr: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <path d="M15 14h2v2h-2zM20 14v3M14 20h3M20 20h1" />
      </>
    ),
    pessoas: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1" />
      </>
    ),
    lixeira: (
      <>
        <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />
      </>
    ),
    wifi: (
      <>
        <path d="M2 9a15 15 0 0 1 20 0" />
        <path d="M5 12a10 10 0 0 1 14 0" />
        <path d="M8.5 15.5a5 5 0 0 1 7 0" />
        <circle cx="12" cy="19" r="1" />
      </>
    ),
    busca: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    seta: (
      <path d="m7 10 5 5 5-5" />
    ),
    video: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="m10 8 6 4-6 4V8Z" />
      </>
    ),
    externo: (
      <>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
      </>
    ),
    arquivo: (
      <>
        <path d="M6 2h8l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
        <path d="M14 2v6h5M8 13h8M8 17h6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5" />
        <path d="M5 17v4h14v-4" />
      </>
    ),
  };

  return (
    <svg {...props}>
      {caminhos[tipo] || caminhos.arquivo}
    </svg>
  );
}

// ==========================================
// CARTÃO DE GUIA
// ==========================================

function CardGuia({ guia, numero, aberto, onToggle }) {
  const painelId = `appsynter-guia-${guia.id}`;

  return (
    <article
      className={`appsynter-guide-card ${
        aberto ? "is-open" : ""
      }`}
    >
      <button
        type="button"
        className="appsynter-guide-trigger"
        onClick={onToggle}
        aria-expanded={aberto}
        aria-controls={painelId}
      >
        <span className="appsynter-guide-icon">
          <Icone tipo={guia.icone} tamanho={30} />
        </span>

        <span className="appsynter-guide-heading">
          <span className="appsynter-guide-number">
            ETAPA {String(numero).padStart(2, "0")}
          </span>

          <strong>{guia.titulo}</strong>

          <span className="appsynter-guide-summary">
            {guia.resumo}
          </span>
        </span>

        <span className="appsynter-guide-arrow">
          <Icone tipo="seta" tamanho={20} />
        </span>
      </button>

      {aberto && (
        <div
          id={painelId}
          className="appsynter-guide-detail"
        >
          <ol className="appsynter-guide-steps">
            {guia.passos.map((passo, indice) => (
              <li key={`${guia.id}-${indice}`}>
                {passo}
              </li>
            ))}
          </ol>

          {guia.observacao && (
            <div className="appsynter-guide-note">
              <strong>Orientação importante</strong>
              <p>{guia.observacao}</p>
            </div>
          )}

          <div className="appsynter-guide-reference">
            <Icone tipo="arquivo" tamanho={16} />
            <span>Manual oficial — página {guia.pagina}</span>
            <a
              href={`${MANUAL_PDF}#page=${Number(guia.pagina)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar manual
            </a>
          </div>
        </div>
      )}
    </article>
  );
}

// ==========================================
// PÁGINA APLICATIVO SYNTER
// ==========================================

export default function AplicativoSynter() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  // Todos os guias começam fechados.
  const [guiaAberto, setGuiaAberto] =
    useState(null);

  const [categoriaAberta, setCategoriaAberta] = useState(null);
  const [videoMobileAberto, setVideoMobileAberto] = useState(false);

  const guiasFiltrados = useMemo(() => {
    const termo = normalizar(pesquisa.trim());

    if (!termo) {
      return GUIAS;
    }

    return GUIAS.filter((guia) =>
      normalizar(
        [
          guia.titulo,
          guia.resumo,
          guia.observacao,
          ...guia.passos,
        ].join(" ")
      ).includes(termo)
    );
  }, [pesquisa]);

  function alternarGuia(id) {
    setGuiaAberto((atual) =>
      atual === id ? null : id
    );
  }

  function alternarCategoria(id) {
    setCategoriaAberta((atual) => atual === id ? null : id);
    setGuiaAberto(null);
  }

  return (
    <div className="appsynter-page">
      <Header />

      {/* HERO */}

      <section className="appsynter-hero">
        <div className="appsynter-container appsynter-hero-inner">
          <div className="appsynter-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          <div className="appsynter-eyebrow">
            <Icone tipo="cubo" />
            <span>GUIA E CONFIGURAÇÃO</span>
          </div>

          <h1>Aplicativo Synter</h1>

          <p className="appsynter-hero-description">
            Aprenda a utilizar o Synter Smart,
            cadastrar dispositivos e gerenciar os
            recursos disponíveis em sua fechadura,
            com orientações do manual oficial.
          </p>

          <div className="appsynter-hero-features">
            <span>Guia passo a passo</span>
            <span>Manual oficial em PDF</span>
            <span>Vídeo demonstrativo</span>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}

      <main className="appsynter-container appsynter-main">

        {/* MANUAL OFICIAL */}

        <section className="appsynter-manual-card">
          <div className="appsynter-manual-icon">
            <Icone tipo="arquivo" tamanho={32} />
          </div>

          <div className="appsynter-manual-content">
            <span className="appsynter-manual-label">
              DOCUMENTAÇÃO OFICIAL SYNTER
            </span>

            <h2>Manual de Uso — Synter Smart</h2>

            <p>
              Consulte o manual completo para
              acompanhar as telas do aplicativo e
              os procedimentos ilustrados.
            </p>

            <span className="appsynter-manual-meta">
              Documento PDF • 9 páginas
            </span>
          </div>

          <div className="appsynter-manual-actions">
            <a
              href={MANUAL_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="appsynter-manual-button secondary"
            >
              <Icone tipo="externo" tamanho={17} />
              Visualizar Manual
            </a>

            <a
              href={MANUAL_PDF}
              download="Manual-Synter-Smart.pdf"
              className="appsynter-manual-button primary"
            >
              <Icone tipo="download" tamanho={17} />
              Baixar PDF
            </a>
          </div>
        </section>

        {/* MANUAL EM DOIS BOTÕES NO CELULAR */}
        <nav className="appsynter-mobile-manual" aria-label="Manual Synter Smart">
          <a href={MANUAL_PDF} target="_blank" rel="noopener noreferrer"
             className="appsynter-mobile-manual-link">
            <Icone tipo="arquivo" tamanho={22} />
            <span>Visualizar manual</span>
          </a>
          <a href={MANUAL_PDF} download="Manual-Synter-Smart.pdf"
             className="appsynter-mobile-manual-link">
            <Icone tipo="download" tamanho={22} />
            <span>Baixar PDF</span>
          </a>
        </nav>

        {/* TÍTULO DO GUIA */}

        <div className="appsynter-section-title">
          <span className="appsynter-section-line" />
          <div>
            <h2>GUIA DE UTILIZAÇÃO</h2>
            <p>
              Escolha um assunto para consultar
              as instruções do aplicativo.
            </p>
          </div>
        </div>

        {/* PESQUISA */}

        <div className="appsynter-search">
          <Icone tipo="busca" tamanho={20} />

          <input
            type="search"
            value={pesquisa}
            onChange={(evento) =>
              setPesquisa(evento.target.value)
            }
            placeholder="Pesquisar senha, digital, QR Code, Gateway..."
            aria-label="Pesquisar instruções"
          />
        </div>

        {/* DESKTOP: CARDS INDIVIDUAIS */}
        <div className="appsynter-desktop-guides">


        {guiasFiltrados.length > 0 ? (
          <div className="appsynter-guide-grid">
            {guiasFiltrados.map((guia) => (
              <CardGuia
                key={guia.id}
                guia={guia}
                numero={GUIAS.indexOf(guia) + 1}
                aberto={guiaAberto === guia.id}
                onToggle={() =>
                  alternarGuia(guia.id)
                }
              />
            ))}
          </div>
        ) : (
          <div className="appsynter-empty">
            <strong>
              Nenhum conteúdo encontrado.
            </strong>

            <p>
              Tente pesquisar utilizando outro termo.
            </p>

            <button
              type="button"
              onClick={() => setPesquisa("")}
            >
              Limpar pesquisa
            </button>
          </div>
        )}

        </div>

        {/* CELULAR: QUATRO CATEGORIAS FECHADAS */}
        <div className="appsynter-mobile-guides">
          {pesquisa.trim() ? (
            <div className="appsynter-mobile-results">
              <p className="appsynter-mobile-result-count">
                {guiasFiltrados.length} {guiasFiltrados.length === 1 ? "assunto encontrado" : "assuntos encontrados"}
              </p>
              {guiasFiltrados.map((guia) => (
                <CardGuia
                  key={guia.id}
                  guia={guia}
                  numero={GUIAS.indexOf(guia) + 1}
                  aberto={guiaAberto === guia.id}
                  onToggle={() => alternarGuia(guia.id)}
                />
              ))}
              {guiasFiltrados.length === 0 && (
                <div className="appsynter-empty">
                  <strong>Nenhum assunto encontrado.</strong>
                  <p>Tente outra palavra na pesquisa.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="appsynter-mobile-categories">
              {CATEGORIAS.map((categoria) => {
                const aberta = categoriaAberta === categoria.id;
                const guiasDaCategoria = GUIAS.filter(
                  (guia) => guia.categoria === categoria.id
                );
                return (
                  <section key={categoria.id}
                    className={`appsynter-category ${aberta ? "is-open" : ""}`}>
                    <button
                      type="button"
                      className="appsynter-category-trigger"
                      aria-expanded={aberta}
                      aria-controls={`appsynter-cat-${categoria.id}`}
                      onClick={() => alternarCategoria(categoria.id)}
                    >
                      <span className="appsynter-category-icon">
                        <Icone tipo={categoria.icone} tamanho={22} />
                      </span>
                      <span className="appsynter-category-text">
                        <strong>{categoria.titulo}</strong>
                        <small>{guiasDaCategoria.length} procedimentos</small>
                      </span>
                      <span className="appsynter-category-chevron">
                        <Icone tipo="seta" tamanho={18} />
                      </span>
                    </button>
                    {aberta && (
                      <div id={`appsynter-cat-${categoria.id}`}
                           className="appsynter-category-content">
                        {guiasDaCategoria.map((guia) => (
                          <CardGuia
                            key={guia.id}
                            guia={guia}
                            numero={GUIAS.indexOf(guia) + 1}
                            aberto={guiaAberto === guia.id}
                            onToggle={() => alternarGuia(guia.id)}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* VÍDEO DEMONSTRATIVO */}

        <section className="appsynter-video-section">
          <div className="appsynter-section-title">
            <span className="appsynter-section-line" />
            <div>
              <h2>VÍDEO DEMONSTRATIVO</h2>
              <p>
                Acompanhe a demonstração de
                utilização do aplicativo Synter Smart.
              </p>
            </div>
          </div>

          <div className="appsynter-desktop-video">
          <div className="appsynter-video-card">
            <div className="appsynter-video-frame">
              <iframe
                src={VIDEO_EMBED}
                title="Guia de uso do aplicativo Synter Smart"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <div className="appsynter-video-footer">
              <div className="appsynter-video-info">
                <span className="appsynter-video-icon">
                  <Icone tipo="video" />
                </span>

                <div>
                  <strong>
                    Guia de Uso — Synter Smart
                  </strong>

                  <p>
                    Tutorial demonstrativo do aplicativo.
                  </p>
                </div>
              </div>

              <a
                href={VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="appsynter-video-link"
              >
                <Icone tipo="externo" tamanho={17} />
                Abrir no YouTube
              </a>
            </div>
          </div>
          </div>

          <div className="appsynter-mobile-video">
            <button type="button" className="appsynter-mobile-video-trigger"
                    aria-expanded={videoMobileAberto}
                    aria-controls="appsynter-video-mobile-painel"
                    onClick={() => setVideoMobileAberto((atual) => !atual)}>
              <Icone tipo="video" tamanho={20} />
              <span>Assistir tutorial demonstrativo</span>
              <Icone tipo="seta" tamanho={18} />
            </button>
            {videoMobileAberto && (
              <div className="appsynter-mobile-video-panel"
                   id="appsynter-video-mobile-painel">
                <div className="appsynter-video-frame">
                  <iframe
                    src={VIDEO_EMBED}
                    title="Tutorial Synter Smart no celular"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer"
                   className="appsynter-video-link">Abrir no YouTube</a>
              </div>
            )}
          </div>
        </section>

        {/* SUPORTE */}

        <section className="appsynter-support">
          <div>
            <span className="appsynter-support-label">
              PRECISA DE AJUDA?
            </span>

            <h2>Suporte Synter</h2>

            <p>
              Se tiver dúvidas sobre o aplicativo
              ou a configuração da sua fechadura,
              entre em contato com nossa equipe.
            </p>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="appsynter-support-button"
          >
            Fale Conosco Agora
            <Icone tipo="externo" tamanho={18} />
          </a>
        </section>

      </main>

      <Footer />

      {/* PERFIL */}

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
