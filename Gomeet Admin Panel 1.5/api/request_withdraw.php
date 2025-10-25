<?php 
require dirname( dirname(__FILE__) ).'/inc/Connection.php';
require dirname( dirname(__FILE__) ).'/inc/Gomeet.php';
header('Content-type: text/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$data = json_decode(file_get_contents('php://input'), true);
if($data['uid'] == ''  or $data['r_type'] == '')
{
    $returnArr = array("ResponseCode"=>"401","Result"=>"false","ResponseMsg"=>"Something Went Wrong!");
}
else
{
	$uid = $data['uid'];
	$coin_val = $data['coin'];
	$r_type = $data['r_type'];
	$acc_number = $data['acc_number'];
	$bank_name = $data['bank_name'];
	$acc_name = $data['acc_name'];
	$ifsc_code = $data['ifsc_code'];
	$upi_id = $data['upi_id'];
	$paypal_id = $data['paypal_id'];
	$coinprice = $set['coin_amt'];
	$coin_amt = $coin_val * $coinprice;
	$coin = $dating->query("select coin from tbl_user where id=".$uid."")->fetch_assoc();
	$cointotal = empty($coin['coin']) ? "0" : $coin['coin'];
            
				
				
				 
				 
				 
				 
				 if(floatval($coin_val) > floatval($cointotal))
				 {
					 $returnArr = array("ResponseCode"=>"401","Result"=>"false","ResponseMsg"=>"You can't Withdraw Above Your Coin Received!!"); 
				 }
				 else if(floatval($coin_val) < floatval($set['coin_limit']))
				 {
					$returnArr = array("ResponseCode"=>"401","Result"=>"false","ResponseMsg"=>"You can't Withdraw Below Limit Required Coin!!".$set['coin_limit']);  
				 }
				 else 
				 {
					 
					 $vp = $dating->query("select * from tbl_user where id=".$uid."")->fetch_assoc();
	 
  $table="tbl_user";
  $field = array('coin'=>$vp['coin']-$coin_val);
  $where = "where id=".$uid."";
$h = new Gomeet($dating);
	  $check = $h->datingupdateData_Api($field,$table,$where);
	  
	  $timestamps    = date("Y-m-d");
	   $table="coin_report";
  $field_values=array("uid","message","status","amt","tdate");
  $data_values=array("$uid",'Coin Balance Withdraw!!','Debit',"$coin_val","$timestamps");
   
      $h = new Gomeet($dating);
	  $checks = $h->datinginsertdata_Api($field_values,$data_values,$table);
	  
					 $timestamp = date("Y-m-d H:i:s");
					 $table="payout_setting";
  $field_values=array("uid","amt","status","r_date","r_type","acc_number","bank_name","acc_name","ifsc_code","upi_id","paypal_id","coin");
  $data_values=array("$uid","$coin_amt","pending","$timestamp","$r_type","$acc_number","$bank_name","$acc_name","$ifsc_code","$upi_id","$paypal_id","$coin_val");
  
      $h = new Gomeet($dating);
	  $check = $h->datinginsertdata_Api($field_values,$data_values,$table);
	  $returnArr = array("ResponseCode"=>"200","Result"=>"true","ResponseMsg"=>"Withdraw Request Submit Successfully!!");
				 
}
}
echo json_encode($returnArr);
?>