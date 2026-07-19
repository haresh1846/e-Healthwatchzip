<!doctype html>
<html lang="en">
 <!-- #include file='connection.asp'-->
  <!-- #include file='redirect.asp'--> 
<% 

'on error resume next

UserIPAddress = Request.ServerVariables("HTTP_X_FORWARDED_FOR")
If UserIPAddress = "" Then
UserIPAddress = Request.ServerVariables("REMOTE_ADDR")
End If

con.execute "insert into clientip (ipaddress) values ('" & UserIPAddress & "')"

'GetPath = request.ServerVariables("SERVER_NAME") & request.ServerVariables("URL") & query_string

GetPath = mid(Request.ServerVariables("PATH_INFO") &"?"& request.servervariables("QUERY_STRING"),2)


'Response.Buffer = true
'Response.Status = "301 Redirect"
'Response.AddHeader "Location", "http://www.r3ewaste.com"
'Response.End


qsvalue = split(request.servervariables("QUERY_STRING") ,"=")
pagename = qsvalue(1)


'if err.number > 0 then
'	Response.Redirect "http://www.r3ewaste.com"
'end if

pgcontent = ""
if pagename <> "" then
	dim rs
	set rs=server.CreateObject("ADODB.Recordset")
	
	rs.Open "select pagename,content from cms_content where pagename='" & pagename & "' and status = 'P'",con,3,3
	
	if rs.AbsolutePosition <> -1 then
		rs.MoveLast
		rs.MoveFirst 
	end if
	
	if rs.EOF = false then
		pagename = rs("pagename")
		pgcontent = replace(rs("content"),"#","'")
	end if
end if

if pgcontent = "" then 

	if instr(GetPath,"about") >0 then
		Response.Redirect "http://www.r3ewaste.com/about-us"
	end if	
	
	if instr(GetPath,"service") >0 then
		Response.Redirect "http://www.r3ewaste.com/Services"
	end if	
	
	if instr(GetPath,"product") >0 then
		Response.Redirect "http://www.r3ewaste.com/Products"
	end if	
	
	if instr(GetPath,"Destruction") >0 then
		Response.Redirect "http://www.r3ewaste.com/Secure-Data-Destruction"
	end if	
	
	if instr(GetPath,"accepted") >0 then
		Response.Redirect "http://www.r3ewaste.com/Items-Accepted"
	end if	
	
	if instr(GetPath,"Mission") >0 then
		Response.Redirect "http://www.r3ewaste.com/Mission-Statement"
	end if		
	
	if instr(GetPath,"Privacy") >0 then
		Response.Redirect "http://www.r3ewaste.com/Privacy-Policy"
	end if		
	
	if instr(GetPath,"Environmental") >0 then
		Response.Redirect "http://www.r3ewaste.com/Environmental-Policies"
	end if
	
end if


%>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<%if instr(pagename,"About") >0 then%>
	<title>Leading e-waste recycler of used Electronics and Computers in Southwest USA | R3Ewaste</title>
	<meta name="description" content="R3Ewaste is the largest electronics and computer recycler in Southwest USA.We provide electronics and computer recycling services to a wide range of clients.">
	<meta name="title" content="Leading e-waste recycler of used Electronics and Computers in Southwest USA | R3Ewaste">
	<%end if%>
	
	<%if instr(pagename,"Service") >0 then%>
	<title>Electronics and Computers Recycling Services: R3Ewaste</title>
	<meta name="description" content="Recycling services for households and small businesses,Recycle your old, unwanted televisions, computers, computer products and lots more with R3Ewaste and get high quality professional service.">
	<meta name="title" content="Electronics and Computers Recycling Services: R3Ewaste">
	<%end if%>
	
		
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
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-73657097-1', 'auto');
  ga('send', 'pageview');

</script>


<script type="text/javascript">
var fesdpid = 'kustL0VSdP';
var fesdp_BaseURL = (("https:" == document.location.protocol) ? "https://fe.sitedataprocessing.com/fewv1/" : "http://fe.sitedataprocessing.com/fewv1/");
(function () {
var va = document.createElement('script'); va.type = 'text/javascript'; va.async = true;
va.src = fesdp_BaseURL + 'Scripts/fewliveasync.js';
var sv = document.getElementsByTagName('script')[0]; sv.parentNode.insertBefore(va, sv);
})();
</script>


	<header>
		<div class="container-fluid">
			<div class="row">
				<div class="black-top">
					<div class="container">
						<div class="pull-right">
							<div class="help-line">
								<p><img alt="Call" class="img-responsive" src="images/call.png">&nbsp;&nbsp;Help Line - (602) 314 6061</p>
								<!--div class="social-header">
									<a href="#"><i class="fa fa-facebook"></i></a>
									<a href="#"><i class="fa fa-twitter"></i>
    </a>
									<a href="#"><i class="fa fa-google-plus"></i></a>
								</div-->
							</div>

						</div>
					</div>


					<!-- Nav Bar -->

					<nav class="navbar navbar-default navbar-static-top">
						<div class="container">
							<div class="navbar-header">
								<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
									<span class="sr-only">Toggle navigation</span>
									<span class="icon-bar"></span>
									<span class="icon-bar"></span>
									<span class="icon-bar"></span>
								</button>
								<a class="navbar-brand" href="index.asp"><img alt="Main Logo" class="img-responsive" src="images/logo.png" id="top" style="display:inline-block;">
								</a><img alt="supporting" style="width:140px; padding-left:4px;padding-top:3px;display:inline-block;"  src="images/supporting-PCH-Logo_CMYK.jpg"/>
							</div>
							<div id="navbar" class="navbar-collapse collapse">
								<ul class="nav navbar-nav visible-xs">
									<li><a href="index.asp">Home</a>
									</li>
									<li><a <%if pagename = "About Us" then %> class="active" <%end if%> href="About-Us">About Us</a>
									</li>
									<li class="dropdown">
									        <a  class="dropdown-toggle" data-toggle="dropdown" href="Services">Services
									        <span class="caret"></span></a>
									        <ul class="dropdown-menu">
									          <li><a href="Computer-recycling"> Computer Recycling</a></li>
									          <li><a href="Electronics-recycling">Electronics Recycling</a></li>
											  <li><a href="Flat-Screen-TV-Recycling">Flat Screen TV Recycling</a></li>										      
									        </ul>
									 </li>
									<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="Products">Products 
										<span class="caret"></span></a>
									        <ul class="dropdown-menu">
											  <li><a href="Refurbished-Systems">Refurbished Systems</a></li> 
									         <li><a href="Refurbished-Laptops">Refurbished Laptops</a></li>
										    <li><a href="http://stores.ebay.com/allusedelectronics" target="_blank">Visit our Ebay Store</a></li>												          												          
									        </ul>
									</li>
									<li><a href="Contact">Contact Us</a>
									</li>
									<li><a href="http://www.r3ewaste.net" target="_blank">Blog</a>
									</li>									
								</ul>
                                <ul class="nav navbar-nav pull-right hidden-xs">
									<li><a href="index.asp">Home</a>
									</li>
									<li><a <%if pagename = "About Us" then %> class="active" <%end if%>  href="About-Us">About Us</a>
									</li>
									<li class="dropdown">
									        <a  class="dropdown-toggle" data-toggle="dropdown" href="Services">Services
									        <span class="caret"></span></a>
									        <ul class="dropdown-menu">
									          <li><a href="Computer-recycling"> Computer Recycling</a></li>
									          <li><a href="Electronics-recycling">Electronics Recycling</a></li>
											  <li><a href="Flat-Screen-TV-Recycling">Flat Screen TV Recycling</a></li>										      
									        </ul>
									 </li>
									<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="Products">Products 
										<span class="caret"></span></a>
									        <ul class="dropdown-menu">
											  <li><a href="Refurbished-Systems">Refurbished Systems</a></li> 
									         <li><a href="Refurbished-Laptops">Refurbished Laptops</a></li>
										    <li><a href="http://stores.ebay.com/allusedelectronics" target="_blank">Visit our Ebay Store</a></li>												          												          
									        </ul>
									</li>
									<li><a href="Contact">Contact Us</a>
									</li>
									<li><a href="http://www.r3ewaste.net" target="_blank">Blog</a>
									</li>									
								</ul>
							</div>
							<!--/.nav-collapse -->
						</div>
					</nav>
				</div>
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
                    <h2 class="aboutpage-title"><%=pagename%></h2>
                    <div class="aboutpage-content">
                        <%Response.Write pgcontent%>
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