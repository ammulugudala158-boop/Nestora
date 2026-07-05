import { setAuthTokenGetter } from '@workspace/api-client-react';

// Setup token getter before anything else
setAuthTokenGetter(() => {
  return localStorage.getItem('nestora_token');
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/context/cart-context';

// Public
import Home from '@/pages/public/home';
import Login from '@/pages/public/login';
import Register from '@/pages/public/register';

// Customer
import Shop from '@/pages/customer/shop';
import ProductDetail from '@/pages/customer/product-detail';
import Cart from '@/pages/customer/cart';
import Orders from '@/pages/customer/orders';
import OrderDetail from '@/pages/customer/order-detail';
import Profile from '@/pages/customer/profile';
import Offers from '@/pages/customer/offers';
import Favorites from '@/pages/customer/favorites';
import Tickets from '@/pages/customer/tickets';
import TicketDetail from '@/pages/customer/ticket-detail';
import CustomerLayout from '@/components/layouts/customer-layout';

// Owner
import AdminDashboard from '@/pages/owner/dashboard';
import AdminProducts from '@/pages/owner/products';
import AdminProductForm from '@/pages/owner/product-form';
import AdminOrders from '@/pages/owner/orders';
import AdminCategories from '@/pages/owner/categories';
import AdminCustomers from '@/pages/owner/customers';
import AdminOffers from '@/pages/owner/offers';
import AdminTickets from '@/pages/owner/tickets';
import AdminBusiness from '@/pages/owner/business';
import OwnerLayout from '@/components/layouts/owner-layout';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Customer Routes */}
      <Route path="/shop">
        <CustomerLayout><Shop /></CustomerLayout>
      </Route>
      <Route path="/shop/:id">
        <CustomerLayout><ProductDetail /></CustomerLayout>
      </Route>
      <Route path="/cart">
        <CustomerLayout><Cart /></CustomerLayout>
      </Route>
      <Route path="/orders">
        <CustomerLayout><Orders /></CustomerLayout>
      </Route>
      <Route path="/orders/:id">
        <CustomerLayout><OrderDetail /></CustomerLayout>
      </Route>
      <Route path="/profile">
        <CustomerLayout><Profile /></CustomerLayout>
      </Route>
      <Route path="/offers">
        <CustomerLayout><Offers /></CustomerLayout>
      </Route>
      <Route path="/favorites">
        <CustomerLayout><Favorites /></CustomerLayout>
      </Route>
      <Route path="/tickets">
        <CustomerLayout><Tickets /></CustomerLayout>
      </Route>
      <Route path="/tickets/:id">
        <CustomerLayout><TicketDetail /></CustomerLayout>
      </Route>

      {/* Owner Routes */}
      <Route path="/admin">
        <OwnerLayout><AdminDashboard /></OwnerLayout>
      </Route>
      <Route path="/admin/products">
        <OwnerLayout><AdminProducts /></OwnerLayout>
      </Route>
      <Route path="/admin/products/new">
        <OwnerLayout><AdminProductForm /></OwnerLayout>
      </Route>
      <Route path="/admin/products/:id/edit">
        <OwnerLayout><AdminProductForm /></OwnerLayout>
      </Route>
      <Route path="/admin/orders">
        <OwnerLayout><AdminOrders /></OwnerLayout>
      </Route>
      <Route path="/admin/categories">
        <OwnerLayout><AdminCategories /></OwnerLayout>
      </Route>
      <Route path="/admin/customers">
        <OwnerLayout><AdminCustomers /></OwnerLayout>
      </Route>
      <Route path="/admin/offers">
        <OwnerLayout><AdminOffers /></OwnerLayout>
      </Route>
      <Route path="/admin/tickets">
        <OwnerLayout><AdminTickets /></OwnerLayout>
      </Route>
      <Route path="/admin/business">
        <OwnerLayout><AdminBusiness /></OwnerLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;



