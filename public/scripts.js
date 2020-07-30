function toggleNavbarBG(){
    const w = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;
    const mainNav = $("#mainNav");
    if(w >= 768){
        mainNav.removeClass("bg-dark");
    }else{
        if($(".navbar-collapse.collapse").hasClass('show')){
            mainNav.addClass("bg-dark");
        }else{
            mainNav.removeClass("bg-dark");
        }
    }
};

$(".navbar-toggler").click(function(){
    $("#mainNav").toggleClass("bg-dark");
});
window.onresize = toggleNavbarBG;
