"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./CartSidebar.module.css";

export default function CartSidebar() {
  const { cart, cartTotal, cartCount, removeFromCart, updateQuantity, isCartOpen, closeCart } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isCartOpen ? styles.backdropVisible : ""}`}
        onClick={closeCart}
      />

      {/* Sidebar Panel */}
      <aside className={`${styles.sidebar} ${isCartOpen ? styles.sidebarOpen : ""}`}>
        {/* Header */}
        <div className={styles.cartHeader}>
          <div className={styles.cartTitle}>
            <ShoppingBag size={20} />
            <span>Your Cart</span>
            {cartCount > 0 && <span className={styles.countBadge}>{cartCount}</span>}
          </div>
          <button onClick={closeCart} className={styles.closeButton}>
            <X size={22} />
          </button>
        </div>

        {/* Cart Items */}
        <div className={styles.cartBody}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingBag size={48} strokeWidth={1} className={styles.emptyIcon} />
              <h3>Your cart is empty</h3>
              <p>Add something raw from the streets.</p>
              <button onClick={closeCart} className={styles.continueShopping}>
                Continue Shopping <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {cart.map((item) => (
                <li key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="72px"
                        className={styles.productImg}
                      />
                    ) : (
                      <div className={styles.noImage} />
                    )}
                  </div>

                  <div className={styles.itemDetails}>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemName}>{item.name}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className={styles.removeButton}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <span className={styles.itemSize}>Size: {item.size}</span>

                    <div className={styles.itemFooter}>
                      <div className={styles.qtyControl}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className={styles.itemPrice}>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal</span>
              <span className={styles.totalAmount}>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>
            <p className={styles.taxNote}>Taxes and shipping calculated at checkout.</p>
            <Link href="/checkout" onClick={closeCart} className={styles.checkoutButton}>
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
