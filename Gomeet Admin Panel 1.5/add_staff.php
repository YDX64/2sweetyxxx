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
                  <h3><?php echo $lang['Staff_Management']; ?></h3>
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
					 $data = $dating->query("select * from tbl_manager where id=".$_GET['id']."")->fetch_assoc();
					 ?>
					 <form method="post">
				
											
										
    <div class="card-body">
    <div class="row">
        <div class="col-3">
            <div class="form-group mb-3">
                <label><?php echo $lang['Interest']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readCat" name="interest[]" value="Read" <?php if(in_array('Read', explode(',',$data['interest']))){echo 'checked';}?>>
                    <label for="readCat"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writeCat" name="interest[]" value="Write" <?php if(in_array('Write', explode(',',$data['interest']))){echo 'checked';}?>>
                    <label for="writeCat"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updateCat" name="interest[]" value="Update" <?php if(in_array('Update', explode(',',$data['interest']))){echo 'checked';}?>>
                    <label for="updateCat"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Pages']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="page[]" value="Read" <?php if(in_array('Read', explode(',',$data['page']))){echo 'checked';}?>>
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="page[]" value="Write" <?php if(in_array('Write', explode(',',$data['page']))){echo 'checked';}?>>
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="page[]" value="Update" <?php if(in_array('Update', explode(',',$data['page']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['FAQ']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="faq[]" value="Read" <?php if(in_array('Read', explode(',',$data['faq']))){echo 'checked';}?>>
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="faq[]" value="Write" <?php if(in_array('Write', explode(',',$data['faq']))){echo 'checked';}?>>
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="faq[]" value="Update" <?php if(in_array('Update', explode(',',$data['faq']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Fake_User']; ?></label>
                <div class="checkbox-group">
                   
                    <input type="checkbox" id="updatePage" name="fakeuser[]" value="Update" <?php if(in_array('Update', explode(',',$data['fakeuser']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Coin']; ?></label>
                <div class="checkbox-group">
                   
                    <input type="checkbox" id="updatePage" name="coin[]" value="Update" <?php if(in_array('Update', explode(',',$data['coin']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
        </div>

        <div class="col-3">
            <div class="form-group mb-3">
                <label><?php echo $lang['Payment_Gateway']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readCat" name="plist[]" value="Read" <?php if(in_array('Read', explode(',',$data['plist']))){echo 'checked';}?>>
                    <label for="readCat"><?php echo $lang['Read']; ?></label>

                    

                    <input type="checkbox" id="updateCat" name="plist[]" value="Update" <?php if(in_array('Update', explode(',',$data['plist']))){echo 'checked';}?>>
                    <label for="updateCat"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Language']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="language[]" value="Read" <?php if(in_array('Read', explode(',',$data['language']))){echo 'checked';}?>>
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="language[]" value="Write" <?php if(in_array('Write', explode(',',$data['language']))){echo 'checked';}?>>
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="language[]" value="Update" <?php if(in_array('Update', explode(',',$data['language']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Payout']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="payout[]" value="Read" <?php if(in_array('Read', explode(',',$data['payout']))){echo 'checked';}?>>
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="updatePage" name="payout[]" value="Update" <?php if(in_array('Update', explode(',',$data['payout']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Report']; ?></label>
                <div class="checkbox-group">
                   
                    <input type="checkbox" id="updatePage" name="report[]" value="Read" <?php if(in_array('Read', explode(',',$data['report']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Read']; ?></label>
                </div>
            </div>
        </div>

        <div class="col-3">
            <div class="form-group mb-3">
                <label><?php echo $lang['Religion']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readCat" name="religion[]" value="Read" <?php if(in_array('Read', explode(',',$data['religion']))){echo 'checked';}?>>
                    <label for="readCat"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writeCat" name="religion[]" value="Write" <?php if(in_array('Write', explode(',',$data['religion']))){echo 'checked';}?>>
                    <label for="writeCat"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updateCat" name="religion[]" value="Update" <?php if(in_array('Update', explode(',',$data['religion']))){echo 'checked';}?>>
                    <label for="updateCat"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Gift']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="gift[]" value="Read" <?php if(in_array('Read', explode(',',$data['gift']))){echo 'checked';}?>>
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="gift[]" value="Write" <?php if(in_array('Write', explode(',',$data['gift']))){echo 'checked';}?>>
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="gift[]" value="Update" <?php if(in_array('Update', explode(',',$data['gift']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Relation_Goals']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="rgoal[]" value="Read" <?php if(in_array('Read', explode(',',$data['rgoal']))){echo 'checked';}?>>
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="rgoal[]" value="Write" <?php if(in_array('Write', explode(',',$data['rgoal']))){echo 'checked';}?>>
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="rgoal[]" value="Update" <?php if(in_array('Update', explode(',',$data['rgoal']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Notification']; ?></label>
                <div class="checkbox-group">
                    

                    <input type="checkbox" id="writePage" name="notification[]" value="Write" <?php if(in_array('Write', explode(',',$data['notification']))){echo 'checked';}?>>
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                   
                </div>
            </div>
        </div>

        <div class="col-3">
            <div class="form-group mb-3">
                <label><?php echo $lang['Plan']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readCat" name="plan[]" value="Read" <?php if(in_array('Read', explode(',',$data['plan']))){echo 'checked';}?>>
                    <label for="readCat"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writeCat" name="plan[]" value="Write" <?php if(in_array('Write', explode(',',$data['plan']))){echo 'checked';}?>>
                    <label for="writeCat"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updateCat" name="plan[]" value="Update" <?php if(in_array('Update', explode(',',$data['plan']))){echo 'checked';}?>>
                    <label for="updateCat"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Package']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="package[]" value="Read" <?php if(in_array('Read', explode(',',$data['package']))){echo 'checked';}?>>
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="package[]" value="Write" <?php if(in_array('Write', explode(',',$data['package']))){echo 'checked';}?>>
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="package[]" value="Update" <?php if(in_array('Update', explode(',',$data['package']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['User_List']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="ulist[]" value="Read" <?php if(in_array('Read', explode(',',$data['ulist']))){echo 'checked';}?>>
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="updatePage" name="ulist[]" value="Update" <?php if(in_array('Update', explode(',',$data['ulist']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Wallet']; ?></label>
                <div class="checkbox-group">
                   
                    <input type="checkbox" id="updatePage" name="wallet[]" value="Update" <?php if(in_array('Update', explode(',',$data['wallet']))){echo 'checked';}?>>
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
 </div>
 
 
 
        </div>
		
    </div>
	<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Email_Address']; ?></label>
                                    
                                  <input type="text" class="form-control" placeholder="<?php echo $lang['Email_Address']; ?>"  name="email" value="<?php echo $data['email'];?>" required>
                               
								</div>
								
								<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Enter_Password']; ?></label>
                                    
                                  <input type="text" class="form-control" placeholder="<?php echo $lang['Enter_Password']; ?>"  name="password" value="<?php echo $data['password'];?>"  required>
                                <input type="hidden" name="type" value="edit_staff"/>
										<input type="hidden" name="id" value="<?php echo $_GET['id'];?>"/>
										
								</div>
								
                                    
                                   <div class="form-group mb-3">
                                    
                                        <label  for="inputGroupSelect01"><?php echo $lang['Staff_Status']; ?></label>
                                    
                                    <select  class="form-control" name="status" id="inputGroupSelect01" required>
                                        <option value=""><?php echo $lang['Select_Status']; ?></option>
                                        <option value="1" <?php if($data['status'] == 1){echo 'selected';}?>><?php echo $lang['Publish']; ?></option>
                                        <option value="0" <?php if($data['status'] == 0){echo 'selected';}?>><?php echo $lang['UnPublish']; ?></option>
                                       
                                    </select>
                                </div>
</div>


    <div class="card-footer text-left">
        <button class="btn btn-primary"><?php echo $lang['Edit_Staff']; ?></button>
    </div>
</form>
					 <?php 
				 }
				 else 
				 {
				 ?>
                  <form method="post">
				
											
										
    <div class="card-body">
    <div class="row">
        <div class="col-3">
            <div class="form-group mb-3">
                <label><?php echo $lang['Interest']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readCat" name="interest[]" value="Read">
                    <label for="readCat"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writeCat" name="interest[]" value="Write">
                    <label for="writeCat"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updateCat" name="interest[]" value="Update">
                    <label for="updateCat"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Pages']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="page[]" value="Read">
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="page[]" value="Write">
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="page[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['FAQ']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="faq[]" value="Read">
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="faq[]" value="Write">
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="faq[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Fake_User']; ?></label>
                <div class="checkbox-group">
                   
                    <input type="checkbox" id="updatePage" name="fakeuser[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Coin']; ?></label>
                <div class="checkbox-group">
                   
                    <input type="checkbox" id="updatePage" name="coin[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
        </div>

        <div class="col-3">
            <div class="form-group mb-3">
                <label><?php echo $lang['Payment_Gateway']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readCat" name="plist[]" value="Read">
                    <label for="readCat"><?php echo $lang['Read']; ?></label>

                    

                    <input type="checkbox" id="updateCat" name="plist[]" value="Update">
                    <label for="updateCat"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Language']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="language[]" value="Read">
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="language[]" value="Write">
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="language[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Payout']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="payout[]" value="Read">
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="updatePage" name="payout[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Report']; ?></label>
                <div class="checkbox-group">
                   
                    <input type="checkbox" id="updatePage" name="report[]" value="Read">
                    <label for="updatePage"><?php echo $lang['Read']; ?></label>
                </div>
            </div>
        </div>

        <div class="col-3">
            <div class="form-group mb-3">
                <label><?php echo $lang['Religion']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readCat" name="religion[]" value="Read">
                    <label for="readCat"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writeCat" name="religion[]" value="Write">
                    <label for="writeCat"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updateCat" name="religion[]" value="Update">
                    <label for="updateCat"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Gift']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="gift[]" value="Read">
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="gift[]" value="Write">
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="gift[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Relation_Goals']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="rgoal[]" value="Read">
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="rgoal[]" value="Write">
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="rgoal[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Notification']; ?></label>
                <div class="checkbox-group">
                    

                    <input type="checkbox" id="writePage" name="notification[]" value="Write">
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                   
                </div>
            </div>
        </div>

        <div class="col-3">
            <div class="form-group mb-3">
                <label><?php echo $lang['Plan']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readCat" name="plan[]" value="Read">
                    <label for="readCat"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writeCat" name="plan[]" value="Write">
                    <label for="writeCat"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updateCat" name="plan[]" value="Update">
                    <label for="updateCat"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['Package']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="package[]" value="Read">
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="writePage" name="package[]" value="Write">
                    <label for="writePage"><?php echo $lang['Write']; ?></label>

                    <input type="checkbox" id="updatePage" name="package[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>

            <div class="form-group mb-3">
                <label><?php echo $lang['User_List']; ?></label>
                <div class="checkbox-group">
                    <input type="checkbox" id="readPage" name="ulist[]" value="Read">
                    <label for="readPage"><?php echo $lang['Read']; ?></label>

                    <input type="checkbox" id="updatePage" name="ulist[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
			
			<div class="form-group mb-3">
                <label><?php echo $lang['Wallet']; ?></label>
                <div class="checkbox-group">
                   
                    <input type="checkbox" id="updatePage" name="wallet[]" value="Update">
                    <label for="updatePage"><?php echo $lang['Update']; ?></label>
                </div>
            </div>
 </div>
 
 
 
        </div>
		
    </div>
	<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Email_Address']; ?></label>
                                    
                                  <input type="text" class="form-control" placeholder="<?php echo $lang['Email_Address']; ?>"  name="email" required>
                               
								</div>
								
								<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Enter_Password']; ?></label>
                                    
                                  <input type="text" class="form-control" placeholder="<?php echo $lang['Enter_Password']; ?>"  name="password" required>
                                <input type="hidden" name="type" value="add_staff"/>
										
								</div>
								
                                    
                                   <div class="form-group mb-3">
                                    
                                        <label  for="inputGroupSelect01"><?php echo $lang['Staff_Status']; ?></label>
                                    
                                    <select  class="form-control" name="status" id="inputGroupSelect01" required>
                                        <option value=""><?php echo $lang['Select_Status']; ?></option>
                                        <option value="1"><?php echo $lang['Publish']; ?></option>
                                        <option value="0"><?php echo $lang['UnPublish']; ?></option>
                                       
                                    </select>
                                </div>
</div>


    <div class="card-footer text-left">
        <button class="btn btn-primary"><?php echo $lang['Add_Staff']; ?></button>
    </div>
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