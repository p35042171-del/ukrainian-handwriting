const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");
const output = document.getElementById("output");
const scanBtn = document.getElementById("scanBtn");
const downloadBtn = document.getElementById("downloadBtn");
const learnBtn = document.getElementById("learnBtn");


/* ===== Slovník oprav ===== */

function getDictionary() {
    return JSON.parse(
        localStorage.getItem("ocrDictionary") || "{}"
    );
}

function saveDictionary(dict) {
    localStorage.setItem(
        "ocrDictionary",
        JSON.stringify(dict)
    );
}

function applyDictionary(text) {

    const dict = getDictionary();

    for (const wrong in dict) {

        text = text.replaceAll(
            wrong,
            dict[wrong]
        );
    }

    return text;
}

/* ===== Náhled obrázku ===== */

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

});

/* ===== LanguageTool ===== */

async function correctText(text) {

    try {

        const response = await fetch(
            "https://api.languagetool.org/v2/check",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    text: text,
                    language: "uk"
                })
            }
        );

        const result = await response.json();

        let correctedText = text;

        const matches =
            result.matches.sort(
                (a, b) => b.offset - a.offset
            );

        for (const match of matches) {

            if (
                match.replacements &&
                match.replacements.length > 0
            ) {

                correctedText =
                    correctedText.slice(
                        0,
                        match.offset
                    ) +
                    match.replacements[0].value +
                    correctedText.slice(
                        match.offset +
                        match.length
                    );
            }
        }

        return correctedText;

    } catch (error) {

        console.error(error);

        return text;
    }
}

/* ===== OCR ===== */

scanBtn.addEventListener(
    "click",
    async () => {

        const file =
            imageInput.files[0];

        if (!file) {

            alert(
                "Vyber fotografii."
            );

            return;
        }

        try {

            output.value =
                "Příprava obrázku...";


            output.value =
                "Rozpoznávání textu...";

           output.value =
    "Nahrávám obrázek...";

const formData =
    new FormData();

formData.append(
    "image",
    file
);

const response =
    await fetch(
        "https://onerended.onrender.com/ocr",
        {
            method: "POST",
            body: formData
        }
    );

const data =
    await response.json();


output.value =
    "Kontrola pravopisu...";

text =
    await correctText(
        text
    );

text = text
    .replaceAll("I", "І")
    .replaceAll("l", "І");

output.value =
    text;


            output.value =
                "Kontrola pravopisu...";

            text =
                await correctText(
                    text
                );

            text = text
                .replaceAll(
                    "I",
                    "І"
                )
                .replaceAll(
                    "l",
                    "І"
                );

            output.value =
                text;

        } catch (error) {

            console.error(
                error
            );

            output.value =
                "Chyba při rozpoznávání.";

            alert(
                "OCR selhalo."
            );
        }
    }
);

/* ===== Učení ===== */

learnBtn.addEventListener(
    "click",
    () => {
            const original =
        window.lastOCRText;

    const corrected =
        output.value;



        if (
            !original ||
            !corrected
        ) {

            alert(
                "Nejdříve proveď OCR."
            );

            return;
        }

        const originalWords =
            original.split(
                /\s+/
            );

        const correctedWords =
            corrected.split(
                /\s+/
            );

        const dict =
            getDictionary();

        for (
            let i = 0;
            i <
            Math.min(
                originalWords.length,
                correctedWords.length
            );
            i++
        ) {

            if (
                originalWords[i] !==
                correctedWords[i]
            ) {

                dict[
                    originalWords[i]
                ] =
                    correctedWords[i];
            }
        }

        saveDictionary(
            dict
        );

        alert(
            "Opravy byly uloženy."
        );
    }
);

/* ===== Word ===== */

downloadBtn.addEventListener(
    "click",
    () => {

        const text =
            output.value.trim();

        if (!text) {

            alert(
                "Není co stáhnout."
            );

            return;
        }

        const html = `
<html>
<head>
<meta charset="UTF-8">
</head>
<body>
<pre style="font-family:Calibri;font-size:12pt;">
${text}
</pre>
</body>
</html>
`;

        const blob =
            new Blob(
                [
                    '\ufeff',
                    html
                ],
                {
                    type:
                        "application/msword"
                }
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            URL.createObjectURL(
                blob
            );

        link.download =
            "PrepisTextu.doc";

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );
    }
);
