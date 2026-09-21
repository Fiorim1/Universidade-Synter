import "../styles/Hero.css";

import {
  Verify,
  Play3,
  Flash2,
  Box2
} from "reicon-react";


function Hero({
  one = "Seja bem-vindo(a) à nossa",
  two = "Universidade Synter",
  three = "Aqui você irá encontrar tudo sobre a Synter",
  variant = "default",
  showFeatures = false
}) {

  return (
    <div
      className={`hero-all ${
        variant === "dashboard"
          ? "hero-dashboard"
          : "hero-default"
      }`}
    >

      {/* ========================= */}
      {/* HERO DO DASHBOARD        */}
      {/* ========================= */}

      {variant === "dashboard" && (
        <>

          <span className="hero-eyebrow">
            <Box2 />
            {one}
          </span>

          <h1>
            {two}
          </h1>

          <p className="hero-description">
            {three}
          </p>


          {/* SÓ APARECE QUANDO showFeatures FOR TRUE */}

          {showFeatures && (

            <div className="hero-features">

              <div className="hero-feature">

                <div className="hero-feature-icon">
                  <Verify />
                </div>

                <div>
                  <strong>
                    Conteúdo Atualizado
                  </strong>

                  <span>
                    Materiais sempre disponíveis
                  </span>
                </div>

              </div>


              <div className="hero-feature">

                <div className="hero-feature-icon">
                  <Play3 />
                </div>

                <div>
                  <strong>
                    Treinamentos
                  </strong>

                  <span>
                    Conteúdo técnico e comercial
                  </span>
                </div>

              </div>


              <div className="hero-feature">

                <div className="hero-feature-icon">
                  <Flash2 />
                </div>

                <div>
                  <strong>
                    Acesso Rápido
                  </strong>

                  <span>
                    Tudo em um único lugar
                  </span>
                </div>

              </div>

            </div>

          )}

        </>
      )}


      {/* ========================= */}
      {/* OUTRAS PÁGINAS           */}
      {/* ========================= */}

      {variant !== "dashboard" && (
        <>

          {one && <h4>{one}</h4>}

          {two && <h2>{two}</h2>}

          {three && <p>{three}</p>}

        </>
      )}

    </div>
  );
}

export default Hero;