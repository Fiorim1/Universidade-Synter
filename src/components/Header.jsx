
import { NavLink } from "react-router-dom";
import { SquareArrowRight2 } from "reicon-react";

import "../styles/Header.css";

import instagramIcon from "../assets/icone-instagram.png";
import linkedinIcon from "../assets/icone-linkedin.png";
import youtubeIcon from "../assets/icone-youtube.png";
import logo from "../assets/logo-synter.png";

// ==========================================
// CONTATO OFICIAL
// ==========================================

const WHATSAPP_NUMERO = "554991664297";

const WHATSAPP_MENSAGEM =
  "Olá! Gostaria de entrar em contato com a Synter.";

const WHATSAPP_LINK =
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
    WHATSAPP_MENSAGEM
  )}`;

// ==========================================
// HEADER — UNIVERSIDADE SYNTER
// ==========================================

function Header({ profileContent }) {
  return (
    <header className="header-all">
      <div className="header-container">

        {/* =====================================
            LOGO
        ===================================== */}

        <NavLink
          to="/dashboard"
          className="header-logo-link"
          aria-label="Ir para Universidade Synter"
        >
          <img
            src={logo}
            alt="Synter"
            className="header-logo"
          />
        </NavLink>

        {/* =====================================
            AÇÕES DO HEADER
        ===================================== */}

        <div className="header-actions">

          {/* =================================
              REDES SOCIAIS
          ================================= */}

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

          {/* =================================
              FALE CONOSCO — WHATSAPP
          ================================= */}

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="header-contact-button"
            aria-label="Fale conosco pelo WhatsApp"
            title="WhatsApp: +55 49 9166-4297"
          >
            <span>
              Fale Conosco Agora
            </span>

            <span
              className="header-contact-arrow"
              aria-hidden="true"
            >
              <SquareArrowRight2 />
            </span>
          </a>

          {/* =================================
              DIVISOR DO PERFIL
          ================================= */}

          {profileContent && (
            <div className="header-divider" />
          )}

          {/* =================================
              PERFIL DO USUÁRIO
          ================================= */}

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
