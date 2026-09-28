/**
 * @file utils.js
 * @description Utilidades compartidas para el CRM YA.
 */

/**
 * Combina nombres de clases condicionales (similar a clsx/cn).
 * @param  {...(string|boolean|undefined|null)} classes
 * @returns {string} Clases combinadas y filtradas.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formatea un valor numérico como moneda mexicana.
 * @param {number} value — Monto a formatear.
 * @returns {string} Cadena con formato $X,XXX
 */
export function formatCurrency(value) {
  return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
}

/**
 * Genera iniciales a partir de un nombre completo.
 * @param {string} name — Nombre completo.
 * @returns {string} Hasta 2 caracteres de iniciales en mayúsculas.
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Genera un color de fondo consistente basado en un string (para avatares).
 * @param {string} str — Cadena semilla.
 * @returns {string} Clase de Tailwind para bg color.
 */
export function getAvatarColor(str) {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
