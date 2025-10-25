<?php 
require dirname( dirname(__FILE__) ).'/inc/Connection.php';
require dirname( dirname(__FILE__) ).'/inc/Gomeet.php';
header('Content-type: text/json');
$data = json_decode(file_get_contents('php://input'), true);

if($data['sender_id'] == '' or $data['coin'] == '' or $data['receiver_id'] == '' or $data['gift_img'] == '')
{
    
    $returnArr = array("ResponseCode"=>"401","Result"=>"false","ResponseMsg"=>"Something Went Wrong!");
}
else
{
	$sender_id = $data['sender_id'];
	$coin = $data['coin'];
	$receiver_id = $data['receiver_id'];
	$gift_img = explode(',',$data['gift_img']);
	
	$vp = $dating->query("select coin from tbl_user where id=" . $receiver_id . "")->fetch_assoc();
	$vps = $dating->query("select coin from tbl_user where id=" . $sender_id . "")->fetch_assoc();
     if ($vps['coin'] >= $coin) {
		 
		 
	  
	   foreach($gift_img as $f)
	   {
		 $table="gift_collect";
  $field_values=array("sender_id","receiver_id","gift_img");
  $data_values=array("$sender_id","$receiver_id","$f");
   
      $h = new Gomeet($dating);
	  $checks = $h->datinginsertdata_Api($field_values,$data_values,$table);  
	   }
	   
	   if($coin != 0)
	   {
	       
	   $table="tbl_user";
  $field = array('coin'=>$vp['coin']+$coin);
  $where = "where id=".$receiver_id."";
$h = new Gomeet($dating);
	  $check = $h->datingupdateData_Api($field,$table,$where);
	  
	   $timestamps    = date("Y-m-d");
	   $table="coin_report";
  $field_values=array("uid","message","status","amt","tdate");
  $data_values=array("$receiver_id",'Gift Coin Balance Added!!','Credit',"$coin","$timestamps");
   
      $h = new Gomeet($dating);
	  $checks = $h->datinginsertdata_Api($field_values,$data_values,$table);
	  
	  $mb = $vps['coin'] - $coin;
	  $table="tbl_user";
  $field = array('coin'=>"$mb");
  $where = "where id=".$sender_id."";
$h = new Gomeet($dating);
	  $check = $h->datingupdateData_Api($field,$table,$where);
		 
		 
		 $timestamps    = date("Y-m-d");
	   $table="coin_report";
  $field_values=array("uid","message","status","amt","tdate");
  $data_values=array("$sender_id",'Gift Coin Transfer Successfully!!','Debit',"$coin","$timestamps");
   
      $h = new Gomeet($dating);
	  $checks = $h->datinginsertdata_Api($field_values,$data_values,$table);
	  
	   }
	    $udata = $dating->query("select * from tbl_user where id=".$receiver_id."")->fetch_assoc();
$name = $udata['name'];
$content = array(
       "en" => 'Someone Send You Gift.'
   );
$heading = array(
   "en" => "Gift Send!!"
);

$fields = array(
'app_id' => $set['one_key'],
'included_segments' =>  array("Active Users"),
'filters' => array(array('field' => 'tag', 'key' => 'user_id', 'relation' => '=', 'value' => $receiver_id)),
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

	  $tbwallet = $dating->query("select coin from tbl_user where id=" . $sender_id . "")->fetch_assoc();
         $returnArr = ["ResponseCode" => "200", "Result" => "true", "ResponseMsg" => "Gift Transfer Successfully!!", "coin" => $tbwallet['coin']];
	 }
	 else 
	 {
		 $tbwallet = $dating->query("select coin from tbl_user where id=" . $sender_id . "")->fetch_assoc();
         $returnArr = ["ResponseCode" => "200", "Result" => "false", "ResponseMsg" => "Coin Balance Not There As Per Operation Refresh One Time Screen!!!", "coin" => $tbwallet['coin']];
	 }
}
echo json_encode($returnArr);