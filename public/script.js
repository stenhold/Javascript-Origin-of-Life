document.getElementById("getUser").addEventListener("click", () => {
    fetch("/api/app")
        .then(response => response.json())
        .then(data => {
            document.getElementById("userInfo").innerHTML = `<p>${data.message}</p>`;
        })
        .catch(error => console.error('Error:', error));
});
