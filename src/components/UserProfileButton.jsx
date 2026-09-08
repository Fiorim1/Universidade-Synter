import { useAuth } from "../context/AuthContext"

import "../styles/UserProfileButton.css"

import UserIcon from "../assets/user-icon.png"


function UserProfileButton({ onClick }) {

    const { user } = useAuth()

    const userName =
        user?.user_metadata?.full_name ||
        user?.email ||
        "Usuário"


    return (

        <button
            className="user-profile-button"
            type="button"
            onClick={onClick}
        >

            <span className="user-profile-icon">
                <img src={UserIcon} alt="Ícone de Perfil" />
            </span>

            <span>
                {userName}
            </span>

        </button>

    )

}

export default UserProfileButton