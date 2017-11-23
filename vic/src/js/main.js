$(document).ready(function(){
	
 $(".box, .menu").on("click","a", function (event) {
        event.preventDefault();

        var id  = $(this).attr('href'),

            top = $(id).offset().top;

        $('body,html').animate({scrollTop: top}, 1500);

    });

  $('.bxslider').bxSlider({
  		pager: false,
  		controls: true, nextText: '<i class="fa fa-angle-right"></i>',
 prevText: '<i class="fa fa-angle-left"></i>'
  		
  	});

});

