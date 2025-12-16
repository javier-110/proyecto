export const LATAM_PREFIXES = [
    { code: '+56', country: 'Chile', flag: '🇨🇱', iso: 'cl' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷', iso: 'ar' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴', iso: 'bo' },
    { code: '+55', country: 'Brasil', flag: '🇧🇷', iso: 'br' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴', iso: 'co' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷', iso: 'cr' },
    { code: '+53', country: 'Cuba', flag: '🇨🇺', iso: 'cu' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨', iso: 'ec' },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻', iso: 'sv' },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹', iso: 'gt' },
    { code: '+509', country: 'Haití', flag: '🇭🇹', iso: 'ht' },
    { code: '+504', country: 'Honduras', flag: '🇭🇳', iso: 'hn' },
    { code: '+52', country: 'México', flag: '🇲🇽', iso: 'mx' },
    { code: '+505', country: 'Nicaragua', flag: '🇳🇮', iso: 'ni' },
    { code: '+507', country: 'Panamá', flag: '🇵🇦', iso: 'pa' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾', iso: 'py' },
    { code: '+51', country: 'Perú', flag: '🇵🇪', iso: 'pe' },
    { code: '+1', country: 'Rep. Dominicana / USA', flag: '🇩🇴🇺🇸', iso: 'do' }, // Special case, prioritizing DO/US
    { code: '+598', country: 'Uruguay', flag: '🇺🇾', iso: 'uy' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪', iso: 've' },
    { code: '+34', country: 'España', flag: '🇪🇸', iso: 'es' }
];

export const getPhonePrefix = (phone) => {
    if (!phone) return '+56';
    const match = LATAM_PREFIXES.find(p => phone.startsWith(p.code));
    return match ? match.code : '+56';
};

export const getPhoneNumber = (phone) => {
    if (!phone) return '';
    const match = LATAM_PREFIXES.find(p => phone.startsWith(p.code));
    return match ? phone.slice(match.code.length) : phone;
};

export const getFlagUrl = (iso) => {
    if (!iso) return '';
    return `https://flagcdn.com/w40/${iso}.png`;
};
