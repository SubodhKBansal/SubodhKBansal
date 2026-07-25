document.getElementById("registerForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const fullname = document.getElementById("fullname").value;
    const mobile = document.getElementById("mobile").value;
    const email = document.getElementById("email").value;
    const studentClass = document.getElementById("studentClass").value;

    const response = await fetch("/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            fullname,
            mobile,
            email,
            studentClass
        })

    });

    const result = await response.json();

    if (result.success) {

        if (result.studentId) {

            alert(
`Student Registered Successfully

Student ID: ${result.studentId}

Temporary Password: ${result.password}`
            );

        } else if (result.facultyId) {

            alert(
`Faculty Registered Successfully

Faculty ID: ${result.facultyId}

Temporary Password: ${result.password}`
            );

        }

        document.getElementById("registerForm").reset();

    } else {

        alert(result.message);

    }

});