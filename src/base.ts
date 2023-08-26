type BaseConfig = Record<string, unknown>
export type BaseContext<T extends BaseConfig = BaseConfig> = {
  [K in PropertyKey]: unknown;
} & {
  config: T
}

export type BaseMethods = {
  [K in PropertyKey]: (...args: never[]) => void
}

export type InitializerFn<
  TConfig extends BaseConfig = BaseConfig,
  TContext extends BaseContext<TConfig> = BaseContext<TConfig>
> = (config: TConfig | undefined) => TContext

export type CreateMethodsFn<
  TContext extends BaseContext = BaseContext,
  TMethods extends BaseMethods = BaseMethods,
> = (ctx: TContext) => TMethods

export type RequestFn<
  TMethods extends BaseMethods = BaseMethods
> = (methods: TMethods)
  => (input: RequestInfo | URL, init?: RequestInit | undefined)
  => Promise<Response>

export type CreateFetchBaseFn = <
  TConfig extends BaseConfig = BaseConfig,
  TContext extends BaseContext<TConfig> = BaseContext<TConfig>,
  TMethods extends BaseMethods = BaseMethods
>(params: {
  initializer: InitializerFn<TConfig, TContext>;
  createMethods: CreateMethodsFn<TContext, TMethods>;
  requestFn?: RequestFn<TMethods>;
})
  => (userConfig?: TConfig)
  => ReturnType<RequestFn>

export const requestBese: RequestFn = (_methods) =>
  (input, init) => new Promise((resolve, reject) => {
    fetch(input, init)
      .then(resolve)
      .catch(reject)
  })

export const createBaseMethods: CreateMethodsFn = (_ctx) => ({})


export const createClient: CreateFetchBaseFn = ({
  initializer,
  createMethods,
  requestFn = requestBese
}) => (userConfig) => {
  const ctx = initializer(userConfig)
  const methods = createMethods(ctx)
  return requestFn(methods)
}
