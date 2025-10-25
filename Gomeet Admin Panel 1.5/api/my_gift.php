<?php 
require dirname( dirname(__FILE__) ).'/inc/Connection.php';
require dirname( dirname(__FILE__) ).'/inc/Gomeet.php';
header('Content-type: text/json');
$data = json_decode(file_get_contents('php://input'), true);
if($data['uid'] == '')
{
 $returnArr = array("ResponseCode"=>"401","Result"=>"false","ResponseMsg"=>"Something Went Wrong!");    
}
else
{
 $uid = $data['uid'];

$c = array();
$pol = array();
$sel = $dating->query("select * from gift_collect where receiver_id=".$uid."");
while($row = $sel->fetch_assoc())
{
   
   $udata = $dating->query("select name,other_pic from tbl_user where id=".$row['sender_id']."")->fetch_assoc();
		$pol['gift_img'] = $row['gift_img'];
		$pol['name'] = $udata['name'];
		$im = explode('$;',$udata['other_pic']);
	    $pol['img'] = $im[0];
		$c[] = $pol;
	
}

if(empty($c))
{
	$returnArr = array("giflist"=>$c,"ResponseCode"=>"200","Result"=>"false","ResponseMsg"=>"My Gift Not Founded!");
}
else 
{
$returnArr = array("giflist"=>$c,"ResponseCode"=>"200","Result"=>"true","ResponseMsg"=>"My Gift List Founded!");
}

}
echo  json_encode($returnArr);
?>