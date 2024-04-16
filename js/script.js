let uploadFolderID;
let projectID;
let access_Token;
let access_Token_write
let firstRate = 0
let totalNumberFiles
let progressCount = 0

const hub_id = "b.24d2d632-e01b-4ca0-b988-385be827cb04"



async function uploadtoACC(array){

    //console.log("Upload to ACC Array",array)
    let previousID
    let count = 1
    for (let i = 0; i < array.length; i++) {

        if(i === 0){
            firstData = await firstVersion(access_Token,array[i].id,array[i].filename)
            previousID = firstData.data.id
            metaID = firstData.included[0].id
        }else{
            updateData = await updateVersion(access_Token,array[i].id,array[i].filename,previousID)
            previousID = updateData.included[0].id
            metaID = updateData.data.id
        }
        if(count === (array.length)){
            updateVersionMeta(access_Token_write,metaID,array[i].folder_path)
        }else{
            count++
        }
        }
        return       
    }

async function getAccessToken(scopeInput){

    const bodyData = {
        scope: scopeInput,
        };
    
    const headers = {
        'Content-Type':'application/json'
    };
    
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData)
    };
    
    const apiUrl = "https://prod-18.uksouth.logic.azure.com:443/workflows/d8f90f38261044b19829e27d147f0023/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-N-bYaES64moEe0gFiP5J6XGoZBwCVZTmYZmUbdJkPk";
    //console.log(apiUrl)
    //console.log(requestOptions)
    signedURLData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
    
        //console.log(JSONdata)
    
        return JSONdata.access_token
        })
        .catch(error => console.error('Error fetching data:', error));
    
    
    return signedURLData
    }

async function firstVersion(accessToken,id,filename){
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
        'Content-Type':'application/vnd.api+json',
        'Authorization':'Bearer '+accessToken
    };
    
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData)
    };
    
    const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+projectID+"/items?copyFrom="+id;
    //console.log(apiUrl)
    //console.log(requestOptions)
    data = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
    
        //console.log(JSONdata)
    
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
        
    return data
    }

async function updateVersion(accessToken,id,filename,previousID){
    const bodyData = {
        "jsonapi": {
          "version": "1.0"
        },
        "data": {
          "type": "versions",
          "attributes": {
            "name": filename,
            "extension": {
              "version": "1.0"
            }
          },
          "relationships": {
            "item": {
              "data": {
                "type": "items",
                "id": previousID
              }
            }
          }
        }
      };
    
    const headers = {
        'Content-Type':'application/vnd.api+json',
        'Authorization':'Bearer '+accessToken
    };
    
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData)
    };
    
    const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+projectID+"/versions?copyFrom="+id;
    //console.log(apiUrl)
    //console.log(requestOptions)
    data = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
    
        //console.log(JSONdata)
    
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
        
    return data
    }

async function extractIds(urlInputValue) {
    try {
        const url = new URL(urlInputValue);
        const projectId = url.pathname.split('/')[4];
        const folderId = url.searchParams.get('folderUrn');

        // Update extracted IDs in the HTML
        document.getElementById('project-id').textContent = projectId;
        document.getElementById('folder-id').textContent = folderId;

        const accesstoken = await getAccessToken("data:read")
        const projectName = await getProjectDetails(accesstoken,projectId)
        const folderName = await getFolderDetails(accesstoken,projectId,folderId)



        document.getElementById('project-name').textContent = projectName.data.attributes.name;
        document.getElementById('start-folder-id').textContent = folderName.data.attributes.name;

        startfolder_list = [
            {folderID: folderId,folderName: folderName.data.attributes.name},
        ]
        projectID = projectId
        uploadFolderID = folderId
        // Show extracted IDs
        document.getElementById('extracted-ids').style.display = 'block';
        console.log(startfolder_list)
    } catch (error) {
        console.error('Invalid URL:', error.message);
        // Reset extracted IDs if URL is invalid
        document.getElementById('project-id').textContent = '';
        document.getElementById('folder-id').textContent = '';
        document.getElementById('project-name').textContent = '';
        document.getElementById('start-folder-id').textContent = '';

        // Hide extracted IDs
        document.getElementById('extracted-ids').style.display = 'none';
    }
    }

async function getProjectDetails(AccessToken,project_id){

    const headers = {
        'Authorization':"Bearer "+AccessToken,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/project/v1/hubs/"+hub_id+"/projects/b."+project_id;
    //console.log(apiUrl)
    //console.log(requestOptions)
    projectData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        //console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));

    return projectData
    }

async function getFolderDetails(AccessToken,project_id,folder_id){

        const headers = {
            'Authorization':"Bearer "+AccessToken,
        };

        const requestOptions = {
            method: 'GET',
            headers: headers,
        };

        const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+project_id+"/folders/"+folder_id;
        //console.log(apiUrl)
        //console.log(requestOptions)
        signedURLData = await fetch(apiUrl,requestOptions)
            .then(response => response.json())
            .then(data => {
                const JSONdata = data
            //console.log(JSONdata)
            //console.log(JSONdata.uploadKey)
            //console.log(JSONdata.urls)
            return JSONdata
            })
            .catch(error => console.error('Error fetching data:', error));

        return signedURLData
    }

function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
    }

function stringToURN(str) {
        const encodedString = encodeURIComponent(str);
        return encodedString;
    }

async function updateVersionMeta(accessToken,id,folder){
        const bodyData = [  {
            //"id": 1165968,
            "id":1417329,
            "type": "string",
            "name": "target folder",
            "value": folder
          }];
        
        const headers = {
            'Content-Type':'application/json',
            'Authorization':'Bearer '+accessToken
        };
        
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(bodyData)
        };
        
        const apiUrl = "https://developer.api.autodesk.com/bim360/docs/v1/projects/"+projectID+"/versions/"+stringToURN(id)+"/custom-attributes:batch-update";
        //console.log("UpdateMeta",apiUrl)
        console.log("UpdateMeta",requestOptions)
        data = await fetch(apiUrl,requestOptions)
            .then(response => response.json())
            .then(data => {
                const JSONdata = data
        
            //console.log("UpdateMeta",JSONdata)
        
            return JSONdata
            })
            .catch(error => console.error('Error fetching data:', error));
            
        return data
    }