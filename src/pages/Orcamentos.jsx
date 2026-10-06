import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import ImgIcon from "../assets/img-icon.png";

import { supabase } from "../services/supabaseClient";

import "../styles/Orcamentos.css";


function Orcamentos() {

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [role, setRole] = useState(null);
  const [orcamentos, setOrcamentos] = useState([]);

  const [profileOpen, setProfileOpen] =
    useState(false);


  // ========================================
  // NOVO ORÇAMENTO
  // ========================================

  const [modalNovoOpen, setModalNovoOpen] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [erroFormulario, setErroFormulario] =
    useState("");


  const [formulario, setFormulario] =
    useState({
      cliente_nome: "",
      cliente_documento: "",
      cliente_email: "",
      cliente_telefone: "",
      observacoes: ""
    });


  // ========================================
  // CARREGAMENTO INICIAL
  // ========================================

  useEffect(() => {

    carregarPagina();

  }, []);


  async function carregarPagina() {

    try {

      setLoading(true);
      setErro("");


      // ========================================
      // USUÁRIO AUTENTICADO
      // ========================================

      const {
        data: usuarioData,
        error: usuarioError
      } = await supabase.auth.getUser();


      if (usuarioError) {
        throw usuarioError;
      }


      const user = usuarioData?.user;


      if (!user) {

        throw new Error(
          "Usuário não autenticado."
        );

      }


      // ========================================
      // PERFIL / ROLE
      // ========================================

      const {
        data: perfil,
        error: perfilError
      } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          role
        `)
        .eq("id", user.id)
        .single();


      if (perfilError) {
        throw perfilError;
      }


      if (!perfil) {

        throw new Error(
          "Perfil do usuário não encontrado."
        );

      }


      setRole(perfil.role);


      // ========================================
      // SEM ACESSO
      // ========================================

      if (
        perfil.role !== "representante" &&
        perfil.role !== "comercial"
      ) {

        setOrcamentos([]);
        return;

      }


      // ========================================
      // BUSCAR ORÇAMENTOS
      // ========================================

      const {
        data,
        error
      } = await supabase
        .from("orcamentos")
        .select(`
          id,
          created_by,
          cliente_nome,
          cliente_documento,
          cliente_email,
          cliente_telefone,
          observacoes,
          status,
          created_at,
          updated_at
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        );


      if (error) {
        throw error;
      }


      setOrcamentos(
        data || []
      );

    }

    catch (error) {

      console.error(
        "Erro ao carregar orçamentos:",
        error
      );


      setErro(
        error?.message ||
        "Não foi possível carregar os orçamentos."
      );

    }

    finally {

      setLoading(false);

    }

  }


  // ========================================
  // RESUMO
  // ========================================

  const resumo = useMemo(() => {

    return {

      total:
        orcamentos.length,

      rascunho:
        orcamentos.filter(
          (item) =>
            item.status === "rascunho"
        ).length,

      enviado:
        orcamentos.filter(
          (item) =>
            item.status === "enviado"
        ).length,

      aprovado:
        orcamentos.filter(
          (item) =>
            item.status === "aprovado"
        ).length

    };

  }, [orcamentos]);


  // ========================================
  // ALTERAR CAMPO
  // ========================================

  function alterarCampo(event) {

    const {
      name,
      value
    } = event.target;


    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value
      })
    );

  }


  // ========================================
  // ABRIR MODAL
  // ========================================

  function abrirNovoOrcamento() {

    setErroFormulario("");


    setFormulario({
      cliente_nome: "",
      cliente_documento: "",
      cliente_email: "",
      cliente_telefone: "",
      observacoes: ""
    });


    setModalNovoOpen(true);

  }


  // ========================================
  // FECHAR MODAL
  // ========================================

  function fecharNovoOrcamento() {

    if (salvando) {
      return;
    }


    setModalNovoOpen(false);
    setErroFormulario("");

  }


  // ========================================
  // CRIAR ORÇAMENTO
  // ========================================

  async function criarOrcamento(event) {

    event.preventDefault();


    if (role !== "representante") {

      setErroFormulario(
        "Seu perfil não possui permissão para criar orçamentos."
      );

      return;

    }


    const clienteNome =
      formulario.cliente_nome.trim();


    if (clienteNome.length < 2) {

      setErroFormulario(
        "Informe o nome do cliente."
      );

      return;

    }


    try {

      setSalvando(true);
      setErroFormulario("");


      // ========================================
      // IMPORTANTE
      // ========================================
      //
      // NÃO enviamos:
      //
      // id
      // created_by
      // status
      // created_at
      // updated_at
      //
      // Esses dados são controlados
      // exclusivamente pelo banco.
      //
      // ========================================

      const {
        data,
        error
      } = await supabase
        .from("orcamentos")
        .insert({
          cliente_nome:
            clienteNome,

          cliente_documento:
            formulario.cliente_documento.trim() ||
            null,

          cliente_email:
            formulario.cliente_email.trim() ||
            null,

          cliente_telefone:
            formulario.cliente_telefone.trim() ||
            null,

          observacoes:
            formulario.observacoes.trim() ||
            null
        })
        .select(`
          id,
          created_by,
          cliente_nome,
          cliente_documento,
          cliente_email,
          cliente_telefone,
          observacoes,
          status,
          created_at,
          updated_at
        `)
        .single();


      if (error) {
        throw error;
      }


      if (!data) {

        throw new Error(
          "O orçamento não foi criado."
        );

      }


      // ========================================
      // ADICIONA NOVO RASCUNHO NA TELA
      // ========================================

      setOrcamentos(
        (anteriores) => [
          data,
          ...anteriores
        ]
      );


      setModalNovoOpen(false);


      setFormulario({
        cliente_nome: "",
        cliente_documento: "",
        cliente_email: "",
        cliente_telefone: "",
        observacoes: ""
      });

    }

    catch (error) {

      console.error(
        "Erro ao criar orçamento:",
        error
      );


      setErroFormulario(
        error?.message ||
        "Não foi possível criar o orçamento."
      );

    }

    finally {

      setSalvando(false);

    }

  }


  // ========================================
  // FORMATAR DATA
  // ========================================

  function formatarData(data) {

    if (!data) {
      return "-";
    }


    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(
      new Date(data)
    );

  }


  // ========================================
  // FORMATAR STATUS
  // ========================================

  function formatarStatus(status) {

    const nomes = {

      rascunho: "Rascunho",
      enviado: "Enviado",
      aprovado: "Aprovado",
      recusado: "Recusado",
      cancelado: "Cancelado"

    };


    return nomes[status] || status;

  }


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (

      <div className="orcamentos-page">

        <Header />

        <main className="orcamentos-state">

          <div className="orcamentos-loader"></div>

          <h2>
            Carregando orçamentos
          </h2>

          <p>
            Aguarde enquanto buscamos
            suas informações.
          </p>

        </main>

        <Footer />

      </div>

    );

  }


  // ========================================
  // ERRO
  // ========================================

  if (erro) {

    return (

      <div className="orcamentos-page">

        <Header />

        <main className="orcamentos-state">

          <div className="orcamentos-state-icon">
            !
          </div>

          <h2>
            Não foi possível carregar
            os orçamentos
          </h2>

          <p>
            {erro}
          </p>

          <button
            className="orcamentos-button"
            type="button"
            onClick={carregarPagina}
          >
            Tentar novamente
          </button>

        </main>

        <Footer />

      </div>

    );

  }


  // ========================================
  // SEM PERMISSÃO
  // ========================================

  if (
    role !== "representante" &&
    role !== "comercial"
  ) {

    return (

      <div className="orcamentos-page">

        <Header />

        <main className="orcamentos-state">

          <div className="orcamentos-state-icon">
            !
          </div>

          <h1>
            Acesso não autorizado
          </h1>

          <p>
            Seu usuário não possui permissão
            para acessar o sistema de orçamentos.
          </p>

        </main>

        <Footer />

      </div>

    );

  }


  // ========================================
  // PÁGINA
  // ========================================

  return (

    <div className="orcamentos-page">

      <Header />


      {/* ================================= */}
      {/* HERO                              */}
      {/* ================================= */}

      <section className="orcamentos-hero">

        <div className="orcamentos-profile">

          <UserProfileButton
            onClick={() =>
              setProfileOpen(true)
            }
          />

        </div>


        <div className="orcamentos-hero-container">

          <div className="orcamentos-eyebrow">

            <div className="orcamentos-eyebrow-icon">

              <img
                src={ImgIcon}
                alt=""
              />

            </div>

            <span>
              GESTÃO COMERCIAL
            </span>

          </div>


          <h1>
            Orçamentos
          </h1>


          <p className="orcamentos-hero-description">

            {role === "representante"
              ? "Crie, organize e acompanhe seus orçamentos comerciais em um único lugar."
              : "Acompanhe os orçamentos enviados pelos representantes e gerencie suas aprovações."}

          </p>


          <div className="orcamentos-hero-divider"></div>


          <div className="orcamentos-role">

            <span className="orcamentos-role-label">
              PERFIL DE ACESSO
            </span>

            <strong>
              {role === "representante"
                ? "Representante"
                : "Comercial"}
            </strong>

          </div>

        </div>

      </section>


      {/* ================================= */}
      {/* CONTEÚDO                         */}
      {/* ================================= */}

      <main className="orcamentos-content">


        <div className="orcamentos-section-title">

          <div className="orcamentos-section-bar"></div>

          <h4>
            VISÃO GERAL
          </h4>

        </div>


        {/* ================================= */}
        {/* CARDS                            */}
        {/* ================================= */}

        <section className="orcamentos-summary-grid">

          <div className="orcamentos-summary-card">

            <span>
              Total
            </span>

            <strong>
              {resumo.total}
            </strong>

            <p>
              Orçamentos cadastrados
            </p>

          </div>


          <div className="orcamentos-summary-card">

            <span>
              Rascunhos
            </span>

            <strong>
              {resumo.rascunho}
            </strong>

            <p>
              Em preparação
            </p>

          </div>


          <div className="orcamentos-summary-card">

            <span>
              Enviados
            </span>

            <strong>
              {resumo.enviado}
            </strong>

            <p>
              Aguardando análise
            </p>

          </div>


          <div className="orcamentos-summary-card">

            <span>
              Aprovados
            </span>

            <strong>
              {resumo.aprovado}
            </strong>

            <p>
              Orçamentos aprovados
            </p>

          </div>

        </section>


        {/* ================================= */}
        {/* CABEÇALHO DA LISTA               */}
        {/* ================================= */}

        <div className="orcamentos-section-header">

          <div>

            <div className="orcamentos-section-title">

              <div className="orcamentos-section-bar"></div>

              <h4>
                ORÇAMENTOS
              </h4>

            </div>


            <p>
              {role === "representante"
                ? "Consulte seus orçamentos e acompanhe cada etapa do processo."
                : "Consulte os orçamentos enviados pelos representantes."}
            </p>

          </div>


          {role === "representante" && (

            <button
              type="button"
              className="orcamentos-primary-button"
              onClick={abrirNovoOrcamento}
            >

              <span>
                +
              </span>

              Novo orçamento

            </button>

          )}

        </div>


        {/* ================================= */}
        {/* VAZIO                            */}
        {/* ================================= */}

        {orcamentos.length === 0 && (

          <section className="orcamentos-empty">

            <div className="orcamentos-empty-icon">

              <img
                src={ImgIcon}
                alt=""
              />

            </div>


            <h3>
              Nenhum orçamento encontrado
            </h3>


            <p>

              {role === "representante"
                ? "Você ainda não possui orçamentos. Clique em Novo orçamento para começar."
                : "Ainda não existem orçamentos disponíveis para acompanhamento."}

            </p>

          </section>

        )}


        {/* ================================= */}
        {/* TABELA                            */}
        {/* ================================= */}

        {orcamentos.length > 0 && (

          <section className="orcamentos-table-card">

            <div className="orcamentos-table-wrapper">

              <table className="orcamentos-table">

                <thead>

                  <tr>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Documento
                    </th>

                    <th>
                      Contato
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Criado em
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {orcamentos.map(
                    (orcamento) => (

                      <tr key={orcamento.id}>

                        <td>

                          <div className="orcamentos-client">

                            <div className="orcamentos-client-avatar">

                              {orcamento.cliente_nome
                                ?.charAt(0)
                                ?.toUpperCase() || "C"}

                            </div>


                            <div>

                              <strong>
                                {orcamento.cliente_nome}
                              </strong>

                              <span>
                                {orcamento.cliente_email || "Sem e-mail"}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>
                          {orcamento.cliente_documento || "-"}
                        </td>


                        <td>
                          {orcamento.cliente_telefone || "-"}
                        </td>


                        <td>

                          <span
                            className={
                              `orcamentos-status status-${orcamento.status}`
                            }
                          >

                            {formatarStatus(
                              orcamento.status
                            )}

                          </span>

                        </td>


                        <td>
                          {formatarData(
                            orcamento.created_at
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}

      </main>


      <Footer />


      {/* ================================= */}
      {/* PERFIL                            */}
      {/* ================================= */}

      {profileOpen && (

        <Profile
          onClose={() =>
            setProfileOpen(false)
          }
        />

      )}


      {/* ================================= */}
      {/* MODAL NOVO ORÇAMENTO              */}
      {/* ================================= */}

      {modalNovoOpen && (

        <div
          className="orcamentos-modal-overlay"
          onMouseDown={fecharNovoOrcamento}
        >

          <div
            className="orcamentos-modal"
            onMouseDown={
              (event) =>
                event.stopPropagation()
            }
          >

            <div className="orcamentos-modal-header">

              <div>

                <span>
                  NOVO ORÇAMENTO
                </span>

                <h2>
                  Dados do cliente
                </h2>

                <p>
                  Preencha as informações para
                  criar um novo rascunho.
                </p>

              </div>


              <button
                type="button"
                className="orcamentos-modal-close"
                onClick={fecharNovoOrcamento}
                disabled={salvando}
                aria-label="Fechar"
              >
                ×
              </button>

            </div>


            <form
              onSubmit={criarOrcamento}
              className="orcamentos-form"
            >

              <div className="orcamentos-form-group orcamentos-form-full">

                <label htmlFor="cliente_nome">
                  Nome do cliente *
                </label>

                <input
                  id="cliente_nome"
                  name="cliente_nome"
                  type="text"
                  value={formulario.cliente_nome}
                  onChange={alterarCampo}
                  placeholder="Nome ou razão social"
                  maxLength={200}
                  required
                  disabled={salvando}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="cliente_documento">
                  CPF / CNPJ
                </label>

                <input
                  id="cliente_documento"
                  name="cliente_documento"
                  type="text"
                  value={formulario.cliente_documento}
                  onChange={alterarCampo}
                  placeholder="CPF ou CNPJ"
                  disabled={salvando}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="cliente_telefone">
                  Telefone
                </label>

                <input
                  id="cliente_telefone"
                  name="cliente_telefone"
                  type="text"
                  value={formulario.cliente_telefone}
                  onChange={alterarCampo}
                  placeholder="(00) 00000-0000"
                  disabled={salvando}
                />

              </div>


              <div className="orcamentos-form-group orcamentos-form-full">

                <label htmlFor="cliente_email">
                  E-mail
                </label>

                <input
                  id="cliente_email"
                  name="cliente_email"
                  type="email"
                  value={formulario.cliente_email}
                  onChange={alterarCampo}
                  placeholder="cliente@empresa.com.br"
                  disabled={salvando}
                />

              </div>


              <div className="orcamentos-form-group orcamentos-form-full">

                <label htmlFor="observacoes">
                  Observações
                </label>

                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formulario.observacoes}
                  onChange={alterarCampo}
                  placeholder="Informações adicionais..."
                  rows={4}
                  disabled={salvando}
                />

              </div>


              {erroFormulario && (

                <div className="orcamentos-form-error">
                  {erroFormulario}
                </div>

              )}


              <div className="orcamentos-modal-actions">

                <button
                  type="button"
                  className="orcamentos-secondary-button"
                  onClick={fecharNovoOrcamento}
                  disabled={salvando}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="orcamentos-primary-button"
                  disabled={salvando}
                >

                  {salvando
                    ? "Criando..."
                    : "Criar orçamento"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default Orcamentos;