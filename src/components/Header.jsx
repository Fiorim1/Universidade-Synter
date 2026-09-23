import { NavLink } from "react-router-dom"
import { Call, SquareArrowRight2 } from 'reicon-react';


import "../styles/Header.css"

import instagramIcon from "../assets/icone-instagram.png"
import linkedinIcon from "../assets/icone-linkedin.png"
import youtubeIcon from "../assets/icone-youtube.png"
import logo from "../assets/logo-synter.png"


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


                    {/* Telefone */}

                    <a
                        href="tel:+554839411192"
                        className="header-phone"
                    >

                        {/* <span className="header-phone-icon">
                            <Call />
                        </span>

                        <span>
                            (48) 3941-1192
                        </span> */}

                    </a>



                    {/* Redes sociais */}

                    <div className="header-social">

                        <button
                            type="button"
                            aria-label="Instagram"
                        >
                            <img
                                src={instagramIcon}
                                alt=""
                            />
                        </button>


                        <button
                            type="button"
                            aria-label="LinkedIn"
                        >
                            <img
                                src={linkedinIcon}
                                alt=""
                            />
                        </button>


                        <button
                            type="button"
                            aria-label="YouTube"
                        >
                            <img
                                src={youtubeIcon}
                                alt=""
                            />
                        </button>

                    </div>



                    {/* Fale conosco */}

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



                    {/* Divisor */}

                    {profileContent && (

                        <div className="header-divider"></div>

                    )}



                    {/* Perfil */}

                    {profileContent && (

                        <div className="header-profile">

                            {profileContent}

                        </div>

                    )}

                </div>

            </div>

        </header>

    )

}


export default Header