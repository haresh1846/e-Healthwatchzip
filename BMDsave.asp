<!--#include file="connection.asp"-->
 
<%

guid = session("guid") 

if session("userid") = "" then
	Response.Redirect "bmdlogin.asp"
end if

if guid = "" then
	Response.Redirect "bmd.asp"
end if

dim userrs
set userrs = server.CreateObject("adodb.recordset")
userrs.Open "select * from bmdlogin where username = '" & session("userid")  & "'",con,3,3
if userrs.AbsolutePosition <> -1 then
	userrs.MoveLast
	userrs.MoveFirst 
end if 
	
if userrs.EOF = false then
	if cint(userrs("limitavailable")) = 0 then
		session("userid") = ""
		Response.Redirect "bmdlogin.asp?msg=You have exceeded your limit. Please contact the administrator."
	end if
else
	Response.Redirect "bmdlogin.asp?msg=Invalid user credentials. Please try again."
end if

name=request("Txt_name")
age=request("Txt_age")
height=request("Txt_height")
weight=request("Txt_weight")
hal=request("Txt_hal")
nsa=request("Txt_nsa")

con.execute "insert into bmd (name,age,height,weight,hal,nsa,guid) values ('" & name & "','" & age & "','" & height & "','" & weight & "','" & hal & "','" & nsa & "','" & guid & "')"
con.execute "update bmdlogin set limitavailable = limitavailable -1 where username = '" & session("userid") & "'"
Response.Redirect "result.asp"


%>
