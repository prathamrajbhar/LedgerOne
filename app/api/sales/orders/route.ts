import { NextRequest, NextResponse } from "next/server";
import { salesOrderService } from "@/lib/services/sales-order.service";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const order = await salesOrderService.create(data);
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Error creating sales order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create sales order" },
      { status: 400 }
    );
  }
}
