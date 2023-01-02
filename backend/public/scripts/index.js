$(document).ready(function(){
    
    $('#image').change(function(){
        $('.postTextArea').attr("placeholder", "Write something about the image ...");
    });

 
    $('.likeBtn').click(function(event){
        event.preventDefault();
        var likeB = $(this);
        $(likeB).addClass("disabled"); //disable href to prevent multiple clicks(custom class)
        $.ajax({
            url: $(this).attr("href"),
            contentType: "application/json"
        }).done(function(response){
            var like = "/post/"+response.postID+"/like";
            var unlike = "/post/"+response.postID+"/unlike";
            var status=$(likeB).children( 'i' ).hasClass('far');  //unlike
            var icon = $(likeB).children( 'i' );
            var likeTag=$(likeB).parent().find('span.likeCount');
            var l_count=parseInt(likeTag.text());
            if(status){
                $(icon).removeClass("far");
                $(icon).addClass("fas");
                $(likeB).attr("href", unlike);
                l_count++;
                likeTag.text(l_count);
            }
            else{
                $(icon).removeClass("fas");
                $(icon).addClass("far");
                $(likeB).attr("href", like);
                l_count--;
                likeTag.text(l_count);
            }
            $(likeB).removeClass("disabled"); //enable href after query complete
        });
    });
    
});




