import { AxiosRequestConfig } from 'axios';
interface HookConfig<T, Y> {
    /**If present, will process the data before setting it to the state. Must return the processed data.*/
    processData?: (data: T) => Y;
    onError?: (error: Error) => void;
    withCredentials?: boolean;
    /**If present, the axios call will be re-performed/cleanedup whenever deps changes*/
    deps?: ReadonlyArray<any>;
    /**If present, the axios call will only be performed if this returns true.*/
    runIf?: () => boolean;
    /**If present, will store the result from the last axios call to the same URL with the same cacheKey*/
    cacheKey?: string;
}
export declare function useAxios<T, Y = T>(config: AxiosRequestConfig, hookConfig?: HookConfig<T, Y>): AxiosState<Y> & {
    trigger: () => void;
};
/**
 * @param url - Url to query
 * @param  params - Parameters
 * @param  hookConfig
 */
export declare function useAxiosGet<T, Y = T>(url: string, params?: AxiosRequestConfig['params'], hookConfig?: HookConfig<T, Y>): AxiosState<Y> & {
    trigger: () => void;
};
declare type AxiosState<T> = {
    error?: object;
    data?: T;
    loading: boolean;
};
export {};
