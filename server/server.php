/**
* @author Sandor Turanszky <sandor.turanszky@gmail.com>
* Date: 11.03.14
* Time: 17:27
*/
<?php
$data = "Widget HTML is placed here";
echo $_GET['callback'] . '(' . "{'html' : '".$data."'}" . ')';