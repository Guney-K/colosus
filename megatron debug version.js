//Megatron Scope is initialized in the snippet and megatron.name is assigned for global function name //var megatron = {};
window.megatron = window.megatron || {};
megatron.data = {};
megatron.methods = {};
megatron.utility = {};
megatron.constants = {
    commandSet: 'set',
    commandSend: 'send',
    commandCreate: 'create',
    hitType: {
        pageview: 'pageview',
        performance: 'performance',
        pulse: 'pulse',
        event: 'event',
        timing: 'timing',
        social: 'social'
    },
    defaultDataSource: 'web',
    not_set: 'not_set',
    globalFunctionNamePointer: 'megatronObj',
    imageName: 'megatron.png',
    beacon: 'beacon',
    xhr: 'xhr',
    img: 'img',
    nonInteraction: { // Needed for hits that should always be non-interaction
        nonInt : { 
            queryParam: 'ni',
            value: 1
        } 
    },
    cacheBuster: { //since we are sending the timestamp, this might not be needed
        queryParam: 'z'
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
        return function transportMethod(payLoad) {
            console.log('--Sent Beacon--');
            
            var destinationURL = megatron.settings.server + '?' + megatron.constants.cacheBuster.queryParam + '=' + megatron.utility.getRandomNumber();
            var jsonPayload = JSON.stringify(JSON.parse('{"' + payLoad.substr(1).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}'));
            navigator.sendBeacon(destinationURL, jsonPayload);

            /* Send payload as text
            navigator.sendBeacon(megatron.settings.server, payLoad);
            */
        }
    }
    
    if (window.XMLHttpRequest) {

        return function transportMethod(payLoad) {
            var destinationURL = megatron.settings.server + '?' + megatron.constants.cacheBuster.queryParam + '=' + megatron.utility.getRandomNumber();
            var jsonPayload = JSON.parse('{"' + payLoad.substr(1).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
            var mtXHR = new XMLHttpRequest();
            mtXHR.open('POST', destinationURL, true);//asyn POST request
            mtXHR.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
            mtXHR.send(JSON.stringify(jsonPayload));

            /* Send payload as text 
            console.log('--Sent XHR--');
            xhr = new XMLHttpRequest();
            xhr.open('POST', megatron.settings.server, false);
            xhr.send(payLoad);
            */
        }
    }

    return function transportMethod(payLoad) {
        console.log('--Sent IMG--');
        var mtPixel = document.createElement('img');
        mtPixel.src = megatron.settings.server + '/' + megatron.constants.imageName + payLoad + '&' + megatron.constants.cacheBuster.queryParam + '=' + megatron.utility.getRandomNumber();
        document.body.appendChild(mtPixel);
    }
    
}
/* END Transport determination */

megatron.methods.initPostQueueAll = function initPostQueueAll() {
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
}


/* Utility Methods*/
//TODO:DELETE Can be used for validation 
megatron.utility.cloneObj = function cloneObj(targetObj) {
    return JSON.parse( JSON.stringify(targetObj) );
}

megatron.utility.getRandomNumber = function getRandomNumber() {
    return (Math.floor(Math.random()*90000000) + 10000000);
}

// min 3 params
// last two key to check and value to check
// the priority is in the position of the arguments
megatron.utility.checkAndAssignElement = function checkAndAssignElement() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length < 3) return false; // error etc;

    var value = args.pop();
    if (value === undefined) {
        console.log('Megatron: set value is undefined');
        return false; // error etc;
    }
    var key = args.pop();
    for (argument in args) {
        if (args[argument].hasOwnProperty(key)) {
            console.log(argument);
            if (args[argument][key].hasOwnProperty('value')){
                args[argument][key].value = value;
                return true;
            }
            args[argument][key] = value;
            return true;
        }
    }
    console.log('Megatron: set parameter does not exist');
    return false;// not found etc;
}

/* Generic method to get a datalayer value*/
megatron.utility.getDataLayerValue = function getDataLayerValue(fieldName) {
    if (typeof dataLayer !== undefined && dataLayer instanceof Array) {
        for(var i = 0; i < dataLayer.length; i++) {
            if (dataLayer[i][fieldName]) {
		        return dataLayer[i][fieldName];
            }
            return megatron.constants.not_set;
        }
    }else {
        return megatron.constants.not_set;
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
    cookieName2: 'customerHash2',
    rawTime: new Date(),
    version: '1.0.0',
    dataSource: megatron.constants.defaultDataSource,
    isCookieRefresh: 1,
    cookieExpires: 730, //TODO: set 2 years at least. //Only for override 
    transportMethod: 'beacon', // TODO_V2: user can override the default transport method
    transport: megatron.methods.determineTransportMethod(),
    server: megatron.constants.not_set
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
        queryParam: 'protocolVersion',
        value: megatron.settings.version
    },
    platformID: {
        queryParam: 'platformID',
        value: false //defined in snippet
    },
    customerHash: {
        queryParam: 'customerHash',
        value: megatron.constants.not_set
    },
    customerHash2: {
        queryParam: 'customerHash2',
        value: megatron.constants.not_set
    },
    dataSource: {
        queryParam: 'dataSource',
        value: megatron.settings.dataSource  //'web', 'mobileapp', 'extension' or 'toolbar' otherwise throw "datasource not defined"
    },
    hitType: {//parse from url and allow to set???
        queryParam: 'hitType',
        value: megatron.constants.not_set
    },
    location: {
        queryParam: 'location',
        value: location.href //defined in snippet
    },
    userLanguage: {
        queryParam: 'userLanguage',
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
        queryParam: 'encoding',
        value: document.inputEncoding
    },
    title: {
        queryParam: 'title',
        value: document.title
    },
    screenColors: {
        queryParam: 'screenColors',
        value: screen.colorDepth + '-bit'
    },
    screenResolution: {
        queryParam: 'screenResolution',
        value: window.screen.width + 'x' + window.screen.height
    },
    viewportSize: {
        queryParam: 'viewportSize',
        value: window.innerWidth + 'x' + window.innerHeight
    },
    deviceCategory: {
        queryParam: 'deviceCategory',
        value: megatron.utility.getDataLayerValue('webTheme')
    },
    pageType: {
        queryParam: 'pageType',
        value:megatron.utility.getDataLayerValue('pageType')
    },
    hostName: {
        queryParam: 'hostName',
        value: false
    },
    pathName: {
        queryParam: 'pathName',
        value: false
    },
    timeZoneUtcOffset: {
        queryParam: 'timeZoneUtcOffset',
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

megatron.data.event = {
    eventCategory: {
        queryParam: 'eventCategory',
        value: false
    },
    eventAction: {
        queryParam: 'eventAction',
        value: false
    },
    eventLabel: {
        queryParam: 'eventLabel',
        value: false
    },
    eventValue: {
        queryParam: 'eventValue',
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
        queryParam: 'anonymizeIp',
        value: false
    },
    queueTime: {
        queryParam: 'queueTime',
        value: false
    },
    gaID: {
        queryParam: 'gaid',
        value: false
    },
    sessionControl: {
        queryParam: 'sessionControl',
        value: false
    },
    userHash: {
        queryParam: 'userHash',
        value: false
    },
    nonInteraction: {
        queryParam: 'nonInteraction',
        value: false
    },
    userIp: {//Only override
        queryParam: 'userIp',
        value: false
    },
    userAgent: {//Only override
        queryParam: 'userAgent',
        value: false
    },
    geoLocation: {//Only override
        queryParam: 'geoLocation',
        value: false
    },
    campaignName: {//Will not be provided from url, only for override
        queryParam: 'campaignName',
        value: false
    },
    campaignTerm: {//Will not be provided from url, only for override
        queryParam: 'campaignTerm',
        value: false
    },
    campaignSource: {//Will not be provided from url, only for override
        queryParam: 'campaignSource',
        value: false
    },
    campaignMedium: {//Will not be provided from url, only for override
        queryParam: 'campaignMedium',
        value: false
    },
    campaignContent: {//Will not be provided from url, only for override
        queryParam: 'campaignContent',
        value: false
    },
    campaignKeyword: {//Will not be provided from url, only for override
        queryParam: 'campaignKeyword',
        value: false
    },
    campaignId: {//Will not be provided from url, only for override
        queryParam: 'campaignId',
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
                performanceData[i] = {
                    queryParam: i,
                    value: window.performance.timing[i],
                }
            }
        }
        return performanceData;
    }
    return false;
}


megatron.data.custom = { //TODO_V2: this should support unlimited custom dimensions
    /*
    protocolVersion: {
        queryParam: 'cd',
        value: megatron.settings.version
    },
    
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
    var lastArg = argList[argList.length-1];
    var command, param = '';


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
        case megatron.constants.commandSend: {
            //In order to remove case sensitivity. Convert command parameters to lower case
            if (param === undefined) {
                console.log('Megatron: Command parameter is undefined');
                return undefined;
            }
            
                
            //Since we know param is defined, Check if it is supported and if yes, send the hit by providing necessary data objects
            switch (param) {
                case megatron.constants.hitType.pageview: { //Data: Core + Options
                    //Define the hit type
                    megatron.data.core['hitType'].value = param;
                    //Check if options object contains proper commands and send the options only for this hit.
                    if (hasOptions) {
                        var overriddenOptions = megatron.utility.cloneObj(megatron.data.options);
                        //var overriddenOptions = Object.create(megatron.data.options);

                        for (var i in lastArg) {
                            if (overriddenOptions[i] !== undefined && overriddenOptions.hasOwnProperty(i)) {
                                overriddenOptions[i].value = lastArg[i];
                            }else {
                                console.log('Megatron: Options paramater not supported and ignored ' + i);
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
                case megatron.constants.hitType.performance: {// Data: Core + Performance + nonInteraction
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
                case megatron.constants.hitType.event: {//Data: Core, Event, Options
                    megatron.data.core['hitType'].value = param;

                    if(argList[2] === undefined) {
                        console.log('Megatron: Event category is mandatory');
                        return undefined;
                    }

                    if (hasOptions) {//TODO: check parameters if there is any existing
                        var eventData = megatron.utility.cloneObj(megatron.data.event);
                        
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

                        var overriddenOptions = megatron.utility.cloneObj(megatron.data.options);


                        for (var i in lastArg) {
                            if  (eventData[i] !== undefined && eventData.hasOwnProperty(i)){
                                eventData[i].value = lastArg[i];
                                continue;
                            }
                            if (overriddenOptions[i] !== 'undefined' && overriddenOptions.hasOwnProperty(i)) {
                                overriddenOptions[i].value = lastArg[i];
                            }else {
                                console.log('Megatron: Options paramater not supported and ignored ' + i);
                            }
                        }
                        //Send overridden options
                        megatron.sendHit(megatron.data.core, overriddenOptions, eventData);
                    } else {
                        var eventData = megatron.utility.cloneObj(megatron.data.event);

                        if(argList[2] === undefined) {
                            console.log('Megatron: Event category is mandatory');
                            return undefined;
                        }

                        for (var i=2; i < argList.length; i++) { //Prepare event data from command parameters
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
                case megatron.constants.hitType.pulse: {// Data: Core + Performance + non interaction
                    megatron.data.core['hitType'].value = param;
                    megatron.sendHit(megatron.data.core, megatron.constants.nonInteraction);
                    break;
                }
                case megatron.constants.hitType.timing: {//TODOV2: Support timing hits. + non interaction
                    megatron.data.core['hitType'].value = param;
                    break;
                }
                case megatron.constants.hitType.social: {//TODOV2: Support social hits.
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
        case megatron.constants.commandSet: {
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
        case megatron.constants.commandCreate: {
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
    megatron.data.core['customerHash2'].value = megatron.methods.initCustomerHash(megatron.settings.cookieName2, megatron.settings.cookieExpires, megatron.settings.isCookieRefresh);
    if (window[megatron.constants.globalFunctionNamePointer] === undefined) {
        console.log('Megatron: ' + megatron.constants.globalFunctionNamePointer +' is not defined');
        return;
    }
    megatron.name = window[megatron.constants.globalFunctionNamePointer].name;

    if (window[megatron.name].q !== undefined) { //Execute initial queued commands and reinitialize global megatron function
        megatron.settings.server = window[megatron.name].d;
        megatron.queue = window[megatron.name].q; //window[megatron.name].q = Array of arguments
        //iterate the command queue
        while (megatron.queue.length !== 0) {
            megatron.execCommand(megatron.queue[0]);
            megatron.queue.shift();
        }

        megatron.methods.initPostQueueAll();
    } else {
        console.log('Megatron: Queue is empty.');

        megatron.methods.initPostQueueAll();
    }
}


megatron.init();