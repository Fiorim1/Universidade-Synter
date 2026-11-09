
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Profile from "../components/Profile";
import UserProfileButton from "../components/UserProfileButton";

import { tecnicosClient } from "../lib/tecnicosClient";
import { consultarGeocodificacao } from "../lib/geocodificacao";

import "../styles/GerenciarTecnicos.css";
import "../styles/GerenciarTecnicosMobile.css";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const FORMULARIO_VAZIO = {
  nome: "",
  whatsapp: "",
  cidade: "",
  uf: "",
  especialidades: "",
  homologado: false,
  ativo: true,
  autorizou_divulgacao: false,
};

const ETAPAS = [
  "Dados do profissional",
  "Localização",
  "Especialidades e publicação",
];

const LIMITE_LISTA = 3;

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function validarEtapa(formulario, etapa) {
  if (etapa === 0) {
    if (formulario.nome.trim().length < 3) {
      return "Informe o nome completo do profissional.";
    }

    const whatsapp = formulario.whatsapp.replace(/\D/g, "");

    if (!/^55\d{10,11}$/.test(whatsapp)) {
      return "Informe um WhatsApp válido com DDI 55 e DDD.";
    }
  }

  if (etapa === 1) {
    if (formulario.cidade.trim().length < 2) {
      return "Informe a cidade de atendimento.";
    }

    if (!/^[A-Za-z]{2}$/.test(formulario.uf.trim())) {
      return "Informe a UF com duas letras. Exemplo: SC.";
    }
  }

  return null;
}

function validarFormulario(formulario) {
  const erroDados = validarEtapa(formulario, 0);
  if (erroDados) throw new Error(erroDados);

  const erroLocalizacao = validarEtapa(formulario, 1);
  if (erroLocalizacao) throw new Error(erroLocalizacao);

  return formulario.whatsapp.replace(/\D/g, "");
}

// ==========================================
// LOCALIZAÇÃO GEOAPIFY
// ==========================================

async function localizarCidade(cidade, uf) {
  const dados = await consultarGeocodificacao({
    cidade,
    uf,
  });

  const local = (dados.results || []).find((item) => {
    return (
      String(item.state_code || "").toUpperCase() ===
        uf.toUpperCase() &&
      Number.isFinite(Number(item.lat)) &&
      Number.isFinite(Number(item.lon))
    );
  });

  if (!local) {
    throw new Error(
      "Não encontramos a cidade e o estado informados. Confira os dados."
    );
  }

  return {
    latitude: Number(local.lat),
    longitude: Number(local.lon),
  };
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function GerenciarTecnicos() {
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [tecnicos, setTecnicos] = useState([]);

  const [formulario, setFormulario] = useState({
    ...FORMULARIO_VAZIO,
  });

  const [idEdicao, setIdEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState(null);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // NAVEGAÇÃO MOBILE

  const [etapa, setEtapa] = useState(0);
  const [pesquisa, setPesquisa] = useState("");
  const [limiteLista, setLimiteLista] = useState(LIMITE_LISTA);

  const formularioRef = useRef(null);

  // ========================================
  // LISTAGEM
  // ========================================

  async function listarCredenciados() {
    const { data, error } = await tecnicosClient
      .from("tecnicos_homologados")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      throw new Error(
        "Não foi possível carregar os credenciados."
      );
    }

    setTecnicos(data || []);
  }

  // ========================================
  // VERIFICAÇÃO DE ADMINISTRADOR
  // ========================================

  useEffect(() => {
    let montado = true;

    async function inicializar() {
      try {
        const {
          data: { user },
          error: erroSessao,
        } = await tecnicosClient.auth.getUser();

        if (erroSessao || !user) {
          throw new Error("Sessão não disponível.");
        }

        const {
          data: permitido,
          error: erroPermissao,
        } = await tecnicosClient.rpc(
          "pode_gerenciar_tecnicos"
        );

        if (erroPermissao || permitido !== true) {
          if (montado) setAutorizado(false);
          return;
        }

        if (montado) setAutorizado(true);

        const { data, error } = await tecnicosClient
          .from("tecnicos_homologados")
          .select("*")
          .order("nome", { ascending: true });

        if (error) {
          throw new Error(
            "Não foi possível carregar os credenciados."
          );
        }

        if (montado) {
          setTecnicos(data || []);
        }
      } catch (falha) {
        console.error(
          "Falha no carregamento administrativo:",
          falha
        );

        if (montado) setAutorizado(false);
      } finally {
        if (montado) setVerificando(false);
      }
    }

    inicializar();

    return () => {
      montado = false;
    };
  }, []);

  // ========================================
  // FORMULÁRIO
  // ========================================

  function atualizar(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    if (erro) setErro("");
    if (sucesso) setSucesso("");
  }

  function limparFormulario() {
    setFormulario({ ...FORMULARIO_VAZIO });
    setIdEdicao(null);
    setEtapa(0);
    setErro("");
    setSucesso("");
  }

  function irParaFormulario() {
    formularioRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function editarCredenciado(profissional) {
    setFormulario({
      nome: profissional.nome || "",
      whatsapp: profissional.whatsapp || "",
      cidade: profissional.cidade || "",
      uf: profissional.uf || "",
      especialidades: Array.isArray(
        profissional.especialidades
      )
        ? profissional.especialidades.join(", ")
        : "",
      homologado: Boolean(profissional.homologado),
      ativo: Boolean(profissional.ativo),
      autorizou_divulgacao: Boolean(
        profissional.autorizou_divulgacao
      ),
    });

    setIdEdicao(profissional.id);
    setEtapa(0);
    setErro("");
    setSucesso("");

    window.setTimeout(irParaFormulario, 0);
  }

  // ========================================
  // NAVEGAÇÃO ENTRE ETAPAS
  // ========================================

  function avancarEtapa() {
    const mensagem = validarEtapa(formulario, etapa);

    if (mensagem) {
      setErro(mensagem);
      setSucesso("");
      return;
    }

    setErro("");
    setEtapa((atual) =>
      Math.min(atual + 1, ETAPAS.length - 1)
    );
  }

  function voltarEtapa() {
    setErro("");
    setEtapa((atual) => Math.max(0, atual - 1));
  }

  // ========================================
  // CADASTRAR OU ATUALIZAR
  // ========================================

  async function salvarCredenciado(evento) {
    evento.preventDefault();

    if (!autorizado || salvando) return;

    // Em celulares, Enter não deve salvar antes
    // da última etapa.
    if (
      window.matchMedia("(max-width: 768px)").matches &&
      etapa < ETAPAS.length - 1
    ) {
      avancarEtapa();
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const whatsapp = validarFormulario(formulario);

      const uf = formulario.uf.trim().toUpperCase();
      const cidade = formulario.cidade.trim();

      const especialidades = formulario.especialidades
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const registroAnterior = tecnicos.find(
        (item) => item.id === idEdicao
      );

      const mudouLocalizacao =
        !registroAnterior ||
        registroAnterior.cidade !== cidade ||
        registroAnterior.uf !== uf;

      let coordenadas;

      if (mudouLocalizacao) {
        coordenadas = await localizarCidade(cidade, uf);
      } else {
        coordenadas = {
          latitude: registroAnterior.latitude,
          longitude: registroAnterior.longitude,
        };
      }

      const dados = {
        nome: formulario.nome.trim(),
        whatsapp,
        cidade,
        uf,
        especialidades,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,
        regiao_atendimento: `${cidade}/${uf}`,
        homologado: formulario.homologado,
        ativo: formulario.ativo,
        autorizou_divulgacao:
          formulario.autorizou_divulgacao,
        updated_at: new Date().toISOString(),
      };

      if (idEdicao) {
        const { error } = await tecnicosClient
          .from("tecnicos_homologados")
          .update(dados)
          .eq("id", idEdicao);

        if (error) throw error;
      } else {
        const { error } = await tecnicosClient
          .from("tecnicos_homologados")
          .insert(dados);

        if (error) throw error;
      }

      await listarCredenciados();

      setFormulario({ ...FORMULARIO_VAZIO });
      setIdEdicao(null);
      setEtapa(0);

      setSucesso(
        "Os dados do credenciado foram salvos com sucesso."
      );
    } catch (falha) {
      console.error("Erro ao salvar credenciado:", falha);

      const mensagem = falha?.message || "";

      const erroConhecido = [
        "Não encontramos",
        "Informe",
        "indisponível",
        "localização",
        "API",
        "sessão",
      ].some((termo) => mensagem.includes(termo));

      setErro(
        erroConhecido
          ? mensagem
          : "Não foi possível salvar o credenciado. Confira os dados e tente novamente."
      );

      // Se a validação falhar no mobile, retornar
      // à etapa que precisa de correção.
      if (mensagem.startsWith("Informe o nome") ||
          mensagem.startsWith("Informe um WhatsApp")) {
        setEtapa(0);
      } else if (
        mensagem.startsWith("Informe a cidade") ||
        mensagem.startsWith("Informe a UF")
      ) {
        setEtapa(1);
      }
    } finally {
      setSalvando(false);
    }
  }

  // ========================================
  // ATIVAR OU DESATIVAR
  // ========================================

  async function alternarStatus(profissional) {
    if (
      !autorizado ||
      alterandoStatus !== null
    ) {
      return;
    }

    setErro("");
    setSucesso("");
    setAlterandoStatus(profissional.id);

    try {
      const { error } = await tecnicosClient
        .from("tecnicos_homologados")
        .update({
          ativo: !profissional.ativo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profissional.id);

      if (error) {
        throw new Error(
          "Não foi possível atualizar a disponibilidade do credenciado."
        );
      }

      await listarCredenciados();

      setSucesso(
        "Situação do credenciado atualizada."
      );
    } catch (falha) {
      setErro(
        falha.message ||
        "Não foi possível atualizar o credenciado."
      );
    } finally {
      setAlterandoStatus(null);
    }
  }

  // ========================================
  // PESQUISA DA LISTA
  // ========================================

  const tecnicosFiltrados = useMemo(() => {
    const termo = normalizar(pesquisa);

    if (!termo) return tecnicos;

    return tecnicos.filter((profissional) =>
      normalizar(
        [
          profissional.nome,
          profissional.cidade,
          profissional.uf,
          profissional.whatsapp,
          ...(Array.isArray(profissional.especialidades)
            ? profissional.especialidades
            : []),
        ].join(" ")
      ).includes(termo)
    );
  }, [tecnicos, pesquisa]);

  const tecnicosVisiveis = tecnicosFiltrados.map(
    (profissional, indice) => ({
      ...profissional,
      ocultarNoMobile: indice >= limiteLista,
    })
  );

  function alterarPesquisa(valor) {
    setPesquisa(valor);
    setLimiteLista(LIMITE_LISTA);
  }

  // ========================================
  // PROTEÇÃO DA PÁGINA
  // ========================================

  if (verificando) {
    return (
      <div className="gt-page">
        <Header />
        <main className="gt-loading">
          Verificando suas permissões...
        </main>
        <Footer />
      </div>
    );
  }

  if (!autorizado) {
    return (
      <Navigate
        to="/tecnicos-homologados"
        replace
      />
    );
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="gt-page">
      <Header />

      {/* HERO */}

      <section className="gt-hero">
        <div className="gt-container gt-hero-inner">

          <div className="gt-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          <span className="gt-eyebrow">
            UNIVERSIDADE SYNTER / ADMINISTRAÇÃO
          </span>

          <h1>Gerenciar Credenciados</h1>

          <p>
            Cadastre, atualize e gerencie os
            profissionais da Rede de Credenciados Synter.
          </p>

          <Link
            to="/tecnicos-homologados"
            className="gt-back-link"
          >
            Voltar à Rede de Credenciados
          </Link>

        </div>
      </section>

      {/* CONTEÚDO */}

      <main className="gt-container gt-main">

        <div
          className="gt-section-heading"
          ref={formularioRef}
        >
          <span />

          <div>
            <h2>
              {idEdicao
                ? "EDITAR CREDENCIADO"
                : "CADASTRAR CREDENCIADO"}
            </h2>

            <p>
              Preencha os dados para manter
              a rede de credenciados atualizada.
            </p>
          </div>
        </div>

        {/* MENSAGENS */}

        {erro && (
          <div
            className="gt-alert"
            role="alert"
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            className="gt-alert gt-success"
            role="status"
          >
            {sucesso}
          </div>
        )}

        {/* FORMULÁRIO */}

        <form
          className="gt-form"
          onSubmit={salvarCredenciado}
          noValidate
        >
          {/* INDICADOR DE ETAPAS MOBILE */}

          <div className="gt-mobile-progress">
            <div className="gt-progress-heading">
              <strong>
                Etapa {etapa + 1} de {ETAPAS.length}
              </strong>

              <span>{ETAPAS[etapa]}</span>
            </div>

            <div className="gt-progress-bars">
              {ETAPAS.map((nome, indice) => (
                <span
                  key={nome}
                  className={
                    indice <= etapa ? "active" : ""
                  }
                />
              ))}
            </div>
          </div>

          {/* ETAPA 1: DADOS PESSOAIS */}

          <section
            className={[
              "gt-step",
              etapa === 0 ? "gt-step-active" : "",
            ].join(" ")}
            aria-label="Dados do profissional"
          >
            <h3 className="gt-step-title">
              Dados do profissional
            </h3>

            <div className="gt-form-grid">

              <label className="gt-field">
                <span>Nome do profissional *</span>

                <input
                  value={formulario.nome}
                  onChange={(e) =>
                    atualizar("nome", e.target.value)
                  }
                  placeholder="Nome completo"
                  autoComplete="name"
                />
              </label>

              <label className="gt-field">
                <span>WhatsApp com DDI e DDD *</span>

                <input
                  type="tel"
                  value={formulario.whatsapp}
                  onChange={(e) =>
                    atualizar("whatsapp", e.target.value)
                  }
                  placeholder="5548999999999"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>

            </div>
          </section>

          {/* ETAPA 2: LOCALIZAÇÃO */}

          <section
            className={[
              "gt-step",
              etapa === 1 ? "gt-step-active" : "",
            ].join(" ")}
            aria-label="Localização do profissional"
          >
            <h3 className="gt-step-title">
              Localização
            </h3>

            <div className="gt-form-grid">

              <label className="gt-field">
                <span>Cidade de atendimento *</span>

                <input
                  value={formulario.cidade}
                  onChange={(e) =>
                    atualizar("cidade", e.target.value)
                  }
                  placeholder="Forquilhinha"
                  autoComplete="address-level2"
                />
              </label>

              <label className="gt-field">
                <span>Estado (UF) *</span>

                <input
                  value={formulario.uf}
                  onChange={(e) =>
                    atualizar(
                      "uf",
                      e.target.value.toUpperCase()
                    )
                  }
                  maxLength={2}
                  placeholder="SC"
                  autoComplete="address-level1"
                />
              </label>

            </div>
          </section>

          {/* ETAPA 3: ESPECIALIDADES E PUBLICAÇÃO */}

          <section
            className={[
              "gt-step",
              etapa === 2 ? "gt-step-active" : "",
            ].join(" ")}
            aria-label="Especialidades e publicação"
          >
            <h3 className="gt-step-title">
              Especialidades e publicação
            </h3>

            <div className="gt-form-grid">

              <label className="gt-field gt-full">
                <span>Especialidades</span>

                <input
                  value={formulario.especialidades}
                  onChange={(e) =>
                    atualizar(
                      "especialidades",
                      e.target.value
                    )
                  }
                  placeholder="Instalação, manutenção, fechaduras digitais"
                />
              </label>

            </div>

            <div className="gt-checks">

              <label>
                <input
                  type="checkbox"
                  checked={formulario.homologado}
                  onChange={(e) =>
                    atualizar(
                      "homologado",
                      e.target.checked
                    )
                  }
                />

                Credenciamento Synter confirmado
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={formulario.ativo}
                  onChange={(e) =>
                    atualizar(
                      "ativo",
                      e.target.checked
                    )
                  }
                />

                Profissional ativo
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={
                    formulario.autorizou_divulgacao
                  }
                  onChange={(e) =>
                    atualizar(
                      "autorizou_divulgacao",
                      e.target.checked
                    )
                  }
                />

                Autorização para divulgar nome,
                região e contato confirmada
              </label>

            </div>

            <p className="gt-form-note">
              A localização será determinada pela cidade
              de atendimento, sem publicar o endereço
              residencial do profissional. O credenciado
              só aparecerá nas buscas quando as três
              condições acima estiverem habilitadas.
            </p>
          </section>

          {/* BOTÕES MOBILE */}

          <div className="gt-mobile-actions">
            {etapa > 0 && (
              <button
                type="button"
                className="gt-secondary"
                onClick={voltarEtapa}
                disabled={salvando}
              >
                Voltar
              </button>
            )}

            {etapa < ETAPAS.length - 1 ? (
              <button
                type="button"
                className="gt-primary"
                onClick={avancarEtapa}
              >
                Avançar
              </button>
            ) : (
              <button
                type="submit"
                className="gt-primary"
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : idEdicao
                    ? "Salvar alterações"
                    : "Cadastrar credenciado"}
              </button>
            )}

            <button
              type="button"
              className="gt-mobile-clear"
              onClick={limparFormulario}
              disabled={salvando}
            >
              Limpar formulário
            </button>
          </div>

          {/* BOTÕES DESKTOP */}

          <div className="gt-form-actions gt-desktop-actions">

            <button
              type="submit"
              className="gt-primary"
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : idEdicao
                  ? "Salvar alterações"
                  : "Cadastrar credenciado"}
            </button>

            <button
              type="button"
              className="gt-secondary"
              onClick={limparFormulario}
              disabled={salvando}
            >
              Limpar
            </button>

          </div>

        </form>

        {/* =====================================
            LISTAGEM DE PROFISSIONAIS
        ===================================== */}

        <div className="gt-section-heading gt-list-heading">
          <span />

          <div>
            <h2>PROFISSIONAIS CREDENCIADOS</h2>

            <p>
              {tecnicos.length} registros cadastrados
            </p>
          </div>
        </div>

        {/* PESQUISA DA LISTA */}

        <div className="gt-list-search">
          <input
            type="search"
            value={pesquisa}
            onChange={(e) =>
              alterarPesquisa(e.target.value)
            }
            placeholder="Pesquisar nome, cidade ou WhatsApp..."
            aria-label="Pesquisar profissionais credenciados"
          />

          {pesquisa && (
            <button
              type="button"
              onClick={() => alterarPesquisa("")}
            >
              Limpar
            </button>
          )}
        </div>

        <p className="gt-list-count" role="status">
          {tecnicosFiltrados.length}
          {tecnicosFiltrados.length === 1
            ? " profissional encontrado"
            : " profissionais encontrados"}
        </p>

        <div className="gt-list">

          {tecnicosFiltrados.length === 0 && (
            <div className="gt-empty">
              {pesquisa
                ? "Nenhum credenciado encontrado para esta pesquisa."
                : "Nenhum credenciado cadastrado."}
            </div>
          )}

          {tecnicosVisiveis.map((profissional) => {
            const disponivel =
              profissional.ativo &&
              profissional.homologado &&
              profissional.autorizou_divulgacao;

            return (
              <article
                key={profissional.id}
                className={[
                  "gt-technician",
                  profissional.ocultarNoMobile
                    ? "gt-mobile-hidden"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="gt-technician-info">

                  <strong>
                    {profissional.nome}
                  </strong>

                  <span>
                    {profissional.cidade} /{" "}
                    {profissional.uf}
                  </span>

                  <span>
                    {profissional.whatsapp}
                  </span>

                  <span
                    className={
                      disponivel
                        ? "gt-status is-active"
                        : "gt-status"
                    }
                  >
                    {disponivel
                      ? "Visível na busca"
                      : "Não publicado"}
                  </span>

                </div>

                <div className="gt-technician-actions">

                  <button
                    type="button"
                    onClick={() =>
                      editarCredenciado(profissional)
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    disabled={
                      alterandoStatus !== null
                    }
                    onClick={() =>
                      alternarStatus(profissional)
                    }
                  >
                    {alterandoStatus === profissional.id
                      ? "Atualizando..."
                      : profissional.ativo
                        ? "Desativar"
                        : "Ativar"}
                  </button>

                </div>
              </article>
            );
          })}

        </div>

        {/* VER MAIS NO MOBILE */}

        {tecnicosFiltrados.length > LIMITE_LISTA && (
          <div className="gt-mobile-pagination">
            {limiteLista < tecnicosFiltrados.length ? (
              <button
                type="button"
                onClick={() =>
                  setLimiteLista((atual) =>
                    Math.min(
                      atual + LIMITE_LISTA,
                      tecnicosFiltrados.length
                    )
                  )
                }
              >
                Ver mais{" "}
                {Math.min(
                  LIMITE_LISTA,
                  tecnicosFiltrados.length - limiteLista
                )}{" "}
                credenciados
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setLimiteLista(LIMITE_LISTA)
                }
              >
                Mostrar menos
              </button>
            )}
          </div>
        )}

      </main>

      <Footer />

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}

    </div>
  );
}
