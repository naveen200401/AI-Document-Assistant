import React from 'react'
import { Outlet, Link } from 'react-router-dom'


export default function Layout() {
return (
<div className="min-h-screen flex">
<aside className="w-64 bg-white border-r p-4 hidden md:block">
<div className="text-lg font-bold mb-6">AI Docs Platform</div>
<nav>
<Link to="/projects" className="block py-2 text-gray-700">Projects</Link>
</nav>
</aside>
<main className="flex-1 p-8">
<Outlet />
</main>
</div>
)
}