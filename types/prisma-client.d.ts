declare module "@prisma/client" {
  export type PrismaClient = import("../node_modules/.prisma/client").PrismaClient
  export const PrismaClient: typeof import("../node_modules/.prisma/client").PrismaClient
  export { Prisma } from "../node_modules/.prisma/client"
  export type Product = import("../node_modules/.prisma/client").Product
  export type Client = import("../node_modules/.prisma/client").Client
  export type FinancingMethod = import("../node_modules/.prisma/client").FinancingMethod
  export type Sale = import("../node_modules/.prisma/client").Sale
  export type SaleItem = import("../node_modules/.prisma/client").SaleItem
  export type Installment = import("../node_modules/.prisma/client").Installment
  export type Payment = import("../node_modules/.prisma/client").Payment
  export const SaleStatus: typeof import("../node_modules/.prisma/client").SaleStatus
  export type SaleStatus = import("../node_modules/.prisma/client").SaleStatus
  export const InstallmentStatus: typeof import("../node_modules/.prisma/client").InstallmentStatus
  export type InstallmentStatus = import("../node_modules/.prisma/client").InstallmentStatus
  export const PaymentMethod: typeof import("../node_modules/.prisma/client").PaymentMethod
  export type PaymentMethod = import("../node_modules/.prisma/client").PaymentMethod
}
