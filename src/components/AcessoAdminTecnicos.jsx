
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { tecnicosClient } from "../lib/tecnicosClient";

export default function AcessoAdminTecnicos() {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificar() {
      const {
        data: { user },
        error: erroSessao,
      } = await tecnicosClient.auth.getUser();

      if (!user || erroSessao) return;

      const { data, error } =
        await tecnicosClient.rpc(
          "pode_gerenciar_tecnicos"
        );

      if (ativo && !error) {
        setPermitido(data === true);
      }
    }

    verificar();

    return () => {
      ativo = false;
    };
  }, []);

  if (!permitido) return null;

  return (
    <Link
      to="/tecnicos-homologados/gerenciar"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
        padding: "13px 19px",
        background: "#ffffff",
        color: "#111111",
        borderRadius: "9px",
        fontSize: "12px",
        fontWeight: 700,
        textDecoration: "none",
      }}
    >
      Gerenciar Técnicos
    </Link>
  );
}
