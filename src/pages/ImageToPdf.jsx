import { useRef, useState } from "react";
import { jsPDF } from "jspdf";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/ImageToPdf.css";


function ImageToPdf() {

    const inputRef = useRef(null);

    const [imagens, setImagens] = useState([]);
    const [profileOpen, setProfileOpen] = useState(false);
    const [gerando, setGerando] = useState(false);


    // ==========================================
    // ADICIONAR IMAGENS
    // ==========================================

    function adicionarImagens(evento) {

        const arquivos = Array.from(
            evento.target.files || []
        );

        const arquivosValidos = arquivos.filter(
            (arquivo) =>
                arquivo.type.startsWith("image/")
        );


        const novasImagens = arquivosValidos.map(
            (arquivo) => ({
                id:
                    crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random()}`,

                arquivo,

                nome: arquivo.name,

                preview:
                    URL.createObjectURL(arquivo)
            })
        );


        setImagens(
            (estadoAtual) => [
                ...estadoAtual,
                ...novasImagens
            ]
        );


        evento.target.value = "";
    }


    // ==========================================
    // REMOVER UMA IMAGEM
    // ==========================================

    function removerImagem(id) {

        setImagens((estadoAtual) => {

            const imagemRemovida =
                estadoAtual.find(
                    (imagem) =>
                        imagem.id === id
                );


            if (imagemRemovida) {
                URL.revokeObjectURL(
                    imagemRemovida.preview
                );
            }


            return estadoAtual.filter(
                (imagem) =>
                    imagem.id !== id
            );

        });

    }


    // ==========================================
    // LIMPAR TODAS
    // ==========================================

    function limparImagens() {

        imagens.forEach((imagem) => {
            URL.revokeObjectURL(
                imagem.preview
            );
        });


        setImagens([]);
    }


    // ==========================================
    // CONVERTER ARQUIVO PARA DATA URL
    // ==========================================

    function arquivoParaDataURL(arquivo) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();


                reader.onload = () => {
                    resolve(reader.result);
                };


                reader.onerror = reject;


                reader.readAsDataURL(
                    arquivo
                );

            }
        );

    }


    // ==========================================
    // CARREGAR IMAGEM
    // ==========================================

    function carregarImagem(src) {

        return new Promise(
            (resolve, reject) => {

                const imagem =
                    new Image();


                imagem.onload = () => {
                    resolve(imagem);
                };


                imagem.onerror = reject;


                imagem.src = src;

            }
        );

    }


    // ==========================================
    // CONVERTER IMAGEM PARA JPEG
    // ==========================================

    async function imagemParaJpeg(arquivo) {

        const dataUrl =
            await arquivoParaDataURL(
                arquivo
            );


        const imagem =
            await carregarImagem(
                dataUrl
            );


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            imagem.naturalWidth;

        canvas.height =
            imagem.naturalHeight;


        const contexto =
            canvas.getContext("2d");


        // Fundo branco para imagens PNG
        // com transparência

        contexto.fillStyle =
            "#ffffff";

        contexto.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        contexto.drawImage(
            imagem,
            0,
            0
        );


        return {
            data:
                canvas.toDataURL(
                    "image/jpeg",
                    0.95
                ),

            largura:
                imagem.naturalWidth,

            altura:
                imagem.naturalHeight
        };

    }


    // ==========================================
    // GERAR PDF
    // ==========================================

    async function gerarPdf() {

        if (imagens.length === 0) {
            return;
        }


        try {

            setGerando(true);


            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });


            const larguraPagina =
                pdf.internal.pageSize.getWidth();

            const alturaPagina =
                pdf.internal.pageSize.getHeight();


            const margem = 10;


            const larguraDisponivel =
                larguraPagina -
                margem * 2;

            const alturaDisponivel =
                alturaPagina -
                margem * 2;


            for (
                let index = 0;
                index < imagens.length;
                index++
            ) {

                const imagem =
                    imagens[index];


                const imagemConvertida =
                    await imagemParaJpeg(
                        imagem.arquivo
                    );


                if (index > 0) {
                    pdf.addPage();
                }


                const proporcaoImagem =
                    imagemConvertida.largura /
                    imagemConvertida.altura;


                const proporcaoPagina =
                    larguraDisponivel /
                    alturaDisponivel;


                let larguraFinal;
                let alturaFinal;


                if (
                    proporcaoImagem >
                    proporcaoPagina
                ) {

                    larguraFinal =
                        larguraDisponivel;

                    alturaFinal =
                        larguraDisponivel /
                        proporcaoImagem;

                } else {

                    alturaFinal =
                        alturaDisponivel;

                    larguraFinal =
                        alturaDisponivel *
                        proporcaoImagem;

                }


                const posicaoX =
                    (
                        larguraPagina -
                        larguraFinal
                    ) / 2;


                const posicaoY =
                    (
                        alturaPagina -
                        alturaFinal
                    ) / 2;


                pdf.addImage(
                    imagemConvertida.data,
                    "JPEG",
                    posicaoX,
                    posicaoY,
                    larguraFinal,
                    alturaFinal,
                    undefined,
                    "FAST"
                );

            }


            pdf.save(
                "imagens-convertidas.pdf"
            );

        } catch (erro) {

            console.error(
                "Erro ao gerar PDF:",
                erro
            );


            alert(
                "Não foi possível gerar o PDF."
            );

        } finally {

            setGerando(false);

        }

    }


    return (

        <div className="image-pdf-page">


            {/* ================================= */}
            {/* HEADER                            */}
            {/* ================================= */}

            <Header />


            {/* ================================= */}
            {/* HERO                              */}
            {/* ================================= */}

            <section className="image-pdf-hero-area">


                <div className="image-pdf-profile">

                    <UserProfileButton
                        onClick={() =>
                            setProfileOpen(true)
                        }
                    />

                </div>


                <div className="image-pdf-hero-content">

                    <Hero
                        variant="dashboard"
                        one="Ferramentas"
                        two="Converter Imagem em PDF"
                        three="Transforme imagens em um documento PDF de forma rápida, organizada e segura."
                    />

                </div>


            </section>


            {/* ================================= */}
            {/* CONTEÚDO                          */}
            {/* ================================= */}

            <main className="image-pdf-content">


                {/* TÍTULO */}

                <div className="image-pdf-section-title">

                    <div className="image-pdf-section-bar"></div>

                    <h4>
                        CONVERSOR DE IMAGENS
                    </h4>

                </div>


                {/* ================================= */}
                {/* UPLOAD                            */}
                {/* ================================= */}

                <section className="image-pdf-upload">


                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        multiple
                        onChange={adicionarImagens}
                        hidden
                    />


                    <div
                        className="image-pdf-upload-box"
                        onClick={() =>
                            inputRef.current?.click()
                        }
                    >

                        <div className="image-pdf-upload-icon">
                            +
                        </div>


                        <h2>
                            Selecione suas imagens
                        </h2>


                        <p>
                            Clique para selecionar uma ou várias imagens.
                        </p>


                        <span>
                            JPG, JPEG, PNG ou WEBP
                        </span>


                        <button
                            type="button"
                            onClick={(evento) => {

                                evento.stopPropagation();

                                inputRef.current?.click();

                            }}
                        >
                            Selecionar imagens
                        </button>

                    </div>


                </section>


                {/* ================================= */}
                {/* IMAGENS SELECIONADAS              */}
                {/* ================================= */}

                {imagens.length > 0 && (

                    <section className="image-pdf-selected">


                        <div className="image-pdf-selected-header">


                            <div>

                                <h3>
                                    Imagens selecionadas
                                </h3>

                                <p>
                                    {imagens.length}{" "}
                                    {imagens.length === 1
                                        ? "imagem"
                                        : "imagens"}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="image-pdf-clear"
                                onClick={limparImagens}
                            >
                                Limpar tudo
                            </button>


                        </div>


                        {/* GRID */}

                        <div className="image-pdf-grid">

                            {imagens.map(
                                (
                                    imagem,
                                    index
                                ) => (

                                    <div
                                        className="image-pdf-card"
                                        key={imagem.id}
                                    >


                                        <div className="image-pdf-preview">

                                            <img
                                                src={imagem.preview}
                                                alt={imagem.nome}
                                            />


                                            <span className="image-pdf-number">
                                                {index + 1}
                                            </span>


                                            <button
                                                type="button"
                                                className="image-pdf-remove"
                                                onClick={() =>
                                                    removerImagem(
                                                        imagem.id
                                                    )
                                                }
                                                aria-label="Remover imagem"
                                            >
                                                ×
                                            </button>

                                        </div>


                                        <div className="image-pdf-card-info">

                                            <strong>
                                                {imagem.nome}
                                            </strong>

                                            <span>
                                                {(
                                                    imagem.arquivo.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)} MB
                                            </span>

                                        </div>


                                    </div>

                                )
                            )}

                        </div>


                        {/* ================================= */}
                        {/* GERAR PDF                         */}
                        {/* ================================= */}

                        <div className="image-pdf-actions">


                            <button
                                type="button"
                                className="image-pdf-add"
                                onClick={() =>
                                    inputRef.current?.click()
                                }
                            >
                                + Adicionar imagens
                            </button>


                            <button
                                type="button"
                                className="image-pdf-generate"
                                onClick={gerarPdf}
                                disabled={gerando}
                            >

                                {gerando
                                    ? "Gerando PDF..."
                                    : "Gerar PDF"}

                            </button>


                        </div>


                    </section>

                )}


            </main>


            <Footer />


            {/* ================================= */}
            {/* PERFIL                            */}
            {/* ================================= */}

            {profileOpen && (

                <Profile
                    onClose={() =>
                        setProfileOpen(false)
                    }
                />

            )}


        </div>

    );

}


export default ImageToPdf;