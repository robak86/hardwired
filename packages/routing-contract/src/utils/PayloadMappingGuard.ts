import { SymmetricDifference } from 'utility-types';
import { QueryRouteDefinition } from '../query-route/QueryRouteDefinition';
import { CommandRouteDefinition } from '../command-route/CommandRouteDefinition';

export type HasDuplicates<TSet1, TSet2> = TSet1 & TSet2 extends SymmetricDifference<TSet1, TSet2> ? false : true;

// prettier-ignore
export type QueryRouteDefinitionMappingGuard<TPathParamsKeys extends keyof TPayload,
    TDataKeys extends keyof TPayload,
    TPayload extends object,
    TResult extends object,

    > = keyof TPayload extends TPathParamsKeys | TDataKeys ?
    (
        HasDuplicates<TPathParamsKeys, TDataKeys> extends true ? 'Duplicates in params mapping' :
        QueryRouteDefinition<TPayload, TResult>
        ) :
    'Not all payload keys are mapped';

// prettier-ignore
export type CommandRouteDefinitionMappingGuard<TPathParamsKeys extends keyof TPayload,
    TDataKeys extends keyof TPayload,
    TPayload extends object,
    TResult extends object,

    > = keyof TPayload extends TPathParamsKeys | TDataKeys ?
    (
        HasDuplicates<TPathParamsKeys, TDataKeys> extends true ? 'Duplicates in params mapping' :
            CommandRouteDefinition<TPayload, TResult>
        ) :
    'Not all payload keys are mapped';
