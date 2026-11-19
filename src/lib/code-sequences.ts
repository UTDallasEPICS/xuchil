import { Prisma } from "@prisma/client";

/**
 * Reserves a sequence value in the database. The caller must run this inside
 * a transaction so a generated code cannot be returned twice.
 */
export async function reserveNextSequence(
  tx: Prisma.TransactionClient,
  key: string,
  initialValue: number
): Promise<number> {
  const sequence = await tx.codeSequence.findUnique({ where: { key } });

  if (sequence) {
    const value = Math.max(sequence.nextValue, initialValue);
    await tx.codeSequence.update({
      where: { key },
      data: { nextValue: value + 1 },
    });
    return value;
  }

  await tx.codeSequence.create({
    data: { key, nextValue: initialValue + 1 },
  });
  return initialValue;
}
