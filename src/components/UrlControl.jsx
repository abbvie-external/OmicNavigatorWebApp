// import React, { useState, useEffect } from 'react';

export function updateUrl(
  propsParam,
  stateParam,
  stateChanges,
  type,
  optionalCallback,
  searchCriteriaChange,
  scTab
) {
  if (!searchCriteriaChange) {
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
      const pepplotStudyQuery = stateParam.pepplotStudy || '';
      const pepplotModelQuery = stateParam.pepplotModel || '';
      const pepplotTestQuery = stateParam.pepplotTest || '';
      const pepplotProteinSiteQuery = stateParam.pepplotProteinSite || '';
      const pepplotStudy = pepplotStudyQuery.replace(/ /gi, '-');
      const pepplotModel = pepplotModelQuery.replace(/ /gi, '-');
      const pepplotTest = pepplotTestQuery.replace(/ /gi, '-');
      const pepplotProteinSite = pepplotProteinSiteQuery.replace(/ /gi, '-');

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
            pepplotProteinSite
        );
      } else if (pepplotTest !== '') {
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
      const enrichmentStudyQuery = stateParam.enrichmentStudy || '';
      const enrichmentModelQuery = stateParam.enrichmentModel || '';
      const enrichmentAnnotationQuery = stateParam.enrichmentAnnotation || '';
      const enrichmentStudy = enrichmentStudyQuery.replace(/ /gi, '-');
      const enrichmentModel = enrichmentModelQuery.replace(/ /gi, '-');
      const enrichmentAnnotation = enrichmentAnnotationQuery.replace(
        / /gi,
        '-'
      );

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
    // condense this later!
  } else {
    // just a search criteria change
    propsParam.history.push('');
    if (scTab === 'pepplot') {
      const pepplotStudyQuery2 = stateChanges.pepplotStudy || '';
      const pepplotModelQuery2 = stateChanges.pepplotModel || '';
      const pepplotTestQuery2 = stateChanges.pepplotTest || '';
      const pepplotProteinSiteQuery2 = stateChanges.pepplotProteinSite || '';
      const pepplotStudy = pepplotStudyQuery2.replace(/ /gi, '-');
      const pepplotModel = pepplotModelQuery2.replace(/ /gi, '-');
      const pepplotTest = pepplotTestQuery2.replace(/ /gi, '-');
      const pepplotProteinSite = pepplotProteinSiteQuery2.replace(/ /gi, '-');

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
            pepplotProteinSite
        );
      } else if (pepplotTest !== '') {
        propsParam.history.push(
          scTab + '/' + pepplotStudy + '/' + pepplotModel + '/' + pepplotTest
        );
      } else if (pepplotModel !== '') {
        propsParam.history.push(
          scTab + '/' + pepplotStudy + '/' + pepplotModel
        );
      } else if (pepplotStudy !== '') {
        propsParam.history.push(scTab + '/' + pepplotStudy);
      } else if (scTab !== '') {
        propsParam.history.push(scTab);
      }
      // });
      // }, [url]);
    } else if (scTab === 'enrichment') {
      const enrichmentStudyQuery = stateChanges.enrichmentStudy || '';
      const enrichmentModelQuery = stateChanges.enrichmentModel || '';
      const enrichmentAnnotationQuery = stateChanges.enrichmentAnnotation || '';
      const enrichmentStudy = enrichmentStudyQuery.replace(/ /gi, '-');
      const enrichmentModel = enrichmentModelQuery.replace(/ /gi, '-');
      const enrichmentAnnotation = enrichmentAnnotationQuery.replace(
        / /gi,
        '-'
      );

      if (enrichmentAnnotation !== '') {
        propsParam.history.push(
          scTab +
            '/' +
            enrichmentStudy +
            '/' +
            enrichmentModel +
            '/' +
            enrichmentAnnotation
        );
      } else if (enrichmentModel !== '') {
        propsParam.history.push(
          scTab + '/' + enrichmentStudy + '/' + enrichmentModel
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
