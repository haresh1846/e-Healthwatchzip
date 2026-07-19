<!doctype html>
<html lang="en">
 

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
 
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
								<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar" id=button1 name=button1>
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
									<li><a class="active" href="http://www.e-healthwatch.com">Home</a>
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
									<li><a class="active" href="http://www.e-healthwatch.com">Home</a>
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
    
    <!------ About Banner ------->
    <section id="banner-section">
        <div class="container-fluid">
            <div class="row">
                <img alt="Banner" src="images/banner1.png" class="img-responsive banner-img">
            </div>
        </div>
    </section>
    
    <!------ About Content ------->
    
    <section id="about-cont">
        <div class="container">
            <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <h2 class="aboutpage-title">About modelling of data</h2>
                    <div class="aboutpage-content">
                        In the present day, multiple diagnoses tests involves exorbitant cost and are not affordable for everyone. 
                        <br><br>
                        Due to this, medical tests are not often conducted in the early stages itself. 
                        In this regard, this web site aims to offer certain "predictive diagnosis" to certain health conditions based on mathematical concepts. Predictions are arrived using certain simple lab test results and other factors like life style, family history etc. With that objective, as a first step, prediction of menopause onset has been worked out here.
                    </div>
                </div>
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <div class="pull-right">
                        <a href="#top" id="back-to-top" class="gotop">Go to top&nbsp;&nbsp;<img alt="Go top" src="images/gototop.png"></a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    
    
    
    <!------ FOOTER ------->
    
    <footer>
        <div class="container">
            <div class="row">

               <div class="text-center">
                    <ul class="footer-links">
                        <li><a href="About-Us">About Us</a>
                        </li>|
						<li><a href="Contact">Contact Us</a>
                        </li>|                      
                        <li><a href="Secure-Data-Destruction">Secure Data Destruction</a>
                        </li>|
                        <li><a href="Items-Accepted">Items Accepted</a>
                        </li>|
                        <li><a href="Mission-Statement">Mission Statement</a>
                        </li>|                                               
                        <li><a href="Privacy-Policy">Privacy Policy</a>
                        </li>|                                               
                        <li><a href="Environmental-Policies">Environmental Policies</a>
                        </li>
                     
                    </ul>
                </div>
               
            </div>
             <div class="row">
              <div class="text-center">
                    <ul class="footer-links">
						<li><a href="Pickup-Details">Pickup Details</a>
                        </li>|
                        <li><a href="PCHF">PCHF</a>
                        </li>|
                        <li><a href="http://www.r3ewaste.net" target="_blank">Blog</a>
                        </li>
                    </ul>
                </div>
             </div>
        </div>
    </footer>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/slick.js"></script>
	<script src="js/custom.js"></script>
	

<script type="text/javascript">
var $zoho= $zoho || {salesiq:{values:{},ready:function(){}}};var d=document;s=d.createElement("script");s.type="text/javascript";
s.defer=true;s.src="https://salesiq.zoho.com/r2ewastellc/float.ls?embedname=r2ewastellc";
t=d.getElementsByTagName("script")[0];t.parentNode.insertBefore(s,t);
</script>

	
<script type="text/javascript">
    vtid = 109475;document.write(unescape("%3Cscript src='" + document.location.protocol + "//code.visitor-track.com/VisitorTrack.js' type='text/javascript'%3E%3C/script%3E"));
</script>	
	
</body>

</html>