interface BaseConfig {} // eslint-disable-line @typescript-eslint/no-empty-interface
interface BaseContext<T extends BaseConfig = BaseConfig> {
  config: T;
}
type BaseMethods = {
  [K in PropertyKey]: () => void
}


type InitializerFn<TConfig extends BaseConfig> = (config?: TConfig) => BaseContext<TConfig>
type CreateMethodsFn<
  TMethods extends BaseMethods = BaseMethods,
  TConfig extends BaseConfig = BaseConfig,
  TContext extends BaseContext = BaseContext<TConfig>
> = (ctx: TContext) => TMethods

type RequestBaseFn<
  TMethods extends BaseMethods = BaseMethods
> = (methods: TMethods)
  => (input: RequestInfo | URL, init?: RequestInit | undefined)
  => Promise<Response>

type CreateFetchBaseFnParams<
  TConfig extends BaseConfig,
  TMethods extends BaseMethods = BaseMethods
> = {
  initializer: InitializerFn<TConfig>,
  createMethods: CreateMethodsFn<TMethods, TConfig>
  requestFn?: RequestBaseFn<TMethods>
}
type CreateFetchBaseFn = <
  TConfig extends BaseConfig = BaseConfig,
>(params: CreateFetchBaseFnParams<TConfig>)
  => (userConfig?: TConfig)
  => ReturnType<RequestBaseFn>

const requestBese: RequestBaseFn = (_methods) =>
  (input, init) => new Promise((resolve, reject) => {
    fetch(input, init)
      .then(resolve)
      .catch(reject)
  })

const createBaseMethods: CreateMethodsFn = (_ctx) => ({})

export const createFetchBase: CreateFetchBaseFn = ({
  initializer,
  createMethods = createBaseMethods,
  requestFn = requestBese
}) => (userConfig) => {
  const ctx = initializer(userConfig)
  const methods = createMethods(ctx)
  return requestFn(methods)
}
