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
    alert('status: ' + status + ', msg:' + errorMsg);
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