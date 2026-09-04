import "../styles/Header.css";

import instagramIcon from "../assets/icone-instagram.png";
import linkedinIcon from "../assets/icone-linkedin.png";
import youtubeIcon from "../assets/icone-youtube.png";
import logo from "../assets/logo-synter.png";

function Header() {
    return (
        <header className="header-all">

            {/* Primeira Parte */}
            <div className="header-primary-part">
                <nav className="synter-links">
                    <a href="#">(48) 3941-1192</a>

                    <div className="bar">|</div>

                    <div className="top-buttons">
                        <button>
                            <img src={instagramIcon} alt="Instagram" />
                        </button>
                        <button>
                            <img src={linkedinIcon} alt="LinkedIn" />
                        </button>
                        <button>
                            <img src={youtubeIcon} alt="YouTube" />
                        </button>
                    </div>
                </nav>

                <div className="long-bar-header"></div>
            </div>


            {/* Segunda Parte */}
            <div className="header-second-part">
                <img src={logo} alt="Logo Synter" id="logo"/>
                <button>
                    Fale Conosco Agora
                </button>
            </div>
        </header>
    );
}

export default Header;