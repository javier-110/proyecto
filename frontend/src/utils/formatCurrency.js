export const formatCurrency = (value, settings) => {
    if (value === null || value === undefined) return '';

    const symbol = settings?.moneda_simbolo || '$';
    // const code = settings?.moneda_codigo || 'CLP'; // Not typically used in display string, mostly for logic
    const decimals = settings?.moneda_decimales !== undefined ? Number(settings.moneda_decimales) : 0;

    // Check if user locale is available, otherwise default
    const locale = 'es-CL'; // Could be dynamic

    // Force Decimals (Max 4 to match DB)
    const displayDecimals = Math.min(decimals, 4);
    const options = {
        minimumFractionDigits: displayDecimals,
        maximumFractionDigits: displayDecimals,
    };

    const numberStr = Number(value).toLocaleString(locale, options);

    return `${symbol} ${numberStr}`;
};
