interface FooterProps {
    activePage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    onReloadData?: () => void;
    realStartIndex: number;
    realEndIndex: number;
    numRows: number;
}
export declare function Footer({ activePage, totalPages: numPages, onPageChange: handlePageChange, onItemsPerPageChange: handleItemsPerPageChange, onReloadData, itemsPerPage, numRows, realStartIndex, realEndIndex, }: FooterProps): import("react/jsx-runtime").JSX.Element;
export {};
