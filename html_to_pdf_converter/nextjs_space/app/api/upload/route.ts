
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nessun file trovato" },
        { status: 400 }
      );
    }

    // Verifica che sia un file HTML
    if (!file?.type?.includes('html') && !file?.name?.toLowerCase()?.endsWith('.html') && !file?.name?.toLowerCase()?.endsWith('.htm')) {
      return NextResponse.json(
        { error: "Il file deve essere un file HTML" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cloudStoragePath = await uploadFile(buffer, file.name);

    return NextResponse.json({
      success: true,
      cloudStoragePath,
      message: "File caricato con successo"
    });

  } catch (error) {
    console.error("Errore durante l'upload:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento del file" },
      { status: 500 }
    );
  }
}
