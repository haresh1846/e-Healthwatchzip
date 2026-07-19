<html>
<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
<meta content="utf-8" http-equiv="encoding">

<%
 Response.Buffer = True
UserIPAddress = Request.ServerVariables("HTTP_X_FORWARDED_FOR")
If UserIPAddress = "" Then
UserIPAddress = Request.ServerVariables("REMOTE_ADDR")
End If
Response.Write UserIPAddress


%>
</html>