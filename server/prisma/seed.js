import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

const demoUsers = [
  { name: "Tharun", email: "tharun.demo@hive.local" },
  { name: "Aisha", email: "aisha.demo@hive.local" },
  { name: "Maya", email: "maya.demo@hive.local" },
  { name: "Dev", email: "dev.demo@hive.local" },
];

const projects = [
  {
    name: "API Redesign",
    description: "Hardening the realtime API and authorization model.",
    cards: {
      Backlog: [
        ["Define socket authorization checklist", "Audit every socket event against workspace and project boundaries.", 5],
        ["Document Redis scaling notes", "Capture adapter behavior and local Docker expectations.", 8],
      ],
      "In Progress": [
        ["Normalize activity event payloads", "Make activity metadata consistent enough for rich feed rendering.", 2],
      ],
      Review: [["Harden refresh token rotation", "Verify token invalidation and expiry behavior.", -1]],
      Done: [["Add workspace membership guard", "Block non-members from workspace resources.", -4]],
    },
  },
  {
    name: "Mobile Launch",
    description: "Preparing the product experience for a focused beta launch.",
    cards: {
      Backlog: [["Draft onboarding checklist", "Guide new users from workspace to first task.", 7]],
      "In Progress": [["Design empty states", "Replace blank panels with guided, actionable states.", 3]],
      Review: [["QA responsive board layout", "Check sidebar, board overflow, chat, and activity on mobile.", 4]],
      Done: [["Finalize launch copy", "Make the homepage explain Hive in five seconds.", -2]],
    },
  },
  {
    name: "Sprint Planning",
    description: "Weekly execution board for product and engineering.",
    cards: {
      Backlog: [["Prioritize polish pass", "Choose the smallest set of changes with the largest product feel impact.", 6]],
      "In Progress": [["Refine card metadata", "Improve due dates, assignees, and preview text.", 1]],
      Review: [["Check notification empty state", "Make the notification dropdown feel intentional when empty.", 2]],
      Done: [["Ship activity feed baseline", "Show realtime changes as a workspace heartbeat.", -5]],
    },
  },
];

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  const password = await bcrypt.hash("DemoPass123!", 10);

  const users = [];
  for (const user of demoUsers) {
    users.push(
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: { ...user, password },
      }),
    );
  }

  const workspace = await prisma.workspace.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Hive Demo Workspace",
      description: "A realistic workspace with projects, tasks, chat, and activity.",
    },
  });

  for (const [index, user] of users.entries()) {
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
      update: {},
      create: {
        workspaceId: workspace.id,
        userId: user.id,
        role: index === 0 ? "ADMIN" : "MEMBER",
      },
    });
  }

  for (const projectSpec of projects) {
    const project = await prisma.project.upsert({
      where: {
        id:
          projectSpec.name === "API Redesign"
            ? "00000000-0000-4000-8000-000000000101"
            : projectSpec.name === "Mobile Launch"
              ? "00000000-0000-4000-8000-000000000102"
              : "00000000-0000-4000-8000-000000000103",
      },
      update: {},
      create: {
        id:
          projectSpec.name === "API Redesign"
            ? "00000000-0000-4000-8000-000000000101"
            : projectSpec.name === "Mobile Launch"
              ? "00000000-0000-4000-8000-000000000102"
              : "00000000-0000-4000-8000-000000000103",
        name: projectSpec.name,
        description: projectSpec.description,
        workspaceId: workspace.id,
      },
    });

    for (const [index, user] of users.entries()) {
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: project.id, userId: user.id } },
        update: {},
        create: {
          projectId: project.id,
          userId: user.id,
          role: index === 0 ? "ADMIN" : "MEMBER",
        },
      });
    }

    const columnNames = ["Backlog", "In Progress", "Review", "Done"];
    for (const [columnIndex, columnName] of columnNames.entries()) {
      const column = await prisma.column.upsert({
        where: { projectId_order: { projectId: project.id, order: columnIndex } },
        update: { name: columnName },
        create: { name: columnName, order: columnIndex, projectId: project.id },
      });

      const cardSpecs = projectSpec.cards[columnName] ?? [];
      for (const [cardIndex, [title, description, dueInDays]] of cardSpecs.entries()) {
        const card = await prisma.card.upsert({
          where: { columnId_order: { columnId: column.id, order: cardIndex } },
          update: { title, description, dueDate: daysFromNow(dueInDays) },
          create: {
            title,
            description,
            dueDate: daysFromNow(dueInDays),
            order: cardIndex,
            columnId: column.id,
          },
        });

        await prisma.cardAssignee.upsert({
          where: { cardId_userId: { cardId: card.id, userId: users[cardIndex % users.length].id } },
          update: {},
          create: { cardId: card.id, userId: users[cardIndex % users.length].id },
        });
      }
    }

    await prisma.message.deleteMany({
      where: {
        projectId: project.id,
        userId: { in: users.map((user) => user.id) },
      },
    });
    await prisma.activity.deleteMany({
      where: {
        workspaceId: workspace.id,
        projectId: project.id,
        userId: { in: users.map((user) => user.id) },
      },
    });

    await prisma.message.createMany({
      data: [
        {
          projectId: project.id,
          userId: users[1].id,
          content: `I added the current priorities for ${project.name}.`,
        },
        {
          projectId: project.id,
          userId: users[0].id,
          content: "Looks good. Let us keep the board focused and move finished work today.",
        },
      ],
    });

    await prisma.activity.createMany({
      data: [
        {
          workspaceId: workspace.id,
          projectId: project.id,
          userId: users[0].id,
          type: "CARD_CREATED",
          entity: "CARD",
          entityId: project.id,
          meta: { title: `Kick off ${project.name}` },
        },
        {
          workspaceId: workspace.id,
          projectId: project.id,
          userId: users[1].id,
          type: "CARD_MOVED",
          entity: "CARD",
          entityId: project.id,
          meta: { title: "Design empty states", from: "Backlog", to: "In Progress" },
        },
      ],
    });
  }

  await prisma.notification.deleteMany({
    where: {
      userId: { in: users.map((user) => user.id) },
      type: "DEMO",
    },
  });

  await prisma.notification.createMany({
    data: users.slice(0, 2).map((user) => ({
      userId: user.id,
      type: "DEMO",
      message: "Demo workspace is ready with projects, cards, chat, and activity.",
    })),
  });

  console.log("Demo data seeded.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
