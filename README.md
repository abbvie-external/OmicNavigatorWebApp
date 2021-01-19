OmicNavigator: Open-Source Software for Omic Data Analysis and Visualization
Terrence Ernst1, John D. Blischak 1, Paul Nordlund 1, Justin Moore 1,2, Joe Dalen 1, Pankaj Dwivedi 1,3, Akshay Bhamidipati 1, Brett W. Engelmann 1 (Correspondence to brett.engelmann@abbvie.com (B.W.E))

Exploring the results of omic analyses via interactive web applications facilitates cross-disciplinary collaboration and biological discovery. OmicNavigator is open-source software for the archival and interactive exploration of results from high-throughput biology experiments. The software enables omic data analysts (typically bioinformaticians) to create customizable web applications from the results of their work using only the statistical programming language, R. OmicNavigator is bundled as an R package that contains web application code, R functions for programmatic access and data deposition, and a new container for the storage of statistical analyses (differential expression and/or enrichment analysis), metadata, and custom plotting functions. Studies created with OmicNavigator are themselves R packages, accessible via a JavaScript dashboard that can be interrogated on the user’s local machine or deployed online to be explored by collaborators. The dashboard combines the user-defined study results and feature plots with performant tables and interactive D3 plots such as scatter, network, volcano, and barcode plots. The tool also includes dynamic, multi-set filtering across hypothesis tests based on user defined thresholds such as statistical significance or effect size.

1AbbVie, 1 North Waukegan Rd, North Chicago, Illinois, USA
2Department of Molecular and Human Genetics, Baylor University, Waco, Texas, USA
3Genentech, 1 DNA Way, South San Francisco, California, USA

To develop, first install node modules from top level folder using `npm install`, then run `npm start`, which will open the app at localhost:3000
This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
