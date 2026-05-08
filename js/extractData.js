// Load the CSV file
// JavaScript function to trigger the click event on the file input
function openFileExplorer() {
    document.getElementById('fileInput').click();
    }

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    }

function handleDrop(event) {
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    handleFile(file);
    }   

function handleDragEnter(event) {
    event.preventDefault();
    document.getElementById('drop-area').classList.add('hover');
    }

function handleDragLeave(event) {
    event.preventDefault();
    document.getElementById('drop-area').classList.remove('hover');
    }

function handleFileSelect(event) {
    var file = event.target.files[0];
    handleFile(file);

    }

function handleFile(file) {
    // Reject anything that isn't an .xlsx. The <input accept=".xlsx"> only
    // filters the OS file picker; drag-and-drop bypasses it entirely, so we
    // have to check here too. SheetJS will read .xls / .csv etc. but the
    // upload pipeline assumes the V2 TIDP table layout, so non-.xlsx drops
    // would silently produce broken row data.
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'xlsx') {
        alert(`This tool only accepts .xlsx files. You dropped a .${ext} file.`);
        return;
    }

    // Display file name
        const fileSizeInBytes = file.size;
        const fileSizeInKb = fileSizeInBytes / 1024;
        const fileSizeText = fileSizeInKb > 1024 ? (fileSizeInKb / 1024).toFixed(2) + ' MB' : fileSizeInKb.toFixed(2) + ' KB';
    const fileInfoEl = document.getElementById('file-info');
    fileInfoEl.replaceChildren();
    const nameP = document.createElement('p');
    nameP.textContent = `File: ${file.name}`;
    const sizeP = document.createElement('p');
    sizeP.textContent = `Size: ${fileSizeText}`;
    fileInfoEl.append(nameP, sizeP);
    fileExtension = ext;
    // Add 'uploaded' class to indicate file upload
    document.getElementById('drop-area').classList.add('uploaded');
    console.log(file)
    droppedfile = file

    // A new file invalidates any prior validation result; clear the log and
    // hide the Confirm Upload button so the user has to revalidate.
    if (typeof clearUploadLog === 'function') clearUploadLog();
    if (typeof resetValidationState === 'function') resetValidationState();

    extractDataFromExcel(file);
    }

function extractDataFromExcel(event) {
    var file = event
    var reader = new FileReader();

    reader.onload = function(event) {
        var data = new Uint8Array(event.target.result);
        var workbook = XLSX.read(data, { type: "array" });

        // V2 template: TIDP table is A1:P149 with headers in row 1.
        // (V1 had headers at row 10 across A:AV — old hardcoded range.)
        var sheetName = "TIDP";
        var startCell = "A1";
        var endCell = "P2000";

        // Get the worksheet
        var worksheet = workbook.Sheets[sheetName];

        // Convert the range to row and column indices
        var startCellCoords = XLSX.utils.decode_cell(startCell);
        var endCellCoords = XLSX.utils.decode_cell(endCell);

        // Extract keys from the first row
        var keys = [];
        for (var col = startCellCoords.c; col <= endCellCoords.c; col++) {
            var cellAddress = XLSX.utils.encode_cell({ r: startCellCoords.r, c: col });
            var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : null;
            keys.push(cellValue);
        }

        // Extract data from subsequent rows and create objects
        var dataArray = [];
        for (var row = startCellCoords.r + 1; row <= endCellCoords.r; row++) {
            var rowData = {};
            var hasNonNullValue = false; // Flag to track if any value is not null or blank
            for (var col = startCellCoords.c; col <= endCellCoords.c; col++) {
                var key = keys[col - startCellCoords.c];
                var cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : null;
                rowData[key] = cellValue;
                if (cellValue) {
                    hasNonNullValue = true;
                }
            }
            if (hasNonNullValue) {
                dataArray.push(rowData);
            }
        }

        // Log the array of objects to the console (you can do further processing here)
        console.log("Table data as array of objects:", dataArray);
        uploadFileList = dataArray
    };

    reader.readAsArrayBuffer(file);
    }

async function setProjectDetails(){
    if(selectedOptionStartType === "new"){
        projectID = document.getElementById("input_project_new").value;
    }
    if(selectedOptionStartType === "existing"){
        projectID = document.getElementById("input_project_existing").value;
    }

    data = ProjectList.filter(item => {return projectID === item.ProjectID})
    projectName = data[0].ProjectName
    console.log(projectName)
    console.log("Project ID:",projectID+" | "+projectName)
    }

