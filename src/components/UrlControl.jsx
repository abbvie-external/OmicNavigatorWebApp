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
      const pepplotStudy = stateParam.pepplotStudy || '';
      const pepplotModel = stateParam.pepplotModel || '';
      const pepplotTest = stateParam.pepplotTest || '';
      const pepplotProteinSite = stateParam.pepplotProteinSite || '';
      // const pepplotStudy = pepplotStudyQuery.replace(, '')
      // const pepplotModel = pepplotModelQuery.replace(, '')
      // const pepplotTest = pepplotTestQuery.replace(, '')

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
    // condense this later!
  } else {
    // just a search criteria change
    propsParam.history.push('');
    if (scTab === 'pepplot') {
      const pepplotStudy = stateChanges.pepplotStudy || '';
      const pepplotModel = stateChanges.pepplotModel || '';
      const pepplotTest = stateChanges.pepplotTest || '';
      const pepplotProteinSite = stateChanges.pepplotProteinSite || '';
      // const pepplotStudy = pepplotStudyQuery.replace(, '')
      // const pepplotModel = pepplotModelQuery.replace(, '')
      // const pepplotTest = pepplotTestQuery.replace(, '')

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
      const enrichmentStudy = stateChanges.enrichmentStudy || '';
      const enrichmentModel = stateChanges.enrichmentModel || '';
      const enrichmentAnnotation = stateChanges.enrichmentAnnotation || '';
      // const enrichmentStudy = enrichmentStudyQuery.replace(, '')
      // const enrichmentModel = enrichmentModelQuery.replace(, '')
      // const enrichmentAnnotation = enrichmentAnnotationQuery.replace(, '')

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
