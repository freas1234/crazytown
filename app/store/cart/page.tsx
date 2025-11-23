"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { AuthGuard } from "../../../components/AuthGuard";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Input } from "../../../components/ui/input";

interface Product {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  price: number;
  salePrice?: number;
  imageUrl: string;
  category: string;
  featured: boolean;
  stock: number;
  digital: boolean;
  outOfStock?: boolean;
  outOfStockMessage?: {
    en: string;
    ar: string;
  };
}

interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export default function Cart() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");

  // Calculate total number of items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        console.log("Fetching cart data...");

        const storedCart = localStorage.getItem("cart");
        if (!storedCart) {
          console.log("No cart data found in localStorage");
          setLoading(false);
          return;
        }

        const parsedCart: CartItem[] = JSON.parse(storedCart);
        console.log("Parsed cart data:", parsedCart);

        if (parsedCart.length === 0) {
          console.log("Cart is empty");
          setLoading(false);
          return;
        }

        const productPromises = parsedCart.map((item) => {
          console.log(`Fetching product details for ID: ${item.productId}`);
          return fetch(`/api/products/${item.productId}`)
            .then((res) => {
              console.log(
                `Product ${item.productId} response status:`,
                res.status
              );
              return res.ok ? res.json() : null;
            })
            .then((data) => {
              console.log(
                `Product ${item.productId} data:`,
                data?.product || null
              );
              return data?.product;
            })
            .catch((err) => {
              console.error(`Error fetching product ${item.productId}:`, err);
              return null;
            });
        });

        const products = await Promise.all(productPromises);
        console.log("All fetched products:", products);

        const cartWithProducts = parsedCart
          .map((item, index) => ({
            ...item,
            product: products[index],
          }))
          .filter((item) => item.product !== null);

        console.log("Final cart with products:", cartWithProducts);

        setCart(cartWithProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        toast.error("Failed to load cart data. Please try again later.");
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      return removeItem(productId);
    }

    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    toast.success("Cart cleared");
  };

  const calculateDiscountPercentage = (
    originalPrice: number,
    salePrice: number
  ) => {
    if (
      !originalPrice ||
      !salePrice ||
      originalPrice <= 0 ||
      salePrice >= originalPrice
    )
      return null;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const subtotal = cart.reduce((sum, item) => {
    if (!item.product) return sum;
    const price =
      item.product.salePrice && item.product.salePrice > 0
        ? item.product.salePrice
        : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const getFinalTotal = () => Math.max(0, subtotal - couponDiscount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (!cart.length) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setApplyingCoupon(true);

      const cartItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code: couponCode.trim(),
          cartItems,
          subtotal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to validate coupon");
      }

      const data = await response.json();

      setCouponDiscount(data.discount);
      setCouponApplied(true);
      setAppliedCouponCode(data.coupon.code);
      toast.success(
        `Coupon "${data.coupon.code}" applied! ${data.coupon.description || ""}`
      );

      // Store coupon in localStorage for checkout page
      localStorage.setItem(
        "checkoutCoupon",
        JSON.stringify({
          code: data.coupon.code,
          discount: data.discount,
        })
      );
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to apply coupon"
      );
      setCouponDiscount(0);
      setCouponApplied(false);
      setAppliedCouponCode("");
      localStorage.removeItem("checkoutCoupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
    setAppliedCouponCode("");
    localStorage.removeItem("checkoutCoupon");
    toast.success("Coupon removed");
  };

  const proceedToCheckout = async () => {
    try {
      setLoadingCheckout(true);

      if (!cart.length) {
        toast.error("Your cart is empty");
        setLoadingCheckout(false);
        return;
      }

      const outOfStockItems = cart.filter(
        (item) =>
          item.product?.outOfStock ||
          (!item.product?.digital && (item.product?.stock || 0) < item.quantity)
      );

      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems
          .map((item) => item.product?.name[locale])
          .join(", ");
        toast.error(
          `Some items are out of stock or have insufficient quantity: ${itemNames}`
        );
        setLoadingCheckout(false);
        return;
      }

      const orderItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const orderBody = {
        items: orderItems,
        paymentMethod: "paypal",
        deliveryMethod: "digital",
        ...(couponApplied &&
          appliedCouponCode && { couponCode: appliedCouponCode }),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await response.json();

      router.push(`/store/checkout/${orderData.order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create order"
      );
      setLoadingCheckout(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/80">
        <Header />
        <main className="flex-grow">
          <section className="py-12 md:py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
            <div className="container max-w-6xl mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                    <span className="cyberpunk-border inline-block relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[3px] after:bg-primary">
                      {t("store.cart.title", "Your Cart")}
                    </span>
                  </h1>
                  {!loading && cart.length > 0 && (
                    <p className="text-muted-foreground mt-2">
                      {totalItems}{" "}
                      {totalItems === 1
                        ? t("store.cart.item", "item")
                        : t("store.cart.items", "items")}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="group border-primary/30 hover:bg-primary/20 hover:text-primary"
                >
                  <Link href="/store" className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    {t("store.cart.continue_shopping", "Continue Shopping")}
                  </Link>
                </Button>
              </div>

              {loading ? (
                <div className="max-w-4xl mx-auto">
                  <Card className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg">
                    <CardHeader className="animate-pulse">
                      <div className="h-8 bg-gray-800 rounded w-1/3 mb-2"></div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex gap-4 animate-pulse">
                          <div className="h-24 w-24 bg-gray-800 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-800 rounded w-32"></div>
                          </div>
                          <div className="h-8 w-24 bg-gray-800 rounded"></div>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="animate-pulse">
                      <div className="h-10 bg-gray-800 rounded w-full"></div>
                    </CardFooter>
                  </Card>
                </div>
              ) : cart.length === 0 ? (
                <Card className="max-w-4xl mx-auto border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg overflow-hidden">
                  <CardContent className="pt-12 pb-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="relative w-24 h-24 mb-6 text-muted-foreground">
                      <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75"></div>
                      <div className="relative flex items-center justify-center w-full h-full bg-secondary rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {t("store.cart.empty_cart", "Your cart is empty")}
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      {t(
                        "store.cart.empty_cart_message",
                        "Looks like you haven't added any items to your cart yet."
                      )}
                    </p>
                    <Button
                      asChild
                      size="lg"
                      className="px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all hover:scale-105"
                    >
                      <Link href="/store">
                        {t("store.cart.browse_products", "Browse Products")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <div className="lg:col-span-2">
                    <Card className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg overflow-hidden">
                      <CardHeader className="border-b border-gray-800">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl font-bold text-white">
                            {t("store.cart.shopping_cart", "Shopping Cart")}
                          </CardTitle>
                          <Button
                            onClick={clearCart}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            {t("store.cart.clear_cart", "Clear Cart")}
                          </Button>
                        </div>
                      </CardHeader>
                      <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                        <CardContent className="p-0">
                          {cart.map((item) => (
                            <div
                              key={item.productId}
                              className="flex flex-col md:flex-row items-start gap-4 border-b border-gray-800 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0"
                            >
                              <div className="w-full md:w-20 h-20 relative rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                                <Image
                                  src={
                                    item.product?.imageUrl ||
                                    "/placeholder-product.jpg"
                                  }
                                  alt={item.product?.name[locale] || ""}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="flex-1">
                                <Link
                                  href={`/store/product/${item.productId}`}
                                  className="text-white hover:text-primary transition-colors font-medium"
                                >
                                  {item.product?.name[locale]}
                                </Link>

                                <div className="flex items-center mt-1">
                                  {item.product?.salePrice &&
                                  item.product.salePrice > 0 ? (
                                    <>
                                      <span className="text-primary font-medium">
                                        ${item.product.salePrice.toFixed(2)}
                                      </span>
                                      <span className="text-gray-400 line-through text-sm ml-2">
                                        ${item.product?.price.toFixed(2)}
                                      </span>
                                      {calculateDiscountPercentage(
                                        item.product.price,
                                        item.product.salePrice
                                      ) && (
                                        <span className="ml-2 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded">
                                          {calculateDiscountPercentage(
                                            item.product.price,
                                            item.product.salePrice
                                          )}
                                          % {t("store.cart.off", "off")}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-primary font-medium">
                                      ${item.product?.price.toFixed(2)}
                                    </span>
                                  )}
                                  <span className="text-gray-400 text-sm ml-2">
                                    {t("store.cart.each", "each")}
                                  </span>
                                </div>

                                {item.product?.outOfStock && (
                                  <div className="mt-1 text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded inline-block">
                                    {item.product.outOfStockMessage?.[locale] ||
                                      t("store.out_of_stock", "Out of stock")}
                                  </div>
                                )}
                                {!item.product?.digital &&
                                  !item.product?.outOfStock &&
                                  (item.product?.stock || 0) <
                                    item.quantity && (
                                    <div className="mt-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded inline-block">
                                      {t("store.insufficient_stock", "Only")}{" "}
                                      {item.product?.stock}{" "}
                                      {t("store.available", "available")}
                                    </div>
                                  )}
                              </div>

                              <div className="flex items-center gap-2 mt-2 md:mt-0">
                                <div className="flex items-center border border-gray-800 rounded-md">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.productId,
                                        item.quantity - 1
                                      )
                                    }
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="w-10 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.productId,
                                        item.quantity + 1
                                      )
                                    }
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                    disabled={
                                      !item.product?.digital &&
                                      (item.product?.stock || 0) <=
                                        item.quantity
                                    }
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeItem(item.productId)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  aria-label={t("store.cart.remove", "Remove")}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </ScrollArea>
                    </Card>
                  </div>

                  <div>
                    <Card className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg sticky top-24">
                      <CardHeader className="border-b border-gray-800">
                        <CardTitle className="text-xl font-bold text-white">
                          {t("store.cart.order_summary", "Order Summary")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Coupon Section */}
                          <div className="space-y-2">
                            {!couponApplied ? (
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder={t(
                                    "store.cart.coupon_code",
                                    "Coupon code"
                                  )}
                                  value={couponCode}
                                  onChange={(e) =>
                                    setCouponCode(e.target.value.toUpperCase())
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      applyCoupon();
                                    }
                                  }}
                                  className="flex-1 bg-secondary/50 border-gray-800 text-white placeholder:text-gray-500"
                                />
                                <Button
                                  onClick={applyCoupon}
                                  disabled={
                                    applyingCoupon || !couponCode.trim()
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/30 hover:bg-primary/20"
                                >
                                  {applyingCoupon ? (
                                    <svg
                                      className="animate-spin h-4 w-4"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  ) : (
                                    t("store.cart.apply", "Apply")
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-400 text-sm font-medium">
                                    {appliedCouponCode}
                                  </span>
                                  <span className="text-gray-400 text-xs">
                                    {t("store.cart.applied", "Applied")}
                                  </span>
                                </div>
                                <Button
                                  onClick={removeCoupon}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                  {t("store.cart.remove", "Remove")}
                                </Button>
                              </div>
                            )}
                          </div>

                          <Separator className="bg-gray-800/50" />

                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              {t("store.cart.subtotal", "Subtotal")}
                            </span>
                            <span className="text-white font-medium">
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>

                          {couponApplied && couponDiscount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-green-400 text-sm">
                                {t("store.cart.discount", "Discount")} (
                                {appliedCouponCode})
                              </span>
                              <span className="text-green-400 font-medium">
                                -${couponDiscount.toFixed(2)}
                              </span>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                {t("store.cart.taxes", "Taxes")}
                              </span>
                              <span className="text-white font-medium">
                                $0.00
                              </span>
                            </div>
                          </div>

                          <Separator className="bg-gray-800/50 my-4" />
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-white">
                              {t("store.cart.total", "Total")}
                            </span>
                            <span className="text-lg font-bold text-primary">
                              ${getFinalTotal().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 pb-6">
                        <Button
                          onClick={proceedToCheckout}
                          disabled={loadingCheckout || cart.length === 0}
                          className="w-full py-6 h-auto bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all hover:scale-[1.02] disabled:hover:scale-100"
                        >
                          {loadingCheckout ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              {t("store.cart.processing", "Processing...")}
                            </>
                          ) : (
                            t(
                              "store.cart.proceed_to_checkout",
                              "Proceed to Checkout"
                            )
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
