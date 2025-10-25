<?php 
require 'inc/Header.php';
if(isset($_GET['id']))
{	
	if ($_SESSION['stype'] == 'Staff' && !in_array('Update', $fakeuser_per)) {
    

    
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
                  <h3><?php echo $lang['Fake_User_Generator']; ?></h3>
                </div>
               
              </div>
            </div>
          </div>
          <!-- Container-fluid starts-->
          <div class="container-fluid dashboard-default">
            <div class="row">
           <div class="col-sm-12">
                <div class="card">
                 
                  <form method="post" enctype="multipart/form-data">
                                    
                                    <div class="card-body">
                                        
										<p class="text text-danger"><?php echo $lang['You_need_to_upload_images_to_the_images/male_and_images/female_folders._Then,_the_algorithm_will_select_a_random_image_from_each_folder.']; ?></p>
										
										
                                        <div class="form-group mb-3">
                                            <label><?php echo $lang['How_many_users_you_want_to_generate?']; ?></label>
                                            <input type="number" class="form-control" name="n_user"  required="">
											<input type="hidden" name="type" value="fake_user"/>
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Password']; ?></label>
                                            <input type="text" class="form-control"   name="password" >
											<p class="text text-danger"><?php echo $lang['Choose_the_password_that_will_be_used_for_all_users,_default:_123456789']; ?></p>
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Select_Gender']; ?></label>
                                            <select name="gender" class="form-control" required>
											<option value=""><?php echo $lang['select_a_gender']; ?></option>
											<option value="MALE"><?php echo $lang['MALE']; ?></option>
											<option value="FEMALE"><?php echo $lang['FEMALE']; ?></option>
											<option value="Random"><?php echo $lang['Random']; ?></option>
											</select>
											
                                        </div>
										
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Select_Prefrence']; ?></label>
                                            <select name="search_preference" class="form-control" required>
											<option value=""><?php echo $lang['select_a_preference']; ?></option>
											<option value="0"><?php echo $lang['Same_As_Gender']; ?></option>
											<option value="1"><?php echo $lang['Opposite_Of_Gender']; ?></option>
											
											</select>
											
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['How_many_Select_Random_Interest?']; ?></label>
                                            <input type="number" class="form-control" name="interest"  required="">
											<p class="text text-danger"><?php echo $lang['Number_Depend_On_Your_Total_Record_In_Database_Of_Interest']; ?>(<a href="add_interest.php"><?php echo $lang['Add_Interest']; ?></a>)</p>
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['How_many_Select_Random_Language?']; ?></label>
                                            <input type="number" class="form-control" name="language"  required="">
											<p class="text text-danger"><?php echo $lang['Number_Depend_On_Your_Total_Record_In_Database_Of_Language']; ?>(<a href="add_language.php"><?php echo $lang['Add_Language']; ?></a>)</p>
                                        </div>
										 
										 <div class="form-group mb-3">
										<input id="searchInput" class="input-controls" type="text" placeholder="Enter a location">
<div class="map" id="map"></div>
</div>

										 <div class="form-group mb-3">
                                            <label><?php echo $lang['Latitude']; ?></label>
                                            <input type="text" class="form-control" id="lat" name="latitude"  required="" readonly>
											
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Longtitude']; ?></label>
                                            <input type="text" class="form-control" id="lng" name="longtitude"  required="" readonly>
											
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Radius_To_Generate_Random_Points_(KM)?']; ?></label>
                                            <input type="number" class="form-control" min="1" name="radius"  required="">
											
                                        </div>
                                        <div class="form-group mb-3">
										<p class="text text-danger"><?php echo $lang['To_Specified_Radius_near_lat_long_generate_randomly.']; ?></p>
										</div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['Select_Country_Code']; ?></label>
                                            <select name="ccode" class="form-control select2-ccode" required>
											<option value=""><?php echo $lang['select_a_country_code']; ?></option>
											<?php 
											$ccode = $dating->query("select * from tbl_code");
											while($country = $ccode->fetch_assoc())
											{
												?>
												<option value="<?php echo $country['ccode'];?>"><?php echo $country['ccode'];?></option>
												<?php 
											}
											?>
											</select>
											
                                        </div>
										
										<div class="form-group mb-3">
                                            <label><?php echo $lang['How_many_digits_should_the_mobile_number_consist_of?']; ?></label>
                                            <input type="number" class="form-control" name="limit_mobile"  required="">
											
                                        </div>
										
                                    </div>
                                    <div class="card-footer text-left">
                                        <button  type="submit" class="btn btn-primary"><?php echo $lang['Generate_Fake_Data']; ?></button>
                                    </div>
                                </form>
				 
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
	<script>
function initializeMap() {
    
   
    var latlng = new google.maps.LatLng(28.5355161, 77.39102649999995);
    
    var map = new google.maps.Map(document.getElementById('map'), {
        center: latlng,
        zoom: 13
    });
    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        draggable: true,
        anchorPoint: new google.maps.Point(0, -29)
    });
    var input = document.getElementById('searchInput');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var geocoder = new google.maps.Geocoder();
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    var infowindow = new google.maps.InfoWindow();   
    autocomplete.addListener('place_changed', function() {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);          
        bindDataToForm(place.formatted_address, place.geometry.location.lat(), place.geometry.location.lng());
        infowindow.setContent(place.formatted_address);
        infowindow.open(map, marker);
    });
    google.maps.event.addListener(marker, 'dragend', function() {
        geocoder.geocode({'latLng': marker.getPosition()}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) { 
                    bindDataToForm(results[0].formatted_address, marker.getPosition().lat(), marker.getPosition().lng());
                    infowindow.setContent(results[0].formatted_address);
                    infowindow.open(map, marker);
                }
            }
        });
    });
}

function bindDataToForm(address, lat, lng) {
    
    $('#lat').val(lat);
    $('#lng').val(lng);
}

function loadGoogleMapsScript() {
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=<?php echo $apiKey;?>&libraries=places&callback=initializeMap";
    document.body.appendChild(script);
}

window.addEventListener('load', loadGoogleMapsScript, { passive: true });
</script>

<style type="text/css">
#map 
{
	width: 100%; height: 300px;
}

    .input-controls {
      margin-top: 10px;
      border: 1px solid transparent;
      border-radius: 2px 0 0 2px;
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      height: 32px;
      outline: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
    #searchInput {
      background-color: #fff;
      font-family: Roboto;
      font-size: 15px;
      font-weight: 300;
      margin-left: 12px;
      padding: 0 11px 0 13px;
      text-overflow: ellipsis;
      width: 50%;
    }
    #searchInput:focus {
      border-color: #4d90fe;
    }
</style>
  </body>


</html>