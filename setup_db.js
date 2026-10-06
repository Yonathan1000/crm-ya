const fs = require('fs');
const path = 'backend/prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

if(!schema.includes('model Payment')) {
  schema += `

model Payment {
  id              String   @id @default(uuid())
  binanceOrderId  String   @unique
  companyId       String
  amount          Float
  currency        String   @default("USDT")
  plan            String   // BASICO, PRO, ENTERPRISE
  status          String   @default("PENDING") // PENDING, SUCCESS, FAILED
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  company         Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("payments")
}
`;
  
  // Agregar relación en Company
  schema = schema.replace(
    /users\s+User\[\]/,
    `users       User[]\n  payments    Payment[]\n  plan        String   @default("FREE")\n  planExpires DateTime?`
  );
  
  fs.writeFileSync(path, schema);
  console.log('Schema actualizado con Payment y campos de suscripción');
} else {
  console.log('Schema ya tiene Payment');
}
