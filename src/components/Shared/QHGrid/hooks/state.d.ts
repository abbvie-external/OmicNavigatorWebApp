export declare function useDebouncedValue<T>(value: T, time?: number): T;
/**
 * Calls onChange during render when the watch value changes by reference.
 *
 * This allows react to know to re-render the component instead of continuing to child components
 * if you set state in the onChange function.
 * @param watch
 * @param onChange
 */
export declare function useOnChangeInRender<T>(watch: T, onChange: (watch: T) => void): void;
