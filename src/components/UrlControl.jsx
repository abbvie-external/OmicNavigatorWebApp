// import React, { useState, useEffect } from 'react';

export function updateUrl(propsParam, stateParam, type, optionalCallback) {
  // const [urlVar, setUrlFunc] = useState('/pepplot');
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

  if (tab === 'pepplot') {
    const pepplotStudy = stateParam.pepplotStudy || '';
    const pepplotModel = stateParam.pepplotModel || '';
    const pepplotTest = stateParam.pepplotTest || '';
    // const pepplotStudy = pepplotStudyQuery.replace(, '')
    // const pepplotModel = pepplotModelQuery.replace(, '')
    // const pepplotTest = pepplotTestQuery.replace(, '')

    if (pepplotTest !== '') {
      propsParam.history.push(
        tab + '/' + pepplotStudy + '/' + pepplotModel + '/' + pepplotTest
      );
    } else if (pepplotModel !== '') {
      propsParam.history.push(tab + '/' + pepplotStudy + '/' + pepplotModel);
    } else if (pepplotStudy !== '') {
      propsParam.history.push(tab + '/' + pepplotStudy);
    } else if (tab !== '') {
      propsParam.history.push(tab);
    }
    // });
    // }, [url]);
  } else if (tab === 'enrichment') {
    const enrichmentStudy = stateParam.enrichmentStudy || '';
    const enrichmentModel = stateParam.enrichmentModel || '';
    const enrichmentAnnotation = stateParam.enrichmentAnnotation || '';
    // const enrichmentStudy = enrichmentStudyQuery.replace(, '')
    // const enrichmentModel = enrichmentModelQuery.replace(, '')
    // const enrichmentAnnotation = enrichmentAnnotationQuery.replace(, '')

    if (enrichmentAnnotation !== '') {
      propsParam.history.push(
        tab +
          '/' +
          enrichmentStudy +
          '/' +
          enrichmentModel +
          '/' +
          enrichmentAnnotation
      );
    } else if (enrichmentModel !== '') {
      propsParam.history.push(
        tab + '/' + enrichmentStudy + '/' + enrichmentModel
      );
    } else if (enrichmentStudy !== '') {
      propsParam.history.push(tab + '/' + enrichmentStudy);
    } else if (tab !== '') {
      propsParam.history.push(tab);
    }
    // });
    // }, [url]);
  } else return;

  if (optionalCallback !== undefined) {
    optionalCallback(tabIndex);
  }
}
