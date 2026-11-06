
import "../styles/Footer.css";

import { Call } from "reicon-react";

import logo from "../assets/logo-synter.png";

import instagramIcon from "../assets/icone-instagram.png";
import linkedinIcon from "../assets/icone-linkedin.png";
import youtubeIcon from "../assets/icone-youtube.png";

// ==========================================
// CONTATO OFICIAL SYNTER
// ==========================================

const TELEFONE_SYNTER = "+55 49 9166-4297";

const MENSAGEM_WHATSAPP =
  "Olá! Gostaria de entrar em contato com a equipe Synter.";

const LINK_WHATSAPP =
  "https://wa.me/554991664297?text=" +
  encodeURIComponent(MENSAGEM_WHATSAPP);

// ==========================================
// FOOTER — UNIVERSIDADE SYNTER
// ==========================================

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* ===================================
            MARCA SYNTER
        =================================== */}

        <div className="footer-brand">

          <img
            src={logo}
            alt="Synter"
            className="footer-logo"
          />

          <div className="footer-divider" />

          <p>
            Tecnologia que abre novas possibilidades.
          </p>

        </div>

        {/* ===================================
            LINKS E REDES SOCIAIS
        =================================== */}

        <div className="footer-center">

          {/* LINKS */}

          <div className="footer-links">

            <a href="#">
              Termos de Uso
            </a>

            <span>|</span>

            <a href="#">
              Política de Privacidade
            </a>

          </div>

          {/* REDES SOCIAIS */}

          <div className="footer-social">

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

        </div>

        {/* ===================================
            CONTATO — WHATSAPP
        =================================== */}

        <a
          href={LINK_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-contact"
          aria-label={`Falar com a Synter pelo WhatsApp: ${TELEFONE_SYNTER}`}
          title="Conversar com a Synter no WhatsApp"
        >

          <span className="footer-phone-icon">
            <Call />
          </span>

          <div className="footer-contact-info">

            <p>
              {TELEFONE_SYNTER}
            </p>

            <strong>
              Fale Conosco
            </strong>

          </div>

        </a>

      </div>

      {/* =====================================
          PARTE INFERIOR
      ===================================== */}

      <div className="footer-bottom">

        <span>
          © {new Date().getFullYear()} Synter.
          Todos os direitos reservados.
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
  );
}

export default Footer;
