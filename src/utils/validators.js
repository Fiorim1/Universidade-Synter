// Valida se o e-mail possui um formato válido
export function validateEmail(email) {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
}


// Valida a senha
// Retorna uma lista de erros encontrados
export function validatePassword(password) {

    const errors = []

    // Verifica se possui pelo menos 8 caracteres
    if (password.length < 8) {

        errors.push(
            "A senha deve possuir no mínimo 8 caracteres."
        )

    }

    return errors
}


// Remove espaços desnecessários do e-mail
// e transforma tudo em letras minúsculas
export function sanitizeEmail(email) {

    return email.trim().toLowerCase()
}