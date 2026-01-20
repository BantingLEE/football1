export const sanitize = (html: string): string => {
  return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, '')
    .replace(/\s+on\w+="[^"]*"/gim, '')
}
export default { sanitize }
