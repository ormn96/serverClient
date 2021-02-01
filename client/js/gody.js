
var user = null

function login(){
    if(!CheckEmail($('input')[0].form.Email.value)){
        setModal("Login",'Please enter valid Email',"")
        return false
    }
    var response = grecaptcha.getResponse();
    if(response.length == 0){
      setModal("Login",'Please do recaptcha',"")
        return false
    }
    
    $.ajax('/', {
        type: 'POST',
        data: {
   email: $('input')[0].form.Email.value,
   pass: $('input')[0].form.Password.value,
   'remember-me': $('input')[0].form.customCheck.checked
        },
        
success: function(data, status, xhr) {
  user = data
    $(location).attr('href', '../dashboard.html')
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
    setModal("Forget Password","Email was sent to your mail address","../")
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
    setModal("Reset Password",'password changed successfully','../')
        },
 error: function(xhr, status, errorMsg) {
    setModal("Reset Password","error: "+errorMsg,"")
        }
});
return false 
}

function register(){
  var error = ""
  var data = {
    email:$('input')[0].form.Email.value,
    name:$('input')[0].form.FirstName.value,
    lastName:$('input')[0].form.LastName.value,
    pass:$('input')[0].form.InputPassword.value,
    promo:$('input')[0].form.Promo.value
  }
  if(!CheckEmail(data.email)){
    error+='Please enter valid Email\n'
  }
  if(!CheckName(data.name)){
    error+='first name contains only letters\n'
  }
  if(!CheckName(data.lastName)){
    error+='last name contains only letters\n'
  }
  if(!CheckPass(data.pass)){
    error+='password need to be at least 6 letters and with at least one number\n'
  }
  if(data.pass!=$('input')[0].form.RepeatPassword.value){
    error+='password not match'
  }
  var response = grecaptcha.getResponse();
    if(response.length == 0){
      error+='Please do recaptcha'
    }
  if(error!=""){
    setModal("register account",error,"")
    return false
  }
  $.ajax('/signup', {
    type: 'POST',
    data: data,
success: function(data, status, xhr) {
setModal("register account","Please check your email for verification","../")
    },
error: function(xhr, status, errorMsg) {
  if(errorMsg=="promo-not-found"){
    setModal("register account","Promo code not found","")
  }else{
    setModal("Login","error: "+errorMsg,"")
  }
    }
});
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
 
    if($('#FullNameProfile')){
    $.ajax('/getUser', {
      type: 'GET',
  success: function(data, status, xhr) {
    user = data
    $('#FullNameProfile').html(user.name + " " + user.lastName)
    $('#Email').val(user.email)
    $('#FirstName').val( user.name)
   $('#LastName').val(user.lastName)
   $('#Phone').val(user.phone)
   $('#Country').val(user.country)
   $('#City').val( user.city)
   $('#Street').val(user.street)
   $('#ZipCode').val(user.zipCode)
   
   
      },
  error: function(xhr, status, errorMsg) {
      }
  });
    
  }
  });

  function Update(){
    var error = ""
  var data = {
    email: $('#Email').val(),
    name: $('#FirstName').val(),
   lastName: $('#LastName').val(),
   phone:$('#Phone').val(),
   country:$('#Country').val(),
   city:$('#City').val(),
   street:$('#Street').val(),
   zipCode:$('#ZipCode').val(),
  }
  if(!CheckEmail(data.email)){
    error+='Please enter valid Email\n'
  }
  if(!CheckName(data.name)){
    error+='first name contains only letters\n'
  }
  if(!CheckName(data.lastName)){
    error+='last name contains only letters\n'
  }
  if(error!=""){
    setModal("register account",error,"")
    return false
  }
    $.ajax('/update', {
      type: 'POST',
      data: data,
      
success: function(data, status, xhr) {
user = data
  $(location).attr('href', '../dashboard.html')
      },
error: function(xhr, status, errorMsg) {
  setModal("Update","error: "+errorMsg,"")
      }
});
return false
  }

  function changePass(){
    var error = ""
    if(!CheckPass($('#NewPass').val())){
      error+='password need to be at least 6 letters and with at least one number\n'
    }
    if($('#NewPass').val()!=$('#passRepeat').val()){
      error+='password not match'
    }
    if(error!=""){
      setModal("register account",error,"")
      return false
    }
    $.ajax('/changePassword', {
      type: 'POST',
      data: {
        oldPass:$('#OldPass').val(),
        pass:$('#NewPass').val()
      },
      
success: function(data, status, xhr) {
user = data
  $(location).attr('href', '../dashboard.html')
      },
error: function(xhr, status, errorMsg) {
  setModal("Update","error: "+errorMsg,"")
      }
});
return false
  }

  function logout(){
    $.ajax('/logout', {
      type: 'POST',
      data: {},
      
success: function(data, status, xhr) {
user = data
  $(location).attr('href', '../')
      },
error: function(xhr, status, errorMsg) {

      }
});
return false
  }