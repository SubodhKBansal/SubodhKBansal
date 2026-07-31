document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("assignmentForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const formData = new FormData(form);

        try {

            const response = await fetch("/upload-assignment", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {

                message.style.color = "green";
                message.innerHTML = "✅ Assignment uploaded successfully.";

                form.reset();

            } else {

                message.style.color = "red";
                message.innerHTML = result.message || "Upload failed.";

            }

        } catch (err) {

            console.error(err);

            message.style.color = "red";
            message.innerHTML = "Server error. Please try again.";

        }

    });

});