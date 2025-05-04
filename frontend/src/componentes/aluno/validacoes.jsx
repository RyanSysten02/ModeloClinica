export const validarCPF = (cpf) => {
    const regexCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpf) return false;

    // Remove caracteres não numéricos
    const cpfNumerico = cpf.replace(/\D/g, '');

    // Verifica se o CPF tem 11 dígitos e não é uma sequência repetida
    if (cpfNumerico.length !== 11 || /^(\d)\1{10}$/.test(cpfNumerico)) {
        return false;
    }

    // Validação dos dígitos verificadores
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpfNumerico[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNumerico[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpfNumerico[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNumerico[10])) return false;

    return true;
};

// Máscara de CPF
export const aplicarMascaraCPF = (cpf) => {
    const cpfNumerico = cpf.replace(/\D/g, '');
    return cpfNumerico
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{2})$/, '$1-$2');
};

// Validação de Telefone
export const validarTelefone = (telefone) => {
    const regexTelefone = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    return regexTelefone.test(telefone);
};

// Máscara de Telefone
export const aplicarMascaraTelefone = (telefone) => {
    const telefoneNumerico = telefone.replace(/\D/g, '');
    if (telefoneNumerico.length <= 10) {
        // Formato: (XX) XXXX-XXXX
        return telefoneNumerico
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
        // Formato: (XX) XXXXX-XXXX
        return telefoneNumerico
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
    }
};

// Validação de E-mail
export const validarEmail = (email) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
};