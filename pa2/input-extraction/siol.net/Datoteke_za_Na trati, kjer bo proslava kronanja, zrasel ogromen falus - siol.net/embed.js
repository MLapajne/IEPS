(function (wnd) {
	function send_message_to_iframes(){
		var iframes = wnd.document
			.querySelectorAll('iframe.player-embed');
		for(var ii in iframes){
			if(! iframes[ii]
				|| ! iframes[ii].contentWindow
				|| ! iframes[ii].contentWindow.postMessage){
				continue;
			}
			let keywords = wnd.document.querySelector('meta[name="keywords"]')
				? wnd.document.querySelector('meta[name="keywords"]').content
				: ''
            iframes[ii]
            	.contentWindow
                .postMessage(
                    '{' +
                    '"url":"' + wnd.document.location.href + '",' +
                    '"keywords":"' + keywords + '",' +
                    '"width":"' + wnd.innerWidth + '"' +
                    '}',
                    '*'
                );
		}
		resize_embeds();
	}
	var __si_sendmessage_watchdog = 30;
	var __si_sendmessage = setInterval(function(){
		send_message_to_iframes();
		if(__si_sendmessage_watchdog-- <= 0){
			clearInterval(__si_sendmessage);
		}
	}, 150);
	send_message_to_iframes();

	function resize_embeds(){
		Array.prototype.forEach.call(
			wnd.document.querySelectorAll('iframe.player-embed'),
			function(el, i){
				var width = el.offsetWidth
				el.style.height = (width/1.7777777)+'px'
			}
		);
	}
	wnd.addEventListener("resize", resize_embeds);
	wnd.addEventListener("load", function(){
		resize_embeds();
	});
})(window);
