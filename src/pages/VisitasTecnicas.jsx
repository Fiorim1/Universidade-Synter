
import { useEffect, useRef, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import { supabase } from "../services/supabaseClient";

import "../styles/VisitasTecnicas.css";

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
// FORMULÁRIO INICIAL
// ========================================

function dataAtualLocal() {
  const agora = new Date();

  const data = new Date(
    agora.getTime() - agora.getTimezoneOffset() * 60000
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

function formatarData(data) {
  if (!data) return "-";

  const partes = String(data).split("-");

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return String(data);
}

const CAMPOS = [
  {
    name: "numero_atendimento",
    label: "Nº do atendimento",
    type: "text",
    required: true,
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
// COMPONENTE DE ASSINATURA
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

  function obterPonto(event) {
    const canvas = canvasRef.current;
    const retangulo = canvas.getBoundingClientRect();

    return {
      x:
        ((event.clientX - retangulo.left) /
          retangulo.width) *
        canvas.width,

      y:
        ((event.clientY - retangulo.top) /
          retangulo.height) *
        canvas.height,
    };
  }

  function iniciarDesenho(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();

    const canvas = canvasRef.current;
    const contexto = canvas.getContext("2d");
    const ponto = obterPonto(event);

    canvas.setPointerCapture(event.pointerId);

    ponteiroRef.current = event.pointerId;
    desenhandoRef.current = true;

    contexto.strokeStyle = "#111111";
    contexto.lineWidth = 3;
    contexto.lineCap = "round";
    contexto.lineJoin = "round";

    contexto.beginPath();
    contexto.moveTo(ponto.x, ponto.y);
    contexto.lineTo(ponto.x + 0.1, ponto.y + 0.1);
    contexto.stroke();
  }

  function continuarDesenho(event) {
    if (
      !desenhandoRef.current ||
      ponteiroRef.current !== event.pointerId
    ) {
      return;
    }

    event.preventDefault();

    const ponto = obterPonto(event);
    const contexto = canvasRef.current.getContext("2d");

    contexto.lineTo(ponto.x, ponto.y);
    contexto.stroke();
  }

  function finalizarDesenho(event) {
    if (
      !desenhandoRef.current ||
      ponteiroRef.current !== event.pointerId
    ) {
      return;
    }

    desenhandoRef.current = false;
    ponteiroRef.current = null;

    const canvas = canvasRef.current;

    onChange(canvas.toDataURL("image/png"));

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  function limparAssinatura() {
    const canvas = canvasRef.current;
    const contexto = canvas.getContext("2d");

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
            Assine utilizando o dedo, mouse ou caneta digital.
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
// CAMPO DO FORMULÁRIO
// ========================================

function CampoFormulario({
  campo,
  valor,
  onChange,
}) {
  return (
    <label
      className={`vt-campo ${campo.wide ? "vt-wide" : ""}`}
    >
      <span>
        {campo.label}
        {campo.required && (
          <span className="vt-obrigatorio"> *</span>
        )}
      </span>

      <input
        type={campo.type}
        name={campo.name}
        value={valor || ""}
        onChange={onChange}
        required={Boolean(campo.required)}
        autoComplete="off"
      />
    </label>
  );
}

// ========================================
// PÁGINA PRINCIPAL
// ========================================

export default function VisitasTecnicas() {
  const [perfilOpen, setPerfilOpen] = useState(false);

  const [formulario, setFormulario] = useState(
    formularioVazio
  );

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

  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // ========================================
  // CARREGAR VISITAS
  // ========================================

  async function carregarVisitas() {
    try {
      setCarregando(true);

      const { data, error } = await supabase
        .from("visitas_tecnicas")
        .select("*")
        .order("criado_em", {
          ascending: false,
        });

      if (error) throw error;

      setVisitas(data || []);
    } catch (error) {
      console.error(
        "Erro ao carregar visitas:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível carregar as visitas."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarVisitas();
  }, []);

  // ========================================
  // ALTERAR CAMPOS
  // ========================================

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // ========================================
  // NOVA VISITA
  // ========================================

  function novaVisita() {
    setFormulario(formularioVazio());

    setAssinaturaCliente("");
    setAssinaturaTecnico("");
    setConfirmadoCliente(false);

    setResetAssinaturas((anterior) => anterior + 1);

    setVisitaSelecionada(null);
    setErro("");
    setSucesso("");
  }

  // ========================================
  // SALVAR NO SUPABASE
  // ========================================

  async function salvarVisita(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!assinaturaCliente) {
      setErro("Solicite a assinatura do cliente.");
      return;
    }

    if (!assinaturaTecnico) {
      setErro("O técnico responsável precisa assinar.");
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

    try {
      setSalvando(true);

      const {
        data: { user },
        error: erroAutenticacao,
      } = await supabase.auth.getUser();

      if (erroAutenticacao || !user) {
        throw new Error(
          "Sua sessão expirou. Faça login novamente."
        );
      }

      const dadosVisita = {
        ...formulario,

        tecnico_id: user.id,

        numero_atendimento:
          formulario.numero_atendimento.trim(),

        tecnico_nome:
          formulario.tecnico_nome.trim(),

        cliente_nome:
          formulario.cliente_nome.trim(),

        relato_tecnico:
          formulario.relato_tecnico.trim(),

        termino: formulario.termino || null,

        cliente_documento:
          formulario.cliente_documento.trim() || null,

        cliente_telefone:
          formulario.cliente_telefone.trim() || null,

        cliente_email:
          formulario.cliente_email.trim() || null,

        cliente_endereco:
          formulario.cliente_endereco.trim() || null,

        assinatura_cliente: assinaturaCliente,
        assinatura_tecnico: assinaturaTecnico,

        confirmado_cliente: true,
      };

      const { error } = await supabase
        .from("visitas_tecnicas")
        .insert(dadosVisita);

      if (error) throw error;

      novaVisita();

      await carregarVisitas();

      setSucesso(
        "Visita técnica finalizada e salva com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao salvar visita técnica:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível salvar a visita técnica."
      );
    } finally {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="visitas-page">
      <Header />

      <main className="visitas-main">
        {/* ========================================
            CABEÇALHO DA PÁGINA
        ======================================== */}

        <section className="visitas-hero">
          <div className="visitas-hero-top">
            <div>
              <span className="vt-eyebrow">
                UNIVERSIDADE SYNTER / ASSISTÊNCIA TÉCNICA
              </span>

              <h1>Visitas Técnicas</h1>

              <p>
                Registre atendimentos, documente
                procedimentos e colete assinaturas
                diretamente na plataforma.
              </p>
            </div>

            <UserProfileButton
              onClick={() => setPerfilOpen(true)}
            />
          </div>

          <div className="vt-hero-actions">
            <button
              type="button"
              className="vt-btn vt-btn-primary"
              onClick={novaVisita}
            >
              + Nova visita técnica
            </button>
          </div>
        </section>

        {/* MENSAGENS */}

        {erro && (
          <div className="vt-alert vt-alert-error" role="alert">
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

        {/* ========================================
            VISITA SALVA
        ======================================== */}

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
                  "Data da visita",
                  formatarData(
                    visitaSelecionada.data_visita
                  ),
                ],
                [
                  "Início",
                  visitaSelecionada.inicio,
                ],
                [
                  "Término",
                  visitaSelecionada.termino || "-",
                ],
                [
                  "Técnico",
                  visitaSelecionada.tecnico_nome,
                ],
                [
                  "Cliente",
                  visitaSelecionada.cliente_nome,
                ],
                [
                  "CPF/CNPJ",
                  visitaSelecionada.cliente_documento || "-",
                ],
                [
                  "Telefone",
                  visitaSelecionada.cliente_telefone || "-",
                ],
                [
                  "E-mail",
                  visitaSelecionada.cliente_email || "-",
                ],
                [
                  "Endereço",
                  visitaSelecionada.cliente_endereco || "-",
                ],
              ].map(([titulo, valor]) => (
                <div
                  className="vt-detalhe"
                  key={titulo}
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
                  src={visitaSelecionada.assinatura_cliente}
                  alt="Assinatura registrada do cliente"
                  className="vt-assinatura-imagem"
                />
              </div>

              <div>
                <p>Assinatura do técnico</p>

                <img
                  src={visitaSelecionada.assinatura_tecnico}
                  alt="Assinatura registrada do técnico"
                  className="vt-assinatura-imagem"
                />
              </div>
            </div>

            <div className="vt-actions">
              <button
                type="button"
                className="vt-btn vt-btn-secondary"
                onClick={() =>
                  setVisitaSelecionada(null)
                }
              >
                Voltar
              </button>
            </div>
          </section>
        ) : (
          /* ========================================
              FORMULÁRIO
          ======================================== */

          <form onSubmit={salvarVisita}>
            {/* EMPRESA */}

            <section className="vt-card">
              <div className="vt-section-heading">
                <div>
                  <span className="vt-eyebrow">
                    SEÇÃO 01
                  </span>

                  <h2>Identificação da Empresa</h2>
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

            {/* ATENDIMENTO */}

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
                    Informe o número do atendimento,
                    a data e o técnico responsável.
                  </p>
                </div>
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

            {/* CLIENTE */}

            <section className="vt-card">
              <div className="vt-section-heading">
                <div>
                  <span className="vt-eyebrow">
                    SEÇÃO 03
                  </span>

                  <h2>Identificação do Cliente</h2>

                  <p>
                    Preencha as informações do cliente
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

            {/* RELATO */}

            <section className="vt-card">
              <div className="vt-section-heading">
                <div>
                  <span className="vt-eyebrow">
                    SEÇÃO 04
                  </span>

                  <h2>Dados da Visita</h2>

                  <p>
                    Registre os problemas identificados,
                    os testes realizados e a solução aplicada.
                  </p>
                </div>
              </div>

              <label className="vt-campo">
                <span>
                  Relatório técnico
                  <span className="vt-obrigatorio"> *</span>
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

            {/* ASSINATURAS */}

            <section className="vt-card">
              <div className="vt-section-heading">
                <div>
                  <span className="vt-eyebrow">
                    SEÇÃO 05
                  </span>

                  <h2>Assinaturas</h2>

                  <p>
                    As duas assinaturas são obrigatórias
                    para finalizar o atendimento.
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
                  onChange={(event) =>
                    setConfirmadoCliente(
                      event.target.checked
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
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando atendimento..."
                    : "Finalizar e salvar visita"}
                </button>

                <button
                  type="button"
                  className="vt-btn vt-btn-secondary"
                  onClick={novaVisita}
                  disabled={salvando}
                >
                  Limpar formulário
                </button>
              </div>
            </section>
          </form>
        )}

        {/* ========================================
            HISTÓRICO
        ======================================== */}

        <section className="vt-card">
          <div className="vt-section-heading">
            <div>
              <span className="vt-eyebrow">
                REGISTROS SALVOS
              </span>

              <h2>Histórico de Visitas Técnicas</h2>

              <p>
                Consulte os atendimentos já registrados
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
                    <th>Ação</th>
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

                      <td>
                        {visita.cliente_nome}
                      </td>

                      <td>
                        {visita.tecnico_nome}
                      </td>

                      <td>
                        <span className="vt-tag">
                          Finalizado
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="vt-btn vt-btn-small"
                          onClick={() =>
                            visualizarVisita(visita)
                          }
                        >
                          Visualizar
                        </button>
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

      {perfilOpen && (
        <Profile
          onClose={() => setPerfilOpen(false)}
        />
      )}
    </div>
  );
}
