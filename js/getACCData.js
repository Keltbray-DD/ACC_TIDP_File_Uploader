let getRate = 0;
let folderList_Main =[];
let deliverableFolders = [];
let statusUpdate
let accessTokenDataRead
let nsData = [];


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
        //await getfileslist()
        await listProjects()
        //await getNamingStandard()
        //await getTemplateFiles()
        //getCustomDetailsData()

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

async function getFolderDetails(accessTokenDataRead,projectID,folderID){

    const headers = {
        'Authorization':"Bearer "+accessTokenDataRead,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/"+projectID+"/folders/"+folderID;
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
    ProjectListRaw = await getProjects(accessTokenDataRead)

    //console.log("Raw Project List",ProjectListRaw.data)

    for(let i = 0; i < ProjectListRaw.data.length; i++){
        if(ProjectListRaw.data[i].status === 'active'){
            
        }
        ProjectList.push({'ProjectName':ProjectListRaw.data[i].attributes.name,'ProjectID':ProjectListRaw.data[i].id})
    }

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

    const apiUrl = "https://developer.api.autodesk.com/project/v1/hubs/"+hubID+"/projects/"+projectID+"/topFolders";
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
        } catch {
            console.log("Error: Geting folder list");
        }
        await convertToExcelTable(nsData,templatesList,deliverableFolders)
        statusUpdate.innerHTML = `<p class="extracted-ids"> Templae and Options file ready for download</p>`


    }}

async function getFolderList(AccessToken, startFolderList, parentFolderPath) {
    try {
        // Array of folder names to skip
        const foldersToSkip = ["0A.INCOMING","Z.PROJECT_ADMIN","ZZ.SHADOW_PROJECT"];
        const deliverableFoldersToAdd = ["WIP","0E.SHARED","0F.CLIENT_SHARED","0F.SHARED_TO_CLIENT", "0G.PUBLISHED", "0H.ARCHIVED"]

        for (const startFolder of startFolderList) {
            const folderList = await getfolderItems(startFolder.folderID, AccessToken, projectID);
            if (!folderList || !folderList.data || !Array.isArray(folderList.data)) {
                throw new Error("Error getting folder items: Invalid folderList data");
            }
            if (getRate >= 290) {
                console.log("Waiting for 10 Seconds..."); // Displaying the message for a 60-second delay
                await delay(20000); // Delaying for 60 seconds
            } else {
                const promises = folderList.data.map(async folder => {
                    if (folder.type === 'folders') {
                        const folderID = "folderID: " + folder.id;
                        folderNameLocal = "folderPath: " + folder.attributes.name;
                        const fullPath = parentFolderPath ? parentFolderPath + '/' + folderNameLocal.split(': ')[1] : folderNameLocal.split(': ')[1];
                        folderList_Main.push({ folderID: folder.id, folderPath: fullPath,folderNameEnd: folderNameLocal });
                        if(deliverableFoldersToAdd.some(AddName => folderNameLocal.includes(AddName))){
                            deliverableFolders.push({ folderID: folder.id, folderPath: fullPath,folderNameEnd: folder.attributes.name });
                        }
                        statusUpdate.innerHTML = `<p class="extracted-ids"> Added folder: ${fullPath}</p>`
                        console.log("Added folder:", folderID, fullPath);
                        // Check if the folderName contains any of the names in foldersToSkip array
                        if (!foldersToSkip.some(skipName => folderNameLocal.includes(skipName))) {
                            await getFolderList(AccessToken, [{ folderID: folder.id, folderPath: fullPath }], fullPath);
                        } else {
                            console.log("Skipping getFolderList for folder:", folderID, fullPath);
                        }
                    }
                });
                await Promise.all(promises);
            }
        }
    } catch (error) {
        console.error(error.message);
    }

    }

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

async function getNamingStandardID(folderArray){
    wipFolderID = folderArray.filter(item => {
        return item.folderPath.includes("0C.KELTBRAY/WIP")})
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
    templateFolderID = folderArray.filter(item => {
        return item.folderPath === "0B.GENERAL/APPROVED_TEMPLATES"})[0].folderID
    console.log(templateFolderID);
    await getTemplateFiles()
    
    return 
}

async function convertToExcelTable(dataNamingStandard,dataTemplates,dataUploadFolders){
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    const headers = [];

    // Generate headers based on data.name
    dataNamingStandard.forEach(obj => {
        if(obj.name != "Number"){
        const attributeName = obj.name;
        headers.push(`${attributeName} Value`, `${attributeName} Description`);
        }
    });
    headers.push(`Paper Size`,`Scale`,`Template Name`, `Template ACC ID`,`Upload Folders Name`, `Upload Folder ACC ID`);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    
    // Define the starting row and column
    let startRow = 1; // Start from row 2 (indexing starts from 0)
    let startColumn = 0; // Start from column B (indexing starts from 0)

    // Populate the worksheet with data
    dataNamingStandard.forEach(obj => {
        if(obj.name != "Number"){
            const options = obj.options;
            options.forEach(option => {
                const row = startRow;
                const column = startColumn;
                XLSX.utils.sheet_add_aoa(worksheet, [[option.value, option.description]], { origin: { r: row, c: column } });
                startRow++;
            });
            
            // Increment the start row for the next attribute
            startRow = 1
            startColumn += 2;
        }

    });
    paperSizeArray.forEach(option => {
        const row = startRow;
        const column = startColumn;
        XLSX.utils.sheet_add_aoa(worksheet, [[option]], { origin: { r: row, c: column } });
        startRow++;
    });

    startRow = 1
    startColumn += 1;

    scaleArray.forEach(option => {
        const row = startRow;
        const column = startColumn;
        XLSX.utils.sheet_add_aoa(worksheet, [[option]], { origin: { r: row, c: column } });
        startRow++;
    });

    startRow = 1
    startColumn += 1;

    dataTemplates.forEach(option => {
        const row = startRow;
        const column = startColumn;
        XLSX.utils.sheet_add_aoa(worksheet, [[option.templateName, option.templateID]], { origin: { r: row, c: column } });
        startRow++;
    });
    
    // Increment the start row for the next attribute
    startRow = 1
    startColumn += 2;

    dataUploadFolders.forEach(option => {
                const row = startRow;
                const column = startColumn;
                XLSX.utils.sheet_add_aoa(worksheet, [[option.folderPath, option.folderID]], { origin: { r: row, c: column } });
                startRow++;
            });
            
    // Increment the start row for the next attribute
    startRow = 1
    startColumn += 2;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TIDP_Options');

    // Convert the workbook to binary Excel data
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    // Function to convert string to array buffer
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    // Create a Blob from the Excel data
    const blob = new Blob([s2ab(excelData)], { type: 'application/octet-stream' });

    // Create a temporary link element
    const optionslink = document.createElement('a');
    optionslink.href = window.URL.createObjectURL(blob);
    optionslink.download = projectName+'_TIDP_Options.xlsx';
    optionslink.click();
    window.URL.revokeObjectURL(optionslink.href)
    // Create a temporary link element
    const TIDPlink = document.createElement('a');
    TIDPlink.href = './TIDP_Template.xlsx';
    //TIDPlink.download = projectName+'_TIDP_Template.xlsx';
    TIDPlink.click();

    // Clean up
;
    }