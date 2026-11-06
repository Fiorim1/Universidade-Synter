
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Profile from "../components/Profile";
import UserProfileButton from "../components/UserProfileButton";

import { tecnicosClient } from "../lib/tecnicosClient";
import { consultarGeocodificacao } from "../lib/geocodificacao";

import "../styles/GerenciarTecnicos.css";

// ==========================================
// FORMULÁRIO INICIAL
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

// ==========================================
// GEOLOCALIZAÇÃO DA CIDADE
// ==========================================

async function localizarCidade(cidade, uf) {
  const dados = await consultarGeocodificacao({
    cidade,
    uf,
  });

  const local = (dados.results || []).find(
    (item) =>
      String(item.state_code || "").toUpperCase() ===
        uf.toUpperCase() &&
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
// VALIDAÇÃO DOS DADOS
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

  if (!/^55\d{10,11}$/.test(whatsapp)) {
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
// PÁGINA ADMINISTRATIVA
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
    useState({ ...FORMULARIO_VAZIO });

  const [idEdicao, setIdEdicao] =
    useState(null);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  // ========================================
  // LISTAR CREDENCIADOS
  // ========================================

  async function listarCredenciados() {
    const { data, error } = await tecnicosClient
      .from("tecnicos_homologados")
      .select("*")
      .order("nome", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        "Não foi possível carregar os credenciados."
      );
    }

    setTecnicos(data || []);
  }

  // ========================================
  // VERIFICAR PERMISSÕES DO ADM
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
          throw new Error(
            "Sessão não disponível."
          );
        }

        const {
          data: permitido,
          error,
        } = await tecnicosClient.rpc(
          "pode_gerenciar_tecnicos"
        );

        if (error || permitido !== true) {
          if (ativo) {
            setAutorizado(false);
          }

          return;
        }

        if (ativo) {
          setAutorizado(true);
        }

        const {
          data: lista,
          error: erroLista,
        } = await tecnicosClient
          .from("tecnicos_homologados")
          .select("*")
          .order("nome", {
            ascending: true,
          });

        if (erroLista) {
          throw new Error(
            "Não foi possível carregar os credenciados."
          );
        }

        if (ativo) {
          setTecnicos(lista || []);
        }
      } catch (falha) {
        console.error(
          "Falha no carregamento administrativo:",
          falha
        );

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
  // CONTROLE DO FORMULÁRIO
  // ========================================

  function atualizar(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function limparFormulario() {
    setFormulario({
      ...FORMULARIO_VAZIO,
    });

    setIdEdicao(null);
    setErro("");
    setSucesso("");
  }

  // ========================================
  // EDITAR CREDENCIADO
  // ========================================

  function editarCredenciado(profissional) {
    setIdEdicao(profissional.id);

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
      homologado: Boolean(
        profissional.homologado
      ),
      ativo: Boolean(profissional.ativo),
      autorizou_divulgacao: Boolean(
        profissional.autorizou_divulgacao
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
  // CADASTRAR OU SALVAR EDIÇÃO
  // ========================================

  async function salvarCredenciado(evento) {
    evento.preventDefault();

    if (!autorizado || salvando) {
      return;
    }

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

      const registroAnterior = tecnicos.find(
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
        // Atualizar cadastro existente.

        const { error } = await tecnicosClient
          .from("tecnicos_homologados")
          .update(dados)
          .eq("id", idEdicao);

        if (error) {
          throw error;
        }
      } else {
        // Criar novo cadastro.

        const { error } = await tecnicosClient
          .from("tecnicos_homologados")
          .insert(dados);

        if (error) {
          throw error;
        }
      }

      await listarCredenciados();

      setFormulario({
        ...FORMULARIO_VAZIO,
      });

      setIdEdicao(null);

      setSucesso(
        "Os dados do credenciado foram salvos com sucesso."
      );
    } catch (falha) {
      console.error(
        "Erro ao salvar credenciado:",
        falha
      );

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
    } finally {
      setSalvando(false);
    }
  }

  // ========================================
  // ATIVAR OU DESATIVAR CREDENCIADO
  // ========================================

  async function alternarStatus(profissional) {
    if (!autorizado) {
      return;
    }

    const novoStatus = !profissional.ativo;

    setErro("");
    setSucesso("");

    const { error } = await tecnicosClient
      .from("tecnicos_homologados")
      .update({
        ativo: novoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profissional.id);

    if (error) {
      setErro(
        "Não foi possível atualizar a disponibilidade do credenciado."
      );

      return;
    }

    try {
      await listarCredenciados();

      setSucesso(
        "Situação do credenciado atualizada."
      );
    } catch (falha) {
      setErro(falha.message);
    }
  }

  // ========================================
  // VERIFICAÇÃO DE ACESSO
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

      {/* HERO ADMINISTRATIVO */}

      <section className="gt-hero">
        <div className="gt-container gt-hero-inner">

          <div className="gt-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          <span className="gt-eyebrow">
            UNIVERSIDADE SYNTER / ADMINISTRAÇÃO
          </span>

          <h1>Gerenciar Credenciados</h1>

          <p>
            Cadastre, atualize e gerencie os
            profissionais da Rede de Credenciados
            Synter.
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
        <div className="gt-section-heading">
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
          onSubmit={salvarCredenciado}
          className="gt-form"
        >
          <div className="gt-form-grid">

            {/* NOME */}

            <label className="gt-field">
              <span>
                Nome do profissional *
              </span>

              <input
                required
                value={formulario.nome}
                onChange={(e) =>
                  atualizar(
                    "nome",
                    e.target.value
                  )
                }
                placeholder="Nome completo"
              />
            </label>

            {/* WHATSAPP */}

            <label className="gt-field">
              <span>
                WhatsApp com DDI e DDD *
              </span>

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

            {/* CIDADE */}

            <label className="gt-field">
              <span>
                Cidade de atendimento *
              </span>

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

            {/* UF */}

            <label className="gt-field">
              <span>
                Estado (UF) *
              </span>

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

            {/* ESPECIALIDADES */}

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

          {/* CONDIÇÕES DE PUBLICAÇÃO */}

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
            A localização será determinada pela
            cidade de atendimento, sem publicar
            o endereço residencial do profissional.
            O credenciado só aparecerá nas buscas
            quando as três condições acima
            estiverem habilitadas.
          </p>

          {/* BOTÕES */}

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
                  : "Cadastrar credenciado"}
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

        {/* LISTAGEM DE CREDENCIADOS */}

        <div className="gt-section-heading gt-list-heading">
          <span />

          <div>
            <h2>
              PROFISSIONAIS CREDENCIADOS
            </h2>

            <p>
              {tecnicos.length} registros
            </p>
          </div>
        </div>

        <div className="gt-list">
          {tecnicos.length === 0 && (
            <div className="gt-empty">
              Nenhum credenciado cadastrado.
            </div>
          )}

          {tecnicos.map((profissional) => {
            const disponivel =
              profissional.ativo &&
              profissional.homologado &&
              profissional.autorizou_divulgacao;

            return (
              <article
                className="gt-technician"
                key={profissional.id}
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
                    onClick={() =>
                      alternarStatus(profissional)
                    }
                  >
                    {profissional.ativo
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
