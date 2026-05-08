let statusUpdateUpload
const progressBarContainer = document.querySelector('.progress-bar__container');
const progressBar = document.querySelector('.progress-bar-Main');
const progressBarText = document.querySelector('.progress-bar-Main__text');
let progressTotal

function setStatus(message) {
    statusUpdateUpload.replaceChildren();
    const p = document.createElement('p');
    p.className = 'extracted-ids';
    p.textContent = message;
    statusUpdateUpload.appendChild(p);
}

// Console-style log panel under the upload section. Each entry is one line
// tagged INFO / SUCCESS / WARN / ERROR. The panel auto-shows on first write.
function logUpload(message, level) {
    const log = document.getElementById('uploadLog');
    const panel = document.getElementById('uploadLogPanel');
    if (!log || !panel) return;
    panel.hidden = false;

    const entry = document.createElement('div');
    entry.className = 'upload-log__entry upload-log__entry--' + (level || 'info');

    const time = document.createElement('span');
    time.className = 'upload-log__time';
    const now = new Date();
    time.textContent = now.toTimeString().slice(0, 8);

    entry.appendChild(time);
    entry.appendChild(document.createTextNode(`[${(level || 'info').toUpperCase()}] ${message}`));
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function clearUploadLog() {
    const log = document.getElementById('uploadLog');
    const panel = document.getElementById('uploadLogPanel');
    if (log) log.replaceChildren();
    if (panel) panel.hidden = true;
}

function isBlank(v) {
    return v === undefined || v === null || String(v).trim() === '';
}

// Per-row validation. Returns { errors, warnings } counts so callers can
// decide whether to block the upload. Logs every issue into the upload log.
//
// Mandatory (block upload): Title Line, Placeholder Template, Target Folder,
// and a complete Information Identification — i.e. all 7 components filled
// (Project PIN, Originator, Functional Breakdown, Spatial Breakdown, Form,
// Discipline, Number). The IIA cell itself is a formula concatenating those
// components, so we validate the source cells rather than the derived value.
//
// Recommended (warning): File Description, Status, Document Classification —
// blank cells fall back to placeholder defaults during postCustomItemDetails.
function validateUploadRows(rows) {
    const blockingFields = ['Title Line', 'Placeholder Template', 'Target Folder'];
    const recommendedFields = ['File Description', 'Status', 'Document Classification'];
    const iiaComponents = [
        'Project PIN', 'Originator', 'Functional Breakdown',
        'Spatial Breakdown', 'Form', 'Discipline', 'Number',
    ];

    let errorCount = 0;
    let warningCount = 0;

    rows.forEach((row, idx) => {
        // The TIDP table starts at row 2 in Excel (row 1 is headers); idx 0 is the
        // first data row. Translate to the user's 1-indexed Excel row number.
        const excelRow = idx + 2;

        blockingFields.forEach(field => {
            if (isBlank(row[field])) {
                logUpload(`Row ${excelRow}: "${field}" is empty — required.`, 'error');
                errorCount++;
            }
        });

        // IIA completeness — single message per row listing every missing component.
        const missingIIA = iiaComponents.filter(f => isBlank(row[f]));
        if (missingIIA.length > 0) {
            logUpload(
                `Row ${excelRow}: Information Identification incomplete — missing ${missingIIA.join(', ')}.`,
                'error'
            );
            errorCount++;
        }

        recommendedFields.forEach(field => {
            if (isBlank(row[field])) {
                logUpload(`Row ${excelRow}: "${field}" is empty — a placeholder default will be used.`, 'warn');
                warningCount++;
            }
        });
    });

    return { errorCount, warningCount };
}

// Two-stage upload flow:
//  1. validateTIDP() — runs row-level validation only. On success, reveals
//     the Confirm Upload button. The user can fix the Excel and re-upload to
//     revalidate as many times as needed before committing.
//  2. confirmUpload() — runs the actual upload to ACC. Only callable after
//     validation has passed; resets state when the file is replaced.
let validationPassed = false;

function resetValidationState() {
    validationPassed = false;
    const confirmBtn = document.getElementById('confirmUploadBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.title = 'Run validation first';
    }
}

async function validateTIDP(){
    const select = document.getElementById('input_project_existing').value;
    const fileInput = document.getElementById('fileInput');
    const uploadfile = fileInput.files[0];
    if (!select.trim()) {
        alert('Please select a project');
        return;
    }
    if(!uploadfile){
        alert('Please upload a TIDP file');
        return;
    }
    statusUpdateUpload = document.getElementById('statusUpdateUpload')

    // Fresh validation run: clear any prior log + hide the Confirm button.
    clearUploadLog();
    resetValidationState();

    if (!uploadFileList || uploadFileList.length === 0) {
        logUpload('No TIDP rows were found in the uploaded file. Make sure the TIDP sheet has populated rows below the header row.', 'error');
        return;
    }

    logUpload(`Validating ${uploadFileList.length} row(s)...`, 'info');
    const { errorCount, warningCount } = validateUploadRows(uploadFileList);

    if (errorCount > 0) {
        logUpload(
            `Validation failed: ${errorCount} blocking error(s), ${warningCount} warning(s). ` +
            `Update the Excel and re-upload to revalidate. Confirm Upload is locked until validation passes.`,
            'error'
        );
        // Make sure Confirm stays locked even if a previous run had unlocked it.
        resetValidationState();
        return;
    }
    if (warningCount > 0) {
        logUpload(`Validation passed with ${warningCount} warning(s). Review above before confirming — placeholder defaults will be used for empty cells.`, 'warn');
    } else {
        logUpload('Validation passed with no issues.', 'success');
    }
    logUpload('Click "Confirm Upload to ACC" to proceed, or update the Excel and re-upload to revalidate.', 'info');

    validationPassed = true;
    const confirmBtn = document.getElementById('confirmUploadBtn');
    confirmBtn.disabled = false;
    confirmBtn.title = 'Click to upload validated TIDP rows to ACC';
}

async function confirmUpload(){
    if (!validationPassed) {
        alert('Please validate the TIDP first.');
        return;
    }

    const confirmBtn = document.getElementById('confirmUploadBtn');
    const validateBtn = document.getElementById('validateBtn');
    confirmBtn.disabled = true; // prevent double-click while upload is in flight
    if (validateBtn) validateBtn.disabled = true; // lock Validate too so users can't kick off a second pass mid-upload

    try {
        logUpload('Starting upload to ACC...', 'info');
        setStatus('Getting Relevant Data...');
        await getCustomDetailsData();
        progressTotal = uploadFileList.length;
        progressCount = 0;
        await uploadTIDPToACC(uploadFileList);
    } finally {
        if (validateBtn) validateBtn.disabled = false;
        // Whatever happened, this run is over — require a fresh validate before another upload.
        resetValidationState();
    }
}

async function uploadTIDPToACC(array){
    setStatus('Getting Access Tokens...');
    accessTokenDataCreate = await getAccessToken("data:create")
    accessTokenDataWrite = await getAccessToken("data:write")

    const failures = [];
    for (const item of array) {
        const name = item["Information identification (automatic)"];
        try {
            await uploadItem(item);
            setStatus(`Uploaded ${name}`);
            logUpload(`Uploaded ${name}`, 'success');
        } catch (err) {
            const message = err && err.message ? err.message : String(err);
            console.error(`Failed to upload "${name}":`, err);
            failures.push({ name, message });
            setStatus(`Failed: ${name} — continuing with next file...`);
            logUpload(`Failed: ${name} — ${message}`, 'error');
        }
        updateProgressBar();
    }

    const total = array.length;
    const succeeded = total - failures.length;
    if (failures.length === 0) {
        setStatus(`All ${total} file(s) uploaded to ACC.`);
        logUpload(`All ${total} file(s) uploaded to ACC.`, 'success');
    } else {
        setStatus(`${succeeded} of ${total} uploaded; ${failures.length} failed. See log above for details.`);
        logUpload(`${succeeded} of ${total} uploaded; ${failures.length} failed.`, 'error');
    }
}

async function uploadItem(item){
    const name = item["Information identification (automatic)"];
    setStatus(`Uploading ${name}...`);

    const returnData = await postNewCopyOfItem(
        accessTokenDataCreate,
        name,
        item["FOLDER URN (automatic)"],
        item["Template URN (automatic)"]
    );

    if (!returnData) {
        throw new Error('No response from create-item request (network error?)');
    }
    if (returnData.errors) {
        throw new Error('Create-item API error: ' + JSON.stringify(returnData.errors));
    }
    if (!returnData.included || !returnData.included[0] || !returnData.included[0].id) {
        throw new Error('Create-item response missing included[0].id: ' + JSON.stringify(returnData));
    }

    const newFileURN = encodeURIComponent(returnData.included[0].id);
    fileURN = newFileURN; // keep legacy global in sync for any downstream consumers

    // V2 column mapping. Empty cells fall back to placeholder defaults so that
    // rows with missing inputs still upload (Status and Document Classification
    // are mandatory in Forma; if blank we use the first allowed value cached
    // in getCustomDetailsData).
    const customResp = await postCustomItemDetails(
        accessTokenDataWrite,
        newFileURN,
        {
            titleLine:             item["Title Line"],
            fileDescription:       item["File Description"],
            status:                item["Status"],
            documentClassification: item["Document Classification"],
            placeholderName:       name,
        }
    );
    if (customResp && customResp.errors) {
        throw new Error('Custom-attributes batch update failed: ' + JSON.stringify(customResp.errors));
    }
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

        const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+projectID+"/items?copyFrom="+copyURN;
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

// Helper: returns trimmed string if value is non-empty, otherwise the fallback.
function valueOrFallback(value, fallback) {
    if (value === undefined || value === null) return fallback;
    const str = String(value).trim();
    return str === '' ? fallback : str;
}

async function postCustomItemDetails(accessTokenDataCreate, fileURN, fields) {
    const titleLine             = valueOrFallback(fields.titleLine,              fields.placeholderName);
    const fileDescription       = valueOrFallback(fields.fileDescription,        'TIDP Placeholder File');
    const status                = valueOrFallback(fields.status,                 statusDefault);
    const documentClassification = valueOrFallback(fields.documentClassification, docClassificationDefault);

    let bodyData = [];

    if (titleline1ID) {
        bodyData.push({ id: titleline1ID.id, value: titleLine });
    }
    if (revisionCodeID) {
        // Every TIDP placeholder ships at P01.01 by Aureos convention; the
        // value is intentionally not exposed via a TIDP column (decision in
        // feedback.md). Change it here if the convention ever shifts.
        bodyData.push({ id: revisionCodeID.id, value: 'P01.01' });
    }
    if (descriptionID) {
        bodyData.push({ id: descriptionID.id, value: fileDescription });
    }
    if (statusID && status) {
        bodyData.push({ id: statusID.id, value: status });
    }
    if (docClassificationID && documentClassification) {
        bodyData.push({ id: docClassificationID.id, value: documentClassification });
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

// Globals populated by getCustomDetailsData and read by postCustomItemDetails.
let statusID;
let docClassificationID;
let statusDefault = '';
let docClassificationDefault = '';

async function getCustomDetailsData(){

    customAttributes = await getItemCustomDetails(accessTokenDataRead,uploadFileList[0]["FOLDER URN (automatic)"])
    console.log("Custom Attributes:",customAttributes)

    titleline1ID        = await findObjectByName("Title Line 1",            customAttributes);
    revisionCodeID      = await findObjectByName("Revision",                customAttributes);
    descriptionID       = await findObjectByName("File Description",        customAttributes);
    statusID            = await findObjectByName("Status",                  customAttributes);
    docClassificationID = await findObjectByName("Document Classification", customAttributes);

    // Cache the first allowed value for each list-typed attribute so we can
    // fall back to it when a row leaves the cell blank. extractAttributeValues
    // is defined in getACCData.js and shared via the global scope.
    const statusVals    = typeof extractAttributeValues === 'function' ? extractAttributeValues(statusID) : [];
    const docClassVals  = typeof extractAttributeValues === 'function' ? extractAttributeValues(docClassificationID) : [];
    statusDefault            = statusVals[0]   || '';
    docClassificationDefault = docClassVals[0] || '';

    console.log({
        titleline1ID, revisionCodeID, descriptionID, statusID, docClassificationID,
        statusDefault, docClassificationDefault,
    });
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