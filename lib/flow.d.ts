type FetchFlowConfig = {
    sizeLimit?: number;
};
export declare const fetchFlowClient: (userConfig?: FetchFlowConfig | undefined) => <TConvert extends keyof import("./base").ResponseMap>(input: RequestInfo | URL, init?: import("./base").FamliyRequestInit<TConvert> | undefined) => Promise<import("./base").ResponseMap[TConvert]>;
export {};
