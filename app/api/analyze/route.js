import OpenAI from "openai";
import { NextResponse } from "next/server";
import pdf from "pdf-parse";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";

async function pdfFileToText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdf(buffer);
  return data.text || "";
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const oldConst = formData.get("oldConstitution");
    const newConst = formData.get("newConstitution");

    const laterNorms = formData.getAll("laterNorms") || [];
    const statsBefore = formData.getAll("statsBefore") || [];
    const statsAfter = formData.getAll("statsAfter") || [];
    const intlBefore = formData.getAll("intlBefore") || [];
    const intlAfter = formData.getAll("intlAfter") || [];

    const userInstructions = formData.get("instructions");

    if (!oldConst || !newConst) {
      return NextResponse.json(
        { error: "Debes cargar la constitución más vieja y la más nueva." },
        { status: 400 }
      );
    }

    if (
      laterNorms.length === 0 ||
      statsBefore.length === 0 ||
      statsAfter.length === 0 ||
      intlBefore.length === 0 ||
      intlAfter.length === 0
    ) {
      return NextResponse.json(
        { error: "Debes cargar al menos un archivo en cada grupo requerido." },
        { status: 400 }
      );
    }

    const groups = [
      { label: "Constitución más vieja", files: [oldConst] },
      { label: "Constitución más nueva", files: [newConst] },
      {
        label: "Normas posteriores a la nueva constitución",
        files: laterNorms,
      },
      { label: "Estadísticas oficiales anteriores", files: statsBefore },
      { label: "Estadísticas oficiales posteriores", files: statsAfter },
      {
        label: "Informes de organismos internacionales anteriores",
        files: intlBefore,
      },
      {
        label: "Informes de organismos internacionales posteriores",
        files: intlAfter,
      },
    ].filter((g) => g.files && g.files.length > 0);

    const MAX_CHARS_PER_DOC = 40000;
    const parts = [];

    for (const group of groups) {
      const texts = [];
      for (const file of group.files) {
        if (!file) continue;
        const text = await pdfFileToText(file);
        if (!text) continue;
        const trimmed =
          text.length > MAX_CHARS_PER_DOC
            ? text.slice(0, MAX_CHARS_PER_DOC) +
              "\n\n[Texto truncado por longitud en esta versión de la app]"
            : text;
        texts.push(trimmed);
      }
      if (texts.length > 0) {
        parts.push(
          "===== " +
            group.label.toUpperCase() +
            " =====\n" +
            texts.join("\n\n---\n\n")
        );
      }
    }

    const combinedText = parts.join("\n\n\n");

    const baseInstructions =
      "Eres un asistente experto en análisis de políticas públicas y derecho constitucional.\n" +
      "Tu tarea es analizar el vínculo entre el Estado y sus ciudadanos a partir de: dos constituciones (vieja/nueva),\n" +
      "normas posteriores a la nueva constitución, estadísticas oficiales antes y después de la reforma e informes de organismos internacionales previos y posteriores.\n\n" +
      "Debes identificar coherencias, brechas y tensiones entre la prescripción normativa y los resultados empíricos,\n" +
      "poniendo especial atención a las dimensiones de derechos sociales, derechos civiles y políticos y derechos de economía/propiedad.\n\n" +
      "Cuando el usuario no especifique otra cosa, produce un informe sintético de 5–8 párrafos en tono académico.";

    const finalInstructions =
      userInstructions && userInstructions.trim().length > 0
        ? baseInstructions +
          "\n\nInstrucciones adicionales del usuario:\n" +
          userInstructions
        : baseInstructions;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: finalInstructions,
      input:
        "A continuación tienes el contenido combinado de las constituciones, normas, estadísticas oficiales e informes internacionales cargados por el usuario. " +
        "Analízalos según las instrucciones anteriores.\n\n" +
        combinedText,
    });

    const resultText = response.output_text ?? "No se obtuvo texto del modelo.";

    return NextResponse.json({ result: resultText });
  } catch (err) {
    console.error("Error en /api/analyze:", err);
    return NextResponse.json(
      { error: "Error interno al procesar los PDF o llamar a OpenAI." },
      { status: 500 }
    );
  }
}
