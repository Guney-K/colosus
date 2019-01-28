(function (m, e, g, a, t, r, o, n) {
    m['megatronObj']={name:t};
    m[t] = function(){(m[t].q = m[t].q || []).push(arguments);};m[t].d=r;
    o = e.createElement(g);
    n = e.getElementsByTagName(g)[0];
    o.async = true;
    o.src = a;
    n.parentNode.insertBefore(o,n);
})(window, document, 'script', 'https://URL_OF_TRACKER_LIBRARY', 'mt', 'https://URL_OF_MEGATRON_SERVER_ENDPOINT');

//Initial Example commands
mt('set', 'enablePulse', true);
mt('set', 'platformID', 'megatron-rocks123');
mt('send', 'pageview');