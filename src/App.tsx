
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Public shop pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CatalogPage from "./pages/shop/CatalogPage";
import ProductPage from "./pages/shop/ProductPage";
import TenderPage from "./pages/shop/TenderPage";
import ServicePage from "./pages/shop/ServicePage";
import DocumentsPage from "./pages/shop/DocumentsPage";
import BlogPage from "./pages/shop/BlogPage";
import ContactsPage from "./pages/shop/ContactsPage";

// Admin pages
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminCatalog from "./pages/admin/Catalog";
import Leads from "./pages/admin/Leads";
import Clients from "./pages/admin/Clients";
import Content from "./pages/admin/Content";
import Users from "./pages/admin/Users";
import Profile from "./pages/admin/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ── Публичный сайт ── */}
            <Route path="/" element={<Index />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:id" element={<ProductPage />} />
            <Route path="/tender" element={<TenderPage />} />
            <Route path="/service" element={<ServicePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contacts" element={<ContactsPage />} />

            {/* ── Админ-панель ── */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/catalog" element={<AdminCatalog />} />
            <Route path="/admin/leads" element={<Leads />} />
            <Route path="/admin/clients" element={<Clients />} />
            <Route path="/admin/content" element={<Content />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/profile" element={<Profile />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
