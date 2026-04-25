
showLoginPage = function() {
  $('#preloader').show()
  $('.index-page').hide()
  const loginPage = $.get(`pages/login.html?v=${vj}`, function(data) {
      $(".login-page").html(data);
  });

  $.when.apply(loginPage).done(function() {
    hidePreloader()
  });
}

loggedIn = function() {
    var resultNip = getCookie('nip')
    var resultNama = getCookie('nama')
    var resultUid = getCookie('uid')
    var resultDevice = getCookie('device')
    $('.nip').html('NIP '+resultNip)
    $('.nama').html(resultNama)
    $('.login-page').html(null)
    $('.index-page').show()
    hidePreloader()

    nip = resultNip
    presensiNow(nip)
    riwayatList(nip)

    /* -- Konfigurasi Load -- */
    
    $('.nama-input').val(resultNama) 
    $('.nip-input').val(resultNip)
    $('.uid-input').val(uid)
    $('.device-input').val(device) 
}

refreshRiwayat = function() {
    riwayatList(nip)
}

refreshPresensi = function() { 
    presensiNow(nip)
}

appReload = function() {
    window.location.reload()
    return false
}

appLogout = function() {
    window.location.href = baseUrl+'/logout'
    return false
}

const hidePreloader = function() {
    $('#preloader').css('opacity','0.8').fadeOut()
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

initCookies = function(result) {
    passwdStatus = result.data.password
    loginStatus = result.data.status
    setCookie('peg_id',result.data.id)
    setCookie('nama',result.data.nama)
    setCookie('nip',result.data.nip)
    setCookie('uid',result.data.uid)
    setCookie('device',result.data.device)

    if (result.data.statistik != 'undefined') {
      if (result.data.statistik.terlambat != null) $('.stat-terlambat').html(result.data.statistik.terlambat)
      if (result.data.statistik.pulangcepat != null) $('.stat-plgawal').html(result.data.statistik.pulangcepat)
      if (result.data.statistik.ijin != null) $('.stat-ijin').html(result.data.statistik.ijin)
      if (result.data.statistik.abstain != null) $('.stat-tp').html(result.data.statistik.abstain)
    }
  }

// Function to get a cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999;';
}

doLogout = function() {
  deleteCookie('peg_id')
  deleteCookie('nama')
  deleteCookie('nip')
  deleteCookie('uid')
  deleteCookie('device')
  showLoginPage()
}

logoutConfirm = function(i){
    swal({
        title: "Konfirmasi Keluar?",
        text: "Apakah ingin keluar dari Presensi Mobile?",
        type: "warning",
        showCancelButton: true,
        cancelButtonText: "Batal",
        confirmButtonColor: "#f86c6b",
        confirmButtonText: "Logout",
        closeOnConfirm: true
    },
    function(){
        doLogout()
    });
    return false;
};


function CalculateDistance(lat1, long1, lat2, long2) {
    // Translate to a distance
    var distance =
      Math.sin(lat1 * Math.PI) * Math.sin(lat2 * Math.PI) +
      Math.cos(lat1 * Math.PI) * Math.cos(lat2 * Math.PI) * Math.cos(Math.abs(long1 - long2) * Math.PI);

    // Return the distance in miles
    //return Math.acos(distance) * 3958.754;

    // Return the distance in meters
    return Math.acos(distance) * 6370981.162;
} // CalculateDistance

// Call this on an interval
function OnInterval() {
  // Get the coordinates they are at
  var lat = position.coords.latitude;
  var long = position.coords.longitude;
  var distance = CalculateDistance(targetlat, targetlong, lat, long);

  // Is it in the right distance? (200m)
  if (distance <= 200) {
    // Stop the interval
    stopInterval(OurInterval);

    // Do something here cause they reached their destination
  }
}
//var targetlong = 23.456;
//var targetlat = 21.098;

// Start an interval every 1s


loginCheck = function() {
  $.ajax({
      method: 'POST',
      url: mainUrl+'/api/mobile/check',
      cache: false,
      data: {
          uid: uid,
          device: device
      },
      async:true,
      dataType : 'json',
      crossDomain:true,
      beforeSend: function() {
      
      },
      success: function(result) {
          if (result.noapi) {
              $('.index-page').hide()
              var text = $('#noApi').html();
              text = text.replace('[error]',result.errors)
              $('.login-page').html(text)
          } else {
              if (result.status == true) {
                  initCookies(result)
                  hidePreloader()
                  loggedIn()
                  loginRecheck()
              } else {
                  showLoginPage()
              }
          }
          hidePreloader()
      },error:function(xhr, ajaxOptions, thrownError){
          let res = JSON.parse(xhr.responseText);
          swal({ title: "Gagal", html: true, text: res.message+'<br>'+res.file+': '+res.line, type: "error" })
          hidePreloader()
      }
  })
}

setNewPassword = function() {
  stopCheck()
  passwdForm = 1
  $('.alert-passwd, #passwdCloseBtn').hide()
  $('#passwordType').val('new_password')
  $("#passwordSection h3, #passwordSection .btn-password").html("Buat Password Baru")
  $("#passwordSection").show()
}

setChangePassword = function() {
  passwdForm = 1
  $('#pwd1, #pwd2, #pwdOld').val(null)
  $('.alert-passwd').hide()
  $('#passwordType').val('change_password')
  $("#passwordSection h3, #passwordSection .btn-password").html("Ganti Password")
  $("#passwdCloseBtn, #pwdLamaInput").show()
  $("#passwordSection .text-ket").hide()
  $("#passwordSection").show()
}

unsetPassword = function() {
  passwdForm = 0
  $('#passwordSection').hide()
}

savePassword = function() {
    $('.alert-passwd').hide()
    var msg
    var error = 0
    if ($('#passwordType').val() == "new_password") $("#pwdOld").hide()
    if (!$('#pwd1').val() || !$('#pwd2').val()) {
      error = 1
      msg = 'Password pertama dan kedua harus diisi ...'
    }

    if (error == 1) {
      $('.alert-passwd').html(msg).show()
    } else {
       $.ajax({
          method: 'POST',
          url: mainUrl+'/api/mobile/setpwd',
          cache: false,
          data: {
              nip: nip,
              type: $('#passwordType').val(),
              pass_lama: $('#pwdOld').val(),
              password: $('#pwd1').val(),
              password2: $('#pwd2').val()
          },
          async:true,
          dataType : 'json',
          crossDomain:true,
          beforeSend: function() {
            $('.password-loader').show()
          },
          success: function(result) {
              if (result.status == true) {
                passwdStatus = result.passwdstatus
                swal({ title: "Pesan", html: true, text: result.message, type: "success" })
                unsetPassword()
              } else {
                swal({ title: "Kesalahan", html: true, text: result.message, type: "error" })
              }
              $('.password-loader').hide()
          },error:function(xhr, ajaxOptions, thrownError){
              let res = JSON.parse(xhr.responseText);
              swal({ title: "Gagal", html: true, text: res.message+'<br>'+res.file+': '+res.line, type: "error" })
              $('.password-loader').hide()
          }
      })
    }
}

pwdHideAlert = function() {
    $('.alert-passwd').hide()
}

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