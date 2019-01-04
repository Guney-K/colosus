
//if(window['mgtrn'] === undefined){window['mgtrn'] = function(){(window['mgtrn'].q = window['mgtrn'].q || []).push(arguments);};window['mgtrn'].d='https://staging.cuponation.de/bwa/mgtrnh';}else{( console.log('N/A:' + 'mgtrn'))};
if(window['mt'] === undefined){window['mt'] = function(){(window['mt'].q = window['mt'].q || []).push(arguments);};window['mt'].d='https://www.amazon.de';}else{( console.log('N/A:' + 'mt'))};

window.megatron = {};
megatron.data = {};
megatron.methods = {};
megatron.name = "mt";

mt('set','platformID','megatron-rocks123');
mt('send', 'pageview');



/* Generic method to get a datalayer value*/
megatron.methods.getDataLayerValue = function(fieldName){
    if (typeof dataLayer !== 'undefined' && dataLayer instanceof Array) {
        for(var i = 0; i < dataLayer.length; i++) {
            if (dataLayer[i][fieldName]) {
		        return dataLayer[i][fieldName];
            }else{
                return 'not_set';
            }
        }
    }else {
        return 'not_set';
    }
}

megatron.methods.createUniqueID = function(){
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
megatron.methods.createCustomerHash = function(){
    return megatron.methods.createUniqueID() + megatron.methods.createUniqueID() + '-' + megatron.methods.createUniqueID() + '-' + megatron.methods.createUniqueID() + '-' + megatron.methods.createUniqueID() + '-' + Date.now();
}




//Megatron Scope is initialized in the snippet and megatron.name is assigned for global function name //var megatron = {};


/* Transport determination*/
megatron.determineTransportMethod = function (){
    
    /* //TODO_V2: Add user transport method preference check
    if(megatron.settings.transportMethod !== 'undefined' || megatron.settings.transportMethod !== 'beacon' || megatron.settings.transportMethod !== 'xhr' || megatron.settings.transportMethod !== 'beacon' ){
        megatron.settings.transport(payload);
    }else{
        console.log("Megatron: Transport function not supported:" + megatron.settings.transportMethod + ". One of the default available function will be used.");
    }
    //END -- TODO_V2: Add user transport method preference check */

    if(navigator.sendBeacon){
        transportMethod = "beacon";
        return function(payLoad){
            console.log('--Sent Beacon--');
            
            var jsonPayload = JSON.stringify(JSON.parse('{"' + payLoad.substr(1).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}'));
            navigator.sendBeacon(megatron.settings.server, jsonPayload);

            /* Send payload as text
            navigator.sendBeacon(megatron.settings.server, payLoad);
            */
        }
    }else if(window.XMLHttpRequest){
        transportMethod = "xhr";
        return function(payLoad){
            var jsonPayload = JSON.parse('{"' + payLoad.substr(1).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
            var mtXHR = new XMLHttpRequest();
            mtXHR.open('POST', megatron.settings.server, true);//asyn POST request
            mtXHR.setRequestHeader('Content-Type', 'application/json;');
            mtXHR.send(JSON.stringify(jsonPayload));

            /* Send payload as text 
            console.log('--Sent XHR--');
            xhr = new XMLHttpRequest();
            xhr.open('POST', megatron.settings.server, false);
            xhr.send(payLoad);
            */
        }
    }else{
        transportMethod = "img";
        return function(payLoad){
            console.log('--Sent IMG--');
            var mtPixel = document.createElement("img");
            mtPixel.src = megatron.settings.server + "/megatron.png" + payLoad;
            document.body.appendChild(mtPixel);
        }
    }
}
/* END Transport determination */


//intialize while loading. 
megatron.settings ={
    'name': megatron.name, //Name of the tracker object. Not in V1 but in future, we might need it to add multiple different trackers on the page
    'pulseRate': 15, //In seconds
    'pulseLifeTime': 1200, //20 mins in seconds
    'isPulseEnabled': true,
    'cookieName':'customerHash', //Cookie name for customer hash. // TODO_V2: user can override the default cookie name for customer hash
    'rawTime': new Date(),
    'version': '1.0.0',
    'dataSource': 'not_set',
    'isCookieRefresh': 1,
    'cookieExpires': 730, //TODO: set 2 years at least. //Only for override 
    'transportMethod': 'beacon', // TODO_V2: suer can override the default transport method
    'transport': megatron.determineTransportMethod(),
    'server': 'not_set',
}




/* Send Functions */
//Prepare the payload
megatron.sendHit = function(){
    var payload = "?";
        
    for(i=0; i<arguments.length; i++){
        payload += megatron.preparePayload(arguments[i]);
    }

    //add timestamp to the end of the payload
    payload += ('tsp=' + encodeURIComponent( Date.now()));

    //transport the payload
    megatron.settings.transport(payload);


    console.log("Hit send: " + payload);
}

//Prepare the payload for giving data object
megatron.preparePayload = function(payloadData){
    var payloadString = "";
    for(var key in payloadData){
        if (payloadData[key].value !== undefined && payloadData[key].value !== false && key !== 'toJSON') {
            //Encode and concatanate the query parameter and its value
            payloadString += payloadData[key].queryParam + "=" + encodeURIComponent(payloadData[key].value) + "&";
        } 
    }
   
    return payloadString;
}
/* ENDSend Functions */

/* Customer Hash Functions */
/*BEGIN Generic function to check whether a cpecific cookie exists */
megatron.getCookie = function(cookieName){
    cookieName += "=";
    //console.log("looking for:"+cookieName);
    
    //Get all cookies
    cookies = document.cookie.split(';');
    //Check if cookie exists
    for(var i=0; i<cookies.length; i++){
        //console.log("current check:"+cookies[i]+cookies[i].indexOf(cookieName));
        if (cookies[i].indexOf(cookieName) >=0 ) {
            //console.log("match found:"+cookies[i]);
            return cookies[i].substring(cookies[i].indexOf("=")+1, cookies[i].length);
        }
    }
    return false;
}
/* END Generic function to check whether a cpecific cookie exists */

/* BEGIN Generic function to set a cookie value */
megatron.setCookie = function(cName, cValue, expDays) {
    var d = new Date();
    d.setTime(d.getTime() + (expDays * 24 * 60 * 60 * 1000));
    var cExp = "expires=" + d.toUTCString();
    document.cookie = cName + "=" + cValue + ";" + cExp + ";path=/";
}
/* END Generic function to set a cookie value */

/* Set or get and return Customer hash cookie */
megatron.initCustomerHash = function (chcName, chcDays, isUpdate){

    var customerHash = megatron.getCookie(chcName);

    if (customerHash === false) {
        //Invoke customer hash generator function
        producedCustomerHash = megatron.methods.createCustomerHash();

        //Set new customer hash
        megatron.setCookie(chcName, producedCustomerHash, chcDays);
        return megatron.getCookie(chcName);

    } else if (isUpdate === 1) {
        //Change expiration date id customer hash exists
        existingCustomerHash = megatron.getCookie(chcName);
        megatron.setCookie(chcName, existingCustomerHash, chcDays);
        
        return customerHash;
    }else{
        
        //Return the existing customerHash
        return customerHash;
    }
}


/* End customer hash functions */


//when there is set command, execute prepare core payload again
megatron.data.core = {
    'protocolVersion':{
        queryParam: 'v',
        value: megatron.settings.version
    },
    
    'platformID':{
        queryParam:'cu',
        value: false //defined in snippet
    },

    'customerHash':{
        queryParam:'customerHash',
        value: 'not_set'
    },

    'dataSource':{
        queryParam:'ds',
        value: megatron.settings.dataSource  //'web', 'mobileapp', 'extension' or 'toolbar' otherwise throw "datasource not defined"
    },
    'hitType':{//parse from url and allow to set???
        queryParam:'t',
        value: 'not_set'
    },

    'location':{
        queryParam:'dl',
        value: location.href //defined in snippet
    },

    'userLanguage':{
        queryParam:'ul',
        value:(function () {
            if (typeof navigator.language !== "undefined" || navigator.language !== "") {
                return navigator.language;
            } else if (typeof navigator.browserLanguage !== "undefined" || navigator.browserLanguage !== "") {
                return navigator.browserLanguage;
            } else {
                return 'not_set';
            }
        }())
    },

    'encoding':{
        queryParam:'de',
        value: document.inputEncoding
    },
    
    'title':{
        queryParam:'dt',
        value: document.title
    },
    
    'screenColors':{
        queryParam:'sd',
        value: screen.colorDepth + "-bit"
    },

    'screenResolution':{
        queryParam:'sr',
        value: window.screen.width + "x" + window.screen.height
    },

    'viewportSize':{
        queryParam:'vp',
        value: window.innerWidth + "x" + window.innerHeight
    },

    'cacheBuster':{ //since we are sending the timestamp, this might not be needed
        queryParam:'z',
        value: Math.floor(Math.random()*90000000) + 10000000
    },

    'deviceCategory':{
        queryParam:'dcat',
        value: megatron.methods.getDataLayerValue('webTheme')
    },

    'pageType':{
        queryParam:'pgt',
        value:megatron.methods.getDataLayerValue('pageType')
    },

    'hostName':{
        queryParam:'dh',
        value: false
    },
    'pathName':{
        queryParam:'dp',
        value: false
    },

    'timeZoneUtcOffet':{
        queryParam:'tzuo',
        value: megatron.settings.rawTime.getTimezoneOffset() //UTC Time zone offest in minutes
    },

    //GA related ids are optional
    '_ga':{
        queryParam:'gaid',
        value: megatron.getCookie('_ga')
    },

    '_gid':{
        queryParam:'_gid',
        value: megatron.getCookie('_gid')
    },

    'AMP_TOKEN':{
        queryParam:'AMP_TOKEN',
        value: megatron.getCookie('AMP_TOKEN')
    }

}

megatron.data.event ={
    'eventCategory':{
        queryParam:'ec',
        value: false
    },

    'eventAction':{
        queryParam:'ea',
        value: false
    },

    'eventLabel':{
        queryParam:'el',
        value: false
    },

    'eventValue':{
        queryParam:'ev',
        value: false
    }
}



// Values should be changed with 'set' command
megatron.data.options={

    'referrer':{//Send only when there is referrer value exists and different hostname
        queryParam:'dr',
        value: (function () {
            if ((typeof document.referrer  !== "undefined") && (document.referrer  !== "")) {//If there is referrer info
                //check if referrer is the same origin
                if (document.referrer.indexOf(location.host) > -1) {
                    return false;
                } else {
                    return document.referrer;
                }
            } else {
                return false;
            }
        }())
    },

    'anonymizeIp':{
        queryParam:'aip',
        value: false
    },
    'queueTime':{
        queryParam:'qt',
        value: false
    },

    'gaID':{
        queryParam:'gaid',
        value: false
    },

    'sessionControl':{
        queryParam:'gaid',
        value: false
    },

    'userHash':{
        queryParam:'uh',
        value: false
    },
    'nonInteraction':{
        queryParam:'ni',
        value: false
    },
    'userIp':{//Only override
        queryParam:'uip',
        value: false
    },
    'userAgent':{//Only override
        queryParam:'ua',
        value: false
    },
    'geoLocation':{//Only override
        queryParam:'geoid',
        value: false
    },
    'campaignName':{//Will not be provided from url, only for override
        queryParam:'cn',
        value: false
    },
    'campaignTerm':{//Will not be provided from url, only for override
        queryParam:'ct',
        value: false
    },
    'campaignSource':{//Will not be provided from url, only for override
        queryParam:'cs',
        value: false
    },
    'campaignMedium':{//Will not be provided from url, only for override
        queryParam:'cm',
        value: false
    },
    'campaignContent':{//Will not be provided from url, only for override
        queryParam:'cc',
        value: false
    },
    'campaignKeyword':{//Will not be provided from url, only for override
        queryParam:'ck',
        value: false
    },
    'campaignId':{//Will not be provided from url, only for override
        queryParam:'ci',
        value: false
    },
    'gclid':{//Will not be provided from url, only for override
        queryParam:'gclid',
        value: false
    },
    'dcid':{//parse from url and allow to set???
        queryParam:'dcid',
        value: false
    },
    'testID':{
        queryParam:'testID',
        value:false /*(function () {
            if (typeof TEST_ID !== "undefined" || TEST_ID !== "") {
                return TEST_ID;
            }else {
                return false;
            }
        }())*/
    },
    'testVar':{
        queryParam:'testVar',
        value:false /*(function () {
            if (typeof TEST_VAR !== "undefined" || TEST_VAR !== "") {
                return TEST_VAR;
            }else {
                return false;
            }
        }())*/
    },
    

}

//Prepare performance data object after checking if the perfomance data exists
megatron.data.perfomance = function(){
    if (window.performance.timing !== 'undefined') {
        var performanceData = {}
        for (var i in window.performance.timing) {
            if(i !== 'toJSON'){
                performanceData[i] = {
                    queryParam: i,
                    value: window.performance.timing[i],
                }
            }
        }
        return performanceData;
    } else {
        return false;
    }
}

/*
megatron.customData = { //TODO_V2

    customDimensions = [], //TODO_V2: Add custom dimensions
    cg2:customDimension[1], //only when it is set. implement option to send with single or all hits

    customMetrics = [], //TODO_V2: Add custom metrics
    cg2:customMetric[1], //only when it is set. implement option to send with single or all hits

    cg1:contentGroup[0], //only when it is set. implement option to send with single or all hits. Change the values with the option object
    contentGroup=[], //TODO_V2: Add content groups

}

*/


megatron.execCommand = function (args){

    var argList = [];
    var hasOptions = false;
    var lastArg, command, param = "";


    for(var i = 0; i < args.length; i++){
        argList.push(args[i]);
    }

    if(argList[0] !== 'undefined' ){
        command = argList[0];
    }else{
        console.log('Megatron: Undefined command' + argList);
        return undefined;
    }
    if(argList[1] !== 'undefined'){
        param = argList[1];
    }else{
        console.log('Megatron: Undefined command parameter' + argList);
        return undefined;
    }

    //Check id last argument is an object
    if (typeof lastArg === 'object' && lastArg.constructor === Object) {
        hasOptions = true;
        lastArg = argList[argList.length-1];
    } 

    if(command === "send"){
        //In order to remove case sensitivity. Convert command parameters to lower case
        param = param.toLowerCase();
            
        //Since we know param is defined, Check if it is supported and if yes, send the hit by providing necessary data objects
        switch (param)
        {
            case 'pageview': //Data: Core + Options
                //Define the hit type
                megatron.data.core['hitType'].value = param;
                //Check if options object contains proper commands and send the options only for this hit.
                if (hasOptions) {
                    var overriddenOptions = Object.create(megatron.data.options);

                    for (var i in lastArg) {
                        if(overriddenOptions[i] !== 'undefined'){
                            overriddenOptions[i].value = lastArg[i];
                        }else{
                            console.log("Megatron: command option not supported:"+i);
                        }
                    }
                    //Send overridden options
                    megatron.sendHit(megatron.data.core, overriddenOptions);
                }else{
                    //Send original 
                    megatron.sendHit(megatron.data.core, megatron.data.options );
                }             
                break;

            case 'performance': // Data: Core + Performance + nonInteraction
                megatron.data.core['hitType'].value = param;
                var nonIntData = { // Performance hits has to be always non-interaction
                    nonInt:{ 
                        queryParam: 'ni',
                        value: 1
                    } 
                }
                //if performance is available, send necessary data
                if(window.performance !== 'undefined'){
                    var performanceDataObj = megatron.data.perfomance();
                    megatron.sendHit(megatron.data.core, performanceDataObj, nonIntData);
                }else{
                    console.log("Megatron: Performance measurement not supported");
                }
                break;

            case 'event': //Data: Core, Event, Options
                megatron.data.core['hitType'].value = param;

                if(hasOptions) {//TODO: check parameters if there is any existing
                    var eventData = Object.create(megatron.data.event);
                    for(i=2; i < argList.length-1; i++){ //Prepare event data from command parameters
                        //TODO: add condition to check if event parameter is valid
                        if(i ==2){
                            eventData.eventCategory.value = argList[i];
                        }else if (i == 3) {
                            eventData.eventAction.value = argList[i];
                        }else if (i == 4) {
                            eventData.eventLabel.value = argList[i];
                        }else if (i == 5) {
                            eventData.eventValue.value = argList[i];
                        }
                    }

                    var overriddenOptions = Object.create(megatron.data.options);

                    for (var i in lastArg) {
                        if(overriddenOptions[i] !== 'undefined'){
                            overriddenOptions[i].value = lastArg[i];
                        }else{
                            console.log("Megatron: command option not supported:"+i);
                        }
                    }
                    //Send overridden options
                    megatron.sendHit(megatron.data.core, overriddenOptions, eventData);
                }else{
                    var eventData = Object.create(megatron.data.event);
                    for(i=2; i < argList.length-1; i++){ //Prepare event data from command parameters
                        //TODO: add condition to check if event parameter is valid
                        if(i == 2){
                            eventData.eventCategory.value = argList[i];
                        }else if (i == 3) {
                            eventData.eventAction.value = argList[i];
                        }else if (i == 4) {
                            eventData.eventLabel.value = argList[i];
                        }else if (i == 5) {
                            eventData.eventValue.value = argList[i];
                        }
                    }
                    //Send original 
                    megatron.sendHit(megatron.data.core, megatron.data.options, eventData);
                }          
                break;

            case 'pulse':// Data: Core + Performance + non interaction
                var nonIntData = { // Pulse hits has to be always non-interaction
                    nonInt:{ 
                        queryParam: 'ni',
                        value: 1
                    } 
                }
                megatron.data.core['hitType'].value = param;
                megatron.sendHit(megatron.data.core, nonIntData);
                break;

            case 'timing': //TODOV2: Support timing hits. + non interaction
            var nonIntData = { // timing hits has to be always non-interaction
                nonInt:{ 
                    queryParam: 'ni',
                    value: 1
                } 
            }
                megatron.data.core['hitType'].value = param;
                break;

            case 'social'://TODOV2: Support social hits.
                megatron.data.core['hitType'].value = param;
                break;

            default:
                console.log('Megatron: Command: '+ param +' not supported');
                break;
        }

    }else if (command ==='set') {
        
        //TODO: Check if parameter exists in one of the megatron data objects. If yes change the val else ignore the command and return message
        if (typeof param === 'object' && param.constructor === Object) {
            for (var i in param) {// loop over user's object fields

                if(i !== 'undefined'){
                    if (megatron.data.options[i] !== undefined) {
                        megatron.data.options[i].value = param[i];
                    } else if (megatron.data.core[i] !== undefined) {
                        megatron.data.core[i].value = param[i];
                    } else if (megatron.data.event[i] !== undefined) {
                        megatron.data.event[i].value = param[i];
                    } else if (megatron.data.event[i] !== undefined) {
                        megatron.settings[i] = param[i];
                    } else{
                        console.log("Megatron: command option not supported:" + i);
                    }
                }else{
                    console.log("Megatron: command option not defined:" + i);
                }
            }
        } else if(param !=='undefined'){

            if (megatron.data.options[param] !== undefined) {
                megatron.data.options[param].value = argList[2];
            } else if (megatron.data.core[param] !== undefined) {
                megatron.data.core[param].value = argList[2];
            } else if (megatron.data.event[param] !== undefined) {
                megatron.data.event[param].value = argList[2];
            } else if (megatron.settings[param] !== undefined) {
                megatron.settings[param] = argList[2];
            } else{
                console.log("Megatron: parameter not supported:" + argList);
            }
        }else{
            console.log('Megatron: set command needed', argList);
        }

    }else if (command ==='create') {
        
        //TODO: Check if parameter exists in one of the megatron data objects. If yes change the val else ignore the command and return message
        if (megatron.settings[param] !== 'undefined') {

            megatron.settings[param] = argList[2];
        } else {
            console.log('Megaron: parameter not supported ' + argList);
        }

    }else{
        console.log("Megatron unsupported command:" + command);
    }
}


/* Initialize Megarton! */
megatron.init = function(){

    //Initialize customer hash cookie
    megatron.data.core['customerHash'].value = megatron.initCustomerHash(megatron.settings.cookieName, megatron.settings.cookieExpires, megatron.settings.isCookieRefresh);

    if (window[megatron.name].q !== 'undefined') { //Execute initial queued commands and reinitialize global megatron function
        megatron.settings.server = window[megatron.name].d;
        megatron.queue = window[megatron.name].q; //window[megatron.name].q = Array of arguments
        //iterate the command queue
        while (megatron.queue.length !== 0) {
            megatron.execCommand(megatron.queue[0]);
            megatron.queue.shift();
        }

        //Re-associate global queue command function to execute the command immediatley from now on
        window[megatron.name] = function(){
            megatron.execCommand(arguments); 
        }

        //Send performance request on window loaded
        window.addEventListener("load", megatron.execCommand(['send','performance']));

        //Add Pulse if it is enabled
        if(megatron.settings.isPulseEnabled){
            window[megatron.name].interval = setInterval(function(){
                // Pulse will work 20 minutes regargless of browser focus for the particular page.
                if ( ((Date.now() - megatron.settings.rawTime.getTime())/1000) < megatron.settings.pulseLifeTime) {
                    megatron.execCommand(['send','pulse']);
                } else {
                    clearInterval(window[megatron.name].interval);
                }
                
            }, (megatron.settings.pulseRate * 1000));
        }
    } else {
        console.log("Megatron:Queue is undefined");
    }
}


megatron.init();