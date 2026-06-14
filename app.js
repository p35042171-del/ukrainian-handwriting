const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");
const output = document.getElementById("output");
const scanBtn = document.getElementById("scanBtn");
const downloadBtn = document.getElementById("downloadBtn");
const learnBtn = document.getElementById("learnBtn");

let lastOCRText = "";

/* ===== Náhled obrázku ===== */
imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});

/* ===== OCR ===== */
scanBtn.addEventListener("click", async () => {

    const file = imageInput.files?.[0];

    if (!file) {
        alert("Vyber obrázek.");
        return;
    }

    try {

        output.value = "Nahrávám...";

        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("https://onerended.onrender.com/ocr", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "OCR failed");
        }

        if (!data.text) {
            throw new Error("No text returned");
        }

        lastOCRText = data.text;
        output.value = data.text;

    } catch (err) {
        console.error(err);
        output.value = "Chyba OCR";
        alert(err.message);
    }
});

/* ===== Download DOC ===== */
downloadBtn.addEventListener("click", () => {

    const text = output.value?.trim();

    if (!text) {
        alert("Není co stáhnout.");
        return;
    }

    const html = `
<html>
<head><meta charset="UTF-8"></head>
<body>
<pre style="font-family:Calibri;font-size:12pt;">
${text}
</pre>
</body>
</html>
`;

    const blob = new Blob(['\ufeff' + html], {
        type: "application/msword"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text.doc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

/* ===== Učení slov ===== */
learnBtn.addEventListener("click", () => {

    if (!lastOCRText || !output.value) {
        alert("Nejdřív spusť OCR.");
        return;
    }

    const dict = JSON.parse(localStorage.getItem("ocrDictionary") || "{}");

    const orig = lastOCRText.split(/\s+/);
    const corr = output.value.split(/\s+/);

    for (let i = 0; i < Math.min(orig.length, corr.length); i++) {
        if (orig[i] !== corr[i]) {
            dict[orig[i]] = corr[i];
        }
    }

    localStorage.setItem("ocrDictionary", JSON.stringify(dict));

    alert("Uloženo.");
});
