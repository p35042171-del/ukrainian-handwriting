import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

// ✔ STARÝ STABILNÍ GEMINI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

app.post("/ocr", upload.single("image"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({ error: "No file" });
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
            "Extract text from this image. Return only text."
        ]);

        const response = await result.response;

        res.json({
            text: response.text()
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "OCR failed" });

    } finally {
        if (req.file?.path) fs.unlink(req.file.path, () => {});
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("OCR server running");
});
