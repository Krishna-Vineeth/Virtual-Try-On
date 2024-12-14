// import { NavBar } from "@/components/nav-bar"

import { ProductForm } from "@/components/product-form-new"

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <NavBar /> */}
      <div className="flex flex-1">
        <main className="flex-1 p-6">
          <ProductForm />
        </main>
      </div>
    </div>
  )
}

