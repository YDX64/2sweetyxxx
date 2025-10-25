<?php 
require 'inc/Header.php';
if(isset($_GET['id']))
{	
	if ($_SESSION['stype'] == 'Staff' && !in_array('Update', $package_per)) {
    

    
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
else 
{
if ($_SESSION['stype'] == 'Staff' && !in_array('Write', $package_per)) {
    

    
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
                  <h3><?php echo $lang['Package_Management']; ?></h3>
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
					 $data = $dating->query("select * from tbl_package where id=".$_GET['id']."")->fetch_assoc();
					 ?>
					 <form method="POST"  enctype="multipart/form-data">
								
								<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Total_Coin']; ?></label>
                                    
                                  <input type="text" class="form-control" placeholder="<?php echo $lang['Total_Coin']; ?>" value="<?php echo $data['coin'];?>" name="coin">
                               
								</div>
								
								<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Amount']; ?></label>
                                    
                                  <input type="text" class="form-control" placeholder="<?php echo $lang['Amount']; ?>" value="<?php echo $data['amt'];?>" name="amt">
                                <input type="hidden" name="type" value="edit_package"/>
										<input type="hidden" name="id" value="<?php echo $_GET['id'];?>"/>
								</div>
								
                                    
                                   <div class="form-group mb-3">
                                    
                                        <label  for="inputGroupSelect01"><?php echo $lang['Package_Status']; ?></label>
                                    
                                    <select  class="form-control" name="status" id="inputGroupSelect01" required>
                                        <option value=""><?php echo $lang['Select_Status']; ?></option>
                                        <option value="1" <?php if($data['status'] == 1){echo 'selected';}?>><?php echo $lang['Publish']; ?></option>
                                        <option value="0" <?php if($data['status'] == 0){echo 'selected';}?>><?php echo $lang['UnPublish']; ?></option>
                                       
                                    </select>
                                </div>
                                    <button type="submit" class="btn btn-primary"><?php echo $lang['Edit_Package']; ?></button>
                                </form>
					 <?php 
				 }
				 else 
				 {
				 ?>
                  <form method="POST"  enctype="multipart/form-data">
								
								<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Total_Coin']; ?></label>
                                    
                                  <input type="text" class="form-control" placeholder="<?php echo $lang['Total_Coin']; ?>"  name="coin">
                            
								</div>
								
								<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Amount']; ?></label>
                                    
                                  <input type="text" class="form-control" placeholder="<?php echo $lang['Amount']; ?>"  name="amt">
                                <input type="hidden" name="type" value="add_package"/>	
								</div>
								
                                    
                                   <div class="form-group mb-3">
                                   
                                        <label  for="inputGroupSelect01"><?php echo $lang['Package_Status']; ?></label>
                                    
                                    <select class="form-control" name="status" id="inputGroupSelect01" required>
                                        <option value=""><?php echo $lang['Select_Status']; ?></option>
                                        <option value="1"><?php echo $lang['Publish']; ?></option>
                                        <option value="0"><?php echo $lang['UnPublish']; ?></option>
                                       
                                    </select>
                                </div>
                                    <button type="submit" class="btn btn-primary"><?php echo $lang['Add_Package']; ?></button>
                                </form>
				 <?php } ?>
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