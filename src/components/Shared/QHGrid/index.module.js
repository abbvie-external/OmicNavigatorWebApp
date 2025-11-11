/*eslint-disable*/
import e from 'immutability-helper';
import {
  some as t,
  isEmpty as n,
  orderBy as r,
  map as a,
  debounce as o,
  sortBy as i,
  range as l,
  filter as c,
  find as u,
  groupBy as s,
  keyBy as d,
} from 'lodash-es';
import * as m from 'react';
import p, {
  useMemo as g,
  useReducer as f,
  useEffect as h,
  useState as v,
  useRef as C,
  useCallback as y,
  Component as w,
  PureComponent as E,
} from 'react';
import {
  Icon as k,
  Dropdown as b,
  Divider as P,
  Input as S,
  Button as x,
  Popup as I,
  Tab as A,
  Loader as O,
  Dimmer as D,
  Table as N,
  Message as V,
  Pagination as T,
  Image as G,
  Header as q,
  Modal as R,
  Form as B,
  Menu as F,
} from 'semantic-ui-react';
import M from 'dayjs';
import { List as L } from 'react-virtualized';
import Q from 'axios';
function H() {
  return (H =
    Object.assign ||
    function(e) {
      for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t];
        for (var r in n)
          Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
      }
      return e;
    }).apply(this, arguments);
}
function j(e, t) {
  (e.prototype = Object.create(t.prototype)),
    (e.prototype.constructor = e),
    U(e, t);
}
function U(e, t) {
  return (U =
    Object.setPrototypeOf ||
    function(e, t) {
      return (e.__proto__ = t), e;
    })(e, t);
}
function Y(e, t) {
  if (null == e) return {};
  var n,
    r,
    a = {},
    o = Object.keys(e);
  for (r = 0; r < o.length; r++) t.indexOf((n = o[r])) >= 0 || (a[n] = e[n]);
  return a;
}
function z(e, t) {
  (null == t || t > e.length) && (t = e.length);
  for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function K(e, t) {
  var n =
    ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
  if (n) return (n = n.call(e)).next.bind(n);
  if (
    Array.isArray(e) ||
    (n = (function(e, t) {
      if (e) {
        if ('string' == typeof e) return z(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        return (
          'Object' === n && e.constructor && (n = e.constructor.name),
          'Map' === n || 'Set' === n
            ? Array.from(e)
            : 'Arguments' === n ||
              /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
            ? z(e, t)
            : void 0
        );
      }
    })(e)) ||
    (t && e && 'number' == typeof e.length)
  ) {
    n && (e = n);
    var r = 0;
    return function() {
      return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
    };
  }
  throw new TypeError(
    'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
  );
}
function W(e) {
  var t = (function(e, t) {
    if ('object' != typeof e || null === e) return e;
    var n = e[Symbol.toPrimitive];
    if (void 0 !== n) {
      var r = n.call(e, 'string');
      if ('object' != typeof r) return r;
      throw new TypeError('@@toPrimitive must return a primitive value.');
    }
    return String(e);
  })(e);
  return 'symbol' == typeof t ? t : String(t);
}
var X = {};
function _(e, t) {
  if (null == t) return e;
  switch (typeof t) {
    case 'function':
      return t(e);
    case 'object':
      return t[e];
    default:
      return e[t];
  }
}
var J,
  Z = p.createElement(k, { name: 'filter' }),
  $ = function(e) {
    return e.stopPropagation();
  },
  ee = { paddingBottom: 0, paddingTop: 0 },
  te = [],
  ne = { startDate: '', endDate: '' },
  re = [
    { text: 'Is equal to', value: '=' },
    { text: 'Is not equal to', value: '!=' },
    { text: 'Is greater than or equal to', value: '>=' },
    { text: 'Is greater than', value: '>' },
    { text: 'Is less than or equal to', value: '<=' },
    { text: 'Is less than', value: '<' },
    { text: 'Is null', value: 'null' },
    { text: 'Is not null', value: '!null' },
  ];
!(function(e) {
  (e.equals = '='),
    (e.notEquals = '!='),
    (e.greaterOrEqual = '>='),
    (e.greater = '>'),
    (e.lessOrEqual = '<='),
    (e.less = '<'),
    (e.null = 'null'),
    (e.notNull = '!null'),
    (e.contains = 'contains'),
    (e.notContains = '!contains'),
    (e.starts = 'starts'),
    (e.ends = 'ends'),
    (e.empty = 'empty'),
    (e.notEmpty = '!empty');
})(J || (J = {}));
var ae,
  oe = { null: !0, '!null': !0, empty: !0, '!empty': !0 };
!(function(e) {
  (e.and = '&&'), (e.or = '||');
})(ae || (ae = {}));
var ie = [
    { text: 'And', value: ae.and },
    { text: 'Or', value: ae.or },
  ],
  le = { combination: ae.and, comparison: J.equals, value: '' },
  ce = function(e) {
    return oe[e.comparison] || e.value;
  };
function ue(t, n, r) {
  var a = v(t),
    o = a[0],
    i = a[1],
    l = C(o);
  return (
    h(
      function() {
        l.current = o;
      },
      [o],
    ),
    {
      handleAdd: y(
        function(t) {
          i(function(t) {
            return e(t, { $push: [r] });
          });
        },
        [r],
      ),
      handleChange: y(function(t, n) {
        var r = n.value,
          a = n.name,
          o = n['data-idx'];
        t.stopPropagation(),
          i(function(t) {
            var n, i;
            return e(t, (((i = {})[o] = (((n = {})[a] = { $set: r }), n)), i));
          });
      }, []),
      handleClear: y(
        function() {
          i([r]), n();
        },
        [n, r],
      ),
      handleFilter: y(
        function() {
          l.current.some(ce) ? n(l.current) : n();
        },
        [n],
      ),
      handleOpen: y(
        function() {
          t.some(ce) && i(t);
        },
        [t],
      ),
      handleRemove: y(function(t, n) {
        var r = n['data-idx'];
        i(function(t) {
          return e(t, { $splice: [[r, 1]] });
        });
      }, []),
      selectedOpts: o,
    }
  );
}
var se = p.memo(function(e) {
    var t,
      n = e.onChange,
      r = Y(e, ['onChange']),
      a = ue(null != (t = r.selectedOpts) ? t : [le], n, le),
      o = a.selectedOpts.map(function(e, t) {
        var n =
          t > 0
            ? p.createElement(b, {
                'data-idx': t,
                name: 'combination',
                options: ie,
                selection: !0,
                value: e.combination,
                onChange: a.handleChange,
                className: 'combination',
                compact: !0,
              })
            : null;
        return p.createElement(
          'div',
          { className: 'filter', key: t },
          t > 0 &&
            ('&&' === e.combination
              ? n
              : p.createElement(P, { horizontal: !0 }, n)),
          p.createElement(
            'div',
            { className: 'values' },
            p.createElement(
              'div',
              null,
              p.createElement(b, {
                'data-idx': t,
                name: 'comparison',
                options: re,
                selection: !0,
                value: e.comparison,
                onChange: a.handleChange,
              }),
              !oe[e.comparison] &&
                p.createElement(S, {
                  'data-idx': t,
                  name: 'value',
                  type: 'number',
                  step: 'any',
                  value: e.value,
                  onChange: a.handleChange,
                }),
            ),
            p.createElement(x, {
              icon: { name: 'minus', color: 'red' },
              compact: !0,
              disabled: 0 === t,
              onClick: a.handleRemove,
              'data-idx': t,
            }),
          ),
        );
      });
    return p.createElement(
      I,
      {
        position: 'bottom center',
        trigger: p.createElement('span', { onClick: $ }, r.trigger),
        className: 'ComparisonFilterPopup',
        on: 'click',
        onOpen: a.handleOpen,
        onClick: $,
      },
      p.createElement(
        I.Content,
        { className: 'ComparisonFilter' },
        o,
        p.createElement(
          P,
          { horizontal: !0 },
          p.createElement(x, {
            className: 'add',
            icon: { name: 'plus circle', color: 'green', size: 'large' },
            compact: !0,
            onClick: a.handleAdd,
          }),
        ),
        p.createElement(
          x.Group,
          {
            fluid: !0,
            widths: 2,
            style: { position: 'sticky', bottom: '0px' },
          },
          p.createElement(
            x,
            { positive: !0, onClick: a.handleFilter },
            'Filter',
          ),
          p.createElement(x, { negative: !0, onClick: a.handleClear }, 'Clear'),
        ),
      ),
    );
  }),
  de = [
    { text: 'Is equal to', value: J.equals },
    { text: 'Is not equal to', value: J.notEquals },
    { text: 'Contains', value: J.contains },
    { text: 'Does not Contain', value: J.notContains },
    { text: 'Starts with', value: J.starts },
    { text: 'Ends with', value: J.ends },
    { text: 'Is null', value: J.null },
    { text: 'Is not null', value: J.notNull },
    { text: 'Is empty', value: J.empty },
    { text: 'Is not empty', value: J.notEmpty },
  ],
  me = { combination: ae.and, comparison: J.contains, value: '' },
  pe = {
    multiFilter: {
      filter: function(e, t, n) {
        return (
          !n ||
          0 === n.length ||
          !(Array.isArray(e[t]) ? e[t] : [e[t]]).every(function(e) {
            return !n.includes(e);
          })
        );
      },
      component: function(e) {
        var t = e.selectedOpts,
          n = void 0 === t ? te : t,
          r = e.data,
          a = e.field,
          o = e.onChange,
          i = e.accessor,
          l = e.trigger,
          c = void 0 === l ? Z : l,
          u = Y(e, [
            'selectedOpts',
            'data',
            'field',
            'onChange',
            'accessor',
            'trigger',
          ]),
          s = v(''),
          d = s[0],
          m = s[1],
          f = v(0),
          y = f[0],
          w = f[1],
          E = g(
            function() {
              return Array.from(
                new Set(
                  r
                    .flatMap(function(e) {
                      return e[a];
                    })
                    .map(function(e) {
                      return '' + e;
                    }),
                ),
              ).sort();
            },
            [r, a],
          ),
          P = C(null),
          O = g(
            function() {
              if (y) return [];
              var e = E,
                t = d.trim().toLowerCase();
              return t
                ? e.filter(function(e) {
                    return e
                      .toLowerCase()
                      .trim()
                      .includes(t);
                  })
                : e;
            },
            [E, d, y],
          ),
          D = g(
            function() {
              if (!y) return [];
              var e = n,
                t = d.trim().toLowerCase();
              return t
                ? e.filter(function(e) {
                    return e
                      .toLowerCase()
                      .trim()
                      .includes(t);
                  })
                : e;
            },
            [d, n, y],
          ),
          N = y ? D : O,
          V = g(
            function() {
              return Object.fromEntries(
                n.map(function(e) {
                  return [e, !0];
                }),
              );
            },
            [n],
          );
        h(
          function() {
            var e;
            N.length > 300 && (null == (e = P.current) || e.forceUpdateGrid());
          },
          [N.length],
        );
        var T = function(e, t) {
          e.stopPropagation();
          var r = n.includes(t.value),
            a = n;
          (a = r
            ? a.filter(function(e) {
                return e !== t.value;
              })
            : a.concat(t.value)),
            o(a.length ? a : void 0);
        };
        return p.createElement(
          I,
          {
            position: 'bottom center',
            trigger: p.createElement('span', { onClick: $ }, c),
            className: 'MultiFilterPopup',
            on: 'click',
            onClick: $,
            popperDependencies: [N.length],
          },
          p.createElement(
            I.Content,
            { className: 'Filter MultiFilter' },
            p.createElement(A, {
              panes: [
                { menuItem: 'All', pane: p.createElement('div', null) },
                {
                  menuItem:
                    'Selected ' + (n.length ? '(' + n.length + ')' : ''),
                  pane: p.createElement('div', null),
                },
              ],
              activeIndex: y,
              onTabChange: function(e, t) {
                return w(t.activeIndex);
              },
            }),
            p.createElement(
              'div',
              { className: ' dropdown ui' },
              p.createElement(
                'div',
                {
                  className: 'menu transition visible',
                  style: { position: 'unset' },
                },
                p.createElement(S, {
                  icon: 'search',
                  iconPosition: 'left',
                  className: 'search',
                  placeholder: 'search',
                  value: d,
                  onChange: function(e, t) {
                    return m(t.value);
                  },
                  onClick: $,
                  action: {
                    color: 'red',
                    icon: { name: 'x', style: ee },
                    onClick: function() {
                      return m('');
                    },
                    title: 'Clear Search',
                    style: ee,
                  },
                }),
                N.length > 300 &&
                  p.createElement(L, {
                    ref: P,
                    height: 215,
                    rowCount: N.length,
                    rowHeight: 36,
                    rowRenderer: function(e) {
                      var t = N[e.index];
                      return p.createElement(
                        b.Item,
                        {
                          className: 'dropdownItem',
                          key: e.key,
                          value: t,
                          onClick: T,
                          style: e.style,
                        },
                        V[t] &&
                          p.createElement(k, {
                            color: 'green',
                            name: 'checkmark',
                          }),
                        _(t, i),
                      );
                    },
                    width: 400,
                    autoContainerWidth: !0,
                    className: 'dropdownMenu',
                  }),
                N.length <= 300 &&
                  p.createElement(
                    b.Menu,
                    {
                      scrolling: !0,
                      style: { maxWidth: '25vw', maxHeight: '215px' },
                    },
                    N.map(function(e, t) {
                      return p.createElement(
                        b.Item,
                        { key: t, value: e, onClick: T },
                        V[e] &&
                          p.createElement(k, {
                            color: 'green',
                            name: 'checkmark',
                          }),
                        _(e, i),
                      );
                    }),
                  ),
                p.createElement(
                  x.Group,
                  { fluid: !0, widths: 2 },
                  p.createElement(
                    x,
                    {
                      disabled: N.length > 500 || !!y,
                      title:
                        O.length > 500
                          ? 'Disabled due to large number of options'
                          : void 0,
                      positive: !0,
                      onClick: function(e) {
                        e.stopPropagation(),
                          o(Array.from(new Set([].concat(N, n)))),
                          u.clearSearchOnSelectOrClearAll && m('');
                      },
                    },
                    'Select All',
                  ),
                  p.createElement(
                    x,
                    {
                      negative: !0,
                      onClick: function(e) {
                        e.stopPropagation();
                        var t = n.filter(function(e) {
                          return !N.includes(e);
                        });
                        o(t.length ? t : void 0),
                          u.clearSearchOnSelectOrClearAll && m('');
                      },
                    },
                    'Clear',
                  ),
                ),
              ),
            ),
          ),
        );
      },
    },
    remoteMultiFilter: {
      filter: function(e, t, n) {
        return (
          !n ||
          0 === n.length ||
          !(Array.isArray(e[t]) ? e[t] : [e[t]]).every(function(e) {
            return !n.includes(e);
          })
        );
      },
      component: function(e) {
        var t = e.selectedOpts,
          n = void 0 === t ? te : t,
          r = e.data,
          a = e.field,
          o = e.onChange,
          i = e.accessor,
          l = e.trigger,
          c = void 0 === l ? Z : l,
          u = e.useLocal,
          s = Y(e, [
            'selectedOpts',
            'data',
            'field',
            'onChange',
            'accessor',
            'trigger',
            'useLocal',
          ]),
          d = v(''),
          m = d[0],
          y = d[1],
          w = v(0),
          E = w[0],
          P = w[1],
          D = v(!1),
          N = D[0],
          V = D[1],
          T = (function(e, t, n) {
            void 0 === n && (n = {});
            var r = g(function() {
                return function(e, t) {
                  switch (t.type) {
                    case 'loading':
                      return H({}, e, { error: void 0, loading: !0 });
                    case 'error':
                      return H({}, e, { error: t.payload, loading: !1 });
                    case 'data':
                      return H({}, e, {
                        error: void 0,
                        loading: !1,
                        data: t.payload,
                      });
                    case 'noRun':
                      return H({}, e, { error: void 0, loading: !1 });
                    default:
                      return e;
                  }
                };
              }, []),
              a = f(r, { loading: !0, error: {} }),
              o = a[0],
              i = a[1],
              l = f(function(e) {
                return e + 1;
              }, 0),
              c = l[1],
              u = n.processData,
              s = n.onError,
              d = n.withCredentials,
              m = n.deps,
              p = void 0 === m ? [] : m,
              v = n.runIf,
              C = n.cacheKey;
            return (
              h(function() {
                if (!v || v()) {
                  var n,
                    r = e + '‌' + C + '‌' + p.join('‌');
                  if (C && X[r]) {
                    var a = X[r];
                    return (
                      (a = u ? u(a) : a), void i({ type: 'data', payload: a })
                    );
                  }
                  return (
                    i({ type: 'loading' }),
                    Q.get(e, {
                      withCredentials: d,
                      params: t,
                      cancelToken: new Q.CancelToken(function(e) {
                        return (n = e);
                      }),
                    }).then(
                      function(e) {
                        C && (X[r] = e.data);
                        var t = u ? u(e.data) : e.data;
                        i({ type: 'data', payload: t });
                      },
                      function(e) {
                        Q.isCancel(e) ||
                          (i({ type: 'error', payload: e }), s && s(e));
                      },
                    ),
                    n
                  );
                }
                i({ type: 'noRun' });
              }, [].concat(p, [l[0]])),
              H({}, o, { trigger: c })
            );
          })(s.remoteUrl, s.remoteParams, {
            runIf: function() {
              return s.prefetch || N;
            },
            processData: function(e) {
              return e
                .map(function(e) {
                  return '' + e;
                })
                .sort();
            },
          }),
          G = T.data,
          q = void 0 === G ? te : G,
          R = T.loading,
          B = T.trigger;
        h(
          function() {
            s.prefetch || B();
          },
          [N, B, s.prefetch],
        );
        var F = g(
            function() {
              return u
                ? Array.from(
                    new Set(
                      r
                        .flatMap(function(e) {
                          return e[a];
                        })
                        .map(function(e) {
                          return '' + e;
                        }),
                    ),
                  ).sort()
                : te;
            },
            [r, u, a],
          ),
          M = g(
            function() {
              return F.length ? Array.from(new Set([].concat(q, F))).sort() : q;
            },
            [q, F],
          ),
          j = C(null),
          U = g(
            function() {
              if (E) return [];
              var e = M,
                t = m.trim().toLowerCase();
              return t
                ? e.filter(function(e) {
                    return e
                      .toLowerCase()
                      .trim()
                      .includes(t);
                  })
                : e;
            },
            [M, m, E],
          ),
          z = g(
            function() {
              if (!E) return [];
              var e = n,
                t = m.trim().toLowerCase();
              return t
                ? e.filter(function(e) {
                    return e
                      .toLowerCase()
                      .trim()
                      .includes(t);
                  })
                : e;
            },
            [m, n, E],
          ),
          K = E ? z : U,
          W = g(
            function() {
              return Object.fromEntries(
                n.map(function(e) {
                  return [e, !0];
                }),
              );
            },
            [n],
          );
        h(
          function() {
            var e;
            K.length > 300 && (null == (e = j.current) || e.forceUpdateGrid());
          },
          [K.length],
        );
        var J = function(e, t) {
          e.stopPropagation();
          var r = n.includes(t.value),
            a = n;
          (a = r
            ? a.filter(function(e) {
                return e !== t.value;
              })
            : a.concat(t.value)),
            o(a.length ? a : void 0);
        };
        return p.createElement(
          I,
          {
            position: 'bottom center',
            trigger: p.createElement('span', { onClick: $ }, c),
            className: 'MultiFilterPopup',
            on: 'click',
            onOpen: function() {
              return V(!0);
            },
            onClick: $,
            popperDependencies: [K.length],
          },
          p.createElement(
            I.Content,
            { className: 'Filter MultiFilter' },
            p.createElement(O, { active: R }),
            p.createElement(A, {
              panes: [
                { menuItem: 'All', pane: p.createElement('div', null) },
                {
                  menuItem:
                    'Selected ' + (n.length ? '(' + n.length + ')' : ''),
                  pane: p.createElement('div', null),
                },
              ],
              activeIndex: E,
              onTabChange: function(e, t) {
                return P(t.activeIndex);
              },
            }),
            p.createElement(
              'div',
              { className: ' dropdown ui' },
              p.createElement(
                'div',
                {
                  className: 'menu transition visible',
                  style: { position: 'unset' },
                },
                p.createElement(S, {
                  icon: 'search',
                  iconPosition: 'left',
                  className: 'search',
                  placeholder: 'search',
                  value: m,
                  onChange: function(e, t) {
                    return y(t.value);
                  },
                  onClick: $,
                  action: {
                    color: 'red',
                    icon: { name: 'x', style: ee },
                    onClick: function() {
                      return y('');
                    },
                    title: 'Clear Search',
                    style: ee,
                  },
                }),
                K.length > 300 &&
                  p.createElement(L, {
                    ref: j,
                    height: 215,
                    rowCount: K.length,
                    rowHeight: 36,
                    rowRenderer: function(e) {
                      var t = K[e.index];
                      return p.createElement(
                        b.Item,
                        {
                          className: 'dropdownItem',
                          key: e.key,
                          value: t,
                          onClick: J,
                          style: e.style,
                        },
                        W[t] &&
                          p.createElement(k, {
                            color: 'green',
                            name: 'checkmark',
                          }),
                        _(t, i),
                      );
                    },
                    width: 400,
                    autoContainerWidth: !0,
                    className: 'dropdownMenu',
                  }),
                K.length <= 300 &&
                  p.createElement(
                    b.Menu,
                    {
                      scrolling: !0,
                      style: { maxWidth: '25vw', maxHeight: '215px' },
                    },
                    K.map(function(e, t) {
                      return p.createElement(
                        b.Item,
                        { key: t, value: e, onClick: J },
                        W[e] &&
                          p.createElement(k, {
                            color: 'green',
                            name: 'checkmark',
                          }),
                        _(e, i),
                      );
                    }),
                  ),
                p.createElement(
                  x.Group,
                  { fluid: !0, widths: 2 },
                  p.createElement(
                    x,
                    {
                      disabled: K.length > 500 || !!E,
                      title:
                        U.length > 500
                          ? 'Disabled due to large number of options'
                          : void 0,
                      positive: !0,
                      onClick: function(e) {
                        e.stopPropagation(),
                          o(Array.from(new Set([].concat(K, n)))),
                          s.clearSearchOnSelectOrClearAll && y('');
                      },
                    },
                    'Select All',
                  ),
                  p.createElement(
                    x,
                    {
                      negative: !0,
                      onClick: function(e) {
                        e.stopPropagation();
                        var t = n.filter(function(e) {
                          return !K.includes(e);
                        });
                        o(t.length ? t : void 0),
                          s.clearSearchOnSelectOrClearAll && y('');
                      },
                    },
                    'Clear',
                  ),
                ),
              ),
            ),
          ),
        );
      },
    },
    dateFilter: {
      filter: function(e, t, n) {
        if (!n) return !0;
        var r = n.startDate,
          a = n.endDate,
          o = new Date(e[t]).toISOString().slice(0, 10);
        return !(
          (r && o <= new Date(r).toISOString().slice(0, 10)) ||
          (a && o >= new Date(a).toISOString().slice(0, 10))
        );
      },
      component: function(e) {
        var n = e.selectedOpts,
          r = void 0 === n ? ne : n,
          a = e.trigger,
          o = function(n, a) {
            var o,
              i = a.value,
              l = a.name;
            n.stopPropagation();
            var c = H({}, r, (((o = {})[l] = i), o));
            t(c, Boolean)
              ? null == e.onChange || e.onChange(c)
              : null == e.onChange || e.onChange();
          },
          i = r.startDate,
          l = r.endDate;
        return p.createElement(
          I,
          {
            position: 'bottom center',
            trigger: p.createElement(
              'span',
              { onClick: $ },
              void 0 === a ? Z : a,
            ),
            className: 'DateFilterDropdown',
            on: 'click',
            onClick: $,
          },
          p.createElement(
            I.Content,
            { className: 'Filter DateFilter' },
            p.createElement(S, {
              onClick: $,
              icon: {
                name: 'x',
                style: { pointerEvents: 'all' },
                onClick: function(e) {
                  o(e, { value: '', name: 'startDate' });
                },
                'aria-label': 'Clear',
              },
              label: { content: 'From:', color: 'blue', htmlFor: 'startDate' },
              labelPosition: 'left',
              type: 'date',
              fluid: !0,
              style: { cursor: 'pointer' },
              value: i,
              name: 'startDate',
              onChange: o,
            }),
            p.createElement(S, {
              onClick: $,
              icon: {
                name: 'x',
                style: { pointerEvents: 'all' },
                onClick: function(e) {
                  o(e, { value: '', name: 'endDate' });
                },
                'aria-label': 'Clear',
              },
              label: { content: 'Until:', color: 'blue', htmlFor: 'endDate' },
              labelPosition: 'left',
              type: 'date',
              fluid: !0,
              style: { cursor: 'pointer' },
              value: l,
              name: 'endDate',
              onChange: o,
            }),
          ),
        );
      },
    },
    numericFilter: {
      filter: fe(function(e, t, n) {
        switch (e) {
          case '=':
            return t == n;
          case '!=':
            return t != n;
          case '>=':
            return t >= n;
          case '>':
            return t > n;
          case '<=':
            return t <= n;
          case '<':
            return t < n;
          case 'null':
            return null == t;
          case '!null':
            return null != t;
          default:
            return !0;
        }
      }),
      component: se,
    },
    alphanumericFilter: {
      filter: fe(function(e, t, n) {
        var r = String(t).toUpperCase(),
          a = String(n).toUpperCase();
        switch (e) {
          case '=':
            return r === a;
          case '!=':
            return r !== a;
          case 'contains':
            return r.includes(a);
          case '!contains':
            return !r.includes(a);
          case 'starts':
            return r.startsWith(a);
          case 'ends':
            return r.endsWith(a);
          case 'null':
            return null == t;
          case '!null':
            return null != t;
          case 'empty':
            return '' === r;
          case '!empty':
            return '' !== r;
          default:
            return !0;
        }
      }),
      component: function(e) {
        var t,
          n = e.onChange,
          r = Y(e, ['onChange']),
          a = ue(null != (t = r.selectedOpts) ? t : [me], n, me),
          o = a.selectedOpts.map(function(e, t) {
            var n =
              t > 0
                ? p.createElement(b, {
                    'data-idx': t,
                    name: 'combination',
                    options: ie,
                    selection: !0,
                    value: e.combination,
                    onChange: a.handleChange,
                    className: 'combination',
                    compact: !0,
                  })
                : null;
            return p.createElement(
              'div',
              { className: 'filter', key: t },
              t > 0 &&
                ('&&' === e.combination
                  ? n
                  : p.createElement(P, { horizontal: !0 }, n)),
              p.createElement(
                'div',
                { className: 'values' },
                p.createElement(
                  'div',
                  null,
                  p.createElement(b, {
                    'data-idx': t,
                    name: 'comparison',
                    options: de,
                    selection: !0,
                    value: e.comparison,
                    onChange: a.handleChange,
                  }),
                  !oe[e.comparison] &&
                    p.createElement(S, {
                      'data-idx': t,
                      name: 'value',
                      value: e.value,
                      onChange: a.handleChange,
                    }),
                ),
                p.createElement(x, {
                  icon: { name: 'minus', color: 'red' },
                  compact: !0,
                  disabled: 0 === t,
                  onClick: a.handleRemove,
                  'data-idx': t,
                }),
              ),
            );
          });
        return p.createElement(
          I,
          {
            position: 'bottom center',
            trigger: p.createElement('span', { onClick: $ }, r.trigger),
            className: 'ComparisonFilterPopup',
            on: 'click',
            onOpen: a.handleOpen,
            onClick: $,
          },
          p.createElement(
            I.Content,
            { className: 'ComparisonFilter' },
            o,
            p.createElement(
              P,
              { horizontal: !0 },
              p.createElement(x, {
                className: 'add',
                icon: { name: 'plus circle', color: 'green', size: 'large' },
                compact: !0,
                onClick: a.handleAdd,
              }),
            ),
            p.createElement(
              x.Group,
              {
                fluid: !0,
                widths: 2,
                style: { position: 'sticky', bottom: '0px' },
              },
              p.createElement(
                x,
                { positive: !0, onClick: a.handleFilter },
                'Filter',
              ),
              p.createElement(
                x,
                { negative: !0, onClick: a.handleClear },
                'Clear',
              ),
            ),
          ),
        );
      },
    },
  },
  ge = { null: !0, '!null': !0, empty: !0, '!empty': !0 };
function fe(e) {
  return function(t, n, r) {
    if (!r) return !0;
    for (var a, o = !0, i = !1, l = K(r); !(a = l()).done; ) {
      var c = a.value;
      if ('||' === c.combination) {
        if (o && i) break;
        (o = !0), (i = !1);
      } else if (!1 === o) continue;
      (ge[c.comparison] || c.value) &&
        ((i = !0), e(c.comparison, t[n], c.value) || (o = !1));
    }
    return i && o;
  };
}
function he(e) {
  var t = m.useRef(e);
  return (
    m.useEffect(function() {
      t.current = e;
    }),
    t
  );
}
function ve(e, t, n) {
  var r,
    a,
    o = null == (r = ye[n || '']) ? void 0 : r.accessor;
  switch (
    ('object' == typeof t
      ? ((a = t.field), t.accessor && (o = t.accessor))
      : (a = t),
    typeof o)
  ) {
    case 'function':
      return o(e, a);
    case 'object':
      return o[e[a]];
    default:
      return e[o || a];
  }
}
function Ce(e) {
  if (null === e) return e;
  switch (typeof e) {
    case 'object':
      return e.field;
    default:
      return e;
  }
}
var ye = {
    number: {
      sortAccessor: function(e, t) {
        return Number(e[t]);
      },
      groupAccessor: function(e, t) {
        return '#' + e[t];
      },
    },
    date: {
      accessor: function(e, t) {
        if (e[t]) {
          var n = M(new Date(e[t]));
          return n.isValid() ? n : void 0;
        }
      },
      sortAccessor: function(e, t) {
        return e[t] && new Date(e[t]).toISOString().slice(0, 10);
      },
      groupAccessor: function(e, t) {
        return e[t] && M(new Date(e[t])).format('D/MMM/YYYY');
      },
      exportTemplate: function(e) {
        return e ? e.format('D/MMM/YYYY') : 'N/A';
      },
      template: function(e) {
        return e ? e.format('D/MMM/YYYY') : 'N/A';
      },
    },
    datetime: {
      accessor: function(e, t) {
        if (e[t]) {
          var n = M(new Date(e[t]));
          return n.isValid() ? n : void 0;
        }
      },
      sortAccessor: function(e, t) {
        return e[t] && new Date(e[t]);
      },
      groupAccessor: function(e, t) {
        return e[t] && M(new Date(e[t])).format('D/MMM/YYYY');
      },
      exportTemplate: function(e) {
        return e ? e.format('D/MMM/YYYY HH:mm:ss') : 'N/A';
      },
      template: function(e) {
        return e ? e.format('D/MMM/YYYY HH:mm:ss') : 'N/A';
      },
    },
  },
  we = [
    { text: '5', value: 5 },
    { text: '10', value: 10 },
    { text: '15', value: 15 },
    { text: '30', value: 30 },
    { text: '45', value: 45 },
    { text: '60', value: 60 },
    { text: '75', value: 75 },
    { text: '100', value: 100 },
    { text: '250', value: 250 },
    { text: '500', value: 500 },
    { text: '1000', value: 1e3 },
  ],
  Ee = function() {
    return {};
  },
  ke = [],
  be = p.createElement(
    k.Group,
    null,
    p.createElement(k, { name: 'filter', color: 'blue' }),
    p.createElement(k, { corner: !0, name: 'asterisk', color: 'blue' }),
  ),
  Pe = p.createElement(k, { name: 'filter' });
function Se(e) {
  var t = v(!1),
    n = t[0],
    r = t[1],
    a = v(e.generalSearch),
    l = a[0],
    c = a[1];
  h(
    function() {
      c(e.generalSearch);
    },
    [e.generalSearch],
  );
  var u = e.onGeneralSearch,
    s = g(
      function() {
        return o(function(e) {
          null == u || u(e);
        }, e.generalSearchDebounceTime);
      },
      [u, e.generalSearchDebounceTime],
    ),
    d = C(e.generalSearch);
  (d.current = e.generalSearch),
    h(
      function() {
        d.current !== l && s(l);
      },
      [l, s],
    );
  var m = e.columns,
    f = e.grouping,
    y = g(
      function() {
        return i(m, 'title');
      },
      [m],
    ),
    w = n
      ? y.map(function(t) {
          return p.createElement(
            b.Item,
            {
              key: t.id,
              onClick: function(n) {
                n.stopPropagation(),
                  null == e.onColumnVisibilityToggle ||
                    e.onColumnVisibilityToggle(t.id);
              },
            },
            !t.hidden &&
              p.createElement(k, { color: 'green', name: 'checkmark' }),
            t.title,
          );
        })
      : null,
    E = f.map(function(t) {
      var n = t.colId,
        r = m.find(function(e) {
          return e.id === t.colId;
        }),
        a = p.createElement(
          k,
          'asc' === t.sortOrder
            ? { name: 'long arrow alternate up' }
            : { name: 'long arrow alternate down' },
        );
      return p.createElement(
        x.Group,
        {
          key: n,
          inverted: !0,
          size: 'mini',
          compact: !0,
          style: { marginRight: '10px' },
        },
        p.createElement(
          x,
          {
            inverted: !0,
            size: 'mini',
            compact: !0,
            onClick: function() {
              return (function(t) {
                var n = { asc: 'desc', desc: 'asc' };
                null == e.onGroupChange ||
                  e.onGroupChange(
                    f.map(function(e) {
                      return e.colId === t
                        ? { colId: e.colId, sortOrder: n[e.sortOrder] }
                        : e;
                    }),
                  );
              })(n);
            },
          },
          a,
          (null == r ? void 0 : r.title) || n,
        ),
        p.createElement(
          x,
          {
            inverted: !0,
            size: 'mini',
            compact: !0,
            color: 'red',
            basic: !0,
            onClick: function() {
              return (function(t) {
                null == e.onGroupChange ||
                  e.onGroupChange(
                    f.filter(function(e) {
                      return e.colId !== t;
                    }),
                  );
              })(n);
            },
          },
          'X',
        ),
      );
    });
  return p.createElement(
    N,
    {
      compact: 'very',
      unstackable: !0,
      size: 'small',
      style: { marginBottom: 0, paddingBottom: 0 },
    },
    p.createElement(
      N.Header,
      null,
      (e.onGeneralSearch ||
        e.onColumnVisibilityToggle ||
        e.extraHeaderItem ||
        e.exportBaseName) &&
        p.createElement(
          N.Row,
          null,
          p.createElement(
            N.HeaderCell,
            {
              style: { backgroundColor: '#1678C2', color: 'white' },
              className: 'QHGrid--header',
            },
            e.onGeneralSearch &&
              p.createElement(S, {
                className: 'QHGrid--generalSearch',
                icon: 'search',
                iconPosition: 'left',
                placeholder: 'Search...',
                value: l,
                onChange: function(e, t) {
                  return c(t.value);
                },
                action: {
                  color: 'red',
                  icon: 'x',
                  onClick: function() {
                    return c('');
                  },
                  title: 'Clear Search',
                },
              }),
            e.onColumnVisibilityToggle &&
              p.createElement(
                b,
                {
                  scrolling: !0,
                  trigger: p.createElement(
                    x,
                    { inverted: !0 },
                    p.createElement(k, { name: 'columns' }),
                    'Columns',
                  ),
                  icon: null,
                  open: n,
                  onOpen: function() {
                    return r(!0);
                  },
                  onClose: function() {
                    return r(!1);
                  },
                  name: 'column',
                },
                p.createElement(b.Menu, null, w),
              ),
            e.extraHeaderItem,
            !e.loading &&
              !!e.exportBaseName &&
              p.createElement(G, {
                src:
                  'data:image/webp;base64,UklGRrYCAABXRUJQVlA4WAoAAAAQAAAAIgAAIgAAQUxQSIoAAAANcFpt27K8P5qo7u7wZGYgkhiCLZiATCW5jWDR3YlM4KT/fL8mUkRMAKm1Gfq+BBo/AOipWRHHmASQJNGNWQB+Yo7kmaY9okSZBMcLTJnSmKR332Tw330jWhYBxHRMqyrTjIieg8lkco4CSJv4tjUmxsdiMpkszABgJ0l/x8lkMvkgJwX/ffKSTkxWUDggBgIAAFAKAJ0BKiMAIwA+USCNRCOiIRccBZg4BQSyC8AA/78XUZqZ+IB6wGmZ8sB8GUsxx2/6X+QHpf/OWHHf0n3M+276AC9vjjuJedH4dU8PX6wcy161gSu1AZTYmgAA/vQZkRb1eznLfFZOpFT7zmzrr3/x2sflg9BPWFnUaQVqKd4IoGt2IrvFm/2gda5PT+Qk7x9J3tf1oY/9D64RNOVjgJt4H3FFLzDck4mvA/1hA0y/AYEL2y9yAZ3Ozv/9AnbS4jv+Wav+sLC/3sX6p/7E3JsbtiEHoGG8h//6BXI+BwmeKqmai99NN5v3r3L1MVLmK/R1Xsukcho2hTrm09nuPg9CEAoNH47/hGv3ILW/PiG0w1gTxhKgXFP/nrP/x6nqW5+439//kYogAzgl6puDT2mgDvOsnF8otZk4vz0qfzpByAFbZv4e+heFr/81Q3FsdiDweL3816loiAA8DFDB0OrAf7Uf3L7VzIM+Lz1zzKWp07f9miJfUSWpS0TU3yG8Ui+/rwn/zG+sOyUcMy5l0e/D0b6NuTpslnA8ayMXOX+rvRhD+5RuNoNbH6Fk9X+IYTr+yT6oPP191SSxFa7n/Fsir+OmRQWhhBQFwLAPBXHEQ6WndWf4ENqV/Atg+Zpk0zkTeH5FlXURY0v/y54Gqn/xwH/+rMMupaDcyjn3OqfXroAAAAAA',
                avatar: !0,
                size: 'mini',
                onClick: function() {
                  return e.onExportExcel();
                },
                style: { float: 'right', cursor: 'pointer' },
              }),
          ),
        ),
      e.onGroupChange &&
        p.createElement(
          N.Row,
          null,
          p.createElement(
            N.HeaderCell,
            {
              style: {
                backgroundColor: '#1678C2',
                color: 'white',
                borderRadius: 0,
                borderTop: '2px solid white',
                paddingTop: '4px',
                paddingBottom: '4px',
              },
              onDrop: function(t) {
                var n = t.dataTransfer.getData('colId');
                n &&
                  (f.find(function(e) {
                    return e.colId === n;
                  }) ||
                    null == e.onGroupChange ||
                    e.onGroupChange(
                      f
                        .map(function(e) {
                          return { colId: e.colId, sortOrder: e.sortOrder };
                        })
                        .concat({ colId: n, sortOrder: 'asc' }),
                    ));
              },
              onDragOver: function(e) {
                'colid' === e.dataTransfer.types[0] && e.preventDefault();
              },
            },
            E,
            'Drag a column header and drop it here to group by that column',
          ),
        ),
    ),
  );
}
function xe(e) {
  var t = e.enableDrag || !!e.onColumnReorder,
    n = v(-1),
    r = n[0],
    a = n[1],
    o = v(-1),
    i = o[0],
    l = o[1],
    c = function(e) {
      var t,
        n = e.currentTarget.dataset;
      e.dataTransfer.setData('colId', null != (t = n.id) ? t : ''),
        a(Number(n.index));
    },
    u = function(t) {
      if ((a(-1), t.dataTransfer.getData('colId'))) {
        var n = Number(t.currentTarget.dataset.index);
        Number.isNaN(n) ||
          -1 === r ||
          r === n ||
          null == e.onColumnReorder ||
          e.onColumnReorder(r, n);
      }
    },
    s = function() {
      a(-1), l(-1);
    },
    d = function(t) {
      e.onColumnReorder &&
        'colid' === t.dataTransfer.types[0] &&
        t.preventDefault();
    },
    m = function(e) {
      'colid' === e.dataTransfer.types[0] &&
        l(Number(e.currentTarget.dataset.index));
    },
    g = function(e) {
      if ('colid' === e.dataTransfer.types[0]) {
        var t = e.currentTarget.dataset;
        l(function(e) {
          return e === Number(t.index) ? -1 : e;
        });
      }
    },
    f = function(t) {
      var n = t.currentTarget.dataset.id;
      n && (null == e.onSort || e.onSort(n));
    },
    h = { borderLeft: '5px solid #1678C2' },
    C = { borderRight: '5px solid #1678C2' },
    y = e.columns
      .map(function(e, t) {
        return H({}, e, { index: t });
      })
      .filter(function(e) {
        return !e.hidden;
      })
      .map(function(n) {
        var a,
          o,
          l,
          v,
          y,
          w = Ce(n.field),
          E = n.index,
          k = n.id,
          b = {};
        e.onColumnReorder &&
          (r < i && i === E ? (b = C) : r > i && i === E && (b = h));
        var P = null == (a = n.filterable) ? void 0 : a.type,
          S = null == (o = n.filterable) ? void 0 : o.props,
          x = P ? (null == (l = pe[P]) ? void 0 : l.component) : void 0,
          I = null == (v = e.filters['' + w]) ? void 0 : v.value;
        return p.createElement(
          N.HeaderCell,
          H(
            {},
            n.headerAttributes,
            { className: -1 !== r ? 'dragging' : '', key: n.id },
            n.sortDisabled
              ? {}
              : {
                  sorted:
                    e.sortBy === k
                      ? 'asc' === e.sortOrder
                        ? 'ascending'
                        : 'descending'
                      : void 0,
                  onClick: f,
                },
            {
              'data-id': k,
              'data-index': E,
              draggable: t,
              onDragStart: c,
              onDrop: u,
              onDragEnd: s,
              onDragOver: d,
              onDragEnter: m,
              onDragLeave: g,
            },
            {
              style: H(
                {},
                b,
                null == (y = n.headerAttributes) ? void 0 : y.style,
              ),
              nowrap: 'true',
              collapsing: !0,
            },
          ),
          n.title,
          e.onFilterUpdate &&
            x &&
            p.createElement(
              x,
              H({}, S, {
                selectedOpts: I,
                onChange: e.onFilterUpdate(Ce(n.field), P),
                trigger: I ? be : Pe,
                data: e.rawData,
                field: Ce(n.field),
                filterType: P,
              }),
            ),
        );
      });
  return p.createElement(p.Fragment, null, y);
}
function Ie(e) {
  var t = v({}),
    n = t[0],
    r = t[1];
  h(
    function() {
      r({});
    },
    [e.grouping],
  );
  var a = function(e) {
      return function() {
        r(function(t) {
          var n;
          return H({}, t, (((n = {})[e] = !t[e]), n));
        });
      };
    },
    o = [],
    i = e.grouping.map(function(e) {
      return (function(e, t) {
        var n,
          r,
          a = null == (n = ye[t || '']) ? void 0 : n.groupAccessor;
        switch (
          ('object' == typeof e
            ? ((r = e.field), e.groupAccessor && (a = e.groupAccessor))
            : (r = e),
          typeof a)
        ) {
          case 'function':
            var o = a;
            return function(e) {
              return o(e, r);
            };
          case 'object':
            var i = a;
            return function(e) {
              return i[e[r]];
            };
          default:
            var l = a || r;
            return function(e) {
              return e[l];
            };
        }
      })(e.field, e.type);
    }),
    c = 0,
    u = e.slicedData.map(function(t, r) {
      var u = i.map(function(e) {
          return e(t);
        }),
        s =
          (null == e.rowLevelPropsCalc ? void 0 : e.rowLevelPropsCalc(t, c)) ||
          {},
        d = null == e.rowLevelStyleCalc ? void 0 : e.rowLevelStyleCalc(t, c);
      c += 1;
      for (var m = !1, g = -1, f = 0; f < u.length; ++f) {
        var h = u.slice(0, f + 1).join('‌');
        if (n[h]) {
          (m = !0), (g = f);
          break;
        }
      }
      var v = m
        ? null
        : p.createElement(
            N.Row,
            H({ style: d }, s, {
              key: e.itemKeyMap(t) || r,
              onClick: function(n) {
                return null == e.onRowClick
                  ? void 0
                  : e.onRowClick(n, t, e.startIndex + r);
              },
            }),
            e.grouping.map(function(e, t) {
              return p.createElement(N.Cell, {
                style: { backgroundColor: '#F2F2F2' },
                key: t,
                collapsing: !0,
              });
            }),
            e.visibleColumns.map(function(n) {
              var r,
                a = (r = n).template
                  ? r.template
                  : ye[r.type]
                  ? ye[r.type].template
                  : void 0;
              return p.createElement(
                N.Cell,
                { key: n.id || n.title },
                void 0 === a
                  ? ve(t, n.field, n.type)
                  : a(ve(t, n.field, n.type), t, e.additionalTemplateInfo),
              );
            }),
          );
      if (!e.grouping.length) return v;
      for (var C = -1, y = 0; y < u.length; ++y)
        -1 === C && o[y] !== u[y] && (C = y), C >= 0 && (o[y] = u[y]);
      if (-1 === C) return v;
      for (var w = [], E = C; E < u.length; ++E) {
        var b = e.grouping[E],
          P = u.slice(0, E + 1).join('‌'),
          S = u[E];
        (g > -1 && E > g) ||
          w.push(
            p.createElement(
              N.Row,
              { key: '' + b.title + P },
              l(E).map(function(e) {
                return p.createElement(N.Cell, {
                  style: { backgroundColor: '#F2F2F2' },
                  key: e,
                  collapsing: !0,
                });
              }),
              p.createElement(
                N.Cell,
                {
                  onClick: a(P),
                  colSpan: e.visibleColumns.length + e.grouping.length - E,
                  style: { cursor: 'pointer', backgroundColor: '#F2F2F2' },
                  collapsing: !0,
                },
                p.createElement(k, {
                  name: 'caret ' + (n[P] ? 'right' : 'down'),
                }),
                p.createElement('strong', null, b.title, ': ', S),
              ),
            ),
          );
      }
      return [].concat(w, [v]);
    });
  return p.createElement(p.Fragment, null, u);
}
function Ae(e) {
  var t,
    o,
    i,
    l = e.loadingMessage,
    s = void 0 === l ? 'Loading Data... Please Wait...' : l,
    d = e.emptyMessage,
    m = void 0 === d ? 'No Data Available' : d,
    f = e.height,
    y = void 0 === f ? '70vh' : f,
    w = e.generalSearchDebounceTime,
    E = void 0 === w ? 500 : w,
    k = e.grouping,
    P = void 0 === k ? ke : k,
    S = Y(e, [
      'loadingMessage',
      'emptyMessage',
      'height',
      'generalSearchDebounceTime',
      'grouping',
    ]),
    I = v(1),
    A = I[0],
    G = I[1],
    q = v(15),
    R = q[0],
    B = q[1],
    F = C(null),
    L = g(
      function() {
        var e = S.data;
        if (S.isPaginated) return e;
        if (!n(S.filters)) {
          var t = Object.entries(S.filters);
          e = e.filter(function(e) {
            for (var n, r = !0, a = K(t); !(n = a()).done; ) {
              var o,
                i = n.value,
                l = i[1],
                c = (null != (o = pe[l.type]) ? o : {}).filter;
              if (c && !(r = c(e, i[0], l.value))) break;
            }
            return r;
          });
        }
        if (S.generalSearch) {
          var r = S.generalSearch.toLowerCase();
          e = e.filter(function(e) {
            return Object.values(e)
              .join('‌')
              .toLowerCase()
              .includes(r);
          });
        }
        return e;
      },
      [S.data, S.generalSearch, S.filters, S.isPaginated],
    ),
    Q = he(S.onFiltered);
  h(
    function() {
      null == Q.current || Q.current(L);
    },
    [L, Q],
  ),
    h(
      function() {
        G(1);
      },
      [S.data, S.activePage],
    );
  var j = g(
      function() {
        return S.columns
          .map(function(e, t) {
            return H({}, e, { QHgridIndex: t });
          })
          .filter(function(e) {
            return !e.hidden;
          });
      },
      [S.columns],
    ),
    U = g(
      function() {
        var e = S.columns.filter(function(e) {
          return e.unique;
        });
        return function(t) {
          return e.length
            ? e
                .map(function(e) {
                  return ve(t, e.field, e.type);
                })
                .join(',')
            : void 0;
        };
      },
      [S.columns],
    ),
    z = S.columnsConfig,
    W = void 0 === z ? S.columns : z,
    X = j.length,
    _ = null != (t = S.totalRows) ? t : L.length,
    J = null != (o = S.activePage) ? o : A,
    Z = null != (i = S.itemsPerPage) ? i : R,
    $ = Math.ceil(_ / Z) || 1,
    ee = (J - 1) * Z || 0,
    te = J * Z > _ ? _ : J * Z,
    ne = ee,
    re = te;
  S.isPaginated && ((ne = 0), (re = Z));
  var ae = g(
      function() {
        return P.map(function(e) {
          var t = W.find(function(t) {
            return t.id === e.colId;
          }) || { field: '', title: '', type: '' };
          return H({}, e, { field: t.field, title: t.title, type: t.type });
        });
      },
      [P, W],
    ),
    oe = g(
      function() {
        return Object.fromEntries(
          W.map(function(e) {
            return [e.id, e];
          }),
        );
      },
      [W],
    ),
    ie = g(
      function() {
        if ((!P.length && !S.sortBy) || S.isPaginated) return L;
        var e = P.map(function(e) {
          return H({}, e, { col: oe[e.colId] });
        });
        if (S.sortBy && S.sortOrder) {
          var t = oe[S.sortBy];
          t && e.push({ col: t, sortOrder: S.sortOrder, colId: S.sortBy });
        }
        var n = e.map(function(e) {
            return (function(e, t) {
              var n,
                r,
                a = null == (n = ye[t || '']) ? void 0 : n.sortAccessor;
              switch (
                ('object' == typeof e
                  ? ((r = e.field), e.sortAccessor && (a = e.sortAccessor))
                  : (r = e),
                typeof a)
              ) {
                case 'function':
                  var o = a;
                  return function(e) {
                    return o(e, r);
                  };
                case 'object':
                  var i = a;
                  return function(e) {
                    return i[e[r]];
                  };
                default:
                  var l = a || r;
                  return function(e) {
                    var t = e[l];
                    return Array.isArray(t) ? t.toString() : t;
                  };
              }
            })(e.col.field, e.col.type);
          }),
          a = e.map(function(e) {
            return e.sortOrder;
          });
        return r(L, n, a);
      },
      [S.sortBy, S.sortOrder, P, L, oe, S.isPaginated],
    ),
    le = he(S.onSorted);
  h(
    function() {
      null == le.current || le.current(ie);
    },
    [ie, le],
  );
  var ce = g(
      function() {
        return ie.slice(ne, re);
      },
      [ie, ne, re],
    ),
    ue = S.onGroupChange,
    se = S.onColumnVisibilityToggle,
    de = S.loading,
    me = S.generalSearch,
    ge = S.onGeneralSearch,
    fe = S.exportBaseName,
    Ce = S.extraHeaderItem,
    be = function(e) {
      try {
        var t, n;
        void 0 === e && (e = null != (t = S.exportBaseName) ? t : '');
        var r = S.columns,
          a =
            null != (n = null == S.getExportData ? void 0 : S.getExportData())
              ? n
              : ie;
        return Promise.resolve(
          import('xlsx').catch(function() {
            alert('XSLX needs to be imported!');
          }),
        ).then(function(t) {
          if (t)
            return Promise.resolve(a).then(function(n) {
              var a = t.utils.book_new(),
                o = c(r, function(e) {
                  var t = !e.hidden,
                    n = e.hideOnExport,
                    a = !1;
                  if (e.exportIfVisible) {
                    var o = u(r, function(t) {
                      return t.id === e.exportIfVisible;
                    });
                    a = !(null != o && o.hidden);
                  }
                  return (t && !n) || a;
                }),
                i = n.map(function(e) {
                  return o.map(function(t) {
                    var n,
                      r,
                      a,
                      o = (n = t).exportTemplate
                        ? n.exportTemplate
                        : null == (r = ye[null != (a = n.type) ? a : ''])
                        ? void 0
                        : r.exportTemplate,
                      i = ve(e, t.field, t.type);
                    return (
                      o && (i = o(i, e, S.additionalTemplateInfo)),
                      Array.isArray(i) && (i = i.join(' : ')),
                      M.isDayjs(i) ? M(i).toDate() : i
                    );
                  });
                }),
                l = [
                  o.map(function(e) {
                    return e.exportTitle || e.title;
                  }),
                ].concat(i),
                s = o.map(function(e, t) {
                  return {
                    width: Math.max.apply(
                      Math,
                      i.map(function(e) {
                        var n = e[t],
                          r = n instanceof Date ? 18 : 1.5 * ('' + n).length;
                        return r > 70 ? 70 : r < 18 ? 18 : r;
                      }),
                    ),
                  };
                }),
                d = t.utils.aoa_to_sheet(l, { cellDates: !0 });
              (d['!autofilter'] = {
                ref: 'A1:' + t.utils.encode_col(o.length - 1) + '1',
              }),
                (d['!cols'] = s),
                t.utils.book_append_sheet(a, d, 'report'),
                t.writeFile(a, e + ' - ' + M().format('DD/MMM/YYYY') + '.xlsx');
            });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
  return (
    S.qhGridRef &&
      (S.qhGridRef.current = {
        bodyRef: F,
        exportExcel: be,
        data: ie,
        slicedData: ce,
        props: S,
        getSortedData: function() {
          return ie;
        },
      }),
    p.createElement(
      'div',
      { className: 'QHGrid', style: { width: '100%', margin: 0, padding: 0 } },
      p.createElement(
        D,
        { active: S.loading, className: 'QHGrid--loading' },
        p.createElement(O, null, s),
      ),
      p.createElement(Se, {
        columns: S.columns,
        grouping: P,
        onGroupChange: ue,
        onColumnVisibilityToggle: se,
        loading: de,
        generalSearch: me,
        onGeneralSearch: ge,
        onExportExcel: be,
        exportBaseName: fe,
        generalSearchDebounceTime: E,
        extraHeaderItem: Ce,
      }),
      p.createElement(
        'div',
        {
          className: 'QHGrid-body-div',
          style: {
            margin: 0,
            padding: 0,
            width: '100%',
            height: y,
            overflowX: 'auto',
            overflowY: 'auto',
          },
          ref: F,
        },
        p.createElement(
          N,
          {
            className: 'QHGrid--body',
            fixed: S.loading && !S.isPaginated,
            striped: !0,
            sortable: !!S.onSort,
            unstackable: !0,
            selectable: !0,
            celled: !0,
            compact: 'very',
            size: 'small',
            style: {
              marginTop: 0,
              paddingTop: 0,
              borderRadius: 0,
              marginBottom: 0,
              paddingBottom: 0,
              fontSize: 12,
            },
          },
          p.createElement(
            'colgroup',
            null,
            P.length > 0 && p.createElement('col', { span: P.length }),
            j.map(function(e) {
              return p.createElement('col', {
                style: e.columnStyle,
                key: e.id || e.title,
              });
            }),
          ),
          p.createElement(
            N.Header,
            null,
            p.createElement(
              N.Row,
              null,
              a(P, function(e, t) {
                return p.createElement(N.HeaderCell, {
                  key: t,
                  collapsing: !0,
                  style: { cursor: 'default' },
                });
              }),
              p.createElement(xe, {
                filters: S.filters,
                onFilterUpdate: S.onFilterUpdate,
                rawData: S.data,
                onColumnReorder: S.onColumnReorder,
                sortBy: S.sortBy,
                sortOrder: S.sortOrder,
                onSort: S.onSort,
                columns: S.columns,
                enableDrag: !!S.onGroupChange,
              }),
            ),
          ),
          p.createElement(
            N.Body,
            null,
            p.createElement(Ie, {
              startIndex: ee,
              rowLevelStyleCalc: S.rowLevelStyleCalc || Ee,
              rowLevelPropsCalc: S.rowLevelPropsCalc,
              additionalTemplateInfo: S.additionalTemplateInfo,
              onRowClick: S.onRowClick || Ee,
              itemKeyMap: U,
              grouping: ae,
              visibleColumns: j,
              slicedData: ce,
            }),
          ),
        ),
        !S.loading &&
          0 === _ &&
          p.createElement(
            'div',
            { className: 'QHGrid--empty' },
            n(m)
              ? null
              : 'string' == typeof m
              ? p.createElement(V, { icon: 'search', content: m })
              : m,
          ),
      ),
      p.createElement(
        N,
        {
          unstackable: !0,
          compact: 'very',
          size: 'small',
          style: { marginTop: 0, paddingTop: 0, borderRadius: 0, borderTop: 0 },
        },
        p.createElement(
          N.Footer,
          null,
          p.createElement(
            N.Row,
            null,
            p.createElement(
              N.HeaderCell,
              {
                colSpan: X + P.length,
                style: { marginTop: 0, borderRadius: 0, borderTop: 0 },
              },
              p.createElement(T, {
                size: 'mini',
                activePage: J,
                totalPages: $,
                onPageChange: function(e, t) {
                  var n = t.activePage;
                  'number' == typeof n &&
                    (S.activePage
                      ? null == S.onPageChange || S.onPageChange(n)
                      : G(n),
                    F.current && (F.current.scrollTop = 0));
                },
                firstItem: { content: '«' },
                lastItem: { content: '»' },
                nextItem: { content: '⟩' },
                prevItem: { content: '⟨' },
              }),
              p.createElement(
                'span',
                null,
                p.createElement(b, {
                  inline: !0,
                  options: we,
                  value: Z,
                  onChange: function(e, t) {
                    var n = t.value;
                    'number' == typeof n &&
                      (S.itemsPerPage
                        ? S.itemsPerPage !== n &&
                          (null == S.onItemsPerPageChange ||
                            S.onItemsPerPageChange(n))
                        : B(n));
                  },
                  upward: !0,
                  style: { marginLeft: '30px' },
                }),
                p.createElement('strong', null, 'Items Per Page'),
              ),
              p.createElement(
                'span',
                { style: { float: 'right', color: '#BBBBBB', fontSize: 16 } },
                ee + 1,
                ' - ',
                te,
                ' of ',
                _,
                ' Items',
                ' ',
                S.onReloadData &&
                  p.createElement(x, {
                    style: { marginLeft: 10 },
                    circular: !0,
                    icon: 'undo',
                    size: 'mini',
                    color: 'blue',
                    onClick: S.onReloadData,
                  }),
              ),
            ),
          ),
        ),
      ),
    )
  );
}
var Oe = [
    { key: 'No Colour', value: '', text: 'No Colour' },
    { key: 'red', value: 'red', text: 'Red' },
    { key: 'orange', value: 'orange', text: 'Orange' },
    { key: 'yellow', value: 'yellow', text: 'Yellow' },
    { key: 'olive', value: 'olive', text: 'Olive' },
    { key: 'green', value: 'green', text: 'Green' },
    { key: 'teal', value: 'teal', text: 'Teal' },
    { key: 'blue', value: 'blue', text: 'Blue' },
    { key: 'violet', value: 'violet', text: 'Violet' },
    { key: 'purple', value: 'purple', text: 'Purple' },
    { key: 'pink', value: 'pink', text: 'Pink' },
    { key: 'brown', value: 'brown', text: 'Brown' },
    { key: 'grey', value: 'grey', text: 'Grey' },
    { key: 'black', value: 'black', text: 'Black' },
    { key: 'AbbvieBlue', value: 'AbbvieBlue', text: 'AbbVie Blue' },
    { key: 'AbbviePurple', value: 'AbbviePurple', text: 'AbbVie Purple' },
    { key: 'AbbvieTeal', value: 'AbbvieTeal', text: 'AbbVie Teal' },
  ],
  De = [
    'hourglass',
    'hourglass start',
    'hourglass half',
    'hourglass end',
    'checkmark',
    'user',
    'star outline',
    'users',
    'warning sign',
    'times circle outline',
    'flask',
    'cocktail',
    'beer',
    'coffee',
    'certificate',
    'birthday cake',
    'magic',
    'plus circle',
    'plus square outline',
    'question',
    'pied piper',
    'smile outline',
    'frown outline',
    'thumbs up outline',
    'thumbs down outline',
    'hand rock',
    'hand paper',
    'hand scissors',
    'hand lizard',
    'hand spock',
  ].map(function(e) {
    return {
      key: e,
      value: e,
      text: e,
      content: p.createElement(q, { icon: e, content: e }),
    };
  });
De.unshift({ key: 'No Icon', value: '', text: 'No Icon' });
var Ne = (function(e) {
  function t() {
    for (var t, n = arguments.length, r = new Array(n), a = 0; a < n; a++)
      r[a] = arguments[a];
    return (
      ((t = e.call.apply(e, [this].concat(r)) || this).state = {
        name: '',
        group: 'No Group',
        color: '',
        icon: '',
        update: !1,
        groupOptions: [],
        groupError: !1,
        nameError: !1,
        quickViews: [],
        usedNames: {},
        values: null,
      }),
      (t.handleConfirmClick = function() {}),
      (t.handleGroupAddition = function(e, n) {
        var r = n.value;
        'string' == typeof r &&
          t.setState(function(e) {
            return {
              groupOptions: [{ text: r, value: r, key: r, icon: 'add' }].concat(
                e.groupOptions,
              ),
            };
          });
      }),
      (t.handleGroupChange = function(e, n) {
        var r = n.value;
        'string' == typeof r && t.setState({ group: r, groupError: !1 });
      }),
      (t.handleColorChange = function(e, n) {
        var r = n.value;
        'string' == typeof r && t.setState({ color: r });
      }),
      (t.handleIconChange = function(e, n) {
        var r = n.value;
        'string' == typeof r && t.setState({ icon: r });
      }),
      (t.handleNameChange = function(e, n) {
        var r = n.value,
          a = !(
            !t.state.usedNames[r.toLowerCase()] ||
            (t.props.values &&
              t.props.values.name.toLowerCase() === r.toLowerCase())
          );
        t.setState({ name: r, nameError: a });
      }),
      (t.handleUpdateChange = function(e, n) {
        var r = n.checked;
        'boolean' == typeof r && t.setState({ update: r });
      }),
      (t.handleSubmit = function(e) {
        e.preventDefault();
        var n = t.state,
          r = n.group,
          a = n.name,
          o = n.icon,
          i = n.color;
        (!t.state.usedNames[a] ||
          (t.props.values && t.props.values.name === a)) &&
          ('No Group' === r && (r = void 0),
          '' === o && (o = void 0),
          '' === i && (i = void 0),
          t.props.values
            ? null == t.props.onEditQuickView ||
              t.props.onEditQuickView(t.props.values.name, a, r, o, i, n.update)
            : null == t.props.onCreateQuickView ||
              t.props.onCreateQuickView(a, r, o, i),
          t.setState({
            name: '',
            nameError: !1,
            group: 'No Group',
            icon: '',
            color: '',
            update: !1,
          }),
          t.props.onClose());
      }),
      t
    );
  }
  return (
    j(t, e),
    (t.getDerivedStateFromProps = function(e, t) {
      if (!e.open) return null;
      var n = {};
      if (
        (e.quickViews !== t.quickViews && e.quickViews
          ? ((n.quickViews = e.quickViews),
            (n.usedNames = e.quickViews.reduce(function(e, t) {
              return (e[t.name.toLowerCase()] = !0), e;
            }, {})),
            (n.groupOptions = [
              { text: 'No Group', value: 'No Group', key: 'No Group' },
            ].concat(
              Object.keys(
                e.quickViews.reduce(function(e, t) {
                  return t.group && (e[t.group] = !0), e;
                }, {}),
              ).map(function(e) {
                return { key: e, text: e, value: e };
              }),
            )))
          : e.quickViews ||
            ((n.groupOptions = [
              { text: 'No Group', value: 'No Group', key: 'No Group' },
            ]),
            (n.usedNames = {})),
        e.values && e.values !== t.values)
      ) {
        n.values = e.values;
        var r = e.values,
          a = r.group,
          o = void 0 === a ? 'No Group' : a,
          i = r.icon,
          l = void 0 === i ? '' : i,
          c = r.color,
          u = void 0 === c ? '' : c;
        (n.name = r.name),
          (n.group = o),
          (n.icon = l),
          (n.color = u),
          (n.nameError = !1);
      } else
        !e.values &&
          t.values &&
          ((n.values = null),
          (n.name = ''),
          (n.group = 'No Group'),
          (n.icon = ''),
          (n.color = ''),
          (n.nameError = !1));
      return n;
    }),
    (t.prototype.render = function() {
      return this.props.open
        ? p.createElement(
            R,
            {
              open: this.props.open,
              onClose: this.props.onClose,
              as: B,
              onSubmit: this.handleSubmit,
            },
            p.createElement(
              R.Header,
              null,
              this.props.header ||
                (this.props.values
                  ? 'Edit QuickView: ' + this.props.values.name
                  : 'Create QuickView'),
            ),
            p.createElement(
              R.Content,
              null,
              p.createElement(
                B.Group,
                { widths: 'equal' },
                p.createElement(B.Input, {
                  label: p.createElement(
                    'label',
                    null,
                    'Name',
                    this.state.nameError &&
                      p.createElement(I, {
                        trigger: p.createElement(k, {
                          name: 'info circle',
                          style: { cursor: 'pointer' },
                        }),
                        inverted: !0,
                        content:
                          'Please choose another name. "' +
                          this.state.name +
                          '" is taken',
                      }),
                  ),
                  placeholder: 'Enter QuickView Name',
                  value: this.state.name,
                  onChange: this.handleNameChange,
                  error: this.state.nameError,
                  required: !0,
                }),
                p.createElement(B.Dropdown, {
                  allowAdditions: !0,
                  onChange: this.handleGroupChange,
                  onAddItem: this.handleGroupAddition,
                  options: this.state.groupOptions,
                  value: this.state.group,
                  selection: !0,
                  search: !0,
                  label: p.createElement(
                    'label',
                    null,
                    'Group',
                    p.createElement(I, {
                      trigger: p.createElement(k, {
                        name: 'question circle',
                        style: { cursor: 'pointer' },
                      }),
                      inverted: !0,
                      content:
                        'Used to separate quick views into groups. Type a name to add a new group.',
                    }),
                  ),
                  placeholder: 'Select or add a group name',
                }),
              ),
              p.createElement(
                B.Group,
                { widths: 'equal' },
                p.createElement(B.Select, {
                  label: p.createElement(
                    'label',
                    null,
                    'Color',
                    p.createElement(I, {
                      trigger: p.createElement(k, {
                        name: 'question circle',
                        style: { cursor: 'pointer' },
                      }),
                      inverted: !0,
                      content:
                        'Adds color to the Quick View Card in the Home Page',
                    }),
                  ),
                  options: Oe,
                  placeholder: 'Choose a color',
                  value: this.state.color,
                  onChange: this.handleColorChange,
                }),
                p.createElement(B.Dropdown, {
                  label: p.createElement(
                    'label',
                    null,
                    'Icon',
                    p.createElement(I, {
                      trigger: p.createElement(k, {
                        name: 'question circle',
                        style: { cursor: 'pointer' },
                      }),
                      inverted: !0,
                      content:
                        'Adds an Icon to the Quick View Card in the Home Page',
                    }),
                  ),
                  selection: !0,
                  options: De,
                  placeholder: 'Choose an Icon',
                  value: this.state.icon,
                  onChange: this.handleIconChange,
                }),
              ),
              this.props.values &&
                p.createElement(B.Checkbox, {
                  label: 'Update View Settings to the Current Settings',
                  inline: !0,
                  checked: this.state.update,
                  onChange: this.handleUpdateChange,
                }),
            ),
            p.createElement(R.Actions, {
              actions: [
                {
                  content: 'Cancel',
                  key: 'cancel',
                  negative: !0,
                  onClick: this.props.onClose,
                  type: 'button',
                },
                {
                  key: 'confirm',
                  content: 'Confirm',
                  positive: !0,
                  type: 'submit',
                },
              ],
            }),
          )
        : null;
    }),
    t
  );
})(w);
function Ve(e, t) {
  try {
    var n = e();
  } catch (e) {
    return t(e);
  }
  return n && n.then ? n.then(void 0, t) : n;
}
var Te = {},
  Ge = { ascending: 'asc', descending: 'desc', asc: 'asc', desc: 'desc' };
function qe(e) {
  var t = v(!1),
    r = t[0],
    a = t[1],
    o = v(!1),
    i = o[0],
    l = o[1],
    c = v(void 0),
    u = c[0],
    d = c[1],
    m = C(e.getView);
  m.current = e.getView;
  var f = v(Te),
    y = f[0],
    w = f[1],
    E = C(Te),
    P = e.disableChanges || !e.id;
  h(
    function() {
      P ||
        y === E.current ||
        (function() {
          try {
            var t = (function() {
              if (e.url) {
                var t = {
                    quickViewsId: e.id,
                    ownerId: e.ownerId,
                    quickViews: JSON.stringify(y),
                  },
                  n = Ve(
                    function() {
                      return Promise.resolve(
                        Q.put(e.url, t),
                      ).then(function() {});
                    },
                    function(e) {
                      alert('Failed to save quickviews to the service'),
                        console.error(e);
                    },
                  );
                if (n && n.then) return n.then(function() {});
              } else {
                var r = process.env.REACT_APP_NAME + '.' + e.id + '.quickViews';
                localStorage.setItem(r, JSON.stringify(y));
              }
            })();
            t && t.then && t.then(function() {});
          } catch (e) {
            Promise.reject(e);
          }
        })();
    },
    [y, e.ownerId, e.id, e.url, P],
  );
  var S = g(
      function() {
        return e.config ? (n(y) ? e.config || y : H({}, e.config, y)) : y;
      },
      [y, e.config],
    ),
    A = g(
      function() {
        return Object.entries(S).map(function(e) {
          return H({ name: e[0] }, e[1]);
        });
      },
      [S],
    ),
    O = (function(e) {
      var t = e.defaultValue,
        n = e.initialValue,
        r = e.value,
        a = v(void 0 === t ? (void 0 === n ? void 0 : n) : t);
      return [void 0 === r ? a[0] : r, a[1]];
    })({ defaultValue: e.defaultValue, value: e.value, initialValue: '' }),
    D = O[0],
    N = O[1],
    V = g(
      function() {
        return A.find(function(e) {
          return e.name === D;
        });
      },
      [D, A],
    );
  h(
    function() {
      V && (0, e.onViewChange)(V);
    },
    [V, e.onViewChange],
  ),
    h(
      function() {
        var t;
        return (
          (function() {
            try {
              var n = function() {
                  Object.values(r).forEach(function(e) {
                    var t, n;
                    (e.view.grouping =
                      null == (t = e.view.grouping)
                        ? void 0
                        : t.map(function(e) {
                            var t;
                            return {
                              colId: null != (t = e.colId) ? t : e.col_id,
                              sortOrder: e.sortOrder,
                            };
                          })),
                      (e.view.columns =
                        null == (n = e.view.columns)
                          ? void 0
                          : n.map(function(e) {
                              var t;
                              return {
                                id: null != (t = e.id) ? t : e.ID,
                                hidden: e.hidden,
                              };
                            })),
                      (e.view.sortOrder =
                        e.view.sortOrder && Ge[e.view.sortOrder]);
                  }),
                    (E.current = r),
                    w(r);
                },
                r = {},
                a = (function() {
                  if (e.id) {
                    var n = (function() {
                      if (e.url && e.ownerId) {
                        var n = {
                            quickViewsId: e.id,
                            ownerId: e.ownerId,
                            appName: process.env.REACT_APP_NAME,
                          },
                          a = Ve(
                            function() {
                              return Promise.resolve(
                                Q.get(e.url, {
                                  params: n,
                                  cancelToken: new Q.CancelToken(function(e) {
                                    return (t = e);
                                  }),
                                }),
                              ).then(function(e) {
                                r = e.data;
                              });
                            },
                            function(e) {
                              Q.isCancel(e) ||
                                (console.error(e),
                                alert(
                                  'Failed to get quickviews from the service',
                                ));
                            },
                          );
                        if (a && a.then) return a.then(function() {});
                      } else {
                        var o =
                          process.env.REACT_APP_NAME +
                          '.' +
                          e.id +
                          '.quickViews';
                        r = JSON.parse(localStorage.getItem(o) || '{}');
                      }
                    })();
                    if (n && n.then) return n.then(function() {});
                  }
                })();
              a && a.then ? a.then(n) : n();
            } catch (e) {
              Promise.reject(e);
            }
          })(),
          t
        );
      },
      [e.ownerId, e.id, e.url],
    );
  var T = function(t, n) {
      a(!1);
      var r = n['data-qv'];
      r.name === D
        ? e.onViewChange(r)
        : (null == e.onChange || e.onChange(r.name, r), N(r.name));
    },
    G = function(e, t) {
      e.stopPropagation(), a(!1);
      var n = t.name;
      w(function(e) {
        return Y(e, [n].map(W));
      });
    },
    q = function(e, t) {
      e.stopPropagation(), a(!1), d(t['data-qv']), l(!0);
    },
    R = function(t, n) {
      t.stopPropagation(),
        a(!1),
        null == e.onShare || e.onShare(n.name, n['data-qv']);
    },
    B = g(
      function() {
        return s(A, 'group');
      },
      [A],
    ),
    M = Object.entries(B).map(function(t) {
      var n = t[0],
        r = t[1].map(function(t) {
          return p.createElement(
            F.Item,
            {
              key: t.name,
              view: t.view,
              name: t.name,
              'data-custom': t.custom,
              'data-qv': t,
              onClick: T,
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            },
            t.icon &&
              p.createElement(k, {
                className: 'quickViewIcon ' + t.color,
                name: t.icon,
              }),
            t.name,
            p.createElement(
              'div',
              null,
              t.custom &&
                e.onShare &&
                p.createElement(x, {
                  title: 'Share View',
                  icon: p.createElement(k, {
                    name: 'share square',
                    color: 'black',
                  }),
                  compact: !0,
                  size: 'mini',
                  name: t.name,
                  'data-qv': t,
                  onClick: R,
                  className: 'QHGrid--ButtonClear',
                }),
              t.custom &&
                !e.disableChanges &&
                p.createElement(x, {
                  title: 'Edit View',
                  icon: p.createElement(k, { name: 'pencil', color: 'black' }),
                  compact: !0,
                  size: 'mini',
                  name: t.name,
                  'data-qv': t,
                  onClick: q,
                  className: 'QHGrid--ButtonClear',
                }),
              t.custom &&
                !e.disableChanges &&
                p.createElement(x, {
                  title: 'Delete View',
                  icon: p.createElement(k, { name: 'remove', color: 'red' }),
                  color: 'red',
                  compact: !0,
                  size: 'mini',
                  name: t.name,
                  onClick: G,
                  className: 'QHGrid--ButtonClear',
                }),
            ),
          );
        });
      return 'undefined' !== n
        ? p.createElement(
            b,
            { key: n, item: !0, text: n },
            p.createElement(b.Menu, null, r),
          )
        : r;
    });
  return e.disableMenu || (!A.length && P)
    ? null
    : p.createElement(
        p.Fragment,
        null,
        p.createElement(Ne, {
          open: i,
          onClose: function() {
            return l(function(e) {
              return !e;
            });
          },
          quickViews: A,
          onCreateQuickView: function(e, t, n, r) {
            var a = null == m.current ? void 0 : m.current();
            if (a) {
              var o = { custom: !0, group: t, icon: n, color: r, view: a };
              w(function(t) {
                var n;
                return H({}, t, (((n = {})[e] = o), n));
              });
            }
          },
          onEditQuickView: function(e, t, n, r, a, o) {
            var i = null == u ? void 0 : u.view;
            if ((o && (i = null == m.current ? void 0 : m.current()), i)) {
              var l = { custom: !0, group: n, icon: r, color: a, view: i };
              w(function(n) {
                var r;
                return H({}, Y(n, [e].map(W)), (((r = {})[t] = l), r));
              });
            }
          },
          values: u,
        }),
        p.createElement(
          I,
          {
            trigger: p.createElement(
              x,
              { inverted: !0 },
              p.createElement(k, { name: 'lightning' }),
              'Quick Views',
            ),
            position: 'bottom center',
            on: 'click',
            open: r,
            onOpen: function() {
              return a(!0);
            },
            onClose: function() {
              return a(!1);
            },
            name: 'quick',
            flowing: !0,
            basic: !0,
          },
          p.createElement(
            F,
            { vertical: !0, fluid: !0 },
            !P &&
              p.createElement(
                F.Item,
                {
                  onClick: function() {
                    a(!1), d(void 0), l(!0);
                  },
                },
                p.createElement(k, { name: 'add', color: 'green' }),
                'Add Quick View',
              ),
            M,
          ),
        ),
      );
}
var Re = {},
  Be = (function(t) {
    function n() {
      for (var n, r = arguments.length, a = new Array(r), o = 0; o < r; o++)
        a[o] = arguments[o];
      return (
        ((n = t.call.apply(t, [this].concat(a)) || this).state = {
          generalSearch: '',
          filters: {},
          columns: [],
          sortBy: null,
          sortOrder: null,
          grouping: [],
          itemsPerPage: 15,
          activePage: 1,
          columnsConfig: Fe(n.props.columnsConfig) || [],
        }),
        (n.qhGridRef = p.createRef()),
        (n.componentDidMount = function() {
          n.setState(
            n.props.uniqueCacheKey &&
              !n.props.quickView &&
              !n.props.defaultQuickView &&
              Re[n.props.uniqueCacheKey]
              ? Re[n.props.uniqueCacheKey]
              : {
                  columns: n.state.columnsConfig,
                  itemsPerPage: n.props.itemsPerPage || n.state.itemsPerPage,
                },
          );
        }),
        (n.componentDidUpdate = function(e, t) {
          if (n.props.columnsConfig !== e.columnsConfig) {
            var r = Fe(n.props.columnsConfig);
            n.setState({ columns: r, columnsConfig: r });
          }
          n.props.itemsPerPage !== e.itemsPerPage &&
            void 0 !== n.props.itemsPerPage &&
            n.setState({ itemsPerPage: n.props.itemsPerPage, activePage: 1 }),
            n.props.uniqueCacheKey &&
              n.state !== t &&
              (Re[n.props.uniqueCacheKey] = n.state);
        }),
        (n.setFilters = function(e) {
          n.setState({ filters: e });
        }),
        (n.setSort = function(e, t) {
          n.setState({ sortBy: e, sortOrder: t, activePage: 1 });
        }),
        (n.handleGeneralSearch = function(e) {
          n.setState({ generalSearch: e, activePage: 1 });
        }),
        (n.handleGroupChange = function(e) {
          n.setState({ grouping: e, activePage: 1 });
        }),
        (n.handleSort = function(e) {
          var t = e,
            r = 'asc';
          n.setState(function(n) {
            return (
              n.sortBy === e &&
                ('asc' === n.sortOrder
                  ? (r = 'desc')
                  : 'desc' === n.sortOrder && ((t = null), (r = null))),
              { sortBy: t, sortOrder: r, activePage: 1 }
            );
          });
        }),
        (n.handleColumnVisibilityToggle = function(e) {
          n.setState(function(t) {
            return {
              columns: t.columns.map(function(t) {
                return t.id === e && (t = H({}, t, { hidden: !t.hidden })), t;
              }),
            };
          });
        }),
        (n.handleColumnReorder = function(e, t) {
          n.setState(function(n) {
            var r = n.columns.slice();
            return r.splice(t, 0, r.splice(e, 1)[0]), { columns: r };
          });
        }),
        (n.handleFilterUpdate = function(t, r) {
          return function(a) {
            n.setState(
              void 0 === a
                ? function(n) {
                    return {
                      filters: e(n.filters, { $unset: [t] }),
                      activePage: 1,
                    };
                  }
                : function(e) {
                    var n;
                    return {
                      filters: H(
                        {},
                        e.filters,
                        ((n = {}), (n[t] = { value: a, type: r }), n),
                      ),
                      activePage: 1,
                    };
                  },
            );
          };
        }),
        (n.handleItemsPerPageChange = function(e) {
          null == n.props.onItemsPerPageChange ||
            n.props.onItemsPerPageChange(e),
            n.setState({ itemsPerPage: e, activePage: 1 });
        }),
        (n.handlePageChange = function(e) {
          n.setState({ activePage: e });
        }),
        (n.getView = function() {
          var e = n.state;
          return {
            grouping: e.grouping,
            sortBy: e.sortBy,
            sortOrder: e.sortOrder,
            generalSearch: e.generalSearch,
            activePage: e.activePage,
            itemsPerPage: e.itemsPerPage,
            filters: e.filters,
            columns: e.columns.map(function(e) {
              return { id: e.id, hidden: e.hidden };
            }),
          };
        }),
        (n.handleQuickViewChange = function(e) {
          var t = e.view.columns,
            r = n.state.columnsConfig;
          if (null == t || !t.length)
            return n.setState(H({}, e.view, { columns: r }));
          var a = d(r, 'id'),
            o = s(t, 'id'),
            i = r.filter(function(e) {
              return !o[e.id];
            }),
            l = t
              .reduce(function(e, t) {
                var n = a[t.id];
                return n && e.push(H({}, n, { hidden: t.hidden })), e;
              }, [])
              .concat(i);
          n.setState(H({}, e.view, { columns: l }));
        }),
        n
      );
    }
    return (
      j(n, t),
      (n.prototype.render = function() {
        var e = this.state,
          t = e.columnsConfig,
          n = e.itemsPerPage,
          r = e.activePage,
          a = this.props,
          o = a.height,
          i = a.generalSearchDebounceTime,
          l = a.onFiltered,
          c = a.onSorted,
          u = {
            generalSearch: e.generalSearch,
            filters: e.filters,
            columns: e.columns,
            sortBy: e.sortBy,
            sortOrder: e.sortOrder,
            grouping: e.grouping,
            data: a.data,
            exportBaseName: a.exportBaseName,
            loading: a.loading,
            loadingMessage: a.loadingMessage,
            additionalTemplateInfo: a.additionalTemplateInfo,
            rowLevelStyleCalc: a.rowLevelStyleCalc,
            rowLevelPropsCalc: a.rowLevelPropsCalc,
            onRowClick: a.onRowClick,
            onReloadData: a.fetchData,
            emptyMessage: a.emptyMessage,
            extraHeaderItem: p.createElement(
              p.Fragment,
              null,
              p.createElement(qe, {
                id: this.props.quickViewsId,
                config: this.props.quickViews,
                defaultValue: this.props.defaultQuickView,
                disableChanges: this.props.disableQuickViewEditing,
                onChange: this.props.onQuickViewChange,
                onShare: this.props.onQuickViewShare,
                ownerId: this.props.ownerId,
                url: this.props.quickViewsURL,
                value: this.props.quickView,
                onViewChange: this.handleQuickViewChange,
                getView: this.getView,
                disableMenu: this.props.disableQuickViewMenu,
              }),
              this.props.legend &&
                p.createElement(
                  I,
                  {
                    flowing: !0,
                    trigger: p.createElement(x, {
                      icon: 'info circle',
                      content: 'Legend',
                      inverted: !0,
                    }),
                  },
                  this.props.legend,
                ),
              this.props.extraHeaderItem,
            ),
            columnsConfig: t,
            itemsPerPage: n,
            onItemsPerPageChange: this.handleItemsPerPageChange,
            height: o,
            generalSearchDebounceTime: i,
            activePage: r,
            onPageChange: this.handlePageChange,
            onFiltered: l,
            onSorted: c,
          };
        return (
          this.props.disableGeneralSearch ||
            (u.onGeneralSearch = this.handleGeneralSearch),
          this.props.disableGrouping ||
            (u.onGroupChange = this.handleGroupChange),
          this.props.disableSort || (u.onSort = this.handleSort),
          this.props.disableColumnVisibilityToggle ||
            (u.onColumnVisibilityToggle = this.handleColumnVisibilityToggle),
          this.props.disableColumnReorder ||
            (u.onColumnReorder = this.handleColumnReorder),
          this.props.disableFilters ||
            (u.onFilterUpdate = this.handleFilterUpdate),
          p.createElement(Ae, H({}, u, { qhGridRef: this.qhGridRef }))
        );
      }),
      n
    );
  })(w);
function Fe(e) {
  return (
    void 0 === e && (e = []),
    e.map(function(e) {
      return H({}, e, { id: e.id || '' + Ce(e.field), hidden: !!e.hidden });
    })
  );
}
Be.defaultProps = { showError: function() {}, itemsPerPage: 15 };
var Me = {},
  Le = (function(t) {
    function n() {
      for (var n, r = arguments.length, a = new Array(r), o = 0; o < r; o++)
        a[o] = arguments[o];
      return (
        ((n = t.call.apply(t, [this].concat(a)) || this).state = {
          generalSearch: '',
          filters: {},
          columns: [],
          sortBy: null,
          sortOrder: null,
          grouping: [],
          itemsPerPage: 15,
          activePage: 1,
          columnsConfig: Qe(n.props.columnsConfig) || [],
        }),
        (n.qhGridRef = p.createRef()),
        (n.componentDidMount = function() {
          n.props.uniqueCacheKey &&
          !n.props.quickView &&
          !n.props.defaultQuickView &&
          Me[n.props.uniqueCacheKey]
            ? n.setState(Me[n.props.uniqueCacheKey])
            : (n.setState({
                columns: n.state.columnsConfig,
                itemsPerPage: n.props.itemsPerPage || n.state.itemsPerPage,
              }),
              n.fetchData());
        }),
        (n.componentDidUpdate = function(e, t) {
          if (n.props.columnsConfig !== e.columnsConfig) {
            var r = Qe(n.props.columnsConfig);
            n.setState({ columns: r, columnsConfig: r });
          }
          n.props.itemsPerPage !== e.itemsPerPage &&
            void 0 !== n.props.itemsPerPage &&
            n.setState({ itemsPerPage: n.props.itemsPerPage, activePage: 1 }),
            (n.state.columnsConfig === t.columnsConfig &&
              n.state.itemsPerPage === t.itemsPerPage &&
              n.state.generalSearch === t.generalSearch &&
              n.state.grouping === t.grouping &&
              n.state.sortBy === t.sortBy &&
              n.state.sortOrder === t.sortOrder &&
              n.state.filters === t.filters &&
              n.state.activePage === t.activePage) ||
              n.fetchData(),
            n.props.uniqueCacheKey &&
              n.state !== t &&
              (Me[n.props.uniqueCacheKey] = n.state);
        }),
        (n.setFilters = function(e) {
          n.setState({ filters: e, activePage: 1 });
        }),
        (n.setSort = function(e, t) {
          n.setState({ sortBy: e, sortOrder: t, activePage: 1 });
        }),
        (n.handleGeneralSearch = function(e) {
          n.setState({ generalSearch: e, activePage: 1 });
        }),
        (n.handleGroupChange = function(e) {
          n.setState({ grouping: e, activePage: 1 });
        }),
        (n.handleSort = function(e) {
          var t = e,
            r = 'asc';
          n.setState(function(n) {
            return (
              n.sortBy === e &&
                ('asc' === n.sortOrder
                  ? (r = 'desc')
                  : 'desc' === n.sortOrder && ((t = null), (r = null))),
              { sortBy: t, sortOrder: r, activePage: 1 }
            );
          });
        }),
        (n.handleColumnVisibilityToggle = function(e) {
          n.setState(function(t) {
            return {
              columns: t.columns.map(function(t) {
                return t.id === e && (t = H({}, t, { hidden: !t.hidden })), t;
              }),
            };
          });
        }),
        (n.handleColumnReorder = function(e, t) {
          n.setState(function(n) {
            var r = n.columns.slice();
            return r.splice(t, 0, r.splice(e, 1)[0]), { columns: r };
          });
        }),
        (n.handleFilterUpdate = function(t, r) {
          return function(a) {
            n.setState(
              void 0 === a
                ? function(n) {
                    return {
                      filters: e(n.filters, { $unset: [t] }),
                      activePage: 1,
                    };
                  }
                : function(e) {
                    var n;
                    return {
                      filters: H(
                        {},
                        e.filters,
                        ((n = {}), (n[t] = { value: a, type: r }), n),
                      ),
                      activePage: 1,
                    };
                  },
            );
          };
        }),
        (n.getView = function() {
          var e = n.state;
          return {
            grouping: e.grouping,
            sortBy: e.sortBy,
            sortOrder: e.sortOrder,
            generalSearch: e.generalSearch,
            activePage: e.activePage,
            itemsPerPage: e.itemsPerPage,
            filters: e.filters,
            columns: e.columns.map(function(e) {
              return { id: e.id, hidden: e.hidden };
            }),
          };
        }),
        (n.handleQuickViewChange = function(e) {
          var t = e.view.columns,
            r = n.state.columnsConfig;
          if (null == t || !t.length)
            return n.setState(H({}, e.view, { columns: r }));
          var a = d(r, 'id'),
            o = s(t, 'id'),
            i = r.filter(function(e) {
              return !o[e.id];
            }),
            l = t
              .reduce(function(e, t) {
                var n = a[t.id];
                return n && e.push(H({}, n, { hidden: t.hidden })), e;
              }, [])
              .concat(i);
          n.setState(H({}, e.view, { columns: l }));
        }),
        (n.handleItemsPerPageChange = function(e) {
          null == n.props.onItemsPerPageChange ||
            n.props.onItemsPerPageChange(e),
            n.setState({ itemsPerPage: e, activePage: 1 });
        }),
        (n.handlePageChange = function(e) {
          n.setState({ activePage: e });
        }),
        (n.fetchData = function() {
          var e = n.state;
          n.props.fetchData &&
            n.props.fetchData(
              {
                sortBy: e.sortBy,
                sortOrder: e.sortOrder,
                filters: e.filters,
                activePage: e.activePage,
                itemsPerPage: e.itemsPerPage,
                grouping: e.grouping,
                generalSearch: e.generalSearch,
                columns: e.columnsConfig,
              },
              n.props,
            );
        }),
        (n.fetchReportData = function() {
          var e,
            t = n.state;
          return null !=
            (e =
              null == n.props.fetchReportData
                ? void 0
                : n.props.fetchReportData(
                    {
                      sortBy: t.sortBy,
                      sortOrder: t.sortOrder,
                      filters: t.filters,
                      activePage: t.activePage,
                      itemsPerPage: t.itemsPerPage,
                      grouping: t.grouping,
                      generalSearch: t.generalSearch,
                      columns: t.columnsConfig,
                    },
                    n.props,
                  ))
            ? e
            : [];
        }),
        n
      );
    }
    return (
      j(n, t),
      (n.prototype.render = function() {
        var e = this.state,
          t = e.generalSearch,
          n = e.filters,
          r = e.columns,
          a = e.columnsConfig,
          o = e.sortBy,
          i = e.sortOrder,
          l = e.grouping,
          c = e.itemsPerPage,
          u = e.activePage,
          s = this.props,
          d = s.data,
          m = s.exportBaseName,
          g = s.loading,
          f = s.loadingMessage,
          h = s.additionalTemplateInfo,
          v = s.rowLevelStyleCalc,
          C = s.rowLevelPropsCalc,
          y = s.onRowClick,
          w = s.emptyMessage,
          E = s.height,
          k = s.totalRows,
          b = p.createElement(
            p.Fragment,
            null,
            p.createElement(qe, {
              id: this.props.quickViewsId,
              config: this.props.quickViews,
              defaultValue: this.props.defaultQuickView,
              disableChanges: this.props.disableQuickViewEditing,
              onChange: this.props.onQuickViewChange,
              onShare: this.props.onQuickViewShare,
              ownerId: this.props.ownerId,
              url: this.props.quickViewsURL,
              value: this.props.quickView,
              onViewChange: this.handleQuickViewChange,
              getView: this.getView,
              disableMenu: this.props.disableQuickViewMenu,
            }),
            this.props.legend &&
              p.createElement(
                I,
                {
                  flowing: !0,
                  trigger: p.createElement(x, {
                    icon: 'info circle',
                    content: 'Legend',
                    inverted: !0,
                  }),
                },
                this.props.legend,
              ),
            this.props.extraHeaderItem,
          ),
          P = {
            generalSearch: t,
            filters: n,
            columns: r,
            sortBy: o,
            sortOrder: i,
            grouping: l,
            data: d,
            exportBaseName: m,
            loading: g,
            loadingMessage: f,
            additionalTemplateInfo: h,
            rowLevelStyleCalc: v,
            rowLevelPropsCalc: C,
            onRowClick: y,
            onReloadData: this.fetchData,
            getExportData: this.props.fetchReportData && this.fetchReportData,
            emptyMessage: w,
            extraHeaderItem: b,
            columnsConfig: a,
            itemsPerPage: c,
            activePage: u,
            height: E,
            totalRows: k,
            onPageChange: this.handlePageChange,
            onItemsPerPageChange: this.handleItemsPerPageChange,
            isPaginated: !0,
          };
        return (
          this.props.disableGeneralSearch ||
            (P.onGeneralSearch = this.handleGeneralSearch),
          this.props.disableGrouping ||
            (P.onGroupChange = this.handleGroupChange),
          this.props.disableSort || (P.onSort = this.handleSort),
          this.props.disableColumnVisibilityToggle ||
            (P.onColumnVisibilityToggle = this.handleColumnVisibilityToggle),
          this.props.disableColumnReorder ||
            (P.onColumnReorder = this.handleColumnReorder),
          this.props.disableFilters ||
            (P.onFilterUpdate = this.handleFilterUpdate),
          p.createElement(Ae, H({}, P, { qhGridRef: this.qhGridRef }))
        );
      }),
      n
    );
  })(E);
function Qe(e) {
  return (
    void 0 === e && (e = []),
    e.map(function(e) {
      return H({}, e, { id: e.id || '' + Ce(e.field), hidden: !!e.hidden });
    })
  );
}
Le.defaultProps = { showError: function() {}, itemsPerPage: 15 };
export {
  Be as EZGrid,
  Le as EZNetworkGrid,
  Ae as QHGrid,
  Ne as QuickViewModal,
  qe as QuickViews,
  pe as filterTypes,
  Ce as getField,
  ve as getFieldValue,
  ye as typeMap,
};
