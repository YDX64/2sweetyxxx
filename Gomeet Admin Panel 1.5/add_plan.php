<?php 
require 'inc/Header.php';
if(isset($_GET['id']))
{	
	if ($_SESSION['stype'] == 'Staff' && !in_array('Update', $plan_per)) {
    

    
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
if ($_SESSION['stype'] == 'Staff' && !in_array('Write', $plan_per)) {
    

    
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
                  <h3><?php echo $lang['Plan_Management']; ?></h3>
                </div>
               
              </div>
            </div>
          </div>
          <!-- Container-fluid starts-->
          <div class="container-fluid dashboard-default">
            <div class="row">
           <div class="col-sm-12">
                <div class="card">
                 <?php 
				 if(isset($_GET['id']))
				 {
					 $data = $dating->query("select * from tbl_plan where id=".$_GET['id']."")->fetch_assoc();
					 ?>
					 <form method="post" enctype="multipart/form-data">
                                    
                                    <div class="card-body">
                                        
										
										<div class="row">
										
										
										
                                        
										<div class="col-md-4 col-xs-12">
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Plan_Title']; ?></label>
                                            <input type="text" class="form-control"  value="<?php echo $data['title'];?>" name="title" >
											<input type="hidden" name="type" value="edit_plan"/>
											
										<input type="hidden" name="id" value="<?php echo $_GET['id'];?>"/>
                                        </div>
										</div>
										
										<div class="col-md-4 col-xs-12">
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Plan_Amount']; ?></label>
                                            <input type="number" class="form-control"  value="<?php echo $data['amt'];?>"  name="amt" >
											
											
                                        </div>
										</div>
										<div class="col-md-4 col-xs-12">
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Day_Limit']; ?></label>
                                            <input type="number" class="form-control" value="<?php echo $data['day_limit'];?>"   name="day_limit" >
											
											</div>
                                        </div>
										<div class="col-md-12 col-xs-12">
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Plan_Description']; ?></label>
                                            <textarea  class="form-control"  rows="5" name="description" style="resize:none;"><?php echo $data['description'];?> </textarea>
											
											
                                        </div>
										</div>
										
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Filter_Include_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="filter_include" data-bs-original-title="" title="" <?php if($data["filter_include"] == 1){echo 'checked';}?>><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Audio_Video_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="audio_video" data-bs-original-title="" title="" <?php if($data["audio_video"] == 1){echo 'checked';}?>><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Direct_Chat_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="direct_chat" data-bs-original-title="" title="" <?php if($data["direct_chat"] == 1){echo 'checked';}?>><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Chat_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="chat" data-bs-original-title="" title="" <?php if($data["chat"] == 1){echo 'checked';}?>><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Like_Menu_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="Like_menu" data-bs-original-title="" title="" <?php if($data["Like_menu"] == 1){echo 'checked';}?>><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										
										<div class="col-md-12 col-xs-12">
										 <div class="form-group mb-3">
                                            <label><?php echo $lang['Plan_Status']; ?></label>
                                            <select name="status" class="form-control" required>
											<option value=""><?php echo $lang['Select_Status']; ?></option>
											<option value="1" <?php if($data['status'] == 1){echo 'selected';}?>><?php echo $lang['Publish']; ?></option>
											<option value="0" <?php if($data['status'] == 0){echo 'selected';}?> ><?php echo $lang['UnPublish']; ?></option>
											</select>
                                        </div>
                                        </div>
										
                                    </div>
                                    <div class="card-footer text-left">
                                        <button  type="submit" class="btn btn-primary"><?php echo $lang['Edit_Plan']; ?></button>
                                    </div>
                                </form>
					 <?php 
				 }
				 else 
				 {
				 ?>
                  <form method="post" enctype="multipart/form-data">
                                    
                                    <div class="card-body">
                                        <div class="row">
										
										
										
                                        
										<div class="col-md-4 col-xs-12">
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Plan_Title']; ?></label>
                                            <input type="text" class="form-control"   name="title" >
											<input type="hidden" name="type" value="add_plan"/>
											
                                        </div>
										</div>
										<div class="col-md-4 col-xs-12">
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Plan_Amount']; ?></label>
                                            <input type="number" class="form-control"   name="amt" >
											
											
                                        </div>
										</div>
										<div class="col-md-4 col-xs-12">
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Day_Limit']; ?></label>
                                            <input type="number" class="form-control"   name="day_limit" >
											
											</div>
                                        </div>
										<div class="col-md-12 col-xs-12">
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Plan_Description']; ?></label>
                                            <textarea  class="form-control"  rows="5" name="description" style="resize:none;"> </textarea>
											
											
                                        </div>
										</div>
										
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Filter_Include_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="filter_include" data-bs-original-title="" title=""><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Audio_Video_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="audio_video" data-bs-original-title="" title=""><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Direct_Chat_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="direct_chat" data-bs-original-title="" title=""><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Chat_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="chat" data-bs-original-title="" title=""><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										<div class="col-md-2 col-xs-4">
										<div class="form-group mb-3">
										<label><?php echo $lang['Like_Menu_?']; ?></label>
										<div class="flex-grow-1   switch-outline">
										 
                            <label class="switch">
                              <input type="checkbox" name="Like_menu" data-bs-original-title="" title=""><span class="switch-state bg-primary"></span>
                            </label>
                          </div>
										</div>
										</div>
										<div class="col-md-12 col-xs-12">
										 <div class="form-group mb-3">
                                            <label><?php echo $lang['Plan_Status']; ?></label>
                                            <select name="status" class="form-control" required>
											<option value=""><?php echo $lang['Select_Status']; ?></option>
											<option value="1"><?php echo $lang['Publish']; ?></option>
											<option value="0"><?php echo $lang['UnPublish']; ?></option>
											</select>
                                        </div>
										</div>
                                        
										
                                    </div>
									</div>
                                    <div class="card-footer text-left">
                                        <button  type="submit" class="btn btn-primary"><?php echo $lang['Add_Plan']; ?></button>
                                    </div>
                                </form>
				 <?php } ?>
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