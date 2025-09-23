import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-gray-900 text-white p-4 space-y-4">
        <Link to="/admin" className="block text-xl font-semibold">Admin</Link>
        <nav className="space-y-2">
          <Link 
            to="/" 
            className="flex items-center px-2 py-1 rounded hover:bg-gray-800 text-blue-300 hover:text-blue-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
          <NavLink to="/admin" end className={({ isActive }) => `block px-2 py-1 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>Dashboard</NavLink>
          <NavLink to="/admin/events" className={({ isActive }) => `block px-2 py-1 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>Events</NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `block px-2 py-1 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>Users</NavLink>
        </nav>
      </aside>
      <main className="p-6 bg-gray-50">{children}</main>
    </div>
  );
}

export default AdminLayout;


