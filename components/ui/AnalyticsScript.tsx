import React from "react";

function AnalyticsScripts() {
  const analyticsScript = `
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-J7CLC5DTXF"></script>
<script>
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-J7CLC5DTXF');
</script>
  `;

  return <div dangerouslySetInnerHTML={{ __html: analyticsScript }} />;
}

export default AnalyticsScripts;
