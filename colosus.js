//if (window['mgtrn'] === undefined){window['mgtrn'] = function(){(window['mgtrn'].q = window['mgtrn'].q || []).push(arguments);};window['mgtrn'].d='https://staging.cuponation.de/bwa/mgtrnh';}else{( console.log('N/A:' + 'mgtrn'))};
if (window['mt'] === undefined){window['mt'] = function(){(window['mt'].q = window['mt'].q || []).push(arguments);};window['mt'].d='https://www.amazon.de';}else 
{( console.log('N/A:' + 'mt'))};

window['megatronObj'] = 'mt';

mt('set', 'enablePulse', true);
mt('set', 'platformID', 'megatron-rocks123');
mt('send', 'pageview');


//Megatron Scope is initialized in the snippet and megatron.name is assigned for global function name //var megatron = {};
window.megatron = window.megatron || {};
megatron.data = {};
megatron.methods = {};
megatron.utility = {};
megatron.constants = {
    set: 'set',
    send: 'send',
    not_set: 'not_set',
    globalFunctionNamePointer: 'megatronObj',
    imageName: 'megatron.png',
    nonInteraction: { // Needed for hits that should always be non-interaction
        nonInt : { 
            queryParam: 'ni',
            value: 1
        } 
    }
}


megatron.methods.createCustomerHash = function createCustomerHash() {
    return megatron.utility.createUniqueID() + megatron.utility.createUniqueID() + '-' + megatron.utility.createUniqueID() + '-' + megatron.utility.createUniqueID() + '-' + megatron.utility.createUniqueID() + '-' + Date.now();
}

/*TODO:DELETE 
megatron.methods.defibrillate = function defibrillate() {
    megatron.settings.isPulsating = true;
    console.log('focused');
}

megatron.methods.cardiacArrest = function cardiacArrest() {
    megatron.settings.isPulsating = false;
    console.log('blured');
}
megatron.methods.pulseChek = function pulseChek() {
    if (window.addEventListener) {
        window.addEventListener('focus', megatron.methods.defibrillate);
        window.addEventListener('blur', megatron.methods.cardiacArrest);

    }else if (window.attachEvent) {// IE9- and Opera 6- Support
        window.attachEvent('onfocus', megatron.methods.defibrillate);
        window.attachEvent('onblur', megatron.methods.cardiacArrest);
    }
}

*/
megatron.methods.checkVisibilitySupport = function checkVisibilitySupport() {
    var browserSupportKeys = {
            vs: "visibilityState",
            webkitVS: "webkitVisibilityState",
            mozVS: "mozVisibilityState",
            msVS: "msVisibilityState"
    };

    for (var key in browserSupportKeys) {
        if (browserSupportKeys[key] in document) {
            megatron.settings.visibilitySupportName = browserSupportKeys[key];
            return true;
        }
    }
    return false;    
}

megatron.methods.pulseCheck = function pulseChek() {
    if (document[megatron.settings.visibilitySupportName] === 'visible'){
        return true;
    } 
    return false;
}


//TODO:DELETE Check if global function name is defined.
megatron.methods.getNameIfExists = function getNameIfExists() {
    return (window[megatron.constants.globalFunctionNamePointer] === undefined) ? window[megatron.constants.globalFunctionNamePointer].toString() : false;
}

/* Transport determination*/
megatron.methods.determineTransportMethod = function determineTransportMethod() {
    
    /* //TODO_V2: Add user transport method preference check
    if (megatron.settings.transportMethod !== 'undefined' || megatron.settings.transportMethod !== 'beacon' || megatron.settings.transportMethod !== 'xhr' || megatron.settings.transportMethod !== 'beacon' ) {
        megatron.settings.transport(payload);
    }else {
        console.log("Megatron: Transport function not supported:" + megatron.settings.transportMethod + ". One of the default available function will be used.");
    }
    //END -- TODO_V2: Add user transport method preference check */

    if (navigator.sendBeacon) {
        transportMethod = 'beacon';
        return function transportMethod(payLoad) {
            console.log('--Sent Beacon--');
            
            var jsonPayload = JSON.stringify(JSON.parse('{"' + payLoad.substr(1).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}'));
            navigator.sendBeacon(megatron.settings.server, jsonPayload);

            /* Send payload as text
            navigator.sendBeacon(megatron.settings.server, payLoad);
            */
        }
    }
    
    if (window.XMLHttpRequest) {
        transportMethod = 'xhr';
        return function transportMethod(payLoad) {
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
    }

    transportMethod = 'img';
    return function transportMethod(payLoad) {
        console.log('--Sent IMG--');
        var mtPixel = document.createElement('img');
        mtPixel.src = megatron.settings.server + '/' + megatron.constants.imageName + payLoad;
        document.body.appendChild(mtPixel);
    }
    
}
/* END Transport determination */

/* Utility Methods*/
//TODO:DELETE Can be used for validation 
megatron.utility.checkValid = function checkValid(checkVal) {
    if(checkVal === undefined ) {
        return false;
    }
    return true;
}

// min 3 params
// last two key to check and value to check
// the priority is in the position of the arguments
megatron.utility.checkAndAssignElement = function checkAndAssignElement() {
    var args = Array.prototype.slice.call(arguments);
    if(args.length < 3) return false; // error etc;

    var value = args.pop();
    if(value === undefined) return false; // error etc;
    var key = args.pop();
    for(argument in args){
        if(args[argument].hasOwnProperty(key)) {
            args[argument][key] = value;
            return true;
        }
    }
    return false;// not found etc;
}

/* Generic method to get a datalayer value*/
megatron.utility.getDataLayerValue = function getDataLayerValue(fieldName) {
    if (typeof dataLayer !== undefined && dataLayer instanceof Array) {
        for(var i = 0; i < dataLayer.length; i++) {
            if (dataLayer[i][fieldName]) {
		        return dataLayer[i][fieldName];
            }
            return 'not_set';
        }
    }else {
        return 'not_set';
    }
}

megatron.utility.createUniqueID = function createUniqueID() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

/* END Utility Methods */

//intialize while loading. 
megatron.settings = {
    name: megatron.name, //Name of the tracker object. Not in V1 but in future, we might need it to add multiple different trackers on the page
    pulseRate: 15, //In seconds
    pulseLifeTime: 1200, //20 mins in seconds
    enablePulse: false,
    visibilitySupportName: false,
    cookieName: megatron.constants.customerHash, //Cookie name for customer hash. // TODO_V2: user can override the default cookie name for customer hash
    rawTime: new Date(),
    version: '1.0.0',
    dataSource: 'web',
    isCookieRefresh: 1,
    cookieExpires: 730, //TODO: set 2 years at least. //Only for override 
    transportMethod: 'beacon', // TODO_V2: user can override the default transport method
    transport: megatron.methods.determineTransportMethod(),
    server: 'not_set'
}

/* Send Functions */
//Prepare the payload for giving data object
megatron.methods.preparePayload = function preparePayload(payloadData) {
    var payloadString = '';
    for(var key in payloadData) {
        if (payloadData[key].value !== undefined && payloadData[key].value !== false && key !== 'toJSON') {
            //Encode and concatanate the query parameter and its value
            payloadString += payloadData[key].queryParam + '=' + encodeURIComponent(payloadData[key].value) + '&';
        } 
    }
   
    return payloadString;
}

//Execute the hit
megatron.sendHit = function sendHit() {
    var payload = '?';
        
    for(i=0; i<arguments.length; i++) {
        payload += megatron.methods.preparePayload(arguments[i]);
    }

    //add timestamp to the end of the payload
    payload += ('tsp=' + encodeURIComponent( Date.now()));

    //transport the payload
    megatron.settings.transport(payload);


    console.log("Hit send: " + payload);
}
/* ENDSend Functions */

/* Customer Hash Functions */
/*BEGIN Generic function to check whether a cpecific cookie exists */
megatron.utility.getCookie = function getCookie(cookieName) {
    cookieName += '=';
    //console.log("looking for:"+cookieName);
    
    //Get all cookies
    cookies = document.cookie.split(';');
    //Check if cookie exists
    for(var i=0; i<cookies.length; i++) {
        //console.log("current check:"+cookies[i]+cookies[i].indexOf(cookieName));
        if (cookies[i].indexOf(cookieName) >=0 ) {
            //console.log("match found:"+cookies[i]);
            return cookies[i].substring(cookies[i].indexOf('=')+1, cookies[i].length);
        }
    }
    return false;
}
/* END Generic function to check whether a cpecific cookie exists */

/* BEGIN Generic function to set a cookie value */
megatron.utility.setCookie = function setCookie(cName, cValue, expDays) {
    var d = new Date();
    d.setTime(d.getTime() + (expDays * 24 * 60 * 60 * 1000));
    var cExp = 'expires=' + d.toUTCString();
    document.cookie = cName + '=' + cValue + ';' + cExp + ';path=/';
}
/* END Generic function to set a cookie value */

/* Set or get and return Customer hash cookie */
megatron.methods.initCustomerHash = function initCustomerHash(chcName, chcDays, isUpdate) {

    var customerHash = megatron.utility.getCookie(chcName);

    if (customerHash === false) {
        //Invoke customer hash generator function
        producedCustomerHash = megatron.methods.createCustomerHash();

        //Set new customer hash
        megatron.utility.setCookie(chcName, producedCustomerHash, chcDays);
        return megatron.utility.getCookie(chcName);
    }
    
    if (isUpdate === 1) {
        //Change expiration date id customer hash exists
        existingCustomerHash = megatron.utility.getCookie(chcName);
        megatron.utility.setCookie(chcName, existingCustomerHash, chcDays);
        
        return customerHash;
    }
        
    //Return the existing customerHash
    return customerHash;
}


/* End customer hash functions */


//when there is set command, execute prepare core payload again
megatron.data.core = {
    protocolVersion: {
        queryParam: 'v',
        value: megatron.settings.version
    },
    platformID: {
        queryParam: 'cu',
        value: false //defined in snippet
    },
    customerHash: {
        queryParam: 'customerHash',
        value: megatron.constants.not_set
    },
    dataSource: {
        queryParam: 'ds',
        value: megatron.settings.dataSource  //'web', 'mobileapp', 'extension' or 'toolbar' otherwise throw "datasource not defined"
    },
    hitType: {//parse from url and allow to set???
        queryParam: 't',
        value: megatron.constants.not_set
    },
    location: {
        queryParam: 'dl',
        value: location.href //defined in snippet
    },
    userLanguage: {
        queryParam: 'ul',
        value:(function () {
            if (typeof navigator.language !== undefined || navigator.language !== '') {
                return navigator.language;
            }
            
            if (typeof navigator.browserLanguage !== undefined && navigator.browserLanguage !== '') {
                return navigator.browserLanguage;
            }
            
            return megatron.constants.not_set;
        }())
    },
    encoding: {
        queryParam: 'de',
        value: document.inputEncoding
    },
    title: {
        queryParam: 'dt',
        value: document.title
    },
    screenColors: {
        queryParam: 'sd',
        value: screen.colorDepth + '-bit'
    },
    screenResolution: {
        queryParam: 'sr',
        value: window.screen.width + 'x' + window.screen.height
    },
    viewportSize: {
        queryParam: 'vp',
        value: window.innerWidth + 'x' + window.innerHeight
    },
    cacheBuster: { //since we are sending the timestamp, this might not be needed
        queryParam: 'z',
        value: Math.floor(Math.random()*90000000) + 10000000
    },
    deviceCategory: {
        queryParam: 'dcat',
        value: megatron.utility.getDataLayerValue('webTheme')
    },
    pageType: {
        queryParam: 'pgt',
        value:megatron.utility.getDataLayerValue('pageType')
    },
    hostName: {
        queryParam: 'dh',
        value: false
    },
    pathName: {
        queryParam: 'dp',
        value: false
    },
    timeZoneUtcOffset: {
        queryParam: 'tzuo',
        value: megatron.settings.rawTime.getTimezoneOffset() //UTC Time zone offest in minutes
    },
    _ga: {//GA related ids are optional
        queryParam: 'gaid',
        value: megatron.utility.getCookie('_ga')
    },
    _gid: {
        queryParam: '_gid',
        value: megatron.utility.getCookie('_gid')
    },
    AMP_TOKEN: {
        queryParam: 'AMP_TOKEN',
        value: megatron.utility.getCookie('AMP_TOKEN')
    }
}

megatron.data.event ={
    eventCategory: {
        queryParam: 'ec',
        value: false
    },
    eventAction: {
        queryParam: 'ea',
        value: false
    },
    eventLabel: {
        queryParam: 'el',
        value: false
    },
    eventValue: {
        queryParam: 'ev',
        value: false
    }
}

// Values should be changed with 'set' command
megatron.data.options = {

    referrer: {//Send only when there is referrer value exists and different hostname
        queryParam: 'dr',
        value: (function() {
            if ((typeof document.referrer  !== undefined) && (document.referrer  !== '')) {//If there is referrer info
                //check if referrer is the same origin
                if (document.referrer.indexOf(location.host) > -1) {
                    return false;
                }
                return document.referrer;
            } else {
                return false;
            }
        }())
    },
    anonymizeIp: {
        queryParam: 'aip',
        value: false
    },
    queueTime: {
        queryParam: 'qt',
        value: false
    },
    gaID: {
        queryParam: 'gaid',
        value: false
    },
    sessionControl: {
        queryParam: 'gaid',
        value: false
    },
    userHash: {
        queryParam: 'uh',
        value: false
    },
    nonInteraction: {
        queryParam: 'ni',
        value: false
    },
    userIp: {//Only override
        queryParam: 'uip',
        value: false
    },
    userAgent: {//Only override
        queryParam: 'ua',
        value: false
    },
    geoLocation: {//Only override
        queryParam: 'geoid',
        value: false
    },
    campaignName: {//Will not be provided from url, only for override
        queryParam: 'cn',
        value: false
    },
    campaignTerm: {//Will not be provided from url, only for override
        queryParam: 'ct',
        value: false
    },
    campaignSource: {//Will not be provided from url, only for override
        queryParam: 'cs',
        value: false
    },
    campaignMedium: {//Will not be provided from url, only for override
        queryParam: 'cm',
        value: false
    },
    campaignContent: {//Will not be provided from url, only for override
        queryParam: 'cc',
        value: false
    },
    campaignKeyword: {//Will not be provided from url, only for override
        queryParam: 'ck',
        value: false
    },
    campaignId: {//Will not be provided from url, only for override
        queryParam: 'ci',
        value: false
    },
    gclid: {//Will not be provided from url, only for override
        queryParam: 'gclid',
        value: false
    },
    dcid: {//parse from url and allow to set???
        queryParam: 'dcid',
        value: false
    },
    testID: {
        queryParam: 'testID',
        value:false /*(function () {
            if (typeof TEST_ID !== "undefined" || TEST_ID !== "") {
                return TEST_ID;
            }else {
                return false;
            }
        }())*/
    },
    testVar: {
        queryParam: 'testVar',
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
megatron.data.perfomance = function perfomance() {
    if (window.performance.timing !== undefined) {
        var performanceData = {}
        for (var i in window.performance.timing) {
            if (i !== 'toJSON') {
                performanceData[i] = {
                    queryParam: i,
                    value: window.performance.timing[i],
                }
            }
        }
        return performanceData;
    }
    return false;
}


megatron.data.custom = { //TODO_V2
    /*
    queueTime: {
        queryParam: 'qt',
        value: false
    },


    customDimensions = [], //TODO_V2: Add custom dimensions
    cg2:customDimension[1], //only when it is set. implement option to send with single or all hits

    customMetrics = [], //TODO_V2: Add custom metrics
    cg2:customMetric[1], //only when it is set. implement option to send with single or all hits

    cg1:contentGroup[0], //only when it is set. implement option to send with single or all hits. Change the values with the option object
    contentGroup=[], //TODO_V2: Add content groups
    */

}




megatron.execCommand = function execCommand(args) {

    var argList = Array.prototype.slice.call(args);
    var hasOptions = false;
    var lastArg, command, param = '';


    if (argList[0] !== undefined) {
        command = argList[0];
    }else {
        console.log('Megatron: Undefined command' + argList);
        return undefined;
    }
    if (argList[1] !== undefined) {
        param = argList[1];
    } else {
        console.log('Megatron: Undefined command parameter for ' + argList);
        return undefined;
    }

    //Check id last argument is an object
    if (typeof lastArg === 'object' && lastArg.constructor === Object) {
        hasOptions = true;
        lastArg = argList[argList.length-1];
    }

    switch (command) {
        case 'send': {
            //In order to remove case sensitivity. Convert command parameters to lower case
            if (param === undefined) {
                console.log('Megatron: Command parameter is undefined');
                return undefined;
            }
            
                
            //Since we know param is defined, Check if it is supported and if yes, send the hit by providing necessary data objects
            switch (param) {
                case 'pageview': { //Data: Core + Options
                    //Define the hit type
                    megatron.data.core['hitType'].value = param;
                    //Check if options object contains proper commands and send the options only for this hit.
                    if (hasOptions) {
                        var overriddenOptions = Object.create(megatron.data.options);

                        for (var i in lastArg) {
                            if (overriddenOptions[i] !== undefined) {
                                overriddenOptions[i].value = lastArg[i];
                            }else {
                                console.log('Megatron: command option not supported:'+i);
                            }
                        }
                        //Send overridden options
                        megatron.sendHit(megatron.data.core, overriddenOptions);
                    }else {
                        //Send original 
                        megatron.sendHit(megatron.data.core, megatron.data.options );
                    }             
                    break;
                }
                case 'performance': {// Data: Core + Performance + nonInteraction
                    megatron.data.core['hitType'].value = param;
                    
                    //if performance is available, send necessary data
                    if (window.performance !== undefined) {
                        var performanceDataObj = megatron.data.perfomance();
                        // Performance hits has to be always non-interaction
                        megatron.sendHit(megatron.data.core, performanceDataObj, megatron.constants.nonInteraction);
                    }else {
                        console.log('Megatron: Performance measurement not supported');
                    }
                    break;
                }
                case 'event': {//Data: Core, Event, Options
                    megatron.data.core['hitType'].value = param;

                    if(argList[2] === undefined) {
                        console.log('Megatron: Event category is mandatory');
                        return undefined;
                    }

                    if (hasOptions) {//TODO: check parameters if there is any existing
                        var eventData = Object.create(megatron.data.event);
                        for(var i=2; i < argList.length-1; i++) { //Prepare event data from command parameters
                            //TODO: add condition to check if event parameter is valid
                            switch (i) {
                                case 2: { 
                                    eventData.eventCategory.value = argList[i];
                                    break;
                                }
                                case 3: { 
                                    eventData.eventAction.value = argList[i];
                                    break;
                                }
                                case 4: {
                                    eventData.eventLabel.value = argList[i];
                                    break;
                                }
                                case 5: {
                                    eventData.eventValue.value = argList[i];
                                    break;
                                }
                            }
                        }

                        var overriddenOptions = Object.create(megatron.data.options);

                        for (var i in lastArg) {
                            if (overriddenOptions[i] !== 'undefined') {
                                overriddenOptions[i].value = lastArg[i];
                            }else {
                                console.log('Megatron: command option not supported:'+i);
                            }
                        }
                        //Send overridden options
                        megatron.sendHit(megatron.data.core, overriddenOptions, eventData);
                    }else {
                        var eventData = Object.create(megatron.data.event);

                        if(argList[2] === undefined) {
                            console.log('Megatron: Event category is mandatory');
                            return undefined;
                        }

                        for(var i=2; i < argList.length; i++) { //Prepare event data from command parameters
                            switch (i) {
                                case 2: { 
                                    eventData.eventCategory.value = argList[i];
                                    break;
                                }
                                case 3: { 
                                    eventData.eventAction.value = argList[i];
                                    break;
                                }
                                case 4: {
                                    eventData.eventLabel.value = argList[i];
                                    break;
                                }
                                case 5: {
                                    eventData.eventValue.value = argList[i];
                                    break;
                                }
                            }
                        }
                        //Send original 
                        megatron.sendHit(megatron.data.core, megatron.data.options, eventData);
                    }          
                    break;
                }
                case 'pulse': {// Data: Core + Performance + non interaction
                    megatron.data.core['hitType'].value = param;
                    megatron.sendHit(megatron.data.core, megatron.constants.nonInteraction);
                    break;
                }
                case 'timing': {//TODOV2: Support timing hits. + non interaction
                    megatron.data.core['hitType'].value = param;
                    break;
                }
                case 'social': {//TODOV2: Support social hits.
                    megatron.data.core['hitType'].value = param;
                    break;
                }
                default: {
                    console.log('Megatron: Command: '+ param +' not supported');
                    break;
                }
            }
            break;
        }
        case 'set': {
            //TODO: Check if parameter exists in one of the megatron data objects. If yes change the val else ignore the command and return message
            if (typeof param === 'object' && param.constructor === Object) {

                for (var i in param) {// loop over user's object fields
                    
                    if (i === undefined) {
                        console.log('Megatron: command option not defined:' + i);
                        continue;
                    }
                    var dataCheck = megatron.utility.checkAndAssignElement(megatron.data.options, megatron.data.core, megatron.data.event, megatron.settings, i, param[i]);
                    if (!dataCheck) {
                        console.log('Megatron: command option not supported:' + i);
                    }
                }
                return;
            }
            if (param !== undefined) {

                var dataCheck = megatron.utility.checkAndAssignElement(megatron.data.options, megatron.data.core, megatron.data.event, megatron.settings, param, argList[2]);
                if (!dataCheck) {
                    console.log('Megatron: command option not supported:' + i);
                }
                return;
            }
            console.log('Megatron: set command needed' + argList);

            break;
        }
        case 'create': {
            //TODO: Check if parameter exists in one of the megatron data objects. If yes change the val else ignore the command and return message
            if (megatron.settings[param] !== undefined) {

                megatron.settings[param] = argList[2];
            } else {
                console.log('Megaron: parameter not supported ' + argList);
            }
            break;
        }
        default: {
            console.log('Megatron unsupported command:' + command);
            break;
        }
        
    }
}


/* Initialize Megarton! */
megatron.init = function init() {

    //Initialize customer hash cookie
    megatron.data.core['customerHash'].value = megatron.methods.initCustomerHash(megatron.settings.cookieName, megatron.settings.cookieExpires, megatron.settings.isCookieRefresh);
    if (window[megatron.constants.globalFunctionNamePointer] === undefined) {
        console.log('Megatron: ' + megatron.constants.globalFunctionNamePointer +' is not defined');
        return;
    }
    megatron.name = window[megatron.constants.globalFunctionNamePointer].toString();

    if (window[megatron.name].q !== undefined) { //Execute initial queued commands and reinitialize global megatron function
        megatron.settings.server = window[megatron.name].d;
        megatron.queue = window[megatron.name].q; //window[megatron.name].q = Array of arguments
        //iterate the command queue
        while (megatron.queue.length !== 0) {
            megatron.execCommand(megatron.queue[0]);
            megatron.queue.shift();
        }

        //Re-associate global queue command function to execute the command immediatley from now on
        window[megatron.name] = function mgtrnMain() {
            megatron.execCommand(arguments); 
        }

        //Send performance request on window loaded. TODO: Test if there is need for delay
        window.addEventListener('load', megatron.execCommand(['send','performance']));

        
        //Add Pulse if it is enabled and the browser supports the visibility state
        var checkVS = megatron.methods.checkVisibilitySupport();
        if (megatron.settings.enablePulse && checkVS) {
            //Add event listener for onfocus and onblur functions
            

            window[megatron.name].interval = setInterval(function() {
                // Pulse will work 20 minutes regargless of browser focus for the particular page.
                if ( ((Date.now() - megatron.settings.rawTime.getTime())/1000) < megatron.settings.pulseLifeTime) {
                    if (megatron.methods.pulseCheck() && megatron.settings.enablePulse) {
                        megatron.execCommand(['send','pulse']);
                    }
                } else {
                    clearInterval(window[megatron.name].interval);
                }
                
            }, (megatron.settings.pulseRate * 1000));
        }
    } else {
        console.log('Megatron: Queue is undefined');
    }
}


megatron.init();