<?php
require dirname( dirname(__FILE__) ).'/inc/Connection.php';
require dirname( dirname(__FILE__) ).'/inc/Gomeet.php';
header('Content-type: text/json');
$data = json_decode(file_get_contents('php://input'), true);

if ($data['uid'] == '' or $data['package_id'] == '' or $data['wall_amt'] == '') {
    $returnArr = array(
        "ResponseCode" => "401",
        "Result" => "false",
        "ResponseMsg" => "Something Went Wrong!"
    );
} else {
	$package_id = $data['package_id'];
	$uid = $data['uid'];
	$wall_amt = $data['wall_amt'];
	$fetch = $dating->query("select * from tbl_package where id=".$package_id."")->fetch_assoc();
	$coin = $fetch['coin'];
	$vp = $dating->query("select * from tbl_user where id=".$uid."")->fetch_assoc();
	  
  $table="tbl_user";
  $field = array('coin'=>$vp['coin']+$coin);
  $where = "where id=".$uid."";
$h = new Gomeet($dating);
	  $check = $h->datingupdateData_Api($field,$table,$where);
	  
	  if ($wall_amt != 0) {
		  
		  $vp = $dating->query("select wallet from tbl_user where id=" . $uid . "")->fetch_assoc();
             $mt = floatval($vp['wallet']) - floatval($wall_amt);
             $table = "tbl_user";
             $field = ['wallet' => "$mt"];
             $where = "where id=" . $uid . "";
             $h = new Gomeet($dating);
             $check = $h->datingupdateData_Api($field, $table, $where);
             $timestamp = date("Y-m-d");
             $table = "wallet_report";
             $field_values = ["uid", "message", "status", "amt", "tdate"];
             $data_values = ["$uid", 'Wallet Used in Package Purchase', 'Debit', "$wall_amt", "$timestamp"];

             $h = new Gomeet($dating);
             $checks = $h->datinginsertdata_Api($field_values, $data_values, $table);
	  }
	  $udata = $dating->query("select * from tbl_user where id=".$uid."")->fetch_assoc();
$name = $udata['name'];
$content = array(
       "en" => $name.', Package Successfully Purchased.'
   );
$heading = array(
   "en" => "Package Purchased!!"
);

$fields = array(
'app_id' => $set['one_key'],
'included_segments' =>  array("Active Users"),
'filters' => array(array('field' => 'tag', 'key' => 'user_id', 'relation' => '=', 'value' => $uid)),
'contents' => $content,
'headings' => $heading
);

$fields = json_encode($fields);

 
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
curl_setopt($ch, CURLOPT_HTTPHEADER, 
array('Content-Type: application/json; charset=utf-8',
'Authorization: Basic '.$set['one_hash']));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($ch, CURLOPT_HEADER, FALSE);
curl_setopt($ch, CURLOPT_POST, TRUE);
curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
 
$response = curl_exec($ch);
curl_close($ch);

$timestamps    = date("Y-m-d");
	   $table="coin_report";
  $field_values=array("uid","message","status","amt","tdate");
  $data_values=array("$uid",'Coin Balance Added!!','Credit',"$coin","$timestamps");
   
      $h = new Gomeet($dating);
	  $checks = $h->datinginsertdata_Api($field_values,$data_values,$table);
	  
$returnArr = array("ResponseCode"=>"200","Result"=>"true","ResponseMsg"=>"Package Purchase Successfully!");
}
echo json_encode($returnArr);
?>