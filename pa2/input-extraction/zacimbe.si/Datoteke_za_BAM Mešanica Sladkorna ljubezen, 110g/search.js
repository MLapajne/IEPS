

window.$_GET = new URLSearchParams(location.search);


/* RECIPE SEARCH */

var typingTimer;                //timer identifier
var doneTypingInterval = 1000;  //time in ms (5 seconds)

//on keyup, start the countdown
$('#RecipeSearchInput').keyup(function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(recipes_search, doneTypingInterval);
//    if ($('#RecipeSearchInput').val()) {
//        typingTimer = setTimeout(recipes_search, doneTypingInterval);
//    }
});
$('#NewsSearchInput').keyup(function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(news_search, doneTypingInterval);
//    if ($('#RecipeSearchInput').val()) {
//        typingTimer = setTimeout(recipes_search, doneTypingInterval);
//    }
});


function recipes_search() {
    var Search = $("#RecipeSearchInput").val();
    $(".recipes .content_spinner").show();
    search_recipes_results(Search);
}

function news_search(){
    var Search = $("#NewsSearchInput").val();
    $(".news .content_spinner").show();
    search_news_results(Search);
}


var MainSearchURL = "";

var SearchString = $_GET.get('search');
var GlobalSearch = "";

if (SearchString == "" || SearchString == null) {
    GlobalSearch = "";
} else {
    GlobalSearch = "&search=" + SearchString;
}

var SearchPage = $_GET.get('page');
var GlobalPage = "";

if (SearchPage == "" || SearchPage == null) {
    GlobalPage = "";
} else {
    GlobalPage = "?page=" + SearchPage;
}


function search_recipes_results(Search) {
    var ActiveRecipeType = $("#ActiveRecipeType").val();

    if (Search != '') {
        GlobalSearch = "&search=" + Search;
    } else {
        GlobalSearch = "";
    }
    
    build_recipes_url();

    $.post(BASE_URL + "/search_recipes_results", {
        Search: Search,
        ActiveRecipeType: ActiveRecipeType,
    }, function (data, status) {
        if (status == "success") {
            $("#RecipesContainer").html(data);
        }
    });
}


function search_news_results(Search) {
    var ActiveRecipeType = $("#ActiveRecipeType").val();

    if (Search != '') {
        GlobalSearch = "?search=" + Search;
    } else {
        GlobalSearch = "";
    }
    
    build_news_url();

    $.post(BASE_URL + "/search_news_results", {
        Search: Search,
        ActiveRecipeType: ActiveRecipeType
    }, function (data, status) {
        if (status == "success") {
            $("#NewsContainer").html(data);
            $(".news .content_spinner").hide();
            
        }
    });
}


function build_recipes_url() {

    var ActiveRecipeType = $("#ActiveRecipeType").val();
    
    if(ActiveRecipeType == "all"){
        var CategoryUrl = "";
    }else{
        var CategoryUrl = ActiveRecipeType;
    }
    
    if(GlobalPage == ""){
        GlobalPage = "?page=1";
    }
    
    var URL = GlobalPage + GlobalSearch;
    console.log(URL);
    history.pushState({}, null, URL);
    MainSearchURL = URL;
}

function build_news_url() {

    var ActiveRecipeType = $("#ActiveRecipeType").val();
    
    if(ActiveRecipeType == "all"){
        var CategoryUrl = "";
    }else{
        var CategoryUrl = ActiveRecipeType;
    }
    
    if(GlobalPage == ""){
        GlobalPage = "?page=1";
    }
    
//    var URL = CategoryUrl + GlobalSearch + GlobalPage;
    var URL = GlobalPage + GlobalSearch;
    history.pushState({}, null, URL);
    MainSearchURL = URL;
}



/* MAIN SEARCH */


//setup before functions
var typingTimer;                //timer identifier
var doneTypingInterval = 1000;  //time in ms (5 seconds)

//on keyup, start the countdown
$('#MainSearchInput').keyup(function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(main_search, doneTypingInterval);
});

function main_search() {
    var Search = $("#MainSearchInput").val();
    $(".main_search_loading_right").show();
    $(".main_search_loading_left").show();
    search_products_results(Search);
    search_content_results(Search);
    search_save_suggestion(Search);
}


function search_products_results(Search) {

    $.post(BASE_URL + "/search_products_results", {
        Search: Search
    }, function (data, status) {
        if (status == "success") {
            $("#SearchProductsResults").html(data);
            $(".main_search_loading_right").hide();
            $(".product_card .top").equalHeights();
        }
    });
}

function search_content_results(Search) {

    $.post(BASE_URL + "/search_content_results", {
        Search: Search
    }, function (data, status) {
        if (status == "success") {
            $("#SearchContentResults").html(data);
            $(".main_search_loading_left").hide();
        }
    });
}

function search_save_suggestion(Search) {
    $.post(BASE_URL + "/search_save_suggestion", {
        Search: Search
    }, function (data, status) {
        if (status == "success") {
            console.log(Search);
        }
    });
}

/* FILTER SEARCH */

function confirm_filter_search() {
    var CategoryPrimaryURL = $("#CategoryURL").val();
    var SubCategoryPrimaryURL = $("#SubCategoryURL").val();

    var TagsArray = [];

    $("input[name='SearchTags']:checked").each(function () {
        TagsArray.push($(this).val());
    });

    var Tags = TagsArray.join(',');
    var Stock = $("input[name='SearchStock']:checked").val();

    var CategoryWrap;
    var TagsWrap;
    var StockWrap;
    var BASE_URL = $("#ProductsBASE_URL").val();

    if (CategoryPrimaryURL != '') {
        if (SubCategoryPrimaryURL != '') {
            CategoryWrap = "/" + CategoryPrimaryURL + "/" + SubCategoryPrimaryURL;
        } else {
            CategoryWrap = "/" + CategoryPrimaryURL;
        }
    } else {
        CategoryWrap = "";
    }

    if (Tags != "") {
        TagsWrap = "?tags=" + Tags;
    } else {
        TagsWrap = "";
    }

    if (typeof Stock !== "undefined") {
        var Predefined = "?";
        if (Tags != '') {
            Predefined = "&";
        }
        StockWrap = Predefined + "stock=" + Stock;
    } else {
        StockWrap = "";
    }


    var URL = BASE_URL + CategoryWrap + TagsWrap + StockWrap;

    location.href = URL;

}


function products_sort_by(SortBy) {
    var CategoryPrimaryURL = $("#CategoryURL").val();
    var SubCategoryPrimaryURL = $("#SubCategoryURL").val();

    var TagsArray = [];

    $("input[name='SearchTags']:checked").each(function () {
        TagsArray.push($(this).val());
    });

    var Tags = TagsArray.join(',');
    var Stock = $("input[name='SearchStock']:checked").val();

    var CategoryWrap;
    var TagsWrap;
    var StockWrap;
    var BASE_URL = $("#ProductsBASE_URL").val();

    if (CategoryPrimaryURL != '') {
        if (SubCategoryPrimaryURL != '') {
            CategoryWrap = "/" + CategoryPrimaryURL + "/" + SubCategoryPrimaryURL;
        } else {
            CategoryWrap = "/" + CategoryPrimaryURL;
        }
    } else {
        CategoryWrap = "";
    }



    if (Tags != "") {
        TagsWrap = "?tags=" + Tags;
    } else {
        TagsWrap = "";
    }


    if (typeof Stock !== "undefined") {
        var Predefined = "?";
        if (Tags != '') {
            Predefined = "&";
        }
        StockWrap = Predefined + "stock=" + Stock;
    } else {
        StockWrap = "";
    }

    if (SortBy != '') {
        var SortByWrap;
        var Predefined = "&";
        if (TagsWrap == "" && StockWrap == "") {
            Predefined = "?";
        }

        SortByWrap = Predefined + "sort-by=" + SortBy;

        var URL = BASE_URL + CategoryWrap + TagsWrap + StockWrap + SortByWrap;
        location.href = URL;
    }

}