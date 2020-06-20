import  * as qs from 'query-string';
import * as R from 'ramda';

export type ParsedQuery = object;

const parseOptions: qs.ParseOptions = { arrayFormat: 'bracket' };
export const queryParams = {
  parse: <TParsed extends ParsedQuery>(queryString: string): TParsed =>
    (qs.parse(queryString, parseOptions) as any) || {},

  stringify: (paramsObject: ParsedQuery): string => {
    const filterCriteria = R.complement(R.anyPass([R.isEmpty, R.isNil]));
    const filtered = R.filter(filterCriteria, paramsObject);
    const withoutDuplicates = R.map(R.ifElse(R.is(Array), R.uniq, R.identity), filtered) as any;

    return qs.stringify(withoutDuplicates, parseOptions);
  },
};
