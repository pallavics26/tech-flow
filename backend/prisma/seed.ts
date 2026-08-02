import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@techflow.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@techflow.com",
      password: hashedPassword,
    },
  });

  const board = await prisma.board.create({
    data: {
      title: "My First Board",
      ownerId: user.id,
      lists: {
        create: [
          {
            title: "To Do",
            position: 0,
            cards: {
              create: [
                { title: "Setup project", position: 0 },
                { title: "Design database schema", position: 1 },
              ],
            },
          },
          {
            title: "In Progress",
            position: 1,
            cards: {
              create: [{ title: "Build auth APIs", position: 0 }],
            },
          },
          {
            title: "Done",
            position: 2,
            cards: {
              create: [{ title: "Project planning", position: 0 }],
            },
          },
        ],
      },
    },
  });

  console.log("Seed complete:");
  console.log({ user: user.email, board: board.title });
  console.log("Login with: demo@techflow.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
