export interface AxiosHookConfig<T, Y> {
    /**If present, will process the data before setting it to the state. Must return the processed data.*/
    processData?: (data: T) => Y;
    onError?: (error: Error) => void;
    withCredentials?: boolean;
    /**If present, the axios call will be re-performed/cleanedup whenever deps changes*/
    deps?: ReadonlyArray<unknown>;
    /**If present, the axios call will only be performed if this returns true.*/
    runIf?: () => boolean;
    /**If present, will store the result from the last axios call to the same URL with the same cacheKey*/
    cacheKey?: string;
    fetchAsync?: (type: string, request: Request) => Promise<T>;
    fetchAsyncType: string;
    preRequest?: (request: Request) => Request;
}
interface RequestConfig {
    url: string;
    method?: string;
    params?: object;
    data?: object;
    headers?: HeadersInit;
    withCredentials?: RequestCredentials;
}
export declare function useAxios<T, Y = T>(config: RequestConfig, hookConfig: AxiosHookConfig<T, Y>): AxiosState<Y> & {
    trigger: () => void;
};
/**
 * @param url - Url to query
 * @param  params - Parameters
 * @param  hookConfig
 */
export declare function useAxiosGet<T, Y = T>(url: string, hookConfig: AxiosHookConfig<T, Y>, params?: object): AxiosState<Y> & {
    trigger: () => void;
};
type AxiosState<T> = {
    error?: object;
    data?: T;
    loading: boolean;
};
export {};
