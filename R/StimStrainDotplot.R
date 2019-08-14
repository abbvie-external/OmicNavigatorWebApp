#' Create a dotplot of phosphopeptide intensity for all donors - Proxy to Study Package
#'
#' This function returns intensity values for each donor time 0. Data points are indicated as observed or imputed.
#' @param study The study
#' @param idmult The idmult of the phosphosite
#' @return A dotplot
#' @examples
#' StimStrainDotplot(idmult = "6173_1", study="***REMOVED***")
#' @export

StimStrainDotplot <- function(idmult, study) {

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
  rv <- get("StimStrainDotplot", as.environment(v))(idmult)

  print(rv)
  invisible();
}
