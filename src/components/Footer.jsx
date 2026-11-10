
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Call } from "reicon-react";

import "../styles/Footer.css";
import "../styles/FooterLegal.css";

import logo from "../assets/logo-synter.png";
import instagramIcon from "../assets/icone-instagram.png";
import linkedinIcon from "../assets/icone-linkedin.png";
import youtubeIcon from "../assets/icone-youtube.png";

// ==========================================
// UNIVERSIDADE SYNTER
// DADOS E DOCUMENTOS INSTITUCIONAIS
// ==========================================

const EMPRESA = "Synter Indústria e Comércio Ltda.";
const CNPJ = "82.996.216/0001-13";
const EMAIL = "ti@synter.com.br";
const ATUALIZACAO = "09/11/2026";

const termos = [
  {
    titulo: "1. Apresentação",
    texto: [
      "A Universidade Synter é uma plataforma digital destinada a centralizar materiais técnicos, treinamentos, conteúdos informativos e ferramentas de apoio relacionadas aos produtos e serviços Synter.",
      "Estes Termos de Uso estabelecem as condições de acesso e utilização da plataforma, observados os direitos e deveres previstos na legislação brasileira."
    ]
  },
  {
    titulo: "2. Identificação",
    texto: [
      `A plataforma é disponibilizada pela ${EMPRESA}, CNPJ ${CNPJ}.`,
      `Dúvidas relativas à plataforma e à privacidade podem ser encaminhadas para ${EMAIL}.`
    ]
  },
  {
    titulo: "3. Finalidade da plataforma",
    texto: [
      "A Universidade Synter oferece recursos profissionais, incluindo manuais, fichas técnicas, vídeos, treinamentos, materiais de marketing, tabelas de preços, orçamentos, assistência técnica, Rede de Credenciados e ferramentas com inteligência artificial.",
      "A disponibilidade de cada funcionalidade depende das configurações do sistema e das permissões concedidas ao usuário."
    ]
  },
  {
    titulo: "4. Cadastro e autenticação",
    texto: [
      "O acesso a determinadas funcionalidades exige autenticação com credenciais individuais.",
      "O usuário deve fornecer informações corretas, manter seus dados atualizados, proteger sua senha e não compartilhar sua conta com pessoas não autorizadas."
    ]
  },
  {
    titulo: "5. Perfis e permissões",
    texto: [
      "A plataforma poderá possuir diferentes perfis, incluindo representantes, equipe comercial e administradores.",
      "O usuário deverá respeitar as permissões atribuídas, sendo proibido tentar acessar, consultar ou modificar informações fora de sua autorização."
    ]
  },
  {
    titulo: "6. Informações comerciais e orçamentos",
    texto: [
      "Preços, referências, descrições, especificações e condições comerciais poderão ser atualizados.",
      "Antes de encaminhar um orçamento, o usuário deverá conferir os produtos, os valores, os descontos, os prazos e as demais informações.",
      "A elaboração de um orçamento não representa, isoladamente, confirmação de pedido, disponibilidade de estoque ou aprovação comercial definitiva."
    ]
  },
  {
    titulo: "7. Dados de clientes",
    texto: [
      "As informações de clientes utilizadas em orçamentos, propostas, atendimento e assistência técnica devem ser tratadas exclusivamente para finalidades profissionais legítimas.",
      "É proibido utilizar, copiar, divulgar ou compartilhar dados pessoais para finalidades não autorizadas ou incompatíveis com a legislação."
    ]
  },
  {
    titulo: "8. Assistente Synter",
    texto: [
      "O Assistente Synter utiliza recursos de inteligência artificial para apoiar consultas e atividades profissionais.",
      "As respostas podem conter erros, limitações ou informações desatualizadas. Informações relevantes deverão ser verificadas antes de sua utilização.",
      "O usuário não deverá enviar senhas, chaves de acesso, dados pessoais desnecessários ou informações confidenciais sem autorização adequada.",
      "Mensagens e arquivos encaminhados ao assistente poderão ser processados por serviços tecnológicos necessários ao funcionamento do recurso, de acordo com a Política de Privacidade e a implementação efetiva."
    ]
  },
  {
    titulo: "9. Rede de Credenciados",
    texto: [
      "A Rede de Credenciados permite localizar e entrar em contato com profissionais cadastrados para prestação de serviços relacionados aos produtos Synter.",
      "Os dados profissionais disponibilizados deverão observar as condições de credenciamento e a legislação de proteção de dados aplicável.",
      "As condições de contratação e de execução dos serviços deverão ser verificadas diretamente pelas partes envolvidas."
    ]
  },
  {
    titulo: "10. Propriedade intelectual",
    texto: [
      "Marcas, logotipos, imagens, documentos, materiais audiovisuais e demais conteúdos são protegidos pela legislação aplicável e pertencem aos respectivos titulares.",
      "O acesso à plataforma não concede autorização irrestrita para reprodução, modificação, distribuição ou exploração comercial dos materiais."
    ]
  },
  {
    titulo: "11. Segurança da informação",
    texto: [
      "O usuário deverá utilizar a plataforma de forma responsável, preservando a confidencialidade das informações e respeitando os mecanismos de segurança.",
      "É proibido tentar contornar controles de acesso, comprometer o funcionamento do sistema ou obter informações de terceiros sem autorização."
    ]
  },
  {
    titulo: "12. Disponibilidade e atualizações",
    texto: [
      "A plataforma poderá passar por manutenções, atualizações e interrupções temporárias por motivos técnicos, operacionais ou de segurança.",
      "Funcionalidades e procedimentos poderão ser atualizados, respeitadas as obrigações legais pertinentes."
    ]
  },
  {
    titulo: "13. Responsabilidades",
    texto: [
      "O usuário é responsável pelo uso adequado das ferramentas e pelas informações inseridas no exercício de suas atividades, observadas as circunstâncias e a legislação aplicável.",
      "A Synter permanece responsável pelas obrigações legais que lhe sejam atribuídas, inclusive em matéria de proteção de dados pessoais."
    ]
  },
  {
    titulo: "14. Privacidade",
    texto: [
      "O tratamento de dados pessoais realizado no contexto da Universidade Synter deverá observar a Lei nº 13.709/2018, conhecida como Lei Geral de Proteção de Dados Pessoais (LGPD).",
      "As informações sobre tratamento, compartilhamento e direitos dos titulares estão descritas na Política de Privacidade."
    ]
  },
  {
    titulo: "15. Alterações e contato",
    texto: [
      "Estes Termos poderão ser atualizados para refletir mudanças legais, técnicas e operacionais. A versão vigente deverá permanecer acessível aos usuários.",
      `Para esclarecimentos, entre em contato pelo e-mail ${EMAIL}.`
    ]
  }
];

const privacidade = [
  {
    titulo: "1. Compromisso com a privacidade",
    texto: [
      "A Universidade Synter reconhece a importância da privacidade e da proteção dos dados pessoais.",
      "Esta Política apresenta informações sobre as categorias de dados que podem ser tratadas, suas finalidades, compartilhamentos, conservação e os direitos previstos na Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)."
    ]
  },
  {
    titulo: "2. Identificação do responsável",
    texto: [
      `Empresa: ${EMPRESA}.`,
      `CNPJ: ${CNPJ}.`,
      `Canal para solicitações relacionadas à privacidade: ${EMAIL}.`,
      "O papel da Synter e de eventuais terceiros no tratamento dos dados será determinado conforme as responsabilidades efetivas de cada operação."
    ]
  },
  {
    titulo: "3. Dados de cadastro e autenticação",
    texto: [
      "A plataforma poderá tratar nome completo, e-mail, identificador de usuário, perfil de acesso, permissões e dados técnicos necessários à autenticação e à segurança da sessão."
    ]
  },
  {
    titulo: "4. Dados comerciais e orçamentos",
    texto: [
      "Nos orçamentos, poderão ser tratados nome ou razão social, CPF ou CNPJ, e-mail, telefone, condições comerciais, local de entrega e informações pertinentes à proposta.",
      "A coleta deverá ser limitada ao necessário para as finalidades legítimas da atividade."
    ]
  },
  {
    titulo: "5. Assistência técnica",
    texto: [
      "As atividades de suporte poderão envolver identificação do cliente, informações de contato, notas fiscais, dados de equipamentos, relatos técnicos, imagens, vídeos e documentos necessários à análise e ao acompanhamento do atendimento."
    ]
  },
  {
    titulo: "6. Rede de Credenciados",
    texto: [
      "A plataforma poderá tratar nome, WhatsApp profissional, cidade, estado, especialidades, região de atendimento e informações de situação cadastral.",
      "A divulgação dos dados deverá respeitar a base legal aplicável, as condições de publicação e as autorizações necessárias."
    ]
  },
  {
    titulo: "7. Assistente Synter e inteligência artificial",
    texto: [
      "O Assistente Synter poderá processar mensagens, imagens, arquivos, áudios e transcrições encaminhados pelos usuários para responder às solicitações.",
      "Conforme a implementação utilizada, determinados conteúdos poderão ser encaminhados a provedores tecnológicos responsáveis pelo processamento.",
      "As condições relacionadas ao armazenamento, ao uso para treinamento de modelos e ao compartilhamento dependem dos serviços e das configurações efetivamente contratados, que deverão ser verificados antes da publicação definitiva desta Política."
    ]
  },
  {
    titulo: "8. Finalidades do tratamento",
    texto: [
      "As principais finalidades incluem autenticação, controle de permissões, disponibilização de conteúdos técnicos, elaboração de orçamentos, assistência técnica, localização de credenciados, processamento de solicitações e manutenção da segurança do sistema.",
      "Os dados não deverão ser utilizados para finalidades incompatíveis com aquelas legitimamente informadas."
    ]
  },
  {
    titulo: "9. Bases legais",
    texto: [
      "Cada atividade de tratamento deverá ser fundamentada em uma hipótese legal adequada, como execução de contrato, cumprimento de obrigação legal ou regulatória, legítimo interesse quando cabível, exercício regular de direitos ou consentimento quando necessário.",
      "Nem todo tratamento depende de consentimento. A base legal deverá ser determinada conforme a finalidade e as circunstâncias de cada operação."
    ]
  },
  {
    titulo: "10. Compartilhamento com fornecedores",
    texto: [
      "A plataforma poderá utilizar fornecedores tecnológicos de autenticação, armazenamento, hospedagem, geocodificação, inteligência artificial e gestão documental.",
      "Dependendo das integrações efetivas, poderão estar envolvidos Supabase, Vercel, Geoapify, Notion e provedores de serviços de inteligência artificial.",
      "Os fornecedores efetivamente utilizados, as categorias de dados compartilhadas e as respectivas finalidades deverão ser confirmados conforme a configuração e os contratos da plataforma."
    ]
  },
  {
    titulo: "11. Transferência internacional de dados",
    texto: [
      "Alguns serviços tecnológicos poderão envolver tratamento ou armazenamento de dados fora do Brasil.",
      "Quando houver transferência internacional de dados pessoais, deverão ser observados os mecanismos e as garantias previstos na LGPD e na regulamentação da ANPD."
    ]
  },
  {
    titulo: "12. Armazenamento e conservação",
    texto: [
      "Os dados pessoais deverão ser conservados pelo período necessário ao cumprimento das finalidades do tratamento e das obrigações legais aplicáveis.",
      "Após o término do período justificável, os dados deverão ser eliminados ou anonimizados, quando cabível, ressalvadas as hipóteses legais de conservação.",
      "Os períodos específicos de retenção deverão ser definidos e documentados pela organização."
    ]
  },
  {
    titulo: "13. Segurança dos dados",
    texto: [
      "Deverão ser adotadas medidas técnicas e administrativas proporcionais aos riscos para proteger os dados pessoais contra acesso não autorizado, perda, alteração e divulgação indevida.",
      "Essas medidas deverão ser verificadas conforme a configuração real da plataforma, incluindo autenticação, permissões e segurança dos serviços utilizados."
    ]
  },
  {
    titulo: "14. Direitos dos titulares",
    texto: [
      "Os titulares poderão exercer os direitos previstos na LGPD, conforme a hipótese aplicável, incluindo confirmação de tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados, portabilidade, informações sobre compartilhamento e revogação do consentimento.",
      "O atendimento às solicitações observará os requisitos e as limitações legais, inclusive as hipóteses autorizadas de conservação de dados."
    ]
  },
  {
    titulo: "15. Exercício dos direitos",
    texto: [
      `Para solicitar acesso, correção, informações ou exercer outros direitos relacionados aos dados pessoais, envie uma mensagem para ${EMAIL}.`,
      "Poderão ser solicitadas informações proporcionais para confirmar a identidade do titular e impedir o acesso indevido aos dados de terceiros."
    ]
  },
  {
    titulo: "16. Cookies e sessões",
    texto: [
      "A plataforma poderá utilizar mecanismos de sessão e armazenamento necessários à autenticação, segurança e funcionamento dos recursos.",
      "Caso sejam utilizados mecanismos não necessários de rastreamento ou publicidade, deverão ser avaliadas suas bases legais e disponibilizadas as informações e escolhas aplicáveis."
    ]
  },
  {
    titulo: "17. Incidentes de segurança",
    texto: [
      "Incidentes que envolvam dados pessoais deverão ser avaliados conforme sua natureza, riscos e possíveis impactos.",
      "Quando puderem ocasionar risco ou dano relevante aos titulares, deverão ser observadas as obrigações de comunicação à ANPD e aos titulares, conforme a regulamentação aplicável."
    ]
  },
  {
    titulo: "18. Crianças e adolescentes",
    texto: [
      "A Universidade Synter é direcionada a atividades profissionais e não foi desenvolvida especificamente para o público infantil.",
      "Eventuais tratamentos de dados de crianças ou adolescentes deverão observar a legislação aplicável e o melhor interesse desses titulares."
    ]
  },
  {
    titulo: "19. Atualizações desta Política",
    texto: [
      "Esta Política poderá ser atualizada para refletir alterações legais, técnicas ou operacionais.",
      "A versão vigente deverá permanecer acessível na plataforma, com indicação de sua data de atualização."
    ]
  }
];

// ==========================================
// COMPONENTE DO MODAL
// ==========================================

function ModalLegal({ tipo, onClose }) {
  const documento =
    tipo === "termos"
      ? {
          titulo: "Termos de Uso",
          subtitulo: "Condições de utilização da plataforma",
          secoes: termos
        }
      : {
          titulo: "Política de Privacidade",
          subtitulo: "Privacidade e proteção de dados pessoais",
          secoes: privacidade
        };

  const fecharRef = useRef(null);
  const modalRef = useRef(null);
  const conteudoRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    const focoAnterior = document.activeElement;

    document.body.style.overflow = "hidden";
    fecharRef.current?.focus();

    function tratarTeclado(evento) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        onCloseRef.current();
      }

      if (evento.key !== "Tab" || !modalRef.current) {
        return;
      }

      const elementos = Array.from(
        modalRef.current.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      );

      if (!elementos.length) return;

      const primeiro = elementos[0];
      const ultimo = elementos[elementos.length - 1];

      if (
        evento.shiftKey &&
        document.activeElement === primeiro
      ) {
        evento.preventDefault();
        ultimo.focus();
      } else if (
        !evento.shiftKey &&
        document.activeElement === ultimo
      ) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener(
      "keydown",
      tratarTeclado
    );

    return () => {
      document.body.style.overflow = overflowAnterior;

      document.removeEventListener(
        "keydown",
        tratarTeclado
      );

      if (focoAnterior?.isConnected) {
        focoAnterior.focus();
      }
    };
  }, []);

  useEffect(() => {
    if (conteudoRef.current) {
      conteudoRef.current.scrollTop = 0;
    }
  }, [tipo]);

  return createPortal(
    <div
      className="synter-legal-overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={modalRef}
        className="synter-legal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="synter-legal-title"
        aria-describedby="synter-legal-subtitle"
      >
        <header className="synter-legal-header">
          <div
            className="synter-legal-icon"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <div className="synter-legal-heading">
            <span>UNIVERSIDADE SYNTER</span>

            <h2 id="synter-legal-title">
              {documento.titulo}
            </h2>

            <p id="synter-legal-subtitle">
              {documento.subtitulo}
            </p>
          </div>

          <button
            ref={fecharRef}
            type="button"
            className="synter-legal-close"
            onClick={onClose}
            aria-label="Fechar documento"
          >
            ×
          </button>
        </header>

        <div
          ref={conteudoRef}
          className="synter-legal-content"
          tabIndex={0}
        >
          <div className="synter-legal-meta">
            <span>Atualização: {ATUALIZACAO}</span>
            <span>Lei nº 13.709/2018 — LGPD</span>
          </div>

          {documento.secoes.map((secao) => (
            <section
              key={secao.titulo}
              className="synter-legal-section"
            >
              <h3>{secao.titulo}</h3>

              {secao.texto.map((paragrafo, indice) => (
                <p key={indice}>
                  {paragrafo}
                </p>
              ))}
            </section>
          ))}

          <div className="synter-legal-contact">
            <strong>
              Dúvidas sobre privacidade?
            </strong>

            <p>
              Entre em contato com nossa equipe
              pelo e-mail:
            </p>

            <a href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </div>
        </div>

        <div className="synter-legal-actions">
          <span>
            © {new Date().getFullYear()} Synter
          </span>

          <button
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

// ==========================================
// FOOTER PRINCIPAL
// ==========================================

export default function Footer() {
  const [documentoAberto, setDocumentoAberto] =
    useState(null);

  function fecharDocumento() {
    setDocumentoAberto(null);
  }

  return (
    <>
      <footer className="footer">
        <div className="footer-container">

          {/* LOGO E DESCRIÇÃO */}

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

          {/* TERMOS, PRIVACIDADE E REDES */}

          <div className="footer-center">
            <div className="footer-links">

              <button
                type="button"
                className="footer-legal-link"
                onClick={() =>
                  setDocumentoAberto("termos")
                }
              >
                Termos de Uso
              </button>

              <span aria-hidden="true">|</span>

              <button
                type="button"
                className="footer-legal-link"
                onClick={() =>
                  setDocumentoAberto("privacidade")
                }
              >
                Política de Privacidade
              </button>

            </div>

            <div className="footer-social">

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

          {/* WHATSAPP */}

          <a
            href="https://wa.me/554991664297"
            className="footer-contact footer-whatsapp-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Conversar com a Synter pelo WhatsApp"
          >
            <span className="footer-phone-icon">
              <Call />
            </span>

            <div>
              <p>+55 49 9166-4297</p>
              <strong>Fale Conosco</strong>
            </div>
          </a>

        </div>

        {/* PARTE INFERIOR */}

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

      {/* MODAL DE DOCUMENTO */}

      {documentoAberto && (
        <ModalLegal
          tipo={documentoAberto}
          onClose={fecharDocumento}
        />
      )}
    </>
  );
}
