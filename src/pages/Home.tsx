import React from 'react';

const TAG = "APP: ";
function App() {
  return (
    <div>

      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Welcome to My Website</h1>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <section className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4">About Us</h2>
          <p className="text-gray-700">
            We are a company dedicated to providing the best services to our customers.
            Our goal is to exceed your expectations and deliver excellent value.
          </p>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-700">
            Reach out to us anytime at <a href="mailto:contact@mywebsite.com" className="text-blue-600">contact@mywebsite.com</a>.
          </p>
        </section>
      </main>

      <footer className="bg-blue-600 text-white p-4 text-center">
        <div className="container mx-auto">
          <p>&copy; 2025 My Website. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}

export default App;