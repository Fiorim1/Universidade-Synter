
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Profile from "../components/Profile";
import UserProfileButton from "../components/UserProfileButton";

import { tecnicosClient } from "../lib/tecnicosClient";

import "../styles/GerenciarTecnicos.css";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const GEOAPIFY_KEY =
  import.meta.env.VITE_GEOAPIFY_API_KEY || "";

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

// ==========================================
// CONSULTAR COORDENADAS DA CIDADE
// ==========================================

async function localizarCidade(cidade, uf) {
  if (!GEOAPIFY_KEY) {
    throw new Error(
      "O serviço de localização está indisponível."
    );
  }

  const params = new URLSearchParams({
    text: `${cidade}, ${uf}, Brasil`,
    format: "json",
    filter: "countrycode:br",
    limit: "5",
    lang: "pt",
    apiKey: GEOAPIFY_KEY,
  });

  const resposta = await fetch(
    `https://api.geoapify.com/v1/geocode/search?${params}`
  );

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível confirmar a cidade informada."
    );
  }

  const dados = await resposta.json();

  const local = (dados.results || []).find(
    (item) =>
      String(item.state_code || "")
        .toUpperCase() === uf.toUpperCase() &&
      Number.isFinite(Number(item.lat)) &&
      Number.isFinite(Number(item.lon))
  );

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
// VALIDAÇÃO
// ==========================================

function validarFormulario(formulario) {
  if (formulario.nome.trim().length < 3) {
    throw new Error(
      "Informe o nome completo do profissional."
    );
  }

  const whatsapp = formulario.whatsapp.replace(
    /\D/g,
    ""
  );

  if (
    !/^55\d{10,11}$/.test(whatsapp)
  ) {
    throw new Error(
      "Informe o WhatsApp com DDI 55 e DDD."
    );
  }

  if (formulario.cidade.trim().length < 2) {
    throw new Error(
      "Informe a cidade de atendimento."
    );
  }

  if (!/^[A-Za-z]{2}$/.test(formulario.uf.trim())) {
    throw new Error(
      "Informe a sigla do estado com duas letras."
    );
  }

  return whatsapp;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function GerenciarTecnicos() {
  const [verificando, setVerificando] =
    useState(true);

  const [autorizado, setAutorizado] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [tecnicos, setTecnicos] =
    useState([]);

  const [formulario, setFormulario] =
    useState(FORMULARIO_VAZIO);

  const [idEdicao, setIdEdicao] =
    useState(null);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  // ========================================
  // CARREGAR LISTA ADMINISTRATIVA
  // ========================================

  async function listarTecnicos() {
    const { data, error } = await tecnicosClient
      .from("tecnicos_homologados")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      throw new Error(
        "Não foi possível carregar os profissionais."
      );
    }

    setTecnicos(data || []);
  }

  // ========================================
  // VERIFICAR PERMISSÃO
  // ========================================

  useEffect(() => {
    let ativo = true;

    async function inicializar() {
      try {
        const {
          data: { user },
          error: erroSessao,
        } = await tecnicosClient.auth.getUser();

        if (erroSessao || !user) {
          throw new Error("Sessão não disponível.");
        }

        const { data, error } =
          await tecnicosClient.rpc(
            "pode_gerenciar_tecnicos"
          );

        if (error || data !== true) {
          if (ativo) {
            setAutorizado(false);
          }
          return;
        }

        if (ativo) {
          setAutorizado(true);
        }

        const { data: lista, error: erroLista } =
          await tecnicosClient
            .from("tecnicos_homologados")
            .select("*")
            .order("nome", { ascending: true });

        if (erroLista) {
          throw new Error(
            "Não foi possível carregar os profissionais."
          );
        }

        if (ativo) {
          setTecnicos(lista || []);
        }
      } catch {
        if (ativo) {
          setAutorizado(false);
        }
      } finally {
        if (ativo) {
          setVerificando(false);
        }
      }
    }

    inicializar();

    return () => {
      ativo = false;
    };
  }, []);

  // ========================================
  // ATUALIZAR FORMULÁRIO
  // ========================================

  function atualizar(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  // ========================================
  // REINICIAR FORMULÁRIO
  // ========================================

  function limparFormulario() {
    setFormulario({ ...FORMULARIO_VAZIO });
    setIdEdicao(null);
    setErro("");
    setSucesso("");
  }

  // ========================================
  // EDITAR PROFISSIONAL
  // ========================================

  function editarTecnico(tecnico) {
    setIdEdicao(tecnico.id);

    setFormulario({
      nome: tecnico.nome || "",
      whatsapp: tecnico.whatsapp || "",
      cidade: tecnico.cidade || "",
      uf: tecnico.uf || "",
      especialidades: Array.isArray(
        tecnico.especialidades
      )
        ? tecnico.especialidades.join(", ")
        : "",
      homologado: Boolean(tecnico.homologado),
      ativo: Boolean(tecnico.ativo),
      autorizou_divulgacao: Boolean(
        tecnico.autorizou_divulgacao
      ),
    });

    setErro("");
    setSucesso("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ========================================
  // CADASTRAR OU ATUALIZAR
  // ========================================

  async function salvarTecnico(evento) {
    evento.preventDefault();

    if (!autorizado || salvando) return;

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const whatsapp = validarFormulario(
        formulario
      );

      const uf = formulario.uf
        .trim()
        .toUpperCase();

      const cidade = formulario.cidade.trim();

      const especialidades =
        formulario.especialidades
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

      const registroAnterior =
        tecnicos.find(
          (item) => item.id === idEdicao
        );

      const mudouLocalizacao =
        !registroAnterior ||
        registroAnterior.cidade !== cidade ||
        registroAnterior.uf !== uf;

      let coordenadas;

      if (mudouLocalizacao) {
        coordenadas = await localizarCidade(
          cidade,
          uf
        );
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

      await listarTecnicos();

      setFormulario({ ...FORMULARIO_VAZIO });
      setIdEdicao(null);

      setSucesso(
        "Os dados do profissional foram salvos com sucesso."
      );
    } catch (falha) {
      console.error(falha);

      setErro(
        falha?.message?.includes(
          "Não encontramos"
        ) ||
        falha?.message?.includes(
          "Informe"
        ) ||
        falha?.message?.includes(
          "indisponível"
        )
          ? falha.message
          : "Não foi possível salvar o profissional. Confira os dados e tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  // ========================================
  // ATIVAR / DESATIVAR
  // ========================================

  async function alternarStatus(tecnico) {
    if (!autorizado) return;

    const novoStatus = !tecnico.ativo;

    setErro("");
    setSucesso("");

    const { error } = await tecnicosClient
      .from("tecnicos_homologados")
      .update({
        ativo: novoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tecnico.id);

    if (error) {
      setErro(
        "Não foi possível atualizar a disponibilidade do profissional."
      );
      return;
    }

    try {
      await listarTecnicos();
      setSucesso(
        "Situação do profissional atualizada."
      );
    } catch (falha) {
      setErro(falha.message);
    }
  }

  // ========================================
  // CARREGAMENTO
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

  // ========================================
  // ACESSO NEGADO
  // ========================================

  if (!autorizado) {
    return (
      <Navigate
        to="/tecnicos-homologados"
        replace
      />
    );
  }

  // ========================================
  // INTERFACE ADMINISTRATIVA
  // ========================================

  return (
    <div className="gt-page">

      <Header />

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

          <h1>Gerenciar Técnicos</h1>

          <p>
            Cadastre, atualize e gerencie
            os profissionais homologados
            pela Synter.
          </p>

          <Link
            to="/tecnicos-homologados"
            className="gt-back-link"
          >
            Voltar à busca de técnicos
          </Link>
        </div>
      </section>

      <main className="gt-container gt-main">

        <div className="gt-section-heading">
          <span />

          <div>
            <h2>
              {idEdicao
                ? "EDITAR PROFISSIONAL"
                : "CADASTRAR PROFISSIONAL"}
            </h2>

            <p>
              Preencha os dados para manter
              a rede homologada atualizada.
            </p>
          </div>
        </div>

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

        <form
          onSubmit={salvarTecnico}
          className="gt-form"
        >

          <div className="gt-form-grid">

            <label className="gt-field">
              <span>Nome do profissional *</span>

              <input
                required
                value={formulario.nome}
                onChange={(e) =>
                  atualizar("nome", e.target.value)
                }
                placeholder="Nome completo"
              />
            </label>

            <label className="gt-field">
              <span>WhatsApp com DDI e DDD *</span>

              <input
                required
                type="tel"
                value={formulario.whatsapp}
                onChange={(e) =>
                  atualizar(
                    "whatsapp",
                    e.target.value
                  )
                }
                placeholder="5548999999999"
              />
            </label>

            <label className="gt-field">
              <span>Cidade de atendimento *</span>

              <input
                required
                value={formulario.cidade}
                onChange={(e) =>
                  atualizar(
                    "cidade",
                    e.target.value
                  )
                }
                placeholder="Forquilhinha"
              />
            </label>

            <label className="gt-field">
              <span>Estado (UF) *</span>

              <input
                required
                maxLength={2}
                value={formulario.uf}
                onChange={(e) =>
                  atualizar(
                    "uf",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="SC"
              />
            </label>

            <label className="gt-field gt-full">
              <span>
                Especialidades
              </span>

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
              Homologação Synter confirmada
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
              Autorização para divulgar
              nome, região e contato confirmada
            </label>

          </div>

          <p className="gt-form-note">
            A localização será determinada pela
            cidade de atendimento, sem publicar
            o endereço residencial do profissional.
            O profissional só aparecerá nas buscas
            quando os três requisitos acima
            estiverem habilitados.
          </p>

          <div className="gt-form-actions">

            <button
              type="submit"
              className="gt-primary"
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : idEdicao
                  ? "Salvar alterações"
                  : "Cadastrar técnico"}
            </button>

            <button
              type="button"
              className="gt-secondary"
              onClick={limparFormulario}
            >
              Limpar
            </button>

          </div>
        </form>

        {/* LISTAGEM */}

        <div className="gt-section-heading gt-list-heading">
          <span />

          <div>
            <h2>PROFISSIONAIS CADASTRADOS</h2>
            <p>
              {tecnicos.length} registros
            </p>
          </div>
        </div>

        <div className="gt-list">

          {tecnicos.length === 0 && (
            <div className="gt-empty">
              Nenhum profissional cadastrado.
            </div>
          )}

          {tecnicos.map((tecnico) => {
            const disponivel =
              tecnico.ativo &&
              tecnico.homologado &&
              tecnico.autorizou_divulgacao;

            return (
              <article
                className="gt-technician"
                key={tecnico.id}
              >
                <div className="gt-technician-info">

                  <strong>
                    {tecnico.nome}
                  </strong>

                  <span>
                    {tecnico.cidade} / {tecnico.uf}
                  </span>

                  <span>
                    {tecnico.whatsapp}
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
                      editarTecnico(tecnico)
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      alternarStatus(tecnico)
                    }
                  >
                    {tecnico.ativo
                      ? "Desativar"
                      : "Ativar"}
                  </button>

                </div>
              </article>
            );
          })}

        </div>

      </main>

      <Footer />

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
