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