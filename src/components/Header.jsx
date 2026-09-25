import { NavLink } from "react-router-dom";
import { SquareArrowRight2 } from "reicon-react";

import "../styles/Header.css";

import instagramIcon from "../assets/icone-instagram.png";
import linkedinIcon from "../assets/icone-linkedin.png";
import youtubeIcon from "../assets/icone-youtube.png";
import logo from "../assets/logo-synter.png";


function Header({ profileContent }) {

    return (

        <header className="header-all">

            <div className="header-container">


                {/* ========================= */}
                {/* LOGO                      */}
                {/* ========================= */}

                <NavLink
                    to="/dashboard"
                    className="header-logo-link"
                >

                    <img
                        src={logo}
                        alt="Synter"
                        className="header-logo"
                    />

                </NavLink>


                {/* ========================= */}
                {/* AÇÕES                     */}
                {/* ========================= */}

                <div className="header-actions">


                    {/* ========================= */}
                    {/* TELEFONE                  */}
                    {/* ========================= */}

                    <a
                        href="tel:+554839411192"
                        className="header-phone"
                    >

                        {/*
                        <span className="header-phone-icon">
                            <Call />
                        </span>

                        <span>
                            (48) 3941-1192
                        </span>
                        */}

                    </a>



                    {/* ========================= */}
                    {/* REDES SOCIAIS             */}
                    {/* ========================= */}

                    <div className="header-social">


                        {/* INSTAGRAM */}

                        <a
                            href="https://www.instagram.com/synter_fechaduras/reels/?hl=fr"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram da Synter"
                        >

                            <img
                                src={instagramIcon}
                                alt="Instagram"
                            />

                        </a>


                        {/* LINKEDIN */}

                        <a
                            href="https://br.linkedin.com/company/synter-fabrica"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn da Synter"
                        >

                            <img
                                src={linkedinIcon}
                                alt="LinkedIn"
                            />

                        </a>


                        {/* YOUTUBE */}

                        <a
                            href="https://www.youtube.com/@synter_fechaduras"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="YouTube da Synter"
                        >

                            <img
                                src={youtubeIcon}
                                alt="YouTube"
                            />

                        </a>

                    </div>



                    {/* ========================= */}
                    {/* FALE CONOSCO              */}
                    {/* ========================= */}

                    <button
                        type="button"
                        className="header-contact-button"
                    >

                        <span>
                            Fale Conosco Agora
                        </span>

                        <span className="header-contact-arrow">
                            <SquareArrowRight2 />
                        </span>

                    </button>



                    {/* ========================= */}
                    {/* DIVISOR                   */}
                    {/* ========================= */}

                    {profileContent && (

                        <div className="header-divider"></div>

                    )}



                    {/* ========================= */}
                    {/* PERFIL                    */}
                    {/* ========================= */}

                    {profileContent && (

                        <div className="header-profile">

                            {profileContent}

                        </div>

                    )}

                </div>

            </div>

        </header>

    );

}


export default Header;