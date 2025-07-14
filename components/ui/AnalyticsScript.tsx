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
<!-- Google tag (gtag.js) 2 by Kim -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17153752138"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-17153752138');
</script>
  `;

  return <div dangerouslySetInnerHTML={{ __html: analyticsScript }} />;
}

export default AnalyticsScripts;
