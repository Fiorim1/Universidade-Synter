import "../styles/Footer.css"

import { Call } from 'reicon-react';


import logo from "../assets/logo-synter.png"

import instagramIcon from "../assets/icone-instagram.png"
import linkedinIcon from "../assets/icone-linkedin.png"
import youtubeIcon from "../assets/icone-youtube.png"


function Footer() {

    return (

        <footer className="footer">

            <div className="footer-container">


                {/* Lado esquerdo */}
                <div className="footer-brand">

                    <img
                        src={logo}
                        alt="Synter"
                        className="footer-logo"
                    />

                    <div className="footer-divider"></div>

                    <p>
                        Tecnologia que abre novas possibilidades.
                    </p>

                </div>


                {/* Centro */}
                <div className="footer-center">

                    <div className="footer-links">

                        <a href="#">
                            Termos de Uso
                        </a>

                        <span>|</span>

                        <a href="#">
                            Política de Privacidade
                        </a>

                    </div>


                    <div className="footer-social">

                        <a
                            href="#"
                            aria-label="Instagram"
                        >
                            <img
                                src={instagramIcon}
                                alt=""
                            />
                        </a>

                        <a
                            href="#"
                            aria-label="LinkedIn"
                        >
                            <img
                                src={linkedinIcon}
                                alt=""
                            />
                        </a>

                        <a
                            href="#"
                            aria-label="YouTube"
                        >
                            <img
                                src={youtubeIcon}
                                alt=""
                            />
                        </a>

                    </div>

                </div>


                {/* Lado direito */}
                <div className="footer-contact">

                    <span className="footer-phone-icon">
                                                    <Call />
                        
                    </span>

                    <div>

                        <p>
                            (48) 3941-1192
                        </p>

                        <strong>
                            Fale Conosco
                        </strong>

                    </div>

                </div>

            </div>


            {/* Parte inferior */}

            <div className="footer-bottom">

                <span>
                    © {new Date().getFullYear()} Synter. Todos os direitos reservados.
                </span>

                <div className="footer-bottom-tags">

                    <span>SEGURANÇA</span>
                    <span>|</span>
                    <span>TECNOLOGIA</span>
                    <span>|</span>
                    <span>PESSOAS</span>
                    <span>|</span>
                    <span>SEMPRE MAIS LONGE</span>

                </div>

            </div>

        </footer>

    )

}


export default Footer