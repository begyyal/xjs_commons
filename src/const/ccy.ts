
export interface Ccy {
    symbol: t_ccySymbol;
    crossUsd: string;
}
export type t_ccySymbol = keyof (typeof currencies);
const currencies = {
    jpy: { crossUsd: "usd/jpy" } as Ccy,
    usd: { crossUsd: null } as Ccy,
    gbp: { crossUsd: "gbp/usd" } as Ccy,
    eur: { crossUsd: "eur/usd" } as Ccy,
    cad: { crossUsd: "cad/usd" } as Ccy,
    aud: { crossUsd: "aud/usd" } as Ccy
}
export const s_ccy: { [k in t_ccySymbol]: Readonly<Ccy> } = (() => {
    Object.entries(currencies).forEach(kv => { kv[1].symbol = kv[0] as t_ccySymbol; currencies[kv[0]] = Object.freeze(kv[1]) });
    return Object.freeze(currencies);
})();
export function resolveCcy(str: string): Ccy {
    const ccyKey = Object.keys(s_ccy).find(k => str?.toLowerCase() == k);
    return ccyKey && s_ccy[ccyKey];
}
