require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const upload = multer({
    dest: "uploads/"
});

app.post("/api/recognize", upload.single("image"), async (req, res) => {

    try {

        const imagePath = req.file.path;

        const base64 = fs.readFileSync(imagePath, {
            encoding: "base64"
        });

        const response = await openai.responses.create({
            model: "gpt-4.1",
            input: [
                {
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text:
`Přečti ručně psaný text z obrázku.

Pravidla:
- Přepiš text přesně.
- Oprav pouze zjevné OCR chyby.
- Zachovej odstavce.
- Nevysvětluj.
- Vrať pouze samotný text.`
                        },
                        {
                            type: "input_image",
                            image_url: `data:image/jpeg;base64,${base64}`
                        }
                    ]
                }
            ]
        });

        fs.unlinkSync(imagePath);

        res.json({
            text: response.output_text
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Nepodařilo se rozpoznat text."
        });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server běží na portu ${process.env.PORT}`);
});