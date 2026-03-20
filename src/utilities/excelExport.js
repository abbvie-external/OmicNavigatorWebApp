const DEFAULT_WORKSHEET_NAME = 'Data';

const sanitizeFileName = (fileName) => {
  const normalizedName = `${fileName || DEFAULT_WORKSHEET_NAME}`.trim();

  return (
    normalizedName.replace(/[\\/:*?"<>|]+/g, '_') || DEFAULT_WORKSHEET_NAME
  );
};

/**
 * Creates an Excel export handler function that exports data to an Excel file.
 *
 * @param {string} fileName - The base name for the exported Excel file (without extension).
 * @returns {Function} An async function that accepts an object with data transformation methods.
 * @returns {Promise<void>} The returned function is async and handles the Excel export process.
 *
 * @param {Object} exporterObj - The object passed to the returned handler function.
 * @param {Function} exporterObj.toArrayOfArrays - A function that returns a 2D array of data to export.
 * @param {Function} exporterObj.toWsCols - A function that returns column configuration for the worksheet.
 *
 */
export const createExcelExportHandler = (fileName) => {
  return async ({ toArrayOfArrays, toWsCols }) => {
    const XLSX = await import('xlsx');
    const aoaData = toArrayOfArrays();

    if (!Array.isArray(aoaData) || aoaData.length === 0) {
      return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(aoaData, { cellDates: true });
    const worksheetName = sanitizeFileName(fileName);
    const lastColumnIndex = Math.max(aoaData[0].length - 1, 0);

    worksheet['!cols'] = toWsCols(aoaData);
    worksheet['!autofilter'] = {
      ref: `A1:${XLSX.utils.encode_col(lastColumnIndex)}1`,
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      worksheetName.slice(0, 31),
    );
    XLSX.writeFile(workbook, `${worksheetName}.xlsx`, {
      compression: true,
    });
  };
};
