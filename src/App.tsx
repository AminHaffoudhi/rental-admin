import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { BookingDetail } from "@/pages/BookingDetail";
import { Bookings } from "@/pages/Bookings";
import { Dashboard } from "@/pages/Dashboard";
import { Deliveries } from "@/pages/Deliveries";
import { DisputeDetail } from "@/pages/DisputeDetail";
import { Disputes } from "@/pages/Disputes";
import { Categories } from "@/pages/Categories";
import { Equipment } from "@/pages/Equipment";
import { Reviews } from "@/pages/Reviews";
import { Login } from "@/pages/Login";
import { Payments } from "@/pages/Payments";
import { UserDetail } from "@/pages/UserDetail";
import { Users } from "@/pages/Users";

export default function App(): ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/disputes" element={<Disputes />} />
          <Route path="/disputes/:id" element={<DisputeDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
