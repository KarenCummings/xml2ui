<?php
/*
*  Client backend to read the file simple_ui.properties into a javascript structure.
*/

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/xml; charset=UTF-8");

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);
$APP_DIR = dirname($SCRIPT_PATH); // assume it's the parent of the php folder

require_once ($SCRIPT_PATH . "/sui_helper.php");

function main($appDir)
{
    // new stuff
    $UIProps = loadPropsFile($appDir . "/ui.properties");
    $UIMacroProps = extractMacros($UIProps);
    replaceMacros($UIProps, $UIMacroProps);


    $outXML = sprintf(
        "<AppInfo>\n" .
        "  <props>\n%s" .
        "  </props>\n" .
        "  <status value=\"0\"></status>\n" .
        "</AppInfo>\n",
        UIPropsToXml($UIProps)
    );

    echo $outXML;
}

main($APP_DIR);

?>
