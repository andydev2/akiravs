import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { Order } from "@/models/Order";

// GET /api/orders
// Returns all orders for the currently authenticated user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Find orders for this user
    const orders = await Order.find({ userEmail: session.user.email }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/orders
// Called after successful payment. Assigns an account to the user.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { items, paymentId, paymentGateway, receiptBase64 } = body; // items = [{ id, quantity }] from cart

    if (!items || items.length === 0 || !paymentGateway) {
      return NextResponse.json({ success: false, error: "Faltan datos de la orden o pago" }, { status: 400 });
    }

    // Step 6: Validate file upload (Base64) size and type
    if (receiptBase64) {
      // ~2MB max size for base64 string (aprox 2.6 million characters)
      if (receiptBase64.length > 2600000) {
        return NextResponse.json({ success: false, error: "El comprobante es demasiado grande (Máximo 2MB)" }, { status: 413 });
      }
      if (!receiptBase64.startsWith('data:image/')) {
        return NextResponse.json({ success: false, error: "Solo se permiten imágenes para el comprobante" }, { status: 415 });
      }
    }

    // Step 4: Basic NoSQL injection prevention / Sanitization
    const sanitizedItems = items.map((item: any) => ({
      id: String(item.id).replace(/[^a-zA-Z0-9_-]/g, ''),
      quantity: Math.max(1, parseInt(item.quantity) || 1)
    }));

    // Verify payment based on gateway
    if (paymentGateway === 'paypal') {
      if (!paymentId) return NextResponse.json({ success: false, error: "Falta paymentId" }, { status: 400 });
      const paypalUrl = process.env.NODE_ENV === 'production' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';
        
      const tokenRes = await fetch(`${paypalUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from((process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim() + ':' + (process.env.PAYPAL_SECRET || '').trim()).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        throw new Error("No se pudo obtener el token de PayPal");
      }

      // Capture the order
      const captureRes = await fetch(`${paypalUrl}/v2/checkout/orders/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
      
      const captureData = await captureRes.json();
      if (captureData.status !== 'COMPLETED') {
        return NextResponse.json({ success: false, error: "El pago en PayPal no pudo ser capturado." }, { status: 400 });
      }
    } else if (paymentGateway === 'transfer') {
      if (!receiptBase64) {
        return NextResponse.json({ success: false, error: "Debes subir un comprobante de transferencia" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, error: "Gateway de pago no soportado" }, { status: 400 });
    }

    await connectToDatabase();
    
    const createdOrders = [];

    // Process each item in the cart
    for (const item of sanitizedItems) {
      const product = await Product.findOne({ id: item.id });
      
      if (!product) continue;

      // We need to fulfill 'quantity' accounts for this product
      for (let i = 0; i < item.quantity; i++) {
        let username = "N/A";
        let password = "N/A";
        let accountId = Date.now().toString() + i;

        // Skip inventory check for streaming products
        if (product.category === 'streaming') {
          username = "Pendiente";
          password = "Pendiente";
        } else {
          // Find an unsold account for non-streaming products
          if (!product.accounts) product.accounts = [];
          const accountIndex = product.accounts.findIndex((acc: any) => acc.isSold === false);
          
          if (accountIndex === -1) {
            console.warn(`Out of stock for product ${product.id} during checkout processing`);
            continue; // Skip if out of stock
          }

          const accountToSell = product.accounts[accountIndex] as any;
          product.accounts[accountIndex].isSold = true;
          
          const creds = accountToSell.credentials || "";
          const [parsedUser, ...passParts] = creds.includes(':') ? creds.split(':') : [creds, ""];
          
          username = parsedUser || "N/A";
          password = passParts.join(':') || "N/A";
          accountId = accountToSell._id ? accountToSell._id.toString() : accountId;
        }
        
        // Create the order record
        const newOrder = await Order.create({
          userEmail: session.user.email,
          productId: product.id,
          productName: product.name,
          productCategory: product.category,
          accountId: accountId,
          accountUsername: username,
          accountPassword: password,
          price: product.price,
          paymentId: paymentId || 'manual_transfer',
          paymentMethod: paymentGateway,
          status: paymentGateway === 'transfer' ? 'pending_verification' : 'completed',
          receiptBase64: paymentGateway === 'transfer' ? receiptBase64 : undefined
        });

        createdOrders.push(newOrder);
      }
      
      // Save the updated product with the newly sold accounts
      await product.save();
    }

    return NextResponse.json({ success: true, message: "Orden procesada exitosamente", data: createdOrders });
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json({ success: false, error: "Error al procesar la orden" }, { status: 500 });
  }
}
