import "../styles/Footer.css";
import logo from "../assets/logo-synter.png";

function Footer() {
    return (
        <footer className="footer">

            <div className="footer-container">

                <div className="footer-left">
                    <img src={logo} alt="Synter" />

                    <p>
                        Soluções inteligentes e eficientes para o seu negócio.
                    </p>
                </div>

                <div className="footer-right">
                    <h3>Fale Conosco</h3>
                    <p>(48) 3941-1192</p>
                </div>

            </div>

            <div className="footer-line"></div>

        </footer>
    );
}

export default Footer;