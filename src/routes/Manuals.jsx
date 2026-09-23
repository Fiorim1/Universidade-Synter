import { useState } from "react"

import Header from "../components/Header"
import UserProfileButton from "../components/UserProfileButton"
import Profile from "../components/Profile"
import Hero from "../components/Hero"
import CardsDashboard from "../components/CardsDashboard"
import Footer from "../components/Footer"

import "../styles/Dashboard.css"
import "../styles/Videos.css"

// Importando imagens de produtos digitais
import VENUSS2 from "../assets/venuss2pro.png"
import VENUS3 from "../assets/venuss3.png"
import VEGAFACEID from "../assets/vegafaceid.png"
import SYRIUSS3PRO from "../assets/syriuss3pro.png"
import SYRIUSS3MAX from "../assets/syriuss3max.png"
import SYRIUSS2PRONEO from "../assets/syriuss2proneo.png"
import LYRAPRO from "../assets/lyrapro.png"
import ERISS2FACEID from "../assets/eriss2faceid.png"
import S2QR from "../assets/s2qr.png"
import S2PRO from "../assets/s2pro.png"
import S2FACEID from "../assets/s2faceid.png"
import MARSIMG from "../assets/mars.png"
import NEXUSIMG from "../assets/nexuss1.png"
import SYRIUSS2PRO from "../assets/SYRIUSS2PRO.png"
import SYRIUSS1 from "../assets/syriuss1.png"
import SYRIUSS2MAX from "../assets/syriuss2max.png"
import DALASS2PRO from "../assets/dallas2pro.png"
import DALASS3PRO from "../assets/dallass3pro.png"
import DOMOUSS1 from "../assets/domuss1.png"

// Importando imagens de produtos mecânicos
import STILLUS from "../assets/stillus.png"
import STARMAX from "../assets/starmax.png"
import STAR from "../assets/star.png"
import POLOMAX from "../assets/polomax.png"
import OLYMPIA from "../assets/olympia.png"
import NAVISII from "../assets/navisii.png"
import NAVIS from "../assets/navis.png"
import MARINEII from "../assets/marineii.png"
import MARINE from "../assets/marine.png"
import LUCK from "../assets/luck.png"
import GOL from "../assets/gol.png"
import GLORIAN from "../assets/glorian.png"
import CRISPUSMAX from "../assets/crispusmax.png"
import CHAMPION from "../assets/champion.png"
import CECI from "../assets/ceci.png"
import ACQUAMAX from "../assets/acquamax.png"
import BARRAAPOIO from "../assets/barraapoio.png"
import FECPCORRER from "../assets/fecpcorrer.png"
import FECIPCORRER from "../assets/fecipcorrer.png"
import FECPC from "../assets/fecpc.png"
import CHAVED from "../assets/chaved.png"
import FECROLETE from "../assets/fecrolete.png"

// Importando imagens de ferragens
import F1 from "../assets/f1.png"
import F2 from "../assets/f2.png"
import F3 from "../assets/f3.png"
import F4 from "../assets/f4.png"
import F5 from "../assets/f5.png"
import F6 from "../assets/f6.png"
import F7 from "../assets/f7.png"
import F8 from "../assets/f8.png"
import F9 from "../assets/f9.png"
import F10 from "../assets/f10.png"
import F11 from "../assets/f11.png"
import F12 from "../assets/f12.png"
import F13 from "../assets/f13.png"
import F14 from "../assets/f14.png"
import F15 from "../assets/f15.png"
import F16 from "../assets/f16.png"
import F17 from "../assets/f17.png"
import F18 from "../assets/f18.png"
import F19 from "../assets/f19.png"
import F20 from "../assets/f20.png"
import F21 from "../assets/f21.png"
import F22 from "../assets/f22.png"
import F23 from "../assets/f23.png"
import F24 from "../assets/f24.png"
import F25 from "../assets/f25.png"
import F26 from "../assets/f26.png"
import F27 from "../assets/f27.png"
import F28 from "../assets/f28.png"

// Importando os PDFs
import VENUSS3PRO from "../assets/MANUAL_VENUS_S3_PRO.pdf"
import VENUSS2PRO from "../assets/MANUAL_VENUS_S2_PRO.pdf"
import MARS from "../assets/MANUAL_MARS.pdf"
import NEXUS from "../assets/MANUAL_NEXUS.pdf"
import VEGA from "../assets/MANUAL_VEGA.pdf"
import SYRIUSS2PROPDF from "../assets/MANUAL_SYRIUS_S2_PRO.pdf"
import SYRIUSS3MAXPDF from "../assets/MANUAL_SYRIUS_S3_MAX.pdf"
import SYRIUSS3PROPDF from "../assets/MANUAL_SYRIUS_S3_PRO.pdf"
import SYRIUSS1PRO from "../assets/MANUAL_SYRIUS_S1.pdf"
import SYRIUSS2MAXPDF from "../assets/MANUAL_SYRIUS_S2_MAX.pdf"
import SYRIUSS2PRONEOPDF from "../assets/MANUAL_SYRIUS_S2_PRO_NEO.pdf"
import DALLASS2PROPDF from "../assets/MANUAL_DALLAS_S2_PRO.pdf"
import DALLASS3PROPDF from "../assets/MANUAL_DALLAS_S3_PRO.pdf"
import DOMUSS1PDF from "../assets/MANUAL_DOMUS_S1_E_DOMUS_S1_PRO.pdf"
import ERISPDF from "../assets/MANUAL_ERIS_S2_FACE_ID.pdf"
import LYRAPDF from "../assets/MANUAL_LYRA_PRO.pdf"
import QRPDF from "../assets/MANUAL_CONTROLADORA_DE_ACESSO_S2_PRO_QR.pdf"
import FACEIDPDF from "../assets/MANUAL_DE_INSTALAÇÃO_CONTROLADORA_DE_ACESSO_FACE_ID.pdf"
import PROS2PDF from "../assets/PROS2.pdf"
import MECPDF from "../assets/MANUAL_FECHADURAS_MECÂNICAS_2026.png"

function Manuals() {

    // Controla a abertura do modal de perfil
    const [profileOpen, setProfileOpen] = useState(false)

    return (

        <>

            <Header />


            {/* HERO */}

            <section className="videos-hero-area">

                <div className="videos-profile">

                    <UserProfileButton
                        onClick={() => setProfileOpen(true)}
                    />

                </div>


                <div className="videos-hero-content">

                    <Hero
                        variant="dashboard"
                        one="Conteúdo em Vídeo"
                        two="Vídeos Educativos"
                        three="Aprenda através de vídeos práticos sobre instalação, configuração e utilização dos produtos Synter."
                    />

                </div>

            </section>


            <div>

                <div className="manuals-container">

                    <div className="digials-products">

                        <div className="title">
                            <h4>Produtos Digitais</h4>
                        </div>
                        <div className="line"></div>

                        <div className="cards-manuals">
                            <div className="cards-manuals-1">
                                <CardsDashboard
                                    image={VENUS3}
                                    title="Venus S3 PRO"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={VENUSS3PRO} />
                                <CardsDashboard
                                    image={VENUSS2}
                                    title="Venus S2 PRO"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={VENUSS2PRO} />
                                <CardsDashboard
                                    image={SYRIUSS1}
                                    title="Syrius S1"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={SYRIUSS1PRO} />
                                <CardsDashboard
                                    image={SYRIUSS1}
                                    title="Syrius S1 Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={SYRIUSS1PRO} />


                            </div>
                            <div className="cards-manuals-2">
                                <CardsDashboard
                                    image={SYRIUSS2PRO}
                                    title="Syrius S2 Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={SYRIUSS2PROPDF} />
                                <CardsDashboard
                                    image={SYRIUSS2PRONEO}
                                    title="Syrius S2 Pro Neo"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={SYRIUSS2PRONEOPDF} />
                                <CardsDashboard
                                    image={SYRIUSS2MAX}
                                    title="Syrius S2 Max"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={SYRIUSS2MAXPDF} />
                                <CardsDashboard
                                    image={SYRIUSS3PRO}
                                    title="Syrius S3 Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={SYRIUSS3PROPDF} />

                            </div>
                            <div className="cards-manuals-3">
                                <CardsDashboard
                                    image={SYRIUSS3MAX}
                                    title="Syrius S3 Max"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={SYRIUSS3MAXPDF} />
                                <CardsDashboard
                                    image={ERISS2FACEID}
                                    title="Eris S2 Face Id"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={ERISPDF} />
                                <CardsDashboard
                                    image={VEGAFACEID}
                                    title="Vega Face Id"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={VEGA} />
                                <CardsDashboard
                                    image={MARSIMG}
                                    title="Mars S2 Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MARS} />



                            </div>
                            <div className="cards-manuals-4">
                                <CardsDashboard
                                    image={NEXUSIMG}
                                    title="Nexus S1"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={NEXUS} />
                                <CardsDashboard
                                    image={NEXUSIMG}
                                    title="Nexus S1 Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={NEXUS} />
                                <CardsDashboard
                                    image={DALASS2PRO}
                                    title="Dallas S2 Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={DALLASS2PROPDF} />
                                <CardsDashboard
                                    image={DALASS3PRO}
                                    title="Dallas S3 Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={DALLASS3PROPDF} />

                            </div>

                            <div className="cards-manuals-5">
                                <CardsDashboard
                                    image={DOMOUSS1}
                                    title="Domus S1"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={DOMUSS1PDF} />
                                <CardsDashboard
                                    image={DOMOUSS1}
                                    title="Domus S1 Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={DOMUSS1PDF} />
                                <CardsDashboard
                                    image={LYRAPRO}
                                    title="Lyra Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={LYRAPDF} />

                                <CardsDashboard
                                    image={S2PRO}
                                    title="Controladora de Acesso S2 Pro"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={PROS2PDF}
                                />
                            </div>
                            <div className="cards-manuals-6">

                                <CardsDashboard
                                    image={S2QR}
                                    title="Controladora de Acesso S2 QR"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={QRPDF} />
                                <CardsDashboard
                                    image={S2FACEID}
                                    title="Controladora de Acesso S2 Face Id"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={FACEIDPDF} />
                            </div>
                        </div>
                    </div>

                    <div className="mechanical-products">
                        <div className="title">
                            <h4>Produtos Mecânicos</h4>
                        </div>
                        <div className="line"></div>

                        <div className="cards-manuals">
                            <div className="cards-manuals-1">
                                <CardsDashboard
                                    image={STILLUS}
                                    title="Stillus"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={STARMAX}
                                    title="Star Max"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={STAR}
                                    title="Star"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={POLOMAX}
                                    title="Polo Max"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                            </div>
                            <div className="cards-manuals-2">
                                <CardsDashboard
                                    image={OLYMPIA}
                                    title="Olympia"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF}
                                />
                                <CardsDashboard
                                    image={NAVISII}
                                    title="Navis II"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF}
                                />
                                <CardsDashboard
                                    image={NAVIS}
                                    title="Navis"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={MARINEII}
                                    title="Marine II"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                            </div>
                            <div className="cards-manuals-3">
                                <CardsDashboard
                                    image={MARINE}
                                    title="Marine"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={LUCK}
                                    title="Luck"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={GOL}
                                    title="Gol"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={GLORIAN}
                                    title="Glorian"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                            </div>
                            <div className="cards-manuals-4">
                                <CardsDashboard
                                    image={CRISPUSMAX}
                                    title="Crispus Max"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={CHAMPION}
                                    title="Champion"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={CECI}
                                    title="Ceci"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                                <CardsDashboard
                                    image={ACQUAMAX}
                                    title="Acqua Max"
                                    desc="Clique aqui para baixar o manual!"
                                    pdf={MECPDF} />
                            </div>
                            <div className="cards-manuals-5">
                                <CardsDashboard
                                    image={BARRAAPOIO}
                                    title="Barra de Apoio"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={FECPCORRER}
                                    title="Fechadura de Banheiro para Porta de Correr "
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={FECIPCORRER}
                                    title="Fechadura Interna para Porta de Correr "
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={FECPC}
                                    title="Fechadura para Porta de Correr"
                                    desc="Clique aqui para baixar o manual!" />
                            </div>
                            <div className="cards-manuals-6">
                                <CardsDashboard
                                    image={CHAVED}
                                    title="Fechadura Porta de Correr c/ Chave Dobrável e Concha"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={FECROLETE}
                                    title="Fechadura Rolete "
                                    desc="Clique aqui para baixar o manual!" />
                            </div>
                        </div>
                    </div>

                    <div className="ironwork">
                        <div className="title">
                            <h4>Ferragens</h4>
                        </div>
                        <div className="line"></div>

                        <div className="cards-manuals">
                            <div className="cards-manuals-1">
                                <CardsDashboard
                                    image={F1}
                                    title="Prendedor para Porta Magnético (fixação no piso)"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F2}
                                    title="Prendedor para Porta Magnético (fixação no piso ou parede)"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F3}
                                    title="Porta Cadeado"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F4}
                                    title="Números (fixação com parafuso)"
                                    desc="Clique aqui para baixar o manual!" />
                            </div>
                            <div className="cards-manuals-2">
                                <CardsDashboard
                                    image={F5}
                                    title="Números (fixação com dupla face)"
                                    desc="Clique aqui para baixar o manual!"
                                />
                                <CardsDashboard
                                    image={F6}
                                    title="Levantador de Guilhotina"
                                    desc="Clique aqui para baixar o manual!"
                                />
                                <CardsDashboard
                                    image={F7}
                                    title="Gancho de Rede"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F8}
                                    title="Fecho Porta Cadeado"
                                    desc="Clique aqui para baixar o manual!" />
                            </div>
                            <div className="cards-manuals-3">
                                <CardsDashboard
                                    image={F9}
                                    title="Fecho Pino Bola"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F10}
                                    title="Fecho para Janela de Correr"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F11}
                                    title="Fecho Fio Redondo"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F12}
                                    title="Fecho Fio Chato"
                                    desc="Clique aqui para baixar o manual!" />
                            </div>
                            <div className="cards-manuals-4">
                                <CardsDashboard
                                    image={F13}
                                    title="Fecho Concha Trava"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F14}
                                    title="Cremona"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F15}
                                    title="Concha Stand com Furo"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F16}
                                    title="Concha Stand"
                                    desc="Clique aqui para baixar o manual!" />
                            </div>
                            <div className="cards-manuals-5">
                                <CardsDashboard
                                    image={F17}
                                    title="Borboleta para Guilhotina"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F18}
                                    title="Amortecedor de Porta (fixação no piso)"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F19}
                                    title="Alça"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F20}
                                    title="Quartzo"
                                    desc="Clique aqui para baixar o manual!" />
                            </div>
                            <div className="cards-manuals-6">
                                <CardsDashboard
                                    image={F21}
                                    title="Opala"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F22}
                                    title="Jaspe (com furo)"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F23}
                                    title="Jaspe"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F24}
                                    title="Jade Max"
                                    desc="Clique aqui para baixar o manual!" />
                            </div>
                            <div className="cards-manuals-7">
                                <CardsDashboard
                                    image={F25}
                                    title="Jade"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F26}
                                    title="Vara de Cremona"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F27}
                                    title="Tarjeta"
                                    desc="Clique aqui para baixar o manual!" />
                                <CardsDashboard
                                    image={F28}
                                    title="Prendedor para Veneziana"
                                    desc="Clique aqui para baixar o manual!" />
                            </div>
                        </div>
                    </div>

                </div>

            </div>


            <Footer />


            {/* Modal do perfil */}
            {profileOpen && (

                <Profile
                    onClose={() => setProfileOpen(false)}
                />

            )}

        </>

    )

}

export default Manuals