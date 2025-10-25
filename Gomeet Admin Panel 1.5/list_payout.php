<?php 
require 'inc/Header.php';
if(isset($_GET['payout']))
{	
	if ($_SESSION['stype'] == 'Staff' && !in_array('Update', $payout_per)) {
    

    
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
if ($_SESSION['stype'] == 'Staff' && !in_array('Read', $payout_per)) {
    

    
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
                  <h3><?php echo $lang['Payout_List_Management']; ?></h3>
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
	if(isset($_GET['payout']))
						{
							?>
							<form class="form" method="post"  enctype="multipart/form-data">
							<div class="form-body">
								

								

								
								
								

								
<div class="form-group mb-3">
                                            <label><?php echo $lang['Payout_Image']; ?></label>
                                            <input type="file" class="form-control" name="cat_img" required="">
											<input type="hidden" name="type" value="com_payout">
											<input type="hidden" name="payout_id" value="<?php echo $_GET['payout'];?>"/>
                                        </div>
								
							</div>

							 <div class=" text-left">
                                        <button  class="btn btn-primary"><?php echo $lang['Complete_Payout']; ?> <i class="fas fa-receipt"></i></button>
                                    </div>
							
							
						</form>
						
						<?php 
						}
						else 
						{ ?>
				<div class="table-responsive">
                 <table class="display" id="basic-1">
                        <thead>
                                                <tr>
                                                <th class="text-center">
                                                    <?php echo $lang['Sr_No.']; ?>
                                                </th>
                                               
                                    <th><?php echo $lang['Amount']; ?></th>
                                   <th><?php echo $lang['Coin']; ?></th>
									<th><?php echo $lang['User_Name']; ?></th>
									<th><?php echo $lang['Transfer_Details']; ?></th>
                                    <th><?php echo $lang['Transfer_Type']; ?></th>
									<th><?php echo $lang['User_Mobile']; ?></th>
									<th><?php echo $lang['Transfer_Photo']; ?></th>
									
									 <th><?php echo $lang['Status']; ?></th>
                                            <?php 
												if($_SESSION['stype'] == 'Staff')
		{
			if (in_array('Update', $payout_per)) {
			?>
			<th><?php echo $lang['Action']; ?></th>
			<?php
			}			
		}
		else 
		{
												?>
												<th><?php echo $lang['Action']; ?></th>
												<?php } ?>
                                                </tr>
                                            </thead>
                                        <tbody>
                                            <?php 
											 $stmt = $dating->query("SELECT * FROM `payout_setting`");
$i = 0;
while($row = $stmt->fetch_assoc())
{
	$i = $i + 1;
											?>
                                                <tr>
                                                <td>
                                                    <?php echo $i; ?>
                                                </td>
                                               
                                    <td><?php echo $row['amt'].' '.$set['currency'];?></td>
									<td><?php echo $row['coin'];?></td>
									<?php 
									$vdetails = $dating->query("select * from tbl_user where id=".$row['uid']."")->fetch_assoc();
									?>
									<td><?php echo $vdetails['name'];?></td>
									<?php 
									if($row['r_type'] == 'UPI')
									{
									  ?>
									  <td><?php echo $row['upi_id'];?></td>
									  <?php 
									}
									else if($row['r_type'] == 'BANK_Transfer')
									{
									 ?>
									 <td><?php echo 'Bank Name: '.$row['bank_name'].'<br>'.'A/C No: '.$row['acc_number'].'<br>'.'A/C Name: '.$row['receipt_name'].'<br>'.'IFSC CODE: '.$row['ifsc'].'<br>';?></td>
									 <?php 
									}
									else 
									{
									   ?>
									   <td><?php echo $row['paypal_id'];?></td>
									   <?php 
									}
									?>
									
									<td><?php echo $row['r_type'];?></td>
									 <td><?php echo $vdetails['ccode'].$vdetails['mobile'];?></td>
									 <?php
									 if($row['proof'] == '')
									 {
										 ?>
										 <td></td>
										 <?php
									 }else {
									     ?>
									 
									  <td><img src="<?php echo $row['proof']; ?>" width="70" height="80"/></td>
									  <?php } ?>
									 <td><?php echo ucfirst($row['status']);?></td>
									 
									 <?php 
												if($_SESSION['stype'] == 'Staff')
		{
			if (in_array('Update', $payout_per)) {
			?>
			
                                     <td>
									 <?php if($row['status'] == 'pending') {?>
									<a href="?payout=<?php echo $row['id'];?>"><button class="btn shadow-z-2 btn-danger gradient-pomegranate"><?php echo $lang['Make_A_Payout']; ?></button></a>
									 <?php } else { ?>
									 <p><?php echo ucfirst($row['status']);?></p>
									 <?php } ?>
									</td>
									
									<?php
			}			
		}
		else 
		{
												?>
												<td>
									 <?php if($row['status'] == 'pending') {?>
									<a href="?payout=<?php echo $row['id'];?>"><button class="btn shadow-z-2 btn-danger gradient-pomegranate"><?php echo $lang['Make_A_Payout']; ?></button></a>
									 <?php } else { ?>
									 <p><?php echo ucfirst($row['status']);?></p>
									 <?php } ?>
									</td>
												
		<?php } ?>
                                                </tr>
<?php } ?>                                           
                                        </tbody>
                      </table>
					  </div>
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