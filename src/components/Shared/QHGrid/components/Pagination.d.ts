export interface PaginationProps {
    activePage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /**
     * @default 3
     */
    numPageButtons?: number;
}
export declare function Pagination({ activePage, onPageChange, totalPages, numPageButtons, }: PaginationProps): import("react/jsx-runtime").JSX.Element;
