#' Create a dotplot of protein group intensity for all donors - Proxy to Study Package
#'
#' This function returns intensity values for each donor time 0. Data points are indicated as observed or imputed.
#' @param id The id of the protein group
#' @return A dotplot
#' @param study The study
#' @examples
#' proteindotplot(id = "1825", study="***REMOVED***plots")
#' @export


proteindotplot <- function(idmult,study) {
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
  rv <- get("proteindotplot", as.environment(v))(idmult)


  print(rv)
  invisible();
}
