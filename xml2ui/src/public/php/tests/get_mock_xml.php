<?php
/**
 * Created by PhpStorm.
 * User: jscarsdale
 * Date: 5/17/16
 * Time: 10:14 AM
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/xml; charset=UTF-8");

$SCRIPT_PATH = dirname(dirname($_SERVER["SCRIPT_FILENAME"]));

require_once ($SCRIPT_PATH . "/sLogger.php");
$log->setLevel(7);

require_once ($SCRIPT_PATH . "/sui_helper.php");


function getRandomNthFilenameVersion($fn, $numVersions = 0) {
    /* Return $fn, randoming adding one of .0  .1  .2  .3  etc before the file extension*/

    if ($numVersions <= 0) {
        /* No (or invalid) versions */
        return $fn;
    }

    /* Multiple file versions exist - choose one. */
    $v = time() % $numVersions;  // randomly get a version
    $pi = pathinfo($fn);
    $bn = $pi["basename"];
    $ext = "." . $pi["extension"];
    $newExt = "." . $v . $ext;
    $newBn = str_replace($ext, $newExt, $bn);
    $newFn = str_replace($bn, $newBn, $fn);

    if (file_exists($newFn)) {
        return $newFn;
    }

    return $fn;
}

function getXmlErrorMessages(&$outErrMsg, $errorsToIgnore = array()) {
    $outErrCode = 0;
    $outErrMsg = "";
    foreach (libxml_get_errors() as $error) {
        if (in_array($errCode, $errorsToIgnore)) {
            continue;
        }
        $outErrMsg .= "\nLibxml error ({$error->code}): {$error->message}";
        if ($errCode == 0) {
            $errCode = "{$error->code}";
        }
    }
    return $outErrCode;
}

function validateAndEchoXmlFile($fileName, $caller) {
    // $outErrorXml = "<status value=\"0\"></status>";   // Default XML status is success unless changed inline below.
    $isValid = true;
    $errCode = 0;

    if (empty($fileName)) {
        echo(errorToXml5("1001", "1001", "Empty filename", $caller));
        $isValid = false;
    } else {
        // Protect against hacker browsing outside test folder
        $fileName = basename($fileName);
        if ((substr($fileName, strlen($fileName)-4, 4) == ".xml") && file_exists($fileName)) {

            libxml_use_internal_errors(true);

            $xml = simplexml_load_file($fileName);
            if ($xml) {
                echo $xml->asXML();
            } else {
                $xmlErrors = "";
                $xmlErrorsToIgnore = array();
                $errCode = getXmlErrorMessages($xmlErrors, $xmlErrorsToIgnore);
                $errMsg = sprintf("Invalid content in file %s.", $fileName);
                $errMsg .= $xmlErrors;
                echo(errorToXml5($errCode, $errCode, $errMsg, $caller));
            }


            libxml_use_internal_errors(false);
        } else {
            $errMsg = sprintf("Invalid file (%s) in request.", $fileName);
            echo(errorToXml5("1003", "1003", $errMsg, $caller));
            $isValid = false;
        }
    }

    return $isValid;
}


function parseIniString($propsString) {
    $props = array();
}

/* Load ui.properties file */
function loadUiProps()
{
    global $UiProperties;
    $inFile = fopen("/var/www/modmgr/ui.properties", "r") or die("Unable to open file /var/www/modmgr/ui.properties!");
    $allProps = "";
    $i = 0;
    while ( ($i < 38) && ( ($line = fgets($inFile, 4096)) !== false) ) {
        $line = str_replace("\$","-", $line);
        $line = str_replace("{", "-", $line);
        $line = str_replace("}", "-", $line);
        $line = str_replace("(", "-", $line);
        $line = str_replace(")", "-", $line);
        $line = str_replace("&", "-", $line);
        $line = str_replace(":", "-", $line);
        $line = str_replace("?", "-", $line);
        $line = str_replace("_", "-", $line);
        $line = str_replace("=", "-", $line);
        if ($line[0] != "#" && $line[0] != "\n") {
            $allProps .= $line;
        }
        $i = $i + 1;
    }
    fclose($inFile);

    $UiProperties = parse_ini_string($allProps);

    // Example:
    // $ControlsParamTable = getModSvrProp("Controls.param.table", "Parameter");
}


$UiProperties = loadPropsFile($SCRIPT_PATH . "/../ui.properties");

$outXML = "";
$xmlFileName = "";
$samples = 0;

if (array_key_exists("file", $_REQUEST)) {
    $xmlFileName = $_REQUEST["file"];
}

if (array_key_exists("versions", $_REQUEST)) {
    $versions = $_REQUEST["versions"];
}

$xmlFileName = getRandomNthFilenameVersion($xmlFileName, $versions);

validateAndEchoXmlFile($xmlFileName, "get_mock_xml.php");

?>
