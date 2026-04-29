const appName = "Forma TIDP Uploader";
const appVersion = "v1.5.2";

let projectID;
let projectName;
let NSID;
const hubID = "b.24d2d632-e01b-4ca0-b988-385be827cb04"
const account_id = "24d2d632-e01b-4ca0-b988-385be827cb04"
const bucketKey = "wip.dm.emea.2"
const defaultFolder = "urn:adsk.wipemea:fs.folder:co.l7DHLbVaRl-XxgXi8QYFZw" // KELTBRAY - WIP Folder
// PKCE public client ID for the Autodesk APS app. Safe to ship in the
// browser — PKCE replaces the client secret entirely with a per-flow
// verifier/challenge pair, so there is no shared secret to protect.
const apsClientId = "rIZ4T6uq2qbVGsBucgGz8zwSPPrENzupOQGkO9ii01U4nNT0"
let templateFolderID
let selectedOptionStartType
let uploadFileList

const uploadfolders = [
    {folderName:"KELTBRAY - WIP",folderID:"urn:adsk.wipemea:fs.folder:co.l7DHLbVaRl-XxgXi8QYFZw"},
    //{folderName:"SHARED",folderID:"urn:adsk.wipemea:fs.folder:co.mRskcAmVS420xLXVgxF8ZA"}
]
const scaleArray = [
    "1:1",
    "1:2",
    "1:5",
    "1:10",
    "1:20",
    "1:50",
    "1:100",
    "1:200",
    "1:250",
    "1:500",
    "1:1000",
    "1:1250",
    "NTS",
    "-"
];

const paperSizeArray = [
    "A0",
    "A1",
    "A2",
    "A3",
    "A4",
    "Custom",
    "N/A",
    "-"
];

var AccessToken_DataCreate
var AccessToken_DataRead
var AccessToken_BucketCreate
let accessTokenDataWrite

let ProjectList =[]
let ProjectListRaw
let ProjectObject

let namingstandard;
let filelist =[];
let arrayprojectPin=[];
let arrayOriginator=[];
let arrayfunction=[];
let arraySpatial=[];
let arrayForm=[];
let arrayDiscipline=[];
let objectKeyShort
let objectKeyLong
let fileData
let filename
let customAttributes =[]
let templates = []
let titleline1ID
let revisionCodeID
let paperSizeID
let scaleID
let stageID

let ClassificationID
let StatusCodeDescriptionID
let fileURN
let fileExtension
let progressCount = 0
let uploadbutton
let templatesList =[];
let originSelectionDropdown
let templateDropdwon
let copyURN
let copyURN_Raw
let uploadFolderID
let fileTemplate
let reloadButton
let loadingScreen
let filestouploadList

// Resolves once login has completed AND user details (incl. userID in sessionStorage) are populated.
// gatherArrays() awaits this before fetching the project list.
let resolveLoginReady;
const loginReady = new Promise(resolve => { resolveLoginReady = resolve; });

document.addEventListener('DOMContentLoaded', async function() {
    // Get the full URL of the current webpage
    const fullUrl = window.location.href;
    document.getElementById("appInfo").textContent = `${appName} ${appVersion}`;
    // Split the URL at the "?" and take the first part
    toolURL = fullUrl.split('?')[0];
    try {
        await checkLogin()
    } finally {
        // Always signal — if login redirected (signin) the page is unloading anyway;
        // if it failed, downstream code can fail loudly rather than hang forever.
        resolveLoginReady();
    }
    loadingScreen = document.getElementById('loadingScreen');
    statusUpdateLoading = document.getElementById('statusUpdateLoading');
    const logoutButton = document.getElementById('logoutBtn');

})
function signOut(){
    localStorage.setItem('user_refresh_token','blank');
    signin()
}






