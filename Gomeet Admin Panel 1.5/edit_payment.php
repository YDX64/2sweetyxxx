<?php 
require 'inc/Header.php';
if(isset($_GET['id']))
{	
	if ($_SESSION['stype'] == 'Staff' && !in_array('Update', $plist_per)) {
    

    
    header('HTTP/1.1 401 Unauthorized');
    ?>
    <style>
        .loader-wrapper {
            display: none;
        }
    </style>
    <?php
    require 'auth.php';
    exit();
}
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
                  <h3><?php echo $lang['Payment_Gateway_Management'];?></h3>
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
				<?php 
					if(isset($_GET['id']))
					{
						
						
						 $query = "select * from tbl_payment_list where id=".$_GET['id'];
		  $data = $dating->query($query)->fetch_assoc();
						?>
						
						<form method="POST" enctype="multipart/form-data">
								
								<div class="form-group mb-3">
                                            <label><?php echo $lang['Payment_Gateway_Name'];?></label>
                                            <input type="text" class="form-control " disabled placeholder="<?php echo $lang['Enter_Payment_Gateway_Name'];?>" value="<?php echo $data['title'];?>" name="cname" required="">
											 <input type="hidden" name="type" value="edit_payment"/>
										<input type="hidden" name="id" value="<?php echo $_GET['id'];?>"/>
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Payment_Gateway_Subtitle'];?></label>
                                            <input type="text" class="form-control" placeholder="<?php echo $lang['Enter_Payment_Gateway_SubTitle'];?>" value="<?php echo $data['subtitle'];?>" name="ptitle" required="">
                                        </div>
										
                                        <div class="form-group mb-3">
                                            <label><span class="text-danger">*</span> <?php echo $lang['Gateway_Image'];?></label>
                                            <div class="custom-file">
                                                <input type="file" name="cat_img" class="custom-file-input form-control" >
                                                <label class="custom-file-label"><?php echo $lang['Choose_Service_Gateway_Image'];?></label>
												<br>
												<img src="<?php echo $data['img'];?>" width="100" height="100"/>
                                            </div>
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Payment_Gateway_Attributes'];?></label>
                                            <input type="text" class="form-control"  data-role="tagsinput" value="<?php echo $data['attributes'];?>" name="p_attr"  required="">
                                        </div>
										
										 <div class="form-group mb-3">
                                            <label><?php echo $lang['Payment_Gateway_Status'];?></label>
                                            <select name="status" class="form-control">
											<option value="1" <?php if($data['status'] == 1){echo 'selected';}?>><?php echo $lang['Publish'];?></option>
											<option value="0" <?php if($data['status'] == 0){echo 'selected';}?> ><?php echo $lang['UnPublish'];?></option>
											</select>
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Show_On_Wallet'];?> ?</label>
                                            <select name="p_show" class="form-control">
											<option value="1" <?php if($data['p_show'] == 1){echo 'selected';}?>><?php echo $lang['Yes'];?></option>
											<option value="0" <?php if($data['p_show'] == 0){echo 'selected';}?> ><?php echo $lang['No'];?></option>
											</select>
                                        </div>
							
                                    <button type="submit" class="btn btn-primary"><?php echo $lang['Edit_Payment_Gateway'];?></button>
                                </form>
								<?php 
					}
					else 
					{
						?>
						<script>
						window.location.href="paymentlist.php";
						</script>
						<?php 
					}
					?>
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