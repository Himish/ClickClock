// ==UserScript==
// @name            ClickClock
// @version         1.1
// @description     Know your limits!
// @author          Himish
// @author          Kalabunga
// @author          Bazgrim
// @homepage        https://github.com/Himish/ClickClock
// @updateURL       https://github.com/Himish/ClickClock/raw/master/ClickClock.user.js
// @supportURL      https://github.com/Himish/ClickClock/issues
// @require         https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @resource  css   https://raw.githubusercontent.com/Himish/ClickClock/master/style.css
// @include         http://*.barafranca.com/*
// @include         https://*.barafranca.com/*
// @include         http://barafranca.com/*
// @include         https://barafranca.com/*
// @exclude         http://*/game-register.php*
// @exclude         https://*/game-register.php*
// @grant           GM_getResourceText
// @grant           GM_getResourceURL
// @grant           GM_addStyle
// @grant           GM_getValue
// @grant           GM_setValue
// @priority        1
// ==/UserScript==


GM_setValue('click_limit',GM_getValue('clicklimit',11));
var CLICK_LIMIT = GM_getValue('click_limit',11);

var DELAY = 1000; //Timer update delay

//Initializing click timer
GM_setValue("count", Math.floor(parseInt(new Date().getTime(), 10) / 1000) - GM_getValue("clicktime")<=60 ? Math.floor(parseInt(new Date().getTime(), 10) / 1000) - GM_getValue("clicktime") : 60);

var county = null; //Variable for interval

GM_addStyle(GM_getResourceText('css'));

//Adds bar to page
$("#status").append("<div id='clicklimit'><div class='progressbar-label'>Click Limit: <div id='clickCounter'>1</div></div><div class='progressbar' data-perc='100'><span class='percent' id='secLeft' data-sec-left='60'></span><div class='pbKS'></div></div></div>");
$('#secLeft').text($('#secLeft').attr('data-sec-left'));
$("#clicklimit").hover(function(){ $("#secLeft").stop().fadeIn('slow'); }, function(){ $("#secLeft").fadeOut('slow'); });

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
        $('#secLeft').attr('data-sec-left', 60);
        updateBar();
        GM_setValue("count",60);
        $("#clickCounter").html(0);
        
    }
    else{
        $('#clicklimit div[data-perc]').attr('data-perc',timeLeft/60*100);
        $('#secLeft').attr('data-sec-left', timeLeft);
        updateBar();
    }
}


//Game listener
if (document.getElementById('game_container') !== null) {
    var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    
    if (mutationObserver) {
        var observer = new MutationObserver(function(mutations) {
            var notMulti = true;

            mutations.forEach(function(mutation) {                       
                notMulti = checkMutation(mutation) && $('#game_container').text().indexOf('OmertaBeyond Preferences') == -1;

            });
            
            if (notMulti && !onPage("Mail")){              
                categorizeClick();                      
            }
            
            if(onPage("information"))updateClickLimit();
        });
        observer.observe(document.getElementById('game_container'), {
            attributes: false,
            childList: true,
            characterData: false
        });
    }     
}

function categorizeClick(){ 
    //Excluding buyouts
    if($('#game_container').text().indexOf('You bought yourself out for') == -1 ){

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
    var pWidth = (perc > 100?100:perc) + "%";
    var secLeft =  $('#secLeft').attr('data-sec-left');
    $('#secLeft').text(secLeft);
    $('#clicklimit div[data-perc]').find('div').animate({width: pWidth }, DELAY);
    
}


function onPage(page){
    return window.location.hash.indexOf(page) != -1;
}

//returns true if mutation happened just once on a page.
function checkMutation(mutation){
    for (var i = 0; i<mutation.addedNodes.length; i++)
          if (mutation.addedNodes[i].id == "AF") return false;
    return true;  
}

//Updates click limit using the level info on information page
function updateClickLimit(){
    GM_setValue('click_limit',$('#game_container > table > tbody > tr > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(2)').html().indexOf('Donating') == -1? 11 : 40);
    CLICK_LIMIT = GM_getValue('click_limit',11);
}
