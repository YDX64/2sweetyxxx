<?php 
require dirname( dirname(__FILE__) ).'/inc/Connection.php';

		  $returnArr = array("ResponseCode"=>"200","Result"=>"true","ResponseMsg"=>"type Get Successfully!!","SMS_TYPE"=>$set['sms_type'],"Admob_Enabled"=>$set['admob'],"maintainance_Enabled"=>$set['mode'],"Social_login_enabled"=>$set['slogin'],"banner_id"=>$set['banner_id'],"in_id"=>$set['in_id'],"otp_auth"=>$set['otp_auth'],"gift_fun"=>$set['coin_fun'],"ios_in_id"=>$set['ios_in_id'],"ios_banner_id"=>$set['ios_banner_id'],"agora_app_id"=>$set['agora_app_id']);

echo json_encode($returnArr);
?>