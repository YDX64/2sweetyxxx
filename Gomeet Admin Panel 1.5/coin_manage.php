<?php 
require 'inc/Header.php';
if ($_SESSION['stype'] == 'Staff' && !in_array('Update', $coin_per)) {
    

    
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
function addOrdinalSuffix($day) {
    if (!in_array(($day % 100), array(11, 12, 13))) {
        switch ($day % 10) {
            case 1: return $day . 'st';
            case 2: return $day . 'nd';
            case 3: return $day . 'rd';
        }
    }
    return $day . 'th';
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
                  <h3><?php echo $lang['Coin_Management']; ?></h3>
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
				 
					 $data = $dating->query("select * from tbl_user where id=".$_GET['id']."")->fetch_assoc();
					 ?>
					 <div class="mng_btn">
					 <p class="btn btn-info"><?php echo $lang['Coin_Balance:']; ?> <?php echo $data['coin'];?> <i class="fa-solid fa-coins"></i></p>
					 </div>
                  <div class="card-body">
                    <ul class="nav nav-tabs nav-primary" id="pills-warningtab" role="tablist">
                      <li class="nav-item"><a class="nav-link active" id="pills-warninghome-tab" data-bs-toggle="pill" href="#pills-warninghome" role="tab" aria-controls="pills-warninghome" aria-selected="true"><i class="fa fa-plus"></i><?php echo $lang['Add_Balance']; ?></a></li>
                      <li class="nav-item"><a class="nav-link" id="pills-warningprofile-tab" data-bs-toggle="pill" href="#pills-warningprofile" role="tab" aria-controls="pills-warningprofile" aria-selected="false"><i class="fa fa-minus"></i><?php echo $lang['Substract_Balance']; ?></a></li>
                      
                    </ul>
                    <div class="tab-content" id="pills-warningtabContent">
                      <div class="tab-pane fade active show" id="pills-warninghome" role="tabpanel" aria-labelledby="pills-warninghome-tab">
                       <form method="POST"  enctype="multipart/form-data" style="margin-top: 32px;">
								
								<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Enter_Coin']; ?></label>
                                    
                                  <input type="number" step="0.01" class="form-control" placeholder="<?php echo $lang['Enter_Coin']; ?>" name="amount" required>
								  <input type="hidden" name="type" value="add_coin_balance"/>
										<input type="hidden" name="id" value="<?php echo $_GET['id'];?>"/>
                               
								</div>
								
								
                                    <button type="submit" class="btn btn-primary"><?php echo $lang['Add_Coin_Balance']; ?> <i class="fa-solid fa-coins"></i></button>
									
                                </form>
                      </div>
                      <div class="tab-pane fade" id="pills-warningprofile" role="tabpanel" aria-labelledby="pills-warningprofile-tab">
                        <form method="POST"  enctype="multipart/form-data" style="margin-top: 32px;">
								
								<div class="form-group mb-3">
                                   
                                        <label  id="basic-addon1"><?php echo $lang['Enter_Coin']; ?></label>
                                    
                                  <input type="number" step="0.01" class="form-control" placeholder="<?php echo $lang['Enter_Coin']; ?>" name="amount" required>
								  <input type="hidden" name="type" value="sub_coin_balance"/>
										<input type="hidden" name="id" value="<?php echo $_GET['id'];?>"/>
                               
								</div>
								
								
                                    <button type="submit" class="btn btn-danger"><?php echo $lang['Substract_Coin_Balance']; ?> <i class="fa-solid fa-coins"></i></button>
									
                                </form>
                      </div>
                      
                    </div>
                  </div>
                </div>
              
                
              </div>
            
            </div>
          </div>
		  
		 <div class="container-fluid">
            <div class="page-title">
              <div class="row">
                <div class="col-sm-6">
                  <h3><?php echo $lang['Coin_Log']; ?></h3>
                </div>
               
              </div>
            </div>
          </div>
          <!-- Container-fluid Ends-->
		  
		  <div class="container-fluid dashboard-default">
            <div class="row">
           <div class="col-sm-12">
                <div class="card">
				<div class="card-body">
				<div class="table-responsive">
                <table class="display" id="basic-1">
                        <thead>
                          <tr>
                            <th><?php echo $lang['Sr_No.']; ?></th>
							
											
											<th><?php echo $lang['Amount']; ?></th>
											<th><?php echo $lang['Message']; ?></th>
											<th><?php echo $lang['Status']; ?></th>
												<th><?php echo $lang['Date']; ?></th>
												
                          </tr>
                        </thead>
                        <tbody>
                           <?php 
										$city = $dating->query("select * from coin_report where uid=".$_GET["id"]."");
										$i=0;
										while($row = $city->fetch_assoc())
										{
											$i = $i + 1;
											?>
											<tr>
                                                <td>
                                                    <?php echo $i; ?>
                                                </td>
                                                
												
												
                                               
												
												<td>
                                                    <?php echo $row['amt']; ?>
                                                </td>
												
												<td>
                                                    <?php echo $row['message']; ?>
                                                </td>
												
												<td class="<?php echo ($row['status'] == 'Credit') ? 'text-success' : ($row['status'] == 'Debit' ? 'text-danger' : ''); ?>">
    <?php echo $row['status']; ?>
</td>
                                                
                                               
												<td>
                                                    <?php $dateString = $row['tdate']; // Assuming the date is in 'Y-m-d' format

// Create DateTime object
$date = new DateTime($dateString);

// Extract day with ordinal suffix
$day = addOrdinalSuffix($date->format('j'));

echo $day . ' ' . $date->format('F, Y'); ?>
                                                </td>
                                                
                                                </tr>
											<?php 
										}
										?>
                          
                        </tbody>
                      </table>
					  </div>
					  </div>
				 
                </div>
              
                
              </div>
            
            </div>
          </div>
        </div>
        <!-- footer start-->
       
      </div>
    </div>
    <!-- latest jquery-->
   <?php require 'inc/Footer.php'; ?>
   <style>
   .mng_btn
		{
			    position: absolute;
    z-index: 1;
    right: 18px;
    top: -23px;
		}
   </style>
    <!-- login js-->
  </body>


</html>