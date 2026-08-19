import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
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
    const body = await request.json();

    if (!body.accounts || !Array.isArray(body.accounts) || body.accounts.length === 0) {
      return NextResponse.json({ success: false, error: 'Se requiere un array de cuentas' }, { status: 400 });
    }

    const product = await Product.findOne({ id: params.id }) || await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
    }

    // Agregar las cuentas al inventario
    const newAccounts = body.accounts.map((credentials: string) => ({ credentials, isSold: false }));
    
    if (!product.accounts) {
      product.accounts = [];
    }
    product.accounts.push(...newAccounts);
    
    await product.save();

    return NextResponse.json({ success: true, message: `${newAccounts.length} cuentas añadidas al inventario` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
