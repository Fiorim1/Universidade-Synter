import { useAuth } from "../context/AuthContext"

import "../styles/Profile.css"


function Profile({ onClose }) {

    // Recupera o usuário autenticado
    const { user, logout } = useAuth()


    return (

        // Fundo que cobre toda a tela
        // Ao clicar fora do card, fecha o perfil
        <div
            className="profile-overlay"
            onClick={onClose}
        >

            {/* Card do perfil */}
            <div
                className="profile-modal"

                // Impede que o clique dentro do card
                // feche o modal
                onClick={(e) => e.stopPropagation()}
            >

                {/* Botão para fechar */}
                <button
                    className="profile-close"
                    type="button"
                    onClick={onClose}
                >
                    ×
                </button>


                <h1>Meu Perfil</h1>


                <div className="profile-info">

                    <p>
                        <strong>Nome:</strong>{" "}
                        {user?.user_metadata?.full_name}
                    </p>

                    <p>
                        <strong>E-mail:</strong>{" "}
                        {user?.email}
                    </p>

                </div>


                <button
                    className="profile-logout"
                    type="button"
                    onClick={logout}
                >
                    Sair da Conta
                </button>

            </div>

        </div>

    )

}

export default Profile