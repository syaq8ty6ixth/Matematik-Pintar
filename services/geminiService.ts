import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, Topic, Grade, DifficultyMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for generating questions
const questionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      questionText: { type: Type.STRING, description: "The math question text in Malay." },
      options: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "An array of 4 multiple choice options." 
      },
      correctAnswerIndex: { 
        type: Type.INTEGER, 
        description: "The index (0-3) of the correct answer in the options array." 
      },
      difficulty: {
        type: Type.STRING,
        enum: ["Mudah", "Sederhana", "Sukar"],
        description: "The difficulty level of this specific question."
      },
      svg: {
        type: Type.STRING,
        description: "Optional. A complete, valid SVG string (starting with <svg...>) to visualize the question (e.g., blocks, clocks, shapes, shaded fractions). ViewBox 0 0 400 300."
      }
    },
    required: ["questionText", "options", "correctAnswerIndex", "difficulty"],
  }
};

export const generateQuestionsForTopic = async (
  topic: Topic, 
  grade: Grade, 
  count: number,
  mode: DifficultyMode
): Promise<Question[]> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Specific instructions per grade based on Malaysian KSSR Syllabus
    const syllabusGuidelines = `
      Panduan DSKP KSSR Semakan Mengikut Tahun ${grade}:
      - Tahun 1: Nombor hingga 100. Operasi tambah/tolak asas. Pecahan (1/2, 1/4) sahaja. Wang (RM/sen). Masa (Siang/Malam, Jam mudah). Tiada perpuluhan/peratus.
      - Tahun 2: Nombor hingga 1000. Darab & Bahagi (sifir 2,5,10,4, etc). Perpuluhan mudah. Bentuk 2D/3D asas.
      - Tahun 3: Nombor hingga 10000. Pecahan wajar, Perpuluhan, Peratus. Wang hingga RM1000. Masa (Minit).
      - Tahun 4: Nombor hingga 100,000. Koordinat (Suku pertama). Nisbah.
      - Tahun 5: Nombor hingga 1,000,000. Nombor Perdana. Gandaan. Ruang (Perimeter/Luas/Isipadu).
      - Tahun 6: Nombor hingga 10,000,000. Kebarangkalian. Cukai/Insurans (Kewangan).
    `;

    // Adjust instructions based on difficulty mode
    let difficultyInstruction = "";
    if (mode === 'Mudah') {
      difficultyInstruction = "Fokus kepada soalan asas dan terus (direct questions). Kurangkan soalan KBAT. Pastikan soalan mudah difahami.";
    } else if (mode === 'Sederhana') {
      difficultyInstruction = "Campuran seimbang antara soalan mudah dan sederhana. Masukkan sedikit elemen penyelesaian masalah.";
    } else {
      difficultyInstruction = "Fokus kepada soalan yang mencabar, penyelesaian masalah berayat, dan elemen KBAT (Kemahiran Berfikir Aras Tinggi).";
    }

    const prompt = `
      Anda adalah Cikgu Syafiq, seorang guru matematik yang pakar dengan silibus Malaysia (KSSR Semakan).
      Sila jana **${count}** soalan matematik objektif (pilihan ganda) dalam Bahasa Melayu untuk murid **Tahun ${grade}** (Darjah ${grade}).
      
      Topik: "${topic}".
      Mod Latihan: **${mode}**.
      
      ${syllabusGuidelines}

      Syarat Penting:
      1. Soalan MESTI 100% menepati silibus Tahun ${grade}.
      2. Gunakan laras bahasa yang sesuai dengan umur murid.
      3. **VISUAL (SVG):**
         - Jika soalan memerlukan gambar rajah (wajib untuk soalan bentuk, pecahan, masa, dan pengiraan objek), sertakan kod SVG dalam field 'svg'.
         - **Gaya Visual:** Flat design, kartun, garisan tebal (stroke-width: 2-4), warna cerah (pastel/vibrant) yang kontras dan menarik untuk kanak-kanak.
         - **Teknikal:**
           - Gunakan \`viewBox="0 0 400 300"\`.
           - Pastikan elemen lukisan besar dan memenuhi ruang.
           - Untuk pecahan: Gunakan carta pai atau bar yang jelas pembahagiannya dan warna yang berbeza untuk kawasan berlorek.
           - Untuk masa: Lukis muka jam analog dengan nombor besar dan jarum jam/minit yang tebal dan jelas.
           - Untuk pengiraan: Lukis objek mudah (epal, bola, bintang) yang disusun rapi (grid layout) agar mudah dikira.
           - Jangan gunakan text kecil.
      4. ${difficultyInstruction}
      5. Pastikan anda menjana TEPAT ${count} soalan.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Add local IDs
      return data.map((q: any, index: number) => ({
        ...q,
        id: Date.now() + index
      }));
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Error generating questions:", error);
    // Fallback static questions if API fails
    return [
      {
        id: 1,
        questionText: `Maaf, Cikgu Syafiq sedang sibuk. Soalan percubaan untuk Tahun ${grade}: 5 + 5 = ?`,
        options: ["8", "10", "12", "15"],
        correctAnswerIndex: 1,
        difficulty: "Mudah"
      }
    ];
  }
};

export const getExplanation = async (question: string, answer: string, grade: Grade): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Soalan: "${question}"
      Jawapan Betul: "${answer}"
      Sasaran Murid: Tahun ${grade} (Umur ${grade + 6} tahun).
      
      Anda adalah Cikgu Syafiq. Terangkan jalan kerja untuk mendapatkan jawapan ini. 
      Gunakan Bahasa Melayu yang mudah difahami, ceria, dan menggalakkan. 
      Gunakan analogi jika perlu (contohnya buah, gula-gula) terutamanya untuk Tahun 1-3.
      Jangan terlalu panjang, ringkas dan padat (maksimum 3 ayat atau langkah).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Maaf, tiada penjelasan dapat dijana buat masa ini.";
  } catch (error) {
    console.error("Error getting explanation:", error);
    return "Sila semak buku teks anda untuk jalan kerja yang lengkap.";
  }
};