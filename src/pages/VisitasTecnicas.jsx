
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import { supabase } from "../services/supabaseClient";
import { baixarVisitaTecnicaPdf } from "../utils/gerarVisitaTecnicaPdf";

import "../styles/VisitasTecnicas.css";
import "../styles/VisitasTecnicasHero.css";

// ========================================
// DADOS DA EMPRESA
// ========================================

const EMPRESA = {
  razao: "Synter Indústria e Comércio Ltda",
  cnpj: "82.996.216/0001-13",
  telefone: "(48) 3941-1192",
  email: "assistencia@synter.com.br",
  endereco:
    "Rodovia Gabriel Arns, 5572 - Forquilhinha/SC - CEP 88850-000",
};

// ========================================
// UTILITÁRIOS
// ========================================

function dataAtualLocal() {
  const agora = new Date();

  const data = new Date(
    agora.getTime() -
      agora.getTimezoneOffset() * 60000
  );

  return data.toISOString().slice(0, 10);
}

function formularioVazio() {
  return {
    numero_atendimento: "",
    data_visita: dataAtualLocal(),
    inicio: "",
    termino: "",
    tecnico_nome: "",
    cliente_nome: "",
    cliente_documento: "",
    cliente_telefone: "",
    cliente_email: "",
    cliente_endereco: "",
    relato_tecnico: "",
  };
}

function formatarData(valor) {
  if (!valor) return "-";

  const partes = String(valor).split("-");

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return String(valor);
}

function formatarHorario(valor) {
  if (!valor) return "-";
  return String(valor).slice(0, 5);
}

// ========================================
// CAMPOS DO FORMULÁRIO
// ========================================

const CAMPOS = [
  {
    name: "numero_atendimento",
    label: "Nº do atendimento",
    type: "text",
    required: true,
    readOnly: true,
  },
  {
    name: "data_visita",
    label: "Data da visita",
    type: "date",
    required: true,
  },
  {
    name: "inicio",
    label: "Horário de início",
    type: "time",
    required: true,
  },
  {
    name: "termino",
    label: "Horário de término",
    type: "time",
  },
  {
    name: "tecnico_nome",
    label: "Técnico responsável",
    type: "text",
    required: true,
  },
  {
    name: "cliente_nome",
    label: "Nome / Razão social",
    type: "text",
    required: true,
  },
  {
    name: "cliente_documento",
    label: "CPF / CNPJ",
    type: "text",
  },
  {
    name: "cliente_telefone",
    label: "Telefone",
    type: "tel",
  },
  {
    name: "cliente_email",
    label: "E-mail",
    type: "email",
  },
  {
    name: "cliente_endereco",
    label: "Endereço completo",
    type: "text",
    wide: true,
  },
];

// ========================================
// ÍCONE PADRÃO DA UNIVERSIDADE SYNTER
// ========================================

function IconeSynter() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="M3 7v10l9 5 9-5V7" />
      <path d="M12 12v10" />
    </svg>
  );
}

// ========================================
// CAMPO DO FORMULÁRIO
// ========================================

function CampoFormulario({
  campo,
  valor,
  onChange,
}) {
  return (
    <label
      className={`vt-campo ${
        campo.wide ? "vt-wide" : ""
      }`}
    >
      <span>
        {campo.label}

        {campo.required && (
          <span className="vt-obrigatorio">
            {" "}*
          </span>
        )}
      </span>

      <input
        type={campo.type}
        name={campo.name}
        value={valor || ""}
        onChange={onChange}
        readOnly={Boolean(campo.readOnly)}
        required={Boolean(campo.required)}
        placeholder={
          campo.readOnly
            ? "Gerando referência..."
            : ""
        }
        autoComplete="off"
      />

      {campo.readOnly && (
        <small
          style={{
            fontSize: 11,
            color: "#999999",
          }}
        >
          Número gerado automaticamente pelo sistema.
        </small>
      )}
    </label>
  );
}

// ========================================
// ASSINATURA DIGITAL
// ========================================

function CampoAssinatura({
  titulo,
  valor,
  onChange,
  resetKey,
}) {
  const canvasRef = useRef(null);
  const desenhandoRef = useRef(false);
  const ponteiroRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 900;
    canvas.height = 300;

    const contexto = canvas.getContext("2d");
    if (!contexto) return;

    contexto.fillStyle = "#ffffff";
    contexto.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    desenhandoRef.current = false;
    ponteiroRef.current = null;
  }, [resetKey]);

  function obterPonto(evento) {
    const canvas = canvasRef.current;
    const retangulo = canvas.getBoundingClientRect();

    return {
      x:
        ((evento.clientX - retangulo.left) /
          retangulo.width) *
        canvas.width,

      y:
        ((evento.clientY - retangulo.top) /
          retangulo.height) *
        canvas.height,
    };
  }

  function iniciarDesenho(evento) {
    if (
      evento.pointerType === "mouse" &&
      evento.button !== 0
    ) {
      return;
    }

    evento.preventDefault();

    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");
    if (!canvas || !contexto) return;

    const ponto = obterPonto(evento);

    canvas.setPointerCapture(evento.pointerId);

    ponteiroRef.current = evento.pointerId;
    desenhandoRef.current = true;

    contexto.strokeStyle = "#111111";
    contexto.lineWidth = 3;
    contexto.lineCap = "round";
    contexto.lineJoin = "round";

    contexto.beginPath();
    contexto.moveTo(ponto.x, ponto.y);
    contexto.lineTo(
      ponto.x + 0.1,
      ponto.y + 0.1
    );
    contexto.stroke();
  }

  function continuarDesenho(evento) {
    if (
      !desenhandoRef.current ||
      ponteiroRef.current !== evento.pointerId
    ) {
      return;
    }

    evento.preventDefault();

    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");
    if (!contexto) return;

    const ponto = obterPonto(evento);

    contexto.lineTo(ponto.x, ponto.y);
    contexto.stroke();
  }

  function finalizarDesenho(evento) {
    if (
      !desenhandoRef.current ||
      ponteiroRef.current !== evento.pointerId
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    desenhandoRef.current = false;
    ponteiroRef.current = null;

    onChange(canvas.toDataURL("image/png"));

    if (canvas.hasPointerCapture(evento.pointerId)) {
      canvas.releasePointerCapture(evento.pointerId);
    }
  }

  function limparAssinatura() {
    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");
    if (!canvas || !contexto) return;

    contexto.fillStyle = "#ffffff";
    contexto.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    desenhandoRef.current = false;
    ponteiroRef.current = null;

    onChange("");
  }

  return (
    <div className="vt-assinatura-container">
      <div className="vt-assinatura-header">
        <div>
          <h3>{titulo}</h3>

          <p>
            Assine com o dedo, mouse ou caneta digital.
          </p>
        </div>

        <span
          className={
            valor
              ? "vt-assinatura-status preenchida"
              : "vt-assinatura-status"
          }
        >
          {valor ? "Assinada" : "Pendente"}
        </span>
      </div>

      <div className="vt-canvas-box">
        <canvas
          ref={canvasRef}
          onPointerDown={iniciarDesenho}
          onPointerMove={continuarDesenho}
          onPointerUp={finalizarDesenho}
          onPointerCancel={finalizarDesenho}
          aria-label={titulo}
          style={{ touchAction: "none" }}
        />
      </div>

      <button
        type="button"
        className="vt-btn vt-btn-secondary"
        onClick={limparAssinatura}
      >
        Limpar assinatura
      </button>
    </div>
  );
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function VisitasTecnicas() {
  const [perfilOpen, setPerfilOpen] =
    useState(false);

  const [formulario, setFormulario] =
    useState(formularioVazio);

  const [assinaturaCliente, setAssinaturaCliente] =
    useState("");

  const [assinaturaTecnico, setAssinaturaTecnico] =
    useState("");

  const [confirmadoCliente, setConfirmadoCliente] =
    useState(false);

  const [resetAssinaturas, setResetAssinaturas] =
    useState(0);

  const [visitas, setVisitas] = useState([]);

  const [visitaSelecionada, setVisitaSelecionada] =
    useState(null);

  const [salvando, setSalvando] =
    useState(false);

  const [carregando, setCarregando] =
    useState(true);

  const [gerandoNumero, setGerandoNumero] =
    useState(true);

  const [baixandoPdfId, setBaixandoPdfId] =
    useState(null);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const geracaoNumeroRef = useRef(0);
  const salvandoRef = useRef(false);

  // ========================================
  // GERAR NÚMERO AUTOMÁTICO
  // ========================================

  const gerarNumeroAtendimento =
    useCallback(async () => {
      const geracao = ++geracaoNumeroRef.current;

      setGerandoNumero(true);

      try {
        const { data, error } = await supabase.rpc(
          "proximo_numero_visita"
        );

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "Referência automática indisponível."
          );
        }

        if (geracao === geracaoNumeroRef.current) {
          setFormulario((anterior) => ({
            ...anterior,
            numero_atendimento: String(data),
          }));
        }
      } catch (error) {
        console.error(
          "Erro ao gerar a referência:",
          error
        );

        if (geracao === geracaoNumeroRef.current) {
          setErro(
            "Não foi possível gerar o número do atendimento. Tente novamente."
          );
        }
      } finally {
        if (geracao === geracaoNumeroRef.current) {
          setGerandoNumero(false);
        }
      }
    }, []);

  // ========================================
  // CARREGAR HISTÓRICO
  // ========================================

  const carregarVisitas =
    useCallback(async () => {
      try {
        setCarregando(true);

        const { data, error } = await supabase
          .from("visitas_tecnicas")
          .select("*")
          .order("criado_em", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        setVisitas(data || []);
      } catch (error) {
        console.error(
          "Erro ao carregar as visitas:",
          error
        );

        setErro(
          "Não foi possível carregar o histórico de visitas. Tente novamente."
        );
      } finally {
        setCarregando(false);
      }
    }, []);

  // ========================================
  // CARREGAMENTO INICIAL
  // ========================================

  useEffect(() => {
    carregarVisitas();
    gerarNumeroAtendimento();
  }, [
    carregarVisitas,
    gerarNumeroAtendimento,
  ]);

  // ========================================
  // ALTERAR FORMULÁRIO
  // ========================================

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    if (name === "numero_atendimento") {
      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // ========================================
  // NOVA VISITA
  // ========================================

  function novaVisita() {
    if (salvandoRef.current || gerandoNumero) {
      return;
    }

    setFormulario(formularioVazio());

    setAssinaturaCliente("");
    setAssinaturaTecnico("");
    setConfirmadoCliente(false);

    setResetAssinaturas(
      (anterior) => anterior + 1
    );

    setVisitaSelecionada(null);
    setErro("");
    setSucesso("");

    gerarNumeroAtendimento();
  }

  // ========================================
  // BAIXAR PDF
  // ========================================

  async function baixarPdf(visita) {
    if (!visita || baixandoPdfId) {
      return;
    }

    try {
      setBaixandoPdfId(visita.id);
      setErro("");

      await baixarVisitaTecnicaPdf(visita);
    } catch (error) {
      console.error(
        "Erro ao gerar o PDF da visita:",
        error
      );

      setErro(
        "Não foi possível gerar o documento PDF. Tente novamente."
      );
    } finally {
      setBaixandoPdfId(null);
    }
  }

  // ========================================
  // SALVAR VISITA
  // ========================================

  async function salvarVisita(evento) {
    evento.preventDefault();

    if (salvandoRef.current) return;

    setErro("");
    setSucesso("");

    if (
      gerandoNumero ||
      !formulario.numero_atendimento
    ) {
      setErro(
        "A referência automática ainda não está disponível."
      );
      return;
    }

    if (!formulario.relato_tecnico.trim()) {
      setErro("Preencha o relatório técnico.");
      return;
    }

    if (!assinaturaCliente) {
      setErro("Solicite a assinatura do cliente.");
      return;
    }

    if (!assinaturaTecnico) {
      setErro(
        "O técnico responsável precisa assinar."
      );
      return;
    }

    if (!confirmadoCliente) {
      setErro(
        "É necessário registrar a confirmação do cliente."
      );
      return;
    }

    if (
      formulario.termino &&
      formulario.inicio &&
      formulario.termino < formulario.inicio
    ) {
      setErro(
        "O horário de término deve ser posterior ao início."
      );
      return;
    }

    salvandoRef.current = true;
    setSalvando(true);

    try {
      const {
        data: { user },
        error: erroAutenticacao,
      } = await supabase.auth.getUser();

      if (erroAutenticacao || !user) {
        throw new Error("SESSAO_EXPIRADA");
      }

      const dadosVisita = {
        tecnico_id: user.id,

        numero_atendimento:
          formulario.numero_atendimento.trim(),

        data_visita: formulario.data_visita,
        inicio: formulario.inicio,
        termino: formulario.termino || null,

        tecnico_nome:
          formulario.tecnico_nome.trim(),

        cliente_nome:
          formulario.cliente_nome.trim(),

        cliente_documento:
          formulario.cliente_documento.trim() || null,

        cliente_telefone:
          formulario.cliente_telefone.trim() || null,

        cliente_email:
          formulario.cliente_email.trim() || null,

        cliente_endereco:
          formulario.cliente_endereco.trim() || null,

        relato_tecnico:
          formulario.relato_tecnico.trim(),

        assinatura_cliente: assinaturaCliente,
        assinatura_tecnico: assinaturaTecnico,

        confirmado_cliente: true,
      };

      const { error } = await supabase
        .from("visitas_tecnicas")
        .insert(dadosVisita);

      if (error) {
        throw error;
      }

      const numeroSalvo =
        dadosVisita.numero_atendimento;

      setFormulario(formularioVazio());

      setAssinaturaCliente("");
      setAssinaturaTecnico("");
      setConfirmadoCliente(false);

      setResetAssinaturas(
        (anterior) => anterior + 1
      );

      setSucesso(
        `Visita ${numeroSalvo} finalizada e salva com sucesso. O PDF está disponível no histórico.`
      );

      await Promise.allSettled([
        carregarVisitas(),
        gerarNumeroAtendimento(),
      ]);
    } catch (error) {
      console.error(
        "Erro ao salvar a visita:",
        error
      );

      setErro(
        error?.message === "SESSAO_EXPIRADA"
          ? "Sua sessão expirou. Entre novamente para continuar."
          : "Não foi possível salvar a visita técnica. Verifique as informações e tente novamente."
      );
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  }

  // ========================================
  // VISUALIZAR VISITA SALVA
  // ========================================

  function visualizarVisita(visita) {
    setVisitaSelecionada(visita);
    setErro("");
    setSucesso("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="visitas-page vt-standard-page">
      <Header />

      {/* =====================================
          HERO — PADRÃO PERGUNTAS FREQUENTES
      ===================================== */}

      <section className="vt-standard-hero">
        <div className="vt-standard-hero-container">

          <div className="vt-standard-profile">
            <UserProfileButton
              onClick={() => setPerfilOpen(true)}
            />
          </div>

          <div className="vt-standard-eyebrow">
            <IconeSynter />
            <span>SUPORTE E ATENDIMENTO</span>
          </div>

          <h1 className="vt-standard-title">
            Visitas Técnicas
          </h1>

          <p className="vt-standard-description">
            Registre atendimentos, documente
            procedimentos e colete assinaturas
            diretamente na plataforma.
          </p>

          <div className="vt-standard-actions">
            <button
              type="button"
              className="vt-btn vt-btn-primary"
              onClick={novaVisita}
              disabled={salvando || gerandoNumero}
            >
              + Nova visita técnica
            </button>
          </div>

        </div>
      </section>

      {/* =====================================
          CONTEÚDO PRINCIPAL
      ===================================== */}

      <main className="visitas-main">

        {/* ALERTAS */}

        {erro && (
          <div
            className="vt-alert vt-alert-error"
            role="alert"
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            className="vt-alert vt-alert-success"
            role="status"
          >
            {sucesso}
          </div>
        )}

        {/* =====================================
            VISITA FINALIZADA
        ===================================== */}

        {visitaSelecionada ? (
          <section className="vt-card">

            <div className="vt-section-heading">
              <div>
                <span className="vt-eyebrow">
                  REGISTRO FINALIZADO
                </span>

                <h2>
                  Atendimento{" "}
                  {visitaSelecionada.numero_atendimento}
                </h2>
              </div>

              <span className="vt-tag">
                Finalizado
              </span>
            </div>

            <div className="vt-detalhes-grid">
              {[
                [
                  "Nº Atendimento",
                  visitaSelecionada.numero_atendimento,
                ],
                [
                  "Data da visita",
                  formatarData(
                    visitaSelecionada.data_visita
                  ),
                ],
                [
                  "Horário de início",
                  formatarHorario(
                    visitaSelecionada.inicio
                  ),
                ],
                [
                  "Horário de término",
                  formatarHorario(
                    visitaSelecionada.termino
                  ),
                ],
                [
                  "Técnico responsável",
                  visitaSelecionada.tecnico_nome,
                ],
                [
                  "Cliente",
                  visitaSelecionada.cliente_nome,
                ],
                [
                  "CPF/CNPJ",
                  visitaSelecionada.cliente_documento ||
                    "-",
                ],
                [
                  "Telefone",
                  visitaSelecionada.cliente_telefone ||
                    "-",
                ],
                [
                  "E-mail",
                  visitaSelecionada.cliente_email ||
                    "-",
                ],
                [
                  "Endereço",
                  visitaSelecionada.cliente_endereco ||
                    "-",
                ],
              ].map(([titulo, valor]) => (
                <div
                  key={titulo}
                  className="vt-detalhe"
                >
                  <span>{titulo}</span>
                  <strong>{valor}</strong>
                </div>
              ))}
            </div>

            <div className="vt-relatorio">
              <h3>Relatório técnico</h3>

              <p>
                {visitaSelecionada.relato_tecnico}
              </p>
            </div>

            <h3 className="vt-subtitulo">
              Assinaturas registradas
            </h3>

            <div className="vt-assinaturas-grid">
              <div>
                <p>Assinatura do cliente</p>

                <img
                  src={
                    visitaSelecionada.assinatura_cliente
                  }
                  alt="Assinatura do cliente"
                  className="vt-assinatura-imagem"
                />
              </div>

              <div>
                <p>Assinatura do técnico</p>

                <img
                  src={
                    visitaSelecionada.assinatura_tecnico
                  }
                  alt="Assinatura do técnico"
                  className="vt-assinatura-imagem"
                />
              </div>
            </div>

            <div className="vt-actions">
              <button
                type="button"
                className="vt-btn vt-btn-primary"
                disabled={Boolean(baixandoPdfId)}
                onClick={() =>
                  baixarPdf(visitaSelecionada)
                }
              >
                {baixandoPdfId === visitaSelecionada.id
                  ? "Gerando PDF..."
                  : "Baixar PDF"}
              </button>

              <button
                type="button"
                className="vt-btn vt-btn-secondary"
                onClick={() =>
                  setVisitaSelecionada(null)
                }
              >
                Voltar ao formulário
              </button>
            </div>
          </section>
        ) : (
          /* =====================================
              FORMULÁRIO DE VISITA TÉCNICA
          ===================================== */

          <form onSubmit={salvarVisita}>

            {/* SEÇÃO 01 — EMPRESA */}

            <section className="vt-card">
              <div className="vt-section-heading">
                <div>
                  <span className="vt-eyebrow">
                    SEÇÃO 01
                  </span>

                  <h2>
                    Identificação da Empresa
                  </h2>
                </div>
              </div>

              <div className="vt-empresa-grid">
                <div>
                  <span>Razão social</span>
                  <strong>{EMPRESA.razao}</strong>
                </div>

                <div>
                  <span>CNPJ</span>
                  <strong>{EMPRESA.cnpj}</strong>
                </div>

                <div>
                  <span>Telefone</span>
                  <strong>{EMPRESA.telefone}</strong>
                </div>

                <div>
                  <span>E-mail</span>
                  <strong>{EMPRESA.email}</strong>
                </div>

                <div className="vt-wide">
                  <span>Endereço</span>
                  <strong>{EMPRESA.endereco}</strong>
                </div>
              </div>
            </section>

            {/* SEÇÃO 02 — ATENDIMENTO */}

            <section className="vt-card">
              <div className="vt-section-heading">
                <div>
                  <span className="vt-eyebrow">
                    SEÇÃO 02
                  </span>

                  <h2>
                    Identificação do Atendimento
                  </h2>

                  <p>
                    A referência é gerada
                    automaticamente pelo sistema.
                    Informe a data, os horários e
                    o técnico responsável.
                  </p>
                </div>

                <span className="vt-tag">
                  {gerandoNumero
                    ? "Gerando..."
                    : "Referência automática"}
                </span>
              </div>

              <div className="vt-form-grid">
                {CAMPOS.slice(0, 5).map((campo) => (
                  <CampoFormulario
                    key={campo.name}
                    campo={campo}
                    valor={formulario[campo.name]}
                    onChange={alterarCampo}
                  />
                ))}
              </div>
            </section>

            {/* SEÇÃO 03 — CLIENTE */}

            <section className="vt-card">
              <div className="vt-section-heading">
                <div>
                  <span className="vt-eyebrow">
                    SEÇÃO 03
                  </span>

                  <h2>
                    Identificação do Cliente
                  </h2>

                  <p>
                    Preencha os dados do cliente
                    atendido durante a visita.
                  </p>
                </div>
              </div>

              <div className="vt-form-grid">
                {CAMPOS.slice(5).map((campo) => (
                  <CampoFormulario
                    key={campo.name}
                    campo={campo}
                    valor={formulario[campo.name]}
                    onChange={alterarCampo}
                  />
                ))}
              </div>
            </section>

            {/* SEÇÃO 04 — RELATÓRIO */}

            <section className="vt-card">
              <div className="vt-section-heading">
                <div>
                  <span className="vt-eyebrow">
                    SEÇÃO 04
                  </span>

                  <h2>Dados da Visita</h2>

                  <p>
                    Registre os problemas identificados,
                    os testes realizados e a solução
                    aplicada.
                  </p>
                </div>
              </div>

              <label className="vt-campo">
                <span>
                  Relatório técnico
                  <span className="vt-obrigatorio">
                    {" "}*
                  </span>
                </span>

                <textarea
                  name="relato_tecnico"
                  value={formulario.relato_tecnico}
                  onChange={alterarCampo}
                  required
                  rows={9}
                  placeholder="Descreva o relato do cliente, o diagnóstico, os procedimentos realizados, as peças substituídas, os testes e a conclusão do atendimento..."
                />
              </label>
            </section>

            {/* SEÇÃO 05 — ASSINATURAS */}

            <section className="vt-card">
              <div className="vt-section-heading">
                <div>
                  <span className="vt-eyebrow">
                    SEÇÃO 05
                  </span>

                  <h2>Assinaturas</h2>

                  <p>
                    As assinaturas do cliente e do
                    técnico são obrigatórias para
                    finalizar a visita.
                  </p>
                </div>
              </div>

              <div className="vt-assinaturas-grid">
                <CampoAssinatura
                  titulo="Assinatura do cliente"
                  valor={assinaturaCliente}
                  onChange={setAssinaturaCliente}
                  resetKey={resetAssinaturas}
                />

                <CampoAssinatura
                  titulo="Assinatura do técnico"
                  valor={assinaturaTecnico}
                  onChange={setAssinaturaTecnico}
                  resetKey={resetAssinaturas}
                />
              </div>

              <label className="vt-confirmacao">
                <input
                  type="checkbox"
                  checked={confirmadoCliente}
                  onChange={(evento) =>
                    setConfirmadoCliente(
                      evento.target.checked
                    )
                  }
                />

                <span>
                  O cliente declara que teve acesso
                  às informações deste atendimento
                  e confirma sua assinatura.
                </span>
              </label>

              <div className="vt-actions">
                <button
                  type="submit"
                  className="vt-btn vt-btn-primary"
                  disabled={
                    salvando ||
                    gerandoNumero ||
                    !formulario.numero_atendimento
                  }
                >
                  {salvando
                    ? "Salvando atendimento..."
                    : "Finalizar e salvar visita"}
                </button>

                <button
                  type="button"
                  className="vt-btn vt-btn-secondary"
                  onClick={novaVisita}
                  disabled={salvando || gerandoNumero}
                >
                  Limpar formulário
                </button>
              </div>
            </section>
          </form>
        )}

        {/* =====================================
            HISTÓRICO DE VISITAS
        ===================================== */}

        <section className="vt-card">
          <div className="vt-section-heading">
            <div>
              <span className="vt-eyebrow">
                REGISTROS SALVOS
              </span>

              <h2>
                Histórico de Visitas Técnicas
              </h2>

              <p>
                Consulte os atendimentos registrados
                na Universidade Synter.
              </p>
            </div>

            <span className="vt-tag">
              {visitas.length} registros
            </span>
          </div>

          {carregando ? (
            <div className="vt-empty">
              Carregando visitas...
            </div>
          ) : visitas.length === 0 ? (
            <div className="vt-empty">
              Nenhuma visita técnica registrada.
            </div>
          ) : (
            <div className="vt-table-wrapper">
              <table className="vt-table">
                <thead>
                  <tr>
                    <th>Atendimento</th>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Técnico</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {visitas.map((visita) => (
                    <tr key={visita.id}>
                      <td>
                        <strong>
                          {visita.numero_atendimento}
                        </strong>
                      </td>

                      <td>
                        {formatarData(
                          visita.data_visita
                        )}
                      </td>

                      <td>{visita.cliente_nome}</td>
                      <td>{visita.tecnico_nome}</td>

                      <td>
                        <span className="vt-tag">
                          Finalizado
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="vt-btn vt-btn-small"
                            onClick={() =>
                              visualizarVisita(visita)
                            }
                          >
                            Visualizar
                          </button>

                          <button
                            type="button"
                            className="vt-btn vt-btn-small"
                            disabled={Boolean(baixandoPdfId)}
                            onClick={() =>
                              baixarPdf(visita)
                            }
                            aria-label={`Baixar PDF do atendimento ${visita.numero_atendimento}`}
                          >
                            {baixandoPdfId === visita.id
                              ? "Gerando..."
                              : "Baixar PDF"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>

      <Footer />

      {/* MODAL DO PERFIL */}

      {perfilOpen && (
        <Profile
          onClose={() => setPerfilOpen(false)}
        />
      )}
    </div>
  );
}
