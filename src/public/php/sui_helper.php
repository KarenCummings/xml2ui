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

/* Load ui.properties file */
function loadPropsFile($propsFileName)
{
    $props = array();
    $propRegEx = "/[ \t]*([0-9a-zA-Z._-]+)[ \t]*=[ \t]*([^\n]*)/";
    $matches = null;

    $inFile = fopen("$propsFileName", "r") or die("Unable to open file $propsFileName!");
    while ( ($line = fgets($inFile, 4096)) !== false) {
        if ($line[0] != "#" && $line[0] != "\n") {
            if (preg_match($propRegEx, $line, $matches) == 1) {

                $k = $matches[1];
                $v = trim($matches[2]);

                $props[$k] = $v;
            }
        }
    }
    fclose($inFile);

    // sort($props);
    return $props;
}

function extractMacros($props) {
    /* Support macros of the following type:
     *
     **********************************************************************************
     * Type 1: Simple Replacement macro.
     *
     *     macro.1.token = FU
     *     macro.1.replacement = Bar
     *
     * All instances of ${FU} inside other property values are
     * replaced with the value of macro.1.replacement ("Bar").
     *
     **********************************************************************************
     * Type 2: Replacement by way of a value fetched from a cross-reference
     *         properties file.
     *
     *      macro.2.token    = BSC_MYSQL_HOST
     *      macro.2.source   = /opt/config/ModuleServer.properties
     *      macro.2.property = DatabaseMgr.MYSQL_HOST
     *
     *  All instances of ${BSC_MYSQL_HOST} inside other property values are
     *  replaced with the value of macro.2.property ("DatabaseMgr.MYSQL_HOST")
     *  that is fetched from the properties file macro.2.source
     * ("/opt/config/ModuleServer.properties").
     **********************************************************************************
     * Rules:
     *    1. Macro properties must be defined in the order shown for Type 1 or Type 2.
     *    2. The last replacement wins.
     *    3. If no replacement is defined, any macro usages will be replaced with "".
     *    4. Macros are replaced in the order defined.  Recursive replacement will only
     *       occur when a later macro replaces a value inserted as part of the replacement
     *       made by an earlier macro.
     *    4. Macro replacement within macros is NOT SUPPORTED.
     *    5. The behavior of macro replacement of macros embedded within a value
     *       retrieved as a replacement from a Cross Ref props files is undefined
     *       and not supported.
     **********************************************************************************
     */
    $macroProps = array();
    $CrossRefPropsFiles = array();

    $macroRegEx = "/macro.([0-9]+).(token|source|property|replacement)/";
    $matches = null;

    foreach ($props as $propKey => $propValue) {
        if ( preg_match($macroRegEx, $propKey, $matches) == 1 ) {
            $index = $matches[1];
            $field = $matches[2];
            if (!array_key_exists($index, $macroProps)) {
                $macroProps[$index] = array();
                $macroProps[$index]["replacement"] = "";
            }
            if (strcmp($field, "source") == 0) {
                $CrossRefPropsFile = $propValue;

                // Only read a given $CrossRefPropsFile once
                if (!array_key_exists($CrossRefPropsFile, $CrossRefPropsFiles)) {
                    $CrossRefPropsFiles[$CrossRefPropsFile] = loadPropsFile($CrossRefPropsFile);
                }
                $macroProps[$index]["source"] = $CrossRefPropsFile;

            } elseif (strcmp($field, "property") == 0) {
                $replacement = "";
                if (array_key_exists("source", $macroProps[$index])) {
                    $CrossRefPropsFile = $macroProps[$index]["source"];
                    $replacement = $CrossRefPropsFiles[$CrossRefPropsFile][$propValue];
                }
                $macroProps[$index]["replacement"] = $replacement;
            } else {
                $macroProps[$index][$field] = $propValue;
            }
        }
    }
    return $macroProps;
}

function replaceMacros(&$props, $macroProps) {
    foreach ($props as $propKey => $propValue) {
        $newValue = $propValue;
        foreach ($macroProps as $macroKey => $macro) {
            $token = "\${" . $macro["token"] . "}";
            $newValue = str_replace($token, $macro["replacement"], $newValue);
        }
        $props[$propKey] = $newValue;
    }
}

function aggregateProps($UIProps) {
    $propArr = array(); // return value

    $digitRegEx = "/([0-9]+)/";

    foreach ($UIProps as $propKey => $propValue) {

        // Decide whether the property is an indexed array or a single record
        $keyArr = explode(".", $propKey);
        $n = count($keyArr);
        if ($n > 2 && (preg_match($digitRegEx, $keyArr[$n-2]) == 1) ) {
            // Indexed Array
            $propName = implode(".", array_slice($keyArr, 0, $n-2));
            $propIndex = $keyArr[$n-2];
            $propField = $keyArr[$n-1];

            if (!array_key_exists($propName, $propArr)) {
                $propArr[$propName] = array();
            }

            if (!array_key_exists($propIndex, $propArr[$propName])) {
                $propArr[$propName][$propIndex] = array();
            }
            $propArr[$propName][$propIndex][$propField] = $propValue;

        } else if ($n > 1) {
            // Single Record with fields
            $propName = implode(".", array_slice($keyArr, 0, $n-1));
            $propField = $keyArr[$n-1];

            if (!array_key_exists($propName, $propArr)) {
                $propArr[$propName] = array();
            }

            $propArr[$propName][$propField] = $propValue;

        } else /* $n == 1 */ {
            // Simple Key / Value Pair
            $propArr[$propKey] = $propValue;
        }
    }

    return $propArr;
}

function UIPropsToXml($UIProps) {
    $propsXML = "";
    $propArr = aggregateProps($UIProps);
    foreach ($propArr as $propName => $propValue) {
        if (is_array($propValue)) {
            $i = 0;
            foreach($propValue as $fld => $fldVal) {
                if (is_array($fldVal)) {
                    $propsXML .= "  <$propName \n";
                    $propsXML .= "    id=\"$propName-$fld\"\n";
                    foreach($fldVal as $subFld => $subFldVal) {
                        $propsXML .= "    $subFld=\"" . htmlspecialchars($subFldVal) . "\"\n";
                    }
                    $propsXML .= "  />\n";
                } else {
                    $i += 1;
                    if ($i == 1) {
                        $propsXML .= "  <$propName \n";
                    }
                    $propsXML .= "    $fld=\"" . htmlspecialchars($fldVal) . "\"\n";
                    if ($i == count($propValue)) {
                        $propsXML .= "  />\n";
                    }
                }
            }
        } else {
            $propsXML .= "  <$propName value=\"" . htmlspecialchars($propValue) . "\" />\n";
        }
    }
    return $propsXML;
}
