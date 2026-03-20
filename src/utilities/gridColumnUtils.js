const SAFE_GRID_FIELD_PREFIX = '__qhf_';
const GRID_FIELD_UNSAFE_PATTERN = /[^A-Za-z0-9_$]/;

export const isUnsafeGridField = (field) =>
  typeof field === 'string' && GRID_FIELD_UNSAFE_PATTERN.test(field);

export const createSafeGridFieldKey = (field) => {
  if (!isUnsafeGridField(field)) {
    return field;
  }

  const encodedField = Array.from(field)
    .map((char) => char.codePointAt(0).toString(16).padStart(6, '0'))
    .join('');

  return `${SAFE_GRID_FIELD_PREFIX}${encodedField}`;
};

export const normalizeGridColumns = (columnsConfig = []) => {
  return columnsConfig.map((column) => {
    if (!column || typeof column !== 'object') {
      return column;
    }

    const originalField = column.originalField || column.field;

    if (!isUnsafeGridField(originalField)) {
      return column;
    }

    return {
      ...column,
      originalField,
      field: createSafeGridFieldKey(originalField),
    };
  });
};

export const augmentGridRows = (rows = [], columnsConfig = []) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return Array.isArray(rows) ? rows : [];
  }

  const mappedColumns = columnsConfig.filter(
    (column) =>
      column &&
      typeof column === 'object' &&
      typeof column.originalField === 'string' &&
      typeof column.field === 'string' &&
      column.originalField !== column.field,
  );

  if (!mappedColumns.length) {
    return rows;
  }

  return rows.map((row) => {
    if (!row || typeof row !== 'object') {
      return row;
    }

    const augmentedRow = { ...row };

    mappedColumns.forEach((column) => {
      Object.defineProperty(augmentedRow, column.field, {
        value: row[column.originalField],
        writable: true,
        configurable: true,
        enumerable: false,
      });
    });

    return augmentedRow;
  });
};
