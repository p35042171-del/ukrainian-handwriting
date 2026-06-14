import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

dotenv.config();

const app = express();

app.use(cors());

const upload = multer({
    dest: "uploads/"
});

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post(
    "/ocr",
    upload.single("image"),
    async (req, res) => {

        try {

            const buffer =
                fs.readFileSync(
                    req.file.path
                );

            const imagePart = {
                inlineData: {
                    data:
                        buffer.toString(
                            "base64"
                        ),
                    mimeType:
                        req.file.mimetype
                }
            };

            const response =
                await ai.models.generateContent({
                    model:
                        "gemini-2.5-flash",
                    contents: [
                        imagePart,
                        `
ПЕРЕПИШИ текст з фотографії.

Правила:
- текст українською мовою
- збережи абзаци
- виправ очевидні OCR помилки
- поверни тільки текст
`
                    ]
                });

            fs.unlinkSync(
                req.file.path
            );

            res.json({
                text:
                    response.text
            });

        } catch (error) {

            console.error(
                error
            );

            res.status(500)
                .json({
                    error:
                        "OCR failed"
                });
        }
    }
);

app.listen(
    process.env.PORT || 3000
);
