<!--#include file="connection.asp"-->
<!doctype html>
<html lang="en" viewsource="no">

<%

guid = session("guid") 

if session("userid") = "" then
	Response.Redirect "bmdlogin.asp"
end if

if guid = "" then
	Response.Redirect "bmd.asp"
end if

dim rs
set rs = server.CreateObject("adodb.recordset")
rs.Open "select * from bmd where guid = '" & guid & "'",con,3,3

if rs.AbsolutePosition <> -1 then
	rs.MoveLast
	rs.MoveFirst 
end if

if rs.EOF = false then
	height=rs("height")
	weight=rs("weight")
	age=rs("age")
	hal=rs("hal")
	nsa=rs("nsa")
	
	result = round(1.06861 * ((((height * 0.01) ^ 0.326842) * (weight ^ 0.211909) * (hal ^ 0.0608258)) * (age ^ -0.332916) * ((nsa * 0.0174533)  ^ -0.239446)),4)
else
	Response.Redirect "bmd.asp"
end if
con.execute "delete from bmd where guid = '" & guid & "'"
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
	function back()
	{
		window.location.href="bmd.asp"
	}

	
</script>	
</head>

<body oncontextmenu="return false">
<form name='frm_salableitems' method='post'>
<input type="hidden" name="validate1">
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
									<%if session("userid") <> "" then%>
									<li><a href="logout.asp">Logout</a>
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
                    <h2 class="aboutpage-title">BMD result</h2>
                    <h4><font color='red'><%=msg%></font></h4>
                    <div class="aboutpage-content">
  						 <div class="form-group inner-tittle">
							  <label for="name" class="inner-tittle">Your Result <%=result%></label>
							  
							</div>
												
							<button type="button" name="btn_enq" id="btn_enq" class="btn btn-warning submit-form" onclick="javascript:back()">Back</button>
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