import BN from 'bn.js';

export const NOMINATION_EXP = 24;

export const NOMINATION = new BN('10', 10).pow(new BN(NOMINATION_EXP, 10));

// Pre-calculate offests used for rounding to different number of digits
const ROUNDING_OFFSETS: BN[] = [];
const BN10 = new BN(10);
for (let i = 0, offset = new BN(5); i < NOMINATION_EXP; i++, offset = offset.mul(BN10)) {
    ROUNDING_OFFSETS[i] = offset;
}

export function formatAmount(balance: string, fracDigits: number = NOMINATION_EXP): string {
    const balanceBN = new BN(balance, 10);
    if (fracDigits !== NOMINATION_EXP) {
        // Adjust balance for rounding at given number of digits
        const roundingExp = NOMINATION_EXP - fracDigits - 1;
        if (roundingExp > 0) {
            balanceBN.iadd(ROUNDING_OFFSETS[roundingExp]);
        }
    }

    balance = balanceBN.toString();
    const wholeStr = balance.substring(0, balance.length - NOMINATION_EXP) || '0';
    const fractionStr = balance.substring(balance.length - NOMINATION_EXP)
        .padStart(NOMINATION_EXP, '0').substring(0, fracDigits);

    return trimTrailingZeroes(`${formatWithCommas(wholeStr)}.${fractionStr}`);
}

export function parseAmount(amt?: string): string | null {
    if (!amt) {
        return null;
    }
    amt = cleanupAmount(amt);
    const split = amt.split('.');
    const wholePart = split[0];
    const fracPart = split[1] || '';
    if (split.length > 2 || fracPart.length > NOMINATION_EXP) {
        throw new Error(`Cannot parse '${amt}' as amount`);
    }
    return trimLeadingZeroes(wholePart + fracPart.padEnd(NOMINATION_EXP, '0'));
}

function cleanupAmount(amount: string): string {
    return amount.replace(/,/g, '').trim();
}

function trimTrailingZeroes(value: string): string {
    return value.replace(/\.?0*$/, '');
}

function trimLeadingZeroes(value: string): string {
    value = value.replace(/^0+/, '');
    if (value === '') {
        return '0';
    }
    return value;
}

function formatWithCommas(value: string): string {
    const pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(value)) {
        value = value.replace(pattern, '$1,$2');
    }
    return value;
}
