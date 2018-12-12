var Login = function () {

    return {

        //Masking
        initLogin: function () {
            // Validation for login form
            $("#sky-form1").validate({
                // Rules for form validation
                rules:
                {
                    account:
                    {
                        required: true,
                    },
                    password:
                    {
                        required: true,
                        minlength: 3,
                        maxlength: 10
                    }
                },

                // Messages for form validation
                messages:
                {
                    account:
                    {
                        required: '请输入账户',
                    },
                    password:
                    {
                        required: '请输入密码'
                    }
                },

                // Do not change code below
                errorPlacement: function(error, element)
                {
                    error.insertAfter(element.parent());
                }
            });
        }

    };

}();
