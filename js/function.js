ajaxLoad = function(e) {
  $.ajax({
      method: e.type,
      url: mainUrl+e.url,
      cache: false,
      data: e.data,
      async: true,
      dataType : 'json',
      crossDomain:true,
      beforeSend: function() {
        if (typeof e.loader === 'function') e.loader()
      },success: function(result) {
        if (result.success == true) e.callback(result)
        if (typeof e.unloader === 'function') e.unloader()
      },error: function(xhr, ajaxOptions, thrownError) {
        let res = {};
        let errorText = "";

        try {
            res = JSON.parse(xhr.responseText);
            errorText = (res.message || "Terjadi kesalahan") + 
                        (res.file ? '<br><small>' + res.file + ': ' + res.line + '</small>' : "");
        } catch (e) {
            errorText = "Status: " + xhr.status + " (" + thrownError + ")";
            console.log("Full Error Response:", xhr.responseText); 
        }
        
        if (typeof e.rollback === 'function') e.rollback();
        else {
            swal({ 
            title: "Gagal", 
            html: true, 
            text: (thrownError != '') ? errorText : 'Kesalahan tidak diketahui', 
            type: "error" 
          });
        }
    }
  })
}

mouseUpPress = function(e) {
  $(e.dom).on("mousedown touchstart", function() {
    $(this).addClass(e.class)
  })

  $(e.dom).on("mouseup touchend", function() {
      if (typeof e.callback === 'function') e.callback(this)
      else console.log('error function')
      $(this).removeClass(e.class);
  })
}