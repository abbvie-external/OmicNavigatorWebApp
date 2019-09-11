import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import moment from 'moment';
import _ from 'lodash';
export function getTemplate(column) {
  if (column.template) {
    return column.template;
  }
  if (typeMap[column.type]) {
    return typeMap[column.type].template;
  }
  return undefined;
}
export function getExportTemplate(column) {
  if (column.exportTemplate) {
    return column.exportTemplate;
  }
  if (typeMap[column.type]) {
    return typeMap[column.type].exportTemplate;
  }
  return undefined;
}
export function getFieldValue(item, field, type) {
  let fieldName = field;
  let accessor = typeMap[type] && typeMap[type].accessor;
  if (typeof field === 'object') {
    fieldName = field.field;
    if (field.accessor) accessor = field.accessor;
  }
  switch (typeof accessor) {
    case 'function':
      return accessor(item, fieldName);
    case 'object':
      return accessor[item[fieldName]];
    default:
      return item[accessor || fieldName];
  }
  // if (typeof field === 'object') {
  //   switch (typeof field.accessor) {
  //     case 'function':
  //       return field.accessor(item, field.field);
  //     case 'object':
  //       return field.accessor[item[field.field]];
  //     default:
  //       return item[field.accessor || field.field];
  //   }
  // } else {
  //   return item[field];
  // }
  // switch (typeof field) {
  //   // case 'function':
  //   //   return field(item);
  //   case 'object':
  //     // console.log(item, field, field.map[item[field.field]]);
  //     // return field.map[getFieldValue(item,field.field)] // Allow maps with function fields?
  //     //Might be premature to make this?
  //     return field.map[item[field.field]];
  //   default:
  //     return item[field];
  // }
}
// function getFieldSortValue(item, field) {
//   if (typeof field === 'object') {
//     switch (typeof field.sortAccessor) {
//       case 'function':
//         return field.sortAccessor(item, field.field);
//       case 'object':
//         return field.sortAccessor[item[field.field]];
//       default:
//         return item[field.sortAccessor || field.field];
//     }
//   } else {
//     return item[field];
//   }
// }
function getFieldSortValueFunction(field, type) {
  let fieldName = field;
  let sortAccessor = typeMap[type] && typeMap[type].sortAccessor;
  if (typeof field === 'object') {
    fieldName = field.field;
    if (field.sortAccessor) sortAccessor = field.sortAccessor;
  }
  switch (typeof sortAccessor) {
    case 'function':
      return item => sortAccessor(item, fieldName);
    case 'object':
      return item => sortAccessor[item[fieldName]];
    default:
      return sortAccessor || fieldName;
  }
}

// function getFieldGroupValue(item, field, type) {
//   let fieldName = field;
//   let groupAccessor = typeMap[type] && typeMap[type].groupAccessor;
//   if (typeof field === 'object') {
//     fieldName = field.field;
//     if (field.groupAccessor) groupAccessor = field.groupAccessor;
//   }
//   switch (typeof groupAccessor) {
//     case 'function':
//       return groupAccessor(item, fieldName);
//     case 'object':
//       return groupAccessor[item[fieldName]];
//     default:
//       return item[groupAccessor || fieldName];
//   }
// }
function getFieldGroupValueFunction(field, type) {
  let fieldName = field;
  let groupAccessor = typeMap[type] && typeMap[type].groupAccessor;
  if (typeof field === 'object') {
    fieldName = field.field;
    if (field.groupAccessor) groupAccessor = field.groupAccessor;
  }
  switch (typeof groupAccessor) {
    case 'function':
      return item => groupAccessor(item, fieldName);
    case 'object':
      return item => groupAccessor[item[fieldName]];
    default:
      return item => item[groupAccessor || fieldName];
  }
}

export function getField(field) {
  if (field === null) return field;
  switch (typeof field) {
    case 'object':
      return field.field;
    default:
      return field;
  }
}
export const typeMap = {
  number: {
    sortAccessor: (item, field) => +item[field],
    groupAccessor: (item, field) => `#${item[field]}`
  },
  date: {
    accessor: (item, field) => {
      if (!item[field]) return undefined;
      let date = moment(new Date(item[field]));
      return date.isValid() ? date : undefined; //.format('D/MMM/YYYY') : 'N/A';
      // return value ? value.format('D/MMM/Y') : 'N/A';
    },
    sortAccessor: (item, field) => item[field] && new Date(item[field]),
    groupAccessor: (item, field) =>
      item[field] && moment(new Date(item[field])).format('D/MMM/Y'),
    exportTemplate: value => (value ? value.format('D/MMM/Y') : 'N/A'),

    template: value => (value ? value.format('D/MMM/Y') : 'N/A')
  },
  datetime: {
    accessor: (item, field) => {
      if (!item[field]) return undefined;
      let date = moment(new Date(item[field]));
      return date.isValid() ? date : undefined; //.format('D/MMM/YYYY') : 'N/A';
      // return value ? value.format('D/MMM/Y HH:mm:ss') : 'N/A';
    },
    sortAccessor: (item, field) => item[field] && new Date(item[field]),
    groupAccessor: (item, field) =>
      item[field] && moment(new Date(item[field])).format('D/MMM/Y'),
    exportTemplate: value => (value ? value.format('D/MMM/Y HH:mm:ss') : 'N/A'),
    template: value => (value ? value.format('D/MMM/Y HH:mm:ss') : 'N/A')
  }
};
//startIndex, endIndex
/**
 * props.columns => columns
 * props.grouping, columns => grouping //can just use props.columns easily.
 *    Need to figure out a way to get this that doesn't need to be recalculated whenever columns changes a little.
 *    Does props.columns change ever?
 *  ----
 * grouping, data=>orderedData
 * orderedData, grouping, => groupData3, groups
 * props.sortBy, props.sortOrder, groups, groupData3 => sorted groupData3
 *    OR
 * props.sortBy, props.sortOrder,startIndex, endIndex, groups, groupData3 => sorted/sliced groupData3
 */
const groupingSelector = createSelector(
  [columns => columns, (_columns, grouping) => grouping],
  (columns, grouping) => {
    return (grouping || []).map(group => {
      const col = _.find(columns, col => col.ID === group.col_id) || {};
      return Object.assign({}, group, {
        field: col.field,
        title: col.title,
        type: col.type
      });
    });
  }
);
const orderMapping = {
  ascending: 'asc',
  descending: 'desc'
};
// const sortData = (sortBy,sortOrder,groupData)=>{
//   if(!sortBy||!sortOrder){
//     return groupData;
//   }
//   for(const key of Object.keys(groupData)){
//     if(_.isArray(groupData[key])){
//       groupData[key] = _.orderBy(groupData[key],[sortBy],[sortOrder])
//     }else{
//       sortData(sortBy,sortOrder,groupData[key])
//     }
//   }
//   return groupData;
// }
const sortedDataSelector = createSelector(
  [
    sortBy => sortBy,
    (_sortBy, sortOrder) => orderMapping[sortOrder],
    (_sortBy, _sortOrder, groupData) => groupData,
    (_sortBy, _sortOrder, _groupData, columns) => columns,
    (_sortBy, _sortOrder, _groupData, _columns, isPaginated) => isPaginated
  ],
  (sortBy, sortOrder, groupData, columns, isPaginated) => {
    if (!sortBy || !sortOrder) {
      return groupData;
    }
    return _.cloneDeepWith(groupData, value => {
      if (_.isArray(value)) {
        if (isPaginated) return value;
        let column = columns.find(col => col.ID === sortBy);
        if (!column) return _.orderBy(value, [sortBy], [sortOrder]);
        return _.orderBy(
          value,
          [getFieldSortValueFunction(column.field, column.type)],
          [sortOrder]
        );
      }
    });
  }
);
const groupDataSelector = createSelector(
  [
    grouping => grouping,
    (_grouping, data) => data,
    (_grouping, _data, isPaginated) => isPaginated
  ],
  (grouping, data, isPaginated) => {
    let groupAccessors = grouping.map(group =>
      getFieldGroupValueFunction(group.field, group.type)
    );
    let sortAccessors = grouping.map(group =>
      getFieldSortValueFunction(group.field, group.type)
    );
    let orderedData = isPaginated
      ? data
      : _.orderBy(
          data || [],
          // grouping.map((group) => group.field),
          // grouping.map((group) => getFieldSortValueFunction(group.field, group.type)),
          sortAccessors,
          grouping.map(group => group.sortOrder)
        );
    let groups = [];
    let groupData = [];
    if (grouping.length === 0) {
      groupData = { null: orderedData };
      groups = [[null]];
    } else {
      let groupsObj = {};
      groupData = orderedData.reduce((groupData, item) => {
        let curObj = groupData;
        let group = [];
        for (let i = 0; i < grouping.length; ++i) {
          // let field = grouping[i].field;
          // let itemField = item[field];
          // let itemField = getFieldGroupValue(item, field, grouping[i].type);
          let itemField = groupAccessors[i](item);
          if (typeof itemField === 'number') itemField = `#${itemField}`;
          // console.log(itemField);
          // console.log(field, item, itemField);
          let isLast = i === grouping.length - 1;
          if (!curObj[itemField]) {
            curObj[itemField] = isLast ? [] : {};
          }
          if (isLast) {
            curObj[itemField].push(item);
          }
          group.push(itemField);
          curObj = curObj[itemField];
        }
        if (!groupsObj[group.join('')]) {
          groupsObj[group.join('')] = group;
        }
        return groupData;
      }, {});
      groups = Object.values(groupsObj);
    }
    // console.log(groupData, groups, orderedData);
    return [groupData, groups];
  }
);
const groupDataLengthsSelector = createSelector(
  [groupData => groupData, (_groupData, groups) => groups],
  (groupData, groups) => {
    let groupLengths = {};
    for (const group of groups) {
      let data = groupData;
      for (const key of group) {
        data = data[key];
      }
      const groupLen = data.length;
      let keyString = '';
      for (const key of group) {
        keyString += key;
        if (!groupLengths[keyString]) {
          groupLengths[keyString] = 0;
        }
        groupLengths[keyString] += groupLen;
      }
    }
    return groupLengths;
  }
);
const slicedDataSelector = createSelector(
  [
    startIndex => startIndex,
    (_start, endIndex) => endIndex,
    (_start, _end, groupData) => groupData,
    (_start, _end, _groupData, groups) => groups
  ],
  (startIndex, endIndex, groupData, groups) => {
    let slicedData = {};
    let slicedGroupLengths = {};
    let curIdx = 0;
    for (const group of groups) {
      let data = groupData;
      for (const key of group) {
        data = data[key];
      }
      const groupLen = data.length;
      if (curIdx > endIndex) {
        break;
      }
      if (curIdx + groupLen < startIndex) {
        curIdx += groupLen;
        continue;
      }
      let slicedLength = 0;
      let curSliced = slicedData;
      for (let i = 0; i < group.length; ++i) {
        if (i === group.length - 1) {
          curSliced[group[i]] = data.slice(
            Math.max(startIndex - curIdx, 0),
            Math.min(endIndex - curIdx + 1, groupLen)
          );
          slicedLength = curSliced[group[i]].length;
        } else {
          if (!curSliced[group[i]]) {
            curSliced[group[i]] = {};
          }
          curSliced = curSliced[group[i]];
        }
      }
      let keyString = '';
      for (const key of group) {
        keyString += key;
        if (!slicedGroupLengths[keyString]) {
          slicedGroupLengths[keyString] = 0;
        }
        slicedGroupLengths[keyString] += slicedLength;
      }
      curIdx += groupLen;
    }
    return [slicedData, slicedGroupLengths];
  }
);
export const QHGridSelector = createSelector(
  [
    groupingSelector,
    (_columns, _grouping, data) => data,
    (_columns, _grouping, _data, sortBy) => sortBy,
    (_columns, _grouping, _data, _sortBy, sortOrder) => sortOrder,
    (_columns, _grouping, _data, _sortBy, _sortOrder, startIndex) => startIndex,
    (_columns, _grouping, _data, _sortBy, _sortOrder, _startIndex, endIndex) =>
      endIndex,
    columns => columns,
    (
      _columns,
      _grouping,
      _data,
      _sortBy,
      _sortOrder,
      _startIndex,
      _endIndex,
      isPaginated
    ) => isPaginated
  ],
  (
    grouping,
    data,
    sortBy,
    sortOrder,
    startIndex,
    endIndex,
    columns,
    isPaginated
  ) => {
    let [groupData, groups] = groupDataSelector(grouping, data, isPaginated);
    let sortedData = sortedDataSelector(
      sortBy,
      sortOrder,
      groupData,
      columns,
      isPaginated
    );
    let groupLengths = groupDataLengthsSelector(groupData, groups);
    let [slicedData, slicedGroupLengths] = slicedDataSelector(
      startIndex,
      endIndex,
      sortedData,
      groups
    );
    return { grouping, slicedData, groupLengths, slicedGroupLengths };
  }
);
export const columnsSelector = createSelector(
  [columns => columns],
  oldColumns => {
    const columns = oldColumns.map((col, QHgridIndex) => ({
      ...col,
      QHgridIndex
    }));
    const visibleColumns = columns.filter(col => !col.hidden);
    const uniqueColumns = columns.filter(col => col.unique);
    const itemKeyMap = item =>
      uniqueColumns
        ? uniqueColumns
            .map(col => getFieldValue(item, col.field, col.type))
            .join(',')
        : undefined;
    return { columns, visibleColumns, itemKeyMap };
  }
);

export const QHGridBodyHeadersHandleFilterUpdate = createCachedSelector(
  [
    field => field,
    (_field, filterType) => filterType,
    (_field, _filterType, handleFilterUpdate) => handleFilterUpdate
  ],
  (field, filterType, handleFilterUpdate) =>
    handleFilterUpdate(field, filterType)
)((field, filterType) => `${field},${filterType}`);
