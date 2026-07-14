document.getElementById("registerForm")
.addEventListener("submit",async function(e){

    e.preventDefault();

    const fullname=document.getElementById("fullname").value;
    const mobile=document.getElementById("mobile").value;
    const email=document.getElementById("email").value;
    const studentClass = document.getElementById("studentClass").value;
    const response=await fetch("/register",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            fullname,
            mobile,
            email,
            studentClass
        })

    });

    const result = await response.json();

alert(result.message);

if(result.success){
    document.getElementById("registerForm").reset();
}

});