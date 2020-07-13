// import React, { useState, useEffect } from 'react';
export function updateUrl(
  propsParam,
  stateParam,
  stateChanges,
  type,
  optionalCallback,
  searchCriteriaChange,
  scTab,
) {
  if (!searchCriteriaChange) {
    // const [urlVar, setUrlFunc] = useState('/differential');
    let tab, tabIndex, lastTabIndex;
    // clear url
    propsParam.history.push('');

    if (type === 'tabChange') {
      lastTabIndex = stateParam.activeIndex;
      tabIndex = lastTabIndex === 2 ? 1 : 2;
      tab = tabIndex === 2 ? 'enrichment' : 'differential';
    } else {
      const pathname = propsParam.location.pathname;

      const enrichment = pathname.includes('enrichment');
      tab = enrichment ? 'enrichment' : 'differential';
      tabIndex = enrichment ? 2 : 1;
    }

    if (tab === 'differential') {
      const differentialStudyQuery = stateParam.differentialStudy || '';
      const differentialModelQuery = stateParam.differentialModel || '';
      const differentialTestQuery =
        stateParam.differentialTest !== undefined
          ? stateParam.differentialTest.trim()
          : '';
      const differentialProteinSiteQuery =
        stateParam.differentialProteinSite || '';

      const differentialStudyReplaced = differentialStudyQuery
        .replace(/ /gi, '–')
        .replace('/');
      const differentialModelReplaced = differentialModelQuery.replace(
        / /gi,
        '–',
      );
      const differentialTestReplaced = differentialTestQuery.replace(
        / /gi,
        '–',
      );
      const differentialProteinSiteReplaced = differentialProteinSiteQuery.replace(
        / /gi,
        '–',
      );
      const differentialStudy = encodeURI(differentialStudyReplaced);
      const differentialModel = encodeURI(differentialModelReplaced);
      const differentialTest = encodeURI(differentialTestReplaced);
      const differentialProteinSite = encodeURI(
        differentialProteinSiteReplaced,
      );
      if (differentialProteinSite !== '') {
        propsParam.history.push(
          tab +
            '/' +
            differentialStudy +
            '/' +
            differentialModel +
            '/' +
            differentialTest +
            '/' +
            differentialProteinSite,
        );
      } else if (differentialTest !== '') {
        propsParam.history.push(
          tab +
            '/' +
            differentialStudy +
            '/' +
            differentialModel +
            '/' +
            differentialTest,
        );
      } else if (differentialModel !== '') {
        propsParam.history.push(
          tab + '/' + differentialStudy + '/' + differentialModel,
        );
      } else if (differentialStudy !== '') {
        propsParam.history.push(tab + '/' + differentialStudy);
      } else if (tab !== '') {
        propsParam.history.push(tab);
      }
      // });
      // }, [url]);
    } else if (tab === 'enrichment') {
      const enrichmentStudyQuery = stateParam.enrichmentStudy || '';
      const enrichmentModelQuery = stateParam.enrichmentModel || '';
      const enrichmentAnnotationQuery = stateParam.enrichmentAnnotation || '';
      const enrichmentDescriptionAndTestQuery =
        stateParam.enrichmentDescriptionAndTest || '';

      const enrichmentStudyReplaced = enrichmentStudyQuery.replace(/ /gi, '–');
      const enrichmentModelReplaced = enrichmentModelQuery.replace(/ /gi, '–');
      const enrichmentAnnotationReplaced = enrichmentAnnotationQuery.replace(
        / /gi,
        '–',
      );
      const enrichmentDescriptionAndTestReplaced = enrichmentDescriptionAndTestQuery.replace(
        / /gi,
        '–',
      );

      const enrichmentStudy = encodeURI(enrichmentStudyReplaced);
      const enrichmentModel = encodeURI(enrichmentModelReplaced);
      const enrichmentAnnotation = encodeURI(enrichmentAnnotationReplaced);
      const enrichmentDescriptionAndTest = encodeURI(
        enrichmentDescriptionAndTestReplaced,
      );
      if (enrichmentDescriptionAndTest !== '') {
        propsParam.history.push(
          tab +
            '/' +
            enrichmentStudy +
            '/' +
            enrichmentModel +
            '/' +
            enrichmentAnnotation +
            '/' +
            enrichmentDescriptionAndTest,
        );
      } else if (enrichmentAnnotation !== '') {
        propsParam.history.push(
          tab +
            '/' +
            enrichmentStudy +
            '/' +
            enrichmentModel +
            '/' +
            enrichmentAnnotation,
        );
      } else if (enrichmentModel !== '') {
        propsParam.history.push(
          tab + '/' + enrichmentStudy + '/' + enrichmentModel,
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
    // condense this later!
  } else {
    // just a search criteria change
    propsParam.history.push('');
    if (scTab === 'differential') {
      const differentialStudyQuery2 = stateChanges.differentialStudy || '';
      const differentialModelQuery2 = stateChanges.differentialModel || '';
      const differentialTestQuery2 = stateChanges.differentialTest || '';
      const differentialProteinSiteQuery2 =
        stateChanges.differentialProteinSite || '';
      const differentialStudyReplaced = differentialStudyQuery2.replace(
        / /gi,
        '–',
      );
      const differentialModelReplaced = differentialModelQuery2.replace(
        / /gi,
        '–',
      );
      const differentialTestReplaced = differentialTestQuery2.replace(
        / /gi,
        '–',
      );
      const differentialProteinSiteReplaced = differentialProteinSiteQuery2.replace(
        / /gi,
        '–',
      );
      const differentialStudy = encodeURI(differentialStudyReplaced);
      const differentialModel = encodeURI(differentialModelReplaced);
      const differentialTest = encodeURI(differentialTestReplaced);
      const differentialProteinSite = encodeURI(
        differentialProteinSiteReplaced,
      );
      if (differentialProteinSite !== '') {
        propsParam.history.push(
          scTab +
            '/' +
            differentialStudy +
            '/' +
            differentialModel +
            '/' +
            differentialTest +
            '/' +
            differentialProteinSite,
        );
      } else if (differentialTest !== '') {
        propsParam.history.push(
          scTab +
            '/' +
            differentialStudy +
            '/' +
            differentialModel +
            '/' +
            differentialTest,
        );
      } else if (differentialModel !== '') {
        propsParam.history.push(
          scTab + '/' + differentialStudy + '/' + differentialModel,
        );
      } else if (differentialStudy !== '') {
        propsParam.history.push(scTab + '/' + differentialStudy);
      } else if (scTab !== '') {
        propsParam.history.push(scTab);
      }
      // });
      // }, [url]);
    } else if (scTab === 'enrichment') {
      const enrichmentStudyQuery2 = stateChanges.enrichmentStudy || '';
      const enrichmentModelQuery2 = stateChanges.enrichmentModel || '';
      const enrichmentAnnotationQuery2 =
        stateChanges.enrichmentAnnotation || '';
      const enrichmentDescriptionAndTestQuery2 =
        stateChanges.enrichmentDescriptionAndTest || '';

      const enrichmentStudyReplaced = enrichmentStudyQuery2.replace(/ /gi, '–');
      const enrichmentModelReplaced = enrichmentModelQuery2.replace(/ /gi, '–');
      const enrichmentAnnotationReplaced = enrichmentAnnotationQuery2.replace(
        / /gi,
        '–',
      );
      const enrichmentDescriptionAndTestReplaced = enrichmentDescriptionAndTestQuery2.replace(
        / /gi,
        '–',
      );

      const enrichmentStudy = encodeURI(enrichmentStudyReplaced);
      const enrichmentModel = encodeURI(enrichmentModelReplaced);
      const enrichmentAnnotation = encodeURI(enrichmentAnnotationReplaced);
      const enrichmentDescriptionAndTest = encodeURI(
        enrichmentDescriptionAndTestReplaced,
      );
      if (enrichmentDescriptionAndTest !== '') {
        propsParam.history.push(
          scTab +
            '/' +
            enrichmentStudy +
            '/' +
            enrichmentModel +
            '/' +
            enrichmentAnnotation +
            '/' +
            enrichmentDescriptionAndTest,
        );
      } else if (enrichmentAnnotation !== '') {
        propsParam.history.push(
          scTab +
            '/' +
            enrichmentStudy +
            '/' +
            enrichmentModel +
            '/' +
            enrichmentAnnotation,
        );
      } else if (enrichmentModel !== '') {
        propsParam.history.push(
          scTab + '/' + enrichmentStudy + '/' + enrichmentModel,
        );
      } else if (enrichmentStudy !== '') {
        propsParam.history.push(scTab + '/' + enrichmentStudy);
      } else if (scTab !== '') {
        propsParam.history.push(scTab);
      }
      // });
      // }, [url]);
    } else return;
  }
}
