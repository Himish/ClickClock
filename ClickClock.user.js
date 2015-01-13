// ==UserScript==
// @name            ClickClock
// @version         1.0.0
// @description     Know your limits!
// @author          Himish
// @author          Kalabunga
// @author          Bazgrim

// @updateURL       https://github.com/Himish/ClickClock/raw/master/ClickClock.user.js
// @supportURL      https://github.com/Himish/ClickClock/issues
// @require         https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @resource  css   https://raw.githubusercontent.com/Himish/ClickClock/master/style.css
// @include         http://*.barafranca.com/*
// @include         https://*.barafranca.com/*
// @include         http://barafranca.com/*
// @include         https://barafranca.com/*
// @include         http://*.barafranca.nl/*
// @include         https://*.barafranca.nl/*
// @include         http://barafranca.nl/*
// @include         https://barafranca.nl/*
// @include         http://*.barafranca.us/*
// @include         https://*.barafranca.us/*
// @include         http://barafranca.us/*
// @include         https://barafranca.us/*
// @include         http://*.barafranca.gen.tr/*
// @include         https://*.barafranca.gen.tr/*
// @include         http://barafranca.gen.tr/*
// @include         https://barafranca.gen.tr/*
// @include         http://*.omerta.dm/*
// @include         https://*.omerta.dm/*
// @include         http://omerta.dm/*
// @include         https://omerta.dm/*
// @exclude         http://*/game-register.php*
// @exclude         https://*/game-register.php*
// @grant           GM_getResourceText
// @grant           GM_getResourceURL
// @grant           GM_addStyle
// @grant           GM_getValue
// @grant           GM_setValue
// @priority        1
// ==/UserScript==

var CLICK_LIMIT = 40;
var DELAY = 500; //Timer update delay

//Initializing click timer
GM_setValue("count", Math.floor(parseInt(new Date().getTime(), 10) / 1000) - GM_getValue("clicktime")<=60 ? Math.floor(parseInt(new Date().getTime(), 10) / 1000) - GM_getValue("clicktime") : 60);

var county = null;

GM_addStyle(GM_getResourceText('css'));

//Adds bar to page
$("#status").append("<div id='clicklimit'><div class='progressbar-label'>Click Limit: <div id='clickCounter'>1</div></div><div class='progressbar' data-pbar='click' data-perc='100'><div></div></div></div>");

//Start click time counter
function finalCountdown(){
    clearInterval(county);

    GM_setValue("count",GM_getValue("clicktime")+60-Math.floor(parseInt(new Date().getTime(), 10) / 1000));
    var timeLeft = GM_getValue("count",60);

    county = window.setInterval(function(){timeLeft = timeLeft -DELAY/1000; timeytimey(timeLeft); }, DELAY);
}

//Tick events
function timeytimey(timeLeft){
    
    
    //1 min timer finish
    if(timeLeft <= 0){

        clearInterval(county);
        $('#clicklimit div[data-perc]').attr('data-perc', 100);
        updateBar();
        GM_setValue("count",60);
        $("#clickCounter").html(0);
        
    }
    else{
        $('#clicklimit div[data-perc]').attr('data-perc',timeLeft/60*100);
        updateBar();
    }
}


//Game listener
if (document.getElementById('game_container') !== null) {
    var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    
    if (mutationObserver) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    categorizeClick();
                }
            });
        });
        observer.observe(document.getElementById('game_container'), {
            attributes: false,
            childList: true,
            characterData: false
        });
    } 

    else{

        document.getElementById('game_container').addEventListener('DOMNodeInserted', function(event) {
            if (event.target.nodeType != 1) {
                return false;
            }
            categorizeClick();
            }, true
        );
    }   
}


function categorizeClick(){

    //Excluding buyouts
    if($('#game_container').text().indexOf('You are in jail for the next') == -1 ){

        //Checking whether click limit is already exceeded 
        if($('#game_container').text().indexOf('You reached your click limit. You may request') == -1) {
            
            //Fix variables after limit exceess
            if(GM_getValue("limited",false)) {
                GM_setValue("clicktime",null);
            }
            GM_setValue("limited", false);

            //First click
            if (GM_getValue("clicktime") === null){
                GM_setValue("clicktime", Math.floor(parseInt(new Date().getTime(), 10) / 1000));
                finalCountdown();
                GM_setValue("clickCount",1);
                $("#clickCounter").html(GM_getValue("clickCount",1));
            }
            
            //Normal click
            else if (GM_getValue("clickCount",1) < CLICK_LIMIT){

                //Within a minute
                if(Math.floor(Date.now() / 1000 - GM_getValue("clicktime") <= 60)){
                    GM_setValue("clickCount",GM_getValue("clickCount",1) + 1);
                    $("#clickCounter").html(GM_getValue("clickCount",1));
                    finalCountdown();
                }
                
                //Click after 1 min
                else{
                    GM_setValue("clicktime", null);
                    categorizeClick();
                }
            }
            
            //Click limit exceed    
            else if(GM_getValue("clickCount",1) >= CLICK_LIMIT ){

                //Click after 1 min
                if(Math.floor(Date.now() / 1000 - GM_getValue("clicktime") >= 60)){
                    GM_setValue("clicktime", Math.floor(parseInt(new Date().getTime(), 10) / 1000));
                    
                    GM_setValue("clickCount",1);
                }

                //Click limit exceed
                else{
                    finalCountdown();
                    $("#clickCounter").html(GM_getValue("clickCount",0));
                }
            }
        }

        //On support omerta page
        else{
            GM_setValue("limited",true);
        }
    }
}

//Animating the bar
function updateBar(){

    var perc = $('#clicklimit div[data-perc]').attr('data-perc');
    var pClass = 'pbKS';
    var pWidth = (perc > 100?100:perc) + "%";

    $('#clicklimit div[data-perc]').find('div').animate({width: pWidth }, DELAY);
}
