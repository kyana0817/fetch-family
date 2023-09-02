type FetchQueueConfig = {
    concurrency?: number;
};
export declare const fetchQueueClient: (userConfig?: FetchQueueConfig | undefined) => <TConvert extends keyof import("./base").ResponseMap>(input: RequestInfo | URL, init?: import("./base").FamliyRequestInit<TConvert> | undefined) => Promise<import("./base").ResponseMap[TConvert]>;
export {};
