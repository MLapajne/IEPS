/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var BASE_URL = $("#BASE_URL").val();
var Fb_T = $("#Fb_T").val();

$(document).ready(function () {
    //$(".product_card .top").equalHeights();
    //show_step_1();
    //items_in_cart();
    //$(".select2").select2();
    $('.qty_product').prepend('<span class="dec qtybtn qtybtn_p">-</span>');
    $('.qty_product').append('<span class="inc qtybtn qtybtn_p">+</span>');
    $('.qtybtn_p').on('click', function () {
        var $button = $(this);
        var oldValue = $("#ProductQuantityInput").val();
        var MinOrder = $("#ProductMinOrder").val();
        var UUID = $("#ProductUUID").val();
        var MaxOrder = $("#ProductMaxOrder").val();
        MinOrder = parseInt(MinOrder);
        MaxOrder = parseInt(MaxOrder);

        if ($button.hasClass('inc')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > MinOrder) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = MinOrder;
            }
        }

        $("#ProductQuantityInput").val(newVal);
        //$button.parent().find('input').val(newVal);
        $("#ProductQuantity").val(newVal);

        changeQuantityInline(MinOrder, UUID, MaxOrder);
    });

});

$.fn.equalHeights = function () {
    var max_height = 0;
    $(this).each(function () {
        max_height = Math.max($(this).height(), max_height);
    });
    $(this).each(function () {
        $(this).height(max_height);
    });
};

$(window).scroll(function () {
    if ($(this).scrollTop() > 4) {
        $('.skillbar_cart').addClass("skillbar_cart_fixed");
    } else {
        $('.skillbar_cart').removeClass("skillbar_cart_fixed");
    }
});


/* RETINA */
$('body').find('img[retina]').each(function () {
    var origImg = $(this);
    var imgSRC = origImg.attr("src");
    var imgSRCSET = "";

    imgSRC = imgSRC.replace(".png", "");

    imgSRCSET = imgSRC + ".png 1x, " + imgSRC + "@2x.png 2x, " + imgSRC + "@3x.png 3x";
    origImg.attr("srcset", imgSRCSET);
});

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    email = email.replace(/ /g, '');
    return regex.test(email);
}

function isHTML(str) {
    var a = document.createElement('div');
    a.innerHTML = str;

    for (var c = a.childNodes, i = c.length; i--; ) {
        if (c[i].nodeType == 1)
            return true;
    }
    return false;
}

if ($(".cart_nav").length) {
    new Waypoint({
        element: document.querySelector('.cart_nav'),
        handler: function () {
            jQuery('.skillbar').each(function () {
                jQuery(this).find('.skillbar-bar').animate({
                    width: jQuery(this).attr('data-percent')
                }, 2000);
            });
        },
        offset: '50%'
    });
}




/* 
 * 
 * 
 * 
 * SHOP 
 * 
 * 
 * 
 * */


jQuery(document).ready(function ($) {
    //if you change this breakpoint in the style.css file (or _layout.scss if you use SASS), don't forget to update this value as well
    var $L = 1200,
            $menu_navigation = $('#main-nav'),
            $cart_trigger = $('#cd-cart-trigger'),
            $cart_trigger = $('.cd-cart-trigger'),
            $hamburger_icon = $('#cd-hamburger-menu'),
            $lateral_cart = $('#cd-cart'),
            $shadow_layer = $('#cd-shadow-layer');

    //open lateral menu on mobile
    $hamburger_icon.on('click', function (event) {
        event.preventDefault();
        //close cart panel (if it's open)
        $lateral_cart.removeClass('speed-in');
        toggle_panel_visibility($menu_navigation, $shadow_layer, $('body'));
    });

    //open cart
    $cart_trigger.on('click', function (event) {
        console.log("dre");
        event.preventDefault();
        //close lateral menu (if it's open)
        $menu_navigation.removeClass('speed-in');
        toggle_panel_visibility($lateral_cart, $shadow_layer, $('body'));
    });

    //close lateral cart or lateral menu
    $shadow_layer.on('click', function () {
        $lateral_cart.removeClass('speed-in');
        $menu_navigation.removeClass('speed-in');
        $shadow_layer.removeClass('is-visible');
        $('body').removeClass('overflow-hidden');
    });

    //move #main-navigation inside header on laptop
    //insert #main-navigation after header on mobile
    move_navigation($menu_navigation, $L);
    $(window).on('resize', function () {
        move_navigation($menu_navigation, $L);
        if ($(window).width() >= $L && $menu_navigation.hasClass('speed-in')) {
            $menu_navigation.removeClass('speed-in');
            $shadow_layer.removeClass('is-visible');
            $('body').removeClass('overflow-hidden');
        }

    });
});

function toggle_panel_visibility($lateral_panel, $background_layer, $body) {
    if ($lateral_panel.hasClass('speed-in')) {
        $lateral_panel.removeClass('speed-in');
        $background_layer.removeClass('is-visible');
        $body.removeClass('overflow-hidden');
    } else {
        $lateral_panel.addClass('speed-in');
        $background_layer.addClass('is-visible');
        $body.addClass('overflow-hidden');
    }
}

function move_navigation($navigation, $MQ) {
    if ($(window).width() >= $MQ) {
        $navigation.detach();
        $navigation.appendTo('header');
    } else {
        $navigation.detach();
        $navigation.insertAfter('header');
    }
}

function closeRightSidebar() {
    $("#cd-cart").removeClass("speed-in");
    $("#cd-shadow-layer").removeClass("is-visible");
}

function getFbClientId() {
    let result = /_fbp=(fb\.1\.\d+\.\d+)/.exec(window.document.cookie);
    if (!(result && result[1])) {
        return null;
    }
    return result[1];
}

function getFbClickId() {
    let result = /_fbc=(fb\.1\.\d+\.\S*)/.exec(window.document.cookie);
    if (!(result && result[1])) {
        return null;
    }
    return result[1];
}

function add_to_cart(UUID, MinOrder, Type) {

    $(".add_to_cart_mobile").hide();

    var Quantity = $("#ProductQuantity").val();
    MinOrder = parseInt(MinOrder);
    var S1;
//    console.log(Quantity);

    if (Quantity == "0" || Quantity == 0 || Quantity == "undefined" || Quantity == null || Quantity < MinOrder) {
        Quantity = MinOrder;
    }
//console.log(Quantity);

    if (Type != 'gift') {
        S1 = 1;
    } else {
        var Author = $("#GiftAuthor").val();
        var Text = $("#GiftText").val();

        if (Author == "") {
            $("#GiftAuthor").addClass("requiredInput");
        } else {
            $("#GiftAuthor").removeClass("requiredInput");
        }

        if (Text == "") {
            $("#GiftText").addClass("requiredInput");
        } else {
            $("#GiftText").removeClass("requiredInput");
        }

        if (Author != '' && Text != '') {
            S1 = 1;
        } else {
            S1 = 0;
        }

        Quantity = 1;
    }

    if (S1 == 1) {

        $("#cd-cart").addClass("speed-in");
        $("#cd-shadow-layer").addClass("is-visible");
        $(".add_in_cart_wrapper .content_spinner").show();

//        console.log(Quantity);
//        console.log(UUID);
        var FBPCookie = getFbClientId();
        var FBCCookie = getFbClickId();

//        console.log(FBPCookie);
//        console.log(FBCCookie);

        $.post(BASE_URL + "/add_to_cart", {
            UUID: UUID,
            Quantity: Quantity,
            Type: Type,
            Author: Author,
            Text: Text,
            FBPCookie: FBPCookie,
            FBCCookie: FBCCookie
        }, function (data, status) {
            if (status == "success") {

//                console.log(data);

                var n = JSON.parse(data);
                var Location = n.Location;
                var Price = n.Price;
                var CAPICodeAddToCart = n.CAPICodeAddToCart;
                var MKID = n.MKID;
                var Currency = n.Currency;
                var Contents = n.Contents;

                if (Fb_T == 1) {
                    fbq('track', 'AddToCart', {
                        value: Price,
                        currency: Currency,
                        content_type: 'product',
                        content_ids: '[' + MKID + ']',
                        contents: Contents,
                    }, {eventID: CAPICodeAddToCart});
                }
                
                var CheckGTMLanguage = n.CheckGTMLanguage;
                
                if (CheckGTMLanguage == 1) {
                    var GTMItems = n.GTMItems;

                    dataLayer.push({ecommerce: null});  // Clear the previous ecommerce object.
                    dataLayer.push({
                        event: "add_to_cart",
                        ecommerce: {
                            currency: Currency,
                            value: Price,
                            items: GTMItems
                        }
                    });
                }

                if (Location == "") {
                    $(".add_in_cart_wrapper .content_spinner").hide();
                    items_in_cart();
                    check_items_in_cart();
                } else {
                    location.href = Location;
                }


            }
        });
    }
}

function select_product_quantity(ID, ProductUUID, Price) {

    $.post(BASE_URL + "/change_prices", {
        ID: ID,
        ProductUUID: ProductUUID,
        Price: Price
    }, function (data, status) {

        $(".price_text").html(data);
        $(".right_price_btn").removeClass("selected_buy");
        $("#Price" + ID).addClass("selected_buy");
        $("#ProductQuantity").val(ID);
        $("#ProductQuantityInput").val(ID);

    });

}


function get_total_price() {
    $.post(BASE_URL + "/get_total_price", {
    }, function (data, status) {
        //console.log(data);
        var n = JSON.parse(data);
        var TotalPrice = n.TotalPrice;
        var DeliveryPrice = n.DeliveryPrice;
        var FreeDeliveryPrice = n.FreeDeliveryPrice;
        var DiscountPrice = n.DiscountPrice;
        var DiscountTitle = n.DiscountTitle;
        var FinalPrice = n.FinalPrice;
        var PaymentType = n.PaymentType;
        var TotalPriceBasic = n.TotalPriceBasic;
        var TotalPriceStep2 = n.TotalPriceStep2;

//        var DoublePrice = n.DoublePrice;
//        var ItemsInCartDeliveryFreePriceDouble = n.ItemsInCartDeliveryFreePriceDouble;

//        console.log(DiscountPrice);
//        console.log(DeliveryPrice);
//        console.log(TotalPriceStep2);

        //sidebar 
        $("#ItemInCartTotal").html(TotalPrice);
        $("#ItemInCartTotalPriceStep2").html(TotalPriceStep2);
        //overview
        $("#FinalPrice").html(FinalPrice);
        $("#DiscountTitle").html(DiscountTitle);
        $("#DiscountPrice").html(DiscountPrice);
        $("#DeliveryPrice").html(DeliveryPrice);
        $("#ItemsInCartDeliveryFreePrice").html(FreeDeliveryPrice);
        $("#TotalPrice").html(TotalPrice);
        $("#PaymentTypeText").html(PaymentType);
        $("#ItemInCartTotalBasic").html(TotalPriceBasic);

//        $("#DoublePrice").html(DoublePrice);
//        $("#ItemsInCartDeliveryFreePriceDouble").html(ItemsInCartDeliveryFreePriceDouble);

        if (DiscountTitle == "") {
            $(".promocode_text_box").hide();
        } else {
            $(".promocode_text_box").show();
            $("#ItemPromocodeTitle").html(DiscountTitle);
        }

    });
}

function open_shop_nav() {
    $("#cd-cart").addClass("speed-in");
    $("#cd-shadow-layer").addClass("is-visible");
    items_in_cart();
}

function close_shop_nav() {
    $("#cd-cart").removeClass("speed-in");
    $("#cd-shadow-layer").removeClass("is-visible");
}


function changeQuantityInline(MinOrder, UUID, MaxOrder) {
    var Quantity = $("#ProductQuantityInput").val();

    $(".change_quantity_error").hide();

    MinOrder = parseInt(MinOrder);
    Quantity = parseInt(Quantity);
//    MaxOrder = parseInt(MaxOrder);

    if (!$.isNumeric(Quantity)) {
        if (Quantity < MinOrder) {
            Quantity = MinOrder;
        }
    }

    if (Quantity > MaxOrder) {
        Quantity = MaxOrder;
        $(".change_quantity_error").fadeIn();
    }

    $.post(BASE_URL + "/change_quantity_inline", {
        Quantity: Quantity,
        UUID: UUID
    }, function (data, status) {
        $(".price_text").html(data);
//        console.log(data);
    });

    $("#ProductQuantityInput").val(Quantity);
    $("#ProductQuantity").val(Quantity);
}

function changeQuantity(ID, QuantityInput, Location, MinOrder) {
    var Quantity;
    var QuantityStep;

    Quantity = parseInt(Quantity);
    QuantityStep = parseInt(QuantityStep);
    MinOrder = parseInt(MinOrder);

//    console.log(ID);
//    console.log(QuantityInput);
//    console.log(Location);
//    console.log(MinOrder);

    if (QuantityInput == "input") {
        QuantityStep = $("#" + ID).val();
        if (!$.isNumeric(QuantityStep) || QuantityStep < MinOrder) {
            Quantity = MinOrder;
            $("#" + ID).val(MinOrder);
        } else {
            Quantity = QuantityStep;
        }
    } else {
        if (QuantityInput < MinOrder) {
            Quantity = MinOrder;
            $("#" + ID).val(MinOrder);
        } else {
            Quantity = QuantityInput;
        }
    }

    $(".add_in_cart_wrapper .content_spinner").show();

    $.post(BASE_URL + "/change_quantity", {
        Quantity: Quantity,
        UUID: ID
    }, function (data, status) {
        var n = JSON.parse(data);
        var Price = n.Price;
        var Status = n.Status;

        $(".change_quantity_error").hide();

        $("#SingleItem_" + ID + " .price span").html(Price);

        if (Status != '') {
            $("#ChangeQuantityText_" + ID).fadeIn();
        }


        /* LOADER */
        $("#GiftBox .content_spinner").show();
        //get_total_price();
        showGiftBox();
        check_items_in_cart();
        //items_in_cart, items_in_cart_steps

        setTimeout(function () {
            if (Location == "steps") {
                items_in_cart_steps();
                check_min_order_price();
            } else {
                items_in_cart();
            }
            $(".add_in_cart_wrapper .content_spinner").hide();
        }, 1500);




    });
}

function step2AddProduct(UUID) {

    $(".add_in_cart_wrapper .content_spinner").show();
    var PrimaryQuantity = $("#" + UUID).val();

    var ThisQuantity = parseInt(PrimaryQuantity) + 1;

    $.post(BASE_URL + "/change_quantity", {
        Quantity: ThisQuantity,
        UUID: UUID,
        Step: 'step2'
    }, function (data, status) {
        var n = JSON.parse(data);
        var Price = n.Price;
        var Status = n.Status;

        $(".change_quantity_error").hide();
        $("#SingleItem_" + UUID + " .price span").html(Price);

        if (Status != '') {
            $("#ChangeQuantityText_" + UUID).fadeIn();
        }

        /* LOADER */
        $("#GiftBox .content_spinner").show();
        get_total_price();
        showGiftBox();
        check_items_in_cart();

        setTimeout(function () {
            items_in_cart_steps();
            $(".add_in_cart_wrapper .content_spinner").hide();
        }, 1000);

        var NewQuantity = parseInt(PrimaryQuantity) + 1;
        $("#" + UUID).val(NewQuantity);

    });
}

function remove_item(UUID, Type) {

    $("#SingleItem_" + UUID).slideUp();
    $(".add_in_cart_wrapper .content_spinner").show();
    $.post(BASE_URL + "/delete_product", {
        UUID: UUID
    }, function (data, status) {

        var n = JSON.parse(data);
        var GiftStatus = n.GiftStatus;
        console.log(GiftStatus);

        /* LOADER */
        $("#GiftBox .content_spinner").show();
        if (Type == "sidebar") {
            showGiftBox();
            get_total_price();
            setTimeout(function () {
                items_in_cart();
                check_min_order_price();
            }, 1000);
        } else if (Type == "steps") {
            showGiftBox();
            get_total_price();
            setTimeout(function () {
                items_in_cart_steps();
            }, 1000);

            if (GiftStatus == false) {
                $("#SecondAddressWrap").hide();
                $(".delivery_box").hide();
            } else {
                $("#SecondAddressWrap").show();
                $(".delivery_box").show();
            }
        }
        check_items_in_cart(Type);
        $(".add_in_cart_wrapper .content_spinner").hide();
    });
}


function check_items_in_cart(Type) {

    $.post(BASE_URL + "/check_items_in_cart", {
    }, function (data, status) {
        var n = JSON.parse(data);
        var SUM = n.SUM;
        if (SUM == 0) {
            $(".numberInCart").css("display", "none");
            $(".cart_box").removeClass("cart_box_active");
            if (Type == "steps") {
                location.reload();
            }
        } else {
            $(".numberInCart").css("display", "block");
            $(".cart_box").addClass("cart_box_active");
            $(".numberInCart").html(SUM);
        }
    });
}


function items_in_cart() {
    $.post(BASE_URL + "/items_in_cart", {
        Type: 'sidebar'
    }, function (data, status) {
        if (status == "success") {
            $("#cd-cart").html(data);
        }
    });
}


function items_in_cart_steps() {
    $.post(BASE_URL + "/items_in_cart", {
        Type: "steps"
    }, function (data, status) {
        if (status == "success") {
            $("#cart_overview_box").html(data);
            //console.log(data);
        }
    });
}

function items_payments() {
    $.post(BASE_URL + "/items_in_cart", {
        Type: 'steps',
        Location: 'payments'
    }, function (data, status) {
        if (status == "success") {
            $("#cart_overview_box").html(data);
        }
    });
}

function show_step_1() {
    $.post(BASE_URL + "/show_cart_step1", {
    }, function (data, status) {
        if (status == "success") {

            $("#step_1").collapse('show');
            $(".step_1_box").html(data);
            $(".btn-header-link").addClass("collapsed");
            $("#head_1 .btn-header-link").removeClass("collapsed");
            check_cart_steps(1);
            $(".change_step1").hide();
            $("#CartSkillbar").css("width", "25%");
            $(".skillbar_cart").attr("data-percent", "25%");
            $(".required").removeClass("requiredInput");
            $(".step1_select").removeClass("requiredInput");

//            var URL = "?step=step1";
//            history.pushState({}, null, URL);
        }
    });
}

function show_step_2() {
    $.post(BASE_URL + "/show_cart_step2", {
    }, function (data, status) {
        if (status == "success") {

            /* LOADER */
            $("#GiftBox .content_spinner").show();

            $("#step_2").collapse('show');
            $(".step_2_box").html(data);
            $(".btn-header-link").addClass("collapsed");
            $("#head_2 .btn-header-link").removeClass("collapsed");
            check_cart_steps(2);

            $(".select2").select2();
            $(".skillbar_cart").attr("data-percent", "50%");
            $("#CartSkillbar").css("width", "50%");

            setTimeout(function () {
                items_in_cart_steps();
                $(".add_in_cart_wrapper .content_spinner").hide();
            }, 1000);

            $("#PasswordStep1").removeClass("required");
            $(".required").removeClass("requiredInput");
            $(".step1_select").removeClass("requiredInput");

            showGiftBox();
            check_min_order_price();
//            var URL = "?step=step2";
//            history.pushState({}, null, URL);
        }
    });
}

function show_step_3() {
    $.post(BASE_URL + "/show_cart_step3", {
    }, function (data, status) {
        if (status == "success") {
            $("#step_3").collapse('show');
            $(".step_3_box").html(data);
            $(".btn-header-link").addClass("collapsed");
            $("#head_3 .btn-header-link").removeClass("collapsed");
            check_cart_steps(3);
            $(".select2").select2();
            $(".skillbar_cart").attr("data-percent", "75%");
            $("#CartSkillbar").css("width", "75%");
//            var URL = "?step=step3";
//            history.pushState({}, null, URL);
        }
    });
}



function check_email_step1(Type) {
    
    $("#CheckEmailLoader").show();
    
    var Email = $("#EmailStep1").val();
    if (Email == "") {
        $("#EmailStep1").addClass("requiredInput");
    } else {
        if (!isEmail(Email)) {
            $("#EmailStep1").addClass("requiredInput");
        } else {
            $("#EmailStep1").removeClass("requiredInput");
        }
    }

    if (Type == "guest") {
        $("#PasswordStep1").removeClass("required");
        $("#PasswordStep1").removeClass("requiredInput");
    }

    if (!$(".requiredInput")[0]) {
        $.post(BASE_URL + "/check_email_step1", {
            Email: Email
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Status = n.Status;
                var ErrorText = n.ErrorText;
                var StatusRecaptcha = n.StatusRecaptcha;
                
                 $("#CheckEmailLoader").hide();
                
                if(StatusRecaptcha == false){
                    $(".login_user_error").html(ErrorText);
                    $(".login_user_error").fadeIn();
                    return false;
                }else{
                    $(".login_user_error").hide();
                }
               
                
                if (Status == true && Type != 'guest') {
                    $(".existing_box").fadeIn();
                    $(".step1 .password_input").fadeIn();
                    $(".cta_next_step.primary_cta").hide();
                    $(".cta_next_step.secondary_cta").css("display", "block");
                    $(".step1 .cta_step_back").css("display", "block");
                } else {
                    
                    $(".step1 .password_input").hide();
                    $("#PasswordStep1").val("");
                    $("#PasswordStep1").removeClass("requiredInput");
                    submit_step_1(Email);
                }
            }
        });
    }
}


function check_email_step1_validation(Type) {
    
    
    $("#CheckEmailLoader").show();
    
    var Email = $("#EmailStep1").val();
    if (Email == "") {
        $("#EmailStep1").addClass("requiredInput");
    } else {
        if (!isEmail(Email)) {
            $("#EmailStep1").addClass("requiredInput");
        } else {
            $("#EmailStep1").removeClass("requiredInput");
        }
    }

    if (Type == "guest") {
        $("#PasswordStep1").removeClass("required");
        $("#PasswordStep1").removeClass("requiredInput");
    }
    
    var grecaptchaStatus;
    
    if (!$('.g-recaptcha-response').val()) {
        grecaptchaStatus = 0;
        $(".recaptcha-text").slideDown();
    } else {
        grecaptchaStatus = 1;
        $(".recaptcha-text").slideUp();
    }

    var UserResponse = grecaptcha.getResponse();

    if (!$(".requiredInput")[0] && grecaptchaStatus != 0) {
        $.post(BASE_URL + "/check_email_step1", {
            Email: Email,
            UserResponse: UserResponse
        }, function (data, status) {
            if (status == "success") {
                console.log(data);
                var n = JSON.parse(data);
                var Status = n.Status;
                var ErrorText = n.ErrorText;
                var StatusRecaptcha = n.StatusRecaptcha;
                
                $("#CheckEmailLoader").hide();
                
                if(StatusRecaptcha == false){
                    $(".login_user_error").html(ErrorText);
                    $(".login_user_error").fadeIn();
                    return false;
                }else{
                    $(".login_user_error").hide();
                }
                
                
                
                
                if (Status == true && Type != 'guest') {
                    $(".existing_box").fadeIn();
                    $(".step1 .password_input").fadeIn();
                    $(".cta_next_step.primary_cta").hide();
                    $(".cta_next_step.secondary_cta").css("display", "block");
                    $(".step1 .cta_step_back").css("display", "block");
                } else {
                    $(".step1 .password_input").hide();
                    $("#PasswordStep1").val("");
                    $("#PasswordStep1").removeClass("requiredInput");
                    submit_step_1(Email);
                }
            }
        });
    }
}

function submit_step_1(Email) {
    var Password = $("#PasswordStep1").val();

    if (Email == "") {
        var Email = $("#EmailStep1").val();

        if (Email == '') {
            if (!isEmail(Email)) {
                $("#EmailStep1").addClass("requiredInput");
            }
        }
    } else {
        Password = "none";
    }

    if (Password == "") {
        $("#PasswordStep1").addClass("requiredInput");
    }
    
    console.log(Email);

    if (!$(".requiredInput")[0]) {
        $.post(BASE_URL + "/submit_step1", {
            Email: Email,
            Password: Password
        }, function (data, status) {
            if (status == "success") {
                
                console.log(data);

                var n = JSON.parse(data);
                var Status = n.Status;
                var ErrorText = n.ErrorText;

                if (Status == true) {
                    $("#step_2").collapse('show');
                    $("#EmailStep1").removeClass("requiredInput");
                    show_step_2();
                    $("#PasswordStep1").removeClass("required");
                } else {
                    $(".login_user_error").html(ErrorText);
                    $(".login_user_error").fadeIn();
                    $(".cta_step_back").fadeIn();
                }

            }
        });
    }
}


function continue_to_step2() {
    $("#step_2").collapse('show');
    show_step_2();
}

function step1_change_email() {
    $.post(BASE_URL + "/step1_change_email", {
    }, function (data, status) {
        if (status == "success") {
            show_step_1();
            $(".change_step2").hide();
            $(".change_step3").hide();
        }
    });
}


function changeCartCountry(Type) {

    var CountryCode;

    if (Type == "basic") {
        CountryCode = $("#CountryCode").val();
    } else {
        CountryCode = $("#CountryCodeSecond").val();
    }

    if (CountryCode == "SI" || CountryCode == "IT" || CountryCode == "HR") {

        if (Type == "basic") {
            $("#ManualPostBasic").hide();
            $("#AutoPostBasic").show();
        } else {
            $("#ManualPostSecond").hide();
            $("#AutoPostSecond").show();
        }

        $.post(BASE_URL + "/get_post_data", {
            CountryCode: CountryCode,
            Type: Type
        }, function (data, status) {
            if (status == "success") {
                if (Type == "basic") {
                    $("#AutoPostBasic").html(data);
                } else {
                    $("#AutoPostSecond").html(data);
                }
            }
        });
        if (Type == "basic") {
            $("#Post").removeClass("requiredInput");
            $("#PostNumber").removeClass("requiredInput");
        } else {
            $("#PostSecond").removeClass("requiredInput");
            $("#PostNumberSecond").removeClass("requiredInput");
        }
    } else {
        if (Type == "basic") {
            $("#ManualPostBasic").show();
            $("#AutoPostBasic").hide();
            $("#Post").addClass("required");
            $("#PostNumber").addClass("required");
            $("#PostNumberID").val(0);
            $("#Post").val("");
            $("#PostNumber").val("");
        } else {
            $("#ManualPostSecond").show();
            $("#AutoPostSecond").hide();
            $("#PostSecond").addClass("required");
            $("#PostNumberSecond").addClass("required");
            $("#PostNumberIDSecond").val(0);
            $("#PostSecond").val("");
            $("#PostNumberSecond").val("");
        }
    }

    var CheckRightDelivery;

    if (Type == "basic") {
        if ($("#SecondAddress").is(":checked")) {
            CheckRightDelivery = 0;
        } else {
            CheckRightDelivery = 1;
        }
    } else {
        CheckRightDelivery = 1;
    }

    $.post(BASE_URL + "/change_order_country", {
        CountryCode: CountryCode,
        Type: Type,
        CheckRightDelivery: CheckRightDelivery
    }, function (data, status) {
        if (status == "success") {
            console.log(data);
            var n = JSON.parse(data);
            var DeliveryDate = n.DeliveryDate;
            $("#EstimatedDeliveryLabel").html(DeliveryDate);
            items_in_cart_steps();
        }
    });

}


function check_cart_steps(Step) {
    $.post(BASE_URL + "/check_cart_steps", {

    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var Step1 = n.Step1;
            var Step2 = n.Step2;
            var Step3 = n.Step3;

            if (Step == "1") {
                if (Step2 == "1") {
                    $(".change_step2").show();
                } else {
                    $(".change_step2").hide();
                }
                if (Step3 == "1") {
                    $(".change_step3").show();
                } else {
                    $(".change_step3").hide();
                }
                $(".change_step1").hide();
            } else if (Step == "2") {
                if (Step1 == "1") {
                    $(".change_step1").show();
                } else {
                    $(".change_step1").hide();
                }
                if (Step3 == "1") {
                    $(".change_step3").show();
                } else {
                    $(".change_step3").hide();
                }
                $(".change_step2").hide();
            } else if (Step == "3") {
                if (Step1 == "1") {
                    $(".change_step1").show();
                } else {
                    $(".change_step1").hide();
                }
                if (Step2 == "1") {
                    $(".change_step2").show();
                } else {
                    $(".change_step2").hide();
                }
                $(".change_step3").hide();
            }
        }
    });
}


function toggleCompanyData() {
    $(".company_box").fadeToggle();
    $("#Company").toggleClass("required");
    $("#TAXNumber").toggleClass("required");
    $("#Company").removeClass("requiredInput");
    $("#TAXNumber").removeClass("requiredInput");
}

function toggleGiftCard() {
    $(".sendgiftcard_box").fadeToggle();
    $("#Company").toggleClass("required");
    $("#TAXNumber").toggleClass("required");
    $("#Company").removeClass("requiredInput");
    $("#TAXNumber").removeClass("requiredInput");
}




function toggleSecondAddress() {
    $(".second_address_box").fadeToggle();
    $(".select2").css("width", "100%");

    if ($("#SecondAddress").is(":checked")) {
        $("#FirstnameSecond").addClass("required");
        $("#LastnameSecond").addClass("required");
        $("#AddressSecond").addClass("required");
        $("#CountryCodeSecond").addClass("required");
        $("#PostNumberSecond").addClass("required");
        $("#PostSecond").addClass("required");
        $("#PhoneSecond").addClass("required");

    } else {
        $("#FirstnameSecond").removeClass("required").removeClass("requiredInput");
        $("#LastnameSecond").removeClass("required").removeClass("requiredInput");
        $("#AddressSecond").removeClass("required").removeClass("requiredInput");
        $("#CountryCodeSecond").removeClass("required").removeClass("requiredInput");
        $("#PostNumberSecond").removeClass("required").removeClass("requiredInput");
        $("#PostSecond").removeClass("required").removeClass("requiredInput");
        $("#PhoneSecond").removeClass("required").removeClass("requiredInput");

        var CountryCode = $("#CountryCode").val();

        $.post(BASE_URL + "/update_primary_delivery", {
            CountryCode: CountryCode
        }, function (data, status) {
            if (status == "success") {
                console.log(data);
                var n = JSON.parse(data);
                var DeliveryDate = n.DeliveryDate;
                $("#EstimatedDeliveryLabel").html(DeliveryDate);
                items_in_cart_steps();
            }
        });


    }

    //check_for_second_delivery();

}


//function check_for_second_delivery() {
//    
//    var CountryCode;
//    var Type;
//    
////    if ($("#SecondAddress").is(":checked")) {
////        CountryCode = $("#CountryCodeSecond").val();
////        Type = "second";
////    }else{
////        CountryCode = $("#CountryCode").val();
////        Type = "basic";
////    } 
//    
//    $.post(BASE_URL + "/check_for_second_delivery", {
//        CountryCode: CountryCode,
//        Type: Type
//    }, function (data, status) {
//        if (status == "success") {
//            console.log(data);
//            var n = JSON.parse(data);
//            
////            var DeliveryDate = n.DeliveryDate;
////            $("#EstimatedDeliveryLabel").html(DeliveryDate);
////            items_in_cart_steps();
//        }
//    });
//    
//    
//    
//}

function submit_step2() {

    $('input.required').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
            $(window).scrollTop(0);
        } else {
            $(this).removeClass("requiredInput");
        }
    });


    $("#PromocodeTitle").removeClass("requiredInput");

    /* BASIC DATA */

    var CountryCode = $("#CountryCode").val();
    var TAXNumber = $("#TAXNumber").val();


    if ($("#CompanyData").is(":checked")) {
        checkVATNumber(CountryCode, TAXNumber);

        var CheckVATNumber = $("#CheckVATNumber").val();

        if (CheckVATNumber == "0") {
            $("#TAXNumber").addClass("requiredInput");
        } else {
            $("#TAXNumber").remove("requiredInput");
        }

    }




    if (CountryCode == "0") {
        $(".country_select").addClass("requiredInput");
    } else {
        $(".country_select").removeClass("requiredInput");
    }

    /* GET POST DATA */

    var Post = $("#Post").val();
    var PostID = $("#PostNumberID").val();
    var PostNumber = $("#PostNumber").val();

    if (CountryCode == "SI" || CountryCode == "IT" || CountryCode == "HR") {
        $("#Post").removeClass("requiredInput");
        $("#PostNumber").removeClass("requiredInput");
        $("#Post").val("");
        $("#PostNumber").val();

        if (PostID != '0') {
            $(".post_select").removeClass("requiredInput");
        } else {
            $(".post_select").addClass("requiredInput");
        }
    } else {
        $("#Post").addClass("requiredInput");
        $("#PostNumber").addClass("requiredInput");

        if (Post == "") {
            $("#Post").addClass("requiredInput");
        } else {
            $("#Post").removeClass("requiredInput");
        }

        if (PostNumber == "") {
            $("#PostNumber").addClass("requiredInput");
        } else {
            $("#PostNumber").removeClass("requiredInput");
        }
    }

    /* SECOND DATA */

    if ($("#CreateUser").is(":checked")) {
        //check pass
        var Password = $("#Password").val();
        var RepeatPasword = $("#RepeatPassword").val();
        var upperCase = new RegExp('[A-Z]');
        var PasswordInserted = $("#PasswordInserted").val();

        console.log(PasswordInserted);

        if (PasswordInserted == "1") {
            $("#Password").removeClass("requiredInput");
            $("#RepeatPassword").removeClass("requiredInput");
            $("#ErrorRegister").slideUp();
        } else {
            if (Password != RepeatPasword && Password != '' && RepeatPasword != '') {
                $("#Password").addClass("requiredInput");
                $("#RepeatPassword").addClass("requiredInput");
                $("#ErrorRegister").slideDown();
            } else {
                if (Password.length <= 6) {
                    $("#Password").addClass("requiredInput");
                    $("#RepeatPassword").addClass("requiredInput");
                    S1 = 0;
                    $("#ErrorRegister").slideDown();
                } else {
                    if (Password.match(upperCase)) {
                        $("#Password").removeClass("requiredInput");
                        $("#RepeatPassword").removeClass("requiredInput");
                        $("#ErrorRegister").slideUp();
                    } else {
                        $("#Password").addClass("requiredInput");
                        $("#RepeatPassword").addClass("requiredInput");
                        $("#ErrorRegister").slideDown();
                    }
                }
            }
        }

    } else {
        $("#Password").removeClass("requiredInput");
        $("#RepeatPassword").removeClass("requiredInput");
    }

    if ($("#SecondAddress").is(":checked")) {
        // set second country
        var CountryCodeSecond = $("#CountryCodeSecond").val();

        if (CountryCodeSecond == "0") {
            $(".country_select_second").addClass("requiredInput");
        } else {
            $(".country_select_second").removeClass("requiredInput");
        }

        if (CountryCodeSecond == "SI" || CountryCodeSecond == "IT" || CountryCodeSecond == "HR") {

            $("#PostNumberSecond").removeClass("required");
            $("#PostSecond").removeClass("required");
            $("#PostNumberSecond").removeClass("requiredInput");
            $("#PostSecond").removeClass("requiredInput");

            var PostIDSecond = $("#PostNumberIDSecond").val();

            if (PostIDSecond != '0') {
                $(".post_select_second").removeClass("requiredInput");
            } else {
                $(".post_select_second").addClass("requiredInput");
            }

        } else {

            var PostSecond = $("#PostSecond").val();
            var PostNumberSecond = $("#PostNumberSecond").val();

            $("#PostSecond").addClass("requiredInput");
            $("#PostNumberSecond").addClass("requiredInput");

            if (PostSecond == "") {
                $("#PostSecond").addClass("requiredInput");
            } else {
                $("#PostSecond").removeClass("requiredInput");
            }

            if (PostNumberSecond == "") {
                $("#PostNumberSecond").addClass("requiredInput");
            } else {
                $("#PostNumberSecond").removeClass("requiredInput");
            }

            $("#PostNumberIDSecond").removeClass("required");
            $("#PostNumberIDSecond").removeClass("requiredInput");

        }
    } else {
        $(".country_select_second").removeClass("requiredInput");
    }

    // CHECK IF BASIC DATA HAVE RequiredInput */

    var BasicDataCounter = 0;

    $('.basic_data.required').each(function () {
        if (!$(this).val()) {
            BasicDataCounter++;
        }
    });

    if (BasicDataCounter != 0) {
        $(".basic_data_box").show();
        $(".basic_data_list").hide();
    }

    if (!$(".requiredInput")[0]) {
        $.post(BASE_URL + "/submit_step2", $('.step2_form').serialize(), function (data, status) {
            if (status == 'success') {
                var n = JSON.parse(data);
                var MinOrderStatus = n.MinOrderStatus;

                if (MinOrderStatus == false) {
                } else {
                    $("#step_3").collapse('show');
                    show_step_3();
                }

            }
        });
    }
}

function check_min_order_price() {
    $.post(BASE_URL + "/check_min_order_price", {
    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var MinOrderStatus = n.MinOrderStatus;
            var OrderPrice = n.OrderPrice;

            if (MinOrderStatus == false) {
                $("#MinOrderPrice").html(OrderPrice);
                $("#MinOrderPriceBox").show();
                $(".cta_next_step").addClass("disabled_cart");
            } else {
                $("#MinOrderPriceBox").hide();
                $(".cta_next_step").removeClass("disabled_cart");
            }
        }
    });
}

function checkVATNumber(CountryCode, TAXNumber) {

    var TAXNumber = $("#TAXNumber").val();

    $.post(BASE_URL + "/check_vat_number", {
        CountryCode: CountryCode,
        TAXNumber: TAXNumber
    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var CheckVATNumber = n.CheckVATNumber;

            if (CheckVATNumber == false || CheckVATNumber == null) {
                $("#CheckVATNumber").val("0");
            } else {
                $("#CheckVATNumber").val("1");
            }

        }
    });
}


function showGiftBox() {
    $.post(BASE_URL + "/show_gift_box", {
    }, function (data, status) {
        if (status == "success") {
            $("#GiftBox").html(data);
            $(".eq3").equalHeights();
        }
    });
}


function change_gift_product(ProductUUID, Type) {

    if (!$("#GiftProduct_" + ProductUUID).hasClass("active_gift")) {
        $.post(BASE_URL + "/change_gift_product", {
            ProductUUID: ProductUUID
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Product1UUID = n.Product1UUID;
                var Product2UUID = n.Product2UUID;
                $(".gift_product").removeClass("active_gift");

                if (Product1UUID != '') {
                    $("#GiftProduct_" + Product1UUID).addClass("active_gift");
                }
                if (Product2UUID != '') {
                    $("#GiftProduct_" + Product2UUID).addClass("active_gift");
                }
                items_in_cart_steps();
            }
        });
    }

}


function submit_step3() {

    var S1;

    if ($("#Terms").is(":checked")) {
        S1 = 1;
        $("#Terms_wrapper").removeClass("requiredCheckbox");
    } else {
        S1 = 0;
        $("#Terms_wrapper").addClass("requiredCheckbox");
    }

    var CAPICode = $("#CAPICode").val();

    if ($("#TermsAndCondition").is(":checked")) {
       return false;
    }

    if (S1 == "1") {
        $.post(BASE_URL + "/submit_step3", {
            CAPICode: CAPICode
        }, function (data, status) {
            if (status == "success") {

                var n = JSON.parse(data);
                var Location = n.Location;

                location.href = Location;
            }
        });
    }
}


function changePackageInsurance() {

    var PackageInsurance;

    if ($("#PackageInsurance").is(":checked")) {
        PackageInsurance = 1;
        $("#PackageInsurance_wrapper").addClass("active_checkbox");
    } else {
        PackageInsurance = 2;
        $("#PackageInsurance_wrapper").removeClass("active_checkbox");
    }


    $.post(BASE_URL + "/change_package_insurance", {
        PackageInsurance: PackageInsurance
    }, function (data, status) {
        if (status == "success") {
            get_total_price();
        }
    });
}


function changePriorityOrder() {

    var PriorityOrder = 1;

    if ($("#PriorityOrder").is(":checked")) {
        PriorityOrder = 1;
        $("#PriorityOrder_wrapper").addClass("active_checkbox");
    } else {
        PriorityOrder = 2;
        $("#PriorityOrder_wrapper").removeClass("active_checkbox");
    }

    $.post(BASE_URL + "/change_priority_order", {
        PriorityOrder: PriorityOrder
    }, function (data, status) {
        if (status == "success") {
            get_total_price();
        }
    });
}


function change_delivery() {
    var DeliveryID = $("#DeliveryID:checked").val();

    $(".deliveries_checkbox").removeClass("active_checkbox");
    $("#Deliveries_wrapper_" + DeliveryID).addClass("active_checkbox");

    $.post(BASE_URL + "/change_delivery", {
        DeliveryID: DeliveryID
    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var DeliveryPrice = n.DeliveryPrice;
            var DeliveryPriceCOD = n.DeliveryPriceCOD;
            //var DeliveryPriceCOD = n.DeliveryPriceCOD;
//            $("#DeliveryTitle_CC span").html(DeliveryPrice);
//            $("#DeliveryTitle_PP span").html(DeliveryPrice);
//            $("#DeliveryTitle_TRR span").html(DeliveryPrice);
//            $("#DeliveryTitle_COD span").html(DeliveryPriceCOD);

            get_total_price();
        }
    });
}

function change_payment_type() {
    var PaymentType = $("#PaymentType:checked").val();

    $.post(BASE_URL + "/change_payment_type", {
        PaymentType: PaymentType
    }, function (data, status) {
        if (status == "success") {
            console.log(data);
            get_total_price();
        }
    });
}


function toogleBasicUserData() {
    $(".basic_data_box").fadeToggle();
    $(".basic_data_content").toggle();
}


function toggleNewUserData() {
    $(".create_user_box").fadeToggle();
    $("#Password").toggleClass("required");
    $("#RepeatPassword").toggleClass("required");
    $("#Password").removeClass("requiredInput");
    $("#RepeatPassword").removeClass("requiredInput");
}


function submit_promocode() {
    var Title = $("#PromocodeTitle").val();

    if (Title == "") {
        $("#PromocodeTitle").addClass("requiredInput");
    } else {
        $("#PromocodeTitle").removeClass("requiredInput");
    }

    if (Title != '') {
        $.post(BASE_URL + "/submit_promocode", {
            Title: Title
        }, function (data, status) {
            if (status == "success") {
                console.log(data);
                var n = JSON.parse(data);
                var PromocodeStatus = n.PromocodeStatus;
                var ErrorText = n.ErrorText;
                var PrimaryText = n.PrimaryText;

                $(".add_in_cart_wrapper .content_spinner").show();
                if (PromocodeStatus == false) {
                    $(".promocode_error").fadeIn().delay(2000).fadeOut();
                    $(".promocode_error").html(ErrorText);
                    $(".add_in_cart_wrapper .content_spinner").hide();
                } else {
                    $(".promocode_error").fadeOut();
                    $(".promocode_error").html("");
                    $(".promocode_box button.btn_add_promocode").html(ErrorText);
                    $(".promocode_box button.btn_add_promocode").addClass("active_promocode_btn");
                    $("#PromocodeTitle").val("");
                    get_total_price();

                    setTimeout(function () {
                        $(".promocode_box button.btn_add_promocode").html(PrimaryText);
                        $(".promocode_box button.btn_add_promocode").removeClass("active_promocode_btn");
                        items_in_cart_steps();
                        check_min_order_price();
                        $(".add_in_cart_wrapper .content_spinner").hide();
                        $(".btn_remove_promocode").show();
                    }, 2000);
                }
            }
        });
    }

}


function submit_giftcode() {
    var Title = $("#PromocodeGiftTitle").val();

    if (Title == "") {
        $("#PromocodeGiftTitle").addClass("requiredInput");
    } else {
        $("#PromocodeGiftTitle").removeClass("requiredInput");
    }


    if (Title != '') {
        $.post(BASE_URL + "/submit_giftcode", {
            Title: Title
        }, function (data, status) {
            if (status == "success") {

                console.log(data);

                var n = JSON.parse(data);
                var Status = n.Status;
                var Text = n.Text;
                var PrimaryText = n.PrimaryText;
                var FinalPrice = n.FinalPrice;
                var NewPrice = n.NewPrice;

                $(".add_in_cart_wrapper .content_spinner").show();
                if (Status == false) {
                    $(".giftcard_error").fadeIn().delay(2000).fadeOut();
                    $(".giftcard_error").html(Text);
                } else {
                    $(".giftcard_error").fadeOut();
                    $(".giftcard_error").html("");
                    $(".giftcard_box button.btn_add_promocode").html(Text);
                    $(".giftcard_box button.btn_add_promocode").addClass("active_promocode_btn");
                    $("#PromocodeGiftTitle").val("");
                    get_total_price();

//                    if (FinalPrice == 0) {
//                        $(".delivery_price_sum").html(NewPrice);
//                        if ($("#PackageInsurance").is(":checked")) {
//                            $("#PackageInsurance_wrapper .extra_price span").html(NewPrice);
//                        }
//                        if ($("#PriorityOrder").is(":checked")) {
//                            $("#PriorityOrder_wrapper .extra_price span").html(NewPrice);
//                        }
//                    }

                    setTimeout(function () {
                        $(".giftcard_box button.btn_add_promocode").html(PrimaryText);
                        $(".giftcard_box button.btn_add_promocode").removeClass("active_promocode_btn");
                        //$(".add_in_cart_wrapper .content_spinner").hide();
                        $(".btn_remove_promocodegift").show();
                    }, 2000);
                }

            }
        });
    }


}

function submit_payment(UUID) {
    $(".payment_type_next .content_spinner").show();

    $.post(BASE_URL + "/submit_payment", {
        UUID: UUID
    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var Location = n.Location;
            $(".payment_type_next .content_spinner").hide();
            location.href = Location;
        }
    });
}

function submit_payment_klarna(UUID, OrderID) {
    $(".payment_type_next .content_spinner").show();

    $.post(BASE_URL + "/submit_payment_klarna", {
        UUID: UUID,
        OrderID: OrderID
    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var Location = n.Location;
            $(".payment_type_next .content_spinner").hide();
            location.href = Location;
        }
    });
}


function remove_promocode() {
    $(".add_in_cart_wrapper .content_spinner").show();
    $.post(BASE_URL + "/remove_promocode", {
    }, function (data, status) {
        if (status == "success") {
            $(".btn_remove_promocode").hide();

            setTimeout(function () {
                items_in_cart_steps();
                check_min_order_price();
                //get_total_price();
                $(".add_in_cart_wrapper .content_spinner").hide();

            }, 2000);
        }
    });
}

function remove_promocodegift() {
    //$(".add_in_cart_wrapper .content_spinner").show();
    $.post(BASE_URL + "/remove_promocodegift", {
    }, function (data, status) {
        if (status == "success") {
            $(".btn_remove_promocodegift").hide();

            var n = JSON.parse(data);
            var DeliveryPrice = n.DeliveryPrice;
            var CODPrice = n.CODPrice;
            var PackageInsurancePrice = n.PackageInsurancePrice;
            var PriorityOrder = n.PriorityOrder;

//            $("#DeliveryTitle_CC span").html(DeliveryPrice);
//            $("#DeliveryTitle_PP span").html(DeliveryPrice);
//            $("#DeliveryTitle_TRR span").html(DeliveryPrice);
//            $("#DeliveryTitle_COD span").html(CODPrice);
//            $("#PackageInsurance_wrapper .extra_price span").html(PackageInsurancePrice);
//            $("#PriorityOrder_wrapper .extra_price span").html(PriorityOrder);

            setTimeout(function () {
                get_total_price();
            }, 2000);


        }
    });
}


function initializePayPalInput(braintree, Token, Amount) {
    console.log("init PP " + braintree);
    console.log("Amount: " + Amount);
    console.log("Token: " + Token);

    $("#paypal-container").html('');

    //braintree.clearSelectedPaymentMethod();

    braintree.setup(Token, "custom", {
        onReady: function (integration) {
            //checkout = integration;
            console.log("braintree paypal on ready");
        },
        paypal: {
            container: "paypal-container",
            singleUse: false, // Required
            amount: Amount, // Required
            currency: 'EUR', // Required
        },
        dataCollector: {
            paypal: true
        },
        onPaymentMethodReceived: function (obj) {
            console.log("braintree paypal + on payment method received");

            //debugger;

            var nonce = obj.nonce;
            $("#payment_method_nonce").val(nonce);
            $("#PayPalForm").submit();
            //$("#cartStep2Submit").submit();

            //$("#submitOrder").show();
            //console.log("Nonce: " + nonce);
        }
    });


    if (!(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1)) {
        setTimeout(function () {
            //$("#braintree-paypal-loggedout > span > button").click();
        }, 2000);
    }

    $("#CreditCardInitialized").val("0");
    $("#PayPalInitialized").val("1");
    console.log("PP: " + $("#PayPalInitialized").val());
    console.log("CC: " + $("#CreditCardInitialized").val());

    //debugger;
}

function initializeCardInput(braintree, Token) {
    console.log("init CC " + braintree);
    console.log(Token);

    //braintree.clearSelectedPaymentMethod();

    braintree.setup(Token, "custom", {id: "cartStep2Submit"});

    var card = new Card({
        form: 'div[name="creditCardsInput"]',
        container: '.card-wrapper',

        formSelectors: {
            numberInput: 'input[name="number"]',
            expiryInput: 'input[name="expiry_date"], input[name="expiry_year"]',
            cvcInput: 'input[name="cvv"]',
            nameInput: 'input[name="holdername"]'
        },

        width: 300,
        formatting: true,

        messages: {
            validDate: 'Datum veljavnosti',
            monthYear: 'mm/yyyy',
        },

        placeholders: {
            number: '•••• •••• •••• ••••',
            name: 'Ime in priimek',
            expiry: '••/••',
            cvc: '•••'
        },

        masks: {
            //cardNumber: '•' // optional - mask card number
        },

        debug: false
    });

    $("#PayPalInitialized").val("0");
    $("#CreditCardInitialized").val("1");
    console.log("PP: " + $("#PayPalInitialized").val());
    console.log("CC: " + $("#CreditCardInitialized").val());
}


function submit_change_payment_type() {
    $.post(BASE_URL + "/submit_step3", {
        Type: 'change_payments'
    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var Location = n.Location;
            location.href = Location;
        }
    });
}


function add_all_recipes_products() {
    var Products = [];
    $('input.products_input:checkbox:checked').each(function () {
        Products.push($(this).val());
    });

    $.post(BASE_URL + "/add_recipes_products", {
        Products: Products
    }, function (data, status) {
        if (status == "success") {

            var n = JSON.parse(data);
            var Price = n.Price;
            var CAPICodeAddToCartDiscount = n.CAPICodeAddToCartDiscount;
            var MKIDs = n.MKIDs;
            var Currency = n.Currency;
            var Contents = n.Contents;

            if (Fb_T == 1) {
                fbq('track', 'AddToCartDiscount', {
                    value: Price,
                    currency: Currency,
                    content_type: 'product',
                    content_ids: '[' + MKIDs + ']',
                    contents: Contents,
                }, {eventID: CAPICodeAddToCartDiscount});
            }
//            console.log(data);

            $("#cd-cart").addClass("speed-in");
            $("#cd-shadow-layer").addClass("is-visible");
            items_in_cart();
            check_items_in_cart();
        }
    });

}