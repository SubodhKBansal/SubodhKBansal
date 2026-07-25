document.getElementById("studentLoginForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const studentId = document.getElementById("studentId").value.trim();
    const password = document.getElementById("password").value.trim();

    try {

        const response = await fetch("/student/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                studentId,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            alert("Login Successful");

            // Redirect to Student Dashboard
            window.location.href = "student-dashboard.html";

        } else {

            alert(data.message || "Invalid Student ID or Password");

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

});