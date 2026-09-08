import "../styles/CardsDashboard.css"

function CardsDashboard({ image, title, desc, onClick }) {

    return (

        <button
            className="cads-container"
            type="button"
            onClick={onClick}
        >

            <div className="card-image">

                <img
                    src={image}
                    alt={title}
                />

            </div>

            <div className="content-text-cards">

                <h3>{title}</h3>

                <p>{desc}</p>

            </div>

        </button>

    )

}

export default CardsDashboard