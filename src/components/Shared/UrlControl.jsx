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
    // const [urlVar, setUrlFunc] = useState('/pepplot');
    let tab, tabIndex, lastTabIndex;
    // clear url
    propsParam.history.push('');

    if (type === 'tabChange') {
      lastTabIndex = stateParam.activeIndex;
      tabIndex = lastTabIndex === 2 ? 1 : 2;
      tab = tabIndex === 2 ? 'enrichment' : 'pepplot';
    } else {
      const pathname = propsParam.location.pathname;

      const enrichment = pathname.includes('enrichment');
      tab = enrichment ? 'enrichment' : 'pepplot';
      tabIndex = enrichment ? 2 : 1;
    }

    if (tab === 'pepplot') {
      const pepplotStudyQuery = stateParam.pepplotStudy || '';
      const pepplotModelQuery = stateParam.pepplotModel || '';
      const pepplotTestQuery =
        stateParam.pepplotTest !== undefined
          ? stateParam.pepplotTest.trim()
          : '';
      const pepplotProteinSiteQuery = stateParam.pepplotProteinSite || '';

      const pepplotStudyReplaced = pepplotStudyQuery
        .replace(/ /gi, '–')
        .replace('/');
      const pepplotModelReplaced = pepplotModelQuery.replace(/ /gi, '–');
      const pepplotTestReplaced = pepplotTestQuery.replace(/ /gi, '–');
      const pepplotProteinSiteReplaced = pepplotProteinSiteQuery.replace(
        / /gi,
        '–',
      );
      const pepplotStudy = encodeURI(pepplotStudyReplaced);
      const pepplotModel = encodeURI(pepplotModelReplaced);
      const pepplotTest = encodeURI(pepplotTestReplaced);
      const pepplotProteinSite = encodeURI(pepplotProteinSiteReplaced);
      if (pepplotProteinSite !== '') {
        propsParam.history.push(
          tab +
            '/' +
            pepplotStudy +
            '/' +
            pepplotModel +
            '/' +
            pepplotTest +
            '/' +
            pepplotProteinSite,
        );
      } else if (pepplotTest !== '') {
        propsParam.history.push(
          tab + '/' + pepplotStudy + '/' + pepplotModel + '/' + pepplotTest,
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
    if (scTab === 'pepplot') {
      const pepplotStudyQuery2 = stateChanges.pepplotStudy || '';
      const pepplotModelQuery2 = stateChanges.pepplotModel || '';
      const pepplotTestQuery2 = stateChanges.pepplotTest || '';
      const pepplotProteinSiteQuery2 = stateChanges.pepplotProteinSite || '';
      const pepplotStudyReplaced = pepplotStudyQuery2.replace(/ /gi, '–');
      const pepplotModelReplaced = pepplotModelQuery2.replace(/ /gi, '–');
      const pepplotTestReplaced = pepplotTestQuery2.replace(/ /gi, '–');
      const pepplotProteinSiteReplaced = pepplotProteinSiteQuery2.replace(
        / /gi,
        '–',
      );
      const pepplotStudy = encodeURI(pepplotStudyReplaced);
      const pepplotModel = encodeURI(pepplotModelReplaced);
      const pepplotTest = encodeURI(pepplotTestReplaced);
      const pepplotProteinSite = encodeURI(pepplotProteinSiteReplaced);
      if (pepplotProteinSite !== '') {
        propsParam.history.push(
          scTab +
            '/' +
            pepplotStudy +
            '/' +
            pepplotModel +
            '/' +
            pepplotTest +
            '/' +
            pepplotProteinSite,
        );
      } else if (pepplotTest !== '') {
        propsParam.history.push(
          scTab + '/' + pepplotStudy + '/' + pepplotModel + '/' + pepplotTest,
        );
      } else if (pepplotModel !== '') {
        propsParam.history.push(
          scTab + '/' + pepplotStudy + '/' + pepplotModel,
        );
      } else if (pepplotStudy !== '') {
        propsParam.history.push(scTab + '/' + pepplotStudy);
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
