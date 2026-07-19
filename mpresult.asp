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
<%
		name=request("Txt_name")
		age = request("Txt_age")
		if request("cmbperiods") ="R" then
			periods = "Regular"
			 b1=0.15
			 b0 = 35.49
		end if
		
		if request("cmbperiods") ="I" then 
			periods = "Irregular"
			 b1=0.17
			 b0 = 41.41
		end if	
		
		amhvalue = cdbl(request("Txt_amh"))
		
		fmvalue = round(b0 * (amhvalue ^  b1),0)
		'fmvalue = b0 * (Math.pow(parseFloat(document.frm_salableitems.Txt_amh.value),b1))
%>
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
                <img alt="Banner" src="images/slideimg.png" class="img-responsive banner-img">
            </div>
        </div>
    </section>
    
    <!------ About Content ------->
    
    <section id="about-cont">
        <div class="container">
            <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <h2 class="aboutpage-title">Menopause Forecast Result</h2>
                    <div class="aboutpage-content">
                     <div align="Center">
                     <table id="datatable" width="50%">
						<tr><td>Name</td><td><%=name%></td></tr>
						<tr><td>Age</td><td><%=age%></td></tr>
						<tr><td>Periods</td><td><%=periods%></td></tr>
						<tr><td>AMH</td><td><%=amhvalue%></td></tr>
						<tr><td><font color=RoyalBlue><b>Forecasted Menopause Age</b></font></td><td><font color=RoyalBlue><b><%=fmvalue%></b></font></td></tr>
                     </table>
                     </br></br></br>
					<a href="forecasting.asp"><button type="button" name="btn_enq" id="btn_enq" class="btn btn-primary">Back</button></a>
					</div>
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