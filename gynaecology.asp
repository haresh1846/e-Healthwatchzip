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
    
    <!------ About Banner ------->
    <section id="banner-section">
        <div class="container-fluid">
            <div class="row">
                <img alt="Banner" src="images/banner4.png" class="img-responsive banner-img">
            </div>
        </div>
    </section>
    
    <!------ About Content ------->
    
    <section id="about-cont">
        <div class="container">
            <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <h2 class="aboutpage-title">Gynaecology</h2>
                    <div class="aboutpage-content">
                      Human, like other living organisms, has a biological clock which is responsible for circadian rhythm i.e. biological functions that happen in a cyclic manner. Such, biological clock controlled events are responsible for certain essential functions like sleep which is common to both sexes and certain gender-specific functions like a reproductive cycle in females.
						<br><br>
						In the female, under the control of hormones, the reproductive organs - ovary & uterus exhibits certain features/functions in a cyclic manner which are also influenced by factors like environment, stress, infections, structural abnormalities etc. Being cyclical and changing constantly, it is often difficult to differentiate the normal and abnormal functioning especially when the pathology is subtle
						<br><br>
						Conditions affecting female reproductive tract/organs may be endocrine related (e.g. menarche, menopause, PCO, PCOS), structural abnormalities (e.g. fibroids, adenoma, polyps) or infectious causes (sexually and non-sexually transmitted diseases like trichomonosis, genital warts, syphilis, gonorrhea). Early diagnosis of these conditions will greatly help in achieving better outcome and avoid complications.
						<br><br>
						Diagnostic approaches towards these female reproductive system disorders involve expensive, complicated and time-consuming tests comprising of imaging studies, hormone analyses, biochemical and microbiological screening methods. However, in the first level, using certain simple observations and easy to perform tests, such as pattern and quantity of menstrual bleeding, observation of certain signs in the genitalia, analyzing the nature of vaginal discharge etc it may be possible to establish the possibility of certain pathology. Thus, such simple approach can be very useful in the first level diagnosis before deciding to seek professional medical advice.
						<br><br>
						In this website, some simple steps have been described towards finding potential health complications in the female reproductive system and as such can be self-employed by anyone. It is hereby cautioned that the methodology described here shall not be taken as a substitute for a professional medical advice and it is intended for primary level self-examination for those who are apprehensive. 
						
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
    
    
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/slick.js"></script>
	<script src="js/custom.js"></script>
	
 	
	
</body>

</html>