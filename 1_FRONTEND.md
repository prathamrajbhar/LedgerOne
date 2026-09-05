# Frontend Developer #1 - Implementation Tasks

**Branch Prefix:** `frontend1/`  
**Total Tasks:** 25  
**Estimated Time:** 3-4 weeks

---

## ⚠️ Critical Rules

1. **One Task → One Commit → One PR** - Complete a task, test it, commit immediately, open PR, get it merged, THEN move to next task
2. **Never batch multiple tasks** - Each task is a separate commit with proper convention
3. **Branch per task** - `frontend1/shadcn-setup`, `frontend1/contacts-list`, etc.
4. **Test before commit** - Run `npm run lint && npm run type-check`
5. **Merge before next** - Task N+1 only starts after Task N is merged to main

---

## Phase 1: UI Foundation & Components (Tasks 1-8)

### Task 1: shadcn/ui Component Installation

**What to Install:**
```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add textarea
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add separator
npx shadcn@latest add avatar
npx shadcn@latest add toast
npx shadcn@latest add sonner
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add alert
npx shadcn@latest add alert-dialog
```

**Configure Tailwind:**
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Commit:**
```bash
git checkout -b frontend1/shadcn-setup
git add .
git commit -m "chore(ui): install shadcn/ui components and configure Tailwind

- Install 20+ shadcn/ui components
- Configure Tailwind with design tokens
- Set up CSS variables for theming

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Common UI Components

**File:** `components/ui/page-header.tsx`
```typescript
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
```

**File:** `components/ui/data-table.tsx`
```typescript
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

**File:** `components/ui/status-badge.tsx`
```typescript
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  CONFIRMED: "bg-blue-500",
  CANCELLED: "bg-red-500",
  NOT_PAID: "bg-yellow-500",
  PARTIAL: "bg-orange-500",
  PAID: "bg-green-500",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = statusColors[status] || "bg-gray-500";
  return (
    <Badge className={`${color} text-white`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
```

**File:** `components/ui/loading-spinner.tsx`
```typescript
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
```

**File:** `components/ui/empty-state.tsx`
```typescript
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

**Commit:**
```bash
git checkout -b frontend1/common-components
git add components/ui/
git commit -m "feat(ui): add common UI components

- PageHeader for consistent page titles
- DataTable wrapper for @tanstack/react-table
- StatusBadge for order/payment status display
- LoadingSpinner for async states
- EmptyState for empty lists

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3-8: Form Components, Validation Schemas, Layout Components

Continue with similar pattern for:
- Task 3: Form field components (FormInput, FormSelect, FormTextarea, FormDatePicker)
- Task 4: Zod validation schemas for all entities
- Task 5: Layout components (Sidebar, Navbar)
- Task 6: Pagination component
- Task 7: Search and filter components
- Task 8: Toast notification setup

---

## Phase 2: Authentication Pages (Tasks 9-12)

### Task 9: Login Page

**File:** `app/(auth)/login/page.tsx`
```typescript
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Logged in successfully");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to LedgerOne</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**File:** `app/(auth)/layout.tsx`
```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

**Commit:**
```bash
git checkout -b frontend1/login-page
git add app/(auth)/
git commit -m "feat(auth): add login page with form validation

- Email and password input fields
- Auth.js integration for credentials login
- Error handling with toast notifications
- Links to sign-up and forgot password

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10-12: Sign Up, Forgot Password, Reset Password Pages

Continue with similar pattern for remaining auth pages.

---

## Phase 3: Master Data Pages (Tasks 13-20)

### Task 13: Contacts List Page

**File:** `app/(workspace)/contacts/page.tsx`
```typescript
import { contactService } from "@/lib/services/contact.service";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ContactsTable } from "./contacts-table";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: string; page?: string };
}) {
  const contacts = await contactService.list({
    search: searchParams.search,
    type: searchParams.type as any,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  });

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Manage customers and vendors"
        actions={
          <Link href="/contacts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Contact
            </Button>
          </Link>
        }
      />
      <ContactsTable data={contacts} />
    </div>
  );
}
```

**File:** `app/(workspace)/contacts/contacts-table.tsx`
```typescript
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "CUSTOMER" ? "default" : "secondary"}>
        {row.original.type}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/contacts/${row.original.id}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/contacts/${row.original.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

interface ContactsTableProps {
  data: {
    data: Contact[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export function ContactsTable({ data }: ContactsTableProps) {
  return <DataTable columns={columns} data={data.data} />;
}
```

**Commit:**
```bash
git checkout -b frontend1/contacts-list
git add app/(workspace)/contacts/
git commit -m "feat(contacts): add contacts list page with table

- Server component for data fetching
- Client component for interactive table
- Search and filter by type
- Actions dropdown for view/edit
- Pagination support

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 14-20: Contact Form, Products List/Form, Accounts, Journals, Analytics, Tax Rates

Continue with CRUD pages for all master data entities using similar patterns.

---

## Phase 4: Help Assistant (Task 21)

### Task 21: Help Assistant Chat Widget

**File:** `components/help-assistant/chat-widget.tsx`
```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function HelpAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/help-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Help Assistant</h3>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Hi! Ask me anything about using LedgerOne.
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground ml-8"
                : "bg-muted mr-8"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-sm text-muted-foreground">Thinking...</div>}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask a question..."
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

**File:** `app/api/help-assistant/chat/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { helpAssistantService } from "@/lib/chatbot/help-assistant";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const response = await helpAssistantService.chat({ messages });

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
```

**Commit:**
```bash
git checkout -b frontend1/help-assistant
git add components/help-assistant/ app/api/help-assistant/
git commit -m "feat(chatbot): add help assistant chat widget

- Floating chat button in bottom-right corner
- Chat interface with message history
- API route for Anthropic Claude integration
- Session-based conversation flow

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 5: Testing (Tasks 22-25)

### Task 22: Component Unit Tests

**File:** `components/ui/__tests__/data-table.test.tsx`

Test rendering, sorting, pagination of DataTable component.

**Commit:**
```bash
git commit -m "test(ui): add unit tests for UI components

- Test DataTable rendering and interactions
- Test StatusBadge color mapping
- Test EmptyState action callbacks

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 23-25: Form tests, Integration tests, E2E tests

Continue with comprehensive testing coverage.

---

## Summary

**Your Task Completion Order:**
1. shadcn/ui Setup
2. Common UI Components
3-8. Form Components, Validation, Layouts
9-12. Authentication Pages
13-20. Master Data CRUD Pages
21. Help Assistant Widget
22-25. Testing

**Your Workflow:**
Same as backend developers - one task, one commit, one PR, merge, next task.

**Never skip ahead. One task at a time.**

---

**Questions?** Check CLAUDE.md for detailed guidelines.
