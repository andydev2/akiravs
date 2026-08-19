import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { action, email, password, profile, pin } = await request.json();
    
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ success: false, error: "Acción inválida" }, { status: 400 });
    }

    await connectToDatabase();
    
    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 });
    }

    if (action === 'approve') {
      order.status = 'completed';
      
      // Save manually entered credentials for streaming products
      if (email && password) {
        order.accountUsername = email;
        order.accountPassword = password;
        if (profile) order.accountProfile = profile;
        if (pin) order.accountPin = pin;
      }
      
      await order.save();
    } else if (action === 'reject') {
      // Si se rechaza, podríamos devolver la cuenta al inventario, pero por ahora solo borramos la orden
      // y la cuenta queda como "isSold: true" a menos que implementemos una lógica de reembolso de cuenta
      // Para un MVP, simplemente borramos la orden.
      await Order.findByIdAndDelete(orderId);
    }

    return NextResponse.json({ success: true, message: action === 'approve' ? "Orden aprobada" : "Orden rechazada" });
  } catch (error) {
    console.error("Error updating admin order:", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
