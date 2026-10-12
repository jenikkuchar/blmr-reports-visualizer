// Zobrazovací formát čísel podle grafického manuálu (český formát, tabular-nums řeší CSS).

const NUMERIC_RE = /^-?\d+(\.\d+)?$/;

/** Celé číslo s českým oddělovačem tisíců: 3412 → „3 412“. */
export const formatInt = (value: number): string => value.toLocaleString('cs-CZ');

/** Procento z řetězce nebo čísla: "45.3" → „45,3 %“. Nečíselné hodnoty vrací beze změny. */
export const formatPercent = (value: string | number): string => {
  const str = String(value);
  if (!NUMERIC_RE.test(str)) return str;
  return `${Number(str).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} %`;
};

/** Je hodnota buňky čistě číselná (pro zarovnání vpravo)? */
export const isNumericValue = (value: string | undefined): boolean =>
  !!value && NUMERIC_RE.test(value.trim());

/** Číselná buňka v českém formátu, ostatní hodnoty beze změny. */
export const formatNumericCell = (value: string): string =>
  isNumericValue(value) ? Number(value.trim()).toLocaleString('cs-CZ') : value;
