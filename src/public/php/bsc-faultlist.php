<?php

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sui_data.php");

$log_file = "file:///var/log/bsc-command.log";
require_once ($SCRIPT_PATH . "/sLogger.php");

$log->setLevel(6);

/*Pass in port num from specified properties file*/
suiRequest($log, "/opt/config/BSCServer.properties", "BSCDataService", "FaultList");

?>