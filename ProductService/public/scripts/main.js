// const axios = require('axios').default
document.addEventListener("DOMContentLoaded", function () {
    const firstNameInput = document.getElementById("firstName");
    const lastNameInput = document.getElementById("lastName");
    const emailInput = document.getElementById("email");
    const newPasswordInput = document.getElementById("password");
    const submitButton = document.getElementById("submit-button");
    const flashMessage = document.getElementById('flash-message');


    submitButton.addEventListener("click", async function (event) {
        event.preventDefault()
        const url = 'http://localhost:9602/meal-api/v1/auth/register'
        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;
        const email = emailInput.value;
        const newPassword = newPasswordInput.value;
        const name = `${firstName} ${lastName}`
        const details ={
            name,
            email, 
            password: newPassword
        }
        function showFlashMessage(message, color) {
            flashMessage.textContent = message;
            flashMessage.style.display = 'block';
            flashMessage.style.backgroundColor = color
            setTimeout(() => {
                flashMessage.style.display = 'none';
            }, 3000); // Display the message for 3 seconds (adjust as needed)
        }


        try {
            const response = await axios.post(url, details)
            const message = response.data
            showFlashMessage(message, 'green')
            console.log(response)
            console.log(message)
            if (response.status === 200 && response.headers.location) {
                window.location.href = response.headers.location;
            }
        } catch (error) {
            if(error){
                console.log(error)
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                showFlashMessage(error.response.data)
            }else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Request error:', error.message);
            }
        }
    });
})

        // function clearFeilds() {
        //     firstNameInput.value = ''
        //     lastNameInput.value = ''
        //     emailInput.value = ''
        //     newPasswordInput.value=''
        //     submitButton.style.display = "none"
        // }