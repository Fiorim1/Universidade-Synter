import { useState } from "react"

import Header from "../components/Header"
import UserProfileButton from "../components/UserProfileButton"
import Profile from "../components/Profile"
import Hero from "../components/Hero"
import CardsDashboard from "../components/CardsDashboard"
import Footer from "../components/Footer"

import "../styles/Manuals.css"

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

// Fichas técnicas originais da fechadura Navis
import navisPdf0155 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_01_55mm.pdf"
import navisPdf0440 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_04_40mm.pdf"
import navisPdf0455 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_04_55mm.pdf"
import navisPdf0740 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_07_40mm.pdf"
import navisPdf0755 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_07_55mm.pdf"
import navisPdf0955 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_09_55mm.pdf"

const FICHAS_NAVIS = {
    "01": { "55": navisPdf0155 },
    "04": { "40": navisPdf0440, "55": navisPdf0455 },
    "07": { "40": navisPdf0740, "55": navisPdf0755 },
    "09": { "55": navisPdf0955 },
}


function FichaTec() {

    // Controla a abertura do modal de perfil
    const [profileOpen, setProfileOpen] = useState(false)
    const [navisModalOpen, setNavisModalOpen] = useState(false)
    const [navisRoseta, setNavisRoseta] = useState("")
    const [navisMaquina, setNavisMaquina] = useState("")

    const navisPdfSelecionado = FICHAS_NAVIS[navisRoseta]?.[navisMaquina] || null

    function abrirFichasNavis() {
        setNavisRoseta("")
        setNavisMaquina("")
        setNavisModalOpen(true)
    }

    function fecharFichasNavis() {
        setNavisModalOpen(false)
        setNavisRoseta("")
        setNavisMaquina("")
    }

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
                        one="Central de Documentação"
                        two="Fichas Técnicas"
                        three="Consulte e baixe as fichas técnicas e especificações dos produtos Synter."
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
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={VENUSS2}
                                    title="Venus S2 PRO"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={SYRIUSS1}
                                    title="Syrius S1"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={SYRIUSS1}
                                    title="Syrius S1 Pro"
                                    desc="Ficha técnica em breve"

                                />

                            </div>

                            <div className="cards-manuals-2">

                                <CardsDashboard
                                    image={SYRIUSS2PRO}
                                    title="Syrius S2 Pro"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={SYRIUSS2PRONEO}
                                    title="Syrius S2 Pro Neo"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={SYRIUSS2MAX}
                                    title="Syrius S2 Max"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={SYRIUSS3PRO}
                                    title="Syrius S3 Pro"
                                    desc="Ficha técnica em breve"

                                />

                            </div>

                            <div className="cards-manuals-3">

                                <CardsDashboard
                                    image={SYRIUSS3MAX}
                                    title="Syrius S3 Max"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={ERISS2FACEID}
                                    title="Eris S2 Face Id"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={VEGAFACEID}
                                    title="Vega Face Id"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={MARSIMG}
                                    title="Mars S2 Pro"
                                    desc="Ficha técnica em breve"

                                />

                            </div>

                            <div className="cards-manuals-4">

                                <CardsDashboard
                                    image={NEXUSIMG}
                                    title="Nexus S1"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={NEXUSIMG}
                                    title="Nexus S1 Pro"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={DALASS2PRO}
                                    title="Dallas S2 Pro"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={DALASS3PRO}
                                    title="Dallas S3 Pro"
                                    desc="Ficha técnica em breve"

                                />

                            </div>

                            <div className="cards-manuals-5">

                                <CardsDashboard
                                    image={DOMOUSS1}
                                    title="Domus S1"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={DOMOUSS1}
                                    title="Domus S1 Pro"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={LYRAPRO}
                                    title="Lyra Pro"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={S2PRO}
                                    title="Controladora de Acesso S2 Pro"
                                    desc="Ficha técnica em breve"

                                />

                            </div>

                            <div className="cards-manuals-6">

                                <CardsDashboard
                                    image={S2QR}
                                    title="Controladora de Acesso S2 QR"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={S2FACEID}
                                    title="Controladora de Acesso S2 Face Id"
                                    desc="Ficha técnica em breve"

                                />

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
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={STARMAX}
                                    title="Star Max"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={STAR}
                                    title="Star"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={POLOMAX}
                                    title="Polo Max"
                                    desc="Ficha técnica em breve"

                                />

                            </div>


                            <div className="cards-manuals-2">

                                <CardsDashboard
                                    image={OLYMPIA}
                                    title="Olympia"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={NAVISII}
                                    title="Navis II"
                                    desc="Ficha técnica em breve"

                                />

                                {/* Navis: mesmo card e CSS da página original */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Escolher a ficha técnica Navis"
                                    onClickCapture={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        abrirFichasNavis()
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault()
                                            abrirFichasNavis()
                                        }
                                    }}
                                    style={{ cursor: "pointer" }}
                                >
                                    <CardsDashboard
                                        image={NAVIS}
                                        title="Navis"
                                        desc="Selecione a ficha técnica desejada"
                                    />
                                </div>

                                <CardsDashboard
                                    image={MARINEII}
                                    title="Marine II"
                                    desc="Ficha técnica em breve"

                                />

                            </div>


                            <div className="cards-manuals-3">

                                <CardsDashboard
                                    image={MARINE}
                                    title="Marine"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={LUCK}
                                    title="Luck"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={GOL}
                                    title="Gol"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={GLORIAN}
                                    title="Glorian"
                                    desc="Ficha técnica em breve"

                                />

                            </div>


                            <div className="cards-manuals-4">

                                <CardsDashboard
                                    image={CRISPUSMAX}
                                    title="Crispus Max"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={CHAMPION}
                                    title="Champion"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={CECI}
                                    title="Ceci"
                                    desc="Ficha técnica em breve"

                                />

                                <CardsDashboard
                                    image={ACQUAMAX}
                                    title="Acqua Max"
                                    desc="Ficha técnica em breve"

                                />

                            </div>


                            <div className="cards-manuals-5">

                                <CardsDashboard
                                    image={BARRAAPOIO}
                                    title="Barra de Apoio"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={FECPCORRER}
                                    title="Fechadura de Banheiro para Porta de Correr "
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={FECIPCORRER}
                                    title="Fechadura Interna para Porta de Correr "
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={FECPC}
                                    title="Fechadura para Porta de Correr"
                                    desc="Ficha técnica em breve"
                                />

                            </div>


                            <div className="cards-manuals-6">

                                <CardsDashboard
                                    image={CHAVED}
                                    title="Fechadura Porta de Correr c/ Chave Dobrável e Concha"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={FECROLETE}
                                    title="Fechadura Rolete "
                                    desc="Ficha técnica em breve"
                                />

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
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F2}
                                    title="Prendedor para Porta Magnético (fixação no piso ou parede)"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F3}
                                    title="Porta Cadeado"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F4}
                                    title="Números (fixação com parafuso)"
                                    desc="Ficha técnica em breve"
                                />

                            </div>


                            <div className="cards-manuals-2">

                                <CardsDashboard
                                    image={F5}
                                    title="Números (fixação com dupla face)"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F6}
                                    title="Levantador de Guilhotina"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F7}
                                    title="Gancho de Rede"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F8}
                                    title="Fecho Porta Cadeado"
                                    desc="Ficha técnica em breve"
                                />

                            </div>


                            <div className="cards-manuals-3">

                                <CardsDashboard
                                    image={F9}
                                    title="Fecho Pino Bola"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F10}
                                    title="Fecho para Janela de Correr"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F11}
                                    title="Fecho Fio Redondo"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F12}
                                    title="Fecho Fio Chato"
                                    desc="Ficha técnica em breve"
                                />

                            </div>


                            <div className="cards-manuals-4">

                                <CardsDashboard
                                    image={F13}
                                    title="Fecho Concha Trava"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F14}
                                    title="Cremona"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F15}
                                    title="Concha Stand com Furo"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F16}
                                    title="Concha Stand"
                                    desc="Ficha técnica em breve"
                                />

                            </div>


                            <div className="cards-manuals-5">

                                <CardsDashboard
                                    image={F17}
                                    title="Borboleta para Guilhotina"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F18}
                                    title="Amortecedor de Porta (fixação no piso)"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F19}
                                    title="Alça"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F20}
                                    title="Quartzo"
                                    desc="Ficha técnica em breve"
                                />

                            </div>


                            <div className="cards-manuals-6">

                                <CardsDashboard
                                    image={F21}
                                    title="Opala"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F22}
                                    title="Jaspe (com furo)"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F23}
                                    title="Jaspe"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F24}
                                    title="Jade Max"
                                    desc="Ficha técnica em breve"
                                />

                            </div>


                            <div className="cards-manuals-7">

                                <CardsDashboard
                                    image={F25}
                                    title="Jade"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F26}
                                    title="Vara de Cremona"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F27}
                                    title="Tarjeta"
                                    desc="Ficha técnica em breve"
                                />

                                <CardsDashboard
                                    image={F28}
                                    title="Prendedor para Veneziana"
                                    desc="Ficha técnica em breve"
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <Footer />


            {/* Seleção das fichas técnicas da Navis */}
            {navisModalOpen && (
                <div
                    role="presentation"
                    onClick={fecharFichasNavis}
                    style={{
                        position: "fixed", inset: 0, zIndex: 9999,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,.76)", backdropFilter: "blur(6px)", padding: 20
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-label="Selecionar ficha técnica Navis"
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: "100%", maxWidth: 460, padding: 26,
                            background: "#101010", color: "white",
                            border: "1px solid #333", borderRadius: 14,
                            boxShadow: "0 18px 60px rgba(0,0,0,.5)"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                            <h2 style={{ margin: 0, fontSize: 22 }}>Ficha Técnica — Navis</h2>
                            <button
                                type="button"
                                onClick={fecharFichasNavis}
                                aria-label="Fechar"
                                style={{ border: 0, background: "transparent", color: "white", fontSize: 28, cursor: "pointer" }}
                            >×</button>
                        </div>

                        <p style={{ fontSize: 14, color: "#bbb", margin: "10px 0 22px" }}>
                            Escolha a roseta e o tamanho da máquina para visualizar a ficha técnica correspondente.
                        </p>

                        <label htmlFor="navis-roseta" style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                            Tipo de roseta
                        </label>
                        <select
                            id="navis-roseta"
                            value={navisRoseta}
                            onChange={(event) => {
                                setNavisRoseta(event.target.value)
                                setNavisMaquina("")
                            }}
                            style={{ width: "100%", padding: 12, background: "#191919", color: "white", border: "1px solid #444", borderRadius: 8, marginBottom: 18 }}
                        >
                            <option value="">Selecione a roseta</option>
                            {Object.keys(FICHAS_NAVIS).map((roseta) => (
                                <option key={roseta} value={roseta}>Roseta {roseta}</option>
                            ))}
                        </select>

                        <label htmlFor="navis-maquina" style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                            Tamanho da máquina
                        </label>
                        <select
                            id="navis-maquina"
                            value={navisMaquina}
                            disabled={!navisRoseta}
                            onChange={(event) => setNavisMaquina(event.target.value)}
                            style={{ width: "100%", padding: 12, background: "#191919", color: "white", border: "1px solid #444", borderRadius: 8, marginBottom: 22, opacity: navisRoseta ? 1 : .55 }}
                        >
                            <option value="">Selecione o tamanho</option>
                            {Object.keys(FICHAS_NAVIS[navisRoseta] || {}).map((mm) => (
                                <option key={mm} value={mm}>{mm} mm</option>
                            ))}
                        </select>

                        {navisPdfSelecionado ? (
                            <a
                                href={navisPdfSelecionado}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "block", padding: 13, background: "white", color: "#111", textDecoration: "none", fontWeight: 700, textAlign: "center", borderRadius: 8 }}
                            >
                                Visualizar ficha técnica — Roseta {navisRoseta}, {navisMaquina} mm
                            </a>
                        ) : (
                            <p style={{ fontSize: 13, margin: 0, color: "#aaa" }}>
                                Selecione as duas opções para liberar o PDF.
                            </p>
                        )}
                    </section>
                </div>
            )}

            {/* Modal do perfil */}

            {profileOpen && (

                <Profile
                    onClose={() => setProfileOpen(false)}
                />

            )}

        </>

    )

}

export default FichaTec