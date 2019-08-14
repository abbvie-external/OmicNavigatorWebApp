#'
#' This function returns a plot of line segments connecting the medians for each strain across the timecourse. Data points are indicated as observed or imputed. 0 time points are called 'baseline'. - Proxy to Study Package
#'
#' @param study The study
#' @param idmult The idmult of the phosphosite
#' @return A plot
#' @examples
#' lineplot(idmult = "7072_2", study="***REMOVED***")
#' @export

lineplot <- function(idmult,study) {
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
  rv <- get("lineplot", as.environment(v))(idmult)


  print(rv)
  invisible();
}
