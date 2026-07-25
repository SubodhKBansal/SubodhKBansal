document.getElementById("staffLoginForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const facultyId = document.getElementById("facultyId").value.trim();
    const password = document.getElementById("password").value.trim();

    try {

        const response = await fetch("/staff/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                facultyId,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            alert("Login Successful");

            // Redirect to Staff Dashboard
            window.location.href = "staff-dashboard.html";

        } else {

            alert(data.message || "Invalid Faculty ID or Password");

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

});