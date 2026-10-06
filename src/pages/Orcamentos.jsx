import { useEffect, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { supabase } from "../services/supabaseClient";


function Orcamentos() {

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [role, setRole] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const [orcamentos, setOrcamentos] = useState([]);


  // ========================================
  // CARREGAR USUÁRIO / ROLE / ORÇAMENTOS
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


      setUsuario(user);


      // ========================================
      // BUSCAR ROLE
      // ========================================

      const {
        data: perfil,
        error: perfilError
      } = await supabase
        .from("profiles")
        .select("id, full_name, role")
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
      // BLOQUEAR ROLE USER
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
      //
      // IMPORTANTE:
      //
      // Não precisamos filtrar manualmente
      // por representante aqui.
      //
      // A RLS do Supabase já garante:
      //
      // representante -> somente os próprios
      // comercial      -> todos
      //
      // ========================================

      const {
        data: dadosOrcamentos,
        error: orcamentosError
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


      if (orcamentosError) {
        throw orcamentosError;
      }


      setOrcamentos(
        dadosOrcamentos || []
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

    const statusFormatados = {

      rascunho: "Rascunho",

      enviado: "Enviado",

      aprovado: "Aprovado",

      recusado: "Recusado",

      cancelado: "Cancelado"

    };


    return (
      statusFormatados[status] ||
      status
    );

  }


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (

      <div>

        <Header />

        <main
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >

          <p>
            Carregando orçamentos...
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

      <div>

        <Header />

        <main
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "30px"
          }}
        >

          <h2>
            Não foi possível carregar
            os orçamentos
          </h2>

          <p>
            {erro}
          </p>

          <button
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

      <div>

        <Header />

        <main
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "30px"
          }}
        >

          <h1>
            Acesso não autorizado
          </h1>

          <p>
            Seu usuário não possui
            permissão para acessar
            o sistema de orçamentos.
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

    <div>

      <Header />


      <main
        style={{
          minHeight: "70vh",
          padding: "40px 6%"
        }}
      >


        {/* ================================= */}
        {/* CABEÇALHO                        */}
        {/* ================================= */}

        <section>

          <p>
            Universidade Synter
          </p>


          <h1>
            Orçamentos
          </h1>


          <p>

            {role === "representante"
              ? "Crie e acompanhe seus orçamentos."
              : "Acompanhe e analise os orçamentos enviados pelos representantes."}

          </p>


          <p>

            Perfil atual:{" "}

            <strong>
              {role === "representante"
                ? "Representante"
                : "Comercial"}
            </strong>

          </p>

        </section>


        {/* ================================= */}
        {/* RESUMO                           */}
        {/* ================================= */}

        <section
          style={{
            marginTop: "35px"
          }}
        >

          <h2>
            Resumo
          </h2>


          <p>

            Total de orçamentos:{" "}

            <strong>
              {orcamentos.length}
            </strong>

          </p>

        </section>


        {/* ================================= */}
        {/* SEM ORÇAMENTOS                    */}
        {/* ================================= */}

        {orcamentos.length === 0 && (

          <section
            style={{
              marginTop: "35px"
            }}
          >

            <h3>
              Nenhum orçamento encontrado
            </h3>


            <p>

              {role === "representante"
                ? "Você ainda não possui orçamentos."
                : "Ainda não existem orçamentos disponíveis para acompanhamento."}

            </p>

          </section>

        )}


        {/* ================================= */}
        {/* LISTA DE ORÇAMENTOS               */}
        {/* ================================= */}

        {orcamentos.length > 0 && (

          <section
            style={{
              marginTop: "35px",
              overflowX: "auto"
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse"
              }}
            >

              <thead>

                <tr>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px"
                    }}
                  >
                    Cliente
                  </th>


                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px"
                    }}
                  >
                    Documento
                  </th>


                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px"
                    }}
                  >
                    Status
                  </th>


                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px"
                    }}
                  >
                    Criado em
                  </th>

                </tr>

              </thead>


              <tbody>

                {orcamentos.map(
                  (orcamento) => (

                    <tr
                      key={orcamento.id}
                    >

                      <td
                        style={{
                          padding: "12px"
                        }}
                      >

                        {orcamento.cliente_nome}

                      </td>


                      <td
                        style={{
                          padding: "12px"
                        }}
                      >

                        {orcamento.cliente_documento || "-"}

                      </td>


                      <td
                        style={{
                          padding: "12px"
                        }}
                      >

                        {formatarStatus(
                          orcamento.status
                        )}

                      </td>


                      <td
                        style={{
                          padding: "12px"
                        }}
                      >

                        {formatarData(
                          orcamento.created_at
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </section>

        )}


      </main>


      <Footer />

    </div>

  );

}


export default Orcamentos;