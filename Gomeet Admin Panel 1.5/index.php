<?php 
require 'inc/Header.php';
if(isset($_SESSION['datingname']))
{
	?>
	<script>
	window.location.href="dashboard.php";
	</script>
	<?php 
}
else 
{
}
?>
    <!-- Loader ends-->
    <!-- login page start-->
    <div class="container-fluid p-0">
      <div class="row m-0">
        <div class="col-12 p-0">    
          <div class="login-card">
            <div>
              <div><a class="logo" href="#"><img class="img-fluid for-light" src="<?php echo $set['weblogo'];?>" alt="looginpage"></a></div>
              <div class="login-main"> 
                <form class="theme-form" method="post">
                  <h4 class="text-center">Sign in to account</h4>
                  <p class="text-center">Enter your email & password to login</p>
                  <div class="form-group">
                    <label class="col-form-label">Email Address</label>
                    <input class="form-control" name="username" type="text" required="" id="username" placeholder="AXZ">
					<input type="hidden" name="type" value="login"/>
                  </div>
                  <div class="form-group">
                    <label class="col-form-label">Password</label>
                    <div class="form-input position-relative">
                      <input class="form-control" type="password" name="password" required="" id="password-field" placeholder="*********">
                     
                    </div>
                  </div>
				  
				  <div class="form-group">
                    <label class="col-form-label">Select User Type</label>
                   <select class="form-control" name="stype" id="stype" required>
					<option value="">Select A Type</option>
					<option value="Admin">Admin</option>
					<option value="Staff">Staff</option>
					</select>
                  </div>
				  
				   <div class="form-group">
                    <label class="col-form-label">Select Dahboard Language</label>
                   <select class="form-control" name="sel_lan" required>
					<option value="">Select A Language</option>
					<option value="en">English</option>
					<option value="ar">Arabic</option>
					<option value="gu">Gujarati</option>
					<option value="ch">Chinease</option>
					<option value="fr">French</option>
					<option value="pr">Portuguese</option>
					<option value="sp">Spanish</option>
					<option value="ru">Russian</option>
					<option value="hi">Hindi</option>
					<option value="ja">Japanese</option>
					<option value="tu">Turkish</option>
					</select>
                  </div>
				  
                  <div class="form-group mb-0">
                    
                    <div class="text-end mt-3">
                      <button class="btn btn-primary btn-block w-100" type="submit">Sign in                 </button>
                    </div>
                  </div>
                 
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <?php 
	  require 'inc/Footer.php';
	  ?>
      
      
    </div>
  </body>


</html>