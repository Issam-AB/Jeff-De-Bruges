import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Jeff de Bruges</h3>
          <p className="text-sm text-gray-600">Chocolats fins et artisanaux</p>
        </div>
      </div>
    </footer>
  )
}

