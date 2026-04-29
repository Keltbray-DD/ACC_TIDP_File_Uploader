let getRate = 0;
let folderList_Main =[];
let deliverableFolders = [];
let statusUpdate
let accessTokenDataRead
let nsData = [];

// Status and Document Classification options pulled from ACC at TIDP-generate
// time. Both are mandatory attributes in Forma; their allowed values are
// returned by the docs custom-attribute-definitions endpoint per folder.
let statusOptions = [];
let docClassificationOptions = [];


document.addEventListener('DOMContentLoaded', function() {
    loadingScreen = document.getElementById('loadingScreen');
    // Show the loading screen
    function showLoadingScreen() {
        loadingScreen.style.display = 'flex';
    }

    // Hide the loading screen
    async function hideLoadingScreen() {
        loadingScreen.style.display = 'none';
    }

    // Simulate gathering arrays with a delay
    async function gatherArrays() {

        showLoadingScreen(); // Show loading screen before gathering arrays
        // Wait until login is fully complete and userID is in sessionStorage,
        // otherwise fetchProjects() POSTs a null userID and the dropdown comes back empty.
        await loginReady;
        await listProjects()

        hideLoadingScreen();

    }
    gatherArrays();
    })

async function getTemplateFiles(){
    try {
        templatesListResults = await getfolderItems(templateFolderID,accessTokenDataRead,projectID)

    } catch (error) {
        console.error("Error iterating through searchFolders:", error);
    }
    console.log("Template List",templatesListResults.data)

    // Create and append options to the dropdown
    templatesListResults.data.forEach(option => {
        var ID = option.relationships.tip.data.id;
        var Name = option.attributes.displayName;
        templatesList.push({'templateID':ID,'templateName':Name})


    });
    console.log(templatesList)
    }

async function getNamingStandard() {
    try {
        access_token = await getAccessToken("data:read");
    } catch {
        console.log("Error: Getting Access Token");
    }
    //console.log("Access Token: ", access_token);

    try {
        namingstandard = await getNamingStandardforproject(access_token,namingstandardID,projectID)

    } catch (error) {
        console.error("Error iterating through searchFolders:", error);
    }
    arrayprojectPin = namingstandard.find(item => item.name === "Project(1)") // Change back to Project Pin
    arrayprojectPin = arrayprojectPin ? arrayprojectPin.options : [];

    // Get the dropdown container
    const dropdownContainerProjectPin = document.getElementById("ProjectPin_input");

    // Create and append options to the dropdown
    arrayprojectPin.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerProjectPin.appendChild(optionElement);
    });

    arrayOriginator = namingstandard.find(item => item.name === "Originator")
    arrayOriginator = arrayOriginator ? arrayOriginator.options : [];

    // Get the dropdown container
    const dropdownContainerOriginator = document.getElementById("Originator_input");

    // Create and append options to the dropdown
    arrayOriginator.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerOriginator.appendChild(optionElement);
    });

    arrayfunction = namingstandard.find(item => item.name === "Function")
    arrayfunction = arrayfunction ? arrayfunction.options : [];

    // Get the dropdown container
    const dropdownContainerfunction = document.getElementById("Function_input");

    // Create and append options to the dropdown
    arrayfunction.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerfunction.appendChild(optionElement);
    });

    arraySpatial = namingstandard.find(item => item.name === "Spatial")
    arraySpatial = arraySpatial ? arraySpatial.options : [];

    // Get the dropdown container
    const dropdownContainerSpatial = document.getElementById("Spatial_input");

    // Create and append options to the dropdown
    arraySpatial.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerSpatial.appendChild(optionElement);
    });

    arrayForm = namingstandard.find(item => item.name === "Form")
    arrayForm = arrayForm ? arrayForm.options : [];

    // Get the dropdown container
    const dropdownContainerForm = document.getElementById("Form_input");

    // Create and append options to the dropdown
    arrayForm.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerForm.appendChild(optionElement);
    });

    arrayDiscipline = namingstandard.find(item => item.name === "Discipline")
    arrayDiscipline = arrayDiscipline ? arrayDiscipline.options : [];

    // Get the dropdown container
    const dropdownContainerDiscipline = document.getElementById("Discipline_input");

    // Create and append options to the dropdown
    arrayDiscipline.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = `${option.value} - ${option.description}`;
        dropdownContainerDiscipline.appendChild(optionElement);
    });

    //console.log(namingstandard)
    console.log(arrayprojectPin)
    console.log(arrayOriginator)
    console.log(arrayfunction)
    console.log(arraySpatial)
    console.log(arrayForm)
    console.log(arrayDiscipline)
    }

async function getfileslist() {
    try {
        access_token = await getAccessToken("data:read");
    } catch {
        console.log("Error: Getting Access Token");
    }
    //console.log("Access Token: ", access_token);

    try {
        for (const folderID of searchFolders) {
            try {
                filelist_temp = await getfolderItems(folderID, access_token, projectID);

            } catch (error) {
                console.error("Error getting folder items:", error);
            }
            filelist = filelist.concat(filelist_temp.data.map(item => item.attributes.displayName))
        }

    } catch (error) {
        console.error("Error iterating through searchFolders:", error);
    }
    console.log(filelist)
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

    const apiUrl = "https://default917b4d06d2e9475983a3e7369ed74e.8f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/df0aebc4d2324e98bcfa94699154481f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=igiodIb-lGf7MTGYIlPATMr-JbyDeztuALW5F6IIaNs";
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

async function generateTokenDataRead(clientId,clientSecret){
    const bodyData = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type:'client_credentials',
    scope:'data:read'
    };

    var formBody = [];
    for (var property in bodyData) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(bodyData[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    };
    formBody = formBody.join("&")

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: formBody,
    };
    const apiUrl = 'https://developer.api.autodesk.com/authentication/v1/authenticate';
    //console.log(requestOptions)
    AccessToken_Local = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
        //console.log(data)
        //console.log(data.access_token)
        return data.access_token
        })
        .catch(error => console.error('Error fetching data:', error));
        return AccessToken_Local
    }

async function getfolderItems(folder_id,AccessToken,project_id){

    const headers = {
        'Authorization':"Bearer "+AccessToken,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/"+project_id+"/folders/"+folder_id+"/contents";
    //console.log(apiUrl)
    //console.log(requestOptions)
    signedURLData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        //console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        getRate++
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));

    return signedURLData
    }

async function getfolderItems(folder_id,AccessToken,project_id){

    const headers = {
        'Authorization':"Bearer "+AccessToken,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+project_id+"/folders/"+folder_id+"/contents";
    //console.log(apiUrl)
    //console.log(requestOptions)
    signedURLData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        //console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        getRate++
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));

    return signedURLData
    }

async function getFolderDetails(accessTokenDataRead,projectID,folderID){

    const headers = {
        'Authorization':"Bearer "+accessTokenDataRead,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+projectID+"/folders/"+folderID;
    //console.log(apiUrl)
    //console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        //console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
    return responseData
    }

async function getItemCustomDetails(accessTokenDataRead,folderID){

    const headers = {
        'Authorization':"Bearer "+accessTokenDataRead,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/bim360/docs/v1/projects/"+projectID+"/folders/"+folderID+"/custom-attribute-definitions";
    //console.log(apiUrl)
    //console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        //console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata.results
        })
        .catch(error => console.error('Error fetching data:', error));
    return responseData
    }


async function getItemsStorage(AccessToken){
    selectedItem = templateDropdown.value
    const headers = {
        'Authorization':"Bearer "+AccessToken,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+projectID+"/items/"+selectedItem;
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

async function getItemStorageS3URL(AccessToken,itemURL){

    const headers = {
        'Authorization':"Bearer "+AccessToken,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = itemURL+"/signeds3download";
    //console.log(apiUrl)
    //console.log(requestOptions)
    signedURLData = await fetch(apiUrl,requestOptions)
    .then(response => {
        // Check if response is successful
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Return the response body as a Blob object
        return response.blob();
      })
      .then(fileBlob => {
        // Process the received file as a generic binary file
        console.log('Received file of type application/octet-stream');
        // Here, you can handle the binary file according to your needs
        // For example, you might want to save it to disk or display a download link
        // Below is just a sample of how you might handle it
        //const downloadUrl = URL.createObjectURL(fileBlob);
        //const downloadLink = document.createElement('a');
        //downloadLink.href = downloadUrl;
        //downloadLink.download = filename; // Set a default filename
        //downloadLink.textContent = 'Download file';
        //document.body.appendChild(downloadLink);
        fileTemplate = fileBlob
      })
      .catch(error => {
        console.error('Error:', error);
      });
        //.catch(error => console.error('Error fetching data:', error));
    return signedURLData
    }

async function downloadItem(downloadURL){
    
    const requestOptions = {
        method: 'GET',
    };

    const apiUrl = downloadURL;
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

async function getNamingStandardforproject(access_token,namingstandardID,project_id){

    const headers = {
        'Authorization':"Bearer "+access_token,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/bim360/docs/v1/projects/"+project_id+"/naming-standards/"+namingstandardID;
    //console.log(apiUrl)
    //console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        //console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata.definition.fields
        })
        .catch(error => console.error('Error fetching data:', error));
    return responseData
    }

async function listProjects(){
    try{
        accessTokenDataRead = await getAccessToken("data:read")
    }catch{
        console.log("Error")
    }
    ProjectListRaw = await fetchProjects()


    //console.log("Raw Project List",ProjectListRaw.data)

    for(let i = 0; i < ProjectListRaw.length; i++){
        ProjectList.push({'ProjectName':ProjectListRaw[i].name,'ProjectID':ProjectListRaw[i].id})
    }
    ProjectList.sort((a, b) => a.ProjectName.localeCompare(b.ProjectName));
    console.log("Filtered Project List",ProjectList)
    sessionStorage.setItem('ProjectList',JSON.stringify(ProjectList));

    const projectDropdownNew = document.getElementById('input_project_new');
    projectDropdownNew.innerHTML = '<option value="">Select a project...</option>'
    ProjectList.forEach(project => {
        const option = document.createElement('option');
        option.text = project.ProjectName;
        option.value = project.ProjectID;
        projectDropdownNew.add(option);
    });

    const projectDropdownExisting = document.getElementById('input_project_existing');
    projectDropdownExisting.innerHTML = '<option value="">Select a project...</option>'
    ProjectList.forEach(project => {
        const option = document.createElement('option');
        option.text = project.ProjectName;
        option.value = project.ProjectID;
        projectDropdownExisting.add(option);
    });
    }

async function fetchProjects() {
    const userID = sessionStorage.getItem('userID')
    console.log('userID Request',userID)
    const bodyData = {
        'userID': userID,
        'requestType': 'tidpUploader'
        };

    const headers = {
        'Content-Type':'application/json'
    };

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData)
    };

    const apiUrl = "https://default917b4d06d2e9475983a3e7369ed74e.8f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/30f57be09dd04690be4212eb4ed6df65/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=AKQMd6IhhtwV5Rid6zC7KTH3LPtniMWevgkP9UlSKko";
    //console.log(apiUrl)
    //console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data

        console.log(JSONdata)
        
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));


    return responseData
}

async function getProjects(AccessToken){

    const bodyData = {

        };

    const headers = {
        'Authorization':"Bearer "+AccessToken,
        'Content-Type':'application/json'
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
        //body: JSON.stringify(bodyData)
    };

    const apiUrl = "https://developer.api.autodesk.com/project/v1/hubs/"+hubID+"/projects";
    //console.log(apiUrl)
    //console.log(requestOptions)
    signedURLData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data

        //console.log(JSONdata)

        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));

    return signedURLData
    }

async function getProjectDetailsFromACC(){
    const select = document.getElementById('input_project_new').value;
    if (!select.trim()) {
        // Alert the user if the username field is empty
        alert('Please select a project');
        return; // Exit the function
    }
    accessTokenDataRead = await getAccessToken("data:read")
    topFolderData = await getProjectTopFolder(accessTokenDataRead,hubID,projectID)
    ProjectFiles = topFolderData.data.filter(item => {
        return item.attributes.name === "Project Files"
    })
    startFolderID = ProjectFiles[0].id
    console.log("Project Files Folder ID:",startFolderID)
    startfolder_list = [{folderID: ProjectFiles[0].id,folderName: ProjectFiles[0].attributes.name}]
    console.log("StartFolder:",startfolder_list)
    await getAllACCFolders(startfolder_list)

    }

async function getProjectTopFolder(accessTokenDataRead,hubID,projectID){

    const bodyData = {

        };

    const headers = {
        'Authorization':"Bearer "+accessTokenDataRead,
        //'Content-Type':'application/json'
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
        //body: JSON.stringify(bodyData)
    };

    const apiUrl = "https://developer.api.autodesk.com/project/v1/hubs/"+hubID+"/projects/b."+projectID+"/topFolders";
    console.log(apiUrl)
    console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data

        console.log(JSONdata)

        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));

    return responseData
    }

async function getAllACCFolders(startfolder_list){
    if(startfolder_list.length === 0){
        alert("Please enter a URL before clicking start")
    }else{
        statusUpdate = document.getElementById('statusUpdate')
        try {
            access_token_create = await getAccessToken("data:write");
        } catch {
            console.log("Error: Getting Create Access Token");
        }
        try {
            access_token_read = await getAccessToken("data:read");
        } catch {
            console.log("Error: Getting Read Access Token");
        }
        try {
            getRate = 0;
            deliverableFolders = []
            folderList_Main = []
            statusUpdate.innerHTML = `<p class="extracted-ids"> Start Folder Found</p>`
            await getFolderList(access_token_read,startfolder_list)
            //console.log(folderList_temp)
            //convertToArray(foldersMIDP)
            statusUpdate.innerHTML = `<p class="extracted-ids"> Folder List Created</p>`
            console.log("Full Folder List",folderList_Main)
            console.log("Deliverable Folders:",deliverableFolders)
            await getNamingStandardID(deliverableFolders)
            statusUpdate.innerHTML = `<p class="extracted-ids"> Naming Standard Extracted</p>`
            await getTemplateFolder(folderList_Main)
            statusUpdate.innerHTML = `<p class="extracted-ids"> Template List Extracted</p>`
            await getDocAttributeOptions(deliverableFolders)
            statusUpdate.innerHTML = `<p class="extracted-ids"> Status & Document Classification options extracted</p>`
        } catch {
            console.log("Error: Geting folder list");
        }
        await convertToExcelTable(nsData,templatesList,deliverableFolders,statusOptions,docClassificationOptions)
        statusUpdate.innerHTML = `<p class="extracted-ids"> TIDP template ready — check your downloads folder</p>`


    }}
    async function getJSONDataFromSP(project_id){

        const bodyData = {
            "project_Name":project_id
        };
    
        const headers = {
            'Content-Type':"application/json",
        };
    
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(bodyData)
        };
    
        const apiUrl = "https://default917b4d06d2e9475983a3e7369ed74e.8f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/aa3b3f6ba93f4901acef15184cd5b8de/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rsVMeC9t3eP3LkX1-vcOI2Xk4M-aopqMjV8W_7Y-LF4";
        //console.log(apiUrl)
        console.log(requestOptions)
        signedURLData = await fetch(apiUrl,requestOptions)
            .then(response => response.json())
            .then(data => {
                const JSONdata = data
            console.log(JSONdata)
            //console.log(JSONdata.uploadKey)
            //console.log(JSONdata.urls)
            return JSONdata
            })
            .catch(error => console.error('Error fetching data:', error));
        return signedURLData
    }
    async function getFolderList(AccessToken, startFolderList, parentFolderPath) {

        ProjectObject = await getJSONDataFromSP(projectName)
        console.log(ProjectObject);
        if(ProjectObject.type == "framework"){
            for (let index = 0; index < ProjectObject.data.length; index++) {
                const element = ProjectObject.data[index];
                console.log(element)
                const folderArray = JSON.parse(element.folder_array)
                const folderArrayDeliverables = JSON.parse(element.folder_array_deliverables)
                console.log(folderArray)
                console.log(folderArrayDeliverables)
                if(!folderArray || !folderArrayDeliverables){}else{
                    folderList_Main = folderList_Main.concat(folderArray)
                    deliverableFolders = deliverableFolders.concat(folderArrayDeliverables)
                }
            }
        }else{
            folderList_Main = JSON.parse(ProjectObject.data[0].folder_array)
            deliverableFolders = JSON.parse(ProjectObject.data[0].folder_array_deliverables)
        }
        console.log(folderList_Main);
        console.log(deliverableFolders);

        return
        try {
            // Array of folder names to skip
            const foldersToSkip = ["0A.INCOMING", "0D.COMMERCIAL", "Z.PROJECT_ADMIN", "ZZ.SHADOW_PROJECT","SHADOW_PROJECT"];
            const deliverableFoldersToAdd = ["0C.WIP/", "APPROVED_TEMPLATES"];
    
            for (const startFolder of startFolderList) {
                const folderList = await getfolderItems(startFolder.folderID, AccessToken, projectID);
    
                if (!folderList || !folderList.data || !Array.isArray(folderList.data)) {
                    throw new Error("Error getting folder items: Invalid folderList data");
                }
    
                if (getRate >= 290) {
                    console.log("Waiting for 10 Seconds..."); // Displaying the message for a 10-second delay
                    getRate = 0;
                    await delay(10000); // Delaying for 10 seconds
                } else {
                    for (const folder of folderList.data) {
                        if (folder.type === 'folders') {
                            const folderID = folder.id;
                            const folderNameLocal = folder.attributes.name;
                            const fullPath = parentFolderPath
                                ? parentFolderPath + '/' + folderNameLocal
                                : folderNameLocal;
    
                            folderList_Main.push({
                                folderID: folder.id,
                                folderPath: fullPath,
                                folderNameEnd: folderNameLocal,
                            });
    
                            if (deliverableFoldersToAdd.some((AddName) => fullPath.includes(AddName))) {
                                deliverableFolders.push({
                                    folderID: folder.id,
                                    folderPath: fullPath,
                                    folderNameEnd: folderNameLocal,
                                });
                            }
    
                            statusUpdate.innerHTML = `<p class="extracted-ids"> Added folder: ${fullPath}</p>`;
                            console.log("Added folder:", folderID, fullPath);
    
                            // Check if the folderName contains any of the names in foldersToSkip array
                            if (!foldersToSkip.some((skipName) => folderNameLocal.includes(skipName))) {
                                console.log("Fetching nested folders for:", folderID);
                                await delay(50); // Add a 2-second delay between calls
                                await getFolderList(AccessToken, [{ folderID: folder.id, folderPath: fullPath }], fullPath);
                            } else {
                                console.log("Skipping getFolderList for folder:", folderID, fullPath);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error in getFolderList: ${error.message}`);
        }
    }

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

async function getNamingStandardID(folderArray){
    wipFolderID = folderArray.filter(item => {
        return item.folderPath.includes("0C.WIP /")})
        console.log(wipFolderID)
    console.log(wipFolderID);
    returnData = await getFolderDetails(accessTokenDataRead,projectID,wipFolderID[0].folderID)
    
    console.log(returnData)
    NSID = returnData.data.attributes.extension.data.namingStandardIds[0]
    console.log(NSID)
    nsData = await getNamingStandardforproject(accessTokenDataRead,NSID,projectID)
    console.log(nsData)

    return nsData
}

async function getTemplateFolder(folderArray){
    templateFolderID = JSON.parse(ProjectObject.data[0].templateFolder);
    templateFolderID = templateFolderID[0].folderID
    // templateFolderID = folderArray.filter(item => {
    //     return item.folderPath === "0B.GENERAL/APPROVED_TEMPLATES"})[0].folderID
    console.log(templateFolderID);
    await getTemplateFiles()

    return
}

// Fetch the doc custom-attribute definitions for the first deliverable folder
// and pull out the allowed values for Status and Document Classification.
// Both are mandatory in Forma but list-typed, so each definition exposes its
// allowed options on a "values" / "arrayValues" / "options" array depending
// on the API revision — extractAttributeValues handles all three shapes.
async function getDocAttributeOptions(folderArray) {
    statusOptions = [];
    docClassificationOptions = [];

    if (!folderArray || folderArray.length === 0) {
        console.warn('No deliverable folders available; skipping Status / Document Classification fetch.');
        return;
    }

    const folderID = folderArray[0].folderID;
    const customAttributes = await getItemCustomDetails(accessTokenDataRead, folderID);
    if (!customAttributes) {
        console.warn('No custom attributes returned from folder', folderID);
        return;
    }
    console.log('Folder custom attributes:', customAttributes);

    const statusAttr = customAttributes.find(a => a && a.name === 'Status');
    const docClassAttr = customAttributes.find(a => a && a.name === 'Document Classification');

    statusOptions = extractAttributeValues(statusAttr);
    docClassificationOptions = extractAttributeValues(docClassAttr);

    console.log('Status options:', statusOptions);
    console.log('Document Classification options:', docClassificationOptions);
}

// ACC doc custom-attribute definitions can return a list-type attribute's
// allowed values under any of `arrayValues`, `values`, or `options`, and each
// entry can be a plain string or an object like `{value, description}`.
// Normalise to a flat array of strings.
function extractAttributeValues(attr) {
    if (!attr) return [];
    const raw = attr.arrayValues || attr.values || attr.options || [];
    return raw.map(v => {
        if (typeof v === 'string') return v;
        if (v && typeof v === 'object') return v.value || v.name || v.description || '';
        return String(v);
    }).filter(Boolean);
}

// Convert a 1-indexed column number to its Excel letter (1 -> A, 27 -> AA).
function colNumToLetters(n) {
    let s = '';
    while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = Math.floor((n - 1) / 26);
    }
    return s;
}

function escapeXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Resolve the file path for a named worksheet inside an .xlsx zip. The
// sheetN.xml number does NOT match tab order — Excel assigns it when the
// sheet is created and never re-numbers, so we have to look up the rId in
// xl/workbook.xml and follow it through xl/_rels/workbook.xml.rels.
async function findSheetPathByName(zip, sheetName) {
    const wbXml = await zip.file('xl/workbook.xml').async('string');
    const relsXml = await zip.file('xl/_rels/workbook.xml.rels').async('string');

    // Escape the name for regex use, and allow either attribute order on the <sheet> element.
    const escName = sheetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sheetMatch =
        wbXml.match(new RegExp(`<sheet[^>]*name="${escName}"[^>]*r:id="(rId\\d+)"`)) ||
        wbXml.match(new RegExp(`<sheet[^>]*r:id="(rId\\d+)"[^>]*name="${escName}"`));
    if (!sheetMatch) {
        throw new Error(`Could not find "${sheetName}" in workbook.xml`);
    }
    const rId = sheetMatch[1];

    const relMatch = relsXml.match(new RegExp(
        `<Relationship[^>]*Id="${rId}"[^>]*Target="([^"]+)"`
    )) || relsXml.match(new RegExp(
        `<Relationship[^>]*Target="([^"]+)"[^>]*Id="${rId}"`
    ));
    if (!relMatch) {
        throw new Error(`Could not resolve relationship ${rId} for sheet "${sheetName}"`);
    }

    // Sheet relationship targets are relative to the xl/ folder.
    return 'xl/' + relMatch[1];
}

async function convertToExcelTable(dataNamingStandard, dataTemplates, dataUploadFolders, statusValues, docClassValues) {
    // Open TIDP_Template_V2.xlsx as a zip and replace ONLY the <sheetData> block
    // inside the Dropdown list sheet. Every other file in the archive — including
    // the TIDP sheet's Table, formulas, calcChain and conditional formatting —
    // is left byte-identical. This avoids the corruption that happens when
    // round-tripping the workbook through SheetJS or ExcelJS.
    const templateResp = await fetch('./TIDP_Template_V2.xlsx');
    if (!templateResp.ok) {
        throw new Error('Failed to load TIDP_Template_V2.xlsx (HTTP ' + templateResp.status + ')');
    }
    const templateBuf = await templateResp.arrayBuffer();

    const zip = await JSZip.loadAsync(templateBuf);
    const sheetPath = await findSheetPathByName(zip, 'Dropdown list');
    const sheetFile = zip.file(sheetPath);
    if (!sheetFile) {
        throw new Error('Resolved sheet path ' + sheetPath + ' not present in workbook.');
    }
    console.log('Writing dropdown data into', sheetPath);
    let sheetXml = await sheetFile.async('string');

    // Detect the style index already applied to the empty cells in this sheet
    // so written values inherit the same look as the surrounding template.
    // Falls back to no style attribute if the sheet has no styled empty cell.
    const styleMatch = sheetXml.match(/<c r="A1"[^>]*\s+s="(\d+)"/);
    const cellStyleAttr = styleMatch ? ` s="${styleMatch[1]}"` : '';
    if (!styleMatch) {
        console.warn('Could not detect empty-cell style on Dropdown list — written values will use default formatting.');
    }

    // V2 Dropdown list column layout (positions referenced by the template's
    // data validations):
    //   A,B   = Project PIN value/description
    //   C,D   = Originator value/description
    //   E,F   = Functional Breakdown value/description
    //   G,H   = Spatial Breakdown value/description
    //   I,J   = Form value/description
    //   K,L   = Discipline value/description
    //   M     = Document Classification (replaced V1's Paper Size)
    //   N     = Status                  (replaced V1's Scale)
    //   O,P   = Template Name + ACC ID
    //   Q,R   = Upload Folder Path + ACC ID
    const columns = [];

    dataNamingStandard.forEach(obj => {
        if (obj.name === 'Number') return;
        columns.push({ header: `${obj.name} Value`,       values: obj.options.map(o => o.value) });
        columns.push({ header: `${obj.name} Description`, values: obj.options.map(o => o.description) });
    });
    columns.push({ header: 'Document Classification', values: docClassValues || [] });
    columns.push({ header: 'Status',                   values: statusValues   || [] });
    columns.push({ header: 'Template Name',            values: dataTemplates.map(t => t.templateName) });
    columns.push({ header: 'Template ACC ID',          values: dataTemplates.map(t => t.templateID) });
    columns.push({ header: 'Upload Folders Name',      values: dataUploadFolders.map(f => f.folderPath) });
    columns.push({ header: 'Upload Folder ACC ID',     values: dataUploadFolders.map(f => f.folderID) });

    // Emit one <row> per row containing only the cells that actually have a
    // value. Cells inherit cellStyleAttr (detected above from A1 of the
    // existing template) so written values match the surrounding formatting.
    const maxValueRows = columns.reduce((m, c) => Math.max(m, c.values.length), 0);
    const rowsXml = [];
    for (let r = 1; r <= 1 + maxValueRows; r++) {
        const cells = [];
        for (let c = 0; c < columns.length; c++) {
            const val = r === 1 ? columns[c].header : columns[c].values[r - 2];
            if (val === undefined || val === null || val === '') continue;
            const ref = colNumToLetters(c + 1) + r;
            cells.push(`<c r="${ref}"${cellStyleAttr} t="inlineStr"><is><t xml:space="preserve">${escapeXml(val)}</t></is></c>`);
        }
        if (cells.length > 0) {
            rowsXml.push(`<row r="${r}">${cells.join('')}</row>`);
        }
    }
    const newSheetData = `<sheetData>${rowsXml.join('')}</sheetData>`;

    // Replace the existing <sheetData>...</sheetData> block. Everything
    // outside it (cols, dataValidations, pageSetup, headerFooter, etc.)
    // stays exactly as the template defined it.
    const sheetDataRegex = /<sheetData[\s\S]*?<\/sheetData>/;
    if (!sheetDataRegex.test(sheetXml)) {
        throw new Error('Could not locate <sheetData> in ' + sheetPath);
    }
    sheetXml = sheetXml.replace(sheetDataRegex, newSheetData);

    zip.file(sheetPath, sheetXml);

    const outBuf = await zip.generateAsync({
        type: 'arraybuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
    });
    const blob = new Blob([outBuf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = projectName + '_TIDP.xlsx';
    link.click();
    window.URL.revokeObjectURL(link.href);
}