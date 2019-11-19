import _ from 'lodash';
import moment from 'moment';
import {
  MultiFilterDropdown,
  RemoteMultiFilterDropdown,
  RemoteAndLocalMultiFilterDropdown,
  ExecutedDateFilterDropdown,
  DateFilterDropdown,
  NumericFilterPopup,
  AlphanumericFilterPopup
} from './FilterDropdowns';

export const filterTypes = {
  multiFilter: {
    filter: (item, filter_field, filter_values) => {
      return (
        (filter_values || []).length === 0 ||
        _.includes(filter_values, item[filter_field]) ||
        (_.isArray(item[filter_field]) &&
          _.intersection(filter_values, item[filter_field]).length > 0)
      );
    },
    component: MultiFilterDropdown
  },
  remoteMultiFilter: {
    filter: (item, filter_field, filter_values) => {
      const normalizedFilterValues = _.map(filter_values, val => {
        return _.toUpper(
          _.trim(_.replace(_.replace(val, /-/g, ''), /\s/g, ''))
        );
      });
      const normalizedValue = _.toUpper(
        _.trim(_.replace(_.replace(item[filter_field], /-/g, ''), /\s/g, ''))
      );
      return (
        (filter_values || []).length === 0 ||
        _.some(normalizedFilterValues, filter => {
          return (
            _.includes(normalizedValue, filter) && normalizedValue.length > 0
          );
        })
      );
    },
    component: RemoteMultiFilterDropdown
  },
  remoteAndLocalMultiFilter: {
    filter: (item, filter_field, filter_values) => {
      const normalizedFilterValues = _.map(filter_values, val => {
        return _.toUpper(
          _.trim(_.replace(_.replace(val, /-/g, ''), /\s/g, ''))
        );
      });
      const normalizedValue = _.toUpper(
        _.trim(_.replace(_.replace(item[filter_field], /-/g, ''), /\s/g, ''))
      );
      return (
        (filter_values || []).length === 0 ||
        _.some(normalizedFilterValues, filter => {
          return (
            _.includes(normalizedValue, filter) && normalizedValue.length > 0
          );
        })
      );
    },
    component: RemoteAndLocalMultiFilterDropdown
  },
  executedDateFilter: {
    filter: (item, filter_field, filter_values) => {
      const executed_date = item[filter_field];

      if ((filter_values || []).length === 0) {
        return true;
      }

      const date_period = filter_values[0];

      switch (date_period) {
        case 'Executed In Past 24 Hours':
          if (executed_date === null) {
            return false;
          }
          return moment(executed_date).isBetween(
            moment().subtract(24, 'h'),
            moment(),
            null,
            '[]'
          );
        case 'Executed In Past 72 Hours':
          if (executed_date === null) {
            return false;
          }
          return moment(executed_date).isBetween(
            moment().subtract(72, 'h'),
            moment(),
            null,
            '[]'
          );
        case 'Executed In Past 7 Days':
          if (executed_date === null) {
            return false;
          }
          return moment(executed_date).isBetween(
            moment().subtract(7, 'd'),
            moment(),
            null,
            '[]'
          );
        case 'Executed In Past Month':
          if (executed_date === null) {
            return false;
          }
          return moment(executed_date).isBetween(
            moment().subtract(1, 'M'),
            moment(),
            null,
            '[]'
          );
        case 'Contract Is Executed':
          return executed_date !== null;
        case 'Not Yet Executed':
          return executed_date === null;
        default:
          return false;
      }
    },
    component: ExecutedDateFilterDropdown
  },
  dateFilter: {
    filter: (item, filter_field, filter_values) => {
      if (!filter_values) {
        return true;
      }
      let { startDate, endDate } = filter_values; //.map((date) => (date ? moment(date) : null));
      const date = moment(item[filter_field]);
      if (startDate && date.isBefore(startDate)) {
        return false;
      }
      if (endDate && date.isAfter(endDate)) {
        return false;
      }
      return true;
    },
    component: DateFilterDropdown
  },
  numericFilter: {
    filter: comparisonFilter(numericComparisons),
    component: NumericFilterPopup
  },
  alphanumericFilter: {
    filter: comparisonFilter(alphanumericComparisons),
    component: AlphanumericFilterPopup
  }
};
const singleComparators = {
  null: true,
  '!null': true,
  empty: true,
  '!empty': true
};
function comparisonFilter(comparisons) {
  return (item, filterField, filterValues) => {
    if (!filterValues) return true;
    let isValid = true;
    let orHasValue = false;
    for (const opts of filterValues) {
      if (opts.combination === '||') {
        if (isValid && orHasValue) break;
        isValid = true;
        orHasValue = false;
      } else if (isValid === false) {
        continue;
      }
      if (!(singleComparators[opts.comparison] || opts.value)) {
        continue;
      }
      orHasValue = true;
      if (!comparisons(opts.comparison, item[filterField], opts.value)) {
        isValid = false;
      }
    }
    return orHasValue && isValid;
  };
}
function numericComparisons(comparison, a, b) {
  /* eslint-disable eqeqeq */
  switch (comparison) {
    case '=':
      return a == b;
    case '!=':
      return a != b;
    case '>=':
      return a >= b;
    case '>':
      return a > b;
    case '<=':
      return a <= b;
    case '<':
      return a < b;
    case 'null':
      return a == null;
    case '!null':
      return a != null;
    default:
      return true;
  }
}

function alphanumericComparisons(comparison, a, b) {
  let stringA = String(a).toUpperCase();
  let stringB = String(b).toUpperCase();
  switch (comparison) {
    case '=':
      return stringA === stringB;
    case '!=':
      return stringA !== stringB;
    case 'contains':
      return stringA.includes(stringB);
    case '!contains':
      return !stringA.includes(stringB);
    case 'starts':
      return stringA.startsWith(stringB);
    case 'ends':
      return stringA.endsWith(stringB);
    case 'null':
      return a == null;
    case '!null':
      return a != null;
    case 'empty':
      return stringA === '';
    case '!empty':
      return stringA !== '';
    default:
      return true;
  }
}
