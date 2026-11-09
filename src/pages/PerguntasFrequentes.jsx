
import { useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/PerguntasFrequentes.css";
import "../styles/PerguntasFrequentesMobile.css";

// ==========================================
// CATEGORIAS
// ==========================================

const categorias = [
  { id: "todas", nome: "Todas as perguntas" },
  { id: "aplicativo", nome: "Aplicativo Synter Smart" },
  { id: "fechaduras", nome: "Fechaduras Eletrônicas" },
  { id: "controladoras", nome: "Controladoras de Acesso" },
  { id: "gerais", nome: "Dúvidas Gerais" },
];

// ==========================================
// PERGUNTAS E RESPOSTAS ORIGINAIS
// ==========================================

const perguntas = [
  // APLICATIVO SYNTER SMART

  {
    id: 1,
    categoria: "aplicativo",
    pergunta:
      "Como conectar minha fechadura ao aplicativo Synter Smart?",
    resposta:
      "Na tela principal do aplicativo, toque no botão (+), localizado no canto superior direito. Selecione o produto desejado e siga as instruções apresentadas para adicionar o dispositivo.",
  },
  {
    id: 2,
    categoria: "aplicativo",
    pergunta:
      "Posso controlar mais de uma fechadura no mesmo aplicativo?",
    resposta:
      "Sim. O aplicativo permite cadastrar e gerenciar múltiplas fechaduras em uma única conta.",
  },
  {
    id: 3,
    categoria: "aplicativo",
    pergunta: "Duas pessoas podem acessar a mesma conta?",
    resposta:
      "Sim. Quando duas pessoas utilizam a mesma conta, ambas possuem o mesmo nível de acesso e visualizam os mesmos dispositivos. Para compartilhar apenas determinados acessos, considere utilizar a função de convites.",
  },
  {
    id: 4,
    categoria: "aplicativo",
    pergunta:
      "É seguro controlar minha fechadura pelo aplicativo?",
    resposta:
      "A comunicação entre o aplicativo Synter Smart e os dispositivos utiliza mecanismos de proteção dos dados. É importante manter as credenciais da conta protegidas e utilizar as funções de compartilhamento de acesso adequadamente.",
  },
  {
    id: 5,
    categoria: "aplicativo",
    pergunta:
      "O Bluetooth precisa permanecer sempre ligado?",
    resposta:
      "Não. O Bluetooth precisa estar ativo quando for necessário interagir com o dispositivo por meio dessa conexão.",
  },
  {
    id: 6,
    categoria: "aplicativo",
    pergunta:
      "Posso entrar na mesma conta em dois smartphones?",
    resposta:
      "Sim. O material do Synter Smart informa que não há limite de smartphones conectados à mesma conta.",
  },

  // FECHADURAS ELETRÔNICAS

  {
    id: 7,
    categoria: "fechaduras",
    pergunta:
      "Quais são os benefícios das fechaduras eletrônicas?",
    resposta:
      "As fechaduras eletrônicas oferecem praticidade e permitem acessar ambientes sem depender exclusivamente de chaves físicas. Conforme o modelo, podem utilizar aplicativo, senha, TAG ou impressão digital.",
  },
  {
    id: 8,
    categoria: "fechaduras",
    pergunta:
      "Quais são os principais métodos de abertura?",
    resposta:
      "Entre os métodos disponíveis estão aplicativo, senhas numéricas, TAGs RFID e impressões digitais. Os recursos específicos variam conforme o modelo.",
  },
  {
    id: 9,
    categoria: "fechaduras",
    pergunta:
      "O que fazer quando as pilhas da fechadura acabarem?",
    resposta:
      "Consulte o procedimento de alimentação de emergência do modelo. Em fechaduras compatíveis, é possível conectar um power bank à entrada USB de emergência para alimentar temporariamente o equipamento e realizar a abertura.",
  },
  {
    id: 10,
    categoria: "fechaduras",
    pergunta:
      "As fechaduras podem ser integradas à automação residencial?",
    resposta:
      "Determinados modelos são compatíveis com integração à Alexa. A disponibilidade depende do dispositivo e, em algumas versões, exige a utilização de um gateway.",
  },
  {
    id: 11,
    categoria: "fechaduras",
    pergunta:
      "Como cadastrar senhas, TAGs e impressões digitais?",
    resposta:
      "Acesse o dispositivo no aplicativo Synter Smart e abra suas configurações. Utilize o menu de cadastro dos métodos de acesso disponíveis para o modelo e siga as instruções apresentadas.",
  },
  {
    id: 12,
    categoria: "fechaduras",
    pergunta:
      "Como restaurar uma fechadura às configurações de fábrica?",
    resposta:
      "O procedimento depende da linha e do modelo. Geralmente há um botão de reset próximo ao compartimento de pilhas. Consulte o manual específico antes de realizar a restauração, pois ela pode exigir senha de inicialização e afetar os cadastros existentes.",
  },
  {
    id: 13,
    categoria: "fechaduras",
    pergunta:
      "Existe diferença entre fechadura digital e eletrônica?",
    resposta:
      "Os dois termos são utilizados para identificar fechaduras com funcionamento eletrônico. A denominação pode variar entre fabricantes.",
  },
  {
    id: 14,
    categoria: "fechaduras",
    pergunta:
      "Qual a diferença entre fechaduras de embutir e de sobrepor?",
    resposta:
      "A fechadura de embutir possui a máquina instalada dentro da espessura da porta. Já a fechadura de sobrepor é fixada sobre a superfície da porta ou de sua estrutura.",
  },
  {
    id: 15,
    categoria: "fechaduras",
    pergunta:
      "Posso instalar a fechadura em qualquer tipo de porta?",
    resposta:
      "Não necessariamente. A instalação deve respeitar as especificações do modelo, incluindo tipo de porta, espessura mínima e máxima e demais condições descritas no manual.",
  },
  {
    id: 16,
    categoria: "fechaduras",
    pergunta:
      "É possível inverter o lado de abertura da fechadura?",
    resposta:
      "Sim. O material técnico informa que os modelos de fechaduras eletrônicas Synter possuem recursos de reversão para adequação ao sentido de abertura. O procedimento específico deve ser consultado no manual do equipamento.",
  },
  {
    id: 17,
    categoria: "fechaduras",
    pergunta: "Qual é a duração das pilhas?",
    resposta:
      "O material de referência indica autonomia média de 10 a 12 meses, dependendo da intensidade de utilização. O resultado real pode variar conforme o modelo, as condições de instalação e a qualidade das pilhas.",
  },
  {
    id: 18,
    categoria: "fechaduras",
    pergunta:
      "A fechadura perde os cadastros quando as pilhas acabam?",
    resposta:
      "Não. As informações de acesso cadastradas permanecem armazenadas no dispositivo, conforme o material técnico Synter.",
  },
  {
    id: 19,
    categoria: "fechaduras",
    pergunta: "Como funciona o modo de privacidade?",
    resposta:
      "Em modelos compatíveis, o modo de privacidade restringe a abertura por métodos como senhas, TAGs e impressões digitais. Consulte o manual do modelo para verificar quais formas de acesso permanecem disponíveis.",
  },
  {
    id: 20,
    categoria: "fechaduras",
    pergunta:
      "O leitor biométrico não reconhece minha digital. O que fazer?",
    resposta:
      "Limpe cuidadosamente o sensor com um pano macio e seco. Verifique se o dedo está limpo e sem excesso de umidade ou gordura. Caso o problema continue, procure o suporte técnico.",
  },
  {
    id: 21,
    categoria: "fechaduras",
    pergunta: "Posso utilizar pilhas recarregáveis?",
    resposta:
      "Para os modelos alimentados por pilhas indicados no material técnico, devem ser utilizadas pilhas alcalinas AA de 1,5 V, não recarregáveis. Não misture pilhas novas e usadas.",
  },

  // CONTROLADORAS DE ACESSO

  {
    id: 22,
    categoria: "controladoras",
    pergunta:
      "Quais são os métodos de autenticação das controladoras?",
    resposta:
      "Dependendo do modelo, podem utilizar aplicativo, senhas numéricas, TAGs RFID, impressões digitais, QR Codes e reconhecimento facial.",
  },
  {
    id: 23,
    categoria: "controladoras",
    pergunta:
      "O que acontece com a controladora em caso de falta de energia?",
    resposta:
      "Quando a alimentação é interrompida, a controladora deixa de operar o dispositivo de bloqueio. O material recomenda prever um sistema de alimentação de emergência, considerando também o comportamento do mecanismo de travamento instalado.",
  },
  {
    id: 24,
    categoria: "controladoras",
    pergunta:
      "Como cadastrar acessos em uma controladora?",
    resposta:
      "No aplicativo Synter Smart, acesse as configurações do dispositivo e utilize as opções disponíveis para cadastrar senhas, TAGs, biometrias e outros métodos compatíveis.",
  },
  {
    id: 25,
    categoria: "controladoras",
    pergunta: "Quantos QR Codes podem ser gerados?",
    resposta:
      "O limite depende do modelo da controladora. Consulte o manual do equipamento para verificar a capacidade de cadastro.",
  },

  // DÚVIDAS GERAIS

  {
    id: 26,
    categoria: "gerais",
    pergunta:
      "Posso cadastrar TAGs de outros fabricantes?",
    resposta:
      "O material indica compatibilidade com TAGs RFID MIFARE de 13,56 MHz. Verifique também os requisitos específicos do modelo antes de utilizar acessórios de terceiros.",
  },
  {
    id: 27,
    categoria: "gerais",
    pergunta:
      "Quais dispositivos podem ser integrados à Alexa?",
    resposta:
      "O material de perguntas frequentes menciona os dispositivos da linha S2 em conjunto com o gateway G2. A compatibilidade de outras linhas e versões deve ser verificada no manual correspondente.",
  },
  {
    id: 28,
    categoria: "gerais",
    pergunta:
      "É possível conceder acesso temporário a outras pessoas?",
    resposta:
      "Sim. Conforme os recursos disponíveis no dispositivo, é possível compartilhar acessos temporários por convites, senhas, TAGs e biometrias.",
  },
  {
    id: 29,
    categoria: "gerais",
    pergunta:
      "A fechadura funciona quando a internet está indisponível?",
    resposta:
      "Os dispositivos compatíveis podem funcionar localmente por Bluetooth, sem necessidade de internet para determinadas operações. Alguns recursos, especialmente os destinados a convidados e ao acesso remoto, podem exigir conexão.",
  },
  {
    id: 30,
    categoria: "gerais",
    pergunta:
      "A fechadura pode ficar exposta à chuva?",
    resposta:
      "A resistência à água depende do grau de proteção IP e das condições de instalação especificadas para cada modelo. Antes de instalar em áreas externas, consulte o manual do produto.",
  },
  {
    id: 31,
    categoria: "gerais",
    pergunta:
      "O que fazer com a fechadura quando o imóvel for vendido?",
    resposta:
      "O dispositivo deve ser desvinculado da conta do antigo proprietário. Caso não seja possível realizar a transferência normalmente, siga o procedimento de restauração e novo cadastro descrito no manual.",
  },
];

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function IconeBusca() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function IconeCategoria() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="M3 7v10l9 5 9-5V7" />
      <path d="M12 12v10" />
    </svg>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function PerguntasFrequentes() {
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] =
    useState("todas");

  const [perguntaAberta, setPerguntaAberta] =
    useState(null);

  const [perfilOpen, setPerfilOpen] =
    useState(false);

  const [limiteMobile, setLimiteMobile] =
    useState(3);

  // ========================================
  // FILTRAR PERGUNTAS
  // ========================================

  const perguntasFiltradas = useMemo(() => {
    const termo = normalizarTexto(pesquisa);

    return perguntas.filter((item) => {
      const pertenceCategoria =
        categoriaAtiva === "todas" ||
        item.categoria === categoriaAtiva;

      const correspondePesquisa =
        !termo ||
        normalizarTexto(
          `${item.pergunta} ${item.resposta}`
        ).includes(termo);

      return pertenceCategoria && correspondePesquisa;
    });
  }, [pesquisa, categoriaAtiva]);

  const temMaisNoMobile =
    perguntasFiltradas.length > limiteMobile;

  const podeMostrarMenos =
    limiteMobile > 3;

  // ========================================
  // INTERAÇÕES
  // ========================================

  function selecionarCategoria(id) {
    setCategoriaAtiva(id);
    setPerguntaAberta(null);
    setLimiteMobile(3);
  }

  function alterarPesquisa(valor) {
    setPesquisa(valor);
    setPerguntaAberta(null);
    setLimiteMobile(3);
  }

  function alternarPergunta(id) {
    setPerguntaAberta((atual) =>
      atual === id ? null : id
    );
  }

  function limparFiltros() {
    setPesquisa("");
    setCategoriaAtiva("todas");
    setPerguntaAberta(null);
    setLimiteMobile(3);
  }

  function mostrarMais() {
    setLimiteMobile((atual) => atual + 3);
  }

  function mostrarMenos() {
    setLimiteMobile(3);
    setPerguntaAberta(null);
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="faq-page">
      <Header />

      <main className="faq-main">
        {/* ===================================
            HERO
        =================================== */}

        <section className="faq-hero">
          <div className="faq-profile">
            <UserProfileButton
              onClick={() => setPerfilOpen(true)}
            />
          </div>

          <div className="faq-hero-content">
            <div className="faq-eyebrow">
              <IconeCategoria />
              <span>CENTRAL DE CONHECIMENTO</span>
            </div>

            <h1>Perguntas Frequentes</h1>

            <p>
              Encontre respostas sobre nossos
              produtos, aplicativos e soluções
              de controle de acesso.
            </p>
          </div>
        </section>

        {/* ===================================
            CONTEÚDO
        =================================== */}

        <section className="faq-content">
          {/* CABEÇALHO INTERNO */}

          <div className="faq-section-heading">
            <span className="faq-section-bar" />

            <div>
              <span className="faq-section-label">
                CENTRAL DE AJUDA
              </span>

              <h2>Como podemos ajudar?</h2>

              <p>
                Consulte as principais orientações
                técnicas e informações dos produtos Synter.
              </p>
            </div>
          </div>

          {/* ===================================
              PESQUISA
          =================================== */}

          <div className="faq-search">
            <IconeBusca />

            <input
              type="search"
              value={pesquisa}
              onChange={(evento) =>
                alterarPesquisa(evento.target.value)
              }
              placeholder="Pesquisar pergunta, produto ou palavra-chave..."
              aria-label="Pesquisar perguntas frequentes"
            />

            {pesquisa && (
              <button
                type="button"
                onClick={() => alterarPesquisa("")}
                aria-label="Limpar pesquisa"
              >
                Limpar
              </button>
            )}
          </div>

          {/* ===================================
              CATEGORIAS — DESKTOP
          =================================== */}

          <div
            className="faq-categories"
            aria-label="Filtrar perguntas por categoria"
          >
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                className={
                  categoriaAtiva === categoria.id
                    ? "faq-category active"
                    : "faq-category"
                }
                onClick={() =>
                  selecionarCategoria(categoria.id)
                }
                aria-pressed={
                  categoriaAtiva === categoria.id
                }
              >
                {categoria.nome}
              </button>
            ))}
          </div>

          {/* ===================================
              CATEGORIAS — MOBILE
          =================================== */}

          <div className="faq-mobile-filter">
            <label htmlFor="faq-mobile-categoria">
              Categoria
            </label>

            <select
              id="faq-mobile-categoria"
              value={categoriaAtiva}
              onChange={(evento) =>
                selecionarCategoria(evento.target.value)
              }
            >
              {categorias.map((categoria) => (
                <option
                  key={categoria.id}
                  value={categoria.id}
                >
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          {/* ===================================
              RESULTADOS
          =================================== */}

          <div className="faq-results-header">
            <div>
              <h3>Perguntas e respostas</h3>

              <p>
                Selecione uma pergunta para visualizar
                a orientação.
              </p>
            </div>

            <span className="faq-count" role="status">
              {perguntasFiltradas.length}{" "}
              {perguntasFiltradas.length === 1
                ? "pergunta"
                : "perguntas"}
            </span>
          </div>

          {/* ===================================
              LISTA
          =================================== */}

          <div className="faq-list">
            {perguntasFiltradas.length === 0 ? (
              <div className="faq-empty">
                <div className="faq-empty-icon">
                  ?
                </div>

                <h3>Nenhum resultado encontrado</h3>

                <p>
                  Tente pesquisar outro termo ou
                  selecione uma categoria diferente.
                </p>

                <button
                  type="button"
                  onClick={limparFiltros}
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              perguntasFiltradas.map((item, indice) => {
                const aberta =
                  perguntaAberta === item.id;

                const ocultarNoMobile =
                  indice >= limiteMobile;

                return (
                  <article
                    key={item.id}
                    className={[
                      "faq-item",
                      aberta ? "open" : "",
                      ocultarNoMobile
                        ? "faq-mobile-hidden"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() =>
                        alternarPergunta(item.id)
                      }
                      aria-expanded={aberta}
                      aria-controls={
                        `faq-resposta-${item.id}`
                      }
                    >
                      <span className="faq-question-text">
                        {item.pergunta}
                      </span>

                      <span
                        className="faq-chevron"
                        aria-hidden="true"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </button>

                    <div
                      id={`faq-resposta-${item.id}`}
                      className="faq-answer"
                      hidden={!aberta}
                    >
                      <p>{item.resposta}</p>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* ===================================
              CONTROLES MOBILE
          =================================== */}

          {perguntasFiltradas.length > 3 && (
            <div className="faq-mobile-pagination">
              {temMaisNoMobile && (
                <button
                  type="button"
                  className="faq-mobile-more"
                  onClick={mostrarMais}
                >
                  Ver mais{" "}
                  {Math.min(
                    3,
                    perguntasFiltradas.length - limiteMobile
                  )}{" "}
                  perguntas
                </button>
              )}

              {podeMostrarMenos && (
                <button
                  type="button"
                  className="faq-mobile-less"
                  onClick={mostrarMenos}
                >
                  Mostrar menos
                </button>
              )}
            </div>
          )}

          {/* ===================================
              ORIENTAÇÃO FINAL
          =================================== */}

          <div className="faq-help">
            <div>
              <h3>Não encontrou sua resposta?</h3>

              <p>
                Para informações específicas sobre
                instalação, configuração ou funcionamento,
                consulte os manuais e materiais de
                treinamento da Universidade Synter.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {perfilOpen && (
        <Profile
          onClose={() => setPerfilOpen(false)}
        />
      )}
    </div>
  );
}
