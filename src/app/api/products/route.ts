import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).lean();
    
    // Calcular el stock y eliminar las cuentas por seguridad (para no exponer contraseñas)
    const sanitizedProducts = products.map((p: any) => {
      const stockCount = p.accounts ? p.accounts.filter((a: any) => !a.isSold).length : 0;
      const { accounts, ...productWithoutAccounts } = p;
      return {
        ...productWithoutAccounts,
        stock: stockCount
      };
    });

    return NextResponse.json({ success: true, data: sanitizedProducts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    // Verificar que el usuario es administrador
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado. Solo el administrador puede crear productos.' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    // Generamos un id simple si no viene uno
    if (!body.id) {
      body.id = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    // Autogenerar icono si no viene
    if (!body.icon) {
      body.icon = body.name.substring(0, 1).toUpperCase();
    }

    // Convertir imageUrl a array de images si existe
    if (body.imageUrl) {
      body.images = [body.imageUrl];
    }

    // Procesar cuentas iniciales si existen
    if (body.accounts && Array.isArray(body.accounts)) {
      body.accounts = body.accounts.map((accStr: string) => ({
        credentials: accStr,
        isSold: false
      }));
    }

    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
