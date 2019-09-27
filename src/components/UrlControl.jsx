// import React, { useState, useEffect } from 'react';

export function updateUrl(propsParam, stateParam, type, optionalCallback) {
  // const [urlVar, setUrlFunc] = useState("/pepplot");
  let tab, tabIndex, lastTabIndex;
  // clear url
  propsParam.history.push('');

  if (type === 'tabChange') {
    lastTabIndex = stateParam.activeIndex;
    tabIndex = lastTabIndex === 3 ? 2 : 3;
    tab = tabIndex === 3 ? 'enrichment' : 'pepplot';
  } else {
    const pathname = propsParam.location.pathname;
    const enrichment = pathname.includes('enrichment');
    tab = enrichment ? 'enrichment' : 'pepplot';
    tabIndex = enrichment ? 3 : 2;
  }

  const study = stateParam.study || '';
  const model = stateParam.model || '';
  const test = stateParam.test || '';
  // const study = studyQuery.replace(, "")
  // const model = modelQuery.replace(, "")
  // const test = testQuery.replace(, "")

  if (test !== '') {
    propsParam.history.push(tab + '/' + study + '/' + model + '/' + test);
    // } else if (model !== "") {
    //     propsParam.history.push(tab + '/' + study + '/' + model);
    // } else if (study !== "") {
    //     propsParam.history.push(tab + '/' + study);
  } else if (tab !== '') {
    propsParam.history.push(tab);
  }
  // });
  // }, [url]);

  if (optionalCallback !== undefined) {
    optionalCallback(tabIndex);
  }
}
