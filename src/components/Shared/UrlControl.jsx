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
    console.log('[UrlControl.jsx] !searchCriteriaChange');
    console.log('[UrlControl.jsx]', propsParam);
    console.log('[UrlControl.jsx]', window.location.href);
    // const [urlVar, setUrlFunc] = useState('/pepplot');
    let tab, tabIndex, lastTabIndex;
    console.log('[UrlControl.jsx]', window.location.href);
    // clear url
    console.log('[UrlControl.jsx] propsParam.history', propsParam.history);
    if (process.env.NODE_ENV === 'production') {
      propsParam.history.push('');
      propsParam.history.push('ocpu/library/OmicAnalyzer/www/');
      // propsParam.history.push(propsParam.location.pathname);
      debugger;
    } else {
      propsParam.history.push('');
    }

    console.log('[UrlControl.jsx]', window.location.href);
    if (type === 'tabChange') {
      lastTabIndex = stateParam.activeIndex;
      tabIndex = lastTabIndex === 2 ? 1 : 2;
      tab = tabIndex === 2 ? 'enrichment' : 'pepplot';
    } else {
      const pathname = propsParam.location.pathname;

      console.log('[UrlControl.jsx] pathname ', pathname);
      console.log('[UrlControl.jsx]', window.location.href);
      const enrichment = pathname.includes('enrichment');
      tab = enrichment ? 'enrichment' : 'pepplot';
      tabIndex = enrichment ? 2 : 1;
    }

    if (tab === 'pepplot') {
      console.log('[UrlControl.jsx] tab === pepplot');
      console.log('[UrlControl.jsx]', window.location.href);
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
        console.log(
          '[UrlControl.jsx] pepplotProteinSite !== "" ',
          propsParam.location.pathname,
        );
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
        console.log(
          '[UrlControl.jsx] pepplotTest !== "" ',
          propsParam.location.pathname,
        );
        propsParam.history.push(
          tab + '/' + pepplotStudy + '/' + pepplotModel + '/' + pepplotTest,
        );
      } else if (pepplotModel !== '') {
        console.log(
          '[UrlControl.jsx] pepplotModel !== "" ',
          propsParam.location.pathname,
        );
        propsParam.history.push(tab + '/' + pepplotStudy + '/' + pepplotModel);
      } else if (pepplotStudy !== '') {
        console.log(
          '[UrlControl.jsx] pepplotStudy !== "" ',
          propsParam.location.pathname,
        );
        propsParam.history.push(tab + '/' + pepplotStudy);
      } else if (tab !== '') {
        console.log(
          '[UrlControl.jsx] tab !== "" ',
          propsParam.location.pathname,
        );
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
    console.log('[UrlControl.jsx] searchCriteriaChange');
    console.log('[UrlControl.jsx]', propsParam);
    console.log('[UrlControl.jsx]', window.location.href);

    console.log(
      '[UrlControl.jsx] propsParam.history.location.pathname',
      propsParam.history.location.pathname,
    );
    // just a search criteria change
    if (process.env.NODE_ENV === 'production') {
      // propsParam.history.push(propsParam.location.pathname);
      propsParam.history.push('');
      propsParam.history.push('ocpu/library/OmicAnalyzer/www/');
    } else {
      propsParam.history.push('');
    }
    console.log(
      '[UrlControl.jsx] propsParam.history.location.pathname ',
      propsParam.history.location.pathname,
    );
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
        console.log(
          '[UrlControl.jsx] pepplotProteinSite !== "" ',
          propsParam.location.pathname,
        );
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
        console.log(
          '[UrlControl.jsx] pepplotProteinSite !== "" ',
          propsParam.location.pathname,
        );
      } else if (pepplotTest !== '') {
        console.log(
          '[UrlControl.jsx] pepplotTest !== "" ',
          propsParam.location.pathname,
        );
        propsParam.history.push(
          scTab + '/' + pepplotStudy + '/' + pepplotModel + '/' + pepplotTest,
        );
        console.log(
          '[UrlControl.jsx] pepplotTest !== "" ',
          propsParam.location.pathname,
        );
      } else if (pepplotModel !== '') {
        console.log(
          '[UrlControl.jsx] pepplotModel !== "" ',
          propsParam.location.pathname,
        );
        console.log(
          '[UrlControl.jsx] propsParam.history.location.pathname ',
          propsParam.history.location.pathname,
        );
        console.log('[UrlControl.jsx] scTab ', scTab);
        console.log('[UrlControl.jsx] pepplotStudy ', pepplotStudy);
        console.log('[UrlControl.jsx] pepplotModel ', pepplotModel);
        // if (process.env.NODE_ENV === 'production') {
        //   propsParam.history.push(
        //     propsParam.location.pathname + '/' + pepplotModel,
        //   );
        // } else {
        propsParam.history.push(
          scTab + '/' + pepplotStudy + '/' + pepplotModel,
        );
        // }
        console.log(
          '[UrlControl.jsx] pepplotModel !== "" ',
          propsParam.location.pathname,
        );
        console.log(
          '[UrlControl.jsx] propsParam.history.location.pathname ',
          propsParam.history.location.pathname,
        );
      } else if (pepplotStudy !== '') {
        console.log(
          '[UrlControl.jsx] pepplotStudy !== "" ',
          propsParam.location.pathname,
        );
        propsParam.history.push(scTab + '/' + pepplotStudy);
        console.log(
          '[UrlControl.jsx] pepplotStudy !== "" ',
          propsParam.location.pathname,
        );
      } else if (scTab !== '') {
        console.log(
          '[UrlControl.jsx] scTab !== "" ',
          propsParam.location.pathname,
        );
        propsParam.history.push(scTab);
        console.log(
          '[UrlControl.jsx] scTab !== "" ',
          propsParam.location.pathname,
        );
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
