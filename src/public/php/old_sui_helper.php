<?php
/**
 * Created by PhpStorm.
 * User: gmorehead
 * Date: 8/29/16
 * Time: 11:38 AM
 */


$SERVER_ERRORS = array(
    "1001" => "Empty filename",
    "1002" => "Invalid error code (%d)",
    "1003" => "Invalid file (%s) in request.",
    "1004" => "In properties file, enabled flag is set to false.",
    "1005" => "No response from server."
);

function errorToXml($statusCode, $errorContext, $subElem = "") {
    global $SERVER_ERRORS;
    return errorToXml5($statusCode, $statusCode, $SERVER_ERRORS[$statusCode], $errorContext, $subElem);
}


function errorToXml5($statusCode, $errorCode, $errorMsg, $errorContext, $subElem = "") {
    $outXML =
        "<status value=\"$statusCode\">\n" .
        "  <error code=\"$errorCode\" context=\"$errorContext\">\n" .
        "    <msg>\n" .
        "      $errorMsg\n" .
        "    </msg>\n" .
        "    $subElem\n" .
        "  </error>\n" .
        "</status>\n";
    return $outXML;
}


function propOrDefault($props, $prop, $default) {
    if (array_key_exists($prop, $props)) {
        $val = $props[$prop];
    } else {
        $val = $default;
    }
    return $val;
}

function writeError($statusCode, $errorCode, $errorMsg, $errorContext) {
    echo("{\n\"status\": \"$statusCode\",");
    echo("\n  \"error\": {");
    echo("\n    \"code\": \"$errorCode\",");
    echo("\n    \"msg\": \"$errorMsg\",");
    echo("\n    \"context\": \"$errorContext\"");
    echo("\n  }\n}\n");
}

/* Load the application specific properties file */
function loadProperties(&$props, $fileName)
{
    $inFile = fopen($fileName, "r") or die("Unable to open file " + $fileName);
    $allProps = "";
    while (($line = fgets($inFile, 4096)) !== false) {
        if ($line[0] != "#") {
            $allProps .= $line .= "\n";
        }
    }
    fclose($inFile);

    $props = parse_ini_string($allProps);

//    $ControlsParamTable = $GLOBALS["ControlsParamTable"] = propOrDefault($props, "Controls.param.table", "Parameter");
//    $ControlsParamAbstractPrefix = $GLOBALS["ControlsParamAbstractPrefix"] = propOrDefault($props, "Controls.param.abstract_prefix", "Abstract");
//    $ControlsParamDataPrefix =  $GLOBALS["ControlsParamDataPrefix"] = propOrDefault($props, "Controls.param.data_prefix", "Data");
//
//    $GLOBALS["AbstractParameterTable"] = "$ControlsParamAbstractPrefix$ControlsParamTable";
//    $GLOBALS["DataParameterTable"] = "$ControlsParamDataPrefix$ControlsParamTable";
//    $GLOBALS['MYSQL_DB'] = $props["DatabaseMgr.MYSQL_DB"];
//    $GLOBALS['MYSQL_USER'] = $props["DatabaseMgr.MYSQL_USER"];
//    $GLOBALS['MYSQL_PWD'] = $props["DatabaseMgr.MYSQL_PWD"];
//    $GLOBALS['MYSQL_HOST'] = $props["DatabaseMgr.MYSQL_HOST"];
}

/*
loadBSCProperties();

echo "\nControlsParamTable: " . $ControlsParamTable;
echo "\nAbstractParameterTable: " . $AbstractParameterTable;
echo "\nDataParameterTable: " . $DataParameterTable;
echo "\nMYSQL_DB: " . $MYSQL_DB;
echo "\nMYSQL_USER: " . $MYSQL_USER;
echo "\nMYSQL_PWD: [" . $MYSQL_PWD . "]";
echo "\nMYSQL_HOST: [" . $MYSQL_HOST . "]";
echo "\n";
*/

