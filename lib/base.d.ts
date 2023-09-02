type BaseConfig = Record<string, unknown>;
export type BaseContext<T extends BaseConfig = BaseConfig> = {
    [K in PropertyKey]: unknown;
} & {
    config: Readonly<Required<T>>;
};
export type BaseActions = {
    [K in PropertyKey]: (...args: never[]) => void;
};
export type InitializerFn<TConfig extends BaseConfig = BaseConfig, TContext extends BaseContext<TConfig> = BaseContext<TConfig>> = (config: TConfig | undefined) => TContext;
export type CreateActionsFn<TContext extends BaseContext = BaseContext, TActions extends BaseActions = BaseActions> = (ctx: TContext) => TActions;
export type ResponseMap = {
    arrayBuffer: ArrayBuffer;
    blob: Blob;
    formData: FormData;
    json: Record<PropertyKey, unknown>;
    text: string;
    clone: Response;
};
export type ConvertType = keyof ResponseMap;
export type FamliyRequestInit<T extends ConvertType> = RequestInit & {
    convertType?: T;
};
export type RequestFn<TActions extends BaseActions = BaseActions> = (actions: TActions) => <TConvert extends ConvertType>(input: RequestInfo | URL, init?: FamliyRequestInit<TConvert>) => Promise<ResponseMap[TConvert]>;
export type CreateFetchBaseFn = <TConfig extends BaseConfig = BaseConfig, TContext extends BaseContext<TConfig> = BaseContext<TConfig>, TActions extends BaseActions = BaseActions>(params: {
    initializer: InitializerFn<TConfig, TContext>;
    createActions: CreateActionsFn<TContext, TActions>;
    requestFn?: RequestFn<TActions>;
}) => (userConfig?: TConfig) => ReturnType<RequestFn>;
export declare const requestBese: RequestFn;
export declare const createBaseActions: CreateActionsFn;
export declare const createClient: CreateFetchBaseFn;
export {};
