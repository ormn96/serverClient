function login(){
    $.ajax('/', {
        type: 'POST',
        data: {
   email: $('input')[0].form.Email.value,
   pass: $('input')[0].form.Password.value,
   'remember-me': $('input')[0].form.customCheck.checked
        },
        
success: function(data, status, xhr) {
    $(location).attr('href', 'http://localhost:3000/dashboard.html')
        },
 error: function(xhr, status, errorMsg) {
    setModal("Login","error: "+errorMsg,"")
        }
});
return false
}

function ForgetPass(){
    $.ajax('/lost-password', {
        type: 'POST',
        data: {
   email: $('input')[0].form.Email.value
        },
        
success: function(data, status, xhr) {
    setModal("Forget Password","Email was sent to your mail address","http://localhost:3000")
        },
 error: function(xhr, status, errorMsg) {
    setModal("Forget Password","error: "+errorMsg,"")
        }
});
return false 
}

function ResetPass(){
    var pass = $('input')[0].form.Password.value
    var rep = $('input')[0].form.Repeat.value
    if(!CheckPass(pass)){
        setModal("Reset Password",'password must be 6 symbols long and contain at least 1 number',"")
        return false
    }
    if(pass!=rep){
        setModal("Reset Password",'password must match the Repeat Password',"")
        return false
    }
    $.ajax('/reset-password', {
        type: 'POST',
        data: {
            pass: pass
        },
        
success: function(data, status, xhr) {
    setModal("Reset Password",'password changed successfully','http://localhost:3000/')
        },
 error: function(xhr, status, errorMsg) {
    setModal("Reset Password","error: "+errorMsg,"")
        }
});
return false 
}


function CheckEmail(email) {
    var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    if (!email.match(mailformat)) {
      return false;
    }
    return true;
  }

  function CheckName(name) {
    var format = /^([a-zA-Z]{1,})/;
    if (!name.match(format)) {
      return false;
    }
    return true;
  }

  function CheckPass(pass) {
    var format = /(?=.*[0-9])(.{6,})/;
    if (!pass.match(format)) {
      return false;
    }
    return true;
  }

  function setModal(label,body,href){
    $('#NewModalBody').text(body);
    $('#NewModalLabel').text(label);
    $('#okBtn').attr("href", href)
    jQuery.noConflict(); 
    $('#NewModal').modal('show');
  }

$(document).ready(function() {
    $('<!-- Logout Modal--><div class="modal fade" id="NewModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="NewModalLabel">Ready to Leave?</h5><button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button></div><div class="modal-body" id="NewModalBody"></div><div class="modal-footer"><button class="btn btn-secondary"type="button"data-dismiss="modal">Cancel</button><a class="btn btn-primary" href="login.html" id="okBtn">Ok</a></div></div></div></div>').appendTo("body");
});
