type BaseConfig = Record<string, unknown>
export type BaseContext<T extends BaseConfig = BaseConfig> = {
  [K in PropertyKey]: unknown;
} & {
  config: T
}

export type BaseActions = {
  [K in PropertyKey]: (...args: never[]) => void
}

export type InitializerFn<
  TConfig extends BaseConfig = BaseConfig,
  TContext extends BaseContext<TConfig> = BaseContext<TConfig>
> = (config: TConfig | undefined) => TContext

export type CreateActionsFn<
  TContext extends BaseContext = BaseContext,
  TActions extends BaseActions = BaseActions,
> = (ctx: TContext) => TActions

export type RequestFn<
  TActions extends BaseActions = BaseActions
> = (actions: TActions)
  => (input: RequestInfo | URL, init?: RequestInit | undefined)
  => Promise<Response>

export type CreateFetchBaseFn = <
  TConfig extends BaseConfig = BaseConfig,
  TContext extends BaseContext<TConfig> = BaseContext<TConfig>,
  TActions extends BaseActions = BaseActions
>(params: {
  initializer: InitializerFn<TConfig, TContext>;
  createActions: CreateActionsFn<TContext, TActions>;
  requestFn?: RequestFn<TActions>;
})
  => (userConfig?: TConfig)
  => ReturnType<RequestFn>

export const requestBese: RequestFn = (_actions) =>
  (input, init) => new Promise((resolve, reject) => {
    fetch(input, init)
      .then(resolve)
      .catch(reject)
  })

export const createBaseActions: CreateActionsFn = (_ctx) => ({})


export const createClient: CreateFetchBaseFn = ({
  initializer,
  createActions,
  requestFn = requestBese
}) => (userConfig) => {
  const ctx = initializer(userConfig)
  const actions = createActions(ctx)
  return requestFn(actions)
}
