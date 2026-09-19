"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { SalesOrderItem } from "./sales-orders-table";

export function useSalesOrdersFilters(salesOrders: SalesOrderItem[]) {
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [customerFilter, setCustomerFilter] = React.useState(searchParams.get("customer") || "ALL");
  const [statusFilter, setStatusFilter] = React.useState(
    searchParams.get("status")?.toUpperCase() || "ALL"
  );
  const [startDate, setStartDate] = React.useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = React.useState(searchParams.get("endDate") || "");

  const filteredOrders = React.useMemo(() => {
    return salesOrders.filter((so) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        so.soNumber.toLowerCase().includes(q) ||
        (so.customer?.name && so.customer.name.toLowerCase().includes(q));

      const matchesCustomer =
        customerFilter === "ALL" ||
        so.customerId === customerFilter ||
        so.customer?.id === customerFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        so.status.toUpperCase() === statusFilter.toUpperCase();

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(so.orderDate) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(so.orderDate) <= new Date(endDate);
      }

      return matchesSearch && matchesCustomer && matchesStatus && matchesDate;
    });
  }, [salesOrders, search, customerFilter, statusFilter, startDate, endDate]);

  const hasActiveFilters = Boolean(
    search || customerFilter !== "ALL" || statusFilter !== "ALL" || startDate || endDate
  );

  const resetFilters = () => {
    setSearch("");
    setCustomerFilter("ALL");
    setStatusFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  return {
    search,
    setSearch,
    customerFilter,
    setCustomerFilter,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredOrders,
    hasActiveFilters,
    resetFilters,
  };
}
