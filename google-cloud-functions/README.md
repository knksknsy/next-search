# Cloud Functions Source Repo Mirror

This repository is a mirror for the Google Cloud Source Repository. It contains source codes for Google Cloud Functions.

Google Cloud Repository URL: <https://source.cloud.google.com/astute-ace-258315/next-search-cloud-functions>

HdM Gitlab Repository URL: <https://gitlab.mi.hdm-stuttgart.de/kk148/cloud-functions-source-repo-mirror>

# Deploy each Cloud Function with the respective line:

getKeywords:
`gcloud functions deploy getKeywords --trigger-http --region=europe-west2 --runtime=nodejs8 --entry-point=getKeywords --service-account=nextsearchserviceaccount-260@astute-ace-258315.iam.gserviceaccount.com`

getSearchResults:
`gcloud functions deploy getSearchResults --trigger-http --region=europe-west2 --runtime=nodejs8 --entry-point=getSearchResults`

checkObjectStorage:
`gcloud functions deploy checkObjectStorage --trigger-http --region=europe-west2 --runtime=nodejs8 --entry-point=checkObjectStorage`

fetchWebPage:
`gcloud functions deploy fetchWebPage --trigger-http --region=europe-west2 --runtime=nodejs8 --entry-point=fetchWebPage`

filterWebPage:
`gcloud functions deploy filterWebPage --trigger-http --region=europe-west2 --runtime=nodejs8 --entry-point=filterWebPage --memory=2048MB`

groupContent:
`gcloud functions deploy groupContent --trigger-http --region=europe-west2 --runtime=nodejs8 --entry-point=groupContent`

contentToHtml:
`gcloud functions deploy contentToHtml --trigger-http --region=europe-west2 --runtime=nodejs8 --entry-point=contentToHtml`
