document.getElementById("registerForm")
.addEventListener("submit",async function(e){

    e.preventDefault();

    const fullname=document.getElementById("fullname").value;
    const mobile=document.getElementById("mobile").value;
    const email=document.getElementById("email").value;

    const response=await fetch("/register",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            fullname,
            mobile,
            email
        })

    });

    const result=await response.text();

    alert(result);

    document.getElementById("registerForm").reset();

});