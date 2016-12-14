<?php
/**
 * Created by PhpStorm.
 * User: jscarsdale
 * Date: 4/11/16
 * Time: 2:04 PM
 */

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

/* Load BSC Properties file */
function loadBSCProperties()
{
    $inFile = fopen("/opt/config/BSCServer.properties", "r") or die("Unable to open file /opt/config/BSCServer.properties!");
    $allProps = "";
    while (($line = fgets($inFile, 4096)) !== false) {
        if ($line[0] != "#") {
            $allProps .= $line .= "\n";
        }
    }
    fclose($inFile);

    $props = parse_ini_string($allProps);

    $ControlsParamTable = $GLOBALS["ControlsParamTable"] = propOrDefault($props, "Controls.param.table", "Parameter");
    $ControlsParamAbstractPrefix = $GLOBALS["ControlsParamAbstractPrefix"] = propOrDefault($props, "Controls.param.abstract_prefix", "Abstract");
    $ControlsParamDataPrefix =  $GLOBALS["ControlsParamDataPrefix"] = propOrDefault($props, "Controls.param.data_prefix", "Data");

    $GLOBALS["AbstractParameterTable"] = "$ControlsParamAbstractPrefix$ControlsParamTable";
    $GLOBALS["DataParameterTable"] = "$ControlsParamDataPrefix$ControlsParamTable";
    $GLOBALS['MYSQL_DB'] = $props["Paramdbmgr.MYSQL_DB"];
    $GLOBALS['MYSQL_USER'] = $props["Paramdbmgr.MYSQL_USER"];
    $GLOBALS['MYSQL_PWD'] = $props["Paramdbmgr.MYSQL_PWD"];
    $GLOBALS['MYSQL_HOST'] = $props["Paramdbmgr.MYSQL_HOST"];
}

loadBSCProperties();

/*
echo "\nControlsParamTable: " . $ControlsParamTable;
echo "\nAbstractParameterTable: " . $AbstractParameterTable;
echo "\nDataParameterTable: " . $DataParameterTable;
echo "\nMYSQL_DB: " . $MYSQL_DB;
echo "\nMYSQL_USER: " . $MYSQL_USER;
echo "\nMYSQL_PWD: [" . $MYSQL_PWD . "]";
echo "\nMYSQL_HOST: [" . $MYSQL_HOST . "]";
*/

