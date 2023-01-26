
  const FILTERS = {urls: ["<all_urls>"]};

  function onUpload(details) {
    try{
       if (details.requestBody.raw[0]["originalSize"]) {

    console.log(`details.requestId[${details.requestId},${details.url}]`);
    // console.log(details.requestBody.formData);
    console.log(details.requestBody);
    console.log(details.requestBody.raw[0]["originalSize"]);
  }
        else{
        console.info(details);
      return;
    }
  } catch (err) {
    console.error(err.name); 
    console.error(err.message); 
    console.error(err.stack); 
    console.error(err); 
  }
   
  }

   function onDownaloaded(details){
  
    try{
      console.log(details.filename);
      console.log(details.url);
      console.log(details.danger);
    } catch (err) {
      console.error(err.name); 
      console.error(err.message); 
      console.error(err.stack); 
      console.error(err); 
    }
  }

  function printAgentHeader(e) {
    if(e.method == 'POST' || e.method == "GET"){
      try {
      let header_txt = ``;
      let header_info = {};
      header_info[e.url] = {};
      e.requestHeaders.forEach(function(header){
        header_txt+=`${header.name}: ${header.value}\n`;
        header_info[e.url][header.name] =header.value;
      });
      
      console.log(header_info);
      if(header_info[e.url]["Content-Length"] >1000){
        console.log("Header:")
        console.log(`${header_txt}`);
      }



    }
    catch (err) {
      console.error(err.name); 
      console.error(err.message); 
      console.error(err.stack); 
      console.error(err); 
    }
    }
  }


try{
// here we get the header of the request
browser.webRequest.onBeforeSendHeaders.addListener(
  printAgentHeader,
    {urls: ["<all_urls>"]},["requestHeaders"]
  );

// here the body of the request
browser.webRequest.onBeforeRequest.addListener(
  onUpload, FILTERS, ["requestBody"]);

browser.downloads.onCreated.addListener(onDownaloaded);

}
catch (err) {
  console.error(err.name); 
  console.error(err.message); 
  console.error(err.stack); 
  console.error(err); 
}


// browser.tabs.open({url: "file:///C:/Users/someuser/Desktop/addonFirefoxAnalytics/"}).then(() => {
//   browser.tabs.executeScript({
//     code: `console.log('location:', window.location.href);`
//   });
// });
