export default function getDesignedEmail({
  title = "Verification",
  subtitle = "",
  greeting = "Hello,",
  message = "",
  otp = "",
  validity = "10 minutes",
  companyName = "Crystal Beauty Clear",
}) {
  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>

<body style="
margin:0;
padding:40px 20px;
background:#FFF1D3;
font-family:Arial,Helvetica,sans-serif;
">

<div style="
max-width:650px;
margin:auto;
background:#ffffff;
border-radius:18px;
overflow:hidden;
box-shadow:0 10px 35px rgba(0,0,0,.12);
">

<!-- Header -->

<div style="
background:#06202B;
padding:35px;
text-align:center;
">

<h1 style="
margin:0;
color:#ffffff;
font-size:30px;
font-weight:bold;
">
${companyName}
</h1>

<p style="
margin-top:10px;
font-size:16px;
color:#FFF1D3;
">
${subtitle}
</p>

</div>

<!-- Content -->

<div style="padding:45px;">

<h2 style="
margin-top:0;
color:#06202B;
">
${greeting}
</h2>

<p style="
font-size:16px;
line-height:1.8;
color:#555;
">
${message}
</p>

<div style="
background:#FFF1D3;
border:2px dashed #FF6A1C;
border-radius:15px;
padding:25px;
text-align:center;
margin:35px 0;
">

<div style="
font-size:42px;
font-weight:bold;
color:#FF6A1C;
letter-spacing:12px;
">
${otp}
</div>

</div>

<p style="
font-size:15px;
line-height:1.8;
color:#555;
">
This verification code is valid for
<strong style="color:#FF6A1C;">
${validity}
</strong>.
</p>

<p style="
font-size:15px;
line-height:1.8;
color:#555;
">
If you did not request this verification code, you can safely ignore this email.
No changes will be made to your account.
</p>

<p style="
margin-top:40px;
color:#555;
font-size:15px;
">
Regards,<br>
<strong>${companyName} Team</strong>
</p>

</div>

<!-- Footer -->

<div style="
background:#06202B;
padding:25px;
text-align:center;
">

<p style="
margin:0;
color:#FFF1D3;
font-size:13px;
">
© ${new Date().getFullYear()} ${companyName}
</p>

<p style="
margin-top:10px;
font-size:12px;
color:#cccccc;
">
Beauty • Confidence • Care
</p>

</div>

</div>

</body>
</html>
`;
}