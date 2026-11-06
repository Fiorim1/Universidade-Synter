
import { useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/AplicativoSynter.css";

// ==========================================
// LINKS E CONTATO
// ==========================================

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
// CONTEÚDO DO GUIA
// ==========================================

const GUIAS = [
  {
    id: "cadastro",
    numero: "01",
    titulo: "Cadastro no aplicativo",
    resumo:
      "Crie sua conta e acesse o Synter Smart.",
    passos: [
      "Abra o aplicativo Synter Smart em seu celular.",
      "Na tela inicial, selecione a opção de cadastro.",
      "Informe seu endereço de e-mail e os dados solicitados.",
      "Realize a verificação da conta conforme as instruções exibidas.",
      "Cadastre uma senha de acesso.",
      "Entre no aplicativo com suas credenciais.",
    ],
    observacao:
      "Utilize um e-mail ao qual você tenha acesso para receber as informações de verificação.",
    icone: "usuario",
  },
  {
    id: "fechadura",
    numero: "02",
    titulo: "Adicionar uma fechadura",
    resumo:
      "Vincule um equipamento à sua conta.",
    passos: [
      "Abra o aplicativo Synter Smart.",
      "Acesse a opção de adicionar um dispositivo.",
      "Selecione a categoria correspondente à fechadura inteligente.",
      "Escolha o modelo compatível com seu equipamento, quando solicitado.",
      "Coloque a fechadura em modo de vinculação conforme as instruções específicas do modelo.",
      "Aguarde o reconhecimento do dispositivo pelo aplicativo.",
      "Identifique a fechadura com um nome, como Porta Principal.",
      "Conclua a configuração e confira se o equipamento aparece na tela principal.",
    ],
    observacao:
      "Mantenha o celular próximo ao equipamento durante a vinculação. O procedimento de pareamento pode variar entre modelos.",
    icone: "fechadura",
  },
  {
    id: "controle",
    numero: "03",
    titulo: "Controle da fechadura",
    resumo:
      "Acesse as funções do equipamento cadastrado.",
    passos: [
      "Entre no aplicativo Synter Smart.",
      "Selecione a fechadura cadastrada.",
      "Acesse os controles disponibilizados para o equipamento.",
      "Utilize a função de desbloqueio quando ela estiver disponível.",
      "Verifique o estado e as informações apresentadas no aplicativo.",
    ],
    observacao:
      "As funções de controle dependem do modelo e do tipo de conexão utilizado.",
    icone: "controle",
  },
  {
    id: "acessos",
    numero: "04",
    titulo: "Cadastrar métodos de acesso",
    resumo:
      "Gerencie senhas, cartões e digitais compatíveis.",
    passos: [
      "Selecione a fechadura desejada no Synter Smart.",
      "Acesse a área de gerenciamento dos métodos de acesso.",
      "Escolha a modalidade disponível: senha, cartão ou biometria.",
      "Inicie o cadastro de um novo usuário ou método de identificação.",
      "Siga as instruções apresentadas na tela e, quando necessário, na própria fechadura.",
      "Aguarde a confirmação do cadastro.",
      "Teste o novo método para verificar o funcionamento.",
    ],
    observacao:
      "Nem todas as fechaduras possuem os mesmos métodos de autenticação. Utilize apenas os recursos compatíveis com seu modelo.",
    icone: "digital",
  },
  {
    id: "convites",
    numero: "05",
    titulo: "Compartilhamento de acesso",
    resumo:
      "Gerencie convites e permissões de utilização.",
    passos: [
      "Abra a fechadura cadastrada no aplicativo.",
      "Procure a área de compartilhamento ou convites.",
      "Selecione a opção para criar um novo convite.",
      "Informe os dados solicitados do convidado.",
      "Defina as permissões disponíveis.",
      "Confira as informações e confirme o compartilhamento.",
    ],
    observacao:
      "Compartilhe o acesso somente com pessoas autorizadas e revise as permissões quando necessário.",
    icone: "pessoas",
  },
  {
    id: "historico",
    numero: "06",
    titulo: "Consultar histórico",
    resumo:
      "Acompanhe os registros de utilização.",
    passos: [
      "Abra o Synter Smart.",
      "Selecione o equipamento desejado.",
      "Acesse a seção de histórico ou registros.",
      "Consulte os eventos disponibilizados pelo equipamento.",
    ],
    observacao:
      "A disponibilidade e a atualização dos registros dependem dos recursos do modelo e da sincronização.",
    icone: "historico",
  },
  {
    id: "gateway",
    numero: "07",
    titulo: "Configurar o Gateway Synter",
    resumo:
      "Configure a comunicação de dispositivos compatíveis.",
    passos: [
      "Conecte o Gateway Synter à alimentação elétrica.",
      "Abra o aplicativo Synter Smart.",
      "Acesse a função de adicionar dispositivo e selecione o Gateway.",
      "Inicie a configuração conforme as instruções exibidas.",
      "Selecione a rede Wi-Fi de 2,4 GHz.",
      "Informe a senha da rede.",
      "Aguarde a conclusão da configuração.",
      "Verifique se o Gateway aparece no aplicativo.",
      "Faça a associação com a fechadura compatível, conforme as opções disponibilizadas.",
    ],
    observacao:
      "Verifique a compatibilidade do Gateway com a fechadura. A comunicação remota depende de uma conexão adequada.",
    icone: "wifi",
  },
];

// ==========================================
// ÍCONES SVG
// ==========================================

function Icone({ tipo, tamanho = 24 }) {
  const comum = {
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

  if (tipo === "cubo") {
    return (
      <svg {...comum}>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="M3 7v10l9 5 9-5V7" />
        <path d="M12 12v10" />
      </svg>
    );
  }

  if (tipo === "usuario") {
    return (
      <svg {...comum}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </svg>
    );
  }

  if (tipo === "fechadura") {
    return (
      <svg {...comum}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M15 12h2M7 7h5M7 11h5" />
        <circle cx="15" cy="16" r="1" />
      </svg>
    );
  }

  if (tipo === "controle") {
    return (
      <svg {...comum}>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M10 6h4M10 18h4" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }

  if (tipo === "digital") {
    return (
      <svg {...comum}>
        <path d="M6 12V9a6 6 0 0 1 12 0v4" />
        <path d="M9 12V9a3 3 0 0 1 6 0v5" />
        <path d="M12 11v8M6 15c0 3 1 5 3 6M18 16c0 2-1 4-2 5" />
      </svg>
    );
  }

  if (tipo === "pessoas") {
    return (
      <svg {...comum}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1" />
      </svg>
    );
  }

  if (tipo === "historico") {
    return (
      <svg {...comum}>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l4 2" />
      </svg>
    );
  }

  if (tipo === "wifi") {
    return (
      <svg {...comum}>
        <path d="M2 9a15 15 0 0 1 20 0" />
        <path d="M5 12a10 10 0 0 1 14 0" />
        <path d="M8.5 15.5a5 5 0 0 1 7 0" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    );
  }

  if (tipo === "busca") {
    return (
      <svg {...comum}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </svg>
    );
  }

  if (tipo === "seta") {
    return (
      <svg {...comum}>
        <path d="m7 10 5 5 5-5" />
      </svg>
    );
  }

  if (tipo === "video") {
    return (
      <svg {...comum}>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="m10 8 6 4-6 4V8Z" />
      </svg>
    );
  }

  if (tipo === "externo") {
    return (
      <svg {...comum}>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
      </svg>
    );
  }

  return null;
}

// ==========================================
// CARTÃO DE ORIENTAÇÃO
// ==========================================

function CardGuia({ guia, aberto, onToggle }) {
  const painelId = `synter-guia-${guia.id}`;

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
            ETAPA {guia.numero}
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
        </div>
      )}
    </article>
  );
}

// ==========================================
// PÁGINA APLICATIVO SYNTER
// ==========================================

function AplicativoSynter() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  const [guiaAberto, setGuiaAberto] =
    useState("cadastro");

  const guiasFiltrados = useMemo(() => {
    const normalizar = (texto) =>
      String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const termo = normalizar(pesquisa.trim());

    if (!termo) return GUIAS;

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

  return (
    <div className="appsynter-page">
      <Header />

      {/* ====================================
          HERO
      ==================================== */}

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
            cadastrar dispositivos e gerenciar
            os recursos disponíveis em sua fechadura.
          </p>

          <div className="appsynter-hero-features">
            <span>Guia passo a passo</span>
            <span>Orientações de utilização</span>
            <span>Vídeo demonstrativo</span>
          </div>
        </div>
      </section>

      {/* ====================================
          CONTEÚDO
      ==================================== */}

      <main className="appsynter-container appsynter-main">

        <div className="appsynter-section-title">
          <span className="appsynter-section-line" />

          <div>
            <h2>GUIA DE UTILIZAÇÃO</h2>
            <p>
              Selecione um assunto para consultar
              as instruções.
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
            placeholder="Pesquisar cadastro, biometria, Gateway..."
            aria-label="Pesquisar instruções"
          />
        </div>

        {/* INSTRUÇÕES */}

        {guiasFiltrados.length > 0 ? (
          <div className="appsynter-guide-grid">
            {guiasFiltrados.map((guia) => (
              <CardGuia
                key={guia.id}
                guia={guia}
                aberto={
                  guiaAberto === guia.id
                }
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

        {/* ====================================
            VÍDEO DEMONSTRATIVO
        ==================================== */}

        <section className="appsynter-video-section">
          <div className="appsynter-section-title">
            <span className="appsynter-section-line" />

            <div>
              <h2>VÍDEO DEMONSTRATIVO</h2>
              <p>
                Acompanhe a demonstração de utilização
                do aplicativo Synter Smart.
              </p>
            </div>
          </div>

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
        </section>

        {/* ====================================
            SUPORTE
        ==================================== */}

        <section className="appsynter-support">
          <div>
            <span className="appsynter-support-label">
              PRECISA DE AJUDA?
            </span>

            <h2>
              Suporte Synter
            </h2>

            <p>
              Se tiver dúvidas sobre o aplicativo
              ou a configuração de sua fechadura,
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
          onClose={() =>
            setProfileOpen(false)
          }
        />
      )}
    </div>
  );
}

export default AplicativoSynter;
