<!--#include file="connection.asp"-->

<!doctype html>
<html lang="en" viewsource="no">
<%

if session("userid") = "" then
	Response.Redirect "bmdlogin.asp"
end if

dim guidrs
set guidrs = server.CreateObject("adodb.recordset")
guidrs.Open "select newid() as guid",con,3,3
session("guid") = guidrs("guid")
guidrs.Close 

%>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>e-Healthwatch</title>
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/custom.css">
	<link rel="stylesheet" href="css/responsive.css">
	<link rel="stylesheet" href="css/font-awesome.min.css">
	<link rel="stylesheet" href="fonts/latofonts.css">
	<link rel="stylesheet" href="css/slick.css">
	<link rel="stylesheet" href="css/slick-theme.css">
	
<script language='javascript'>
	

	function clearall()
	{
		window.location="bmd.asp"
	}
	
	function calcfm()
	{
	
		if((document.frm_salableitems.Txt_name.value) == '')
		{
			alert('Name should not be empty')
			document.frm_salableitems.Txt_name.focus()
			return false
		}
		
		if((document.frm_salableitems.Txt_age.value) == '')
		{
			alert('Age should not be empty')
			document.frm_salableitems.Txt_age.focus()
			return false
		}
		
		if(isNaN(document.frm_salableitems.Txt_age.value))
		{
			alert('Invalid input for the field Age. Please re-enter.')
			document.frm_salableitems.Txt_age.focus()
			return false
		}
		
		if((document.frm_salableitems.Txt_height.value) == '')
		{
			alert('Height should not be empty')
			document.frm_salableitems.Txt_height.focus()
			return false
		}
		
		if((document.frm_salableitems.Txt_weight.value) == '')
		{
			alert('Weight should not be empty')
			document.frm_salableitems.Txt_weight.focus()
			return false
		}		
		 
		if((document.frm_salableitems.Txt_hal.value) == '')
		{
			alert('HAL should not be empty')
			document.frm_salableitems.Txt_hal.focus()
			return false
		}	
		
		if((document.frm_salableitems.Txt_nsa.value) == '')
		{
			alert('NSA should not be empty')
			document.frm_salableitems.Txt_nsa.focus()
			return false
		}
		
		document.frm_salableitems.method="post"
		document.frm_salableitems.action="bmdsave.asp"
		document.frm_salableitems.submit()
	}
</script>	
</head>

<body oncontextmenu="return false">
<form name='frm_salableitems' method='post'>
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
									<li><a class="active" href="index.asp">Home</a>
									</li>
									<li><a href="gynaecology.asp">Gynaecology</a>
									</li>
									<li><a href="pregnancy.asp">Pregnancy</a>
									</li>									
									<li><a href="forecasting.asp">Forecast Menopause</a>
									</li>
									<li><a href="Contact.asp">Contact Us</a>
									</li>
									<%if session("userid") <> "" then%>
									<li><a href="logout.asp">Logout</a>
									</li>	
									<%end if%>

								 									
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
									<li><a href="Contact.asp">Contact Us</a>
									</li>
									<%if session("userid") <> "" then%>
									<li><a href="logout.asp">Logout</a>
									</li>	
									<%end if%>										

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
                <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12">
                    <h2 class="aboutpage-title">&nbsp;</h2>
                    <h4><font color='red'>&nbsp;</font></h4>
                    <div class="aboutpage-content">
  						 <div class="form-group inner-tittle">
							  <label for="name" class="inner-tittle">Name <span class="red-star">*</span> </label>
							  <input type="text" class="form-control validate[required]" id="Txt_name" placeholder="Name" name="Txt_name" maxlength="50">
							</div>
												
						 <div class="form-group inner-tittle">
							  <label for="name" class="inner-tittle">Age <span class="red-star">*</span> </label>
							  <input type="text" class="form-control validate[required]" id="Txt_age" placeholder="Age" name="Txt_age" maxlength="4">
							</div>
							
						 <div class="form-group inner-tittle">
							  <label for="name" class="inner-tittle">Height (in CMS) <span class="red-star">*</span> </label>
							  <input type="text"   class="form-control validate[required]" id="Txt_height" placeholder="Height" name="Txt_height" maxlength="8">
							</div>
							
							<div class="form-group inner-tittle">
							  <label for="name" class="inner-tittle">Weight (in KGs) <span class="red-star">*</span> </label>
							  <input type="text" class="form-control validate[required]"   id="Txt_weight" placeholder="Weight" name="Txt_weight"  maxlength="8" >
							</div>	
							<div class="form-group inner-tittle">
							  <label for="name" class="inner-tittle">HAL (in MM) <span class="red-star">*</span> </label>
							  <input type="text" class="form-control validate[required]"   id="Txt_hal" placeholder="HAL" name="Txt_hal"  maxlength="8" >
							</div>			
							
							<div class="form-group inner-tittle">
							  <label for="name" class="inner-tittle">NSA <span class="red-star">*</span> </label>
							  <input type="text" class="form-control validate[required]"   id="Txt_nsa" placeholder="NSA" name="Txt_nsa"  maxlength="8">
							</div>
														
							<button type="button" name="btn_enq" id="btn_enq" class="btn btn-warning submit-form" onclick="javascript:calcfm()">Submit</button>
                    </div>
                </div>
               
            </div>
        </div>
    </section>
    
    
    
    
    <!------ FOOTER ------->
    
       <footer>
        <div class="container">
            <div class="row">
                 &copy;  All rights reserved
            </div>
            
        </div>
    </footer>

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/slick.js"></script>
	<script src="js/custom.js"></script>
	</form>
</body>

</html>