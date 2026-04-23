export const formatCurrencyCLP = (amount: number): string => {
  return `$${amount.toLocaleString('es-CL')}`;
};