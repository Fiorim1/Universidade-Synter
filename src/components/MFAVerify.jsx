import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  supabase
} from "../services/supabaseClient";


function MFAVerify() {

  const navigate =
    useNavigate();


  // ========================================
  // ESTADOS
  // ========================================

  const [factorId, setFactorId] =
    useState("");

  const [codigo, setCodigo] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [verificando, setVerificando] =
    useState(false);

  const [error, setError] =
    useState("");


  // ========================================
  // LOCALIZAR O FATOR TOTP DO USUÁRIO
  // ========================================

  useEffect(() => {

    async function carregarMFA() {

      try {

        setLoading(true);
        setError("");


        // ==================================
        // VERIFICA O NÍVEL ATUAL DA SESSÃO
        // ==================================

        const {
          data: aalData,
          error: aalError
        } =
          await supabase.auth.mfa
            .getAuthenticatorAssuranceLevel();


        if (aalError) {

          throw aalError;

        }


        // ==================================
        // JÁ FEZ O 2FA NESTA SESSÃO
        // ==================================

        if (
          aalData?.currentLevel ===
          "aal2"
        ) {

          navigate(
            "/dashboard",
            {
              replace: true
            }
          );

          return;

        }


        // ==================================
        // LISTAR FATORES DO USUÁRIO
        // ==================================

        const {
          data,
          error
        } =
          await supabase.auth.mfa
            .listFactors();


        if (error) {

          throw error;

        }


        const fatoresTotp =
          data?.totp || [];


        // ==================================
        // PROCURAR FATOR VERIFICADO
        // ==================================

        const fatorVerificado =
          fatoresTotp.find(
            (
              fator
            ) =>
              fator.status ===
              "verified"
          );


        // ==================================
        // NÃO TEM 2FA CONFIGURADO
        // ==================================

        if (
          !fatorVerificado
        ) {

          navigate(
            "/mfa/setup",
            {
              replace: true
            }
          );

          return;

        }


        setFactorId(
          fatorVerificado.id
        );

      }

      catch (err) {

        console.error(
          "Erro ao carregar MFA:",
          err
        );


        setError(
          "Não foi possível carregar a autenticação em dois fatores."
        );

      }

      finally {

        setLoading(false);

      }

    }


    carregarMFA();

  }, [navigate]);


  // ========================================
  // CONFIRMAR CÓDIGO
  // ========================================

  async function confirmarCodigo(
    event
  ) {

    event.preventDefault();


    if (
      verificando
    ) {

      return;

    }


    const codigoLimpo =
      codigo
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          6
        );


    // ======================================
    // VALIDAÇÕES
    // ======================================

    if (
      codigoLimpo.length !==
      6
    ) {

      setError(
        "Digite o código de 6 dígitos do Google Authenticator."
      );

      return;

    }


    if (
      !factorId
    ) {

      setError(
        "Não foi possível identificar o autenticador."
      );

      return;

    }


    try {

      setVerificando(true);
      setError("");


      // ======================================
      // DESAFIA E CONFIRMA O MFA
      // ======================================

      const {
        error
      } =
        await supabase.auth.mfa
          .challengeAndVerify({

            factorId:
              factorId,

            code:
              codigoLimpo

          });


      if (error) {

        throw error;

      }


      // ======================================
      // CONFIRMAR AAL2
      // ======================================

      const {
        data: aalData,
        error: aalError
      } =
        await supabase.auth.mfa
          .getAuthenticatorAssuranceLevel();


      if (aalError) {

        throw aalError;

      }


      if (
        aalData?.currentLevel !==
        "aal2"
      ) {

        throw new Error(
          "A sessão ainda não atingiu o nível AAL2."
        );

      }


      // ======================================
      // ACESSO LIBERADO
      // ======================================

      navigate(
        "/dashboard",
        {
          replace: true
        }
      );

    }

    catch (err) {

      console.error(
        "Erro ao verificar 2FA:",
        err
      );


      setError(
        "Código inválido ou expirado. Confira o Google Authenticator e tente novamente."
      );

    }

    finally {

      setVerificando(false);

    }

  }


  // ========================================
  // CARREGANDO
  // ========================================

  if (
    loading
  ) {

    return (

      <div>

        <h2>
          Verificando autenticação...
        </h2>

        <p>
          Aguarde alguns segundos.
        </p>

      </div>

    );

  }


  // ========================================
  // TELA
  // ========================================

  return (

    <div>


      <h1>
        Autenticação em dois fatores
      </h1>


      <p>
        Abra o Google Authenticator e digite o código de 6 dígitos.
      </p>


      <form
        onSubmit={
          confirmarCodigo
        }
      >


        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength="6"
          placeholder="000000"

          value={
            codigo
          }

          onChange={
            (
              event
            ) => {

              const valor =
                event.target.value
                  .replace(
                    /\D/g,
                    ""
                  )
                  .slice(
                    0,
                    6
                  );


              setCodigo(
                valor
              );


              setError("");

            }
          }
        />


        {error && (

          <p>
            {error}
          </p>

        )}


        <button
          type="submit"

          disabled={
            verificando ||
            !factorId
          }
        >

          {
            verificando
              ? "Verificando..."
              : "Confirmar código"
          }

        </button>


      </form>


    </div>

  );

}


export default MFAVerify;