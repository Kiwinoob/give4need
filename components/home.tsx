"use client"; // Mark this component as a client-side component
import Image from "next/image";
import Link from "next/link";
import { db } from "@/app/firebase";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { collection, getDocs, DocumentData } from "firebase/firestore";

interface Product {
  name: string;
  condition: string;
  images: string[];
  isProtected: boolean;
  timeAgo: string;
}
export function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList: Product[] = [];
      querySnapshot.forEach((doc: DocumentData) => {
        console.log(doc.id, " => ", doc.data()); // Log document data for debugging
        productList.push(doc.data() as Product);
        console.log("product" + doc.data());
      });
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex items-center">
      {/* <div className="container mx-auto py-8">
        {/* Search and Filters 
        <div className="flex items-center justify-between mb-6">
          <div className="w-full max-w-lg">
            <input
              type="text"
              placeholder="Search for anything and everything"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-gray-200 rounded-full">
              Bicycle
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-full">
              Coffee Table
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-full">Lego</button>
            <button className="px-4 py-2 bg-gray-200 rounded-full">Ikea</button>
            <button className="px-4 py-2 bg-gray-200 rounded-full">
              Brompton
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-full">
              Plants
            </button>
          </div>
          <div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Search
            </button>
          </div>
        </div> */}

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <Card key={index} className="w-full max-w-xs rounded-xl border width">
            <div className="grid gap-4 p-4">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-xl">
                <img
                  src="https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone15pro-digitalmat-gallery-1-202309?wid=728&hei=666&fmt=png-alpha&.v=1693346851364"
                  alt="Product image"
                  width="250"
                  height="250"
                  className="aspect-[4/5] object-cover border w-full"
                />
              </div>
              <div className="grid gap-1.5">
                <h3 className="font-semibold text-sm md:text-base">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {product.condition}
                </p>
              </div>
            </div>
            <CardFooter className="flex items-start space-x-4 justify-start">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
                <AvatarFallback>J</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">peterng11</p>
                <p className="text-xs text-muted-foreground">22 days ago</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
