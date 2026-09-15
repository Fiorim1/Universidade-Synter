import "../styles/CardsDashboard.css"

import { CircleArrowRight } from "reicon-react"

import { useNavigate } from "react-router-dom"


function CardsDashboard({
    image,
    title,
    desc,
    route,
    pdf,
    onClick
}) {

    const navigate = useNavigate()


    function handleClick() {

        // ================================
        // FUNÇÃO PERSONALIZADA
        // ================================

        // Mantém compatibilidade com os cards
        // antigos que utilizam onClick.
        if (onClick) {

            onClick()

            return
        }


        // ================================
        // PDF
        // ================================

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


        // ================================
        // ROTA
        // ================================

        if (route) {

            navigate(route)

        }

    }


    return (

        <button
            className="cads-container"
            type="button"
            onClick={handleClick}
        >

            {/* Ícone */}

            <div className="card-image">

                <img
                    src={image}
                    alt={title}
                />

            </div>


            {/* Textos */}

            <div className="content-text-cards">

                <h3>
                    {title}
                </h3>

                <p>
                    {desc}
                </p>

            </div>


            {/* Seta */}

            <div className="card-arrow">

                <CircleArrowRight />

            </div>

        </button>

    )

}


export default CardsDashboard