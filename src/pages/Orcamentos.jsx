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

  const [profileOpen, setProfileOpen] = useState(false);

  // ========================================
  // NOVO ORÇAMENTO
  // ========================================

  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState("");

  const [formulario, setFormulario] = useState({
    cliente_nome: "",
    cliente_documento: "",
    cliente_email: "",
    cliente_telefone: "",
    observacoes: ""
  });

  // ========================================
  // DETALHES DO ORÇAMENTO
  // ========================================

  const [orcamentoSelecionado, setOrcamentoSelecionado] =
    useState(null);

  const [itensOrcamento, setItensOrcamento] =
    useState([]);

  const [carregandoItens, setCarregandoItens] =
    useState(false);

  const [erroItens, setErroItens] =
    useState("");


  // ========================================
  // ADICIONAR PRODUTO
  // ========================================

  const [modalProdutoOpen, setModalProdutoOpen] =
    useState(false);

  const [produtosCatalogo, setProdutosCatalogo] =
    useState([]);

  const [carregandoProdutos, setCarregandoProdutos] =
    useState(false);

  const [erroProdutos, setErroProdutos] =
    useState("");

  const [buscaProduto, setBuscaProduto] =
    useState("");

  const [categoriaProduto, setCategoriaProduto] =
    useState("todas");

  const [produtoSelecionado, setProdutoSelecionado] =
    useState(null);

  const [quantidadeProduto, setQuantidadeProduto] =
    useState(1);

  const [adicionandoProduto, setAdicionandoProduto] =
    useState(false);


  // ========================================
  // EDITAR / REMOVER ITEM
  // ========================================

  const [itemEmEdicao, setItemEmEdicao] =
    useState(null);

  const [quantidadeEdicao, setQuantidadeEdicao] =
    useState(1);

  const [processandoItemId, setProcessandoItemId] =
    useState(null);

  const [confirmandoRemocaoId, setConfirmandoRemocaoId] =
    useState(null);

  const [erroAcaoItem, setErroAcaoItem] =
    useState("");


  // ========================================
  // FLUXO DO ORÇAMENTO
  // ========================================

  const [processandoOrcamento, setProcessandoOrcamento] =
    useState(false);

  const [erroFluxoOrcamento, setErroFluxoOrcamento] =
    useState("");

  const [confirmacaoFluxo, setConfirmacaoFluxo] =
    useState(null);

  const [alertaSistema, setAlertaSistema] =
    useState(null);


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

      const {
        data: usuarioData,
        error: usuarioError
      } = await supabase.auth.getUser();

      if (usuarioError) {
        throw usuarioError;
      }

      const user = usuarioData?.user;

      if (!user) {
        throw new Error("Usuário não autenticado.");
      }

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
        throw new Error("Perfil do usuário não encontrado.");
      }

      setRole(perfil.role);

      if (
        perfil.role !== "representante" &&
        perfil.role !== "comercial"
      ) {
        setOrcamentos([]);
        return;
      }

      let consultaOrcamentos = supabase
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
        .order("created_at", {
          ascending: false
        });


      // Para o representante, orçamentos cancelados
      // permanecem no banco para histórico/auditoria,
      // mas não aparecem mais na tela.
      if (perfil.role === "representante") {

        consultaOrcamentos =
          consultaOrcamentos.neq(
            "status",
            "cancelado"
          );

      }


      const {
        data,
        error
      } = await consultaOrcamentos;


      if (error) {
        throw error;
      }


      setOrcamentos(data || []);

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
      total: orcamentos.length,

      rascunho: orcamentos.filter(
        (item) => item.status === "rascunho"
      ).length,

      enviado: orcamentos.filter(
        (item) => item.status === "enviado"
      ).length,

      aprovado: orcamentos.filter(
        (item) => item.status === "aprovado"
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
  // NOVO ORÇAMENTO
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


  function fecharNovoOrcamento() {

    if (salvando) {
      return;
    }

    setModalNovoOpen(false);
    setErroFormulario("");

  }


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

      // O frontend envia apenas os campos comerciais.
      // id, created_by, status e datas continuam
      // sendo controlados pelo banco.
      const {
        data,
        error
      } = await supabase
        .from("orcamentos")
        .insert({
          cliente_nome: clienteNome,

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
        throw new Error("O orçamento não foi criado.");
      }

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
  // ITENS DO ORÇAMENTO
  // ========================================

  async function carregarItensDoOrcamento(orcamentoId) {

    try {

      setItensOrcamento([]);
      setErroItens("");
      setCarregandoItens(true);

      const {
        data,
        error
      } = await supabase
        .from("orcamento_itens")
        .select(`
          id,
          orcamento_id,
          produto_id,
          codigo_produto,
          nome_produto,
          variacao_produto,
          tipo_preco,
          preco_unitario,
          quantidade,
          subtotal,
          created_at,
          updated_at
        `)
        .eq(
          "orcamento_id",
          orcamentoId
        )
        .order("created_at", {
          ascending: true
        });

      if (error) {
        throw error;
      }

      setItensOrcamento(
        data || []
      );

    }
    catch (error) {

      console.error(
        "Erro ao carregar itens:",
        error
      );

      setErroItens(
        error?.message ||
        "Não foi possível carregar os produtos deste orçamento."
      );

    }
    finally {

      setCarregandoItens(false);

    }

  }


  // ========================================
  // ABRIR ORÇAMENTO
  // ========================================

  async function abrirOrcamento(orcamento) {

    setOrcamentoSelecionado(orcamento);

    await carregarItensDoOrcamento(
      orcamento.id
    );

  }


  function fecharOrcamento() {

    if (
      modalProdutoOpen ||
      processandoItemId ||
      processandoOrcamento
    ) {
      return;
    }

    setOrcamentoSelecionado(null);
    setItensOrcamento([]);
    setErroItens("");
    setErroAcaoItem("");
    setItemEmEdicao(null);
    setQuantidadeEdicao(1);
    setConfirmandoRemocaoId(null);
    setErroFluxoOrcamento("");
    setConfirmacaoFluxo(null);

  }


  // ========================================
  // ALERTA DO SISTEMA
  // ========================================

  function mostrarAlertaSistema(
    titulo,
    mensagem,
    tipo = "sucesso"
  ) {

    setAlertaSistema({
      titulo,
      mensagem,
      tipo
    });

    window.setTimeout(
      () => {
        setAlertaSistema(null);
      },
      6000
    );

  }


  // ========================================
  // FLUXO DO ORÇAMENTO
  // ========================================

  function atualizarStatusOrcamentoLocal(
    orcamentoId,
    novoStatus
  ) {

    setOrcamentos(
      (anteriores) =>
        anteriores.map(
          (orcamento) =>
            orcamento.id === orcamentoId
              ? {
                  ...orcamento,
                  status: novoStatus
                }
              : orcamento
        )
    );

    setOrcamentoSelecionado(
      (anterior) => {

        if (
          !anterior ||
          anterior.id !== orcamentoId
        ) {
          return anterior;
        }

        return {
          ...anterior,
          status: novoStatus
        };

      }
    );

  }


  function solicitarConfirmacaoFluxo(tipo) {

    if (processandoOrcamento) {
      return;
    }

    setErroFluxoOrcamento("");
    setConfirmacaoFluxo(tipo);

  }


  function cancelarConfirmacaoFluxo() {

    if (processandoOrcamento) {
      return;
    }

    setConfirmacaoFluxo(null);
    setErroFluxoOrcamento("");

  }


  async function enviarOrcamento() {

    if (
      role !== "representante" ||
      !orcamentoSelecionado ||
      orcamentoSelecionado.status !== "rascunho"
    ) {
      return;
    }

    try {

      setProcessandoOrcamento(true);
      setErroFluxoOrcamento("");

      const {
        error
      } = await supabase.rpc(
        "enviar_orcamento",
        {
          p_orcamento_id:
            orcamentoSelecionado.id
        }
      );

      if (error) {
        throw error;
      }

      atualizarStatusOrcamentoLocal(
        orcamentoSelecionado.id,
        "enviado"
      );

      setConfirmacaoFluxo(null);

      // Fecha os detalhes do orçamento após o envio.
      setOrcamentoSelecionado(null);
      setItensOrcamento([]);
      setErroItens("");
      setErroAcaoItem("");

      // Exibe confirmação no padrão visual do sistema.
      mostrarAlertaSistema(
        "Orçamento enviado para análise",
        "O orçamento foi enviado com sucesso e agora será verificado pelo setor Comercial."
      );

    }
    catch (error) {

      console.error(
        "Erro ao enviar orçamento:",
        error
      );

      setErroFluxoOrcamento(
        error?.message ||
        "Não foi possível enviar o orçamento."
      );

    }
    finally {

      setProcessandoOrcamento(false);

    }

  }


  async function cancelarOrcamento() {

    if (
      role !== "representante" ||
      !orcamentoSelecionado ||
      !["rascunho", "enviado"].includes(
        orcamentoSelecionado.status
      )
    ) {
      return;
    }

    try {

      setProcessandoOrcamento(true);
      setErroFluxoOrcamento("");

      const {
        error
      } = await supabase.rpc(
        "cancelar_orcamento",
        {
          p_orcamento_id:
            orcamentoSelecionado.id
        }
      );

      if (error) {
        throw error;
      }

      const orcamentoCanceladoId =
        orcamentoSelecionado.id;


      // Mantém o registro no Supabase como "cancelado",
      // mas remove imediatamente da lista do representante.
      setOrcamentos(
        (anteriores) =>
          anteriores.filter(
            (orcamento) =>
              orcamento.id !== orcamentoCanceladoId
          )
      );


      setConfirmacaoFluxo(null);

      setOrcamentoSelecionado(null);
      setItensOrcamento([]);
      setErroItens("");
      setErroAcaoItem("");


      mostrarAlertaSistema(
        "Orçamento cancelado",
        "O orçamento foi cancelado com sucesso e removido da sua lista."
      );

    }
    catch (error) {

      console.error(
        "Erro ao cancelar orçamento:",
        error
      );

      setErroFluxoOrcamento(
        error?.message ||
        "Não foi possível cancelar o orçamento."
      );

    }
    finally {

      setProcessandoOrcamento(false);

    }

  }


  async function decidirOrcamento(decisao) {

    if (
      role !== "comercial" ||
      !orcamentoSelecionado ||
      orcamentoSelecionado.status !== "enviado" ||
      !["aprovado", "recusado"].includes(decisao)
    ) {
      return;
    }

    try {

      setProcessandoOrcamento(true);
      setErroFluxoOrcamento("");

      const {
        error
      } = await supabase.rpc(
        "decidir_orcamento",
        {
          p_orcamento_id:
            orcamentoSelecionado.id,

          p_decisao:
            decisao
        }
      );

      if (error) {
        throw error;
      }

      atualizarStatusOrcamentoLocal(
        orcamentoSelecionado.id,
        decisao
      );

      setConfirmacaoFluxo(null);

    }
    catch (error) {

      console.error(
        "Erro ao decidir orçamento:",
        error
      );

      setErroFluxoOrcamento(
        error?.message ||
        "Não foi possível registrar a decisão."
      );

    }
    finally {

      setProcessandoOrcamento(false);

    }

  }


  // ========================================
  // EDITAR QUANTIDADE / REMOVER ITEM
  // ========================================

  function iniciarEdicaoQuantidade(item) {

    if (
      role !== "representante" ||
      orcamentoSelecionado?.status !== "rascunho"
    ) {
      return;
    }

    setErroAcaoItem("");
    setConfirmandoRemocaoId(null);
    setItemEmEdicao(item.id);
    setQuantidadeEdicao(item.quantidade);

  }


  function cancelarEdicaoQuantidade() {

    if (processandoItemId) {
      return;
    }

    setItemEmEdicao(null);
    setQuantidadeEdicao(1);
    setErroAcaoItem("");

  }


  async function salvarQuantidadeItem(item) {

    if (
      role !== "representante" ||
      orcamentoSelecionado?.status !== "rascunho"
    ) {
      return;
    }

    const quantidade =
      Number(quantidadeEdicao);

    if (
      !Number.isInteger(quantidade) ||
      quantidade < 1 ||
      quantidade > 999999
    ) {

      setErroAcaoItem(
        "Informe uma quantidade válida."
      );

      return;

    }

    try {

      setProcessandoItemId(item.id);
      setErroAcaoItem("");

      const {
        error
      } = await supabase.rpc(
        "atualizar_quantidade_item",
        {
          p_item_id: item.id,
          p_quantidade: quantidade
        }
      );

      if (error) {
        throw error;
      }

      await carregarItensDoOrcamento(
        orcamentoSelecionado.id
      );

      setItemEmEdicao(null);
      setQuantidadeEdicao(1);

    }
    catch (error) {

      console.error(
        "Erro ao atualizar quantidade:",
        error
      );

      setErroAcaoItem(
        error?.message ||
        "Não foi possível atualizar a quantidade."
      );

    }
    finally {

      setProcessandoItemId(null);

    }

  }


  async function removerItemDoOrcamento(item) {

    if (
      role !== "representante" ||
      orcamentoSelecionado?.status !== "rascunho"
    ) {
      return;
    }

    if (confirmandoRemocaoId !== item.id) {

      setErroAcaoItem("");
      setItemEmEdicao(null);
      setConfirmandoRemocaoId(item.id);

      return;

    }

    try {

      setProcessandoItemId(item.id);
      setErroAcaoItem("");

      const {
        error
      } = await supabase.rpc(
        "remover_item_orcamento",
        {
          p_item_id: item.id
        }
      );

      if (error) {
        throw error;
      }

      await carregarItensDoOrcamento(
        orcamentoSelecionado.id
      );

      setConfirmandoRemocaoId(null);

    }
    catch (error) {

      console.error(
        "Erro ao remover item:",
        error
      );

      setErroAcaoItem(
        error?.message ||
        "Não foi possível remover o produto."
      );

    }
    finally {

      setProcessandoItemId(null);

    }

  }


  // ========================================
  // CATÁLOGO DE PRODUTOS
  // ========================================

  async function abrirAdicionarProduto() {

    if (
      role !== "representante" ||
      !orcamentoSelecionado ||
      orcamentoSelecionado.status !== "rascunho"
    ) {
      return;
    }

    setModalProdutoOpen(true);
    setBuscaProduto("");
    setCategoriaProduto("todas");
    setProdutoSelecionado(null);
    setQuantidadeProduto(1);
    setErroProdutos("");

    if (produtosCatalogo.length > 0) {
      return;
    }

    try {

      setCarregandoProdutos(true);

      const {
        data,
        error
      } = await supabase
        .from("produtos_orcamento")
        .select(`
          id,
          codigo,
          nome,
          preco,
          categoria,
          linha,
          descricao,
          variacao,
          tipo_preco,
          ativo
        `)
        .eq("ativo", true)
        .order("categoria", {
          ascending: true
        })
        .order("nome", {
          ascending: true
        });

      if (error) {
        throw error;
      }

      setProdutosCatalogo(
        data || []
      );

    }
    catch (error) {

      console.error(
        "Erro ao carregar produtos:",
        error
      );

      setErroProdutos(
        error?.message ||
        "Não foi possível carregar o catálogo de produtos."
      );

    }
    finally {

      setCarregandoProdutos(false);

    }

  }


  function fecharAdicionarProduto() {

    if (adicionandoProduto) {
      return;
    }

    setModalProdutoOpen(false);
    setProdutoSelecionado(null);
    setQuantidadeProduto(1);
    setErroProdutos("");

  }


  const categoriasProdutos = useMemo(() => {

    const categorias = produtosCatalogo
      .map(
        (produto) =>
          produto.categoria
      )
      .filter(Boolean);

    return [
      ...new Set(categorias)
    ].sort(
      (a, b) =>
        a.localeCompare(
          b,
          "pt-BR"
        )
    );

  }, [produtosCatalogo]);


  const produtosFiltrados = useMemo(() => {

    const termo =
      buscaProduto
        .trim()
        .toLowerCase();

    return produtosCatalogo.filter(
      (produto) => {

        const categoriaOk =
          categoriaProduto === "todas" ||
          produto.categoria === categoriaProduto;

        if (!categoriaOk) {
          return false;
        }

        if (!termo) {
          return true;
        }

        const texto = [
          produto.codigo,
          produto.nome,
          produto.categoria,
          produto.linha,
          produto.descricao,
          produto.variacao,
          produto.tipo_preco
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texto.includes(termo);

      }
    );

  }, [
    produtosCatalogo,
    buscaProduto,
    categoriaProduto
  ]);


  async function adicionarProdutoAoOrcamento() {

    if (
      !produtoSelecionado ||
      !orcamentoSelecionado
    ) {
      return;
    }

    const quantidade =
      Number(quantidadeProduto);

    if (
      !Number.isInteger(quantidade) ||
      quantidade < 1 ||
      quantidade > 999999
    ) {

      setErroProdutos(
        "Informe uma quantidade válida."
      );

      return;

    }

    try {

      setAdicionandoProduto(true);
      setErroProdutos("");

      // Segurança:
      // o frontend NÃO envia preço.
      // O Supabase busca o valor oficial
      // dentro da função adicionar_item_orcamento.
      const {
        error
      } = await supabase.rpc(
        "adicionar_item_orcamento",
        {
          p_orcamento_id:
            orcamentoSelecionado.id,

          p_produto_id:
            produtoSelecionado.id,

          p_quantidade:
            quantidade
        }
      );

      if (error) {
        throw error;
      }

      await carregarItensDoOrcamento(
        orcamentoSelecionado.id
      );

      setModalProdutoOpen(false);
      setProdutoSelecionado(null);
      setQuantidadeProduto(1);
      setBuscaProduto("");
      setCategoriaProduto("todas");

    }
    catch (error) {

      console.error(
        "Erro ao adicionar produto:",
        error
      );

      setErroProdutos(
        error?.message ||
        "Não foi possível adicionar o produto ao orçamento."
      );

    }
    finally {

      setAdicionandoProduto(false);

    }

  }


  // ========================================
  // FORMATADORES
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


  function formatarMoeda(valor) {

    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    ).format(
      Number(valor || 0)
    );

  }


  const totalOrcamento = useMemo(() => {

    return itensOrcamento.reduce(
      (total, item) =>
        total + Number(item.subtotal || 0),
      0
    );

  }, [itensOrcamento]);


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
            Aguarde enquanto buscamos suas informações.
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
            Não foi possível carregar os orçamentos
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
        {/* TABELA                           */}
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

                      <tr
                        key={orcamento.id}
                        className="orcamentos-table-row-clickable"
                        tabIndex={0}
                        onClick={() =>
                          abrirOrcamento(orcamento)
                        }
                        onKeyDown={(event) => {

                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {

                            event.preventDefault();
                            abrirOrcamento(orcamento);

                          }

                        }}
                      >

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


      {/* ================================= */}
      {/* ALERTA DO SISTEMA                 */}
      {/* ================================= */}

      {alertaSistema && (

        <div
          className={
            `orcamentos-alerta-sistema ${alertaSistema.tipo}`
          }
          role="status"
          aria-live="polite"
        >

          <div className="orcamentos-alerta-icone">
            ✓
          </div>


          <div className="orcamentos-alerta-conteudo">

            <strong>
              {alertaSistema.titulo}
            </strong>

            <p>
              {alertaSistema.mensagem}
            </p>

          </div>


          <button
            type="button"
            className="orcamentos-alerta-fechar"
            onClick={() =>
              setAlertaSistema(null)
            }
            aria-label="Fechar alerta"
          >
            ×
          </button>

        </div>

      )}


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
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-novo-orcamento"
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

                <h2 id="titulo-novo-orcamento">
                  Dados do cliente
                </h2>

                <p>
                  Preencha as informações para criar um novo rascunho.
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


      {/* ================================= */}
      {/* MODAL DETALHES DO ORÇAMENTO       */}
      {/* ================================= */}

      {orcamentoSelecionado && (

        <div
          className="orcamentos-modal-overlay"
          onMouseDown={fecharOrcamento}
        >

          <div
            className="orcamentos-modal orcamentos-modal-detalhes"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalhes-orcamento"
            onMouseDown={
              (event) =>
                event.stopPropagation()
            }
          >

            <div className="orcamentos-modal-header">

              <div>

                <span>
                  ORÇAMENTO
                </span>

                <h2 id="titulo-detalhes-orcamento">
                  {orcamentoSelecionado.cliente_nome}
                </h2>

                <p>
                  Acompanhe os produtos e valores deste orçamento.
                </p>

              </div>


              <button
                type="button"
                className="orcamentos-modal-close"
                onClick={fecharOrcamento}
                aria-label="Fechar"
              >
                ×
              </button>

            </div>


            <div className="orcamentos-detalhes-body">

              <div className="orcamentos-detalhes-info">

                <div>

                  <span>
                    STATUS
                  </span>

                  <strong
                    className={
                      `orcamentos-status status-${orcamentoSelecionado.status}`
                    }
                  >
                    {formatarStatus(
                      orcamentoSelecionado.status
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    DOCUMENTO
                  </span>

                  <strong>
                    {orcamentoSelecionado.cliente_documento || "-"}
                  </strong>

                </div>


                <div>

                  <span>
                    TELEFONE
                  </span>

                  <strong>
                    {orcamentoSelecionado.cliente_telefone || "-"}
                  </strong>

                </div>


                <div>

                  <span>
                    E-MAIL
                  </span>

                  <strong>
                    {orcamentoSelecionado.cliente_email || "-"}
                  </strong>

                </div>

              </div>


              {orcamentoSelecionado.observacoes && (

                <div className="orcamentos-observacoes">

                  <span>
                    OBSERVAÇÕES
                  </span>

                  <p>
                    {orcamentoSelecionado.observacoes}
                  </p>

                </div>

              )}


              <div className="orcamentos-detalhes-header">

                <div>

                  <span>
                    PRODUTOS
                  </span>

                  <p>
                    Produtos adicionados ao orçamento.
                  </p>

                </div>


                {role === "representante" &&
                  orcamentoSelecionado.status === "rascunho" && (

                    <button
                      type="button"
                      className="orcamentos-primary-button"
                      onClick={abrirAdicionarProduto}
                    >
                      <span>
                        +
                      </span>

                      Adicionar produto
                    </button>

                  )}

              </div>


              {carregandoItens && (

                <div className="orcamentos-itens-state">

                  <div className="orcamentos-loader"></div>

                  <p>
                    Carregando produtos...
                  </p>

                </div>

              )}


              {!carregandoItens &&
                erroItens && (

                  <div className="orcamentos-form-error orcamentos-itens-error">
                    {erroItens}
                  </div>

                )}


              {!carregandoItens &&
                !erroItens &&
                itensOrcamento.length === 0 && (

                  <div className="orcamentos-itens-empty">

                    <div className="orcamentos-empty-mini-icon">
                      +
                    </div>

                    <h3>
                      Nenhum produto adicionado
                    </h3>

                    <p>
                      Este orçamento ainda não possui produtos.
                    </p>

                  </div>

                )}


              {!carregandoItens &&
                !erroItens &&
                erroAcaoItem && (

                  <div className="orcamentos-form-error orcamentos-itens-error">
                    {erroAcaoItem}
                  </div>

                )}


              {!carregandoItens &&
                !erroItens &&
                itensOrcamento.length > 0 && (

                  <>

                    <div className="orcamentos-itens-lista">

                      {itensOrcamento.map(
                        (item) => (

                          <div
                            className="orcamentos-item"
                            key={item.id}
                          >

                            <div className="orcamentos-item-produto">

                              <span>
                                {item.codigo_produto}
                              </span>

                              <strong>
                                {item.nome_produto}
                              </strong>

                              {item.variacao_produto && (

                                <small>
                                  {item.variacao_produto}
                                </small>

                              )}

                              {item.tipo_preco && (

                                <small>
                                  {item.tipo_preco}
                                </small>

                              )}

                            </div>


                            <div className="orcamentos-item-preco-unitario">

                              <span>
                                VALOR UNITÁRIO
                              </span>

                              <strong>
                                {formatarMoeda(
                                  item.preco_unitario
                                )}
                              </strong>

                            </div>


                            <div className="orcamentos-item-valores">

                              <span>
                                {item.quantidade}x
                              </span>

                              <strong>
                                {formatarMoeda(
                                  item.subtotal
                                )}
                              </strong>

                            </div>


                            {role === "representante" &&
                              orcamentoSelecionado.status === "rascunho" && (

                                <div className="orcamentos-item-acoes">

                                  {itemEmEdicao === item.id ? (

                                    <div className="orcamentos-item-edicao">

                                      <label
                                        htmlFor={`qtd-${item.id}`}
                                      >
                                        Quantidade
                                      </label>

                                      <div className="orcamentos-item-edicao-linha">

                                        <input
                                          id={`qtd-${item.id}`}
                                          type="number"
                                          min="1"
                                          max="999999"
                                          step="1"
                                          value={quantidadeEdicao}
                                          onChange={
                                            (event) =>
                                              setQuantidadeEdicao(
                                                event.target.value
                                              )
                                          }
                                          disabled={
                                            processandoItemId === item.id
                                          }
                                        />

                                        <button
                                          type="button"
                                          className="orcamentos-item-btn salvar"
                                          onClick={() =>
                                            salvarQuantidadeItem(item)
                                          }
                                          disabled={
                                            processandoItemId === item.id
                                          }
                                        >
                                          {processandoItemId === item.id
                                            ? "Salvando..."
                                            : "Salvar"}
                                        </button>

                                        <button
                                          type="button"
                                          className="orcamentos-item-btn"
                                          onClick={cancelarEdicaoQuantidade}
                                          disabled={
                                            processandoItemId === item.id
                                          }
                                        >
                                          Cancelar
                                        </button>

                                      </div>

                                    </div>

                                  ) : (

                                    <>

                                      <button
                                        type="button"
                                        className="orcamentos-item-btn"
                                        onClick={() =>
                                          iniciarEdicaoQuantidade(item)
                                        }
                                        disabled={
                                          Boolean(processandoItemId)
                                        }
                                      >
                                        Alterar quantidade
                                      </button>


                                      <button
                                        type="button"
                                        className={
                                          `orcamentos-item-btn remover${
                                            confirmandoRemocaoId === item.id
                                              ? " confirmar"
                                              : ""
                                          }`
                                        }
                                        onClick={() =>
                                          removerItemDoOrcamento(item)
                                        }
                                        disabled={
                                          Boolean(processandoItemId)
                                        }
                                      >
                                        {processandoItemId === item.id
                                          ? "Removendo..."
                                          : confirmandoRemocaoId === item.id
                                            ? "Confirmar remoção"
                                            : "Remover"}
                                      </button>

                                    </>

                                  )}

                                </div>

                              )}

                          </div>

                        )
                      )}

                    </div>


                    <div className="orcamentos-total">

                      <span>
                        TOTAL DO ORÇAMENTO
                      </span>

                      <strong>
                        {formatarMoeda(
                          totalOrcamento
                        )}
                      </strong>

                    </div>

                  </>

                )}


              {/* ================================= */}
              {/* FLUXO DO ORÇAMENTO                */}
              {/* ================================= */}

              <div className="orcamentos-fluxo">

                <div className="orcamentos-fluxo-info">

                  <span>
                    FLUXO DO ORÇAMENTO
                  </span>

                  <p>

                    {orcamentoSelecionado.status === "rascunho" &&
                      "O orçamento está em preparação e ainda pode ser alterado."}

                    {orcamentoSelecionado.status === "enviado" &&
                      role === "representante" &&
                      "Orçamento enviado para análise do Comercial. Os produtos estão bloqueados para edição."}

                    {orcamentoSelecionado.status === "enviado" &&
                      role === "comercial" &&
                      "Este orçamento aguarda sua análise. Confira os produtos e valores antes de decidir."}

                    {orcamentoSelecionado.status === "aprovado" &&
                      "Este orçamento foi aprovado pelo Comercial."}

                    {orcamentoSelecionado.status === "recusado" &&
                      "Este orçamento foi recusado pelo Comercial."}

                    {orcamentoSelecionado.status === "cancelado" &&
                      "Este orçamento foi cancelado e está encerrado."}

                  </p>

                </div>


                {erroFluxoOrcamento && (

                  <div className="orcamentos-form-error orcamentos-fluxo-error">
                    {erroFluxoOrcamento}
                  </div>

                )}


                {confirmacaoFluxo && (

                  <div className="orcamentos-confirmacao-fluxo">

                    <div>

                      <strong>

                        {confirmacaoFluxo === "enviar" &&
                          "Enviar este orçamento para análise?"}

                        {confirmacaoFluxo === "cancelar" &&
                          "Cancelar este orçamento?"}

                        {confirmacaoFluxo === "aprovar" &&
                          "Aprovar este orçamento?"}

                        {confirmacaoFluxo === "recusar" &&
                          "Recusar este orçamento?"}

                      </strong>

                      <p>

                        {confirmacaoFluxo === "enviar" &&
                          "Depois do envio, o representante não poderá alterar os produtos ou quantidades."}

                        {confirmacaoFluxo === "cancelar" &&
                          "O orçamento será encerrado como cancelado."}

                        {confirmacaoFluxo === "aprovar" &&
                          "A decisão será registrada como aprovada e não poderá ser refeita pelo representante."}

                        {confirmacaoFluxo === "recusar" &&
                          "A decisão será registrada como recusada."}

                      </p>

                    </div>


                    <div className="orcamentos-confirmacao-acoes">

                      <button
                        type="button"
                        className="orcamentos-secondary-button"
                        onClick={cancelarConfirmacaoFluxo}
                        disabled={processandoOrcamento}
                      >
                        Voltar
                      </button>


                      {confirmacaoFluxo === "enviar" && (

                        <button
                          type="button"
                          className="orcamentos-primary-button"
                          onClick={enviarOrcamento}
                          disabled={processandoOrcamento}
                        >
                          {processandoOrcamento
                            ? "Enviando..."
                            : "Confirmar envio"}
                        </button>

                      )}


                      {confirmacaoFluxo === "cancelar" && (

                        <button
                          type="button"
                          className="orcamentos-danger-button"
                          onClick={cancelarOrcamento}
                          disabled={processandoOrcamento}
                        >
                          {processandoOrcamento
                            ? "Cancelando..."
                            : "Confirmar cancelamento"}
                        </button>

                      )}


                      {confirmacaoFluxo === "aprovar" && (

                        <button
                          type="button"
                          className="orcamentos-primary-button"
                          onClick={() =>
                            decidirOrcamento("aprovado")
                          }
                          disabled={processandoOrcamento}
                        >
                          {processandoOrcamento
                            ? "Aprovando..."
                            : "Confirmar aprovação"}
                        </button>

                      )}


                      {confirmacaoFluxo === "recusar" && (

                        <button
                          type="button"
                          className="orcamentos-danger-button"
                          onClick={() =>
                            decidirOrcamento("recusado")
                          }
                          disabled={processandoOrcamento}
                        >
                          {processandoOrcamento
                            ? "Recusando..."
                            : "Confirmar recusa"}
                        </button>

                      )}

                    </div>

                  </div>

                )}


                {!confirmacaoFluxo && (

                  <div className="orcamentos-fluxo-acoes">


                    {/* REPRESENTANTE */}

                    {role === "representante" &&
                      orcamentoSelecionado.status === "rascunho" && (

                        <>

                          <button
                            type="button"
                            className="orcamentos-danger-ghost-button"
                            onClick={() =>
                              solicitarConfirmacaoFluxo(
                                "cancelar"
                              )
                            }
                            disabled={processandoOrcamento}
                          >
                            Cancelar orçamento
                          </button>


                          <button
                            type="button"
                            className="orcamentos-primary-button"
                            onClick={() =>
                              solicitarConfirmacaoFluxo(
                                "enviar"
                              )
                            }
                            disabled={
                              processandoOrcamento ||
                              carregandoItens ||
                              itensOrcamento.length === 0
                            }
                            title={
                              itensOrcamento.length === 0
                                ? "Adicione pelo menos um produto antes de enviar."
                                : ""
                            }
                          >
                            Enviar para análise
                          </button>

                        </>

                      )}


                    {role === "representante" &&
                      orcamentoSelecionado.status === "enviado" && (

                        <button
                          type="button"
                          className="orcamentos-danger-ghost-button"
                          onClick={() =>
                            solicitarConfirmacaoFluxo(
                              "cancelar"
                            )
                          }
                          disabled={processandoOrcamento}
                        >
                          Cancelar orçamento
                        </button>

                      )}


                    {/* COMERCIAL */}

                    {role === "comercial" &&
                      orcamentoSelecionado.status === "enviado" && (

                        <>

                          <button
                            type="button"
                            className="orcamentos-danger-ghost-button"
                            onClick={() =>
                              solicitarConfirmacaoFluxo(
                                "recusar"
                              )
                            }
                            disabled={processandoOrcamento}
                          >
                            Recusar
                          </button>


                          <button
                            type="button"
                            className="orcamentos-primary-button"
                            onClick={() =>
                              solicitarConfirmacaoFluxo(
                                "aprovar"
                              )
                            }
                            disabled={processandoOrcamento}
                          >
                            Aprovar orçamento
                          </button>

                        </>

                      )}

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* MODAL ADICIONAR PRODUTO           */}
      {/* ================================= */}

      {modalProdutoOpen && (

        <div
          className="orcamentos-modal-overlay orcamentos-modal-overlay-produto"
          onMouseDown={fecharAdicionarProduto}
        >

          <div
            className="orcamentos-modal orcamentos-modal-produtos"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-adicionar-produto"
            onMouseDown={
              (event) =>
                event.stopPropagation()
            }
          >

            <div className="orcamentos-modal-header">

              <div>

                <span>
                  CATÁLOGO OFICIAL
                </span>

                <h2 id="titulo-adicionar-produto">
                  Adicionar produto
                </h2>

                <p>
                  Pesquise um produto e escolha a quantidade.
                </p>

              </div>


              <button
                type="button"
                className="orcamentos-modal-close"
                onClick={fecharAdicionarProduto}
                disabled={adicionandoProduto}
                aria-label="Fechar"
              >
                ×
              </button>

            </div>


            <div className="orcamentos-produtos-body">

              <div className="orcamentos-produtos-filtros">

                <div className="orcamentos-produtos-busca">

                  <label htmlFor="busca_produto">
                    Buscar
                  </label>

                  <input
                    id="busca_produto"
                    type="search"
                    value={buscaProduto}
                    onChange={
                      (event) =>
                        setBuscaProduto(
                          event.target.value
                        )
                    }
                    placeholder="Nome, código, linha ou descrição..."
                    disabled={
                      carregandoProdutos ||
                      adicionandoProduto
                    }
                  />

                </div>


                <div className="orcamentos-produtos-categoria">

                  <label htmlFor="categoria_produto">
                    Categoria
                  </label>

                  <select
                    id="categoria_produto"
                    value={categoriaProduto}
                    onChange={
                      (event) =>
                        setCategoriaProduto(
                          event.target.value
                        )
                    }
                    disabled={
                      carregandoProdutos ||
                      adicionandoProduto
                    }
                  >

                    <option value="todas">
                      Todas as categorias
                    </option>

                    {categoriasProdutos.map(
                      (categoria) => (

                        <option
                          key={categoria}
                          value={categoria}
                        >
                          {categoria}
                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              {carregandoProdutos && (

                <div className="orcamentos-produtos-state">

                  <div className="orcamentos-loader"></div>

                  <p>
                    Carregando catálogo...
                  </p>

                </div>

              )}


              {!carregandoProdutos &&
                erroProdutos && (

                  <div className="orcamentos-form-error">
                    {erroProdutos}
                  </div>

                )}


              {!carregandoProdutos &&
                !erroProdutos && (

                  <>

                    <div className="orcamentos-produtos-contador">

                      <span>
                        {produtosFiltrados.length}
                      </span>

                      produto(s) encontrado(s)

                    </div>


                    <div className="orcamentos-produtos-lista">

                      {produtosFiltrados.length === 0 && (

                        <div className="orcamentos-produtos-vazio">

                          Nenhum produto encontrado com estes filtros.

                        </div>

                      )}


                      {produtosFiltrados.map(
                        (produto) => {

                          const selecionado =
                            produtoSelecionado?.id ===
                            produto.id;

                          return (

                            <button
                              type="button"
                              key={produto.id}
                              className={
                                `orcamentos-produto-card${
                                  selecionado
                                    ? " selecionado"
                                    : ""
                                }`
                              }
                              onClick={() =>
                                setProdutoSelecionado(
                                  produto
                                )
                              }
                              disabled={adicionandoProduto}
                            >

                              <div className="orcamentos-produto-main">

                                <div className="orcamentos-produto-topo">

                                  <span className="orcamentos-produto-codigo">
                                    {produto.codigo}
                                  </span>

                                  {produto.tipo_preco && (

                                    <span className="orcamentos-produto-tipo">
                                      {produto.tipo_preco}
                                    </span>

                                  )}

                                </div>


                                <strong>
                                  {produto.nome}
                                </strong>


                                <div className="orcamentos-produto-meta">

                                  {produto.categoria && (
                                    <span>
                                      {produto.categoria}
                                    </span>
                                  )}

                                  {produto.variacao && (
                                    <span>
                                      {produto.variacao}
                                    </span>
                                  )}

                                </div>

                              </div>


                              <div className="orcamentos-produto-preco">

                                <span>
                                  VALOR
                                </span>

                                <strong>
                                  {formatarMoeda(
                                    produto.preco
                                  )}
                                </strong>

                              </div>

                            </button>

                          );

                        }
                      )}

                    </div>

                  </>

                )}


              {produtoSelecionado && (

                <div className="orcamentos-produto-selecionado">

                  <div>

                    <span>
                      PRODUTO SELECIONADO
                    </span>

                    <strong>
                      {produtoSelecionado.nome}
                    </strong>

                    <small>
                      {produtoSelecionado.codigo}
                    </small>

                  </div>


                  <div className="orcamentos-quantidade">

                    <label htmlFor="quantidade_produto">
                      Quantidade
                    </label>

                    <input
                      id="quantidade_produto"
                      type="number"
                      min="1"
                      max="999999"
                      step="1"
                      value={quantidadeProduto}
                      onChange={
                        (event) =>
                          setQuantidadeProduto(
                            event.target.value
                          )
                      }
                      disabled={adicionandoProduto}
                    />

                  </div>


                  <div className="orcamentos-produto-total-previo">

                    <span>
                      SUBTOTAL
                    </span>

                    <strong>
                      {formatarMoeda(
                        Number(
                          produtoSelecionado.preco
                        ) *
                        Number(
                          quantidadeProduto || 0
                        )
                      )}
                    </strong>

                  </div>

                </div>

              )}


              <div className="orcamentos-modal-actions orcamentos-produtos-actions">

                <button
                  type="button"
                  className="orcamentos-secondary-button"
                  onClick={fecharAdicionarProduto}
                  disabled={adicionandoProduto}
                >
                  Cancelar
                </button>


                <button
                  type="button"
                  className="orcamentos-primary-button"
                  onClick={adicionarProdutoAoOrcamento}
                  disabled={
                    !produtoSelecionado ||
                    adicionandoProduto
                  }
                >

                  {adicionandoProduto
                    ? "Adicionando..."
                    : "Adicionar ao orçamento"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default Orcamentos;
