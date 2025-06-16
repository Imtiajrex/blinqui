import { type Account } from 'appwrite'
declare global {
  type Category = {
    $id: string
    $createdAt: string
    name: string
    image: string
    parentCategory: Category
  }

  type ProductCondition = 'New' | 'Used' | 'Refurbished'
  type Product = {
    $id: string
    $createdAt: string
    title: string
    description?: string
    images: string[]
    purchasePrice: number
    condition: ProductCondition
    stock: number
    color?: string
    size?: string
    brand?: string
    extraInfo?: Record<string, string>
    categories: Category[]
    acceptedTradeCategories: Category[]
    ownerId: string
  }
  type ProductReview = {
    $id: string
    $createdAt: string
    rating: number
    review: string
    reviewerId: string
    productId: string
    productOwnerId: string
  }

  type MessageTypes = 'text' | 'image' | 'video' | 'audio' | 'trade'
  type Message = {
    $id: string
    $createdAt: string
    message: string
    senderId: string
    receiverId: string
    createdAt: Date
    type: MessageTypes
    tradeId: string | null
  }
  type TradeStatus =
    | 'Pending'
    | 'Accepted'
    | 'Rejected'
    | 'Completed'
    | 'Cancelled'
  type Trade = {
    $id: string
    $createdAt: string
    id: string
    products: Product[]
    traders: string[]
    status: TradeStatus
    createdAt: Date
    updatedAt: Date
  }
}
