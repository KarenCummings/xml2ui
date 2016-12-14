<?php


$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sui_command.php");

$log_file = "file:///var/log/bsc-command.log";

require_once ($SCRIPT_PATH . "/sLogger.php");

$log->setLevel(6);
$log->logData(LG_INFO, "Test log message");

/*Pass in port num from specified properties file*/
$req = new SimpleUIRequest($log, "/opt/config/BSCServer.properties", "BSCDataService");
$req->run();

?>