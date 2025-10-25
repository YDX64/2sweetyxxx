<?php 
require 'inc/Header.php';
if ($_SESSION['stype'] == 'Staff' && !in_array('Write', $notification_per)) {
    

    
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
                  <h3><?php echo $lang['Notification_Management']; ?></h3>
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
                 
                 <form method="post" enctype="multipart/form-data">
                                    
                                    
                                        
                                        <div class="form-group">
                                            <label><?php echo $lang['Enter_Notification_Title']; ?></label>
                                            <input type="text" class="form-control" name="ntitle" placeholder="<?php echo $lang['Enter_Notification_Title']; ?>" required="">
											 <input type="hidden" name="type" value="push_notification"/>	
                                        </div>
										
										<div class="form-group">
                                            <label><?php echo $lang['Enter_Notification_Message']; ?></label>
                                            <input type="text" class="form-control" name="nmessage" placeholder="<?php echo $lang['Enter_Notification_Message']; ?>"  required="">
                                        </div>
										
										<div class="form-group">
                                            <label><?php echo $lang['Enter_Notification_Url']; ?></label>
                                            <input type="url" class="form-control" name="nurl" placeholder="<?php echo $lang['Enter_Notification_Url']; ?>">
                                        </div>
										
										
										 
                                        
										
                                    
                                    <div class=" text-left">
                                        <button name="icat" class="btn btn-primary"><?php echo $lang['Send_Notification']; ?></button>
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