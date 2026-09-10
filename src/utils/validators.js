// IMPORTANTE:
//
// Essas validações existem para melhorar a experiência
// do usuário.
//
// Elas NÃO substituem as validações e regras
// configuradas no Supabase/backend.


// Remove espaços desnecessários do e-mail
// e transforma tudo em letras minúsculas.
export function sanitizeEmail(email) {

    return email.trim().toLowerCase()

}


// Valida o formato básico do e-mail.
export function validateEmail(email) {

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)

}


// Limpa espaços duplicados no nome.
//
// Exemplo:
// "  Gabriel   Esteves  "
//
// vira:
//
// "Gabriel Esteves"
export function sanitizeName(name) {

    return name
        .trim()
        .replace(/\s+/g, " ")

}


// Faz uma validação básica do nome.
export function validateName(name) {

    const cleanName = sanitizeName(name)

    return (
        cleanName.length >= 3 &&
        cleanName.length <= 100
    )

}


// Valida a senha antes de enviá-la ao Supabase.
//
// A regra REAL continua sendo configurada
// em Authentication no Supabase.
export function validatePassword(password) {

    const errors = []


    // Mesma regra mínima configurada no Supabase.
    if (password.length < 8) {

        errors.push(
            "A senha deve possuir no mínimo 8 caracteres."
        )

    }


    return errors
}