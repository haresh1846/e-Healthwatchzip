<!doctype html>
<html lang="en">
 

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1,user-scalable=no">
	<META NAME="ROBOTS" CONTENT="INDEX, FOLLOW">
	<meta name="description" content="AMH,PCOS,Menopause">
	<meta name="title" content="AMH,PCOS,Menopause">
	<title>e-healthwatch</title>
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/custom.css">
	<link rel="stylesheet" href="css/responsive.css">
	<link rel="stylesheet" href="css/font-awesome.min.css">
	<link rel="stylesheet" href="fonts/latofonts.css">
	<link rel="stylesheet" href="css/slick.css">
	<link rel="stylesheet" href="css/slick-theme.css">
</head>

<body>
<script>
  

function redir()
{
	document.frm_pickup.validate1.value="T"
	document.frm_pickup.method="post"
	document.frm_pickup.action="index.asp"
	document.frm_pickup.submit()	
}
</script>

	<header>
		<div class="container-fluid">
			<div class="row">
				<div class="black-top">
					<div class="container">
						<div class="pull-right">
							<div class="help-line">
								<!--p><img alt="Call" class="img-responsive" src="images/call.png">&nbsp;&nbsp;Help Line - +91 98411 71185</p-->
								<!--div class="social-header">
									<a href="https://www.facebook.com/R3EWaste/"><i class="fa fa-facebook"></i></a>
									<a href="https://plus.google.com/109523602366019243329"><i class="fa fa-google-plus"></i></a>
								</div-->
							</div>

						</div>
					</div>
                    </div>
                    </div>
                    </div>


					<!-- Nav Bar -->
<div class="container-fluid">
			<div class="row">
					<nav class="navbar navbar-default navbar-static-top">
						<div class="container">
							<div class="navbar-header">
								<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
									<span class="sr-only">Toggle navigation</span>
									<span class="icon-bar"></span>
									<span class="icon-bar"></span>
									<span class="icon-bar"></span>
								</button>
								<a class="navbar-brand" href="index.asp"><img alt="Main Logo" class="img-responsive" src="images/logo.png" id="top" style="display:inline-block;"/>
								</a><!--img alt="supporting" style="width:140px; padding-left:4px;padding-top:3px;display:inline-block;"  src="images/supporting-PCH-Logo_CMYK.jpg"/-->
							</div>
							
							<div id="navbar" class="navbar-collapse collapse">
								<ul class="nav navbar-nav visible-xs">
									<li><a class="active" href="index.asp">Home</a>
									</li>
									<li><a href="gynaecology.asp">Gynaecology</a>
									</li>
									<li><a href="pregnancy.asp">Pregnancy</a>
									</li>									
									<li><a href="forecasting.asp">Forecast Menopause</a>
									</li>
									<%if session("userid") <> "" then%>
									<li><a href="logout.asp">Logout</a>
									</li>	
									<%else%>
									<li><a href="bmdlogin.asp">BMD Calculator</a>
									</li>									
									<%end if%>										
									<li><a href="Contact.asp">Contact Us</a>
									</li>
								 									
								</ul>
                                <ul class="nav navbar-nav pull-right hidden-xs">
									<li><a class="active" href="index.asp">Home</a>
									</li>
									<li><a href="gynaecology.asp">Gynaecology</a>
									</li>
									<li><a href="pregnancy.asp">Pregnancy</a>
									</li>									
									<li><a href="forecasting.asp">Forecast Menopause</a>
									</li>
									<%if session("userid") <> "" then%>
									<li><a href="logout.asp">Logout</a>
									</li>	
									<%else%>
									<li><a href="bmdlogin.asp">BMD Calculator</a>
									</li>									
									<%end if%>									
									<li><a href="Contact.asp">Contact Us</a>
									</li>
								</ul>
							</div>
							<!--/.nav-collapse -->
						</div>
					</nav>
				</div>
			</div>
            
		
	</header>
    
    <!------ Carousel ------->
    
	<div class="container-fluid">
		<div class="row">
			<div id="myCarousel" class="carousel slide" data-ride="carousel">
				<!-- Wrapper for slides -->
				<div class="carousel-inner" role="listbox">
				
								
					<div class="item active">
						<img src="images/banner3.png" alt="Banner" class="hidden-xs img-responsive">
                        <img src="images/mobile-banner3.png" alt="Banner" class="visible-xs img-responsive">
					</div>
													
					<div class="item">
						<img src="images/banner2.png" alt="Banner" class="hidden-xs img-responsive">
                        <img src="images/mobile-banner2.png" alt="Banner" class="visible-xs img-responsive">
					</div>

					<div class="item">
						<img src="images/banner1.png" alt="Banner" class="hidden-xs img-responsive">
                        <img src="images/mobile-banner1.png" alt="Banner" class="visible-xs img-responsive">
					</div>

					<div class="item">
						<img src="images/banner4.png" alt="Banner" class="hidden-xs img-responsive">
                        <img src="images/mobile-banner4.png" alt="Banner" class="visible-xs img-responsive">
					</div>
				</div>

				<!-- Left and right controls -->
				<a class="left carousel-control" href="#myCarousel" role="button" data-slide="prev">
					<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
					<span class="sr-only">Previous</span>
				</a>
				<a class="right carousel-control" href="#myCarousel" role="button" data-slide="next">
					<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
					<span class="sr-only">Next</span>
				</a>
			</div>
		</div>
	</div>
    
    <!------ Below Carousel ------->
    <div class="below-carousel">
        <div class="container">
            <div class="row">
                <div class="text-center">
                </div>
            </div>
        </div>
    </div>
    
    <!------ Services Slider ------->
    
   <section id="cat-bg">
    	<div class="container">
        	<div class="row">
            	<div class="col-md-8 col-xs-12">
                	<div class="col-md-5 col-sm-6 col-xs-6 category border-bottom">
                        <h2> About your health </h2>
                        <p>Health may be defined as a "complete/balanced condition" in which there is synchronization between body and mind. Cells are the fundamental units of the body. Cells with similar functions are grouped to form tissues like epithelial, connective, muscular and nervous tissues. <br/>
                        <br><a href="health.asp">Read more... </a></p>
                    </div>
                    <div class="col-md-5 col-sm-6 col-xs-6 category border-bottom border-left">
                        <h2> Menopause </h2>
                        <p>Why to predict menopause?<br><br>

						The cessation of reproductive life span in the women is called menopause and prediction of menopause will help to plan for reproductive potentiality in infertility treatment and planning for premenopausal and post-menopausal related health effects.
						
                        <a href="menopause.asp">Read more... </a></p>
                    </div>
					<div class="col-md-5 col-sm-6 col-xs-6 category ">
                        <h2> About modelling of data </h2>
                        <p>In the present day, multiple diagnoses tests involves exorbitant cost and are not affordable for everyone. <br/>
                        <a href="data.asp">Read more... </a></p>
                    </div>
				<div class="col-md-5 col-sm-6 col-xs-6 category  border-left">
                        <h2> About disease  </h2>
                        <p>The manifestation of a disease initially may be detected at body level or at organ level.<br/>
                        <a href="organ.asp">Read more... </a></p>
                    </div>
               </div>
               <div class="col-md-4 form-heading">
               <h1>Send us a Message</h1>
               	<form role="form" name="frm_pickup">
               		<input type="hidden" name="validate1">
                  <div class="form-group">
                    <input type="text" class="form-control"   name="name" placeholder="Your Name">
                  </div>
                  <div class="form-group">
                    <input type="email" class="form-control"  name="email" placeholder=" Your Email address">
                  </div>
                  <div class="form-group">
                    <input type="text" class="form-control"   name="phone" placeholder="phone number">
                  </div>
                  <div class="form-group">
                  <textarea class="form-control" rows="5"   name="comment" placeholder="Message"></textarea>
                  </div>
                  <button type="button" class="btn btn-default pull-left form-submit" onclick="javascript:redir()">Submit</button>
                </form>
               </div>
            </div>
        </div>
    </div>
    
    <!------ Services Slider ------->
   
    
    <!------ Services Slider ------->
    
    
    
    <!------ FOOTER ------->
    
    <footer>
        <div class="container">
            <div class="row">
                 &copy;  All rights reserved<br>
            </div>
			Visitor No.&nbsp;<img src="http://counter2.01counter.com/private/freecounterstat.php?c=6906959b214253fed98a3e2f8f36d5be" border="0"/>
        
        </div>
    </footer>

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/slick.js"></script>
	<script src="js/custom.js"></script>
	<script src="js/jq-val/jquery.validationEngine.js"></script>
	<script src="js/jq-val/jquery.validationEngine-en.js"></script>
	<script type="text/javascript">  







	
</body>

</html>