/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var BASE_URL = $("#BASE_URL").val();
var Fb_T = $("#Fb_T").val();

$('.flip').click(function () { //hover  can be used
    $(".flip").not(this).removeClass("flipped");
    $(this).find('.team_card').toggleClass('flipped');
});


$(document).ready(function () {
    if ($(window).width() > 768) {
        $(".equal_h1").equalHeights();
    }

    //$('input[name="Phone"]').attr('autocomplete', 'none');//Disable cache

    $(".equal_h2").equalHeights();
//    $(".equal_h3").equalHeights();

    //$(".product_card .top").equalHeights();
    //itemsInCart();


    $("#EmailLogin").focus();
    $(".select2").select2();
    //$("#PasswordLogin").focus();

    // reading progress bar

    var winHeight = $(window).height(),
            docHeight = $(document).height(),
            progressBar = $('progress'),
            max, value;

    /* Set the max scrollable area */
    max = docHeight - winHeight;
    progressBar.attr('max', max);

    $(document).on('scroll', function () {
        value = $(window).scrollTop();
        progressBar.attr('value', value);
    });


});

$(window).scroll(function () {
    if ($(window).width() <= 780) {
        if ($(this).scrollTop() > 1) {
            $(".add_to_cart_mobile").fadeIn();
        } else {
            $(".add_to_cart_mobile").fadeOut();
        }
    }

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

$(".faq-section__accordion .faq-section__title").on("click", function () {
    if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this).siblings(".faq-section__content").slideUp(200);
        $(".faq-section__accordion > .faq-section__title i").removeClass("faq-section__opened").addClass("faq-section__closed");
    } else {
        $(".faq-section__accordion > .faq-section__title i").removeClass("faq-section__opened").addClass("faq-section__closed");
        $(this).find("i").removeClass("faq-section__closed").addClass("faq-section__opened");
        $(".faq-section__accordion > .faq-section__title").removeClass("active");
        $(this).addClass("active");
        $(".faq-section__content").slideUp(200);
        $(this).siblings(".faq-section__content").slideDown(200);
    }
});


if ($("#ProductsOpinions").length) {
    new Waypoint({
        element: document.querySelector('#ProductsOpinions'),
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



function user_login(Type) {

    var Email = $("#EmailLogin").val();
    var Password = $("#PasswordLogin").val();
    var S1, S2;

    if (Email == "" || !isEmail(Email)) {
        S1 = 0;
        $("#EmailLogin").addClass("requiredInput");
    } else {
        S1 = 1;
        $("#EmailLogin").removeClass("requiredInput");
    }

    if (Password == "") {
        S2 = 0;
        $("#EmailPassword").addClass("requiredInput");
    } else {
        S2 = 1;
        $("#EmailPassword").removeClass("requiredInput");
    }

    if (S1 == 1 && S2 == 1) {
        $.post(BASE_URL + "/user_login", {
            Email: Email,
            Password: Password,
            Type: Type
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var StatusText = n.StatusText;
                var Location = n.Location;
                if (Location == "") {
                    $("#ErrorLogin").html(StatusText);
                    $("#ErrorLogin").slideDown();
                } else {
                    $("#ErrorLogin").hide();
                    location.href = Location;
                }
            }
        });
    }
}

function user_register() {

    $('input.required').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
        } else {
            $(this).removeClass("requiredInput");
        }
    });

    var Email = $("#Email").val();
    var S1, S2;

    if (Email != '') {
        if (!isEmail(Email)) {
            $("#Email").addClass("requiredInput");
        }
    }

    var Password = $("#Password").val();
    var RepeatPasword = $("#RepeatPassword").val();
    var upperCase = new RegExp('[A-Z]');

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
                S1 = 1;
                $("#ErrorRegister").slideUp();
            } else {
                $("#Password").addClass("requiredInput");
                $("#RepeatPassword").addClass("requiredInput");
                S1 = 0;
                $("#ErrorRegister").slideDown();
            }
        }
    }

    if ($("#TermsRegister").is(":checked")) {
        S2 = 1;
        $("#TermsRegister_wrapper").removeClass("requiredCheckbox");
    } else {
        S2 = 0;
        $("#TermsRegister_wrapper").addClass("requiredCheckbox");
    }

    if (!$(".requiredInput")[0] && S1 == 1 && S2 == 1) {
        $.post(BASE_URL + "/user_register", $('.register_form').serialize(), function (data, status) {
            if (status == 'success') {
                var n = JSON.parse(data);
                var StatusText = n.StatusText;
                var Location = n.Location;

                console.log(data);

                if (Location == "") {
                    $("#ErrorRegister").html(StatusText);
                    $("#ErrorRegister").slideDown();
                } else {
                    $("#ErrorRegister").hide();
                    location.href = Location;
                }
            }
        });
    }
}


function lost_password() {
    var Email = $("#EmailLogin").val();
    var S1, S2;

    if (Email == "" || !isEmail(Email)) {
        S1 = 0;
        $("#EmailLogin").addClass("requiredInput");
    } else {
        S1 = 1;
        $("#EmailLogin").removeClass("requiredInput");
    }

    if (S1 == 1) {
        $.post(BASE_URL + "/lost_password_submit", {
            Email: Email
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Status = n.Status;
                var StatusText = n.StatusText;

                $("#ErrorLogin").hide();
                $("#SuccessLogin").hide();

                if (Status != true) {
                    $("#ErrorLogin").fadeIn().delay(3000).fadeOut();
                    $("#ErrorLogin").html(StatusText);
                    $("#EmailLogin").val("");
                } else {
                    $("#SuccessLogin").fadeIn().delay(3000).fadeOut();
                    $("#SuccessLogin").html(StatusText);
                    $("#EmailLogin").val("");
                }
            }
        });
    }
}

function change_password() {
    var Password = $("#Password").val();
    var RepeatPasword = $("#RepeatPassword").val();
    var upperCase = new RegExp('[A-Z]');
    var GeneratedUUID = $("#GeneratedUUID").val();
    var S1;

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
                S1 = 1;
                $("#ErrorRegister").slideUp();
            } else {
                $("#Password").addClass("requiredInput");
                $("#RepeatPassword").addClass("requiredInput");
                S1 = 0;
                $("#ErrorRegister").slideDown();
            }
        }
    }


    if (S1 == 1) {
        $.post(BASE_URL + "/change_password_submit", {
            Password: Password,
            GeneratedUUID: GeneratedUUID
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Status = n.Status;
                var StatusText = n.StatusText;

                $("#ErrorLogin").hide();
                $("#SuccessLogin").hide();

                if (Status != true) {
                    $("#ErrorLogin").fadeIn().delay(3000).fadeOut();
                    $("#ErrorLogin").html(StatusText);
                    $("#EmailLogin").val("");
                } else {
                    $("#SuccessLogin").fadeIn().delay(3000).fadeOut();
                    $("#SuccessLogin").html(StatusText);
                    $("#EmailLogin").val("");
                }
            }
        });
    }
}

function toggle_more_images() {
    $(".more_images_button .show_more_text").fadeToggle();
    $(".more_images_button .hide_more_text").fadeToggle();
    $(".more_images").fadeToggle();
}


function toggleMoreOpinions() {
    $(".opinions .cta .show_more_text").toggle();
    $(".opinions .cta .hide_more_text").toggle();
    $(".opinions .other_hidden_orders").fadeToggle();
}

function toggleMoreQuestions() {
    $(".questions .cta .show_more_text").toggle();
    $(".questions .cta .hide_more_text").toggle();
    $(".questions .questions-boxes.hidden").fadeToggle();
}

function toggleMoreRecipes() {
    $(".recipes_products_box .cta .show_more_text").toggle();
    $(".recipes_products_box .cta .hide_more_text").toggle();
    $(".recipes_products_box .other_hidden_orders").fadeToggle();
}

function profile_update_data() {
    $('input.required').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
        } else {
            $(this).removeClass("requiredInput");
        }
    });

    /* BASIC DATA */

    var CountryCode = $("#CountryCode").val();
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


    var OldPassword = $("#OldPassword").val();
    var Password = $("#Password").val();
    var RepeatPasword = $("#RepeatPassword").val();


    if (OldPassword != '' && Password != '' && RepeatPasword != '') {
        //check pass
        var upperCase = new RegExp('[A-Z]');
        $("#Password").removeClass("requiredInput");
        $("#RepeatPassword").removeClass("requiredInput");
        $("#ErrorRegister").slideUp();

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
    } else {
        $("#Password").removeClass("requiredInput");
        $("#RepeatPassword").removeClass("requiredInput");
    }

    if (!$(".requiredInput")[0]) {
        $.post(BASE_URL + "/profile_update_data", $('.profile_update_data').serialize(), function (data, status) {
            if (status == 'success') {
                var n = JSON.parse(data);
                var PasswordStatus = n.PasswordStatus;
                if (PasswordStatus != '') {
                    $("#ErrorRegister").slideDown();
                    $("#ErrorRegister").html(PasswordStatus);
                } else {
                    location.reload();
                }
            }
        });
    }
}


function show_mega_menu(Type) {

    //$(".second_nav li a img").hide();
    //$(".second_nav li a").removeClass("active_nav");
    $(".search").hide();

    $("#MegamenuCategories").hide();
    $("#MegamenuSearch").hide();
    $("#MegamenuChocoholics").hide();
    $(".mega_dropdown_layer").hide();

    if (Type == "categories") {

        $("#Nav_chocoholics img").hide();
        $("#Nav_chocoholics").removeClass("active_nav");

        if ($("#Nav_categories").hasClass("active_nav")) {
            $("#Nav_categories img").hide();
            $("#Nav_categories").removeClass("active_nav");
            $("#MegamenuCategories").hide();
            $("#MegamenuCategoriesLayer").hide();
        } else {
            $("#Nav_categories img").show();
            $("#Nav_categories").addClass("active_nav");
            $("#MegamenuCategories").show();
            $("#MegamenuCategoriesLayer").show();
            $(".equal_h2").equalHeights();
        }



    } else if (Type == "chocoholics") {


        $("#Nav_categories img").hide();
        $("#Nav_categories").removeClass("active_nav");

        if ($("#Nav_chocoholics").hasClass("active_nav")) {
            $("#Nav_chocoholics img").hide();
            $("#Nav_chocoholics").removeClass("active_nav");
            $("#MegamenuChocoholics").hide();
            $("#MegamenuChocoholicsLayer").hide();
        } else {
            $("#Nav_chocoholics img").show();
            $("#Nav_chocoholics").addClass("active_nav");
            $("#MegamenuChocoholics").show();
            $("#MegamenuChocoholicsLayer").show();
            $(".equal_h2").equalHeights();
        }



    } else {

        $("#Nav_categories img").hide();
        $("#Nav_categories").removeClass("active_nav");
        $("#Nav_chocoholics img").hide();
        $("#Nav_chocoholics").removeClass("active_nav");

        $("#MegamenuSearch").show();
        //$("#Nav_categories img").hide();
        //$("#Nav_categories").removeClass("active_nav");
        $("#MegamenuSearchLayer").show();
        $(".second_nav").hide();
        $(".search").show();
        $(".search_preview").hide();
        $("#MainSearchInput").focus();
        $(".equal_h2").equalHeights();

    }
}


function close_mega_menu() {
    $(".second_nav li a img").hide();
    $(".second_nav li a").removeClass("active_nav");
    $("#MegamenuCategories").hide();
    $("#MegamenuCategoriesLayer").hide();
    $("#MegamenuSearch").hide();
    $(".mega_dropdown_layer").hide();
    $("#MegamenuChocoholicsLayer").hide();
    $("#MegamenuChocoholics").hide();
    $(".search").hide();
    $(".second_nav").show();
    $(".search_preview").show();

}



function close_main_search() {
    $("#MegamenuSearch").hide();
    $("#MegamenuSearchLayer").hide();
    if ($(window).width() > 768) {
        $(".second_nav").show();
    }
    $(".search").hide();
    $(".search_preview").show();
}


//$(function () {
//    var dd1 = new dropDown($('#OrderByDropdown'));
//
//    $(document).click(function () {
//        $('.order_by_dropdown').removeClass('active');
//    });
//});

//function dropDown(el) {
//    this.dd = el;
//    this.placeholder = this.dd.children('span');
//    this.opts = this.dd.find('ul.dropdown > li');
//    this.val = '';
//    this.index = -1;
//    this.initEvents();
//}
//dropDown.prototype = {
//    initEvents: function () {
//        var obj = this;
//        obj.dd.on('click', function () {
//            $(this).toggleClass('active');
//            return false;
//        });
//        obj.opts.on('click', function () {
//            var opt = $(this);
//            obj.val = opt.text();
//            obj.index = opt.index();
//            obj.placeholder.text(obj.val);
//        });
//    }
//}


function toggle_filter() {
    $("#filter-sidebar").toggleClass("speed-in");
    $("#filter-shadow-layer").toggleClass("is-visible");
    //show_filter_content();
}


//function show_filter_content() {
//    buildSearchUrl();
//}


//function printRecipe(el) {
//    var restorepage = $('body').html();
//    var printcontent = $('#MainBox').clone();
//    var enteredtext = $('#text').val();
//    $('body').empty().html(printcontent);
//    window.print();
//}


function printRecipe() {
    var divToPrint = document.getElementById('PrintWrap');

    var newWin = window.open('', 'Print-Window');

    newWin.document.open();

    newWin.document.write('<html><body onload="window.print()">' + divToPrint.innerHTML + '</body></html>');

    newWin.document.close();

    setTimeout(function () {
        newWin.close();
    }, 10);
}


function suggestion_result(Search) {
    $(".main_search_loading_right").show();
    $(".main_search_loading_left").show();
    search_products_results(Search);
    search_content_results(Search);
    search_save_suggestion(Search);
}


$('#GiftAuthor').on('keyup', function () {
    $('#GiftAuthorBox').html($(this).val());
});

$('#GiftText').on('keyup', function () {
    $('#GiftAuthorText').html($(this).val());
});


function check_gift_card_credit() {
    var GiftCardCode = $("#GiftCardCode").val();

    if (GiftCardCode == "") {
        $("#GiftCardCode").addClass("requiredInput");
    } else {
        $("#GiftCardCode").removeClass("requiredInput");
    }

    if (!$(".requiredInput")[0]) {
        $.post(BASE_URL + "/check_gift_card_credit", {
            GiftCardCode: GiftCardCode
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Status = n.Status;
                var Text = n.Text;

                if (!Status) {
                    $("#GiftCardLogin").fadeIn().html(Text);
                    $(".gift_card_status").hide();
                } else {

                    $("#GiftCardLogin").hide();
                    $(".gift_card_status").fadeIn();
                    $(".gift_card_status .price").html(Text);

                    setTimeout(function () {
                        $(".gift_card_status").fadeOut();
                        $("#GiftCardCode").val("");
                    }, 4000);
                }
            }
        });
    }

}

function send_present_demand() {
    $('#SendPresentDemand input.required').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
        } else {
            $(this).removeClass("requiredInput");
        }
    });

    var Email = $("#Email").val();
    var S1, S2;

    if (Email != '') {
        if (!isEmail(Email)) {
            $("#Email").addClass("requiredInput");
        }
    }

    if (!$(".requiredInput")[0]) {
        console.log("1");
        $.post(BASE_URL + "/send_present_demand", $('#SendPresentDemand').serialize(), function (data, status) {
            if (status == 'success') {
                console.log(data)
                var n = JSON.parse(data);
                var Text = n.Text;

                $("#SendPresentDemandResponse").html(Text);
                $("#SendPresentDemandResponse").slideDown();

                setTimeout(function () {
                    location.reload();
                }, 3000);
            }
        });
    }


}

function send_demand(Type) {

    $('input.required').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
        } else {
            $(this).removeClass("requiredInput");
        }
    });

//    if ($("#TermsNewsletter").is(":checked")) {
//        S1 = 1;
//        $("#Terms_wrapper").removeClass("requiredCheckbox");
//    } else {
//        S1 = 0;
//        $("#Terms_wrapper").addClass("requiredCheckbox");
//    }

    var Email;
    var EmailLabel;

    if (Type == "recipe" || Type == "book" || Type == "fit_academy") {
        Email = $("#NewslettersEmail").val();
        EmailLabel = "NewslettersEmail";
    } else {
        Email = $("#Email").val();
        EmailLabel = "Email";
    }

    var S1, S2;

    if (Email != '') {
        if (!isEmail(Email)) {
            $("#" + EmailLabel).addClass("requiredInput");
        }
    }

    if (!$("#Form_newsletters .requiredInput")[0]) {
        $.post(BASE_URL + "/send_newsletters", {
            Type: Type,
            Email: Email
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Text = n.Text;
                if (Type != 'welcome') {
                    $("#NewslettersResponse").html(Text);
                    $("#NewslettersResponse").fadeIn();
                } else {
                    $("#NewslettersWelcomeResponse").html(Text);
                    $("#NewslettersWelcomeResponse").fadeIn();
                }


                setTimeout(function () {
                    $("#NewslettersResponse").slideUp();
                    $("#NewslettersWelcomeResponse").slideUp();
                    $("#" + EmailLabel).val("");
                }, 3000);
            }
        });
    }
}

function send_welcome() {

    $('input.required_welcome').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
        } else {
            $(this).removeClass("requiredInput");
        }
    });

//    if ($("#Terms").is(":checked")) {
//        S1 = 1;
//        $("#Terms_wrapper").removeClass("requiredCheckbox");
//    } else {
//        S1 = 0;
//        $("#Terms_wrapper").addClass("requiredCheckbox");
//    }

    var Email = $("#WelcomeEmail").val();
    var EmailLabel = "WelcomeEmail";

    var S1, S2;

    if (Email != '') {
        if (!isEmail(Email)) {
            $("#" + EmailLabel).addClass("requiredInput");
        }
    }

    var Type = "welcome";

    if (!$("#WelcomeForm .requiredInput")[0]) {

        $.post(BASE_URL + "/send_newsletters", {
            Type: Type,
            Email: Email
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Text = n.Text;
                $("#NewslettersWelcomeResponse").html(Text);
                $("#NewslettersWelcomeResponse").fadeIn();

                setTimeout(function () {
                    $("#NewslettersWelcomeResponse").slideUp();
                    $("#" + EmailLabel).val("");
                }, 3000);
            }
        });
    }

}

(function ($) {
    $.fn.mySelectDropdown = function (options) {
        return this.each(function () {
            var $this = $(this);

            $this.each(function () {
                var dropdown = $("<div />").addClass("f-dropdown selectDropdown");

                if ($(this).is(':disabled'))
                    dropdown.addClass('disabled');

                $(this).wrap(dropdown);

                var label = $("<span />").append($("<span />")
                        .text($(this).attr("placeholder"))).insertAfter($(this));
                var list = $("<ul />");

                $(this)
                        .find("option")
                        .each(function () {
                            var image = $(this).data('image');
                            if (image) {
                                list.append($("<li />").append(
                                        $("<a />").attr('data-val', $(this).val())
                                        .html(
                                                $("<span />").append($(this).text())
                                                ).prepend('<img src="' + image + '">')
                                        ));
                            } else if ($(this).val() != '') {
                                list.append($("<li />").append(
                                        $("<a />").attr('data-val', $(this).val())
                                        .html(
                                                $("<span />").append($(this).text())
                                                )
                                        ));
                            }
                        });

                list.insertAfter($(this));

                if ($(this).find("option:selected").length > 0 && $(this).find("option:selected").val() != '') {
                    list.find('li a[data-val="' + $(this).find("option:selected").val() + '"]').parent().addClass("active");
                    $(this).parent().addClass("filled");
                    label.html(list.find("li.active a").html());
                    console.log("1");
                }
            });

            if (!$(this).is(':disabled')) {

                $(this).parent().on("click", "ul li a", function (e) {
                    e.preventDefault();
                    var dropdown = $(this).parent().parent().parent();
                    var active = $(this).parent().hasClass("active");
                    var label = active
                            ? $(this).html()
                            : $(this).html();

                    dropdown.find("option").prop("selected", false);
                    dropdown.find("ul li").removeClass("active");

                    dropdown.toggleClass("filled", !active);
                    dropdown.children("span").html(label);

                    dropdown
                            .find('option[value="' + $(this).attr('data-val') + '"]')
                            .prop("selected", true);
                    $(this).parent().addClass("active");

                    var OrderBySelect = $("#OrderBySelect").val();

                    if (OrderBySelect == "1") {
                        products_sort_by($(this).attr('data-val'));
                    }

                    dropdown.removeClass("open");
                });

                $this.parent().on("click", "> span", function (e) {
                    var self = $(this).parent();
                    self.toggleClass("open");
                });

                $(document).on("click touchstart", function (e) {
                    var dropdown = $this.parent();
                    if (dropdown !== e.target && !dropdown.has(e.target).length) {
                        dropdown.removeClass("open");
                    }
                });
            }
        });
    };
})(jQuery);

$('select.f-dropdown').mySelectDropdown();

function submit_recipe_step1() {

    $('.submit_recipe_box input.required').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
        } else {
            $(this).removeClass("requiredInput");
        }
    });

    var Title = $("#RecipeTitle").val();
    var PreparationTime = $("#PreparationTime").val();
    var Difficulty = $("#Difficulty").val();
    var NoPersons = $("#NoPersons").val();
    var Message = $("#RecipeMessage").val();

    if (!$(".requiredInput")[0]) {

        $.post(BASE_URL + "/confirm_submit_recipe_step1", {
            Title: Title,
            PreparationTime: PreparationTime,
            Difficulty: Difficulty,
            NoPersons: NoPersons,
            Message: Message
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Location = n.Location;
                location.href = Location;
            }
        });
    }

}


function change_recipe_element(UUID, Type) {
    var Title = $("#RecipeTitle_" + UUID).val();

    $.post(BASE_URL + "/change_recipe_element", {
        Title: Title,
        UUID: UUID,
        Type: Type,
    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var HTML = n.HTML;
            if (HTML != '') {
                $('.submit_recipe_step2_list').append(HTML);
            }
        }
    });
}

function delete_recipe_element(UUID, Type) {

    $.post(BASE_URL + "/delete_recipe_element", {
        UUID: UUID,
        Type: Type
    }, function (data, status) {
        if (status == "success") {
            console.log(data);
            var n = JSON.parse(data);
            var Status = n.Status;
            if (Status == true) {
                $("#SingleRecipeElement_" + UUID).hide();
            }
        }
    });
}


function submit_recipe_step2() {
    $.post(BASE_URL + "/confirm_submit_recipe_step2", {

    }, function (data, status) {
        if (status == "success") {
            console.log(data);
            var n = JSON.parse(data);
            var Status = n.Status;
            var UUID = n.UUID;
            var Location = n.Location;

//            if (Status == false) {
//                $("#SingleRecipeElement_" + UUID + " input").addClass("requiredInput");
//            } else {
            location.href = Location;
//            }
        }
    });
}


function submit_recipe_step3() {
    $.post(BASE_URL + "/confirm_submit_recipe_step3", {

    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var Status = n.Status;
            var UUID = n.UUID;
            var Location = n.Location;

//            if (Status == false) {
//                $("#SingleRecipeElement_" + UUID + " textarea").addClass("requiredInput");
//            } else {
            location.href = Location;
//            }
        }
    });
}

function submit_recipe_step5() {

    $('.submit_recipe_box input.required').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
        } else {
            $(this).removeClass("requiredInput");
        }
    });

    var Email = $("#RecipeEmail").val();
    var Author = $("#RecipeAuthor").val();


    if (Email != '') {
        if (!isEmail(Email)) {
            $("#RecipeEmail").addClass("requiredInput");
        }
    }

    if (!$(".requiredInput")[0]) {
        $.post(BASE_URL + "/confirm_submit_recipe_step5", {
            Email: Email,
            Author: Author
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Location = n.Location;
                location.href = Location;
            }
        });
    }
}

function select_chocolate_company(UUID) {
    $.post(BASE_URL + "/select_chocolate_company", {
        UUID: UUID,
    }, function (data, status) {
        if (status == "success") {
            var n = JSON.parse(data);
            var Title = n.Title;
            var Body = n.Body;

            $("#CompanyTitle").html(Title);
            $("#CompanyBody").html(Body);
            $("#CompaniesModal .content_spinner").hide();

        }
    });
}

function select_chocolate_spot(UUID, ID, Status) {

    if (Status == "empty") {
        $("#SpotID").html(ID);
        $("#SpotUUID").val(UUID);
        $("#SubmitChocolateSpot").show();
    } else {
        select_chocolate_company(UUID);
    }

}

function submit_chocolate_spot() {
    $('input.required').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
        } else {
            $(this).removeClass("requiredInput");
        }
    });

    var Email = $("#ChocolateEmail").val();

    if (Email != '') {
        if (!isEmail(Email)) {
            $("#ChocolateEmail").addClass("requiredInput");
        }
    }

    if (!$(".requiredInput")[0]) {
        $.post(BASE_URL + "/submit_chocolate_spot", $('#ChocolateSpotForm').serialize(), function (data, status) {
            if (status == 'success') {

                var n = JSON.parse(data);
                var Text = n.Text;

                $("#SubmitChocolateSpotText").html(Text);
                $("#SubmitChocolateSpotText").fadeIn();
                $("#SubmitChocolateSpot").fadeOut();

            }
        });
    }
}

function open_promocode() {
    $(".active_card_content").fadeIn();
}


function send_pin_code() {
    var Email = $("#LaboratoryEmail").val();

    if (Email != '') {
        if (!isEmail(Email)) {
            $("#LaboratoryEmail").addClass("requiredInput");
        }
        $("#LaboratoryEmail").removeClass("requiredInput");
    } else {
        $("#LaboratoryEmail").addClass("requiredInput");
    }

    if (!$(".requiredInput")[0]) {
        $.post(BASE_URL + "/send_pin_code", {
            Email: Email
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Text = n.Text;

                $("#LaboratoryNewPinConfirmText").slideDown();
                $("#LaboratoryNewPinConfirmText").html(Text);

//                 setTimeout(function () {
//                    location.reload();
//                }, 3000);
            }
        });
    }
}

function confirm_pin_code() {
    var PIN = $("#LaboratoryPIN").val();

    if (PIN != '') {
        $("#LaboratoryPIN").removeClass("requiredInput");
    } else {
        $("#LaboratoryPIN").addClass("requiredInput");
    }

    if (PIN != '') {
        $.post(BASE_URL + "/confirm_pin_code", {
            PIN: PIN
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Status = n.Status;
                var Text = n.Text;

                if (Status != false) {
                    $("#LaboratoryPinConfirmText").fadeOut();
                    location.reload();
                } else {
                    $("#LaboratoryPinConfirmText").fadeIn();
                    $("#LaboratoryPinConfirmText").html(Text);
                }

                setTimeout(function () {
                    $("#LaboratoryPinConfirmText").fadeOut();
                }, 3000);
            }
        });
    }

}


function toggle_mobile_nav() {
    $("#mobile-nav-sidebar").toggleClass("speed-in");
    $("#mobile-nav-shadow-layer").toggleClass("is-visible");
}



function send_stock_demand(ProductUUID, Type = null) {

    $('#InStockForm input.required').each(function () {
        if (!$(this).val()) {
            $(this).addClass("requiredInput");
        } else {
            $(this).removeClass("requiredInput");
        }
    });

    var Email = $("#InStockFormEmail").val();

    var S1, S2;

    if (Email != '') {
        if (!isEmail(Email)) {
            $("#InStockFormEmail").addClass("requiredInput");
        }
    }

    if (!$("#InStockForm .requiredInput")[0]) {
        $.post(BASE_URL + "/send_stock_demand", {
            ProductUUID: ProductUUID,
            Email: Email,
            Type: Type
        }, function (data, status) {
//            console.log(data);
            if (status == "success") {

                var n = JSON.parse(data);
                var Text = n.Text;
                var CAPICodeLead = n.CAPICodeLead;
                var SpatulaCheck = n.SpatulaCheck;
                var SpatulaName = n.SpatulaName;

//                console.log(CAPICodeLead);
//                console.log(SpatulaCheck);
//                console.log(SpatulaName);
//                console.log(Fb_T);

                $("#ConfirmLead").click();
                
                if (Type != "Spatula") {
                    $("#InStockFormResponse").html(Text);
                    $("#InStockFormResponse").fadeIn();
                }

                if (Fb_T == 1 && SpatulaCheck == 1) {

                    // Žiga, 7.2.2023, Spatula_lead => Lead

                    fbq('track', 'Lead', {
                        content_name: SpatulaName,
                    }, {eventID: CAPICodeLead});
                    
                    dataLayer.push({
                        'event': 'lead_submission',
                    });
                    
                }else{
                    console.log("2");
                }
                
                if (Type == "Spatula") {
                    location.href = BASE_URL + "/spatula-checkout";
                } else {
                    setTimeout(function () {
                        $("#InStockFormResponse").slideUp();
                        $("#InStockFormEmail").val("");
                    }, 3000);
                }

                
            }
        });


}
}


function change_opinion_rating(UUID) {
    var Ratings = $("#StarRating_" + UUID + ":checked").val();
    var Body = $("#BodyRating_" + UUID).val();


    $.post(BASE_URL + "/change_opinion_ratings", {
        UUID: UUID,
        Ratings: Ratings,
        Body: Body
    }, function (data, status) {
        if (status == "success") {
            console.log(data);
        }
    });


}


function open_opinion_dropdown(UUID) {
    $.post(BASE_URL + "/open_opinion_dropdown", {
        UUID: UUID,
    }, function (data, status) {
        if (status == "success") {
            $("#OpinionUpload_" + UUID + " .front").hide();
            $("#OpinionUpload_" + UUID + " .back").show();
            $("#OpinionUpload_" + UUID + " .back").html(data);
        }
    });
}

function close_opinion_dropdown(UUID) {
    $("#OpinionUpload_" + UUID + " .front").show();
    $("#OpinionUpload_" + UUID + " .back").hide();
}


function submit_opinion(OrderUUID) {

    var S1;

    if ($("#TermsRegister").is(":checked")) {
        S1 = 1;
        $("#TermsRegister_wrapper").removeClass("requiredCheckbox");
    } else {
        S1 = 0;
        $("#TermsRegister_wrapper").addClass("requiredCheckbox");
    }

    if (S1 == 1) {
        $.post(BASE_URL + "/submit_opinion", {
            OrderUUID: OrderUUID
        }, function (data, status) {
            if (status == "success") {
                location.href = data;
            }
        });
    }
}

function openAccordion(Type) {
    const id = 'One';
    const yOffset = -180;
    const element = document.getElementById(id);
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({top: y, behavior: 'smooth'});
    if (Type == "info") {
        $("#collapseOne").addClass("show");
        $("#One").addClass("collapsed");
        $("#One").attr("aria-expanded", "true");
        $("#collapseTwo").removeClass("show");
        $("#Two").removeClass("collapsed");
        $("#Two").attr("aria-expanded", "false");
    } else {
        $("#collapseOne").removeClass("show");
        $("#One").removeClass("collapsed");
        $("#One").attr("aria-expanded", "false");
        $("#collapseTwo").addClass("show");
        $("#Two").addClass("collapsed");
        $("#Two").attr("aria-expanded", "true");
    }
}

function openPreview(UUID) {
    console.log("clicked");
    $.post("/application/ajax/portal/previewContent.php", {
        UUID: UUID
    }, function (data, status) {
        if (status == "success") {
            console.log(data);
            $("#PreviewContent").html(data);
        }
    });

}

function jwtDecode(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    } catch (error) {
        return null;
    }
}

function toggleTranslation(OpinionUUID, OriginalText, TranslationText) {

    var $element = $("#ToggleTranslation-" + OpinionUUID);
    var isTranslationShown = $element.attr("data-toggle-translation");


    if (isTranslationShown === "false") {
        $element.attr("data-toggle-translation", "true");
        $("#heading-translation-sl-" + OpinionUUID).hide();
        $("#heading-translation-en-" + OpinionUUID).show();
        $element.text(OriginalText);
    } else {
        $element.attr("data-toggle-translation", "false");
        $("#heading-translation-en-" + OpinionUUID).hide();
        $("#heading-translation-sl-" + OpinionUUID).show();
        $element.text(TranslationText);
    }
}


function showForm() {
    $("#question-form").slideToggle();
    $(".write-question").hide();
}

function submitQuestion(ProductUUID, UserID, Language) {

    var S1, S2, S3

    $('input.required').each(function () {
        if (!$(this).val()) {
            S1 = 0;
            $(this).addClass("requiredInput");
        } else {
            S1 = 1;
            $(this).removeClass("requiredInput");
        }
    });

    if (!$('textarea.required').val()) {
        S2 = 0;
        $('textarea.required').addClass("requiredInput");
    } else {
        S2 = 1;
        $('textarea.required').removeClass("requiredInput");
    }


    if (!$('.g-recaptcha-response').val()) {
        S3 = 0;
        $(".recaptcha-text").slideDown();
    } else {
        S3 = 1;
        $(".recaptcha-text").slideUp();
    }



    var Email = $("#Email").val();
    var Name = $("#Name").val();
    var Question = $("#Question").val();

    if (Email != '') {
        if (!isEmail(Email)) {
            S1 = 0;
            $("#Email").addClass("requiredInput");
        } else {
            S1 = 1;
            $("#Email").removeClass("requiredInput");
        }
    }


    if (S1 == 1 && S2 == 1 && S3 == 1) {

        var UserResponse = grecaptcha.getResponse();


        $.post(BASE_URL + "/submit_question", {
            Name: Name,
            Email: Email,
            Question: Question,
            ProductUUID: ProductUUID,
            UserID: UserID,
            Language: Language,
            UserResponse: UserResponse,
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Message = n.Message;
                $(".recaptcha-text").html(Message);
                $(".recaptcha-text").slideDown();
                $(".success-question").slideToggle();
                setTimeout(() => {
                    window.location.reload();
                }, 1500)
            }
        });

    }
}


function validation_recaptcha() {

    var S3;

    if (!$('.g-recaptcha-response').val()) {
        S3 = 0;
        $(".recaptcha-text").slideDown();
    } else {
        S3 = 1;
        $(".recaptcha-text").slideUp();
    }

    var UserResponse = grecaptcha.getResponse();

    if (S3 == 1) {
        $.post(BASE_URL + "/validation_recaptcha", {
            UserResponse: UserResponse
        }, function (data, status) {
            if (status == "success") {
                var n = JSON.parse(data);
                var Status = n.Status;
            }
        });
    }

}