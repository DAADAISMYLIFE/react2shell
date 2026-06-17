"use server";

import { revalidatePath } from "next/cache";
import pool from "./db";

export async function addToCart(formData: FormData): Promise<void> {
  const productId = formData.get("productId") as string;
  const quantity = formData.get("quantity") as string;
  try {
    await pool.execute(
      "INSERT INTO orders (user_id, product_id, quantity) VALUES (2, ?, ?)",
      [productId, parseInt(quantity) || 1]
    );
  } catch (e) {
    console.error("[CART ERROR]", e);
  }
  revalidatePath("/shop");
}

export async function submitReview(formData: FormData): Promise<void> {
  const productId = formData.get("productId") as string;
  const rating = formData.get("rating") as string;
  const content = formData.get("content") as string;
  try {
    await pool.execute(
      "INSERT INTO reviews (product_id, user_id, rating, content) VALUES (?, 2, ?, ?)",
      [productId, parseInt(rating), content]
    );
  } catch (e) {
    console.error("[REVIEW ERROR]", e);
  }
  revalidatePath("/shop");
}

export async function subscribeNewsletter(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  try {
    await pool.execute(
      "INSERT INTO newsletter (email) VALUES (?)",
      [email]
    );
  } catch (e) {
    console.error("[SUBSCRIBE ERROR]", e);
  }
}
