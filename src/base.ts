type BaseConfig = Record<string, unknown>
export type BaseContext<T extends BaseConfig = BaseConfig> = {
  [K in PropertyKey]: unknown;
} & {
  config: Readonly<Required<T>>
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

export type ResponseMap = {
  arrayBuffer: ArrayBuffer;
  blob: Blob;
  formData: FormData;
  json: any;
  text: string;
  clone: Response;
}

export type ConvertType = keyof ResponseMap;

export type FamliyRequestInit<T extends ConvertType = 'json'> = RequestInit & {
  convertType?: T
}

export type RequestFn<
  TActions extends BaseActions = BaseActions
> = (actions: TActions)
  => <TConvert extends ConvertType>(
    input: RequestInfo | URL,
    init?: FamliyRequestInit<TConvert> | undefined
  )
  => Promise<ResponseMap[TConvert]>

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
  (input, init={}) => new Promise((resolve, reject) => {
    const {
      convertType='json' , ...options 
    } = init
    fetch(input, options)
      .then(res => res[convertType]())
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
