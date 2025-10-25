<?php 
require dirname( dirname(__FILE__) ).'/inc/Connection.php';

header('Content-type: text/json');
$data = json_decode(file_get_contents('php://input'), true);
$pol = array();
$c = array();
$sel = $dating->query("select * from tbl_gift where status=1");
while($row = $sel->fetch_assoc())
{
   
		$pol['id'] = $row['id'];
		$pol['img'] = $row['img'];
		
		$pol['price'] = $row['price'];
		
		
		$c[] = $pol;
	
	
}
if(empty($c))
{
	$returnArr = array("giftlist"=>$c,"ResponseCode"=>"200","Result"=>"false","ResponseMsg"=>"Gift Not Founded!");
}
else 
{
$returnArr = array("giftlist"=>$c,"ResponseCode"=>"200","Result"=>"true","ResponseMsg"=>"Gift List Founded!");
}
echo json_encode($returnArr);
?>