import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const count = await p.bidding.count()
const samples = await p.bidding.findMany({ take:5, select:{externalId:true,title:true,status:true,modality:true,portalId:true} })
console.log('Total biddings:', count)
console.log(JSON.stringify(samples, null, 2))
await p.$disconnect()
