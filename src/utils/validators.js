// IMPORTANTE:
//
// Essas validações existem para melhorar a experiência
// do usuário.
//
// Elas NÃO substituem as validações e regras
// configuradas no Supabase/backend.



// ========================================
// E-MAIL
// ========================================

// Remove espaços desnecessários do e-mail
// e transforma tudo em letras minúsculas.
export function sanitizeEmail(email) {

    if (typeof email !== "string") {
        return ""
    }

    return email
        .trim()
        .toLowerCase()
}


// Valida o formato básico do e-mail.
export function validateEmail(email) {

    if (typeof email !== "string") {
        return false
    }

    const cleanEmail = sanitizeEmail(email)

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

// Limpa espaços duplicados no nome.
//
// Exemplo:
//
// "  Gabriel   Esteves  "
//
// vira:
//
// "Gabriel Esteves"
export function sanitizeName(name) {

    if (typeof name !== "string") {
        return ""
    }

    return name
        .trim()
        .replace(/\s+/g, " ")
}


// Faz uma validação básica do nome.
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

// Valida a senha antes de enviá-la ao Supabase.
//
// IMPORTANTE:
//
// A regra REAL continua sendo configurada
// em Authentication no Supabase.
export function validatePassword(password) {

    const errors = []


    if (typeof password !== "string") {

        errors.push(
            "Digite uma senha válida."
        )

        return errors
    }


    // Mesma regra mínima configurada no Supabase.
    if (password.length < 8) {

        errors.push(
            "A senha deve possuir no mínimo 8 caracteres."
        )
    }


    // Evita senhas excessivamente grandes no frontend.
    if (password.length > 128) {

        errors.push(
            "A senha deve possuir no máximo 128 caracteres."
        )
    }


    return errors
}