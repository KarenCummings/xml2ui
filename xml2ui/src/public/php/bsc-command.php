<?php
/*
 *  Module Server client backend support requests from the modmgr app.
 *  Connects REQ socket to ZMQ tcp://127.0.0.1:5561
 * @author Jim Scarsdale
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/xml; charset=UTF-8");

// require_once "../../../../Commander.php";
// require_once "../../../../modules/xmlHelper.php";
// require_once "../../../../php_config/config.php";
$log_file = "file:///var/log/bscui/bsc-command.log";
require_once "php/sLogger.php";
$log->setLevel(7);

require_once "php/BscHelper.php";


define("REQUEST_TIMEOUT", 2000); //  msecs, (> 1000!)
define("REQUEST_RETRIES", 2); //  Before we abandon
define("XML_HEADER", "<?xml version=\"1.0\" encoding=\"utf-8\"?>");


function client_socket(ZMQContext $context, $zmqConnect)
{
    // echo "I: connecting to server…", PHP_EOL;
    $client = new ZMQSocket($context,ZMQ::SOCKET_REQ);
    $client->connect($zmqConnect);

    //  Configure socket to not wait at close time
    $client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0);

    return $client;
}

class BscRequest {
    public $_log;
    public $_props;
    public $requestMethod = "";
    public $commandName = "unknown";
    public $commandArgc = "-1";
    public $statusValue = 0;
    public $statusMsg = "";
    public $replyReceived = "";

    
    function __construct($slogger)
    {
        $this->_log = $slogger;

        loadBSCProperties($this->_props);
    }

    function createXmlResponse()
    {
        $cdata = htmlspecialchars($this->statusMsg);
        $resp = sprintf(
            "<response>\n" .
            "  <SERVER REQUEST_METHOD=\"%s\" />"   .
            "  <command name=\"%s\" argc=\"%d\"></command>\n" .
            "  <status value=\"%d\">\n<![CDATA[%s]]>\n</status>\n" .
            "</response>\n",
            $this->requestMethod, $this->commandName, $this->commandArgc,
            $this->statusValue, $cdata);
        return $resp;
    }
    
    function run() {
        $zmqResponse = "None";
        $xmlIn = "";
    
        $this->requestMethod = $_SERVER["REQUEST_METHOD"];

        $this->_log->logData(LG_INFO, "Method:" . $this->requestMethod);

        if ($this->requestMethod == "GET")
        {
            $xmlIn = file_get_contents("/var/log/modmgr/module-command.test.xml");
        }
        elseif (($this->requestMethod == "POST")
            && (isset($_SERVER["CONTENT_TYPE"])
            && ((strpos($_SERVER["CONTENT_TYPE"], "application/xml") !== false)
                || (strpos($_SERVER["CONTENT_TYPE"], "application/x-www-form-urlencoded") !== false))))
        {
                try {
                    $this->_log->logData(LG_INFO, "Getting xml stream from php://input \n");

                    $xmlIn = file_get_contents('php://input');
                } catch (Exception $e) {
                    $this->statusValue = 1;
                    $statusMsg = "Exception while building request: " . $e;
                }
        }
        elseif(!defined($this->requestMethod) ) // Look for a file as input.
        {
            $options = getopt("f:");
            $xmlIn = file_get_contents($options["f"]);

            //$xmlIn = file_get_contents('./test_stream.xml');  Greg - Start here, at least it appears to get through.
        }
        else {
            $this->statusValue = 2;
            $statusMsg = "Unexpected content type in request";

            $this->_log->logData(LG_INFO, "Unexpected content type in request");
        }

        /* We should have the XML here -- extract the name from it */
//        try {
//            $xml = simplexml_load_string($xmlIn);
//            if ($xml) {
//                foreach($xml->attributes() as $key => $value) {
//                    if ($key === "COMMAND") {
//                        $this->commandName = $value;
//                    }
//                }
//                $this->commandArgc = $xml->count();
//            }
//        } catch (Exception $e) {
//            $this->commandName = "unknown";
//        }

        $zmqResponse = $this->zmqRequest($xmlIn);


        echo XML_HEADER;
        echo $this->createXmlResponse();
    }
    
    function isValidResponse($reply, $expectedResponseRoot)
    {
        return true;
    }
    
    function zmqRequest($xmlRequest)
    {
        
        $context = new ZMQContext();
        $zmqConnect = sprintf("tcp://127.0.0.1:%s", propOrDefault($this->_props, "BSCDataService.data.port", "5560"));
        $client = client_socket($context, $zmqConnect);
    
        $this->_log->logData(LG_INFO, "Request:\n" . $xmlRequest);
    
        $retriesRemaining = REQUEST_RETRIES;
        $read = $write = array();
    
        if ($xmlRequest == "none") {
            $this->statusMsg = "xmlRequest must not be empty.";
            return $this->createXmlResponse();
        }

        $this->statusValue = 1;
        $this->statusMsg = "NO RESPONSE";
        while ($retriesRemaining) {
            //  We send a request, then we work to get a reply
            $this->_log->logData(LG_INFO, "Send retries left: " . $retriesRemaining);
            $ret = $client->send($xmlRequest);

            $expect_reply = true;
            while ($expect_reply) {
                //  Poll socket for a reply, with timeout
                $poll = new ZMQPoll();
                $poll->add($client, ZMQ::POLL_IN);
                $events = $poll->poll($read, $write, REQUEST_TIMEOUT);

                //  If we got a reply, process it
                if ($events > 0) {
                    $replyReceived = $client->recv();
                    $this->_log->logData(LG_INFO, "client->recv(): " . $this->statusValue );
                    if ($this->isValidResponse($this->replyReceived, "TODO")) {
                        $retriesRemaining = 0; // quit loop
                        $this->statusValue = 0; // Success
                        $this->statusMsg = $replyReceived;
                        $this->statusMsg = "Valid response from server:\n" . $this->statusMsg;
                        $this->_log->logData(LG_INFO, $this->statusMsg);
                    } else {
                        $this->statusValue = 4;
                        $this->statusMsg = "malformed reply from server:\n" . $this->replyReceived;
                        $this->_log->logData(LG_INFO, $this->statusMsg);
                    }
                    break;
                } elseif (--$retriesRemaining == 0) {
                    $expect_reply = false;
                    $this->statusValue = 5;
                    $this->statusMsg = "No Response.";
                    $this->_log->logData(LG_INFO, $this->statusMsg);
                } else {
                    //  Old socket will be confused; close it and open a new one
                    $client = client_socket($context, $zmqConnect);

                   //  Send request again, on new socket
                   $this->_log->logData(LG_INFO, "Send retries left: " . $retriesRemaining);
                   $client->send($xmlRequest);
                }
            }
        }
        return $this->createXmlResponse();
    }
}

$req = new BscRequest($log);
$req->run();

?>

