#' Create a dotplot of phosphopeptide intensity for all donors - Proxy to Study Package
#'
#' This function returns intensity values for each donor. Data points are indicated as observed or imputed.
#' @param idmult The id of the protein group
#' @param study The study
#' @return A dotplot
#' @examples
#' phosphodotplot(idmult = "9382_2", study="***REMOVED***plots")
#' @export


phosphodotplot <- function(idmult,study) {
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
  rv <- get("phosphodotplot", as.environment(v))(idmult)


  print(rv)
  invisible();
}
