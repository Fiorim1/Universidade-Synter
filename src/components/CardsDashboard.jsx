import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CloseCircle } from 'reicon-react';


import { CircleArrowRight, X } from "reicon-react"

import "../styles/CardsDashboard.css"


function CardsDashboard({
    image,
    title,
    desc,
    route,
    pdf,
    onClick,

    // Por padrão o card fica habilitado
    enabled = true
}) {

    const navigate = useNavigate()

    const [modalOpen, setModalOpen] =
        useState(false)


    // ==========================================
    // CLIQUE NO CARD
    // ==========================================

    function handleClick() {

        // ======================================
        // CARD DESABILITADO
        // ======================================

        if (!enabled) {

            setModalOpen(true)

            return
        }


        // ======================================
        // FUNÇÃO PERSONALIZADA
        // ======================================

        if (onClick) {

            onClick()

            return
        }


        // ======================================
        // PDF
        // ======================================

        if (pdf) {

            const link =
                document.createElement("a")

            link.href = pdf

            link.download =
                `${title}.pdf`

            document.body.appendChild(
                link
            )

            link.click()

            document.body.removeChild(
                link
            )

            return
        }


        // ======================================
        // ROTA
        // ======================================

        if (route) {

            navigate(route)

        }

    }


    // ==========================================
    // FECHAR MODAL
    // ==========================================

    function fecharModal() {

        setModalOpen(false)

    }


    return (

        <>

            {/* ================================= */}
            {/* CARD                              */}
            {/* ================================= */}

            <button
                className={`cads-container ${!enabled
                        ? "card-disabled"
                        : ""
                    }`}
                type="button"
                onClick={handleClick}
            >

                {/* ÍCONE */}

                <div className="card-image">

                    <img
                        src={image}
                        alt={title}
                    />

                </div>


                {/* TEXTOS */}

                <div className="content-text-cards">

                    <h3>
                        {title}
                    </h3>

                    <p>
                        {desc}
                    </p>

                </div>


                {/* SETA */}

                <div className="card-arrow">

                    <CircleArrowRight />

                </div>

            </button>


            {/* ================================= */}
            {/* MODAL - PROJETO EM PRODUÇÃO       */}
            {/* ================================= */}

            {modalOpen && (

                <div
                    className="card-production-overlay"
                    onClick={fecharModal}
                >

                    <div
                        className="card-production-modal"
                        onClick={(evento) =>
                            evento.stopPropagation()
                        }
                    >

                        {/* BOTÃO FECHAR */}

                        <button
                            type="button"
                            className="card-production-close"
                            onClick={fecharModal}
                            aria-label="Fechar aviso"
                        >

                            <CloseCircle />

                        </button>


                        {/* ÍCONE */}

                        <div className="card-production-icon">

                            <span>
                                !
                            </span>

                        </div>


                        {/* TEXTO */}

                        <div className="card-production-content">

                            <span className="card-production-label">
                                UNIVERSIDADE SYNTER
                            </span>

                            <h2>
                                Projeto em produção
                            </h2>

                            <p>
                                Este conteúdo ainda está sendo
                                preparado e estará disponível
                                em breve.
                            </p>

                        </div>


                        {/* BOTÃO */}

                        <button
                            type="button"
                            className="card-production-button"
                            onClick={fecharModal}
                        >

                            Entendi

                        </button>

                    </div>

                </div>

            )}

        </>

    )

}


export default CardsDashboard