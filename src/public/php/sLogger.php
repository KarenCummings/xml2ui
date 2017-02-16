<?php

// Set to LG_INFO when put into production.
$log = new sLogger(6, $log_file);		


class sLogger 
{
	private $_filename;
	var $_level;
	
	function __construct($level, $filename)
	{
		if(!defined("LG_EMERG"))	define("LG_EMERG", 		0);
		if(!defined("LG_ALERT"))	define("LG_ALERT", 		1);
		if(!defined("LG_CRIT"))		define("LG_CRIT", 		2);
		if(!defined("LG_ERR"))		define("LG_ERR", 		3);
		if(!defined("LG_WARNING"))	define("LG_WARNING", 	4);
		if(!defined("LG_NOTICE"))	define("LG_NOTICE", 	5);
		if(!defined("LG_INFO"))		define("LG_INFO", 		6);
		if(!defined("LG_DEBUG"))	define("LG_DEBUG", 		7);
		if(!defined("LG_VERBOSE"))	define("LG_VERBOSE", 	8);
		
		$this->_filename = $filename;
		$this->_level = $level;	

		$this->logData(LG_DEBUG, "sLogger::constuctor()");
	}
	
	function setLevel($level)
	{
		$this->_level = $level;	
	}
	
	public function logData($prio, $string)
	{
		if($prio > $this->_level)
		{
			//echo "Called with level $prio which is less then $this->_level \n";
			return;
		}
			
		if (!$handle = fopen($this->_filename, 'a')) {
		     echo "\n --Cannot open or create file ($this->_filename)\n";
		     exit;
		}
		
		$somecontent = date("m/d/y G:i:s") . " $prio $string \n";
		    
		if (fwrite($handle, $somecontent) === FALSE) {
		    echo "Cannot write to file ($this->_filename)";
		    exit;
		}
		
		//echo "Successfully wrote $somecontent to the file\n";
		fclose($handle);		
	}

}


?>
