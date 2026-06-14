import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());

// upload do temp složky
const upload = multer({ dest: "uploads/" });

// Gemini správně
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

app.post("/ocr", upload.single("image"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded"
            });
        }

        const buffer = fs.readFileSync(req.file.path);

        const imagePart = {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([
            imagePart,
            `
PŘEPIS text z obrázku:

- zachovej původní jazyk
- zachovej strukturu
- oprav OCR chyby
- vrať pouze čistý text
            `
        ]);

        const response = await result.response;

        res.json({
            text: response.text()
        });

    } catch (error) {

        console.error("OCR ERROR:", error);

        res.status(500).json({
            error: "OCR failed"
        });

    } finally {

        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
