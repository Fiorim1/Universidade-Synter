import "../styles/CardsDashboard.css";

import { CircleArrowRight } from "reicon-react";
import { useNavigate } from "react-router-dom";

function CardsDashboard({ image, title, desc, route, pdf }) {

    const navigate = useNavigate();

    function handleClick() {

        // Se tiver PDF, baixa o arquivo
        if (pdf) {

            const link = document.createElement("a");

            link.href = pdf;
            link.download = `${title}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return;
        }

        // Se tiver rota, navega para a página
        if (route) {
            navigate(route);
        }

    }

    return (

        <button
            className="cads-container"
            type="button"
            onClick={handleClick}
        >

            {/* Ícone do card */}
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


            {/* Seta lateral */}
            <div className="card-arrow">

                <CircleArrowRight />

            </div>

        </button>

    )
}

export default CardsDashboard;