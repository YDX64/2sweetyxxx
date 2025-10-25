<?php 
require dirname( dirname(__FILE__) ).'/inc/Connection.php';

header('Content-type: text/json');
$data = json_decode(file_get_contents('php://input'), true);
$pol = array();
$c = array();
$sel = $dating->query("select * from tbl_package where status=1");
while($row = $sel->fetch_assoc())
{
   
		$pol['id'] = $row['id'];
		$pol['coin'] = $row['coin'];
		
		$pol['amt'] = $row['amt'];
		
		
		$c[] = $pol;
	
	
}
if(empty($c))
{
	$returnArr = array("packlist"=>$c,"ResponseCode"=>"200","Result"=>"false","ResponseMsg"=>"Package Not Founded!");
}
else 
{
$returnArr = array("packlist"=>$c,"ResponseCode"=>"200","Result"=>"true","ResponseMsg"=>"Package List Founded!");
}
echo json_encode($returnArr);
?>