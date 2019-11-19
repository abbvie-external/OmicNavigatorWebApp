import createCachedSelector from 're-reselect';
import _ from 'lodash';
import update from 'immutability-helper';

export function stripNonCustomViews(state) {
  let updates = {};
  // for (const dashboard of Object.keys(state)) {
  let names = [];
  for (const name of Object.keys(state)) {
    if (!state[name].custom) {
      names.push(name);
    }
  }
  if (names.length) {
    updates = { $unset: names };
  }
  // }
  return update(state, updates);
}

export const quickViewSelector = createCachedSelector(
  [
    (state, dashboardId) => state.quickViews[dashboardId],
    (_state, _dashboardId, columns) => columns
  ],
  (quickViews, columnsConfig) => {
    const columnsConfigMap = columnsConfig.reduce((result, col) => {
      result[col.ID] = col;
      return result;
    }, {});
    return _.map(quickViews, (props, name) => {
      // console.log(name, props);
      let {
        view: { columns, ...restView },
        ...restOuter
      } = props;
      if (!columns || !columns.length) {
        return {
          name,
          ...restOuter,
          view: { columns: columnsConfig, ...restView }
        };
      }
      const columnsMap = _.groupBy(columns, 'ID');
      const newColumns = columnsConfig.filter(dbcol => {
        return !columnsMap[dbcol.ID];
      });
      columns = columns
        .reduce((result, col) => {
          let validCol = columnsConfigMap[col.ID];
          if (validCol !== undefined) {
            validCol = { ...validCol, hidden: col.hidden };
            // validCol.hidden = col.hidden;
            result.push(validCol);
          }
          return result;
        }, [])
        .concat(newColumns);
      return { ...restOuter, name, view: { columns, ...restView } };
    });
  }
)((_state, dashboardId) => dashboardId);
export const ezQuickViewSelector = createCachedSelector(
  [
    (quickViewsConfig, _state, _dashboardId) => quickViewsConfig,
    (_quickViewsConfig, state, _dashboardId) => state.columnsConfig
  ],
  (quickViews, columnsConfig) => {
    const columnsConfigMap = columnsConfig.reduce((result, col) => {
      result[col.ID] = col;
      return result;
    }, {});
    return _.map(quickViews, (props, name) => {
      // console.log(name, props);
      let {
        view: { columns, ...restView },
        ...restOuter
      } = props;
      if (!columns || !columns.length) {
        return {
          name,
          ...restOuter,
          view: { columns: columnsConfig, ...restView }
        };
      }
      const columnsMap = _.groupBy(columns, 'ID');
      const newColumns = columnsConfig.filter(dbcol => {
        return !columnsMap[dbcol.ID];
      });
      columns = columns
        .reduce((result, col) => {
          let validCol = columnsConfigMap[col.ID];
          if (validCol !== undefined) {
            validCol = { ...validCol, hidden: col.hidden };
            // validCol.hidden = col.hidden;
            result.push(validCol);
          }
          return result;
        }, [])
        .concat(newColumns);
      return { ...restOuter, name, view: { columns, ...restView } };
    });
  }
)((_quickViewsConfig, _state, dashboardId) => `${dashboardId}`);
