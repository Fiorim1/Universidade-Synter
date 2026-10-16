import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import NotificationsButton from "../pages/NotificationsButton";
import Profile from "../components/Profile";

import ImgIcon from "../assets/img-icon.png";

import tabelaPrecosData from "../data/tabelaPrecosData";

import { supabase } from "../services/supabaseClient";
import { gerarOrcamentoPdf } from "../utils/gerarOrcamentoPdf";

import "../styles/Orcamentos.css";


// ========================================
// IMAGENS / VISUALIZAÇÃO DOS PRODUTOS
// ========================================

const imagensProdutosOrcamento = import.meta.glob(
  "../assets/produtos/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default"
  }
);


function normalizarChaveProduto(valor = "") {

  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]/g, "");

}


function encontrarLinhaTabelaPorProduto(produto) {

  if (!produto) {
    return null;
  }

  const codigo =
    normalizarChaveProduto(
      produto.codigo
    );

  const nome =
    normalizarChaveProduto(
      produto.nome
    );

  const linhaCatalogo =
    normalizarChaveProduto(
      produto.linha
    );

  let melhorCandidato = null;
  let melhorPontuacao = -1;


  for (const categoria of tabelaPrecosData.categorias) {

    const categoriaNormalizada =
      normalizarChaveProduto(
        categoria.titulo
      );


    for (const linha of categoria.linhas) {

      const valoresNormalizados =
        linha
          .map(normalizarChaveProduto)
          .filter(Boolean);


      // A referência/código é a forma mais segura
      // de localizar exatamente o item na tabela.
      if (codigo.length >= 4) {

        const encontrouCodigo =
          valoresNormalizados.some(
            (valor) =>
              valor === codigo ||
              (
                valor.length >= 4 &&
                (
                  valor.includes(codigo) ||
                  codigo.includes(valor)
                )
              )
          );

        if (encontrouCodigo) {

          return {
            categoria,
            linha
          };

        }

      }


      // Fallback para itens cujo código não esteja
      // escrito exatamente da mesma forma na tabela.
      let pontuacao = 0;

      if (nome.length >= 4) {

        const encontrouNome =
          valoresNormalizados.some(
            (valor) =>
              valor.length >= 4 &&
              (
                valor.includes(nome) ||
                nome.includes(valor)
              )
          );

        if (encontrouNome) {
          pontuacao += 4;
        }

      }


      if (linhaCatalogo.length >= 3) {

        const encontrouLinha =
          valoresNormalizados.some(
            (valor) =>
              valor.length >= 3 &&
              (
                valor.includes(linhaCatalogo) ||
                linhaCatalogo.includes(valor)
              )
          );

        if (encontrouLinha) {
          pontuacao += 2;
        }

      }


      const categoriaProduto =
        normalizarChaveProduto(
          produto.categoria
        );

      if (
        categoriaProduto &&
        categoriaNormalizada &&
        (
          categoriaNormalizada.includes(
            categoriaProduto
          ) ||
          categoriaProduto.includes(
            categoriaNormalizada
          )
        )
      ) {
        pontuacao += 1;
      }


      if (
        pontuacao > melhorPontuacao &&
        pontuacao >= 4
      ) {

        melhorPontuacao = pontuacao;

        melhorCandidato = {
          categoria,
          linha
        };

      }

    }

  }


  return melhorCandidato;

}


function encontrarImagemProdutoOrcamento(
  produto,
  correspondenciaTabela
) {

  if (!produto) {
    return null;
  }

  const valoresBase =
    correspondenciaTabela?.linha || [
      produto.codigo,
      produto.nome,
      produto.linha,
      produto.descricao,
      produto.variacao,
      produto.categoria
    ];

  const valoresNormalizados =
    valoresBase
      .map(normalizarChaveProduto)
      .filter(
        (valor) =>
          valor.length >= 3
      );

  const arquivos =
    Object.entries(
      imagensProdutosOrcamento
    );


  for (const [caminho, imagem] of arquivos) {

    const nomeArquivo =
      caminho.split("/").pop() || "";

    const nomeNormalizado =
      normalizarChaveProduto(
        nomeArquivo
      );

    const encontrou =
      valoresNormalizados.some(
        (valor) =>
          nomeNormalizado.includes(valor) ||
          valor.includes(nomeNormalizado)
      );

    if (encontrou) {
      return imagem;
    }

  }


  return null;

}


function montarVisualizacaoProduto(produto) {

  if (!produto) {
    return null;
  }

  const correspondenciaTabela =
    encontrarLinhaTabelaPorProduto(
      produto
    );

  const imagem =
    encontrarImagemProdutoOrcamento(
      produto,
      correspondenciaTabela
    );

  return {
    imagem,
    categoriaTabela:
      correspondenciaTabela
        ?.categoria
        ?.titulo ||
      produto.categoria ||
      "",
    encontradoNaTabela:
      Boolean(correspondenciaTabela)
  };

}


function Orcamentos() {

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [role, setRole] = useState(null);
  const [orcamentos, setOrcamentos] = useState([]);

  const [representantesPorId, setRepresentantesPorId] =
    useState({});

  const [pesquisaOrcamentos, setPesquisaOrcamentos] =
    useState("");

  const [filtroStatus, setFiltroStatus] =
    useState("todos");

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
    observacoes: "",
    frete: "0.00",
    condicao_pagamento: "",
    local_entrega: "",
    data_entrega: "",
    observacoes_venda: ""
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
  // HISTÓRICO / AUDITORIA
  // ========================================

  const [historicoOrcamento, setHistoricoOrcamento] =
    useState([]);

  const [carregandoHistorico, setCarregandoHistorico] =
    useState(false);

  const [erroHistorico, setErroHistorico] =
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


  // ========================================
  // FUNIL DE PRODUTOS MECÂNICOS
  // ========================================

  const [modoPesquisaProduto, setModoPesquisaProduto] =
    useState("geral");

  const [filtroMacaneta, setFiltroMacaneta] =
    useState("");

  const [filtroRoseta, setFiltroRoseta] =
    useState("");

  const [filtroFuncao, setFiltroFuncao] =
    useState("");

  const [filtroAcabamento, setFiltroAcabamento] =
    useState("");

  const [filtroMaquina, setFiltroMaquina] =
    useState("");


  const [produtoSelecionado, setProdutoSelecionado] =
    useState(null);

  const [quantidadeProduto, setQuantidadeProduto] =
    useState(1);

  const [precoClienteProduto, setPrecoClienteProduto] =
    useState("");

  const [adicionandoProduto, setAdicionandoProduto] =
    useState(false);


  const visualizacaoProdutoSelecionado =
    useMemo(
      () =>
        montarVisualizacaoProduto(
          produtoSelecionado
        ),
      [produtoSelecionado]
    );


  const precoPedidoProduto =
    Number(
      produtoSelecionado?.preco || 0
    );


  const precoOrcadoProduto =
    numeroPreco(
      precoClienteProduto
    );


  const precoOrcadoProdutoValido =
    produtoSelecionado &&
    Number.isFinite(
      precoOrcadoProduto
    ) &&
    precoOrcadoProduto >= 0 &&
    precoOrcadoProduto <=
      precoPedidoProduto;


  const descontoProduto =
    precoOrcadoProdutoValido
      ? Math.max(
          0,
          precoPedidoProduto -
            precoOrcadoProduto
        )
      : 0;


  const descontoPercentualProduto =
    precoPedidoProduto > 0
      ? (
          descontoProduto /
          precoPedidoProduto
        ) * 100
      : 0;


  const subtotalProdutoPrevio =
    precoOrcadoProdutoValido
      ? precoOrcadoProduto *
        Number(
          quantidadeProduto || 0
        )
      : 0;


  // ========================================
  // EDITAR / REMOVER ITEM
  // ========================================

  const [itemEmEdicao, setItemEmEdicao] =
    useState(null);

  const [quantidadeEdicao, setQuantidadeEdicao] =
    useState(1);

  const [precoEdicao, setPrecoEdicao] =
    useState("");

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

  const [baixandoPdfCardId, setBaixandoPdfCardId] =
    useState(null);


  // ========================================
  // EDITAR ORÇAMENTO
  // ========================================

  const [modalEdicaoOpen, setModalEdicaoOpen] =
    useState(false);

  const [salvandoEdicao, setSalvandoEdicao] =
    useState(false);

  const [erroEdicao, setErroEdicao] =
    useState("");

  const [formularioEdicao, setFormularioEdicao] =
    useState({
      cliente_nome: "",
      cliente_documento: "",
      cliente_email: "",
      cliente_telefone: "",
      observacoes: "",
      frete: "0.00",
      condicao_pagamento: "",
      local_entrega: "",
      data_entrega: "",
      observacoes_venda: ""
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
          frete,
          condicao_pagamento,
          local_entrega,
          data_entrega,
          observacoes_venda,
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


      // ========================================
      // NOMES DOS REPRESENTANTES
      // ========================================
      //
      // O Comercial possui permissão de leitura
      // dos perfis para identificar quem criou
      // cada orçamento.
      // ========================================

      if (perfil.role === "comercial") {

        const idsRepresentantes = [
          ...new Set(
            (data || [])
              .map(
                (orcamento) =>
                  orcamento.created_by
              )
              .filter(Boolean)
          )
        ];


        if (idsRepresentantes.length > 0) {

          const {
            data: perfisRepresentantes,
            error: perfisRepresentantesError
          } = await supabase
            .from("profiles")
            .select(`
              id,
              full_name
            `)
            .in(
              "id",
              idsRepresentantes
            );


          if (perfisRepresentantesError) {
            throw perfisRepresentantesError;
          }


          const mapaRepresentantes =
            Object.fromEntries(
              (perfisRepresentantes || [])
                .map(
                  (item) => [
                    item.id,
                    item.full_name ||
                      "Representante"
                  ]
                )
            );


          setRepresentantesPorId(
            mapaRepresentantes
          );

        }
        else {

          setRepresentantesPorId({});

        }

      }
      else {

        setRepresentantesPorId({
          [perfil.id]:
            perfil.full_name ||
            "Representante"
        });

      }

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
      ).length,

      recusado: orcamentos.filter(
        (item) => item.status === "recusado"
      ).length,

      cancelado: orcamentos.filter(
        (item) => item.status === "cancelado"
      ).length
    };

  }, [orcamentos]);


  const orcamentosFiltrados =
    useMemo(() => {

      const pesquisa =
        pesquisaOrcamentos
          .trim()
          .toLowerCase();


      return orcamentos.filter(
        (orcamento) => {

          const atendeStatus =
            filtroStatus === "todos" ||
            orcamento.status === filtroStatus;


          if (!atendeStatus) {
            return false;
          }


          if (!pesquisa) {
            return true;
          }


          const representante =
            representantesPorId[
              orcamento.created_by
            ] || "";


          const textoPesquisa = [
            orcamento.cliente_nome,
            orcamento.cliente_documento,
            orcamento.cliente_email,
            orcamento.cliente_telefone,
            orcamento.condicao_pagamento,
            orcamento.local_entrega,
            representante
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


          return textoPesquisa.includes(
            pesquisa
          );

        }
      );

    }, [
      orcamentos,
      pesquisaOrcamentos,
      filtroStatus,
      representantesPorId
    ]);


  function limparFiltrosOrcamentos() {

    setPesquisaOrcamentos("");
    setFiltroStatus("todos");

  }


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
      observacoes: "",
      frete: "0.00",
      condicao_pagamento: "",
      local_entrega: "",
      data_entrega: "",
      observacoes_venda: ""
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

    const frete =
      Number(formulario.frete || 0);


    if (
      !Number.isFinite(frete) ||
      frete < 0
    ) {

      setErroFormulario(
        "Informe um valor de frete válido."
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
            null,

          frete,

          condicao_pagamento:
            formulario.condicao_pagamento.trim() ||
            null,

          local_entrega:
            formulario.local_entrega.trim() ||
            null,

          data_entrega:
            formulario.data_entrega ||
            null,

          observacoes_venda:
            formulario.observacoes_venda.trim() ||
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
          frete,
          condicao_pagamento,
          local_entrega,
          data_entrega,
          observacoes_venda,
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
          preco_pedido,
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
  // EDITAR ORÇAMENTO
  // ========================================

  function abrirEdicaoOrcamento() {

    if (
      role !== "representante" ||
      !orcamentoSelecionado ||
      orcamentoSelecionado.status !== "rascunho"
    ) {
      return;
    }


    setErroEdicao("");


    setFormularioEdicao({
      cliente_nome:
        orcamentoSelecionado.cliente_nome || "",

      cliente_documento:
        orcamentoSelecionado.cliente_documento || "",

      cliente_email:
        orcamentoSelecionado.cliente_email || "",

      cliente_telefone:
        orcamentoSelecionado.cliente_telefone || "",

      observacoes:
        orcamentoSelecionado.observacoes || "",

      frete:
        String(
          Number(
            orcamentoSelecionado.frete || 0
          ).toFixed(2)
        ),

      condicao_pagamento:
        orcamentoSelecionado.condicao_pagamento || "",

      local_entrega:
        orcamentoSelecionado.local_entrega || "",

      data_entrega:
        orcamentoSelecionado.data_entrega || "",

      observacoes_venda:
        orcamentoSelecionado.observacoes_venda || ""
    });


    setModalEdicaoOpen(true);

  }


  function fecharEdicaoOrcamento() {

    if (salvandoEdicao) {
      return;
    }

    setModalEdicaoOpen(false);
    setErroEdicao("");

  }


  function alterarCampoEdicao(event) {

    const {
      name,
      value
    } = event.target;


    setFormularioEdicao(
      (anterior) => ({
        ...anterior,
        [name]: value
      })
    );

  }


  async function salvarEdicaoOrcamento(event) {

    event.preventDefault();


    if (
      role !== "representante" ||
      !orcamentoSelecionado ||
      orcamentoSelecionado.status !== "rascunho"
    ) {

      setErroEdicao(
        "Somente orçamentos em rascunho podem ser editados."
      );

      return;

    }


    const clienteNome =
      formularioEdicao.cliente_nome.trim();


    if (clienteNome.length < 2) {

      setErroEdicao(
        "Informe o nome do cliente."
      );

      return;

    }


    const frete =
      Number(
        formularioEdicao.frete || 0
      );


    if (
      !Number.isFinite(frete) ||
      frete < 0
    ) {

      setErroEdicao(
        "Informe um valor de frete válido."
      );

      return;

    }


    try {

      setSalvandoEdicao(true);
      setErroEdicao("");


      // Segurança:
      // atualizamos apenas campos comerciais permitidos.
      // A RLS do Supabase garante que o representante
      // somente edite o próprio orçamento em rascunho.
      const {
        data,
        error
      } = await supabase
        .from("orcamentos")
        .update({
          cliente_nome:
            clienteNome,

          cliente_documento:
            formularioEdicao.cliente_documento.trim() ||
            null,

          cliente_email:
            formularioEdicao.cliente_email.trim() ||
            null,

          cliente_telefone:
            formularioEdicao.cliente_telefone.trim() ||
            null,

          observacoes:
            formularioEdicao.observacoes.trim() ||
            null,

          frete,

          condicao_pagamento:
            formularioEdicao.condicao_pagamento.trim() ||
            null,

          local_entrega:
            formularioEdicao.local_entrega.trim() ||
            null,

          data_entrega:
            formularioEdicao.data_entrega ||
            null,

          observacoes_venda:
            formularioEdicao.observacoes_venda.trim() ||
            null
        })
        .eq(
          "id",
          orcamentoSelecionado.id
        )
        .select(`
          id,
          created_by,
          cliente_nome,
          cliente_documento,
          cliente_email,
          cliente_telefone,
          observacoes,
          frete,
          condicao_pagamento,
          local_entrega,
          data_entrega,
          observacoes_venda,
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
          "O orçamento não foi atualizado."
        );

      }


      setOrcamentos(
        (anteriores) =>
          anteriores.map(
            (orcamento) =>
              orcamento.id === data.id
                ? data
                : orcamento
          )
      );


      setOrcamentoSelecionado(data);

      setModalEdicaoOpen(false);


      mostrarAlertaSistema(
        "Orçamento atualizado",
        "As informações do orçamento foram salvas com sucesso."
      );

    }
    catch (error) {

      console.error(
        "Erro ao editar orçamento:",
        error
      );


      setErroEdicao(
        error?.message ||
        "Não foi possível salvar as alterações."
      );

    }
    finally {

      setSalvandoEdicao(false);

    }

  }


  // ========================================
  // HISTÓRICO / AUDITORIA
  // ========================================

  async function carregarHistoricoOrcamento(
    orcamentoId
  ) {

    if (!orcamentoId) {
      return;
    }


    try {

      setCarregandoHistorico(true);
      setErroHistorico("");


      const {
        data,
        error
      } = await supabase
        .from("orcamento_historico")
        .select(`
          id,
          orcamento_id,
          ator_id,
          ator_nome,
          ator_role,
          evento,
          status_anterior,
          status_novo,
          created_at
        `)
        .eq(
          "orcamento_id",
          orcamentoId
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


      if (error) {
        throw error;
      }


      setHistoricoOrcamento(
        data || []
      );

    }
    catch (error) {

      console.error(
        "Erro ao carregar histórico do orçamento:",
        error
      );


      setHistoricoOrcamento([]);

      setErroHistorico(
        error?.message ||
        "Não foi possível carregar o histórico deste orçamento."
      );

    }
    finally {

      setCarregandoHistorico(false);

    }

  }


  function dadosEventoHistorico(evento) {

    const eventos = {

      criado: {
        titulo: "Orçamento criado",
        descricao:
          "O orçamento foi criado como rascunho.",
        simbolo: "+"
      },

      enviado: {
        titulo: "Enviado para análise",
        descricao:
          "O orçamento foi enviado para análise do Comercial.",
        simbolo: "→"
      },

      aprovado: {
        titulo: "Aprovado pelo Comercial",
        descricao:
          "O orçamento foi aprovado pelo setor Comercial.",
        simbolo: "✓"
      },

      recusado: {
        titulo: "Recusado pelo Comercial",
        descricao:
          "O orçamento foi recusado pelo setor Comercial.",
        simbolo: "×"
      },

      cancelado: {
        titulo: "Orçamento cancelado",
        descricao:
          "O orçamento foi cancelado pelo representante.",
        simbolo: "!"
      }

    };


    return eventos[evento] || {
      titulo: "Atualização do orçamento",
      descricao:
        "Uma atualização foi registrada neste orçamento.",
      simbolo: "•"
    };

  }


  // ========================================
  // ABRIR ORÇAMENTO
  // ========================================

  async function abrirOrcamento(orcamento) {

    setOrcamentoSelecionado(orcamento);


    await Promise.all([

      carregarItensDoOrcamento(
        orcamento.id
      ),

      carregarHistoricoOrcamento(
        orcamento.id
      )

    ]);

  }


  async function abrirOrcamentoPorNotificacao(
    orcamentoId
  ) {

    if (!orcamentoId) {
      return;
    }

    try {

      setErro("");

      const existente =
        orcamentos.find(
          (orcamento) =>
            orcamento.id === orcamentoId
        );


      if (existente) {

        await abrirOrcamento(existente);

        return;

      }


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
          frete,
          condicao_pagamento,
          local_entrega,
          data_entrega,
          observacoes_venda,
          status,
          created_at,
          updated_at
        `)
        .eq("id", orcamentoId)
        .single();


      if (error) {
        throw error;
      }


      if (!data) {
        throw new Error(
          "Orçamento não encontrado."
        );
      }


      setOrcamentos(
        (anteriores) => {

          const jaExiste =
            anteriores.some(
              (orcamento) =>
                orcamento.id === data.id
            );

          if (jaExiste) {
            return anteriores;
          }

          return [
            data,
            ...anteriores
          ];

        }
      );


      await abrirOrcamento(data);

    }
    catch (error) {

      console.error(
        "Erro ao abrir orçamento da notificação:",
        error
      );

      mostrarAlertaSistema(
        "Não foi possível abrir o orçamento",
        error?.message ||
          "Tente novamente em alguns instantes.",
        "erro"
      );

    }

  }


  function fecharOrcamento() {

    if (
      modalProdutoOpen ||
      modalEdicaoOpen ||
      processandoItemId ||
      processandoOrcamento
    ) {
      return;
    }

    setOrcamentoSelecionado(null);
    setItensOrcamento([]);
    setErroItens("");
    setHistoricoOrcamento([]);
    setErroHistorico("");
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

      const orcamentoDecididoId =
        orcamentoSelecionado.id;


      atualizarStatusOrcamentoLocal(
        orcamentoDecididoId,
        decisao
      );

      setConfirmacaoFluxo(null);


      await carregarHistoricoOrcamento(
        orcamentoDecididoId
      );

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

    setPrecoEdicao(
      String(
        Number(
          item.preco_unitario || 0
        ).toFixed(2)
      )
    );

  }


  function cancelarEdicaoQuantidade() {

    if (processandoItemId) {
      return;
    }

    setItemEmEdicao(null);
    setQuantidadeEdicao(1);
    setPrecoEdicao("");
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

    const precoPedido =
      Number(
        item.preco_pedido ??
        item.preco_unitario ??
        0
      );

    const precoOrcado =
      numeroPreco(
        precoEdicao
      );

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

    if (
      !Number.isFinite(precoOrcado) ||
      precoOrcado < 0
    ) {

      setErroAcaoItem(
        "Informe um preço válido para o cliente."
      );

      return;

    }

    if (
      precoOrcado >
      precoPedido
    ) {

      setErroAcaoItem(
        "O preço orçado ao cliente não pode ser maior que o preço pedido."
      );

      return;

    }

    try {

      setProcessandoItemId(item.id);
      setErroAcaoItem("");

      const {
        error
      } = await supabase.rpc(
        "atualizar_item_orcamento",
        {
          p_item_id: item.id,
          p_quantidade: quantidade,
          p_preco_unitario:
            precoOrcado
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
      setPrecoEdicao("");

    }
    catch (error) {

      console.error(
        "Erro ao atualizar item:",
        error
      );

      setErroAcaoItem(
        error?.message ||
        "Não foi possível atualizar o item."
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
    setModoPesquisaProduto("geral");
    setFiltroMacaneta("");
    setFiltroRoseta("");
    setFiltroFuncao("");
    setFiltroAcabamento("");
    setFiltroMaquina("");
    setProdutoSelecionado(null);
    setQuantidadeProduto(1);
    setPrecoClienteProduto("");
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
    setPrecoClienteProduto("");
    setErroProdutos("");

  }


  function selecionarProdutoParaOrcamento(produto) {

    setProdutoSelecionado(
      produto
    );

    setQuantidadeProduto(1);

    setPrecoClienteProduto(
      String(
        Number(
          produto?.preco || 0
        ).toFixed(2)
      )
    );

    setErroProdutos("");

  }


  function normalizarTextoProduto(valor = "") {

    return String(valor)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  }


  function ehProdutoMecanico(produto) {

    const categoria =
      normalizarTextoProduto(
        produto?.categoria
      );


    return (
      categoria.includes(
        "macanetas inox 304"
      ) ||
      categoria.includes(
        "fechaduras zamak"
      )
    );

  }


  function extrairRosetaProduto(produto) {

    const codigo =
      String(
        produto?.codigo || ""
      )
        .toUpperCase()
        .trim();


    // Nas referências mecânicas Synter,
    // os dois dígitos imediatamente antes da
    // identificação de função representam a roseta.
    //
    // Exemplos:
    // X73113IEZ1IP/55 -> Roseta 13
    // X72401IIIP/55  -> Roseta 01
    // X11006IBCR/40  -> Roseta 06
    const encontrado =
      codigo.match(
        /(\d{2})(?=I(?:EZ1|I|B))/
      );


    if (!encontrado) {
      return "";
    }


    return `Roseta ${encontrado[1]}`;

  }


  function extrairFuncaoProduto(produto) {

    const texto = normalizarTextoProduto(
      [
        produto?.variacao,
        produto?.tipo_preco,
        produto?.descricao
      ]
        .filter(Boolean)
        .join(" ")
    );


    if (
      texto.includes("banheiro")
    ) {
      return "Banheiro";
    }


    if (
      texto.includes("interna")
    ) {
      return "Interna";
    }


    if (
      texto.includes("externa")
    ) {
      return "Externa";
    }


    const codigo =
      String(
        produto?.codigo || ""
      ).toUpperCase();


    if (
      codigo.includes("IEZ1")
    ) {
      return "Externa";
    }


    if (
      /II(?:IP|IE|PT|CR)/.test(codigo)
    ) {
      return "Interna";
    }


    if (
      /IB(?:IP|IE|PT|CR)/.test(codigo)
    ) {
      return "Banheiro";
    }


    return "";

  }


  function extrairAcabamentoProduto(produto) {

    const texto = normalizarTextoProduto(
      [
        produto?.nome,
        produto?.variacao,
        produto?.descricao
      ]
        .filter(Boolean)
        .join(" ")
    );


    if (
      texto.includes("escovado")
    ) {
      return "Escovado";
    }


    if (
      texto.includes("polido")
    ) {
      return "Polido";
    }


    if (
      texto.includes("preto")
    ) {
      return "Preto";
    }


    if (
      texto.includes("cromado")
    ) {
      return "Cromado";
    }


    const codigo =
      String(
        produto?.codigo || ""
      ).toUpperCase();


    if (
      /PT\/(?:\d|[A-Z])/.test(codigo)
    ) {
      return "Preto";
    }


    if (
      /IP\/(?:\d|[A-Z])/.test(codigo)
    ) {
      return "Polido";
    }


    if (
      /IE\/(?:\d|[A-Z])/.test(codigo)
    ) {
      return "Escovado";
    }


    if (
      /CR\/(?:\d|[A-Z])/.test(codigo)
    ) {
      return "Cromado";
    }


    return "";

  }


  function extrairMaquinaProduto(produto) {

    const codigo =
      String(
        produto?.codigo || ""
      )
        .toUpperCase()
        .trim();


    const encontrado =
      codigo.match(
        /\/(\d{2})(?:[RQ])?$/
      );


    if (!encontrado) {
      return "";
    }


    return `${encontrado[1]} mm`;

  }


  function obterMacanetaProduto(produto) {

    return String(
      produto?.nome || ""
    ).trim();

  }


  function ordenarOpcoes(valores) {

    return [
      ...new Set(
        valores.filter(Boolean)
      )
    ].sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          "pt-BR",
          {
            numeric: true,
            sensitivity: "base"
          }
        )
    );

  }


  const produtosMecanicos = useMemo(() => {

    return produtosCatalogo
      .filter(ehProdutoMecanico)
      .map(
        (produto) => ({
          ...produto,

          _funil: {
            macaneta:
              obterMacanetaProduto(
                produto
              ),

            roseta:
              extrairRosetaProduto(
                produto
              ),

            funcao:
              extrairFuncaoProduto(
                produto
              ),

            acabamento:
              extrairAcabamentoProduto(
                produto
              ),

            maquina:
              extrairMaquinaProduto(
                produto
              )
          }
        })
      )
      .filter(
        (produto) =>
          produto._funil.macaneta &&
          produto._funil.roseta &&
          produto._funil.funcao &&
          produto._funil.acabamento &&
          produto._funil.maquina
      );

  }, [produtosCatalogo]);


  const opcoesMacaneta = useMemo(() => {

    return ordenarOpcoes(
      produtosMecanicos.map(
        (produto) =>
          produto._funil.macaneta
      )
    );

  }, [produtosMecanicos]);


  const opcoesRoseta = useMemo(() => {

    return ordenarOpcoes(
      produtosMecanicos
        .filter(
          (produto) =>
            !filtroMacaneta ||
            produto._funil.macaneta ===
              filtroMacaneta
        )
        .map(
          (produto) =>
            produto._funil.roseta
        )
    );

  }, [
    produtosMecanicos,
    filtroMacaneta
  ]);


  const opcoesFuncao = useMemo(() => {

    return ordenarOpcoes(
      produtosMecanicos
        .filter(
          (produto) =>
            (!filtroMacaneta ||
              produto._funil.macaneta ===
                filtroMacaneta) &&
            (!filtroRoseta ||
              produto._funil.roseta ===
                filtroRoseta)
        )
        .map(
          (produto) =>
            produto._funil.funcao
        )
    );

  }, [
    produtosMecanicos,
    filtroMacaneta,
    filtroRoseta
  ]);


  const opcoesAcabamento = useMemo(() => {

    return ordenarOpcoes(
      produtosMecanicos
        .filter(
          (produto) =>
            (!filtroMacaneta ||
              produto._funil.macaneta ===
                filtroMacaneta) &&
            (!filtroRoseta ||
              produto._funil.roseta ===
                filtroRoseta) &&
            (!filtroFuncao ||
              produto._funil.funcao ===
                filtroFuncao)
        )
        .map(
          (produto) =>
            produto._funil.acabamento
        )
    );

  }, [
    produtosMecanicos,
    filtroMacaneta,
    filtroRoseta,
    filtroFuncao
  ]);


  const opcoesMaquina = useMemo(() => {

    return ordenarOpcoes(
      produtosMecanicos
        .filter(
          (produto) =>
            (!filtroMacaneta ||
              produto._funil.macaneta ===
                filtroMacaneta) &&
            (!filtroRoseta ||
              produto._funil.roseta ===
                filtroRoseta) &&
            (!filtroFuncao ||
              produto._funil.funcao ===
                filtroFuncao) &&
            (!filtroAcabamento ||
              produto._funil.acabamento ===
                filtroAcabamento)
        )
        .map(
          (produto) =>
            produto._funil.maquina
        )
    );

  }, [
    produtosMecanicos,
    filtroMacaneta,
    filtroRoseta,
    filtroFuncao,
    filtroAcabamento
  ]);


  const etapasFunilPreenchidas = [
    filtroMacaneta,
    filtroRoseta,
    filtroFuncao,
    filtroAcabamento,
    filtroMaquina
  ].filter(Boolean).length;


  function limparFunilMecanico() {

    setFiltroMacaneta("");
    setFiltroRoseta("");
    setFiltroFuncao("");
    setFiltroAcabamento("");
    setFiltroMaquina("");
    setProdutoSelecionado(null);

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

    if (
      modoPesquisaProduto === "mecanica"
    ) {

      // Evita despejar centenas de itens antes
      // de o representante iniciar o funil.
      if (!filtroMacaneta) {
        return [];
      }


      return produtosMecanicos.filter(
        (produto) => {

          return (
            (!filtroMacaneta ||
              produto._funil.macaneta ===
                filtroMacaneta) &&

            (!filtroRoseta ||
              produto._funil.roseta ===
                filtroRoseta) &&

            (!filtroFuncao ||
              produto._funil.funcao ===
                filtroFuncao) &&

            (!filtroAcabamento ||
              produto._funil.acabamento ===
                filtroAcabamento) &&

            (!filtroMaquina ||
              produto._funil.maquina ===
                filtroMaquina)
          );

        }
      );

    }


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
    categoriaProduto,
    modoPesquisaProduto,
    produtosMecanicos,
    filtroMacaneta,
    filtroRoseta,
    filtroFuncao,
    filtroAcabamento,
    filtroMaquina
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

    const precoPedido =
      Number(
        produtoSelecionado.preco || 0
      );

    const precoOrcado =
      numeroPreco(
        precoClienteProduto
      );

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

    if (
      !Number.isFinite(precoOrcado) ||
      precoOrcado < 0
    ) {

      setErroProdutos(
        "Informe um preço válido para o cliente."
      );

      return;

    }

    if (
      precoOrcado >
      precoPedido
    ) {

      setErroProdutos(
        "O preço orçado ao cliente não pode ser maior que o preço pedido."
      );

      return;

    }

    try {

      setAdicionandoProduto(true);
      setErroProdutos("");

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


      const {
        data: itemAdicionado,
        error: itemAdicionadoError
      } = await supabase
        .from("orcamento_itens")
        .select(`
          id,
          produto_id,
          preco_pedido,
          preco_unitario,
          quantidade,
          created_at
        `)
        .eq(
          "orcamento_id",
          orcamentoSelecionado.id
        )
        .eq(
          "produto_id",
          produtoSelecionado.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(1)
        .single();


      if (itemAdicionadoError) {
        throw itemAdicionadoError;
      }


      if (!itemAdicionado) {

        throw new Error(
          "O produto foi incluído, mas não foi possível localizar o item para aplicar o preço orçado."
        );

      }


      const {
        error: precoError
      } = await supabase.rpc(
        "atualizar_preco_item_orcamento",
        {
          p_item_id:
            itemAdicionado.id,

          p_preco_unitario:
            precoOrcado
        }
      );


      if (precoError) {
        throw precoError;
      }


      await carregarItensDoOrcamento(
        orcamentoSelecionado.id
      );

      setModalProdutoOpen(false);
      setProdutoSelecionado(null);
      setQuantidadeProduto(1);
      setPrecoClienteProduto("");
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

  function numeroPreco(valor) {

    const texto =
      String(
        valor ?? ""
      )
        .trim()
        .replace(",", ".");

    return Number(texto);

  }


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


  function numeroCurtoOrcamento(orcamento) {

    const id =
      String(
        orcamento?.id || ""
      )
        .split("-")[0]
        .toUpperCase();


    return id || "ORCAMENTO";

  }


  function textoCompartilhamentoOrcamento(
    orcamento
  ) {

    const numero =
      numeroCurtoOrcamento(
        orcamento
      );


    const linhas = [
      `Olá, ${orcamento.cliente_nome || "cliente"}!`,
      "",
      `Segue o orçamento Synter ${numero}.`,
      "",
      orcamento.condicao_pagamento
        ? `Condição de pagamento: ${orcamento.condicao_pagamento}`
        : null,
      orcamento.local_entrega
        ? `Local de entrega: ${orcamento.local_entrega}`
        : null,
      orcamento.data_entrega
        ? `Data de entrega: ${new Intl.DateTimeFormat(
            "pt-BR",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: "UTC"
            }
          ).format(
            new Date(
              `${orcamento.data_entrega}T00:00:00Z`
            )
          )}`
        : null,
      Number(orcamento.frete || 0) > 0
        ? `Frete: ${formatarMoeda(orcamento.frete)}`
        : null,
      "",
      "Qualquer dúvida, estou à disposição."
    ];


    return linhas
      .filter(
        (linha) =>
          linha !== null &&
          linha !== undefined
      )
      .join("\n");

  }


  function telefoneParaWhatsapp(
    telefone
  ) {

    let numero =
      String(
        telefone || ""
      )
        .replace(/\D/g, "");


    if (!numero) {
      return "";
    }


    // Telefones brasileiros informados com DDD,
    // mas sem o código do país, recebem 55.
    if (
      numero.length === 10 ||
      numero.length === 11
    ) {
      numero = `55${numero}`;
    }


    return numero;

  }


  function enviarOrcamentoWhatsapp(
    event,
    orcamento
  ) {

    event.stopPropagation();


    if (role !== "representante") {
      return;
    }


    const telefone =
      telefoneParaWhatsapp(
        orcamento.cliente_telefone
      );


    if (!telefone) {

      mostrarAlertaSistema(
        "Telefone não informado",
        "Cadastre o telefone do cliente para enviar o orçamento pelo WhatsApp.",
        "erro"
      );

      return;

    }


    const mensagem =
      textoCompartilhamentoOrcamento(
        orcamento
      );


    const url =
      `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;


    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  }


  function enviarOrcamentoEmail(
    event,
    orcamento
  ) {

    event.stopPropagation();


    if (role !== "representante") {
      return;
    }


    const email =
      String(
        orcamento.cliente_email || ""
      ).trim();


    if (!email) {

      mostrarAlertaSistema(
        "E-mail não informado",
        "Cadastre o e-mail do cliente para enviar o orçamento.",
        "erro"
      );

      return;

    }


    const numero =
      numeroCurtoOrcamento(
        orcamento
      );


    const assunto =
      `Orçamento Synter ${numero}`;


    const corpo =
      `${textoCompartilhamentoOrcamento(orcamento)}

Segue o orçamento para sua análise.

Atenciosamente,
Synter`;


    window.location.href =
      `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

  }


  async function baixarPdfDoCard(
    event,
    orcamento
  ) {

    event.stopPropagation();


    if (
      role !== "representante" ||
      !orcamento?.id ||
      baixandoPdfCardId
    ) {
      return;
    }


    try {

      setBaixandoPdfCardId(
        orcamento.id
      );


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
          preco_pedido,
          preco_unitario,
          quantidade,
          subtotal,
          created_at,
          updated_at
        `)
        .eq(
          "orcamento_id",
          orcamento.id
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        );


      if (error) {
        throw error;
      }


      const itens =
        data || [];


      if (
        itens.length === 0
      ) {

        throw new Error(
          "Adicione pelo menos um produto antes de gerar o PDF."
        );

      }


      gerarOrcamentoPdf({
        orcamento,
        itens
      });

    }
    catch (error) {

      console.error(
        "Erro ao gerar PDF pelo card:",
        error
      );


      mostrarAlertaSistema(
        "Não foi possível gerar o PDF",
        error?.message ||
          "Tente novamente em alguns instantes.",
        "erro"
      );

    }
    finally {

      setBaixandoPdfCardId(
        null
      );

    }

  }


  function baixarOrcamentoPdf() {

    if (
      !orcamentoSelecionado ||
      itensOrcamento.length === 0
    ) {
      return;
    }


    try {

      gerarOrcamentoPdf({
        orcamento:
          orcamentoSelecionado,

        itens:
          itensOrcamento
      });

    }
    catch (error) {

      console.error(
        "Erro ao gerar PDF do orçamento:",
        error
      );


      mostrarAlertaSistema(
        "Não foi possível gerar o PDF",
        error?.message ||
          "Tente novamente em alguns instantes.",
        "erro"
      );

    }

  }


  const totalOrcamento = useMemo(() => {

    return itensOrcamento.reduce(
      (total, item) =>
        total + Number(item.subtotal || 0),
      0
    );

  }, [itensOrcamento]);


  const totalPrecoPedido =
    useMemo(() => {

      return itensOrcamento.reduce(
        (total, item) => {

          const precoPedido =
            Number(
              item.preco_pedido ??
              item.preco_unitario ??
              0
            );

          const quantidade =
            Number(
              item.quantidade || 0
            );

          return total +
            (
              precoPedido *
              quantidade
            );

        },
        0
      );

    }, [itensOrcamento]);


  const totalDescontoOrcamento =
    Math.max(
      0,
      totalPrecoPedido -
        totalOrcamento
    );


  const freteOrcamento =
    Number(
      orcamentoSelecionado?.frete ||
      0
    );


  const totalGeralOrcamento =
    totalOrcamento +
    freteOrcamento;


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

          <NotificationsButton
            onOpenOrcamento={
              abrirOrcamentoPorNotificacao
            }
          />

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


          <div className="orcamentos-summary-card">

            <span>
              Recusados
            </span>

            <strong>
              {resumo.recusado}
            </strong>

            <p>
              Não aprovados
            </p>

          </div>


          {role === "comercial" && (

            <div className="orcamentos-summary-card">

              <span>
                Cancelados
              </span>

              <strong>
                {resumo.cancelado}
              </strong>

              <p>
                Histórico cancelado
              </p>

            </div>

          )}

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
        {/* FILTROS / PESQUISA                */}
        {/* ================================= */}

        {orcamentos.length > 0 && (

          <section className="orcamentos-list-controls">

            <div className="orcamentos-list-search">

              <span aria-hidden="true">
                ⌕
              </span>

              <input
                type="text"
                value={pesquisaOrcamentos}
                onChange={
                  (event) =>
                    setPesquisaOrcamentos(
                      event.target.value
                    )
                }
                placeholder={
                  role === "comercial"
                    ? "Pesquisar cliente, documento, contato ou representante..."
                    : "Pesquisar cliente, documento ou contato..."
                }
              />


              {pesquisaOrcamentos && (

                <button
                  type="button"
                  onClick={() =>
                    setPesquisaOrcamentos("")
                  }
                  aria-label="Limpar pesquisa"
                >
                  ×
                </button>

              )}

            </div>


            <div className="orcamentos-status-filters">

              {[
                ["todos", "Todos"],
                ["rascunho", "Rascunhos"],
                ["enviado", "Aguardando análise"],
                ["aprovado", "Aprovados"],
                ["recusado", "Recusados"],
                ...(role === "comercial"
                  ? [["cancelado", "Cancelados"]]
                  : [])
              ].map(
                ([valor, titulo]) => (

                  <button
                    key={valor}
                    type="button"
                    className={
                      filtroStatus === valor
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setFiltroStatus(valor)
                    }
                  >
                    {titulo}
                  </button>

                )
              )}

            </div>

          </section>

        )}


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


        {orcamentos.length > 0 &&
          orcamentosFiltrados.length === 0 && (

          <section className="orcamentos-filter-empty">

            <strong>
              Nenhum orçamento encontrado
            </strong>

            <p>
              Não encontramos resultados com os filtros atuais.
            </p>

            <button
              type="button"
              onClick={limparFiltrosOrcamentos}
            >
              Limpar filtros
            </button>

          </section>

        )}


        {/* ================================= */}
        {/* TABELA                           */}
        {/* ================================= */}

        {orcamentosFiltrados.length > 0 && (

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

                    {role === "comercial" && (

                      <th>
                        Representante
                      </th>

                    )}

                    <th>
                      Status
                    </th>

                    <th>
                      Criado em
                    </th>

                    {role === "representante" && (

                      <th className="orcamentos-acoes-header">
                        Ações
                      </th>

                    )}

                  </tr>

                </thead>


                <tbody>

                  {orcamentosFiltrados.map(
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


                        {role === "comercial" && (

                          <td>

                            <div className="orcamentos-representante-cell">

                              <span>
                                {representantesPorId[
                                  orcamento.created_by
                                ]
                                  ?.charAt(0)
                                  ?.toUpperCase() || "R"}
                              </span>

                              <strong>
                                {representantesPorId[
                                  orcamento.created_by
                                ] || "Representante"}
                              </strong>

                            </div>

                          </td>

                        )}


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


                        {role === "representante" && (

                          <td
                            className="orcamentos-card-acoes-cell"
                            onClick={
                              (event) =>
                                event.stopPropagation()
                            }
                            onKeyDown={
                              (event) =>
                                event.stopPropagation()
                            }
                          >

                            <div className="orcamentos-card-acoes">

                              <button
                                type="button"
                                className="orcamentos-card-acao pdf"
                                onClick={
                                  (event) =>
                                    baixarPdfDoCard(
                                      event,
                                      orcamento
                                    )
                                }
                                disabled={
                                  baixandoPdfCardId ===
                                  orcamento.id
                                }
                                title="Baixar orçamento em PDF"
                                aria-label="Baixar orçamento em PDF"
                              >
                                <span>
                                  PDF
                                </span>
                              </button>


                              <button
                                type="button"
                                className="orcamentos-card-acao whatsapp"
                                onClick={
                                  (event) =>
                                    enviarOrcamentoWhatsapp(
                                      event,
                                      orcamento
                                    )
                                }
                                title={
                                  orcamento.cliente_telefone
                                    ? "Enviar pelo WhatsApp"
                                    : "Cliente sem telefone"
                                }
                                aria-label="Enviar orçamento pelo WhatsApp"
                              >
                                <span aria-hidden="true">
                                  W
                                </span>
                              </button>


                              <button
                                type="button"
                                className="orcamentos-card-acao email"
                                onClick={
                                  (event) =>
                                    enviarOrcamentoEmail(
                                      event,
                                      orcamento
                                    )
                                }
                                title={
                                  orcamento.cliente_email
                                    ? "Enviar por e-mail"
                                    : "Cliente sem e-mail"
                                }
                                aria-label="Enviar orçamento por e-mail"
                              >
                                <span aria-hidden="true">
                                  @
                                </span>
                              </button>

                            </div>

                          </td>

                        )}

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
                  Observações gerais
                </label>

                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formulario.observacoes}
                  onChange={alterarCampo}
                  placeholder="Informações gerais do orçamento..."
                  rows={3}
                  maxLength={2000}
                  disabled={salvando}
                />

              </div>


              <div className="orcamentos-form-separator orcamentos-form-full">

                <span>
                  DADOS DA VENDA E ENTREGA
                </span>

                <p>
                  Informe as condições comerciais deste orçamento.
                </p>

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="frete">
                  Frete (R$)
                </label>

                <input
                  id="frete"
                  name="frete"
                  type="number"
                  min="0"
                  max="9999999999.99"
                  step="0.01"
                  value={formulario.frete}
                  onChange={alterarCampo}
                  placeholder="0,00"
                  disabled={salvando}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="condicao_pagamento">
                  Condição de Pagamento
                </label>

                <input
                  id="condicao_pagamento"
                  name="condicao_pagamento"
                  type="text"
                  value={formulario.condicao_pagamento}
                  onChange={alterarCampo}
                  placeholder="Ex.: 30/60/90 dias"
                  maxLength={200}
                  disabled={salvando}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="local_entrega">
                  Local de Entrega
                </label>

                <input
                  id="local_entrega"
                  name="local_entrega"
                  type="text"
                  value={formulario.local_entrega}
                  onChange={alterarCampo}
                  placeholder="Endereço ou local de entrega"
                  maxLength={300}
                  disabled={salvando}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="data_entrega">
                  Data de Entrega
                </label>

                <input
                  id="data_entrega"
                  name="data_entrega"
                  type="date"
                  value={formulario.data_entrega}
                  onChange={alterarCampo}
                  disabled={salvando}
                />

              </div>


              <div className="orcamentos-form-group orcamentos-form-full">

                <label htmlFor="observacoes_venda">
                  Observações Adicionais sobre a Venda
                </label>

                <textarea
                  id="observacoes_venda"
                  name="observacoes_venda"
                  value={formulario.observacoes_venda}
                  onChange={alterarCampo}
                  placeholder="Ex.: prazo especial, instruções comerciais, detalhes da negociação..."
                  rows={4}
                  maxLength={2000}
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


              <div className="orcamentos-modal-header-actions">

                <button
                  type="button"
                  className="orcamentos-pdf-button"
                  onClick={baixarOrcamentoPdf}
                  disabled={
                    carregandoItens ||
                    itensOrcamento.length === 0
                  }
                  title={
                    itensOrcamento.length === 0
                      ? "Adicione pelo menos um produto antes de gerar o PDF."
                      : "Gerar orçamento em PDF"
                  }
                >
                  <span aria-hidden="true">
                    ↓
                  </span>

                  Gerar orçamento
                </button>


                {role === "representante" &&
                  orcamentoSelecionado.status === "rascunho" && (

                    <button
                      type="button"
                      className="orcamentos-edit-button"
                      onClick={abrirEdicaoOrcamento}
                    >
                      Editar orçamento
                    </button>

                  )}


                <button
                  type="button"
                  className="orcamentos-modal-close"
                  onClick={fecharOrcamento}
                  aria-label="Fechar"
                >
                  ×
                </button>

              </div>

            </div>


            <div className="orcamentos-detalhes-body">

              <div className="orcamentos-detalhes-info">

                {role === "comercial" && (

                  <div>

                    <span>
                      REPRESENTANTE
                    </span>

                    <strong>
                      {representantesPorId[
                        orcamentoSelecionado.created_by
                      ] || "Representante"}
                    </strong>

                  </div>

                )}


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
                    OBSERVAÇÕES GERAIS
                  </span>

                  <p>
                    {orcamentoSelecionado.observacoes}
                  </p>

                </div>

              )}


              <div className="orcamentos-venda-section">

                <div className="orcamentos-venda-title">

                  <span>
                    DADOS DA VENDA E ENTREGA
                  </span>

                  <p>
                    Condições comerciais informadas para este orçamento.
                  </p>

                </div>


                <div className="orcamentos-venda-grid">

                  <div>

                    <span>
                      FRETE
                    </span>

                    <strong>
                      {formatarMoeda(
                        orcamentoSelecionado.frete
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      CONDIÇÃO DE PAGAMENTO
                    </span>

                    <strong>
                      {orcamentoSelecionado.condicao_pagamento || "-"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      LOCAL DE ENTREGA
                    </span>

                    <strong>
                      {orcamentoSelecionado.local_entrega || "-"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      DATA DE ENTREGA
                    </span>

                    <strong>
                      {orcamentoSelecionado.data_entrega
                        ? new Intl.DateTimeFormat(
                            "pt-BR",
                            {
                              timeZone: "UTC"
                            }
                          ).format(
                            new Date(
                              `${orcamentoSelecionado.data_entrega}T00:00:00Z`
                            )
                          )
                        : "-"}
                    </strong>

                  </div>

                </div>


                {orcamentoSelecionado.observacoes_venda && (

                  <div className="orcamentos-venda-observacoes">

                    <span>
                      OBSERVAÇÕES ADICIONAIS SOBRE A VENDA
                    </span>

                    <p>
                      {orcamentoSelecionado.observacoes_venda}
                    </p>

                  </div>

                )}

              </div>


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
                        (item) => {

                          const precoPedidoItem =
                            Number(
                              item.preco_pedido ??
                              item.preco_unitario ??
                              0
                            );

                          const precoOrcadoItem =
                            Number(
                              item.preco_unitario || 0
                            );

                          const descontoItem =
                            Math.max(
                              0,
                              precoPedidoItem -
                                precoOrcadoItem
                            );

                          const percentualDescontoItem =
                            precoPedidoItem > 0
                              ? (
                                  descontoItem /
                                  precoPedidoItem
                                ) * 100
                              : 0;


                          return (

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


                            <div className="orcamentos-item-precos">

                              <div className="orcamentos-item-preco-pedido">

                                <span>
                                  PREÇO PEDIDO
                                </span>

                                <strong>
                                  {formatarMoeda(
                                    precoPedidoItem
                                  )}
                                </strong>

                              </div>


                              <div className="orcamentos-item-preco-unitario">

                                <span>
                                  PREÇO ORÇADO
                                </span>

                                <strong>
                                  {formatarMoeda(
                                    precoOrcadoItem
                                  )}
                                </strong>

                              </div>


                              {descontoItem > 0 && (

                                <div className="orcamentos-item-desconto">

                                  <span>
                                    DESCONTO
                                  </span>

                                  <strong>
                                    - {formatarMoeda(
                                      descontoItem
                                    )}
                                  </strong>

                                  <small>
                                    {percentualDescontoItem.toFixed(1)}%
                                  </small>

                                </div>

                              )}

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

                              <small>
                                subtotal
                              </small>

                            </div>


                            {role === "representante" &&
                              orcamentoSelecionado.status === "rascunho" && (

                                <div className="orcamentos-item-acoes">

                                  {itemEmEdicao === item.id ? (

                                    <div className="orcamentos-item-edicao">

                                      <div className="orcamentos-item-edicao-campos">

                                        <label
                                          htmlFor={`qtd-${item.id}`}
                                        >
                                          <span>Quantidade</span>

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

                                        </label>


                                        <label
                                          htmlFor={`preco-${item.id}`}
                                        >
                                          <span>Preço orçado</span>

                                          <input
                                            id={`preco-${item.id}`}
                                            type="number"
                                            min="0"
                                            max={precoPedidoItem}
                                            step="0.01"
                                            value={precoEdicao}
                                            onChange={
                                              (event) =>
                                                setPrecoEdicao(
                                                  event.target.value
                                                )
                                            }
                                            disabled={
                                              processandoItemId === item.id
                                            }
                                          />

                                        </label>

                                      </div>


                                      <div className="orcamentos-item-edicao-referencia">

                                        <span>Preço pedido</span>

                                        <strong>
                                          {formatarMoeda(
                                            precoPedidoItem
                                          )}
                                        </strong>

                                        {Number.isFinite(
                                          numeroPreco(precoEdicao)
                                        ) &&
                                        numeroPreco(precoEdicao) >= 0 &&
                                        numeroPreco(precoEdicao) <=
                                          precoPedidoItem && (

                                          <small>
                                            Desconto:{" "}
                                            {formatarMoeda(
                                              Math.max(
                                                0,
                                                precoPedidoItem -
                                                  numeroPreco(
                                                    precoEdicao
                                                  )
                                              )
                                            )}
                                          </small>

                                        )}

                                      </div>


                                      <div className="orcamentos-item-edicao-linha">

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
                                            : "Salvar alterações"}
                                        </button>

                                        <button
                                          type="button"
                                          className="orcamentos-item-btn"
                                          onClick={cancelarEdicaoQuantidade}
                                          disabled={
                                            processandoItemId === item.id
                                          }
                                        >
                                          Cancelar edição
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
                                        Alterar item
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
                                            ? "Confirmar retirada"
                                            : "Retirar item"}
                                      </button>

                                    </>

                                  )}

                                </div>

                              )}

                          </div>

                          );

                        }
                      )}

                    </div>


                    <div className="orcamentos-resumo-valores">

                      <div>

                        <span>
                          PREÇO PEDIDO
                        </span>

                        <strong>
                          {formatarMoeda(
                            totalPrecoPedido
                          )}
                        </strong>

                      </div>


                      {totalDescontoOrcamento > 0 && (

                        <div className="orcamentos-resumo-desconto">

                          <span>
                            DESCONTO APLICADO
                          </span>

                          <strong>
                            - {formatarMoeda(
                              totalDescontoOrcamento
                            )}
                          </strong>

                        </div>

                      )}


                      <div>

                        <span>
                          SUBTOTAL COM DESCONTO
                        </span>

                        <strong>
                          {formatarMoeda(
                            totalOrcamento
                          )}
                        </strong>

                      </div>


                      <div>

                        <span>
                          FRETE
                        </span>

                        <strong>
                          {formatarMoeda(
                            freteOrcamento
                          )}
                        </strong>

                      </div>


                      <div className="orcamentos-total">

                        <span>
                          TOTAL DO ORÇAMENTO
                        </span>

                        <strong>
                          {formatarMoeda(
                            totalGeralOrcamento
                          )}
                        </strong>

                      </div>

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


              {/* ================================= */}
              {/* HISTÓRICO / AUDITORIA             */}
              {/* ================================= */}

              <div className="orcamentos-historico">

                <div className="orcamentos-historico-header">

                  <div>

                    <span>
                      HISTÓRICO DO ORÇAMENTO
                    </span>

                    <p>
                      Registro das principais ações realizadas neste orçamento.
                    </p>

                  </div>


                  {!carregandoHistorico && (
                    <small>
                      {historicoOrcamento.length}{" "}
                      {historicoOrcamento.length === 1
                        ? "registro"
                        : "registros"}
                    </small>
                  )}

                </div>


                {carregandoHistorico && (

                  <div className="orcamentos-historico-state">

                    <div className="orcamentos-historico-loader"></div>

                    <span>
                      Carregando histórico...
                    </span>

                  </div>

                )}


                {!carregandoHistorico &&
                  erroHistorico && (

                    <div className="orcamentos-historico-error">

                      <strong>
                        Não foi possível carregar o histórico
                      </strong>

                      <p>
                        {erroHistorico}
                      </p>

                    </div>

                  )}


                {!carregandoHistorico &&
                  !erroHistorico &&
                  historicoOrcamento.length === 0 && (

                    <div className="orcamentos-historico-empty">

                      Nenhuma movimentação registrada ainda.

                    </div>

                  )}


                {!carregandoHistorico &&
                  !erroHistorico &&
                  historicoOrcamento.length > 0 && (

                    <div className="orcamentos-historico-timeline">

                      {historicoOrcamento.map(
                        (registro) => {

                          const dadosEvento =
                            dadosEventoHistorico(
                              registro.evento
                            );


                          return (

                            <div
                              key={registro.id}
                              className={
                                `orcamentos-historico-item evento-${registro.evento}`
                              }
                            >

                              <div className="orcamentos-historico-marker">

                                <span>
                                  {dadosEvento.simbolo}
                                </span>

                              </div>


                              <div className="orcamentos-historico-conteudo">

                                <div className="orcamentos-historico-topo">

                                  <strong>
                                    {dadosEvento.titulo}
                                  </strong>

                                  <time>
                                    {formatarData(
                                      registro.created_at
                                    )}
                                  </time>

                                </div>


                                <p>
                                  {dadosEvento.descricao}
                                </p>


                                <div className="orcamentos-historico-autor">

                                  <span>
                                    Realizado por
                                  </span>

                                  <strong>
                                    {registro.ator_nome || "Sistema"}
                                  </strong>

                                  {registro.ator_role && (

                                    <small>
                                      {registro.ator_role === "comercial"
                                        ? "Comercial"
                                        : registro.ator_role === "representante"
                                          ? "Representante"
                                          : "Sistema"}
                                    </small>

                                  )}

                                </div>


                                {registro.status_anterior &&
                                  registro.status_novo && (

                                    <div className="orcamentos-historico-status-change">

                                      <span>
                                        {formatarStatus(
                                          registro.status_anterior
                                        )}
                                      </span>

                                      <b>
                                        →
                                      </b>

                                      <span>
                                        {formatarStatus(
                                          registro.status_novo
                                        )}
                                      </span>

                                    </div>

                                  )}

                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>

                  )}

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* MODAL EDITAR ORÇAMENTO             */}
      {/* ================================= */}

      {modalEdicaoOpen &&
        orcamentoSelecionado && (

        <div
          className="orcamentos-modal-overlay orcamentos-modal-overlay-edicao"
          onMouseDown={fecharEdicaoOrcamento}
        >

          <div
            className="orcamentos-modal orcamentos-modal-edicao"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-editar-orcamento"
            onMouseDown={
              (event) =>
                event.stopPropagation()
            }
          >

            <div className="orcamentos-modal-header">

              <div>

                <span>
                  RASCUNHO
                </span>

                <h2 id="titulo-editar-orcamento">
                  Editar orçamento
                </h2>

                <p>
                  Atualize os dados do cliente, venda e entrega antes do envio para análise.
                </p>

              </div>


              <button
                type="button"
                className="orcamentos-modal-close"
                onClick={fecharEdicaoOrcamento}
                disabled={salvandoEdicao}
                aria-label="Fechar"
              >
                ×
              </button>

            </div>


            <form
              className="orcamentos-form"
              onSubmit={salvarEdicaoOrcamento}
            >

              <div className="orcamentos-form-group orcamentos-form-full">

                <label htmlFor="edit_cliente_nome">
                  Nome do cliente *
                </label>

                <input
                  id="edit_cliente_nome"
                  name="cliente_nome"
                  type="text"
                  value={formularioEdicao.cliente_nome}
                  onChange={alterarCampoEdicao}
                  placeholder="Nome ou razão social"
                  maxLength={200}
                  required
                  disabled={salvandoEdicao}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="edit_cliente_documento">
                  CPF / CNPJ
                </label>

                <input
                  id="edit_cliente_documento"
                  name="cliente_documento"
                  type="text"
                  value={formularioEdicao.cliente_documento}
                  onChange={alterarCampoEdicao}
                  placeholder="CPF ou CNPJ"
                  disabled={salvandoEdicao}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="edit_cliente_telefone">
                  Telefone
                </label>

                <input
                  id="edit_cliente_telefone"
                  name="cliente_telefone"
                  type="text"
                  value={formularioEdicao.cliente_telefone}
                  onChange={alterarCampoEdicao}
                  placeholder="(00) 00000-0000"
                  disabled={salvandoEdicao}
                />

              </div>


              <div className="orcamentos-form-group orcamentos-form-full">

                <label htmlFor="edit_cliente_email">
                  E-mail
                </label>

                <input
                  id="edit_cliente_email"
                  name="cliente_email"
                  type="email"
                  value={formularioEdicao.cliente_email}
                  onChange={alterarCampoEdicao}
                  placeholder="cliente@empresa.com.br"
                  disabled={salvandoEdicao}
                />

              </div>


              <div className="orcamentos-form-group orcamentos-form-full">

                <label htmlFor="edit_observacoes">
                  Observações gerais
                </label>

                <textarea
                  id="edit_observacoes"
                  name="observacoes"
                  value={formularioEdicao.observacoes}
                  onChange={alterarCampoEdicao}
                  placeholder="Informações gerais do orçamento..."
                  rows={3}
                  maxLength={2000}
                  disabled={salvandoEdicao}
                />

              </div>


              <div className="orcamentos-form-separator orcamentos-form-full">

                <span>
                  DADOS DA VENDA E ENTREGA
                </span>

                <p>
                  Atualize as condições comerciais deste orçamento.
                </p>

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="edit_frete">
                  Frete (R$)
                </label>

                <input
                  id="edit_frete"
                  name="frete"
                  type="number"
                  min="0"
                  max="9999999999.99"
                  step="0.01"
                  value={formularioEdicao.frete}
                  onChange={alterarCampoEdicao}
                  disabled={salvandoEdicao}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="edit_condicao_pagamento">
                  Condição de Pagamento
                </label>

                <input
                  id="edit_condicao_pagamento"
                  name="condicao_pagamento"
                  type="text"
                  value={formularioEdicao.condicao_pagamento}
                  onChange={alterarCampoEdicao}
                  placeholder="Ex.: 30/60/90 dias"
                  maxLength={200}
                  disabled={salvandoEdicao}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="edit_local_entrega">
                  Local de Entrega
                </label>

                <input
                  id="edit_local_entrega"
                  name="local_entrega"
                  type="text"
                  value={formularioEdicao.local_entrega}
                  onChange={alterarCampoEdicao}
                  placeholder="Endereço ou local de entrega"
                  maxLength={300}
                  disabled={salvandoEdicao}
                />

              </div>


              <div className="orcamentos-form-group">

                <label htmlFor="edit_data_entrega">
                  Data de Entrega
                </label>

                <input
                  id="edit_data_entrega"
                  name="data_entrega"
                  type="date"
                  value={formularioEdicao.data_entrega}
                  onChange={alterarCampoEdicao}
                  disabled={salvandoEdicao}
                />

              </div>


              <div className="orcamentos-form-group orcamentos-form-full">

                <label htmlFor="edit_observacoes_venda">
                  Observações Adicionais sobre a Venda
                </label>

                <textarea
                  id="edit_observacoes_venda"
                  name="observacoes_venda"
                  value={formularioEdicao.observacoes_venda}
                  onChange={alterarCampoEdicao}
                  placeholder="Prazo especial, instruções comerciais, detalhes da negociação..."
                  rows={4}
                  maxLength={2000}
                  disabled={salvandoEdicao}
                />

              </div>


              {erroEdicao && (

                <div className="orcamentos-form-error">
                  {erroEdicao}
                </div>

              )}


              <div className="orcamentos-modal-actions">

                <button
                  type="button"
                  className="orcamentos-secondary-button"
                  onClick={fecharEdicaoOrcamento}
                  disabled={salvandoEdicao}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="orcamentos-primary-button"
                  disabled={salvandoEdicao}
                >
                  {salvandoEdicao
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>

              </div>

            </form>

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
                  Pesquise um produto, confira o preço pedido e informe o preço orçado ao cliente como desconto.
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

              <div className="orcamentos-produtos-modos">

                <button
                  type="button"
                  className={
                    modoPesquisaProduto === "geral"
                      ? "ativo"
                      : ""
                  }
                  onClick={() => {

                    setModoPesquisaProduto(
                      "geral"
                    );

                    setProdutoSelecionado(
                      null
                    );

                  }}
                  disabled={adicionandoProduto}
                >
                  Pesquisa geral
                </button>


                <button
                  type="button"
                  className={
                    modoPesquisaProduto === "mecanica"
                      ? "ativo"
                      : ""
                  }
                  onClick={() => {

                    setModoPesquisaProduto(
                      "mecanica"
                    );

                    setBuscaProduto("");
                    setCategoriaProduto(
                      "todas"
                    );

                    setProdutoSelecionado(
                      null
                    );

                  }}
                  disabled={adicionandoProduto}
                >
                  Funil mecânico
                </button>

              </div>


              {modoPesquisaProduto === "geral" && (

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

              )}


              {modoPesquisaProduto === "mecanica" && (

                <div className="orcamentos-funil-mecanico">

                  <div className="orcamentos-funil-topo">

                    <div>

                      <span>
                        PESQUISA GUIADA
                      </span>

                      <strong>
                        Encontre a fechadura mecânica correta
                      </strong>

                      <p>
                        Selecione na ordem: maçaneta, roseta, função, acabamento e máquina.
                      </p>

                    </div>


                    <div className="orcamentos-funil-progresso">

                      <strong>
                        {etapasFunilPreenchidas}/5
                      </strong>

                      <span>
                        etapas
                      </span>

                    </div>

                  </div>


                  <div className="orcamentos-funil-barra">

                    <span
                      style={{
                        width:
                          `${(etapasFunilPreenchidas / 5) * 100}%`
                      }}
                    ></span>

                  </div>


                  <div className="orcamentos-funil-grid">


                    {/* 1. MAÇANETA */}

                    <div
                      className={
                        `orcamentos-funil-campo ${
                          filtroMacaneta
                            ? "preenchido"
                            : "atual"
                        }`
                      }
                    >

                      <div className="orcamentos-funil-label">

                        <span>
                          1
                        </span>

                        <label htmlFor="funil_macaneta">
                          Maçaneta
                        </label>

                      </div>

                      <select
                        id="funil_macaneta"
                        value={filtroMacaneta}
                        onChange={
                          (event) => {

                            setFiltroMacaneta(
                              event.target.value
                            );

                            setFiltroRoseta("");
                            setFiltroFuncao("");
                            setFiltroAcabamento("");
                            setFiltroMaquina("");
                            setProdutoSelecionado(
                              null
                            );

                          }
                        }
                        disabled={
                          carregandoProdutos ||
                          adicionandoProduto
                        }
                      >

                        <option value="">
                          Selecione a maçaneta
                        </option>

                        {opcoesMacaneta.map(
                          (opcao) => (

                            <option
                              key={opcao}
                              value={opcao}
                            >
                              {opcao}
                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* 2. ROSETA */}

                    <div
                      className={
                        `orcamentos-funil-campo ${
                          filtroRoseta
                            ? "preenchido"
                            : filtroMacaneta
                              ? "atual"
                              : "bloqueado"
                        }`
                      }
                    >

                      <div className="orcamentos-funil-label">

                        <span>
                          2
                        </span>

                        <label htmlFor="funil_roseta">
                          Roseta
                        </label>

                      </div>

                      <select
                        id="funil_roseta"
                        value={filtroRoseta}
                        onChange={
                          (event) => {

                            setFiltroRoseta(
                              event.target.value
                            );

                            setFiltroFuncao("");
                            setFiltroAcabamento("");
                            setFiltroMaquina("");
                            setProdutoSelecionado(
                              null
                            );

                          }
                        }
                        disabled={
                          !filtroMacaneta ||
                          carregandoProdutos ||
                          adicionandoProduto
                        }
                      >

                        <option value="">
                          Selecione a roseta
                        </option>

                        {opcoesRoseta.map(
                          (opcao) => (

                            <option
                              key={opcao}
                              value={opcao}
                            >
                              {opcao}
                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* 3. FUNÇÃO */}

                    <div
                      className={
                        `orcamentos-funil-campo ${
                          filtroFuncao
                            ? "preenchido"
                            : filtroRoseta
                              ? "atual"
                              : "bloqueado"
                        }`
                      }
                    >

                      <div className="orcamentos-funil-label">

                        <span>
                          3
                        </span>

                        <label htmlFor="funil_funcao">
                          Função
                        </label>

                      </div>

                      <select
                        id="funil_funcao"
                        value={filtroFuncao}
                        onChange={
                          (event) => {

                            setFiltroFuncao(
                              event.target.value
                            );

                            setFiltroAcabamento("");
                            setFiltroMaquina("");
                            setProdutoSelecionado(
                              null
                            );

                          }
                        }
                        disabled={
                          !filtroRoseta ||
                          carregandoProdutos ||
                          adicionandoProduto
                        }
                      >

                        <option value="">
                          Selecione a função
                        </option>

                        {opcoesFuncao.map(
                          (opcao) => (

                            <option
                              key={opcao}
                              value={opcao}
                            >
                              {opcao}
                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* 4. ACABAMENTO */}

                    <div
                      className={
                        `orcamentos-funil-campo ${
                          filtroAcabamento
                            ? "preenchido"
                            : filtroFuncao
                              ? "atual"
                              : "bloqueado"
                        }`
                      }
                    >

                      <div className="orcamentos-funil-label">

                        <span>
                          4
                        </span>

                        <label htmlFor="funil_acabamento">
                          Acabamento
                        </label>

                      </div>

                      <select
                        id="funil_acabamento"
                        value={filtroAcabamento}
                        onChange={
                          (event) => {

                            setFiltroAcabamento(
                              event.target.value
                            );

                            setFiltroMaquina("");
                            setProdutoSelecionado(
                              null
                            );

                          }
                        }
                        disabled={
                          !filtroFuncao ||
                          carregandoProdutos ||
                          adicionandoProduto
                        }
                      >

                        <option value="">
                          Selecione o acabamento
                        </option>

                        {opcoesAcabamento.map(
                          (opcao) => (

                            <option
                              key={opcao}
                              value={opcao}
                            >
                              {opcao}
                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* 5. MÁQUINA */}

                    <div
                      className={
                        `orcamentos-funil-campo ${
                          filtroMaquina
                            ? "preenchido"
                            : filtroAcabamento
                              ? "atual"
                              : "bloqueado"
                        }`
                      }
                    >

                      <div className="orcamentos-funil-label">

                        <span>
                          5
                        </span>

                        <label htmlFor="funil_maquina">
                          Máquina
                        </label>

                      </div>

                      <select
                        id="funil_maquina"
                        value={filtroMaquina}
                        onChange={
                          (event) => {

                            setFiltroMaquina(
                              event.target.value
                            );

                            setProdutoSelecionado(
                              null
                            );

                          }
                        }
                        disabled={
                          !filtroAcabamento ||
                          carregandoProdutos ||
                          adicionandoProduto
                        }
                      >

                        <option value="">
                          Selecione a máquina
                        </option>

                        {opcoesMaquina.map(
                          (opcao) => (

                            <option
                              key={opcao}
                              value={opcao}
                            >
                              {opcao}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                  </div>


                  <div className="orcamentos-funil-resumo">

                    <div>

                      {filtroMacaneta ? (

                        <>

                          <strong>
                            {produtosFiltrados.length}
                          </strong>

                          <span>
                            opção(ões) compatível(is)
                          </span>

                        </>

                      ) : (

                        <span>
                          Comece selecionando uma maçaneta.
                        </span>

                      )}

                    </div>


                    {etapasFunilPreenchidas > 0 && (

                      <button
                        type="button"
                        onClick={limparFunilMecanico}
                        disabled={adicionandoProduto}
                      >
                        Limpar funil
                      </button>

                    )}

                  </div>

                </div>

              )}


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

                          {modoPesquisaProduto === "mecanica" &&
                          !filtroMacaneta
                            ? "Selecione a maçaneta para iniciar o funil mecânico."
                            : "Nenhum produto encontrado com estes filtros."}

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
                                selecionarProdutoParaOrcamento(
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

                                  {modoPesquisaProduto === "mecanica" &&
                                  produto._funil ? (

                                    <>

                                      <span>
                                        {produto._funil.roseta}
                                      </span>

                                      <span>
                                        {produto._funil.funcao}
                                      </span>

                                      <span>
                                        {produto._funil.acabamento}
                                      </span>

                                      <span>
                                        {produto._funil.maquina}
                                      </span>

                                    </>

                                  ) : (

                                    produto.variacao && (
                                      <span>
                                        {produto.variacao}
                                      </span>
                                    )

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

                <section className="orcamentos-produto-visualizacao">

                  <div className="orcamentos-produto-visualizacao-imagem-area">

                    {visualizacaoProdutoSelecionado?.imagem ? (

                      <img
                        src={
                          visualizacaoProdutoSelecionado.imagem
                        }
                        alt={produtoSelecionado.nome}
                        className="orcamentos-produto-visualizacao-imagem"
                      />

                    ) : (

                      <div className="orcamentos-produto-sem-imagem">

                        <span>
                          ◇
                        </span>

                        <strong>
                          Imagem não disponível
                        </strong>

                        <small>
                          O item pode ser adicionado normalmente ao orçamento.
                        </small>

                      </div>

                    )}

                  </div>


                  <div className="orcamentos-produto-visualizacao-conteudo">

                    <div className="orcamentos-produto-visualizacao-topo">

                      <div className="orcamentos-produto-visualizacao-titulo">

                        <span>
                          VISUALIZAÇÃO DO ITEM
                        </span>

                        <h3>
                          {produtoSelecionado.nome}
                        </h3>

                        <small>
                          {produtoSelecionado.codigo}
                        </small>

                      </div>


                      <div className="orcamentos-produto-visualizacao-preco">

                        <span>
                          PREÇO PEDIDO
                        </span>

                        <strong>
                          {formatarMoeda(
                            produtoSelecionado.preco
                          )}
                        </strong>

                      </div>

                    </div>


                    <div className="orcamentos-produto-visualizacao-tags">

                      {visualizacaoProdutoSelecionado?.categoriaTabela && (
                        <span>
                          {visualizacaoProdutoSelecionado.categoriaTabela}
                        </span>
                      )}

                      {produtoSelecionado.linha && (
                        <span>
                          {produtoSelecionado.linha}
                        </span>
                      )}

                      {produtoSelecionado.variacao && (
                        <span>
                          {produtoSelecionado.variacao}
                        </span>
                      )}

                      {produtoSelecionado.tipo_preco && (
                        <span>
                          {produtoSelecionado.tipo_preco}
                        </span>
                      )}

                    </div>


                    {produtoSelecionado.descricao && (

                      <div className="orcamentos-produto-visualizacao-descricao">

                        <span>
                          DESCRIÇÃO
                        </span>

                        <p>
                          {produtoSelecionado.descricao}
                        </p>

                      </div>

                    )}


                    <div className="orcamentos-produto-visualizacao-compra">

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


                      <div className="orcamentos-preco-cliente">

                        <label htmlFor="preco_cliente_produto">
                          Preço orçado ao cliente
                        </label>

                        <input
                          id="preco_cliente_produto"
                          type="number"
                          min="0"
                          max={precoPedidoProduto}
                          step="0.01"
                          value={precoClienteProduto}
                          onChange={
                            (event) =>
                              setPrecoClienteProduto(
                                event.target.value
                              )
                          }
                          disabled={adicionandoProduto}
                        />

                        <small>
                          Máximo:{" "}
                          {formatarMoeda(
                            precoPedidoProduto
                          )}
                        </small>

                      </div>


                      <div className="orcamentos-produto-desconto-previo">

                        <span>
                          DESCONTO
                        </span>

                        <strong>
                          {precoOrcadoProdutoValido
                            ? `- ${formatarMoeda(
                                descontoProduto
                              )}`
                            : "-"}
                        </strong>

                        <small>
                          {precoOrcadoProdutoValido
                            ? `${descontoPercentualProduto.toFixed(1)}%`
                            : "Informe um valor válido"}
                        </small>

                      </div>


                      <div className="orcamentos-produto-total-previo">

                        <span>
                          SUBTOTAL COM DESCONTO
                        </span>

                        <strong>
                          {precoOrcadoProdutoValido
                            ? formatarMoeda(
                                subtotalProdutoPrevio
                              )
                            : "-"}
                        </strong>

                      </div>

                    </div>

                  </div>

                </section>

              )}


              <div className="orcamentos-modal-actions orcamentos-produtos-actions">

                <button
                  type="button"
                  className="orcamentos-secondary-button"
                  onClick={() => {

                    if (produtoSelecionado) {

                      setProdutoSelecionado(null);
                      setQuantidadeProduto(1);
                      setPrecoClienteProduto("");
                      setErroProdutos("");

                      return;

                    }

                    fecharAdicionarProduto();

                  }}
                  disabled={adicionandoProduto}
                >
                  {produtoSelecionado
                    ? "Retirar item"
                    : "Fechar"}
                </button>


                <button
                  type="button"
                  className="orcamentos-primary-button"
                  onClick={adicionarProdutoAoOrcamento}
                  disabled={
                    !produtoSelecionado ||
                    !precoOrcadoProdutoValido ||
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
