export const additionalTemplateInfo = {
  showPhosphositePlus(e, dataItem) {
    console.log(dataItem.Protein);
    debugger;
    //var protein = (dataItem.Protein ? dataItem.Protein : dataItem.MajorityProteinIDsHGNC).split(";")[0];
    //console.log(protein)
    // let param = { "proteinNames": protein, "queryId": -1, "from": 0 }
    // this._phosphoprotService.postToPhosphositePlus(param, "https://www.phosphosite.org/proteinSearchSubmitAction.action");
  }
};
