function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    //console.log('statusChangeCallback');
    //console.log(response);                   // The current login status of the person.
    if (response.status === 'connected') {   // Logged into your webpage and Facebook.
        ///testAPI();  
    } else {                                 // Not logged into your webpage or we are unable to tell.
//		document.getElementById('status').innerHTML = 'Please log ' +
//        'into this webpage.';
    }
}


function checkLoginState() {               // Called when a person is finished with the Login Button.
    FB.getLoginStatus(function (response) {   // See the onlogin handler
        statusChangeCallback(response);
    });
}


window.fbAsyncInit = function () {
    
    var appID = $("#FacebookAppId").val();

    FB.init({
        appId: appID,
        cookie: true, // Enable cookies to allow the server to access the session.
        xfbml: true, // Parse social plugins on this webpage.
        version: 'v7.0'						// Use this Graph API version for this call.
    });

    FB.getLoginStatus(function (response) {   // Called after the JS SDK has been initialized.
        statusChangeCallback(response);        // Returns the login status.
    });
};


(function (d, s, id) {                      // Load the SDK asynchronously
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id))
        return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function loginFB() {
    var URL = $("#LoginUrl").val();
    FB.login(function (response) {
        if (response.status === 'connected') {
            // Logged into your webpage and Facebook.

            var AccessToken = response.authResponse.accessToken;
            var FBUserID = response.authResponse.userID;
            
            console.log(response);

            $.post($('#BASE_URL').val() + "/social-login" + URL, {
                LoginType: "facebook",
                IDToken: AccessToken,
                FBUserID: FBUserID,
                URL: URL
            }, function (data, status) {

                console.log("Data: '" + data + "'");

                if (data !== "") {
                    //console.log("reload");
                    window.location = data;
                }
            });


        } else {
            // The person is not logged into your webpage or we are unable to tell. 
        }
    }, {scope: 'public_profile, email'});
}

function logoutFB() {
    FB.logout(function (response) {
        // Person is now logged out
    });
}

function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function (response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('status').innerHTML =
                'Thanks for logging in, ' + response.name + '!';
    });
}