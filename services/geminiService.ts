import { GoogleGenAI, Type, Schema, GenerateContentResponse } from "@google/genai";
import { Question, Topic, Grade, DifficultyMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to retry operations when the model is overloaded
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Check for 503 Service Unavailable or "overloaded" message
    const isOverloaded = 
      error?.status === 503 || 
      error?.code === 503 || 
      (error?.message && error.message.includes("overloaded"));

    if (isOverloaded && retries > 0) {
      console.warn(`Model overloaded. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Retry with double the delay (exponential backoff)
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

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
    // Expanded detail for Year 6 to ensure high quality "sets"
    const syllabusGuidelines = `
      Panduan DSKP KSSR Semakan Mengikut Tahun ${grade}:
      - Tahun 1: Nombor hingga 100. Operasi tambah/tolak asas. Pecahan (1/2, 1/4) sahaja. Wang (RM/sen). Masa (Siang/Malam, Jam mudah).
      - Tahun 2: Nombor hingga 1000. Darab & Bahagi (sifir 2,5,10,4, etc). Perpuluhan mudah. Bentuk 2D/3D asas.
      - Tahun 3: Nombor hingga 10000. Pecahan wajar, Perpuluhan, Peratus. Wang hingga RM1000. Masa (Minit).
      - Tahun 4: Nombor hingga 100,000. Koordinat (Suku pertama). Nisbah.
      - Tahun 5: Nombor hingga 1,000,000. Nombor Perdana. Gandaan. Ruang (Perimeter/Luas/Isipadu).
      - Tahun 6 (FOKUS UTAMA):
        * Nombor: Hingga 10 juta, Pola nombor, Nombor gubahan/perdana, Kalkulator.
        * Operasi: Operasi asas & bergabung melibatkan tanda kurung.
        * Pecahan/Perpuluhan/Peratus: Pendaraban/Pembahagian pecahan, Peratusan objek, Simpanan & Pelaburan.
        * Wang: Harga kos, Jual, Untung/Rugi, Diskaun, Rebat, Baucer, Cukai perkhidmatan/jualan, Insurans, Aset & Liabiliti.
        * Masa: Zon masa dunia.
        * Ukuran: Penyelesaian masalah harian kompleks melibatkan Panjang, Jisim, Isipadu.
        * Ruang: Sudut (pedalaman/luaran poligon sekata), Bulatan (Pusat, Jejari, Diameter), Bentuk Gubahan.
        * Koordinat/Nisbah: Kadaran menyelesaikan masalah.
        * Statistik: Tafsir carta pai, Mod, Median, Min, Julat.
        * Kebarangkalian: Peristiwa mungkin/tidak mungkin.
    `;

    // Adjust instructions based on difficulty mode
    let difficultyInstruction = "";
    if (mode === 'Mudah') {
      difficultyInstruction = "Fokus kepada soalan asas dan terus (direct questions). Kurangkan soalan KBAT. Pastikan soalan mudah difahami.";
    } else if (mode === 'Sederhana') {
      difficultyInstruction = "Campuran seimbang antara soalan mudah dan sederhana. Masukkan sedikit elemen penyelesaian masalah.";
    } else {
      difficultyInstruction = "Fokus kepada soalan yang mencabar, penyelesaian masalah berayat, dan elemen KBAT (Kemahiran Berfikir Aras Tinggi). Contoh: Soalan 'Penyelesaian Masalah' yang memerlukan murid berfikir 2-3 langkah.";
    }

    const prompt = `
      Anda adalah Cikgu Syafiq, guru pakar KSSR Malaysia.
      Sila jana **${count}** soalan matematik objektif (pilihan ganda) Bahasa Melayu untuk murid **Tahun ${grade}**.
      
      Topik: "${topic}".
      Mod Latihan: **${mode}**.
      
      ${syllabusGuidelines}

      Syarat Penting:
      1. Soalan MESTI 100% menepati silibus Tahun ${grade}.
      2. **Variasi Konteks:** Gunakan pelbagai situasi (contoh: pasar raya, sukan sekolah, masakan, sains) supaya set soalan sentiasa segar dan tidak berulang.
      3. **VISUAL (SVG):**
         - Jika soalan melibatkan Geometri, Pecahan, Masa, atau Data (Carta Pai/Bar), WAJIB sertakan kod SVG dalam field 'svg'.
         - **Gaya Visual:** Flat design, kartun, garisan tebal (stroke-width: 2-4), warna cerah.
         - **Teknikal:** ViewBox "0 0 400 300". Elemen lukisan MESTI besar dan memenuhi ruang.
         - *Untuk Tahun 6 (Topik Ruang/Sudut):* Lukis poligon atau bulatan dengan label sudut/jejari yang jelas.
         - *Untuk Tahun 6 (Data):* Lukis Carta Pai dengan pecahan peratusan yang jelas.
      4. ${difficultyInstruction}
      5. Pastikan anda menjana TEPAT ${count} soalan.
    `;

    // Use withRetry to handle 503 Overloaded errors
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.75, // Increased slightly for more variety in question sets
      },
    }));

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
    // Fallback static questions if API fails after retries
    return [
      {
        id: 1,
        questionText: `Maaf, talian Cikgu Syafiq agak sibuk (Server Overloaded). Sila cuba lagi sebentar lagi atau jawab soalan percubaan ini: 5 + 5 = ?`,
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
      Gunakan analogi jika perlu.
      Jangan terlalu panjang, ringkas dan padat (maksimum 3 ayat atau langkah).
    `;

    // Use withRetry for explanation as well
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: model,
      contents: prompt,
    }));

    return response.text || "Maaf, tiada penjelasan dapat dijana buat masa ini.";
  } catch (error) {
    console.error("Error getting explanation:", error);
    return "Maaf, Cikgu Syafiq tidak dapat memberikan penjelasan sekarang. Sila semak buku teks anda.";
  }
};