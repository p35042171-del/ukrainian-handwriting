const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");
const output = document.getElementById("output");
const scanBtn = document.getElementById("scanBtn");

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});

scanBtn.addEventListener("click", async () => {

    const file = imageInput.files[0];

    if (!file) {
        alert("Vyber obrázek");
        return;
    }

    try {

        output.value = "OCR běží...";

        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
            "https://onerended.onrender.com/ocr",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        output.value = data.text;

    } catch (err) {
        console.error(err);
        output.value = "Chyba OCR";
        alert("OCR failed");
    }
});
