let statusUpdateUpload
const progressBarContainer = document.querySelector('.progress-bar__container');
const progressBar = document.querySelector('.progress-bar-Main');
const progressBarText = document.querySelector('.progress-bar-Main__text');
let progressTotal

async function preUploadCheck(){
    statusUpdateUpload = document.getElementById('statusUpdateUpload')
    statusUpdateUpload.innerHTML = `<p class="extracted-ids"> Getting Relevant Data...</p>`
    await getCustomDetailsData()
    progressTotal = uploadFileList.length
    await uploadTIDPToACC(uploadFileList)
    statusUpdateUpload.innerHTML = `<p class="extracted-ids"> Files Uploaded to ACC</p>`
}

async function uploadTIDPToACC(array){
    statusUpdateUpload.innerHTML = `<p class="extracted-ids"> Getting Access Tokens...</p>`
    accessTokenDataCreate = await getAccessToken("data:create")
    accessTokenDataWrite = await getAccessToken("data:write")
    array.forEach(item => {
        uploadItem(item)
        statusUpdateUpload.innerHTML = `<p class="extracted-ids"> Uploaded ${item["Information identification (automatic)"]}...</p>`
    });
    
    }

async function uploadItem(item){
    console.log(item)
    statusUpdateUpload.innerHTML = `<p class="extracted-ids"> Uploading ${item["Information identification (automatic)"]}...</p>`
    returnData = await postNewCopyOfItem(accessTokenDataCreate,item["Information identification (automatic)"],item["FOLDER URN (automatic)"],item["Template URN (automatic)"])
    console.log(returnData)
    fileURN = returnData.included[0].id
    fileURN = encodeURIComponent(fileURN)
    postCustomItemDetails(accessTokenDataWrite,item["Description / Title"],fileURN,item["Sheet size (if applicable)"],item["Scale"],item["Stage"])
    updateProgressBar()
    }

async function postNewCopyOfItem(accessTokenDataCreate,filename,uploadFolderID,copyURN){
    const bodyData = {
            "jsonapi": {
              "version": "1.0"
            },
            "data": {
              "type": "items",
              "relationships": {
                "tip": {
                  "data": {
                    "type": "versions",
                    "id": "1"
                  }
                },
                "parent": {
                  "data": {
                    "type": "folders",
                    "id": uploadFolderID
                  }
                }
              }
            },
            "included": [
              {
                "type": "versions",
                "id": "1",
                "attributes": {
                  "name": filename
                }
              }
            ]
        };
        const headers = {
            'Content-Type': 'application/vnd.api+json',
            'Authorization':"Bearer "+accessTokenDataCreate,
        };

        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(bodyData),
        };

        const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/"+projectID+"/items?copyFrom="+copyURN;
        //console.log(requestOptions)
        responseData = await fetch(apiUrl,requestOptions)
            .then(response => response.json())
            .then(data => {
                const JSONdata = data
                console.log(JSONdata)
            //console.log(JSONdata.data.id)
            return JSONdata
            })
            .catch(error => console.error('Error fetching data:', error));
        return responseData
    }

async function postCustomItemDetails(accessTokenDataCreate,titleline1,fileURN,paperSize,scale,stage){
    let bodyData = [
        {
            // Title Line 1
            "id": titleline1ID.id,
            "value": titleline1
        },
        {
            // Revision Code
            "id": revisionCodeID.id,
            "value": "P01.01"
        },
        {
            // Description Code
            "id": descriptionID.id,
            "value": "TIDP Placeholder File"
        }
        ];

    if(stageID){
        bodyData.push({
            // Revision Code
            "id": stageID.id,
            "value": stage
        })
    }
    if(paperSizeID){
        bodyData.push({
            // Paper Size
            "id": paperSizeID.id,
            "value": paperSize
        })
    }
    if(scaleID){
        bodyData.push({
            // Scale
            "id": scaleID.id,
            "value": scale
        })
    }
    const headers = {
        'Authorization':"Bearer "+accessTokenDataCreate,
        'Content-Type': 'application/json',

    };

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData)
    };

    const apiUrl = "https://developer.api.autodesk.com/bim360/docs/v1/projects/"+projectID+"/versions/"+fileURN+"/custom-attributes:batch-update";
    console.log(apiUrl)
    console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
    return responseData
    }

async function getCustomDetailsData(){

    customAttributes = await getItemCustomDetails(accessTokenDataRead,uploadFileList[0]["FOLDER URN (automatic)"])
    console.log("Custom Attributes:",customAttributes)

    titleline1ID = await findObjectByName("Title Line 1",customAttributes)
    revisionCodeID = await findObjectByName("Revision",customAttributes)
    paperSizeID = await findObjectByName("Paper Size",customAttributes)
    scaleID = await findObjectByName("Scale",customAttributes)
    stageID = await findObjectByName("Project Stage",customAttributes)
    descriptionID = await findObjectByName("File Description",customAttributes)

    console.log(titleline1ID)
    console.log(revisionCodeID)
    console.log(paperSizeID)
    console.log(scaleID)
    console.log(stageID)
    console.log(descriptionID)
    }

async function findObjectByName(name,data) {
    let output
    output = await data.find(obj => obj.name === name);
    //console.log(output)
    if(output && output.arrayValues && output.length === 0){

    }else{
        return output
    }

    }

function updateProgressBar(){
    
    const progressBarMain = document.querySelector('.progress-bar-Main');
    progressCount++;
    progress = (progressCount / progressTotal) * 100;
    console.log(progress)
    gsap.to(progressBarMain, {
        x: `${progress}%`,
        duration: 0.5,
        });
    }