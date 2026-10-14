// IMPORTANTE:
//
// Essas validações melhoram a experiência
// e bloqueiam entradas inválidas no frontend.
//
// Elas NÃO substituem as regras configuradas
// no Supabase/backend.

    
// ========================================
// E-MAIL
// ========================================

export function sanitizeEmail(email) {

    if (typeof email !== "string") {
        return ""
    }

    return email
        .trim()
        .toLowerCase()
}


export function validateEmail(email) {

    if (typeof email !== "string") {
        return false
    }

    const cleanEmail =
        sanitizeEmail(email)


    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/


    return (
        cleanEmail.length > 0 &&
        cleanEmail.length <= 254 &&
        emailRegex.test(cleanEmail)
    )

}


// ========================================
// NOME
// ========================================

export function sanitizeName(name) {

    if (typeof name !== "string") {
        return ""
    }


    return name
        .trim()
        .replace(/\s+/g, " ")

}


export function validateName(name) {

    const cleanName =
        sanitizeName(name)


    return (
        cleanName.length >= 3 &&
        cleanName.length <= 100
    )

}


// ========================================
// SENHA
// ========================================

export function validatePassword(password) {

    const errors = []


    if (typeof password !== "string") {

        errors.push(
            "Digite uma senha válida."
        )

        return errors
    }


    // ========================================
    // TAMANHO
    // ========================================

    if (password.length < 8) {

        errors.push(
            "A senha deve possuir no mínimo 8 caracteres."
        )

    }


    if (password.length > 128) {

        errors.push(
            "A senha deve possuir no máximo 128 caracteres."
        )

    }


    // ========================================
    // LETRA MAIÚSCULA
    // ========================================

    if (!/[A-Z]/.test(password)) {

        errors.push(
            "A senha deve possuir pelo menos uma letra maiúscula."
        )

    }


    // ========================================
    // LETRA MINÚSCULA
    // ========================================

    if (!/[a-z]/.test(password)) {

        errors.push(
            "A senha deve possuir pelo menos uma letra minúscula."
        )

    }


    // ========================================
    // NÚMERO
    // ========================================

    if (!/[0-9]/.test(password)) {

        errors.push(
            "A senha deve possuir pelo menos um número."
        )

    }


    // ========================================
    // CARACTERE ESPECIAL
    // ========================================

    if (!/[^A-Za-z0-9]/.test(password)) {

        errors.push(
            "A senha deve possuir pelo menos um caractere especial."
        )

    }


    return errors

}