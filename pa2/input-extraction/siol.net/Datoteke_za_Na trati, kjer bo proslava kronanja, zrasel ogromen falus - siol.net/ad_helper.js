function getViewPort() {
    var screenWidth, screenHeight;
    if (typeof window.innerWidth == 'number') {
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        screenWidth = document.documentElement.clientWidth;
        screenHeight = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        screenWidth = document.body.clientWidth;
        screenHeight = document.body.clientHeight;
    }
    return {
        width: screenWidth,
        height: screenHeight
    };
}

function getSize() {

    var viewPort = getViewPort();
    var size;

    size = 'display_large';

    if (viewPort.width <= 1200) {
        size = 'display';
    }

    if (viewPort.width <= 994) {
        size = 'tablet';
    }

    if (viewPort.width <= 768) {
        size = 'mobile';
    }

    return size;
}
