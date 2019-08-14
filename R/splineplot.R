#' Plot the fitted splines for a phosphopeptide for all compounds - Proxy to Study Package
#'
#' @param idmult The idmult of the phosphosite
#' @param study The study
#' @return A plot
#' @examples
#' splineplot(idmult = "221_1", study="PLA2G2plots")
#' @export

splineplot <- function(idmult,study) {
  if((any(grepl("package:***REMOVED***", search())))&(study != "***REMOVED***"))
    detach("package:***REMOVED***")
    else message("No need to detach ***REMOVED***")

  if((any(grepl("package:***REMOVED***", search())))&(study != "***REMOVED***"))
    detach("package:***REMOVED***")
    else message("No need to detach ***REMOVED***")

  if((any(grepl("package:***REMOVED***plots", search())))&(study != "***REMOVED***plots"))
    detach("package:***REMOVED***plots")
  else message("No need to detach ***REMOVED***plots")


  library(study, character.only = TRUE)


  v <- toString(paste("package:", study, sep=""))
  rv <- get("splineplot", as.environment(v))(idmult)


  print(rv)
  invisible();
}
