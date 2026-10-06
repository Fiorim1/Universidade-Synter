import { useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "../services/supabaseClient";

import "../styles/NotificationsButton.css";


function NotificationsButton({
  onOpenOrcamento
}) {

  const wrapperRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [notificacoes, setNotificacoes] =
    useState([]);


  useEffect(() => {

    let ativo = true;
    let channel = null;


    async function iniciar() {

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


        const user =
          usuarioData?.user;


        if (!user) {
          throw new Error(
            "Usuário não autenticado."
          );
        }


        const {
          data,
          error
        } = await supabase
          .from("notificacoes")
          .select(`
            id,
            destinatario_id,
            ator_id,
            orcamento_id,
            tipo,
            titulo,
            mensagem,
            lida_em,
            created_at
          `)
          .order(
            "created_at",
            {
              ascending: false
            }
          )
          .limit(40);


        if (error) {
          throw error;
        }


        if (ativo) {

          setNotificacoes(
            data || []
          );

        }


        channel = supabase
          .channel(
            `notificacoes-${user.id}`
          )
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notificacoes",
              filter:
                `destinatario_id=eq.${user.id}`
            },
            (payload) => {

              if (!ativo) {
                return;
              }


              const nova =
                payload.new;


              setNotificacoes(
                (anteriores) => {

                  const existe =
                    anteriores.some(
                      (item) =>
                        item.id === nova.id
                    );


                  if (existe) {
                    return anteriores;
                  }


                  return [
                    nova,
                    ...anteriores
                  ].slice(0, 40);

                }
              );

            }
          )
          .subscribe();

      }
      catch (error) {

        console.error(
          "Erro ao carregar notificações:",
          error
        );


        if (ativo) {

          setErro(
            error?.message ||
            "Não foi possível carregar as notificações."
          );

        }

      }
      finally {

        if (ativo) {
          setLoading(false);
        }

      }

    }


    iniciar();


    return () => {

      ativo = false;


      if (channel) {

        supabase.removeChannel(
          channel
        );

      }

    };

  }, []);


  useEffect(() => {

    function fecharAoClicarFora(
      event
    ) {

      if (
        !wrapperRef.current ||
        wrapperRef.current.contains(
          event.target
        )
      ) {
        return;
      }


      setOpen(false);

    }


    document.addEventListener(
      "mousedown",
      fecharAoClicarFora
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        fecharAoClicarFora
      );

    };

  }, []);


  const naoLidas = useMemo(() => {

    return notificacoes.filter(
      (notificacao) =>
        !notificacao.lida_em
    ).length;

  }, [notificacoes]);


  async function marcarComoLida(
    notificacaoId
  ) {

    const agora =
      new Date().toISOString();


    setNotificacoes(
      (anteriores) =>
        anteriores.map(
          (notificacao) =>
            notificacao.id ===
            notificacaoId
              ? {
                  ...notificacao,
                  lida_em:
                    notificacao.lida_em ||
                    agora
                }
              : notificacao
        )
    );


    const {
      error
    } = await supabase.rpc(
      "marcar_notificacao_lida",
      {
        p_notificacao_id:
          notificacaoId
      }
    );


    if (error) {

      console.error(
        "Erro ao marcar notificação:",
        error
      );

    }

  }


  async function marcarTodasComoLidas() {

    if (naoLidas === 0) {
      return;
    }


    const agora =
      new Date().toISOString();


    setNotificacoes(
      (anteriores) =>
        anteriores.map(
          (notificacao) => ({
            ...notificacao,
            lida_em:
              notificacao.lida_em ||
              agora
          })
        )
    );


    const {
      error
    } = await supabase.rpc(
      "marcar_todas_notificacoes_lidas"
    );


    if (error) {

      console.error(
        "Erro ao marcar todas as notificações:",
        error
      );

    }

  }


  async function abrirNotificacao(
    notificacao
  ) {

    if (!notificacao.lida_em) {

      await marcarComoLida(
        notificacao.id
      );

    }


    setOpen(false);


    if (
      notificacao.orcamento_id &&
      typeof onOpenOrcamento ===
        "function"
    ) {

      await onOpenOrcamento(
        notificacao.orcamento_id
      );

    }

  }


  function formatarData(
    valor
  ) {

    if (!valor) {
      return "";
    }


    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(
      new Date(valor)
    );

  }


  return (

    <div
      className="notifications-wrapper"
      ref={wrapperRef}
    >

      <button
        type="button"
        className={
          `notifications-button${
            naoLidas > 0
              ? " has-unread"
              : ""
          }`
        }
        onClick={() =>
          setOpen(
            (anterior) =>
              !anterior
          )
        }
        aria-label="Notificações"
        aria-expanded={open}
      >

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
          />

          <path
            d="M13.73 21a2 2 0 0 1-3.46 0"
          />
        </svg>


        {naoLidas > 0 && (

          <span className="notifications-badge">

            {naoLidas > 99
              ? "99+"
              : naoLidas}

          </span>

        )}

      </button>


      {open && (

        <div className="notifications-panel">

          <div className="notifications-header">

            <div>

              <span>
                CENTRAL
              </span>

              <h3>
                Notificações
              </h3>

            </div>


            {naoLidas > 0 && (

              <button
                type="button"
                className="notifications-read-all"
                onClick={marcarTodasComoLidas}
              >
                Marcar todas como lidas
              </button>

            )}

          </div>


          <div className="notifications-content">

            {loading && (

              <div className="notifications-state">
                Carregando notificações...
              </div>

            )}


            {!loading && erro && (

              <div className="notifications-error">
                {erro}
              </div>

            )}


            {!loading &&
              !erro &&
              notificacoes.length === 0 && (

                <div className="notifications-empty">

                  <div className="notifications-empty-icon">
                    ✓
                  </div>

                  <strong>
                    Nenhuma notificação
                  </strong>

                  <p>
                    Quando houver uma atualização
                    nos orçamentos, ela aparecerá aqui.
                  </p>

                </div>

              )}


            {!loading &&
              !erro &&
              notificacoes.map(
                (notificacao) => (

                  <button
                    type="button"
                    key={notificacao.id}
                    className={
                      `notification-item${
                        !notificacao.lida_em
                          ? " unread"
                          : ""
                      }`
                    }
                    onClick={() =>
                      abrirNotificacao(
                        notificacao
                      )
                    }
                  >

                    <div
                      className={
                        `notification-item-icon ${notificacao.tipo}`
                      }
                    >

                      {notificacao.tipo ===
                      "orcamento_aprovado"
                        ? "✓"
                        : "+"}

                    </div>


                    <div className="notification-item-content">

                      <div className="notification-item-title">

                        <strong>
                          {notificacao.titulo}
                        </strong>


                        {!notificacao.lida_em && (
                          <span className="notification-unread-dot"></span>
                        )}

                      </div>


                      <p>
                        {notificacao.mensagem}
                      </p>


                      <small>
                        {formatarData(
                          notificacao.created_at
                        )}
                      </small>

                    </div>

                  </button>

                )
              )}

          </div>

        </div>

      )}

    </div>

  );

}


export default NotificationsButton;
