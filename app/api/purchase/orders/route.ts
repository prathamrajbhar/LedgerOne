import { NextRequest, NextResponse } from "next/server";
import { purchaseOrderService } from "@/lib/services/purchase-order.service";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const order = await purchaseOrderService.create(data);
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create purchase order" },
      { status: 400 }
    );
  }
}
