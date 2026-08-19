import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
    }

    await dbConnect();
    
    const params = await props.params;
    
    // El id que viene de los params puede ser el "id" string que creamos o el _id de Mongo
    // Vamos a intentar borrar por el campo "id" de nuestro esquema
    const result = await Product.findOneAndDelete({ id: params.id });
    
    if (!result) {
      // Si no lo encuentra por "id", intentar por "_id" de mongo (si aplica)
      const fallbackResult = await Product.findByIdAndDelete(params.id);
      if (!fallbackResult) {
        return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
