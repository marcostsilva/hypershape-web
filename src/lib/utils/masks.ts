/**
 * Aplica máscara de CNPJ (00.000.000/0000-00)
 */
export function maskCNPJ(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

/**
 * Aplica máscara de CEP (00000-000)
 */
export function maskCEP(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1")
}

/**
 * Remove caracteres não numéricos
 */
export function unmask(value: string) {
  return value.replace(/\D/g, "")
}
