
  
function onUpload(details) {
  try {
    // Check if the "originalSize" property exists in the raw request body data
    if (details.requestBody.raw[0]["originalSize"]) {

      // Log information about the upload, including the request ID and URL
      console.log(`details.requestId[${details.requestId},${details.url}]`);

      // Log the full request body data
      console.log(details.requestBody);

      // Log the "originalSize" property of the first item in the raw request body data
      console.log(details.requestBody.raw[0]["originalSize"]);
    }
    else {
      // Log information about the upload if the "originalSize" property does not exist
      console.info(details);
      return;
    }
  } catch (err) {
    // Log any errors that occur during the function execution
    console.error(err.name); 
    console.error(err.message); 
    console.error(err.stack); 
    console.error(err); 
  }
}
   
  

  function onDownaloaded(details) {
    try {
      // Check if the download is complete
      if (details.state === "complete") {
              // Log the filename, URL, and danger type of the download
        console.log("Download is complete");
        console.log(details.filename);
        console.log(details.url);
        console.log(details.danger);
        // Call the sendToSplunk function with the download details
          sendToSplunk(details.filename, details.danger,details.url, "File download detected");
        } else {
          console.log("Safe file type detected");
        }
    } catch (err) {
          // Log any errors that occur while processing the download
      console.error(err.name); 
      console.error(err.message); 
      console.error(err.stack); 
      console.error(err); 
    }
  }

  function onBeforeSendHeaders(details) {
    // try-catch block to handle any errors that may occur during the processing
    try {
      // Use forEach loop to iterate through the request headers
      details.requestHeaders.forEach(header => {
        // Check if the header name is 'Host' and its value is 'www.example.com'
        if (header.name.toLowerCase() === "host" && header.value === "www.example.com") {
          // Log a message in the console to indicate that a request to example.com has been detected
          console.log("Request to example.com detected");
          // Call the getCosaveToStorage function to save the cookie
          saveToStorage(details.url, "example_cookie").then(value => {
            // Log a message in the console to display the value of the cookie
            console.log(`Cookie value: ${value}`);
          });
        }
      });
    } catch (err) {
      // Log the error details in the console 
      console.error(err.name);
      console.error(err.message);
      console.error(err.stack);
      console.error(err);
    }
  }
 


try {
  function printAgentHeader(e) {
    // Destructure the properties "method" and "url" from the parameter "e"
    const { method, url } = e;
    // Check if the method is not "GET", "POST", or "PUT". If it's not, return.
    if (!['GET', 'POST', 'PUT'].includes(method)) return;

    // Initialize headerInfo object with the URL as the key and an empty object as the value
    let headerInfo = { [url]: {} };
    // Iterate over the headers in the requestHeaders property of the parameter "e"
    e.requestHeaders.forEach(header => {
      // Add the header name as a key and the header value as the value to the headerInfo object for the specified URL
      headerInfo[url][header.name] = header.value;
    });

    // Check if the method is "PUT" or "POST"
    if (method === 'PUT' || method === 'POST') {
      // Check if the Content-Length header is greater than 1000 or the Content-Type header is equal to "application/json"
      if (headerInfo[url]["Content-Length"] > 1000 || headerInfo[url]["Content-Type"] === 'application/json') {
        console.log("Header:");
        console.log(headerInfo[url]);
      }
    } else if (method === 'GET') {
      // Check if the Content-Type header is equal to "application/octet-stream"
      if (headerInfo[url]["Content-Type"] === 'application/octet-stream') {
        console.log("Header:");
        console.log(headerInfo[url]);
      }

      // Split the URL on "." and destructure the 6th item in the resulting array as fileExtension. If there is no 6th item, set fileExtension to an empty string
      const [, , , , , fileExtension = ""] = url.split(".");
      // Check if the file extension is in the list of extensions
      if (["jpg", "jpeg", "png", "pdf", "bmp", "svg", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip", "rar", "7z", "mp3", "mp4", "mkv", "flv", "avi", "mov", "wmv", "csv", "tsv", "xml", "json", "exe", "dmg", "vbs", "rtf", "vb"].includes(fileExtension)) {
        console.log("Download:", url, fileExtension);
        console.log(headerInfo[url]);
      }
    }
  }
} catch (err) {
  // Log the name, message, stack trace, and error object to the console if an error occurs
  console.error(err.name);
  console.error(err.message);
  console.error(err.stack);
  console.error(err);
}


// Function to save a cookie to the local storage
async function saveToStorage(url, cookieName) {
  try {
    // Get the cookie with the specified name from the specified URL
    let cookie = await browser.cookies.get({url, name: cookieName});
    if (cookie) {
      // If the cookie is found, save it to the local storage
      browser.storage.local.set({[cookieName]: cookie.value});
      console.log(`Cookie ${cookieName} saved: ${cookie.value}`);
    } else {
      // If the cookie is not found, log the message and return null
      console.log(`Cookie ${cookieName} not found`);
      return null;
    }
  } catch (error) {
    // If there is an error retrieving the cookie, log the error message and return null
    console.error(`Error retrieving cookie ${cookieName}: ${error}`);
    return null;
  }
}

// This function takes one argument:
// - `key` (string) - the key of the item to be retrieved from the local storage
async function retrieveLocalStorage(key) {
  // The `browser.storage.local.get` function is used to retrieve an item from the local storage
  let result = await browser.storage.local.get(key);
  // Check if the key exists in the local storage and return its value
  if (result.hasOwnProperty(key)) {
    return result[key];
  } else {
    return null;
  }
}


   async function sendToSplunk(filename, url, message) {
      // - `filename` (string) - the name of the file being uploaded
// - `url` (string) - the URL of the server the file is being uploaded to
// - `message` (string) - a message to be sent to Splunk
      try {
       // Retrieve the value of splunk_host and token from local storage
        let splunk_host = await retrieveLocalStorage("splunk_host");
        let token = await retrieveLocalStorage("token");
        // Construct the endpoint URL using the retrieved splunk_host value
        const endpoint = `https://${splunk_host}:8088/services/collector`;
    
        // Set up the data to send
        const payload = JSON.stringify({
          filename: filename,
          url: url,
          message: message
        });
    
        // Set up the request headers
        const headers = new Headers({
          "Content-Type": "application/json",
          "Authorization": `Splunk ${token}`
        });
    
        // Create the request
        const request = new Request(endpoint, {
          method: "POST",
          headers: headers,
          body: payload
        });
    
        // Send the request
        fetch(request)
          .then(response => {
            if (!response.ok) {
              throw new Error("Failed to send data to Splunk");
            }
          })
          .catch(error => {
            console.error(error.name);
            console.error(error.message);
            console.error(error.stack);
            console.error(error);
          });
      } catch (err) {
        console.error(err.name);
        console.error(err.message);
        console.error(err.stack);
        console.error(err);
      }
    }

// This function retrieves the value of a configuration specified by `configName` from the browser's runtime.
// It returns the value if it exists, or `null` if there is an error or if the value does not exist.
async function getConfigValue(configName) {
  try {
    // Get the manifest for the current runtime
    let manifest = await browser.runtime.getManifest();
    // Get the value of the specified configuration from the manifest
    let configValue = manifest.config[configName];
    // If the value exists, return it
    if (configValue) {
      return configValue;
    } else {
      // If the value does not exist, log an error and return null
      console.error(`Error: config value '${configName}' not found in manifest`);
      return null;
    }
  } catch (error) {
    // If there is an error retrieving the manifest or the value, log an error and return null
    console.error(`Error retrieving config value '${configName}': ${error}`);
    return null;
  }
}
  
// This object holds the URL pattern for all requests
const ALL_URL = { urls: ["<all_urls>"] };

// This object holds the URL pattern for specific requests to example.com
const GET_COOKIE = {
  urls: ["*://www.example.com/*"]
};

try {
  // Adds an event listener to modify headers before they are sent for requests to example.com
  browser.webRequest.onBeforeSendHeaders.addListener(
    onBeforeSendHeaders,
    GET_COOKIE,
    ["requestHeaders"]
  );

  // Adds an event listener to log headers of every request made
  browser.webRequest.onBeforeSendHeaders.addListener(
    printAgentHeader,
    ALL_URL,
    ["requestHeaders"]
  );

  // Adds an event listener to log the body of every request made
  browser.webRequest.onBeforeRequest.addListener(
    onUpload,
    FILTERS,
    ["requestBody"]
  );

  // Adds an event listener to log every download made
  browser.downloads.onCreated.addListener(onDownaloaded);

} catch (err) {
  // Logs name, message, stack trace, and full error object of the error
  console.error(err.name);
  console.error(err.message);
  console.error(err.stack);
  console.error(err);
}
