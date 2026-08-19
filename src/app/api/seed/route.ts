import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { allProducts } from '@/data/products';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();
    
    // Sync all products
    for (const product of allProducts) {
      await Product.findOneAndUpdate({ id: product.id }, product, { upsert: true, new: true });
    }

    return NextResponse.json({ success: true, message: 'Productos iniciales insertados con éxito.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
