"object"!==typeof DotmetricsJSON&&(DotmetricsJSON={});
(function(){function e(a){return 10>a?"0"+a:a}function r(a){f.lastIndex=0;return f.test(a)?'"'+a.replace(f,function(a){var b=g[a];return"string"===typeof b?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function a(e,f){var g,n=b,h=f[e];h&&"object"===typeof h&&"function"===typeof h.toDotmetricsJSON&&(h=h.toDotmetricsJSON(e));"function"===typeof d&&(h=d.call(f,e,h));switch(typeof h){case "string":return r(h);case "number":return isFinite(h)?String(h):"null";case "boolean":case "null":return String(h);
case "object":if(!h)return"null";b+=c;var p=[];if("[object Array]"===Object.prototype.toString.apply(h)){var k=h.length;for(g=0;g<k;g+=1)p[g]=a(g,h)||"null";var t=0===p.length?"[]":b?"[\n"+b+p.join(",\n"+b)+"\n"+n+"]":"["+p.join(",")+"]";b=n;return t}if(d&&"object"===typeof d)for(k=d.length,g=0;g<k;g+=1){if("string"===typeof d[g]){var l=d[g];(t=a(l,h))&&p.push(r(l)+(b?": ":":")+t)}}else for(l in h)Object.prototype.hasOwnProperty.call(h,l)&&(t=a(l,h))&&p.push(r(l)+(b?": ":":")+t);t=0===p.length?"{}":
b?"{\n"+b+p.join(",\n"+b)+"\n"+n+"}":"{"+p.join(",")+"}";b=n;return t}}"function"!==typeof Date.prototype.toDotmetricsJSON&&(Date.prototype.toDotmetricsJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+e(this.getUTCMonth()+1)+"-"+e(this.getUTCDate())+"T"+e(this.getUTCHours())+":"+e(this.getUTCMinutes())+":"+e(this.getUTCSeconds())+"Z":null},String.prototype.toDotmetricsJSON=Number.prototype.toDotmetricsJSON=Boolean.prototype.toDotmetricsJSON=function(){return this.valueOf()});
var b,c,d;if("function"!==typeof DotmetricsJSON.stringify){var f=/[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;var g={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};DotmetricsJSON.stringify=function(e,f,g){var n;c=b="";if("number"===typeof g)for(n=0;n<g;n+=1)c+=" ";else"string"===typeof g&&(c=g);if((d=f)&&"function"!==typeof f&&("object"!==typeof f||"number"!==typeof f.length))throw Error("DotmetricsJSON.stringify");
return a("",{"":e})}}if("function"!==typeof DotmetricsJSON.parse){var k=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;DotmetricsJSON.parse=function(a,b){function c(a,d){var n,f=a[d];if(f&&"object"===typeof f)for(n in f)if(Object.prototype.hasOwnProperty.call(f,n)){var e=c(f,n);void 0!==e?f[n]=e:delete f[n]}return b.call(a,d,f)}a=String(a);k.lastIndex=0;k.test(a)&&(a=a.replace(k,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));
if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){var d=eval("("+a+")");return"function"===typeof b?c({"":d},""):d}throw new SyntaxError("DotmetricsJSON.parse");}}})();
var CryptoJS=CryptoJS||function(e,r){var a={},b=a.lib={},c=b.Base=function(){function a(){}return{extend:function(b){a.prototype=this;var c=new a;b&&c.mixIn(b);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var b in a)a.hasOwnProperty(b)&&(this[b]=a[b]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},
clone:function(){return this.init.prototype.extend(this)}}}(),d=b.WordArray=c.extend({init:function(a,b){a=this.words=a||[];this.sigBytes=b!=r?b:4*a.length},toString:function(a){return(a||g).stringify(this)},concat:function(a){var b=this.words,c=a.words,d=this.sigBytes;a=a.sigBytes;this.clamp();if(d%4)for(var f=0;f<a;f++)b[d+f>>>2]|=(c[f>>>2]>>>24-f%4*8&255)<<24-(d+f)%4*8;else if(65535<c.length)for(f=0;f<a;f+=4)b[d+f>>>2]=c[f>>>2];else b.push.apply(b,c);this.sigBytes+=a;return this},clamp:function(){var a=
this.words,b=this.sigBytes;a[b>>>2]&=4294967295<<32-b%4*8;a.length=e.ceil(b/4)},clone:function(){var a=c.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var b=[],c=0;c<a;c+=4)b.push(4294967296*e.random()|0);return new d.init(b,a)}}),f=a.enc={},g=f.Hex={stringify:function(a){var b=a.words;a=a.sigBytes;for(var c=[],d=0;d<a;d++){var f=b[d>>>2]>>>24-d%4*8&255;c.push((f>>>4).toString(16));c.push((f&15).toString(16))}return c.join("")},parse:function(a){for(var b=a.length,
c=[],f=0;f<b;f+=2)c[f>>>3]|=parseInt(a.substr(f,2),16)<<24-f%8*4;return new d.init(c,b/2)}},k=f.Latin1={stringify:function(a){var b=a.words;a=a.sigBytes;for(var c=[],d=0;d<a;d++)c.push(String.fromCharCode(b[d>>>2]>>>24-d%4*8&255));return c.join("")},parse:function(a){for(var b=a.length,c=[],f=0;f<b;f++)c[f>>>2]|=(a.charCodeAt(f)&255)<<24-f%4*8;return new d.init(c,b)}},l=f.Utf8={stringify:function(a){try{return decodeURIComponent(escape(k.stringify(a)))}catch(h){throw Error("Malformed UTF-8 data");
}},parse:function(a){return k.parse(unescape(encodeURIComponent(a)))}},m=b.BufferedBlockAlgorithm=c.extend({reset:function(){this._data=new d.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=l.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,c=b.words,f=b.sigBytes,g=this.blockSize,k=f/(4*g);k=a?e.ceil(k):e.max((k|0)-this._minBufferSize,0);a=k*g;f=e.min(4*a,f);if(a){for(var n=0;n<a;n+=g)this._doProcessBlock(c,n);n=c.splice(0,a);b.sigBytes-=
f}return new d.init(n,f)},clone:function(){var a=c.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});b.Hasher=m.extend({cfg:c.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){m.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,c){return(new a.init(c)).finalize(b)}},_createHmacHelper:function(a){return function(b,
c){return(new q.HMAC.init(a,c)).finalize(b)}}});var q=a.algo={};return a}(Math);
(function(){var e=CryptoJS,r=e.lib,a=r.WordArray,b=r.Hasher,c=[];r=e.algo.SHA1=b.extend({_doReset:function(){this._hash=new a.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(a,b){for(var d=this._hash.words,f=d[0],e=d[1],m=d[2],q=d[3],n=d[4],h=0;80>h;h++){if(16>h)c[h]=a[b+h]|0;else{var p=c[h-3]^c[h-8]^c[h-14]^c[h-16];c[h]=p<<1|p>>>31}p=(f<<5|f>>>27)+n+c[h];p=20>h?p+((e&m|~e&q)+1518500249):40>h?p+((e^m^q)+1859775393):60>h?p+((e&m|e&q|m&q)-1894007588):p+((e^m^
q)-899497514);n=q;q=m;m=e<<30|e>>>2;e=f;f=p}d[0]=d[0]+f|0;d[1]=d[1]+e|0;d[2]=d[2]+m|0;d[3]=d[3]+q|0;d[4]=d[4]+n|0},_doFinalize:function(){var a=this._data,b=a.words,c=8*this._nDataBytes,e=8*a.sigBytes;b[e>>>5]|=128<<24-e%32;b[(e+64>>>9<<4)+14]=Math.floor(c/4294967296);b[(e+64>>>9<<4)+15]=c;a.sigBytes=4*b.length;this._process();return this._hash},clone:function(){var a=b.clone.call(this);a._hash=this._hash.clone();return a}});e.SHA1=b._createHelper(r);e.HmacSHA1=b._createHmacHelper(r)})();
(function(){function e(a){if(1==DotMetricsSettings.Debug&&window.console)try{console.log(a)}catch(b){}}function r(){this.formPostCount=this.pingSendCount=this.dataSendCount=0;this.callLimit=10;this.isRegExp=function(a){return"[object RegExp]"==Object.prototype.toString.call(a)};this.setCookie=function(a,b,c){var d=new Date;d.setDate(d.getDate()+c);b=escape(b)+(null==c?"":"; expires="+d.toUTCString());document.cookie=a+"="+b+";path=/"};this.getCookie=function(a){return this.hasCookie(a)?this.listCookie()[a]:
null};this.hasCookie=function(a){return(new RegExp("(?:;\\s*|^)"+encodeURIComponent(a)+"=")).test(document.cookie)};this.listCookie=function(a){for(var b=document.cookie.split(";"),c,d={},f=0,e=b.length;f<e;++f)if(c=b[f].split("="),c[0]=c[0].replace(/^\s+|\s+$/,""),!this.isRegExp(a)||a.test(c[0]))d[decodeURIComponent(c[0])]=decodeURIComponent(c[1]);return d};this.sendData=function(a,b){switch(a){case DotMetricsSettings.DataUrl:this.dataSendCount++;if(this.dataSendCount>this.callLimit)return;break;
case DotMetricsSettings.PingUrl:if(this.pingSendCount++,this.pingSendCount>this.callLimit)return}var c=this.encode(DotmetricsJSON.stringify(b));c=encodeURIComponent(c);var d=(new Date).getTime();c=a+"?v="+c+"&r="+d;d=document.createElement("script");d.setAttribute("src",c);document.getElementsByTagName("head")[0].appendChild(d);e("Loading JSONP ...");e(b);e(c);e("---------------------------")};this.performAjaxPost=function(a,b){var c=this.encode(DotmetricsJSON.stringify(b));c=encodeURIComponent(c);
var d=(new Date).getTime();c="v="+c+"&r="+d;window.XDomainRequest?(d=new XDomainRequest,d.open("POST",a),d.send(c)):(d=null,window.XMLHttpRequest?d=new XMLHttpRequest:window.ActiveXObject&&(d=new ActiveXObject("Microsoft.XMLHTTP")),d.open("POST",a,!0),d.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),d.send(c));e("Making ajax POST request ...");e(a);e(b);e("---------------------------")};this.performSendBeacon=function(a,b){var c=this.encode(DotmetricsJSON.stringify(b));c=encodeURIComponent(c);
var d=(new Date).getTime();c="v="+c+"&r="+d;e("Making sendBeacon request ...");e(a);e(b);e("---------------------------");c=new Blob([c],{type:"application/x-www-form-urlencoded"});return navigator.sendBeacon(a,c)};this.addEventSimple=function(a,b,c){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent&&a.attachEvent("on"+b,c)};this.removeEventSimple=function(a,b,c){a.removeEventListener?a.removeEventListener(b,c,!1):a.detachEvent&&a.detachEvent("on"+b,c)};this.isIE=function(){return-1!=navigator.appName.indexOf("Microsof")?
!0:!1};this.hasFlash=function(){var a=!1;try{new ActiveXObject("ShockwaveFlash.ShockwaveFlash"),a=!0}catch(b){void 0!=navigator.mimeTypes["application/x-shockwave-flash"]&&(a=!0)}return a};this.saveInLocalStorage=function(a){e("Saving to local storage");try{if("undefined"!==typeof Storage)for(var b in a)a.hasOwnProperty(b)&&localStorage.setItem(b,a[b])}catch(c){}};this.loadFlash=function(a,b){e("Loading Flash");var c=a+"?onLoad=DotMetricsFlashLoaded";var d='<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase=document.location.protocol+"//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" width="1" height="1" id="DotMetricsFlash"   >'+
('<param name="movie" value="'+c+'"/>')+'<param name="allowScriptAccess" value="always"/>';d=this.isIE()?d+('<object type="application/x-shockwave-flash" data="'+c+'" width="1" height="1">')+('<param name="movie" value="'+c+'"/>')+'<param name="allowScriptAccess" value="always"/></object>':d+('<embed src="'+c+'" width="1" height="1" name="DotMetricsFlash" type="application/x-shockwave-flash" allowScriptAccess="always" ></embed>');d+="</object>";window.DotMetricsFlashLoaded=function(){e("Flash loaded");
var a=window.document.DotMetricsFlash;b(a);e(a)};c=document.createElement("div");c.style.position="absolute";c.style.left="-2000px";c.style.width="1px";c.style.height="1px";c.innerHTML=d;document.body.appendChild(c)};this.getFromLocalStorage=function(a){try{return"undefined"!==typeof Storage?localStorage.getItem(a):null}catch(b){return null}};this.CreateElement=function(a,b,c){if(null!=a){a=document.createElement(a);if(null!=b)for(x in b)"function"==typeof b[x]?this.addEventSimple(a,x,b[x]):(a.setAttribute(x,
b[x]),"class"==x&&(a.className=b[x]));null!=c&&(b=document.createTextNode(c.toString()),a.appendChild(b));return a}return null!=c?document.createTextNode(c.toString()):null};this.clientInfo=null;this.createClientInfo=function(a){function b(){q=n.detect(c[l])?q+"1":q+"0";l++;l>=c.length?(d.FontString=q,h.clientInfo=d,a&&a()):setTimeout(function(){b()},30)}if(this.clientInfo)a&&a();else{var c="cursive;monospace;serif;sans-serif;fantasy;Arial;Arial Black;Arial Narrow;Arial Rounded MT Bold;Bookman Old Style;Bradley Hand ITC;Century;Century Gothic;Comic Sans MS;Courier;Courier New;Georgia;Gentium;Impact;King;Lucida Console;Lalit;Modena;Monotype Corsiva;Papyrus;Tahoma;TeX;Times;Times New Roman;Trebuchet MS;Verdana;Verona;Bell MT;Berlin Sans FB;Corbel;Kalinga;Miriam Regular;Modern Standard;Segoe UI;Segoe Print;Inconsolata;Droid Sans Mono;Anonymous Pro;Liberation Mono;Terminus;Rosario;Roboto Slab;Oswald;Stalemate;Crimson Text;Gravitas One;Jura;League Gothic;Fjord;Proxima Nova;Trivia Grotesk;Pluto Sans;Museo Sans;Futura;Al Bayan;American Typewriter;Andale Mono;Apple Casual;Apple Chancery;Apple Garamond;Apple Gothic;Apple LiGothic;Apple LiSung;Apple Myungjo;Apple Symbols;.AquaKana;Arial Hebrew;Ayuthaya;Baghdad;Baskerville;Beijing;BiauKai;Big Caslon;Brush Script;Chalkboard;Chalkduster;Charcoal;Charcoal CY;Chicago;Cochin;Comic Sans;Cooper;Copperplate;Corsiva Hebrew;DecoType Naskh;Devanagari;Didot;Euphemia UCAS;Fang Song;Gadget;Geeza Pro;Geezah;Geneva;Geneva CY;Gill Sans;Gujarati;Gung Seoche;Gurmukhi;Hangangche;HeadlineA;Hei;Helvetica;Helvetica CY;Helvetica Neue;Herculanum;Hiragino Kaku Gothic Pro;Hiragino Kaku Gothic ProN;Hiragino Kaku Gothic Std;Hiragino Kaku Gothic StdN;Hiragino Maru Gothic Pro;Hiragino Maru Gothic ProN;Hiragino Mincho Pro;Hiragino Mincho ProN;Hoefler Text;Inai Mathi;Jung Gothic;Kai;Keyboard;Krungthep;KufiStandard GK;LastResort;LiHei Pro;LiSong Pro;Lucida Grande;Marker Felt;Menlo;Monaco;Monaco CY;Mshtakan;Nadeem;New Peninim;New York;NISC GB18030;Optima;Osaka;Palatino;PC Myungjo;Pilgiche;Plantagenet Cherokee;Raanana;Sand;Sathu;Seoul;Shin Myungjo Neue;Silom;Skia;Song;ST FangSong;ST Heiti;ST Kaiti;ST Song;Symbol;Tae Graphic;Taipei;Techno;Textile;Thonburi;Times CY;Zapf Chancery;Zapf Dingbats;Zapfino;Abadi MT Condensed Light;Aharoni;Aldhabi;Andalus;Angsana New;AngsanaUPC;Aparajita;Arabic Typesetting;Arial Nova;Batang;BatangChe;Book Antiqua;Browallia New;BrowalliaUPC;Calibri;Calibri Light;Calisto MT;Cambria;Cambria Math;Candara;Consolas;Constantia;Copperplate Gothic Bold;Copperplate Gothic Light;Cordia New;CordiaUPC;DaunPenh;David;Dengxian;DFKai-SB;DilleniaUPC;DokChampa;Dotum;DotumChe;Ebrima;Estrangelo Edessa;EucrosiaUPC;Euphemia;FangSong;Franklin Gothic Medium;FrankRuehl;FreesiaUPC;Gabriola;Gadugi;Gautami;Georgia Pro;Gill Sans Nova;Gisha;Gulim;GulimChe;Gungsuh;GungsuhChe;IrisUPC;Iskoola Pota;JasmineUPC;KaiTi;Kartika;Khmer UI;KodchiangUPC;Kokila;Lao UI;Latha;Leelawadee;Leelawadee UI;Levenim MT;LilyUPC;Lucida Handwriting Italic;Lucida Sans Unicode;Malgun Gothic;Mangal;Manny ITC;Marlett;Meiryo;Meiryo UI;Microsoft Himalaya;Microsoft JhengHei;Microsoft JhengHei UI;Microsoft New Tai Lue;Microsoft PhagsPa;Microsoft Sans Serif;Microsoft Tai Le;Microsoft Uighur;Microsoft YaHei;Microsoft YaHei UI;Microsoft Yi Baiti;MingLiU, PMingLiU;MingLiU-ExtB, PMingLiU-ExtB;MingLiU_HKSCS;MingLiU_HKSCS-ExtB;Miriam, Miriam Fixed;Mongolian Baiti;MoolBoran;MS Gothic, MS PGothic;MS Mincho, MS PMincho;MS UI Gothic;MV Boli;Myanmar Text;Narkisim;Neue Haas Grotesk Text Pro;News Gothic MT;Nirmala UI;NSimSun;Nyala;Palatino Linotype;Raavi;Rockwell Nova;Rod;Sakkal Majalla;Sanskrit Text;Segoe MDL2 Assets;Segoe Script;Segoe UI v5.00[3];Segoe UI v5.01[4];Segoe UI v5.27[5];Segoe UI v5.35;Segoe UI Emoji;Segoe UI Historic[6];Segoe UI Symbol;Shonar Bangla;Shruti;SimHei;SimKai;Simplified Arabic;SimSun;SimSun-ExtB;Sitka Banner;Sitka Display;Sitka Heading;Sitka Small;Sitka Subheading;Sitka Text;Sylfaen;Traditional Arabic;Tunga;Urdu Typesetting;Utsaah;Vani;Verdana Pro;Vijaya;Vrinda;Webdings;Westminster;Wingdings;Yu Gothic;Yu Gothic UI;Yu Mincho;Abyssinica SIL;Bitstream Charter;Century Schoolbook L;Courier 10 Pitch;DejaVu Sans;DejaVu Sans Condensed;DejaVu Sans Light;DejaVu Sans Mono;DejaVu Serif;DejaVu Serif Condensed;Dingbats;Droid Arabic Kufi;Droid Arabic Naskh;Droid Naskh Shift Alt;Droid Sans;Droid Sans Arabic;Droid Sans Armenian;Droid Sans Ethiopic;Droid Sans Fallback;Droid Sans Georgian;Droid Sans Hebrew;Droid Sans Japanese;Droid Serif;FreeMono;FreeSans;FreeSerif;Gargi;Garuda;KacstArt;KacstBook;KacstDecorative;KacstDigital;KacstFarsi;KacstLetter;KacstNaskh;KacstOffice;KacstOne;KacstPen;KacstPoster;KacstQurn;KacstScreen;KacstTitle;KacstTitleL;Kedage;Khmer OS;Khmer OS System;Kinnari;Laksaman;Liberation Sans;Liberation Sans Narrow;Liberation Serif;LKLUG;Lohit Bengali;Lohit Devanagari;Lohit Gujarati;Lohit Punjabi;Lohit Tamil;Loma;Mallige;Meera;mry_KacstQurn;Mukti Narrow;NanumBarunGothic;NanumGothic;NanumMyeongjo;Nimbus Mono L;Nimbus Roman No9 L;Nimbus Sans L;Norasi;OpenSymbol;Padauk;Padauk Book;Phetsarath OT;Pothana2000;Purisa;Rachana;Rekha;Saab;Sawasdee;STIX;STIXGeneral;TakaoPGothic;Tibetan Machine Uni;Tlwg Typist;Tlwg Typo;TlwgMono;TlwgTypewriter;Ubuntu;Ubuntu Condensed;Ubuntu Light;Ubuntu Mono;Umpush;URW Bookman L;URW Chancery L;URW Gothic L;URW Palladio L;utkal;Vemana2000;Waree;WenQuanYi Micro Hei;WenQuanYi Micro Hei Mono;Academy Engraved LET;Apple Color Emoji;AppleGothic;Bangla Sangam MN;Bodoni 72;Bodoni 72 Oldstyle;Bodoni 72 Smallcaps;Bodoni Ornaments;Bradley Hand;Chalkboard SE;Devanagari Sangam MN;Gujarati Sangam MN;Gurmukhi MN;Heiti SC;Heiti TC;Kailasa;Kannada Sangam MN;Malayalam Sangam MN;Marion;Noteworthy;Oriya Sangam MN;Party LET;Sinhala Sangam MN;Snell Roundhand;Tamil Sangam MN;Telugu Sangam MN".split(";"),
d={};d.AppCodeName=window.navigator.appCodeName;d.AppName=window.navigator.appName;d.Version=window.navigator.appVersion;d.Language=window.navigator.language;d.Platform=window.navigator.platform;d.Product=window.navigator.product;d.ProductSub=window.navigator.productSub;d.UserAgent=window.navigator.userAgent;d.Vendor=window.navigator.vendor;d.VendorSub=window.navigator.vendorSub;d.BuildId=window.navigator.buildID;d.OsCpu=window.navigator.oscpu;d.Screen={};d.Screen.AvailableWidth=window.screen.availWidth;
d.Screen.AvailableHeight=window.screen.availHeight;d.Screen.PixelDepth=window.screen.pixelDepth;d.Screen.ColorDepth=window.screen.colorDepth;var f=window.devicePixelRatio||window.screen.deviceXDPI/window.screen.logicalXDPI;d.Screen.Width=Math.round(window.screen.width*f);d.Screen.Height=Math.round(window.screen.height*f);null==d.Screen.Width&&(d.Screen.Width=d.Screen.AvailableWidth);null==d.Screen.Height&&(d.Screen.Height=d.Screen.AvailableHeight);d.Plugins=[];if(window.ActiveXObject){f=/[0-9]+/;
var e={flash:"ShockwaveFlash.ShockwaveFlash",pdf:"AcroPDF.PDF",silverlight:"AgControl.AgControl",quicktime:"QuickTime.QuickTime"};for(m in e){var k=this.msieDetect(e[m]);k&&(k=(k=f.exec(k))&&k[0]||"",k={},k.Name=e[m],k.FileName="",d.Plugins.push(k))}}else for(var l=0;l<window.navigator.plugins.length;l++){var m=window.navigator.plugins[l];f={};f.Name=m.name;f.FileName=m.filename;d.Plugins.push(f)}d.MimeTypes=[];for(l=0;m=window.navigator.mimeTypes[l];l++)f={},f.Type=m.type,f.Suffixes=m.suffixes,d.MimeTypes.push(f);
d.Canvas=this.CreateCanvasFP();var q="",n=new function(){var a=["monospace","sans-serif","serif"],b=document.getElementsByTagName("body")[0],c=document.createElement("span");c.style.fontSize="72px";c.innerHTML="mmmmmmmmmmlli";var d={},f={},e;for(e in a)c.style.fontFamily=a[e],b.appendChild(c),d[a[e]]=c.offsetWidth,f[a[e]]=c.offsetHeight,b.removeChild(c);this.detect=function(e){var g=!1,k;for(k in a){c.style.fontFamily=e+","+a[k];b.appendChild(c);var h=c.offsetWidth!=d[a[k]]||c.offsetHeight!=f[a[k]];
b.removeChild(c);g=g||h}return g}},h=this;l=0;setTimeout(function(){b()},20)}};this.msieDetect=function(a){try{var b=new ActiveXObject(a);try{return b.GetVariable("$version")}catch(d){try{return b.GetVersions()}catch(f){try{var c;for(a=1;9>a;a++)b.isVersionSupported(a+".0")&&(c=a);return c||!0}catch(g){return!0}}}}catch(d){return!1}};this.CreateCanvasFP=function(){var a=document.createElement("canvas");if(a.getContext&&a.getContext("2d")){a.width=250;a.height=250;document.getElementById("fingerprint-output");
for(var b=a.getContext("2d"),c=0;c<a.width/2;c++)b.moveTo(2*c,0),b.lineTo(4*c,a.height),b.strokeStyle="rgba(0, 0, 0, 0.1)",b.stroke();b.font="40px 'Arial'";for(c=0;3>c;c++)b.fillStyle="#41b4e7",b.fillText("Dotmetrics",10,50*c+75),b.fillStyle="rgba(255, 255, 255, 0.7)",b.fillText("Dotmetrics",20,50*c+75);a=a.toDataURL("image/jpeg",1);return CryptoJS.SHA1(a).toString()}return null};this.CreateElement=function(a,b,c){if(null!=a){a=document.createElement(a);if(null!=b)for(x in b)"function"==typeof b[x]?
this.addEventSimple(a,x,b[x]):(a.setAttribute(x,b[x]),"class"==x&&this.isIE()&&(a.className=b[x]));null!=c&&(b=document.createTextNode(c.toString()),a.appendChild(b));return a}return null!=c?document.createTextNode(c.toString()):null};this.encode=function(a){var b="",c=0;for(a=this.utf8Encode(a);c<a.length;){var d=a.charCodeAt(c++);var f=a.charCodeAt(c++);var e=a.charCodeAt(c++);var k=d>>2;d=(d&3)<<4|f>>4;var l=(f&15)<<2|e>>6;var m=e&63;isNaN(f)?l=m=64:isNaN(e)&&(m=64);b=b+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(k)+
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(d)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(l)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(m)}return b};this.utf8Encode=function(a){a=a.replace(/\r\n/g,"\n");for(var b="",c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b+=String.fromCharCode(d):(127<d&&2048>d?b+=String.fromCharCode(d>>6|192):(b+=String.fromCharCode(d>>12|224),b+=String.fromCharCode(d>>6&63|128)),
b+=String.fromCharCode(d&63|128))}return b}}window.DotMetricsObj=new function(){this.Core=new r;this.EnterPageEventData=null;this.flashLoaded=!1;this.flashObject=null;this.TimeBuffer=this.TimeOnPage=0;this.TimeTreshold=18E5;this.surveyLink=this.LoadTimeStamp="";this.DeviceGuidId=this.UserId=this.DeviceId=this.unloadFunction=this.othersUnloadFunc=null;this.deviceInfoSent=!1;this.postIndex=0;this.surveyDone=this.Done=!1;this.ajaxTimer=null;this.panel=!1;this.panelHouseholdId=this.panelUserId=null;this.videos=
{};this.SaveTimeOnPageInterval=1E4;this.fbInstantArticle=!1;this.Start=function(){function a(){if((new Date).getTime()-g.getTime()<=b.TimeTreshold||b.fbInstantArticle)b.TimeOnPage+=b.TimeBuffer;b.TimeBuffer=0;g=new Date}var b=this;0<=navigator.userAgent.indexOf("FBIA")&&(b.fbInstantArticle=!0);this.unloadFunction=function(){if(!b.Done){c&&clearInterval(c);d&&clearInterval(d);e("unloading");a();var f=b.SendTimeOnPageBeacon();b.SaveTimeOnPage(f);b.Done=!0;b.othersUnloadFunc&&b.othersUnloadFunc()}};
window.onbeforeunload&&(e("Others onbeforeunload"),this.othersUnloadFunc=window.onbeforeunload);window.addEventListener&&(window.addEventListener("beforeunload",this.unloadFunction),window.addEventListener("pagehide",this.unloadFunction),window.addEventListener("unload",this.unloadFunction));window.onbeforeunload=this.unloadFunction;var c=setInterval(function(){void 0!=document.visibilityState?"visible"==document.visibilityState&&b.TimeBuffer++:b.TimeBuffer++;b.fbInstantArticle&&a();window.onbeforeunload!=
b.unloadFunction&&(e("Others onbeforeunload"),b.othersUnloadFunc=window.onbeforeunload,window.onbeforeunload=b.unloadFunction)},1E3);var d=setInterval(function(){b.SaveTimeOnPage()},b.SaveTimeOnPageInterval);if(document.getElementById("DotmetricsPanelUserId")&&document.getElementById("DotmetricsPanelHouseholdId")){b.panel=!0;b.panelUserId=document.getElementById("DotmetricsPanelUserId").value;b.panelHouseholdId=document.getElementById("DotmetricsPanelHouseholdId").value;var f=document.createElement("input");
f.setAttribute("type","hidden");f.setAttribute("id","DotmetricsScriptLoaded");f.setAttribute("value","true");document.getElementsByTagName("head")[0].appendChild(f)}var g=new Date;this.Core.addEventSimple(document,"mousemove",function(){a()});this.Core.addEventSimple(document,"wheel",function(){a()});this.Core.addEventSimple(document,"touchend",function(){a()});f=this.createStartData();b.Core.sendData(DotMetricsSettings.DataUrl,f);if(window.dm)this.onAjaxDataUpdate();this.trackVideos()};this.createStartData=
function(){var a={id:DotMetricsSettings.SiteSectionId,fl:!0,dom:window.location.hostname,fso:null,lso:null,url:window.location.href};this.panel&&(a.hhid=this.panelHouseholdId,a.uid=this.panelUserId);var b="DM_SitId"+DotMetricsSettings.SiteId,c="DM_SitIdT"+DotMetricsSettings.SiteId,d=b+"SecId"+DotMetricsSettings.SiteSectionId,f=b+"SecIdT"+DotMetricsSettings.SiteSectionId,g=new Date;g.setMinutes(g.getMinutes()+30);this.Core.hasCookie(b)&&this.Core.hasCookie(c)?a.oss=!1:(document.cookie=b+"=true;path=/",
a.oss=!0);this.Core.hasCookie(d)&&this.Core.hasCookie(f)?a.oses=!1:(document.cookie=d+"=true;path=/",a.oses=!0);document.cookie=c+"=true;expires="+g.toUTCString()+";path=/";document.cookie=f+"=true;expires="+g.toUTCString()+";path=/";e("Start data crated");e(a);e("---------------------------------------");return a};this.processActions=function(a){var b=this;e("Processing actions:");e(a);var c={id:DotMetricsSettings.SiteSectionId,fl:!1,dom:window.location.hostname,lso:null,fso:null,ds:null,dsl:null,
dh:null,url:window.location.href};this.panel&&(c.hhid=this.panelHouseholdId,c.uid=this.panelUserId);var d=!1,f=!1;if(a.SendDeviceInfo||a.Ping){var g={deviceInfo:!1,pings:0,exitPageData:!1};a.Ping&&0<a.Ping&&0==this.deviceInfoSent&&(g.pings=a.Ping);a.SendDeviceInfo&&0==this.deviceInfoSent&&(this.deviceInfoSent=g.deviceInfo=!0);this.submitData(g)}if(a.Survey&&a.Survey.SurveyUrl)if(e("show survey:"),e(a.Survey),this.Survey=a.Survey,this.Survey.Mobile){var k=this;this.anchor=this.Core.CreateElement("a",
{href:a.Survey.SurveyUrl,style:"position:fixed; width:100%; height:100%; top:0; left:0; background:#f00; opacity:0;z-index:99999",target:"_blank",id:"DotMetricsPopupLink"},null);document.body.appendChild(this.anchor);this.Core.addEventSimple(this.anchor,"click",function(a){a.preventDefault();var b=k.anchor.getAttribute("href");document.body.removeChild(k.anchor);k.surveyDone||(k.surveyDone=!0,setTimeout(function(){window.open(b,"_blank")},20))})}else{var l=function(){document.body.addEventListener?
document.body.removeEventListener("click",l):document.body.detachEvent("onclick",l);b.showSurvey()};document.body.addEventListener?document.body.addEventListener("click",l,!1):document.body.attachEvent("onclick",l)}if(a.SendDeviceHash)if(this.Core.clientInfo)d=DotmetricsJSON.stringify(this.Core.clientInfo),d=CryptoJS.SHA1(d),c.dh=d.toString(),e("actions Send device info hash: "+c.dh),d=!0;else{this.Core.createClientInfo(function(){b.processActions(a)});return}a.PersistDeviceAndUser&&a.DeviceId&&a.UserId&&
a.DeviceGuidId&&(e("Save persistance data"),this.Core.saveInLocalStorage({DotMetricsDeviceId:a.DeviceId,DotMetricsUserId:a.UserId,DotMetricsDeviceGuidId:a.DeviceGuidId}),this.Core.hasFlash()?(e("loading flash"),this.flashLoaded&&this.flashObject?this.flashObject.setData(a.UserId,a.DeviceId,a.DeviceGuidId):this.Core.loadFlash(DotMetricsSettings.FlashUrl,function(c){e("flash callback");b.flashLoaded=!0;b.flashObject=c;e("setting flash cookie");c.setData(a.UserId,a.DeviceId,a.DeviceGuidId)})):e("Doesn't have flash"));
if(a.SendLSO){e("Get LSO");d=this.Core.getFromLocalStorage("DotMetricsUserId");g=this.Core.getFromLocalStorage("DotMetricsDeviceId");var m=this.Core.getFromLocalStorage("DotMetricsDeviceGuidId");c.lso=d&&g&&m?{d:g,u:d,dg:m}:{d:"",u:"00000000-0000-0000-0000-000000000000",dg:"00000000-0000-0000-0000-000000000000"};d=!0}if(a.SendFSO)if(e("Get FSO"),this.Core.hasFlash())if(this.flashLoaded&&this.flashObject)a=this.flashObject.getData(),c.fso=a.UserId&&a.DeviceId&&a.DeviceGuidId?{d:a.DeviceId,u:a.UserId,
dg:a.DeviceGuidId}:{d:"",u:"00000000-0000-0000-0000-000000000000",dg:"00000000-0000-0000-0000-000000000000"},f=!0;else{var q=setTimeout(function(){e("Flash didnt load. Sending data...");c.fso={d:"",u:"00000000-0000-0000-0000-000000000000",dg:"00000000-0000-0000-0000-000000000000"};f=!0;b.Core.sendData(DotMetricsSettings.DataUrl,c);e("---------------------------------------")},5E3);this.Core.loadFlash(DotMetricsSettings.FlashUrl,function(a){e("Flash callback");clearTimeout(q);b.flashLoaded=!0;b.flashObject=
a;a=b.flashObject.getData();c.fso={d:a.DeviceId,u:a.UserId,dg:a.DeviceGuidId};f=!0;b.Core.sendData(DotMetricsSettings.DataUrl,c);e("---------------------------------------")});e("waiting for flash")}else c.fso={d:"",u:"00000000-0000-0000-0000-000000000000",dg:"00000000-0000-0000-0000-000000000000"},f=!0;else f=!0;d&&f?b.Core.sendData(DotMetricsSettings.DataUrl,c):(e("nothing to send"),e("---------------------------------------"))};this._timeData=[];this._requestedPingsNum=this._currentRequestNum=
0;this._onPingMeasurmentsDone;this._pingStartTime;this.measurePingTimes=function(a,b){e("Process Ping requests");this._timeData=[];this._currentRequestNum=0;this._requestedPingsNum=a;this._onPingMeasurmentsDone=b;this.makePingRequest()};this.makePingRequest=function(){this._pingStartTime=(new Date).getTime();var a=0==this._timeData.length?{ctd:0,cl:0}:this._timeData[this._timeData.length-1];a.ct=this._pingStartTime;this.Core.sendData(DotMetricsSettings.PingUrl,a)};this.HandlePing=function(a){var b=
(new Date).getTime(),c=(b-this._pingStartTime)/2;a=a.s-b-Math.abs(c);this._timeData.push({ctd:a,cl:c});e("-");e("Lag : "+c);e("Time distance : "+a);e("-");this._currentRequestNum++;if(this._currentRequestNum<this._requestedPingsNum)this.makePingRequest();else{for(b=a=c=0;b<this._timeData.length;b++)c+=this._timeData[b].ctd,a+=this._timeData[b].cl;c=Math.round(c/this._timeData.length);a=Math.round(a/this._timeData.length);a={DeviceSync:c,DeviceSyncLag:a};e("Processing ping requests done");e(this._timeData);
e("Ping averages");e(a);e("-----------------------------");this._onPingMeasurmentsDone(a)}};this.showSurvey=function(){this.surveyDone||(this.surveyDone=!0,window.open(this.Survey.SurveyUrl,"","width="+this.Survey.WindowWidth+",height="+this.Survey.WindowHeight+",scrollbars=1").focus())};this.SendTimeOnPageBeacon=function(){if(navigator.sendBeacon&&this.EnterPageEventData){var a={cd:this.EnterPageEventData.CreationDate,eid:this.EnterPageEventData.EventId,id:this.EnterPageEventData.SiteSectionId,sop:this.TimeOnPage,
vl:this.getVideoData()},b=this.getTimeOnPageDataTemplate();b.ep.push(a);return this.Core.performSendBeacon(DotMetricsSettings.BeaconUrl,b)}return!1};this.getTimeOnPageDataTemplate=function(){var a={id:DotMetricsSettings.SiteSectionId,cd:{d:this.DeviceId,u:this.UserId,dg:this.DeviceGuidId},di:null,url:window.location.href,ep:[]};this.panel&&(a.hhid=this.panelHouseholdId,a.uid=this.panelUserId);return a};this.SaveTimeOnPage=function(a){if(null!=this.EnterPageEventData){var b=this.Core.getCookie(DotMetricsSettings.TimeOnPage),
c=[];if(null!=b&&0<b.length)for(c=b.split("|"),b=c.length-1;0<=b;b--)c[b]=DotmetricsJSON.parse(c[b]),c[b].E==this.EnterPageEventData.EventId&&c.splice(b,1);a||(a={C:this.EnterPageEventData.CreationDate,E:this.EnterPageEventData.EventId,S:this.EnterPageEventData.SiteSectionId,T:this.TimeOnPage,V:this.getVideoData()},c.push(a));a="";for(b=0;b<c.length;b++)a+=DotmetricsJSON.stringify(c[b]),b<c.length-1&&(a+="|");this.Core.setCookie(DotMetricsSettings.TimeOnPage,a,30)}};this.processCookieData=function(){var a=
[],b=this.Core.getCookie(DotMetricsSettings.TimeOnPage);e("process cookie data");e(b);if(null==b||""==b)return null;b=b.split("|");for(var c=this.CreateTodayString(),d=0;d<b.length;d++)try{var f=DotmetricsJSON.parse(b[d]),g={cd:f.C,eid:f.E,id:f.S,sop:f.T,vl:f.V},k=g.cd.slice(0,10);c==k&&a.push(g)}catch(l){}0==a.length&&(a=null);e("cookie data:");e(a);e("---------------------------------------");return a};this.CreateTodayString=function(){var a=new Date,b=a.getDate(),c=a.getMonth()+1;a=a.getFullYear();
10>b&&(b="0"+b);10>c&&(c="0"+c);return a+"-"+c+"-"+b};this.CreateIframe=function(){this.iFrameHolderDiv=this.Core.CreateElement("div",{id:"DotMetricsPF",style:"display:none;width:0px;height:0px;position:absolute; left:-2000px;"},null);var a="dotmetricsframe"+this.postIndex;this.postIndex++;this.iFrameHolderDiv.style.display="none";try{this.iframe=document.createElement('<iframe name="'+a+'" style:"display:none;width:0px;height:0px;">')}catch(b){this.iframe=this.Core.CreateElement("iframe",{name:a,
id:a,style:"display:none;width:0px;height:0px;"},null)}this.iframe.id=a;this.form=this.Core.CreateElement("form",{action:DotMetricsSettings.PostUrl,method:"post",target:a,id:"DotMetricsForm"},null);this.formInput=this.Core.CreateElement("input",{type:"text",name:"v"},null);document.body.appendChild(this.iFrameHolderDiv);this.iFrameHolderDiv.appendChild(this.iframe);this.iFrameHolderDiv.appendChild(this.form);this.form.appendChild(this.formInput);document.getElementById("DotMetricsForm").target=a};
this.submitData=function(a){function b(){c.CreateIframe();c.formInput.value=DotmetricsJSON.stringify(d);c.form.submit();e("Form submit");e(d);e("-----------------------------");var a=c.iFrameHolderDiv;setTimeout(function(){document.body.removeChild(a)},5E3)}var c=this;this.Core.formPostCount++;if(!(this.Core.formPostCount>this.Core.callLimit)){var d={id:DotMetricsSettings.SiteSectionId,cd:{d:this.DeviceId,u:this.UserId,dg:this.DeviceGuidId},di:null,ds:0,dsl:0,url:window.location.href};this.panel&&
(d.hhid=this.panelHouseholdId,d.uid=this.panelUserId);if(a.deviceInfo)if(this.Core.clientInfo)d.di=this.Core.clientInfo;else{this.Core.createClientInfo(function(){c.submitData(a)});return}0<a.pings?this.measurePingTimes(a.pings,function(a){d.ds=a.DeviceSync;d.dsl=a.DeviceSyncLag;b()}):b()}};this.HandleJsonp=function(a){e("JSONP data loaded");e(a);e("-----------------------------");var b=this;this.UserId=a.UserId;this.DeviceId=a.DeviceId;this.DeviceGuidId=a.DeviceGuidId;this.deviceInfoSent&&(a.SendDeviceInfo=
!1,a.Ping=0);if(this.firstLoadDone)this.processActions(a);else{this.firstLoadDone=!0;e("Setting enter page event data");this.EnterPageEventData=a.EnterPageEventData;var c={deviceInfo:!1,pings:0};1==a.SendDeviceInfo&&0==this.deviceInfoSent&&(c.deviceInfo=!0,a.SendDeviceInfo=!1,this.deviceInfoSent=!0);a.Ping&&0<a.Ping&&(c.pings=a.Ping,a.Ping=!1);setTimeout(function(){(c.deviceInfo||c.pings)&&b.submitData(c);var d=b.processCookieData();b.Core.setCookie(DotMetricsSettings.TimeOnPage,null,0);e("Sending exit page data");
e(d);e("--------------------------------------");if(d){var f=b.getTimeOnPageDataTemplate();f.ep=d;b.Core.performAjaxPost(DotMetricsSettings.BeaconUrl,f)}b.processActions(a)},1E3*Math.random()+500)}};this.onAjaxDataUpdate=function(){var a=this;null==this.ajaxTimer&&0<window.dm.AjaxData.length&&(this.ajaxTimer=setTimeout(function(){var b=a.prepareAjaxData(window.dm.AjaxData);window.dm.AjaxData.length=0;a.ajaxTimer=null;a.Core.sendData(DotMetricsSettings.AjaxEventUrl,b)},DotMetricsSettings.AjaxEventTimeout))};
this.prepareAjaxData=function(a){var b={siteSectionId:DotMetricsSettings.SiteSectionId,domain:window.location.hostname,events:[]};this.panel&&(b.hhid=this.panelHouseholdId,b.uid=this.panelUserId);a.forEach(function(a){var c={};c.eventType=a.et?a.et:"pageview";c.eventData=a.d?a.d:null;c.eventSiteSectionId=a.ssid?a.ssid:DotMetricsSettings.SiteSectionId;parseInt(c.eventSiteSectionId)&&(c.url=a.url?a.url:window.location.href,b.events.push(c))});return b};this.trackVideos=function(){function a(a){a.addEventListener&&
a.addEventListener("load",function(b){c.searchForVideosInWindow(a.contentWindow)})}this.searchForVideosInWindow(window);for(var b=window.document.getElementsByTagName("iframe"),c=this,d=0;d<b.length;d++)a(b[d])};this.searchForVideosInWindow=function(a){try{a.jwplayer}catch(d){return}var b=[],c=0;if(a.flowplayer){for(;a.flowplayer(c);)b.push(a.flowplayer(c)),c++;for(c=0;c<b.length;c++)this.trackFP(b[c])}b=[];if(a.jwplayer){for(c=0;a.jwplayer(c).id;)b.push(a.jwplayer(c)),c++;for(c=0;c<b.length;c++)this.trackJW(b[c])}};
this.trackFP=function(a){function b(a){c.videos[a.url]={vid:a.url,w:a.width,h:a.height,vdur:a.duration,tw:0}}var c=this,d=null;a.on("resume",function(a,e){var f=e.video;c.videos[f.url]||b(f);d=f.time});a.on("seek",function(a,b){d=b.video.time});a.on("progress",function(a,e){var f=e.video;if(d){var g=f.time-d;if(0<g){if(1<g)return;c.videos[f.url]||b(f);c.videos[f.url].tw+=g}c.videos[f.url].h||(c.videos[f.url].h=f.height);c.videos[f.url].w||(c.videos[f.url].w=f.width);c.videos[f.url].vdur||(c.videos[f.url].vdur=
f.duration)}d=f.time})};this.trackJW=function(a){var b=this,c=null;a.on("play",function(d){d=a.getPlaylistItem();b.videos[d.file]||(b.videos[d.file]={vid:d.file,w:a.getWidth(),h:a.getHeight(),vdur:a.getDuration(),tw:0});c=a.getPosition()});a.on("seek",function(a){c=a.offset});a.on("time",function(d){if(c){var f=d.position-c;if(0<f){var e=a.getPlaylistItem();b.videos[e.file].tw+=f}b.videos[e.file].h||(b.videos[e.file].h=a.getHeight());b.videos[e.file].w||(b.videos[e.file].w=a.getWidth());b.videos[e.file].vdur||
(b.videos[e.file].vdur=a.getDuration())}c=d.position})};this.getVideoData=function(){var a=this.videos,b=[],c;for(c in a)if(a.hasOwnProperty(c)){var d=a[c];d.vid&&""!=d.vid&&(d.w=Math.round(d.w),d.h=Math.round(d.h),d.w||(d.w=0),d.h||(d.h=0),d.vdur=null==d.vdur?0:Math.round(d.vdur),0<d.tw&&1>d.tw&&(d.tw=1),d.tw=Math.round(d.tw),0<d.tw&&b.push(d))}return b}};e("DotMetricsSettings");e(DotMetricsSettings);e("---------------------------------------");e("Dot Metrics script loaded");top.location==self.location&&
setTimeout(function(){DotMetricsObj.Start()},100)})(window);