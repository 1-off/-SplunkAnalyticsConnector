## introduction 
 FirefoxInSight is an efficient and powerful addon for collecting analytics from the Firefox browser and sending it back to Splunk. Designed specifically for the Firefox Enterprise, this addon works seamlessly in the background, with no interface or user interaction required. Instead, it relies on policies to collect and transmit data, ensuring that your organization's analytics needs are met with ease and accuracy. 

## function descriptions
- onUpload - It checks if the raw request body data has the property "originalSize". If it exists, it logs information about the upload and the request body data. If the property does not exist, it logs information about the upload.
- onDownloaded - It checks if the download is complete, if so, it logs the filename, URL, and danger type of the download and calls the sendToSplunk function with the download details. If the download is not complete, it logs that a safe file type has been detected.
- onBeforeSendHeaders - It processes the request headers and checks if the header name is 'Host' and its value is 'www.example.com'. If this is true, it logs a message that a request to example.com has been detected and calls the saveToStorage function to save the cookie.
- printAgentHeader - It extracts the method and URL properties from the passed parameter and checks if the method is not "GET", "POST", or "PUT". If it is one of these methods, it creates a headerInfo object with the URL as the key and an empty object as the value. It then adds the header name as a key and header value as the value to the headerInfo object for the specified URL. It also checks if the method is "PUT" or "POST" and if the Content-Length header is greater than 1000 or the Content-Type header is equal to "application/json". If this is true, it logs the header information. If the method is "GET" and the Content-Type header is equal to "application/octet-stream", it logs the header information.
- saveToStorage: This function takes two arguments: url and cookieName. The function retrieves the cookie from the specified URL with the specified name using browser.cookies.get and saves the cookie's value to the local storage using browser.storage.local.set({[cookieName]: cookie.value}). This is necessary because cookies stored in the local storage persist even after the browser is closed, while cookies stored in the cookie store are deleted when the browser is closed.
- retrieveLocalStorage: This function takes one argument key and retrieves the item from the local storage with the specified key using browser.storage.local.get. It returns the value of the item if the key exists in the local storage, otherwise, it returns null.
- sendToSplunk: This function takes three arguments: filename, url, and message. The function retrieves splunk_host and token values from the local storage using retrieveLocalStorage and uses them to construct the endpoint URL for sending data to Splunk. The function then sets up the data (payload), headers, and request, and sends the request using the fetch method.
- getConfigValue: This function takes one argument configName and retrieves the value of the specified configuration from the browser's runtime using browser.runtime.getManifest. The function returns the value if it exists, otherwise, it returns null.
- ALL_URL: This object holds the URL pattern for all requests and is used to match all URLs.
- GET_COOKIE: This object holds the URL pattern for specific requests to example.com and is used to match specific URLs.
