<?php 
require 'inc/Header.php';
if($_SESSION['stype'] == 'Staff')
	{
		header('HTTP/1.1 401 Unauthorized');
    
    
	?>
	<style>
	.loader-wrapper
	{
		display:none;
	}
	</style>
	<?php 
	require 'auth.php';
    exit();
	}
?>
    <!-- Loader ends-->
    <!-- page-wrapper Start-->
    <div class="page-wrapper compact-wrapper" id="pageWrapper">
      <!-- Page Header Start-->
    <?php require 'inc/Navbar.php';?>
      <!-- Page Header Ends-->
      <!-- Page Body Start-->
      <div class="page-body-wrapper">
        <!-- Page Sidebar Start-->
       <?php require 'inc/Sidebar.php';?>
        <!-- Page Sidebar Ends-->
        <div class="page-body">
          <div class="container-fluid">
            <div class="page-title">
              <div class="row">
                <div class="col-sm-6">
                  <h3><?php echo $lang['Setting_Management']; ?></h3>
                </div>
               
              </div>
            </div>
          </div>
          <!-- Container-fluid starts-->
          <div class="container-fluid dashboard-default">
            <div class="row">
             <div class="col-sm-12">
                <div class="card">
                <div class="card-body">
				
						
						<h5 class="h5_set"><i class="fa fa-gear fa-spin"></i>  <?php echo $lang['General_Information']; ?></h5>
				<form method="post" enctype="multipart/form-data">
                                       <div class="row">
									    <div class="form-group mb-3 col-3">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Website_Name']; ?></label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Website_Name']; ?>" value="<?php echo $set['webname'];?>" name="webname" required="">
											<input type="hidden" name="type" value="edit_setting"/>
										<input type="hidden" name="id" value="1"/>
                                        </div>
										
                                      <div class="form-group mb-3 col-3" style="margin-bottom: 48px;">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Website_Image']; ?></label>
                                            <div class="custom-file">
                                                <input type="file" name="weblogo" class="custom-file-input form-control">
                                                <label class="custom-file-label"><?php echo $lang['Choose_Website_Image']; ?></label>
												<br>
												<img src="<?php echo $set['weblogo'];?>" width="60" height="60"/>
                                            </div>
                                        </div>
										
										<div class="form-group mb-3 col-3">
									<label for="cname"><?php echo $lang['Select_Timezone']; ?></label>
									<select name="timezone" class="form-control" required>
									<option value=""><?php echo $lang['Select_Timezone']; ?></option>
									<?php 
								$tzlist = DateTimeZone::listIdentifiers(DateTimeZone::ALL);
								$limit =  count($tzlist);
								?>
									<?php 
									for($k=0;$k<$limit;$k++)
									{
									?>
									<option <?php echo $tzlist[$k];?> <?php if($tzlist[$k] == $set['timezone']) {echo 'selected';}?>><?php echo $tzlist[$k];?></option>
									<?php } ?>
									</select>
								</div>
										
										<div class="form-group mb-3 col-3">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Enter_Currency']; ?></label>
                                            <input type="text" class="form-control" placeholder="<?php echo $lang['Enter_Currency']; ?>"  value="<?php echo $set['currency'];?>" name="currency" required="">
                                        </div>
										
										
										
										
										
										
										
										
										
										
	
	<div class="form-group mb-3 col-12">
										<h5 class="h5_set"><i class="fa fa-signal"></i> <?php echo $lang['Onesignal_Information']; ?></h5>
										</div>
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Enter_User_App_Onesignal_App_Id']; ?></label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Enter_User_App_Onesignal_App_Id']; ?>"  value="<?php echo $set['one_key'];?>" name="one_key" required="">
                                        </div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Enter_User_Boy_App_Onesignal_Rest_Api_Key']; ?></label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Enter_User_Boy_App_Onesignal_Rest_Api_Key']; ?>"  value="<?php echo $set['one_hash'];?>" name="one_hash" required="">
                                        </div>
	
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span><?php echo $lang['SMS_Type']; ?></label>
                                           <select class="form-control" name="sms_type">
										   <option value=""><?php echo $lang['select_sms_type']; ?></option>
										   <option value="Msg91" <?php if($set['sms_type'] == 'Msg91'){echo 'selected';}?>><?php echo $lang['Msg91']; ?></option>
										   <option value="Twilio" <?php if($set['sms_type'] == 'Twilio'){echo 'selected';}?>><?php echo $lang['Twilio']; ?></option>
										   										   </select>
                                        </div>
										
										
										<div class="form-group mb-3 col-12">
										<h5 class="h5_set"><i class="fas fa-sms"></i> <?php echo $lang['Msg91_Sms_Configurations']; ?></h5>
										</div>
	                                    
										<div class="form-group mb-3 col-6">
                                            <label><span class="text-danger">*</span><?php echo $lang['Msg91_Auth_Key']; ?></label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Msg91_Auth_Key']; ?>"  value="<?php echo $set['auth_key'];?>" name="auth_key" required="">
                                        </div>
										
										<div class="form-group mb-3 col-6">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Msg91_Otp_Template_Id']; ?></label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Msg91_Otp_Template_Id']; ?>"  value="<?php echo $set['otp_id'];?>" name="otp_id" required="">
                                        </div>
										
										
										<div class="form-group mb-3 col-12">
										<h5 class="h5_set"><i class="fas fa-sms"></i> <?php echo $lang['Twilio_Sms_Configurations']; ?></h5>
										</div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span><?php echo $lang['Twilio_Account_SID']; ?></label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Twilio_Account_SID']; ?>"  value="<?php echo $set['acc_id'];?>" name="acc_id" required="">
                                        </div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Twilio_Auth_Token']; ?></label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Twilio_Auth_Token']; ?>"  value="<?php echo $set['auth_token'];?>" name="auth_token" required="">
                                        </div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Twilio_Phone_Number']; ?></label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Twilio_Phone_Number']; ?>"  value="<?php echo $set['twilio_number'];?>" name="twilio_number" required="">
                                        </div>
										
										
										
										
										<div class="form-group mb-3 col-12">
										<h5 class="h5_set"><i class="fa fa-gear fa-spin"></i> <?php echo $lang['Other_Setting']; ?></h5>
										</div>
										
										<div class="form-group mb-3 col-3">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Admob_Enable?']; ?></label>
                                           <select class="form-control" name="admob">
										   <option value=""><?php echo $lang['Select_Option']; ?></option>
										   <option value="Yes" <?php if($set['admob'] == 'Yes'){echo 'selected';}?>><?php echo $lang['Yes']; ?></option>
										   <option value="No" <?php if($set['admob'] == 'No'){echo 'selected';}?>><?php echo $lang['No']; ?></option>
										   
										   </select>
                                        </div>
										
										
										
										<div class="form-group mb-3 col-3">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Maintenance_Mode?']; ?></label>
                                           <select class="form-control" name="mode">
										   <option value=""><?php echo $lang['Select_Option']; ?></option>
										   <option value="Yes" <?php if($set['mode'] == 'Yes'){echo 'selected';}?>><?php echo $lang['Yes']; ?></option>
										   <option value="No" <?php if($set['mode'] == 'No'){echo 'selected';}?>><?php echo $lang['No']; ?></option>
										   
										   </select>
                                        </div>
										
										<div class="form-group mb-3 col-3">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Free_Mode_?_(_use_all_premium_features_as_free_)']; ?></label>
                                           <select class="form-control" name="fmode">
										   <option value=""><?php echo $lang['Select_Option']; ?></option>
										   <option value="Yes" <?php if($set['fmode'] == 'Yes'){echo 'selected';}?>><?php echo $lang['Yes']; ?></option>
										   <option value="No" <?php if($set['fmode'] == 'No'){echo 'selected';}?>><?php echo $lang['No']; ?></option>
										   
										   </select>
                                        </div>
										
										<div class="form-group mb-3 col-12">
										<h5 class="h5_set"><i class="fa fa-image"></i> <?php echo $lang['Admob_Configurations']; ?></h5>
										</div>
										
								          <div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Banner_Ad_Id']; ?></label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Banner_Ad_Id']; ?>"  value="<?php echo $set['banner_id'];?>" name="banner_id" required="">
                                        </div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Interstitial_Ad_Id']; ?> </label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Interstitial_Ad_Id']; ?>"  value="<?php echo $set['in_id'];?>" name="in_id" required="">
                                        </div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> Ios Banner Ad Id</label>
                                            <input type="text" class="form-control " placeholder="Ios Banner Ad Id"  value="<?php echo $set['ios_banner_id'];?>" name="ios_banner_id" required="">
                                        </div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> Ios Interstitial Ad Id</label>
                                            <input type="text" class="form-control " placeholder="Ios Interstitial Ad Id"  value="<?php echo $set['ios_in_id'];?>" name="ios_in_id" required="">
                                        </div>
								
								<div class="form-group mb-3 col-12">
										<h5 class="h5_set"><i class="fa  fa-map-pin"></i> <?php echo $lang['Google_Map_Configurations']; ?></h5>
										</div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Google_Map_key']; ?> </label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Google_Map_key']; ?>"  value="<?php echo $set['map_key'];?>" name="map_key" required="">
                                        </div>
								
								<div class="form-group mb-3 col-12">
										<h5 class="h5_set"><i class="fa  fa-coins"></i> <?php echo $lang['Coin_Configurations']; ?></h5>
										</div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Per_Coin_Price_(_1_coin_price_in_currency_)']; ?> </label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Per_Coin_Price_(_1_coin_price_in_currency_)']; ?>"  value="<?php echo $set['coin_amt'];?>" name="coin_amt" required="">
                                        </div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Coin_Withdraw_Limit']; ?> </label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Coin_Withdraw_Limit']; ?>"  value="<?php echo $set['coin_limit'];?>" name="coin_limit" required="">
                                        </div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Gift_Function_disable_or_enable?']; ?> </label>
                                            <select class="form-control" name="coin_fun">
										   <option value=""><?php echo $lang['Select_Option']; ?></option>
										   <option value="Enabled" <?php if($set['coin_fun'] == 'Enabled'){echo 'selected';}?>><?php echo $lang['Enabled']; ?></option>
										   <option value="Disabled" <?php if($set['coin_fun'] == 'Disabled'){echo 'selected';}?>><?php echo $lang['Disabled']; ?></option>
										   
										   </select>
                                        </div>
										
										<div class="form-group mb-3 col-12">
										<h5 class="h5_set"><i class="fa fa-phone"></i> <?php echo $lang['Otp_Configurations']; ?></h5>
										</div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Otp_Auth_In_Sign_up_?']; ?> </label>
                                            <select class="form-control" name="otp_auth">
										   <option value=""><?php echo $lang['Select_Option']; ?></option>
										   <option value="Yes" <?php if($set['otp_auth'] == 'Yes'){echo 'selected';}?>><?php echo $lang['Yes']; ?></option>
										   <option value="No" <?php if($set['otp_auth'] == 'No'){echo 'selected';}?>><?php echo $lang['No']; ?></option>
										   
										   </select>
                                        </div>
										
										<div class="form-group mb-3 col-12">
										<h5 class="h5_set"><i class="fa  fa-map-pin"></i> <?php echo $lang['Agora_Configurations']; ?></h5>
										</div>
										
										<div class="form-group mb-3 col-4">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Agora_Api_Id']; ?> </label>
                                            <input type="text" class="form-control " placeholder="<?php echo $lang['Agora_Api_Id']; ?>"  value="<?php echo $set['agora_app_id'];?>" name="agora_app_id" required="">
                                        </div>
										
										<div class="col-12">
                                                <button type="submit" name="edit_setting" class="btn btn-primary mb-2"><?php echo $lang['Edit_Setting']; ?></button>
                                            </div>
											
											
										
											</div>
                                    </form> 
	
								
				</div>
                </div>
              
                
              </div>
            
            </div>
          </div>
          <!-- Container-fluid Ends-->
        </div>
        <!-- footer start-->
       
      </div>
    </div>
    <!-- latest jquery-->
   <?php require 'inc/Footer.php'; ?>
    <!-- login js-->
  </body>


</html>